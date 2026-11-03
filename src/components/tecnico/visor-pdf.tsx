"use client";

import { useEffect, useRef, useState } from "react";
import { esIos } from "@/lib/tecnico/pdf";

export interface PdfAbierto {
  archivo: File;
  /** URL local (`blob:`) del archivo; la libera quien abrió el visor al cerrarlo. */
  url: string;
}

const BOTON =
  "inline-flex min-h-12 flex-1 items-center justify-center rounded-xl px-3 text-base font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cu";

/**
 * Visor del PDF a pantalla completa dentro de la app, con Compartir, Guardar y Salir siempre a la vista.
 * - Compartir abre la hoja del teléfono (WhatsApp, correo, «Guardar en Archivos»…), si el navegador lo permite.
 * - Guardar descarga el archivo; en iPhone/iPad usa la hoja de compartir, porque descargar desde la app instalada
 *   deja el PDF a pantalla completa sin forma de volver.
 * - Salir, la tecla Escape y el botón «atrás» del teléfono cierran el visor sin salir de la pantalla actual.
 * La vista previa solo se muestra si el navegador sabe mostrar PDF dentro de la página (Android no puede).
 */
export function VisorPdf({ pdf, onCerrar }: { pdf: PdfAbierto; onCerrar: () => void }) {
  const cerrarRef = useRef(onCerrar);
  cerrarRef.current = onCerrar;
  const salirRef = useRef<HTMLButtonElement>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [entorno] = useState(() => ({
    ios: esIos(navigator.userAgent, navigator.platform, navigator.maxTouchPoints),
    compartir: typeof navigator.canShare === "function" && navigator.canShare({ files: [pdf.archivo] }),
    vistaPrevia: navigator.pdfViewerEnabled === true,
  }));

  // El botón «atrás» del teléfono cierra el visor: se agrega una entrada al historial al abrir.
  useEffect(() => {
    window.history.pushState({ visorPdf: true }, "");
    const onPop = () => cerrarRef.current();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") salir();
    };
    window.addEventListener("popstate", onPop);
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    salirRef.current?.focus();
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, []);

  function salir() {
    // Quita la entrada que agregó el visor; el evento popstate cierra el visor.
    if ((window.history.state as { visorPdf?: boolean } | null)?.visorPdf) window.history.back();
    else cerrarRef.current();
  }

  const compartir = async (guardar: boolean) => {
    setAviso(null);
    try {
      await navigator.share({ files: [pdf.archivo], title: pdf.archivo.name });
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return; // el técnico cerró la hoja
      setAviso(guardar ? "No se pudo guardar el PDF." : "No se pudo compartir el PDF.");
    }
  };

  const guardar = () => {
    if (entorno.ios && entorno.compartir) {
      setAviso("Elija «Guardar en Archivos» en la lista que se abre.");
      void compartir(true);
      return;
    }
    const a = document.createElement("a");
    a.href = pdf.url;
    a.download = pdf.archivo.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setAviso("PDF guardado en Descargas.");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Informe PDF"
      className="fixed inset-0 z-50 flex flex-col bg-paper"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="border-b border-hair bg-white px-4 py-3">
        <p className="truncate text-base font-semibold" title={pdf.archivo.name}>
          {pdf.archivo.name}
        </p>
        <div className="mt-3 flex gap-2">
          {entorno.compartir ? (
            <button type="button" onClick={() => void compartir(false)} className={`${BOTON} bg-graf text-white hover:bg-graf-2`}>
              Compartir
            </button>
          ) : null}
          <button type="button" onClick={guardar} className={`${BOTON} border-[1.5px] border-graf bg-white hover:bg-paper`}>
            Guardar
          </button>
          <button
            ref={salirRef}
            type="button"
            onClick={salir}
            className={`${BOTON} border-[1.5px] border-graf bg-white hover:bg-paper`}
          >
            Salir
          </button>
        </div>
        {aviso ? (
          <p role="status" className="mt-2 text-sm font-medium text-sub">
            {aviso}
          </p>
        ) : null}
      </div>
      {entorno.vistaPrevia ? (
        <iframe src={pdf.url} title={pdf.archivo.name} className="min-h-0 w-full flex-1 border-0 bg-white" />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-xl font-semibold">PDF listo</p>
          <p className="max-w-sm text-base text-sub">
            Este teléfono no muestra el PDF dentro de la app.{" "}
            {entorno.compartir
              ? "Use «Compartir» para enviarlo o abrirlo, o «Guardar» para dejarlo en el teléfono."
              : "Use «Guardar» para dejarlo en el teléfono y abrirlo desde Descargas."}
          </p>
        </div>
      )}
    </div>
  );
}
