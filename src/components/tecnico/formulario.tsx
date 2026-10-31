"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useTecnico } from "./tecnico-provider";
import { ItemField } from "./item-field";
import { SelectorTag } from "./selector-tag";
import { formatoPorId, type CodigoArea } from "@/lib/formatos/catalogo";
import { DESIGNADORES_POR_TIPO_EQUIPO } from "@/lib/formatos/tags";
import { SignatureField } from "@/components/shared/signature-field";
import { enqueueSubmission } from "@/lib/offline/outbox";
import type { DraftRecord } from "@/lib/offline/db";
import type { FormTemplateSchema } from "@/lib/templates/schema";
import {
  META,
  allItems,
  buildSubmission,
  getEjecutor,
  validateDraft,
  type Diagnostico,
  type FirmaEncargado,
  rolEncargado,
  type Severity,
} from "@/lib/tecnico/draft";
import { deletePhoto, saveSignature } from "@/lib/tecnico/photos";

const campo =
  "min-h-14 w-full rounded-xl border-[1.5px] border-[#8f897e] bg-white px-4 text-lg text-graf focus:border-cu focus:outline-3 focus:outline-offset-1 focus:outline-cu/40";

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}

const sinSuscripcion = () => () => {};

/**
 * El id real sale de la URL: sin red, el service worker entrega una copia de esta página guardada con
 * otro id (todas las inspecciones comparten la misma), y el contenido sale de Dexie, no del servidor.
 */
function useIdDeUrl(idInicial: string): string {
  return useSyncExternalStore(
    sinSuscripcion,
    () => window.location.pathname.split("/").filter(Boolean).pop() ?? idInicial,
    () => idInicial,
  );
}

