"use client";

import { useState } from "react";

/**
 * Descarga el informe PDF de una inspección ya recibida por el servidor. El PDF se genera al pedirlo, así que
 * necesita conexión: sin red se avisa en vez de abrir una página de error.
 */
export function BotonPdf({ id, className }: { id: string; className?: string }) {
  const [aviso, setAviso] = useState(false);
  return (
    <>
      <a
        href={`/tecnico/${id}/pdf`}
        target="_blank"
        rel="noopener"
        onClick={(e) => {
          if (!navigator.onLine) {
            e.preventDefault();
            setAviso(true);
          } else {
            setAviso(false);
          }
        }}
        className={
          className ??
          "inline-flex min-h-12 items-center justify-center rounded-xl border-[1.5px] border-graf bg-white px-4 text-base font-semibold hover:bg-paper focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cu"
        }
      >
        Descargar PDF
      </a>
      {aviso ? (
        <p role="alert" className="mt-2 text-sm font-medium text-bad">
          Para descargar el PDF necesita conexión a internet.
        </p>
      ) : null}
    </>
  );
}
