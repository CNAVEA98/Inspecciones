"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import {
  TIPO_CAMPO_LABEL,
  TIPO_ITEM_LABEL,
  agregarCampoCabecera,
  agregarItem,
  editarCampoCabecera,
  esCampoEstandar,
  quitarCampoCabecera,
  type TipoCampoCabecera,
  agregarSeccion,
  editarItem,
  itemsEnLecturas,
  moverItem,
  moverSeccion,
  notaSugerida,
  prepararParaPublicar,
  quitarItem,
  quitarSeccion,
  renombrarSeccion,
  resumenCambios,
  totalItems,
  type TipoItemNuevo,
} from "@/lib/formatos/editor";
import { publicarVersion } from "@/lib/formatos/publicar-actions";
import type { FormTemplateSchema, TemplateItem } from "@/lib/templates/schema";

const campo =
  "w-full rounded-lg border border-hair bg-white px-2.5 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-cu disabled:bg-paper disabled:text-sub";
const botonIcono =
  "grid size-8 place-items-center rounded-lg border border-hair bg-white text-graf hover:bg-paper focus-visible:outline-2 focus-visible:outline-cu disabled:cursor-not-allowed disabled:opacity-40";
const botonPrimario =
  "rounded-lg bg-graf px-4 py-2 text-sm font-semibold text-white hover:bg-graf-2 focus-visible:outline-2 focus-visible:outline-cu disabled:opacity-50";
const botonSecundario =
  "rounded-lg border border-graf px-3 py-1.5 text-sm font-semibold hover:bg-paper focus-visible:outline-2 focus-visible:outline-cu disabled:opacity-50";

const TIPOS_NUEVOS: TipoItemNuevo[] = ["verificacion", "number", "text", "photo"];

const aNumero = (v: string): number | undefined => {
  const n = Number(v.replace(",", "."));
  return v.trim() === "" || !Number.isFinite(n) ? undefined : n;
};

interface Props {
  formatoId: string;
  titulo: string;
  versionBase: number;
  inicial: FormTemplateSchema;
  /** Planificador: ve el contenido pero no lo modifica. */
  soloLectura: boolean;
}

