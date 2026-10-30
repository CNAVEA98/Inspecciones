"use client";

import Link from "next/link";
import { useRef, useState } from "react";

const ANCHO_PANEL = 128;
/** Movimiento mínimo para considerar que fue un deslizamiento y no un toque. */
const UMBRAL_TOQUE = 8;

interface Props {
  href: string;
  children: React.ReactNode;
  onEliminar: () => Promise<void>;
}

/**
 * Tarjeta de una inspección en curso. Se desliza hacia la derecha para mostrar «Eliminar» (con confirmación),
 * y además tiene un botón visible para quien no deslice (mouse, teclado, guantes).
 */
export function TarjetaBorrador({ href, children, onEliminar }: Props) {
  const [x, setX] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState(false);
  const inicio = useRef<{ px: number; x0: number } | null>(null);
  const movio = useRef(false);

  const abierta = x >= ANCHO_PANEL;

  const alBajar = (e: React.PointerEvent) => {
    if (confirmando) return;
    inicio.current = { px: e.clientX, x0: x };
    movio.current = false;
  };
  const alMover = (e: React.PointerEvent) => {
    const i = inicio.current;
    if (!i) return;
    const dx = e.clientX - i.px;
    if (!movio.current && Math.abs(dx) < UMBRAL_TOQUE) return;
    if (!movio.current) {
      movio.current = true;
      setArrastrando(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    setX(Math.min(ANCHO_PANEL, Math.max(0, i.x0 + dx)));
  };
  const alSoltar = () => {
    if (!inicio.current) return;
    inicio.current = null;
    setArrastrando(false);
    setX((actual) => (actual > ANCHO_PANEL / 2 ? ANCHO_PANEL : 0));
  };

  // Un deslizamiento no debe abrir la inspección; con el panel abierto, tocar la tarjeta solo lo cierra.
  const alTocar = (e: React.MouseEvent) => {
    if (movio.current) {
      e.preventDefault();
      movio.current = false;
    } else if (abierta) {
      e.preventDefault();
      setX(0);
    }
  };

  const eliminar = async () => {
    setEliminando(true);
    setError(false);
    try {
      await onEliminar();
    } catch {
      setError(true);
      setEliminando(false);
    }
  };

  if (confirmando) {
    return (
      <div role="alertdialog" aria-label="Eliminar inspección" className="rounded-2xl border-[1.5px] border-bad bg-white p-4">
        <p className="text-lg font-semibold">¿Eliminar esta inspección?</p>
        <p className="mt-1 text-base text-sub">
          Se borran sus datos y fotos de este equipo. No se puede deshacer.
        </p>
        {error ? (
          <p role="alert" className="mt-2 text-sm font-medium text-bad">
            No se pudo eliminar. Intente de nuevo.
          </p>
        ) : null}
        <div className="mt-3 flex gap-3">
          <button
            type="button"
            onClick={() => void eliminar()}
            disabled={eliminando}
            className="min-h-12 flex-1 rounded-xl bg-bad px-4 text-base font-semibold text-white disabled:opacity-60"
          >
            {eliminando ? "Eliminando…" : "Sí, eliminar"}
          </button>
          <button
            type="button"
            onClick={() => {
              setConfirmando(false);
              setX(0);
            }}
            disabled={eliminando}
            className="min-h-12 rounded-xl border-[1.5px] border-graf px-4 text-base font-semibold"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl">
        <div
          aria-hidden={!abierta}
          className="absolute inset-y-0 left-0 flex items-center justify-center bg-bad"
          style={{ width: ANCHO_PANEL, opacity: x > 0 ? 1 : 0, transition: "opacity 160ms" }}
        >
          <button
            type="button"
            tabIndex={abierta ? 0 : -1}
            onClick={() => setConfirmando(true)}
            className="h-full w-full text-lg font-semibold text-white focus-visible:outline-3 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
          >
            Eliminar
          </button>
        </div>
        <div
          onPointerDown={alBajar}
          onPointerMove={alMover}
          onPointerUp={alSoltar}
          onPointerCancel={alSoltar}
          style={{
            transform: `translateX(${x}px)`,
            transition: arrastrando ? "none" : "transform 160ms ease-out",
            touchAction: "pan-y",
          }}
          className="relative"
        >
          <Link
            href={href}
            draggable={false}
            onClick={alTocar}
            className="block rounded-2xl border border-hair bg-white p-4 hover:border-graf focus-visible:outline-3 focus-visible:outline-cu"
          >
            {children}
          </Link>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="mt-1 min-h-11 rounded-lg px-3 text-sm font-semibold text-bad underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-cu"
      >
        Eliminar
      </button>
    </div>
  );
}
