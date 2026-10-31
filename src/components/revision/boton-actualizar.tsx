"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

/** Vuelve a leer la bandeja desde el servidor; la URL (filtros y búsqueda) no cambia. */
export function BotonActualizar() {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();

  return (
    <button
      type="button"
      onClick={() => iniciar(() => router.refresh())}
      disabled={pendiente}
      aria-busy={pendiente}
      className="rounded-lg border border-hair px-3 py-1.5 text-sm font-semibold hover:bg-paper focus-visible:outline-2 focus-visible:outline-cu disabled:opacity-60"
    >
      {pendiente ? "Actualizando…" : "Actualizar"}
    </button>
  );
}