export function EditorFormato({ formatoId, titulo, versionBase, inicial, soloLectura }: Props) {
  const router = useRouter();
  const [t, setT] = useState<FormTemplateSchema>(inicial);
  const [nota, setNota] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [publicada, setPublicada] = useState<number | null>(null);
  const [enDialogo, setEnDialogo] = useState(false);
  const [reinicio, setReinicio] = useState(0);
  const [pendiente, iniciar] = useTransition();
  const dialogo = useRef<HTMLDialogElement>(null);

  const cambios = useMemo(() => resumenCambios(inicial, t), [inicial, t]);
  const bloqueados = useMemo(() => itemsEnLecturas(t), [t]);
  const sucio = cambios.length > 0 && publicada === null;

  // Avisa antes de cerrar la pestaña con cambios sin publicar.
  useEffect(() => {
    if (!sucio) return;
    const aviso = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [sucio]);

  const abrirPublicar = () => {
    setError(null);
    const r = prepararParaPublicar(t);
    if (!r.ok) {
      setError(r.errors[0]);
      return;
    }
    setNota(notaSugerida(cambios));
    setEnDialogo(true);
    dialogo.current?.showModal();
  };

  const publicar = () => {
    setError(null);
    iniciar(async () => {
      const r = await publicarVersion({ formatoId, versionBase, nota, schema: t });
      if (r.ok) {
        dialogo.current?.close();
        setEnDialogo(false);
        setPublicada(r.version);
        router.refresh();
      } else {
        setError(r.error);
      }
    });
  };

  const confirmar = (mensaje: string) => window.confirm(mensaje);

  return (
    <div className="space-y-5">
      {publicada !== null && (
        <p role="status" className="rounded-xl border border-ok bg-white px-4 py-3 text-sm font-semibold text-ok">
          Versión {publicada} publicada. Los técnicos la verán al abrir el formato con conexión; las inspecciones ya enviadas
          conservan la versión con la que se hicieron.
        </p>
      )}
      {error && !enDialogo && (
        <p role="alert" className="rounded-xl border border-bad bg-white px-4 py-3 text-sm font-semibold text-bad">
          {error}
        </p>
      )}

      <Cabecera
        header={t.header}
        soloLectura={soloLectura}
        onAgregar={(label, input) => setT(agregarCampoCabecera(t, label, input))}
        onEditar={(key, c) => setT(editarCampoCabecera(t, key, c))}
        onQuitar={(key, label) => confirmar(`¿Quitar el campo «${label}» de la cabecera?`) && setT(quitarCampoCabecera(t, key))}
      />

      {t.sections.map((s, si) => (
        <section key={s.id} className="rounded-2xl border border-hair bg-white" aria-label={`Sección ${s.title}`}>
          <div className="flex flex-wrap items-center gap-2 border-b border-hair px-4 py-3">
            <span className="font-mono text-xs text-sub">{String(si + 1).padStart(2, "0")}</span>
            <input
              value={s.title}
              onChange={(e) => setT(renombrarSeccion(t, s.id, e.target.value))}
              disabled={soloLectura}
              aria-label={`Título de la sección ${si + 1}`}
              className={`${campo} min-w-60 flex-1 font-semibold`}
            />
            <span className="font-mono text-xs text-sub">
              {s.items.length} ítem{s.items.length === 1 ? "" : "s"}
              {s.repetible ? " · repetible" : ""}
            </span>
            {!soloLectura && (
              <div className="flex gap-1">
                <button type="button" className={botonIcono} aria-label="Subir sección" disabled={si === 0} onClick={() => setT(moverSeccion(t, s.id, -1))}>
                  <ChevronUp size={16} />
                </button>
                <button type="button" className={botonIcono} aria-label="Bajar sección" disabled={si === t.sections.length - 1} onClick={() => setT(moverSeccion(t, s.id, 1))}>
                  <ChevronDown size={16} />
                </button>
                <button
                  type="button"
                  className={botonIcono}
                  aria-label="Quitar sección"
                  disabled={t.sections.length <= 1 || s.items.some((it) => bloqueados.has(it.id))}
                  title={s.items.some((it) => bloqueados.has(it.id)) ? "Tiene ítems que alimentan lecturas del informe" : undefined}
                  onClick={() => confirmar(`¿Quitar la sección «${s.title}» y sus ${s.items.length} ítems?`) && setT(quitarSeccion(t, s.id))}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          <ol className="divide-y divide-hair">
            {s.items.map((it, ii) => (
              <FilaItem
                key={`${it.id}-${reinicio}`}
                item={it}
                n={ii + 1}
                soloLectura={soloLectura}
                primero={ii === 0}
                ultimo={ii === s.items.length - 1}
                unico={s.items.length <= 1}
                enLectura={bloqueados.has(it.id)}
                onCambio={(c) => setT(editarItem(t, it.id, c))}
                onMover={(d) => setT(moverItem(t, s.id, it.id, d))}
                onQuitar={() => confirmar(`¿Quitar el ítem «${it.label}»?`) && setT(quitarItem(t, s.id, it.id))}
              />
            ))}
          </ol>

          {!soloLectura && <NuevoItem onAgregar={(tipo, label) => setT(agregarItem(t, s.id, tipo, label))} />}
        </section>
      ))}

      {!soloLectura && <NuevaSeccion onAgregar={(titulo, primero) => setT(agregarSeccion(t, titulo, primero))} />}

      {!soloLectura && (
        <div className="sticky bottom-0 -mx-2 flex flex-wrap items-center gap-3 rounded-2xl border border-hair bg-white/95 px-4 py-3 shadow-none backdrop-blur">
          <p className="text-sm text-sub">
            {cambios.length === 0 ? "Sin cambios respecto de la versión " : `${cambios.length} cambio${cambios.length === 1 ? "" : "s"} sobre la versión `}
            <strong className="text-graf">{versionBase}</strong> · {totalItems(t)} ítems en {t.sections.length} secciones
          </p>
          <div className="ml-auto flex gap-2">
            <button type="button" className={botonSecundario} disabled={cambios.length === 0 || pendiente} onClick={() => confirmar("¿Descartar todos los cambios sin publicar?") && (setT(inicial), setReinicio((x) => x + 1))}>
              Descartar cambios
            </button>
            <button type="button" className={botonPrimario} disabled={cambios.length === 0 || pendiente} onClick={abrirPublicar}>
              Revisar y publicar
            </button>
          </div>
        </div>
      )}

      <dialog ref={dialogo} onClose={() => setEnDialogo(false)} className="m-auto w-[min(40rem,92vw)] rounded-2xl border border-hair p-0 backdrop:bg-graf/50" aria-labelledby="dlg-titulo">
        <div className="space-y-4 p-5">
          <h2 id="dlg-titulo" className="text-lg font-bold tracking-tight">
            Publicar versión {versionBase + 1} de «{titulo}»
          </h2>
          <p className="text-sm text-sub">
            Los técnicos usarán esta versión desde que abran el formato con conexión. Las inspecciones ya enviadas no cambian.
            Una versión publicada no se puede editar: para corregirla se publica otra.
          </p>
          <ul className="max-h-56 list-disc space-y-1 overflow-auto rounded-xl bg-paper py-3 pl-8 pr-4 text-sm">
            {cambios.map((c, i) => (
              <li key={i}>{c.texto}</li>
            ))}
          </ul>
          <label className="block text-sm font-semibold">
            Nota del cambio (obligatoria)
            <textarea value={nota} onChange={(e) => setNota(e.target.value)} rows={3} className={`${campo} mt-1 font-normal`} />
          </label>
          {error && (
            <p role="alert" className="text-sm font-semibold text-bad">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" className={botonSecundario} disabled={pendiente} onClick={() => { dialogo.current?.close(); setEnDialogo(false); }}>
              Seguir editando
            </button>
            <button type="button" className={botonPrimario} disabled={pendiente || nota.trim().length < 5} onClick={publicar}>
              {pendiente ? "Publicando…" : `Publicar versión ${versionBase + 1}`}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}

function FilaItem({
  item,
  n,
  soloLectura,
  primero,
  ultimo,
  unico,
  enLectura,
  onCambio,
  onMover,
  onQuitar,
}: {
  item: TemplateItem;
  n: number;
  soloLectura: boolean;
  primero: boolean;
  ultimo: boolean;
  unico: boolean;
  enLectura: boolean;
  onCambio: (c: Parameters<typeof editarItem>[2]) => void;
  onMover: (d: -1 | 1) => void;
  onQuitar: () => void;
}) {
  const pideValor = item.type === "verificacion" && item.unit !== undefined;
  return (
    <li className="space-y-2 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-7 font-mono text-xs text-sub">{String(n).padStart(2, "0")}</span>
        <textarea
          value={item.label}
          rows={1}
          onChange={(e) => onCambio({ label: e.target.value })}
          disabled={soloLectura}
          aria-label={`Texto del ítem ${n}`}
          className={`${campo} min-w-72 flex-1 resize-y`}
        />
        <span className="rounded-full bg-paper px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.06em] text-sub">{TIPO_ITEM_LABEL[item.type]}</span>
        {!soloLectura && (
          <div className="flex gap-1">
            <button type="button" className={botonIcono} aria-label={`Subir ítem ${n}`} disabled={primero} onClick={() => onMover(-1)}>
              <ChevronUp size={16} />
            </button>
            <button type="button" className={botonIcono} aria-label={`Bajar ítem ${n}`} disabled={ultimo} onClick={() => onMover(1)}>
              <ChevronDown size={16} />
            </button>
            <button
              type="button"
              className={botonIcono}
              aria-label={`Quitar ítem ${n}`}
              disabled={unico || enLectura}
              title={enLectura ? "Alimenta una lectura destacada del informe" : unico ? "Una sección necesita al menos un ítem" : undefined}
              onClick={onQuitar}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      <details className="ml-9">
        <summary className="cursor-pointer text-xs font-semibold text-sub">Opciones del ítem</summary>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-sub sm:col-span-2">
            Ayuda para el técnico (opcional)
            <input value={item.help ?? ""} onChange={(e) => onCambio({ help: e.target.value })} disabled={soloLectura} className={`${campo} mt-1 font-normal text-graf`} />
          </label>

          {item.type === "verificacion" && (
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={pideValor}
                disabled={soloLectura}
                onChange={(e) => onCambio({ unit: e.target.checked ? "" : undefined, min: undefined, max: undefined })}
              />
              Además del estado, pide un valor medido
            </label>
          )}
          {(pideValor || item.type === "number") && (
            <>
              <label className="block text-xs font-semibold text-sub">
                Unidad{item.type === "number" ? " (obligatoria)" : ""}
                <input value={item.type === "verificacion" || item.type === "number" ? (item.unit ?? "") : ""} onChange={(e) => onCambio({ unit: e.target.value })} disabled={soloLectura} className={`${campo} mt-1 font-normal text-graf`} />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs font-semibold text-sub">
                  Mínimo
                  <input type="number" step="any" defaultValue={item.type === "verificacion" || item.type === "number" ? item.min : undefined} onChange={(e) => onCambio({ min: aNumero(e.target.value) })} disabled={soloLectura} className={`${campo} mt-1 font-normal text-graf`} />
                </label>
                <label className="block text-xs font-semibold text-sub">
                  Máximo
                  <input type="number" step="any" defaultValue={item.type === "verificacion" || item.type === "number" ? item.max : undefined} onChange={(e) => onCambio({ max: aNumero(e.target.value) })} disabled={soloLectura} className={`${campo} mt-1 font-normal text-graf`} />
                </label>
              </div>
            </>
          )}
          {"required" in item && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={item.required} disabled={soloLectura} onChange={(e) => onCambio({ required: e.target.checked })} />
              Obligatorio
            </label>
          )}
          {item.type === "text" && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={item.multiline} disabled={soloLectura} onChange={(e) => onCambio({ multiline: e.target.checked })} />
              Varias líneas
            </label>
          )}
          {item.type === "photo" && (
            <label className="block text-xs font-semibold text-sub">
              Máximo de fotos (1 a 10)
              <input type="number" min={1} max={10} value={item.maxPhotos} onChange={(e) => onCambio({ maxPhotos: Math.min(10, Math.max(1, Math.round(Number(e.target.value) || 1))) })} disabled={soloLectura} className={`${campo} mt-1 font-normal text-graf`} />
            </label>
          )}
          <p className="font-mono text-[11px] text-sub sm:col-span-2">
            Identificador interno: {item.id} (no cambia: las respuestas y los reportes lo usan).
          </p>
        </div>
      </details>
    </li>
  );
}

function NuevoItem({ onAgregar }: { onAgregar: (tipo: TipoItemNuevo, label: string) => void }) {
  const [tipo, setTipo] = useState<TipoItemNuevo>("verificacion");
  const [label, setLabel] = useState("");
  const enviar = () => {
    if (!label.trim()) return;
    onAgregar(tipo, label.trim());
    setLabel("");
  };
  return (
    <form
      className="flex flex-wrap items-center gap-2 border-t border-hair bg-paper px-4 py-3"
      onSubmit={(e) => {
        e.preventDefault();
        enviar();
      }}
    >
      <Plus size={16} aria-hidden className="text-sub" />
      <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Texto del ítem nuevo" aria-label="Texto del ítem nuevo" className={`${campo} min-w-60 flex-1`} />
      <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoItemNuevo)} aria-label="Tipo del ítem nuevo" className={`${campo} w-auto`}>
        {TIPOS_NUEVOS.map((x) => (
          <option key={x} value={x}>
            {TIPO_ITEM_LABEL[x]}
          </option>
        ))}
      </select>
      <button type="submit" className={botonSecundario} disabled={!label.trim()}>
        Agregar ítem
      </button>
    </form>
  );
}

function NuevaSeccion({ onAgregar }: { onAgregar: (titulo: string, primerItem: string) => void }) {
  const [titulo, setTitulo] = useState("");
  const [primero, setPrimero] = useState("");
  const ok = titulo.trim() && primero.trim();
  return (
    <form
      className="space-y-2 rounded-2xl border border-dashed border-hair bg-white px-4 py-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!ok) return;
        onAgregar(titulo.trim(), primero.trim());
        setTitulo("");
        setPrimero("");
      }}
    >
      <h2 className="text-sm font-bold">Agregar sección</h2>
      <div className="flex flex-wrap gap-2">
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título de la sección" aria-label="Título de la sección nueva" className={`${campo} min-w-60 flex-1`} />
        <input value={primero} onChange={(e) => setPrimero(e.target.value)} placeholder="Primer ítem de la sección" aria-label="Primer ítem de la sección nueva" className={`${campo} min-w-60 flex-1`} />
        <button type="submit" className={botonSecundario} disabled={!ok}>
          Agregar sección
        </button>
      </div>
      <p className="text-xs text-sub">La sección nueva queda al final y su primer ítem es de verificación; después puede agregar más ítems de cualquier tipo.</p>
    </form>
  );
}

function Cabecera({
  header,
  soloLectura,
  onAgregar,
  onEditar,
  onQuitar,
}: {
  header: FormTemplateSchema["header"];
  soloLectura: boolean;
  onAgregar: (label: string, input: TipoCampoCabecera) => void;
  onEditar: (key: string, c: { label?: string; required?: boolean }) => void;
  onQuitar: (key: string, label: string) => void;
}) {
  const [label, setLabel] = useState("");
  const [input, setInput] = useState<TipoCampoCabecera>("text");
  const estandar = header.filter((h) => esCampoEstandar(h.key));
  const extra = header.filter((h) => !esCampoEstandar(h.key));
  return (
    <section className="rounded-2xl border border-hair bg-white" aria-label="Cabecera del formato">
      <div className="border-b border-hair px-4 py-3">
        <h2 className="font-semibold">Cabecera · datos del equipo</h2>
        <p className="text-xs text-sub">
          Los campos estándar y las firmas son iguales en todos los formatos y no se modifican. El nombre del técnico, la firma del encargado y
          los participantes los agrega la app siempre. Puede sumar datos propios del equipo (marca, serie, potencia…), que salen en la ficha del informe.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 px-4 py-3">
        {estandar.map((h) => (
          <span key={h.key} className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-sub" title="Campo estándar">
            {h.label}
          </span>
        ))}
      </div>
      {extra.length > 0 && (
        <ul className="divide-y divide-hair border-t border-hair">
          {extra.map((h) => (
            <li key={h.key} className="flex flex-wrap items-center gap-2 px-4 py-2">
              <input
                value={h.label}
                onChange={(e) => onEditar(h.key, { label: e.target.value })}
                disabled={soloLectura}
                aria-label={`Nombre del campo ${h.label}`}
                className={`${campo} min-w-60 flex-1`}
              />
              <span className="rounded-full bg-paper px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.06em] text-sub">{TIPO_CAMPO_LABEL[h.input]}</span>
              <label className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" checked={h.required} disabled={soloLectura} onChange={(e) => onEditar(h.key, { required: e.target.checked })} />
                Obligatorio
              </label>
              {!soloLectura && (
                <button type="button" className={botonIcono} aria-label={`Quitar el campo ${h.label}`} onClick={() => onQuitar(h.key, h.label)}>
                  <Trash2 size={16} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {!soloLectura && (
        <form
          className="flex flex-wrap items-center gap-2 border-t border-hair bg-paper px-4 py-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!label.trim()) return;
            onAgregar(label.trim(), input);
            setLabel("");
          }}
        >
          <Plus size={16} aria-hidden className="text-sub" />
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Nombre del dato (p. ej. Marca)" aria-label="Nombre del campo nuevo de la cabecera" className={`${campo} min-w-60 flex-1`} />
          <select value={input} onChange={(e) => setInput(e.target.value as TipoCampoCabecera)} aria-label="Tipo del campo nuevo" className={`${campo} w-auto`}>
            {(["text", "number", "date"] as const).map((x) => (
              <option key={x} value={x}>
                {TIPO_CAMPO_LABEL[x]}
              </option>
            ))}
          </select>
          <button type="submit" className={botonSecundario} disabled={!label.trim()}>
            Agregar campo
          </button>
        </form>
      )}
    </section>
  );
}
