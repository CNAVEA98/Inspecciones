"use client";

import { useState } from "react";
import { PhotoField } from "./photo-field";
import { ESTADOS_INSPECCION, type TemplateItem, type VerificationValue, type Estado } from "@/lib/templates/schema";
import { SEVERIDADES, type Severity } from "@/lib/tecnico/draft";

const ESTADOS: { code: Estado; word: string; on: string }[] = [
  { code: "BN", word: "Bueno", on: "bg-ok" },
  { code: "ML", word: "Malo", on: "bg-bad" },
  { code: "NT", word: "No tiene", on: "bg-[#6a6d70]" },
  { code: "NA", word: "No aplica", on: "bg-[#8a6d00]" },
  { code: "NR", word: "No realizada", on: "bg-[#8a4b1d]" },
  { code: "RL", word: "Realizado", on: "bg-ok" },
  { code: "RMP", word: "Reemplazado", on: "bg-[#1f5f8a]" },
  { code: "SI", word: "Sí", on: "bg-ok" },
  { code: "NO", word: "No", on: "bg-[#6a6d70]" },
];

/** Columnas de la botonera según cuántos estados se ofrecen (clases literales para que Tailwind las genere). */
const COLUMNAS: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-3",
  7: "grid-cols-4",
  8: "grid-cols-4",
  9: "grid-cols-3",
};

const campo =
  "min-h-14 w-full rounded-xl border-[1.5px] border-[#8f897e] bg-white px-4 text-lg text-graf focus:border-cu focus:outline-3 focus:outline-offset-1 focus:outline-cu/40";

export interface ItemFieldProps {
  item: TemplateItem;
  index: number;
  /** Estados que se ofrecen en un ítem de verificación (si falta, los de inspección). */
  estados?: readonly Estado[];
  inspectionId: string;
  value: unknown;
  severity?: Severity;
  onChange: (value: unknown) => void;
  onSeverity: (s: Severity) => void;
}

/** Un ítem de la plantilla. Se dibuja según su tipo: el formulario no conoce equipos concretos. */
export function ItemField(props: ItemFieldProps) {
  const { item, index, value } = props;
  return (
    <article
      id={`item-${item.id}`}
      className="scroll-mt-4 rounded-2xl border-[1.5px] border-hair bg-white p-4"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 rounded-full bg-graf px-2.5 py-0.5 font-mono text-sm font-semibold text-white">
          {String(index).padStart(2, "0")}
        </span>
        <p className="text-lg font-medium leading-snug">{item.label}</p>
      </div>
      <div className="mt-4">
        {item.type === "verificacion" && <Verificacion {...props} value={value as Partial<VerificationValue> | undefined} item={item} />}
        {item.type === "number" && (
          <NumeroInput unit={item.unit} initial={typeof value === "number" ? value : undefined} onChange={props.onChange} />
        )}
        {item.type === "text" && (
          <textarea
            aria-label={item.label}
            rows={item.multiline ? 4 : 2}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => props.onChange(e.target.value)}
            className={`${campo} py-3`}
          />
        )}
        {item.type === "photo" && (
          <PhotoField
            inspectionId={props.inspectionId}
            ids={Array.isArray(value) ? (value as string[]) : []}
            max={item.maxPhotos}
            onChange={props.onChange}
          />
        )}
        {item.type === "nameplate" && (
          <div className="grid gap-3">
            {item.fields.map((f) => (
              <label key={f.key} className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold">
                  {f.label}
                  {f.unit ? ` (${f.unit})` : ""}
                </span>
                <input
                  className={campo}
                  value={((value as Record<string, string> | undefined) ?? {})[f.key] ?? ""}
                  onChange={(e) =>
                    props.onChange({ ...((value as Record<string, string> | undefined) ?? {}), [f.key]: e.target.value })
                  }
                />
              </label>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

/** Valor numérico: se edita como texto y se guarda como número solo cuando es válido. */
function NumeroInput({
  unit,
  initial,
  onChange,
}: {
  unit: string;
  initial: number | undefined;
  onChange: (n: number | undefined) => void;
}) {
  const [texto, setTexto] = useState(initial === undefined ? "" : String(initial).replace(".", ","));
  return (
    <div className="flex items-center gap-3">
      <input
        inputMode="decimal"
        aria-label={`Valor en ${unit}`}
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          const n = Number(e.target.value.replace(",", "."));
          onChange(e.target.value.trim() !== "" && Number.isFinite(n) ? n : undefined);
        }}
        className={`${campo} max-w-44 text-right font-mono`}
      />
      <span className="font-mono text-lg font-semibold text-sub">{unit}</span>
    </div>
  );
}

function Verificacion({
  item,
  value,
  inspectionId,
  onChange,
  severity,
  onSeverity,
  estados,
}: ItemFieldProps & { item: Extract<TemplateItem, { type: "verificacion" }>; value: Partial<VerificationValue> | undefined }) {
  const v = value ?? {};
  const set = (patch: Partial<VerificationValue>) => onChange({ ...v, ...patch });
  const critico = v.estado === "ML";
  const necesitaMotivo = v.estado === "NR" || v.estado === "RMP";
  const ofrecidos = (estados ?? ESTADOS_INSPECCION).flatMap((c) => ESTADOS.filter((e) => e.code === c));

  return (
    <div className="flex flex-col gap-4">
      <div
        role="group"
        aria-label={`Estado: ${item.label}`}
        className={`grid ${COLUMNAS[ofrecidos.length] ?? "grid-cols-4"} gap-1.5`}
      >
        {ofrecidos.map((e) => {
          const activo = v.estado === e.code;
          return (
            <button
              key={e.code}
              type="button"
              aria-pressed={activo}
              onClick={() => set({ estado: e.code })}
              className={
                "flex min-h-16 flex-col items-center justify-center rounded-xl border-[1.5px] transition-transform focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cu active:scale-[0.97] " +
                (activo ? `${e.on} border-transparent text-white` : "border-[#8f897e] bg-white text-graf hover:border-graf")
              }
            >
              <span className="font-mono text-lg font-bold">{e.code}</span>
              <span className="text-[11px] leading-tight">{e.word}</span>
            </button>
          );
        })}
      </div>

      {item.unit !== undefined ? (
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-sub">Valor</span>
          <NumeroInput unit={item.unit || "valor"} initial={v.valor} onChange={(n) => set({ valor: n })} />
        </div>
      ) : null}

      {critico ? (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Severidad del hallazgo</legend>
          <div className="grid grid-cols-4 gap-1.5">
            {SEVERIDADES.map((s) => (
              <button
                key={s.value}
                type="button"
                aria-pressed={(severity ?? "media") === s.value}
                onClick={() => onSeverity(s.value)}
                className={
                  "min-h-12 rounded-xl border-[1.5px] text-sm font-semibold " +
                  ((severity ?? "media") === s.value ? "border-graf bg-graf text-white" : "border-[#8f897e] bg-white")
                }
              >
                {s.label}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold">
          Observación{critico || necesitaMotivo ? " (obligatoria)" : ""}
        </span>
        <textarea
          rows={2}
          value={v.obs ?? ""}
          onChange={(e) => set({ obs: e.target.value })}
          className={`${campo} py-3`}
        />
      </label>

      <div>
        <p className="mb-2 text-sm font-semibold">Foto (opcional)</p>
        <PhotoField inspectionId={inspectionId} ids={v.fotos ?? []} max={3} onChange={(ids) => set({ fotos: ids })} />
      </div>
    </div>
  );
}
