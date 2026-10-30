"use client";

import { useEffect, useRef } from "react";

/** Firma dibujada con el dedo o el mouse. Entrega el PNG y una vista previa; "Limpiar" la borra. */
export function SignatureField({
  initialDataUrl,
  onChange,
  ayuda = "Firme con el dedo",
}: {
  initialDataUrl?: string;
  onChange: (png: Blob | null, dataUrl: string | null) => void;
  ayuda?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const cb = useRef(onChange);
  useEffect(() => {
    cb.current = onChange;
  });

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = cv.clientWidth;
    const h = cv.clientHeight;
    cv.width = w * dpr;
    cv.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#14181d";
    if (initialDataUrl) {
      const im = new Image();
      im.onload = () => ctx.drawImage(im, 0, 0, w, h);
      im.src = initialDataUrl;
    }

    let dibujando = false;
    let hay = false;
    const pos = (e: PointerEvent): [number, number] => {
      const r = cv.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };
    const down = (e: PointerEvent) => {
      dibujando = true;
      cv.setPointerCapture(e.pointerId);
      const [x, y] = pos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 0.01, y + 0.01);
      ctx.stroke();
      hay = true;
    };
    const move = (e: PointerEvent) => {
      if (!dibujando) return;
      const [x, y] = pos(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    };
    const up = () => {
      if (!dibujando) return;
      dibujando = false;
      if (hay) cv.toBlob((b) => b && cb.current(b, cv.toDataURL("image/png")), "image/png");
    };
    cv.addEventListener("pointerdown", down);
    cv.addEventListener("pointermove", move);
    cv.addEventListener("pointerup", up);
    cv.addEventListener("pointercancel", up);
    return () => {
      cv.removeEventListener("pointerdown", down);
      cv.removeEventListener("pointermove", move);
      cv.removeEventListener("pointerup", up);
      cv.removeEventListener("pointercancel", up);
    };
    // El lienzo se inicializa una sola vez; la firma inicial solo se dibuja al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const limpiar = () => {
    const cv = canvas.current;
    cv?.getContext("2d")?.clearRect(0, 0, cv.clientWidth, cv.clientHeight);
    cb.current(null, null);
  };

  return (
    <div>
      <canvas
        ref={canvas}
        aria-label="Área de firma"
        className="block h-44 w-full touch-none rounded-2xl border-[1.5px] border-dashed border-[#6f695f] bg-white"
      />
      <div className="mt-2 flex items-center justify-between text-sm text-sub">
        <span>{ayuda}</span>
        <button type="button" onClick={limpiar} className="min-h-12 rounded-xl border-[1.5px] border-graf px-4 font-semibold text-graf">
          Limpiar
        </button>
      </div>
    </div>
  );
}
