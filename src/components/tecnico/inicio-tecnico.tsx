"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTecnico } from "./tecnico-provider";
import { TarjetaBorrador } from "./tarjeta-borrador";
import { eliminarBorrador } from "@/lib/tecnico/eliminar";
import { useLive } from "@/lib/tecnico/hooks";
import type { DraftRecord } from "@/lib/offline/db";
import { formatFechaHora } from "@/lib/fecha";
import {
  ESTADO_ENVIADA,
  borradorDeCorreccion,
  cargarEnviadas,
  cargarRespuestas,
  type Enviada,
} from "@/lib/tecnico/enviadas";

const ESTADO: Record<DraftRecord["state"], { texto: string; clase: string }> = {
  draft: { texto: "En curso", clase: "bg-cu-soft text-[#7a3d12]" },
  queued: { texto: "En cola de envío", clase: "bg-[#f1f0ec] text-graf" },
  sent: { texto: "Enviada", clase: "bg-[#e1f2e8] text-[#0b4a28]" },
};

export function InicioTecnico() {
  const router = useRouter();
  const { db, userId, supabase, catalog } = useTecnico();
  const borradores = useLive(
    () => db.drafts.where("technicianId").equals(userId).reverse().sortBy("updatedAt"),
    userId,
    [] as DraftRecord[],
  );
  const [enviadas, setEnviadas] = useState<Enviada[]>([]);
  const [corrigiendo, setCorrigiendo] = useState<string | null>(null);
  const [errorCorreccion, setErrorCorreccion] = useState<{ id: string; mensaje: string } | null>(null);

  // La lista se vuelve a pedir cuando cambia lo que está en cola o enviado, y al volver la red.
  const huella = borradores.map((d) => `${d.id}:${d.state}`).join(",");
  useEffect(() => {
    let vivo = true;
    const refrescar = async () => {
      const r = await cargarEnviadas(db, supabase, userId, navigator.onLine);
      if (vivo) setEnviadas(r.lista);
    };
    void refrescar();
    const onOnline = () => void refrescar();
    window.addEventListener("online", onOnline);
    return () => {
      vivo = false;
      window.removeEventListener("online", onOnline);
    };
  }, [db, supabase, userId, huella]);

  const nombre = (lista: { id: string; name: string }[] | undefined, id: string) =>
    lista?.find((x) => x.id === id)?.name ?? "";

  const idsEnviadas = new Set(enviadas.map((e) => e.id));
  // Una enviada ya confirmada por el servidor se muestra en «Enviadas», no en la lista local.
  const locales = borradores.filter((d) => !idsEnviadas.has(d.id));

  const corregir = async (e: Enviada) => {
    setErrorCorreccion(null);
    const existente = borradores.find((d) => d.correccion?.de === e.id && d.state === "draft");
    if (existente) {
      router.push(`/tecnico/inspeccion/${existente.id}`);
      return;
    }
    const falla = (mensaje: string) => setErrorCorreccion({ id: e.id, mensaje });
    if (!navigator.onLine) return falla("Para corregir necesita conexión a internet.");
    const template = catalog.catalog?.templates.find((t) => t.id === e.template_id)?.schema;
    if (!template) return falla("El formulario de esta inspección ya no está disponible.");
    setCorrigiendo(e.id);
    try {
      const respuestas = await cargarRespuestas(supabase, e.id);
      const draft = borradorDeCorreccion({ userId, rechazada: e, respuestas, template });
      await db.drafts.add(draft);
      router.push(`/tecnico/inspeccion/${draft.id}`);
    } catch {
      falla("No se pudo cargar la inspección. Intente de nuevo.");
      setCorrigiendo(null);
    }
  };

  const clase = "block rounded-2xl border border-hair bg-white p-4";

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/tecnico/nueva"
        className="flex min-h-16 items-center justify-center rounded-2xl bg-graf px-6 text-xl font-semibold text-white transition-transform hover:bg-graf-2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cu active:scale-[0.98]"
      >
        Nueva inspección
      </Link>

      <section aria-labelledby="titulo-lista">
        <h1 id="titulo-lista" className="mb-3 text-2xl font-bold tracking-tight">
          Mis inspecciones
        </h1>
        {locales.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#9a9488] bg-white p-6 text-lg text-sub">
            {enviadas.length === 0
              ? "Aún no tiene inspecciones en este equipo. Toque \"Nueva inspección\" para empezar."
              : "No tiene inspecciones en curso."}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {locales.map((d) => {
              const e = ESTADO[d.state];
              const equipo = nombre(catalog.catalog?.equipmentTypes, d.equipmentTypeId);
              const area = nombre(catalog.catalog?.areas, d.areaId);
              const contenido = (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-lg font-semibold">{d.header.tag || equipo || "Inspección"}</p>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${e.clase}`}>{e.texto}</span>
                  </div>
                  <p className="mt-1 text-base text-sub">{[area, equipo].filter(Boolean).join(" · ")}</p>
                  {d.correccion ? (
                    <p className="mt-1 text-sm font-medium text-[#7a3d12]">Corrige {d.correccion.folio}</p>
                  ) : null}
                  <p className="mt-1 font-mono text-sm text-sub">
                    {d.folio ? `${d.folio} · ` : ""}
                    {formatFechaHora(d.updatedAt)}
                  </p>
                </>
              );
              return (
                <li key={d.id}>
                  {d.state === "draft" ? (
                    <TarjetaBorrador
                      href={`/tecnico/inspeccion/${d.id}`}
                      onEliminar={async () => {
                        await eliminarBorrador(db, d.id);
                      }}
                    >
                      {contenido}
                    </TarjetaBorrador>
                  ) : (
                    <div className={clase}>{contenido}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {enviadas.length > 0 ? (
        <section aria-labelledby="titulo-enviadas">
          <h2 id="titulo-enviadas" className="mb-3 text-2xl font-bold tracking-tight">
            Enviadas
          </h2>
          <ul className="flex flex-col gap-3">
            {enviadas.map((e) => {
              const estado = ESTADO_ENVIADA[e.status];
              const equipo = nombre(catalog.catalog?.equipmentTypes, e.equipment_type_id);
              const area = nombre(catalog.catalog?.areas, e.area_id);
              const correccion = borradores.find((d) => d.correccion?.de === e.id);
              const enCurso = correccion?.state === "draft";
              const yaEnviada = correccion !== undefined && !enCurso;
              return (
                <li key={e.id} className={clase}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-lg font-semibold">{e.equipment_tag || equipo || "Inspección"}</p>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${estado.clase}`}>
                      {estado.texto}
                    </span>
                  </div>
                  <p className="mt-1 text-base text-sub">{[area, equipo].filter(Boolean).join(" · ")}</p>
                  <p className="mt-1 font-mono text-sm text-sub">
                    {e.folio ? `${e.folio} · ` : ""}
                    {e.submitted_at ? formatFechaHora(e.submitted_at) : ""}
                  </p>
                  {e.status === "rejected" ? (
                    <div className="mt-3 rounded-xl bg-[#fbe4e4] p-3">
                      <p className="text-sm font-semibold text-[#8a0000]">Motivo del rechazo</p>
                      <p className="mt-1 text-base">{e.review_comment || "Sin comentario."}</p>
                      {yaEnviada ? (
                        <p className="mt-3 text-sm font-semibold text-[#0b4a28]">
                          Ya envió su corrección{correccion.folio ? ` (${correccion.folio})` : ""}.
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void corregir(e)}
                          disabled={corrigiendo === e.id}
                          className="mt-3 min-h-12 rounded-xl bg-graf px-4 text-base font-semibold text-white transition-transform hover:bg-graf-2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cu active:scale-[0.98] disabled:opacity-60"
                        >
                          {corrigiendo === e.id ? "Cargando…" : enCurso ? "Seguir corrigiendo" : "Corregir y reenviar"}
                        </button>
                      )}
                      {errorCorreccion?.id === e.id ? (
                        <p role="alert" className="mt-2 text-sm font-medium text-bad">
                          {errorCorreccion.mensaje}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
