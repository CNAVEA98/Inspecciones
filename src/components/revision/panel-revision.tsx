"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SignatureField } from "@/components/shared/signature-field";
import type { EtapaFirma } from "@/lib/revision/estado";
import { createClient } from "@/lib/supabase/client";

type Decision = "approved" | "rejected";

const TEXTO = {
  supervisor: {
    titulo: "Revisión del supervisor",
    aprobar: "Al aprobar, la inspección pasa al programador para su firma final.",
  },
  planner: {
    titulo: "Revisión del programador",
    aprobar: "Al aprobar, la inspección queda cerrada con la firma de ambos.",
  },
} as const;

const campo =
  "w-full rounded-lg border border-hair bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-cu";

/**
 * Firma de una etapa de revisión: decisión, comentario obligatorio y firma dibujada.
 * La base de datos exige el orden (supervisor, luego planificador) y el comentario; aquí se valida antes
 * para no mostrar errores técnicos, y se pide confirmación porque la firma es definitiva.
 */
export function PanelRevision({ inspeccionId, folio, etapa }: { inspeccionId: string; folio: string; etapa: EtapaFirma }) {
  const router = useRouter();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [comentario, setComentario] = useState("");
  const [firma, setFirma] = useState<Blob | null>(null);
  const [intentado, setIntentado] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const faltas = [
    !decision && "Elija si aprueba o rechaza.",
    !comentario.trim() && "El comentario es obligatorio.",
    !firma && "Falta la firma.",
  ].filter((f): f is string => !!f);

  const continuar = () => {
    setIntentado(true);
    setError(null);
    if (faltas.length === 0) setConfirmando(true);
  };

  const firmar = async () => {
    if (enviando || !decision || !firma) return;
    setEnviando(true);
    setError(null);
    try {
      const supabase = createClient();
      // Ruta única por intento: si falla la RPC y se reintenta, no choca con la imagen ya subida.
      const ruta = `${inspeccionId}/${etapa}-${crypto.randomUUID()}.png`;
      const subida = await supabase.storage.from("signatures").upload(ruta, firma, { contentType: "image/png" });
      if (subida.error) throw new Error(`No se pudo subir la firma: ${subida.error.message}`);

      const { error: rpcError } = await supabase.rpc("review_inspection", {
        p_id: inspeccionId,
        p_decision: decision,
        p_comment: comentario.trim(),
        p_signature_path: ruta,
      });
      if (rpcError) throw new Error(rpcError.message);

      router.refresh(); // el servidor ya no mostrará este panel: la inspección cambió de estado
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo registrar la firma.");
      setConfirmando(false);
      setEnviando(false);
    }
  };

  const verbo = decision === "approved" ? "APROBAR" : "RECHAZAR";

  return (
    <section id="revision" className="rounded-2xl border-2 border-cu bg-white p-5">
      <h2 className="text-lg font-bold">{TEXTO[etapa].titulo}</h2>
      <p className="mt-1 text-sm text-sub">Revise el informe completo antes de firmar. La firma es definitiva.</p>

      <div className={confirmando || enviando ? "pointer-events-none opacity-60" : ""}>
        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Decisión</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(
              [
                ["approved", "Aprobar"],
                ["rejected", "Rechazar"],
              ] as const
            ).map(([valor, etiqueta]) => (
              <button
                key={valor}
                type="button"
                aria-pressed={decision === valor}
                onClick={() => setDecision(valor)}
                className={`rounded-lg border px-5 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-cu ${
                  decision === valor
                    ? valor === "approved"
                      ? "border-ok bg-ok text-white"
                      : "border-bad bg-bad text-white"
                    : "border-graf hover:bg-paper"
                }`}
              >
                {etiqueta}
              </button>
            ))}
          </div>
          {decision === "approved" && <p className="mt-2 text-sm text-sub">{TEXTO[etapa].aprobar}</p>}
          {decision === "rejected" && (
            <p className="mt-2 text-sm text-sub">
              Rechazar cierra la inspección: el técnico deberá crear una nueva. Explique el motivo en el comentario.
            </p>
          )}
        </fieldset>

        <label className="mt-4 block text-sm font-semibold" htmlFor="comentario-revision">
          Comentario (obligatorio)
        </label>
        <textarea
          id="comentario-revision"
          rows={3}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          className={`${campo} mt-1`}
        />

        <p className="mt-4 text-sm font-semibold">Firma</p>
        <div className="mt-1 max-w-md">
          <SignatureField ayuda="Firme con el mouse o el lápiz" onChange={(png) => setFirma(png)} />
        </div>
      </div>

      {intentado && faltas.length > 0 && !confirmando && (
        <ul role="alert" className="mt-4 list-disc rounded-lg bg-cu-soft px-8 py-2 text-sm text-bad">
          {faltas.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}
      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-bad px-3 py-2 text-sm text-bad">
          {error}
        </p>
      )}

      {confirmando ? (
        <div role="alertdialog" aria-label="Confirmar firma" className="mt-4 rounded-xl border border-graf bg-paper p-4">
          <p className="text-sm">
            Va a <b>{verbo}</b> la inspección <b className="font-mono">{folio}</b>. Esta acción es definitiva: la firma queda registrada con su
            nombre, la fecha y la hora.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => void firmar()}
              disabled={enviando}
              className="rounded-lg bg-graf px-5 py-2 text-sm font-semibold text-white hover:bg-graf-2 focus-visible:outline-2 focus-visible:outline-cu disabled:opacity-60"
            >
              {enviando ? "Firmando…" : "Confirmar y firmar"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              disabled={enviando}
              className="rounded-lg border border-graf px-5 py-2 text-sm font-semibold hover:bg-white focus-visible:outline-2 focus-visible:outline-cu"
            >
              Volver
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={continuar}
          className="mt-4 rounded-lg bg-graf px-5 py-2 text-sm font-semibold text-white hover:bg-graf-2 focus-visible:outline-2 focus-visible:outline-cu"
        >
          Firmar
        </button>
      )}
    </section>
  );
}
