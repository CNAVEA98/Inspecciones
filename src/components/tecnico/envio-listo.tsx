"use client";

import Link from "next/link";
import { useTecnico } from "./tecnico-provider";
import { BotonPdf } from "./boton-pdf";
import { useLive } from "@/lib/tecnico/hooks";

/**
 * Pantalla al terminar el formulario. Con red el envío se completa en segundos y aparece «Descargar PDF»;
 * sin red la inspección queda en la cola y el PDF se descarga después desde «Enviadas».
 */
export function EnvioListo({ id }: { id: string }) {
  const { db } = useTecnico();
  const estado = useLive(async () => (await db.drafts.get(id))?.state, id, undefined);
  const enviada = estado === "sent";

  return (
    <div className="flex flex-col gap-5">
      <div role="status" className="rounded-2xl border border-ok bg-[#e1f2e8] p-5">
        <h1 className="text-2xl font-bold text-[#0b4a28]">{enviada ? "Inspección enviada" : "Inspección guardada"}</h1>
        <p className="mt-2 text-lg text-[#0b4a28]">
          {enviada
            ? "El supervisor ya puede revisarla."
            : "Se enviará apenas haya conexión. Cuando se envíe, podrá descargar el PDF desde «Enviadas»."}
        </p>
      </div>
      {enviada ? <BotonPdf id={id} className="inline-flex min-h-14 items-center justify-center rounded-xl border-[1.5px] border-graf bg-white px-5 text-lg font-semibold hover:bg-paper focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cu" /> : null}
      <Link
        href="/tecnico"
        className="inline-flex min-h-14 items-center justify-center rounded-xl bg-graf px-6 text-lg font-semibold text-white hover:bg-graf-2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cu"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