/** Formulario de inspección: una sección por pantalla, guardado automático en el equipo. */
export function Formulario({ id: idInicial }: { id: string }) {
  const id = useIdDeUrl(idInicial);
  const router = useRouter();
  const { db, userId, catalog, sync } = useTecnico();
  const [draft, setDraft] = useState<DraftRecord | null | undefined>(undefined);
  const [paso, setPaso] = useState(0);
  const [guardado, setGuardado] = useState<"ok" | "guardando">("ok");
  const [enviando, setEnviando] = useState(false);
  const draftRef = useRef<DraftRecord | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    let vivo = true;
    void db.drafts.get(id).then((d) => {
      if (!vivo) return;
      draftRef.current = d ?? null;
      setDraft(d ?? null);
    });
    return () => {
      vivo = false;
      clearTimeout(timer.current);
    };
  }, [db, id]);

  const template: FormTemplateSchema | null = useMemo(() => {
    if (!draft) return null;
    return catalog.catalog?.templates.find((t) => t.id === draft.templateId)?.schema ?? null;
  }, [draft, catalog.catalog]);

  const actualizar = useCallback(
    (cambio: (d: DraftRecord) => DraftRecord) => {
      const actual = draftRef.current;
      if (!actual || actual.state !== "draft") return;
      const next = { ...cambio(actual), updatedAt: Date.now() };
      draftRef.current = next;
      setDraft(next);
      setGuardado("guardando");
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        void db.drafts.put(draftRef.current!).then(() => setGuardado("ok"));
      }, 350);
    },
    [db],
  );

  if (draft === undefined) return <p className="text-lg text-sub">Abriendo inspección</p>;
  if (draft === null) {
    return (
      <div className="flex flex-col gap-4">
        <p role="alert" className="rounded-2xl border border-[#bb0000] bg-[#fdecec] p-5 text-lg text-[#7a0000]">
          No se encontró esta inspección en el equipo.
        </p>
        <Link href="/tecnico" className="inline-flex min-h-14 items-center justify-center rounded-xl bg-graf px-6 text-lg font-semibold text-white">
          Volver al inicio
        </Link>
      </div>
    );
  }
  if (!template) {
    return (
      <p role="alert" className="rounded-2xl border border-[#bb0000] bg-[#fdecec] p-5 text-lg text-[#7a0000]">
        {catalog.status === "loading"
          ? "Cargando el formulario"
          : "No se encontró el formulario de esta inspección. Conéctese a internet para descargarlo."}
      </p>
    );
  }

  const secciones = template.sections;
  const total = secciones.length + 3; // datos + secciones + cierre + revisar
  const iCierre = secciones.length + 1;
  const iRevisar = secciones.length + 2;
  const titulo = paso === 0 ? "Datos del equipo" : paso <= secciones.length ? secciones[paso - 1].title : paso === iCierre ? "Cierre y firma" : "Revisar y enviar";
  const bloqueado = draft.state !== "draft";

  // Filtro del selector de TAG: el formato elegido en el flujo; los borradores anteriores usan el tipo de equipo.
  const formato = formatoPorId(draft.header.formato ?? "");
  const codigoArea = (catalog.catalog?.areas.find((a) => a.id === draft.areaId)?.code ?? "chacay") as CodigoArea;
  const tipoEquipo = catalog.catalog?.equipmentTypes.find((e) => e.id === draft.equipmentTypeId)?.code ?? "";
  const designadores = formato?.designadores ?? DESIGNADORES_POR_TIPO_EQUIPO[tipoEquipo] ?? [];

  const firmaEncargado = (draft.answers[META.firmaEncargado] as FirmaEncargado | undefined) ?? {};
  const diag = (draft.answers[META.diagnostico] as Diagnostico | undefined) ?? { observaciones: "", consideraciones: "" };
  const roles = (draft.answers[META.roles] as Record<string, string> | undefined) ?? {};
  const issues = validateDraft(draft, template);

  const setAnswer = (key: string, value: unknown) =>
    actualizar((d) => ({ ...d, answers: { ...d.answers, [key]: value } }));

  const setSeverity = (itemId: string, severity: Severity) =>
    actualizar((d) => {
      const rest = d.findings.filter((f) => f.item_key !== itemId);
      const prev = d.findings.find((f) => f.item_key === itemId);
      return {
        ...d,
        findings: [
          ...rest,
          { id: prev?.id ?? crypto.randomUUID(), item_key: itemId, severity, description: "", photo_attachment_id: null },
        ],
      };
    });

  const firmar = async (png: Blob | null, dataUrl: string | null) => {
    const anterior = (draftRef.current?.answers[META.firmaEncargado] as FirmaEncargado | undefined)?.firmaId;
    if (anterior) await deletePhoto(db, anterior);
    if (!png) {
      setAnswer(META.firmaEncargado, { firmaId: undefined, firmaDataUrl: undefined });
      return;
    }
    const firmaId = await saveSignature(db, userId, id, png);
    setAnswer(META.firmaEncargado, { firmaId, firmaDataUrl: dataUrl ?? undefined });
  };

  const enviar = async () => {
    if (enviando || issues.length) return;
    setEnviando(true);
    clearTimeout(timer.current);
    await db.drafts.put(draftRef.current!);
    const fotos = await db.photos.where("inspectionId").equals(id).toArray();
    const { payload, photoIds } = buildSubmission(draftRef.current!, template, fotos);
    await enqueueSubmission(db, { payload, photoIds });
    void sync.notifyQueued();
    router.replace("/tecnico");
  };

  const irA = (n: number, itemId?: string) => {
    setPaso(n);
    if (itemId) setTimeout(() => document.getElementById(`item-${itemId}`)?.scrollIntoView({ block: "center" }), 60);
    else window.scrollTo({ top: 0 });
  };

  const respondidos = allItems(template).filter((i) => {
    const v = draft.answers[i.id];
    return v !== undefined && (i.type !== "verificacion" || (v as { estado?: string }).estado);
  }).length;

  return (
    <div className="flex flex-col gap-5 pb-28">
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-sm text-sub">
            Paso {paso + 1} de {total}
          </p>
          <p className="text-sm font-medium text-sub" aria-live="polite">
            {guardado === "ok" ? "Guardado en el equipo" : "Guardando"}
          </p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e4e0d7]" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={paso + 1}>
          <div className="h-full rounded-full bg-cu" style={{ width: `${((paso + 1) / total) * 100}%` }} />
        </div>
        <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight">{titulo}</h1>
        {template.note ? <p className="mt-1 text-sm text-sub">{template.note}</p> : null}
        {draft.correccion ? (
          <div className="mt-3 rounded-xl border border-[#e8b4b4] bg-[#fbe4e4] p-3" role="note">
            <p className="text-sm font-semibold text-[#8a0000]">Corrección de {draft.correccion.folio}</p>
            <p className="mt-1 text-base">Motivo del rechazo: {draft.correccion.motivo || "sin comentario"}</p>
            <p className="mt-1 text-sm text-sub">
              Se copiaron los datos y respuestas. Las fotos y la firma del encargado de la actividad hay que tomarlas de nuevo.
            </p>
          </div>
        ) : null}
      </div>

      <fieldset disabled={bloqueado} className="contents">
        {paso === 0 && (
          <div className="grid gap-4">
            <Campo label="Nombre de quien realiza la inspección">
              <input
                value={getEjecutor(draft.answers)}
                onChange={(e) => setAnswer(META.ejecutor, e.target.value)}
                className={campo}
                autoComplete="name"
              />
            </Campo>
            {template.header.map((h) =>
              h.key === "tag" ? (
                <SelectorTag
                  key={h.key}
                  etiqueta={`${formato?.campo === "tramo" ? "Tramo o ubicación" : "TAG del equipo"}${h.required ? "" : " (opcional)"}`}
                  area={codigoArea}
                  designadores={designadores}
                  tramo={formato?.campo === "tramo"}
                  variosEquipos={formato?.variosEquipos ?? false}
                  header={draft.header}
                  onHeader={(cambio) => actualizar((d) => ({ ...d, header: cambio(d.header) }))}
                  deshabilitado={bloqueado}
                />
              ) : (
              <Campo key={h.key} label={`${h.label}${h.required ? "" : " (opcional)"}`}>
                <input
                  type={h.input === "number" ? "text" : h.input}
                  inputMode={h.input === "number" ? "decimal" : undefined}
                  list={h.options ? `opt_${h.key}` : undefined}
                  value={draft.header[h.key] ?? ""}
                  onChange={(e) => actualizar((d) => ({ ...d, header: { ...d.header, [h.key]: e.target.value } }))}
                  className={campo}
                  autoComplete="off"
                />
                {h.options ? (
                  <datalist id={`opt_${h.key}`}>
                    {h.options.map((o) => (
                      <option key={o} value={o} />
                    ))}
                  </datalist>
                ) : null}
              </Campo>
              ),
            )}
          </div>
        )}

        {paso >= 1 && paso <= secciones.length && (
          <div className="flex flex-col gap-4">
            {secciones[paso - 1].items.map((item) => {
              const n = allItems(template).findIndex((i) => i.id === item.id) + 1;
              return (
                <ItemField
                  key={item.id}
                  item={item}
                  index={n}
                  inspectionId={id}
                  value={draft.answers[item.id]}
                  severity={draft.findings.find((f) => f.item_key === item.id)?.severity}
                  onChange={(v) => setAnswer(item.id, v)}
                  onSeverity={(s) => setSeverity(item.id, s)}
                />
              );
            })}
            {secciones[paso - 1].items.some((i) => i.type === "verificacion") ? (
              <button
                type="button"
                onClick={() =>
                  actualizar((d) => {
                    const answers = { ...d.answers };
                    for (const i of secciones[paso - 1].items) {
                      if (i.type === "verificacion" && !(answers[i.id] as { estado?: string } | undefined)?.estado) {
                        answers[i.id] = { ...(answers[i.id] as object), estado: "BN" };
                      }
                    }
                    return { ...d, answers };
                  })
                }
                className="min-h-14 rounded-xl border-[1.5px] border-cu bg-white px-5 text-base font-semibold text-[#9a4519] hover:bg-cu-soft"
              >
                Marcar pendientes de esta sección como BN
              </button>
            ) : null}
          </div>
        )}

        {paso === iCierre && (
          <div className="flex flex-col gap-5">
            <Campo label="Observaciones generales">
              <textarea
                rows={3}
                value={diag.observaciones}
                onChange={(e) => setAnswer(META.diagnostico, { ...diag, observaciones: e.target.value })}
                className={`${campo} py-3`}
              />
            </Campo>
            <Campo label="Consideraciones">
              <textarea
                rows={3}
                value={diag.consideraciones}
                onChange={(e) => setAnswer(META.diagnostico, { ...diag, consideraciones: e.target.value })}
                className={`${campo} py-3`}
              />
            </Campo>
            {template.roles.length ? (
              <div className="grid gap-4">
                {template.roles.map((r) => (
                  <Campo key={r} label={r}>
                    <input
                      value={roles[r] ?? ""}
                      onChange={(e) => setAnswer(META.roles, { ...roles, [r]: e.target.value })}
                      className={campo}
                      autoComplete="off"
                    />
                  </Campo>
                ))}
              </div>
            ) : null}
            <div>
              <p className="mb-2 text-sm font-semibold">Firma de {rolEncargado(template) ?? "encargado de la actividad"}</p>
              <p className="mb-2 text-sm text-sub">El supervisor y el planificador firman después, al revisar la inspección.</p>
              <SignatureField initialDataUrl={firmaEncargado.firmaDataUrl} onChange={(png, url) => void firmar(png, url)} />
            </div>
          </div>
        )}
      </fieldset>

      {paso === iRevisar && (
        <div className="flex flex-col gap-4">
          <p className="rounded-2xl border border-hair bg-white p-4 text-lg">
            {respondidos} de {allItems(template).length} ítems respondidos.
          </p>
          {issues.length ? (
            <div role="alert" className="rounded-2xl border border-[#bb0000] bg-[#fdecec] p-4">
              <p className="mb-2 text-lg font-semibold text-[#7a0000]">Falta completar ({issues.length})</p>
              <ul className="flex flex-col gap-2">
                {issues.slice(0, 15).map((i, k) => (
                  <li key={k}>
                    <button
                      type="button"
                      onClick={() => irA(i.area === "item" ? i.section! + 1 : i.area === "header" ? 0 : iCierre, i.itemId)}
                      className="min-h-12 w-full rounded-xl bg-white px-4 text-left text-base font-medium text-[#7a0000] underline"
                    >
                      {i.message}
                    </button>
                  </li>
                ))}
                {issues.length > 15 ? <li className="text-sm text-[#7a0000]">y {issues.length - 15} más</li> : null}
              </ul>
            </div>
          ) : (
            <p className="rounded-2xl border border-ok bg-[#e1f2e8] p-4 text-lg font-medium text-[#0b4a28]">
              Todo listo. Si no hay red, se enviará apenas vuelva la conexión.
            </p>
          )}
          <button
            type="button"
            disabled={issues.length > 0 || enviando || bloqueado}
            onClick={() => void enviar()}
            className="min-h-16 rounded-2xl bg-graf px-6 text-xl font-semibold text-white transition-transform hover:bg-graf-2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cu active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {enviando ? "Enviando" : "Enviar inspección"}
          </button>
        </div>
      )}

      <nav
        aria-label="Navegación del formulario"
        className="fixed inset-x-0 bottom-0 z-10 border-t border-hair bg-white/95 px-5 py-3 backdrop-blur"
      >
        <div className="mx-auto flex w-full max-w-xl gap-3">
          {paso === 0 ? (
            <Link href="/tecnico" className="inline-flex min-h-14 flex-1 items-center justify-center rounded-xl border-[1.5px] border-graf text-lg font-semibold">
              Salir
            </Link>
          ) : (
            <button type="button" onClick={() => irA(paso - 1)} className="min-h-14 flex-1 rounded-xl border-[1.5px] border-graf text-lg font-semibold">
              Anterior
            </button>
          )}
          {paso < iRevisar ? (
            <button type="button" onClick={() => irA(paso + 1)} className="min-h-14 flex-[1.4] rounded-xl bg-graf text-lg font-semibold text-white hover:bg-graf-2">
              Siguiente
            </button>
          ) : null}
        </div>
      </nav>
    </div>
  );
}
