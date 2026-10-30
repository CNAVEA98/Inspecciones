/**
 * Páginas del técnico que deben abrir sin red. El service worker (`src/app/sw.ts`) las sirve desde
 * este caché cuando falla la red; aquí se llena al abrir la app con conexión.
 */
export const CACHE_PAGINAS = "mlp-paginas";

/**
 * La página del formulario es la misma para cualquier inspección (el contenido sale de Dexie), así que
 * todas comparten una sola copia. El `id` real se lee de la URL en el cliente.
 */
export const RUTA_FORMULARIO = "/tecnico/inspeccion/_";

export const esRutaFormulario = (pathname: string) => /^\/tecnico\/inspeccion\/[^/]+$/.test(pathname);

const PAGINAS = ["/tecnico", "/tecnico/nueva", RUTA_FORMULARIO];

/** Guarda las páginas del técnico para uso sin red. No guarda redirecciones (sesión vencida). */
export async function calentarPaginas(): Promise<void> {
  if (typeof caches === "undefined" || !navigator.onLine) return;
  const cache = await caches.open(CACHE_PAGINAS);
  await Promise.all(
    PAGINAS.map(async (ruta) => {
      try {
        const res = await fetch(ruta, { credentials: "same-origin", cache: "no-store" });
        if (res.ok && !res.redirected) await cache.put(ruta, res);
      } catch {
        // sin red o error del servidor: se intenta de nuevo en la próxima apertura
      }
    }),
  );
}

/** Al cerrar sesión: las páginas guardadas llevan el nombre del técnico y no deben verse en otra cuenta. */
export async function borrarPaginas(): Promise<void> {
  if (typeof caches === "undefined") return;
  await caches.delete(CACHE_PAGINAS);
}
