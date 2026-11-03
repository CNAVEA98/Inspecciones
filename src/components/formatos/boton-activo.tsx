"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cambiarActivo } from "@/lib/formatos/activo-actions";

/** Botón del supervisor y del administrador para desactivar o reactivar un formato, con confirmación. */
export function BotonActivo({ formatoId, titulo, activo }: { formatoId: string; titulo: string; activo: boolean }) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const alternar = () => {
    const mensaje = activo
      ? `¿Desactivar ${formatoId} «${titulo}»?\n\nLos técnicos dejarán de verlo al elegir un formato. No se borra nada: sus inspecciones, PDF y versiones se conservan, los borradores ya empezados se pueden terminar y puede reactivarlo cuando quiera.`
      : `¿Reactivar ${formatoId} «${titulo}»?\n\nLos técnicos volverán a verlo al elegir un formato (con la versión vigente).`;
    if (!window.confirm(mensaje)) return;
    setError(null);
    iniciar(async () => {
      const r = await cambiarActivo({ formatoId, activo: !activo });
      if (r.ok) router.refresh();
      else setError(r.error);
    });
  };

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={alternar}
        disabled={pendiente}
        className={`rounded-lg border px-3 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-cu disabled:opacity-50 ${
          activo ? "border-bad text-bad hover:bg-[#fdecec]" : "border-ok text-ok hover:bg-[#e8f4ec]"
        }`}
      >
        {pendiente ? "Guardando…" : activo ? "Desactivar" : "Reactivar"}
      </button>
      {error ? (
        <span role="alert" className="text-xs font-semibold text-bad">
          {error}
        </span>
      ) : null}
    </span>
  );
}
