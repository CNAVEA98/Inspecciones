// Parte pura de src/lib/offline/compress.ts de la web (2026-11-07). La compresión real está en `tecnico/photos.ts`.
export const MAX_SIDE = 1600;
export const JPEG_QUALITY = 0.7;

/** Escala (w, h) para que el lado mayor no pase de `max`, sin agrandar. */
export function fitWithin(w: number, h: number, max = MAX_SIDE): { width: number; height: number } {
  const k = Math.min(1, max / Math.max(w, h));
  return { width: Math.max(1, Math.round(w * k)), height: Math.max(1, Math.round(h * k)) };
}
