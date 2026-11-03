"use client";

import { useState } from "react";
import { nombreDesdeDisposition } from "@/lib/tecnico/pdf";
import { VisorPdf, type PdfAbierto } from "./visor-pdf";

const CLASE_BOTON =
  "inline-flex min-h-12 items-center justify-center rounded-xl border-[1.5px] border-graf bg-white px-4 text-base font-semibold hover:bg-paper focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cu disabled:cursor-wait disabled:opacity-70";

/**
 * Abre el informe PDF de una inspección ya recibida por el servidor dentro de la app (visor con Compartir, Guardar y
 * Salir). Antes se abría la ruta del PDF directamente: en la app instalada en el teléfono no hay barra del navegador y
 * el técnico quedaba atrapado en el PDF. El PDF se genera al pedirlo, así que necesita conexión.
 */
export function BotonPdf({ id, className }: { id: string; className?: string }) {
  const [aviso, setAviso] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [pdf, setPdf] = useState<PdfAbierto | null>(null);

  const abrir = async () => {
    if (cargando) return;
    if (!navigator.onLine) {
      setAviso("Para ver el PDF necesita conexión a internet.");
      return;
    }
    setAviso(null);
    setCargando(true);
    try {
      const res = await fetch(`/tecnico/${id}/pdf`, { credentials: "same-origin", cache: "no-store" });
      if (!res.ok) {
        const texto = (await res.text().catch(() => "")).slice(0, 200);
        setAviso(texto ? `No se pudo generar el PDF: ${texto}` : "No se pudo generar el PDF. Intente de nuevo.");
        return;
      }
      const nombre = nombreDesdeDisposition(res.headers.get("Content-Disposition"));
      const blob = await res.blob();
      const archivo = new File([blob], nombre, { type: "application/pdf" });
      setPdf({ archivo, url: URL.createObjectURL(archivo) });
    } catch {
      setAviso("No se pudo descargar el PDF. Revise la conexión e intente de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const cerrar = () => {
    if (pdf) URL.revokeObjectURL(pdf.url);
    setPdf(null);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => void abrir()}
        disabled={cargando}
        aria-busy={cargando}
        className={className ? `${className} disabled:cursor-wait disabled:opacity-70` : CLASE_BOTON}
      >
        {cargando ? "Preparando PDF…" : "Ver PDF"}
      </button>
      {aviso ? (
        <p role="alert" className="mt-2 text-sm font-medium text-bad">
          {aviso}
        </p>
      ) : null}
      {pdf ? <VisorPdf pdf={pdf} onCerrar={cerrar} /> : null}
    </>
  );
}
