/**
 * Ejecuta `fn` cuando el navegador queda ocioso (o a los `maxMs` como máximo). Safari no tiene requestIdleCallback:
 * ahí se usa un temporizador. Devuelve una función para cancelar.
 */
export function enReposo(fn: () => void, maxMs = 5000): () => void {
  if (typeof window === "undefined") return () => {};
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(fn, { timeout: maxMs });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(fn, Math.min(3000, maxMs));
  return () => clearTimeout(id);
}
