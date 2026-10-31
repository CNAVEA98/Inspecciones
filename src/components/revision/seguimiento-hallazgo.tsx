"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { guardarSeguimiento } from "@/lib/revision/seguimiento-actions";
import {
  ALCANCE_NOMBRE,
  GESTION_NOMBRE,
  SEGUIMIENTO_INICIAL,
  estadoGestion,
  type Alcance,
  type EstadoGestion,
  type Seguimiento,
} from "@/lib/revision/fallas";

const CHIP: Record<EstadoGestion, string> = {
  pendiente: "bg-cu-soft text-[#7a3d12]",
  con_aviso: "bg-[#e1f2e8] text-[#0b4a28]",
  canalizado: "bg-[#e1ecf6] text-[#1f4f73]",
};

const campo =
  "w-full rounded-lg border border-[#8f897e] bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-cu";

/** Estado del seguimiento de un hallazgo y, para la Supervisión, el formulario para registrarlo. */
export function SeguimientoHallazgo({
  findingId,
  seguimiento,
  ficha,
  puedeGestionar,
}: {
  findingId: string;
  seguimiento: Seguimiento | null;
  /** Texto para copiar a SAP al crear el aviso subsecuente. */
  ficha: string;
  puedeGestionar: boolean;
}) {
  const router = useRouter();
  const inicial = seguimiento ?? SEGUIMIENTO_INICIAL;
  const [scope, setScope] = useState<Alcance>(inicial.scope);
  const [aviso, setAviso] = useState(inicial.sapNotice ?? "");
  const [nota, setNota] = useState(inicial.channelNote ?? "");
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const [pendiente, empezar] = useTransition();
  const estado = estadoGestion(seguimiento);

  const guardar = () =>
    empezar(async () => {
      setMensaje(null);
      const r = await guardarSeguimiento({ findingId, scope, sapNotice: aviso, channelNote: nota });
      if (r.ok) {
        setMensaje({ ok: true, texto: "Guardado." });
        router.refresh();
      } else {
        setMensaje({ ok: false, texto: r.error });
      }
    });

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(ficha);
      setMensaje({ ok: true, texto: "Ficha copiada. Péguela al crear el aviso en SAP." });
    } catch {
      setMensaje({ ok: false, texto: "No se pudo copiar automáticamente; seleccione el texto de la ficha y cópielo." });
    }
  };

  return (
    <div className="mt-2 text-sm">
      <p className="flex flex-wrap items-center gap-2">
        <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${CHIP[estado]}`}>{GESTION_NOMBRE[estado]}</span>
        {seguimiento?.scope === "bbosch" && seguimiento.sapNotice ? (
          <span className="font-mono">Aviso N.º {seguimiento.sapNotice}</span>
        ) : null}
        {seguimiento?.scope === "terceros" ? (
          <span className="text-sub">
            Requiere apoyo de terceros{seguimiento.channelNote ? `: ${seguimiento.channelNote}` : ""}
          </span>
        ) : null}
      </p>

      {puedeGestionar ? (
        <details className="mt-1 rounded-lg border border-hair bg-paper px-3 py-2">
          <summary className="cursor-pointer font-semibold text-cu focus-visible:outline-2 focus-visible:outline-cu">
            Gestionar este hallazgo
          </summary>
          <fieldset className="mt-3 grid gap-2">
            <legend className="mb-1 text-xs font-semibold text-sub">Alcance</legend>
            {(Object.keys(ALCANCE_NOMBRE) as Alcance[]).map((a) => (
              <label key={a} className="flex min-h-9 items-center gap-2">
                <input type="radio" name={`alcance-${findingId}`} checked={scope === a} onChange={() => setScope(a)} className="size-4 accent-cu" />
                {ALCANCE_NOMBRE[a]}
              </label>
            ))}
          </fieldset>

          {scope === "bbosch" ? (
            <div className="mt-3 grid gap-3">
              <label className="grid gap-1 text-xs font-semibold text-sub">
                N.º de aviso subsecuente (SAP)
                <input
                  value={aviso}
                  onChange={(e) => setAviso(e.target.value)}
                  maxLength={20}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Se anota cuando el aviso ya está creado…"
                  className={`${campo} max-w-xs font-mono`}
                />
              </label>
              <div>
                <button
                  type="button"
                  onClick={() => void copiar()}
                  className="rounded-lg border border-graf px-3 py-1.5 text-sm font-semibold hover:bg-white focus-visible:outline-2 focus-visible:outline-cu"
                >
                  Copiar ficha para SAP
                </button>
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-sub">Ver la ficha</summary>
                  <pre className="mt-1 max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-white p-3 font-mono text-xs">{ficha}</pre>
                </details>
              </div>
            </div>
          ) : (
            <label className="mt-3 grid gap-1 text-xs font-semibold text-sub">
              Canalización con MLP (a quién, cuándo y por qué medio)
              <textarea
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                maxLength={300}
                rows={2}
                placeholder="Ej.: informado a … por radio, 31-10 10:30…"
                className={campo}
              />
            </label>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={pendiente}
              onClick={guardar}
              className="rounded-lg bg-graf px-4 py-2 text-sm font-semibold text-white hover:bg-graf-2 focus-visible:outline-2 focus-visible:outline-cu disabled:opacity-60"
            >
              {pendiente ? "Guardando…" : "Guardar seguimiento"}
            </button>
            {mensaje ? (
              <span role="status" className={`text-sm font-medium ${mensaje.ok ? "text-[#0b4a28]" : "text-bad"}`}>
                {mensaje.texto}
              </span>
            ) : null}
          </div>
        </details>
      ) : null}
    </div>
  );
}
