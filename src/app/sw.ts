// Tipos de service worker: se revisa con tsconfig.sw.json (el tsconfig principal usa los tipos del DOM).
import { NetworkFirst, Serwist, type PrecacheEntry, type RuntimeCaching, type SerwistGlobalConfig, type SerwistPlugin } from "serwist";
import { CACHE_PAGINAS, RUTA_FORMULARIO, esRutaFormulario } from "../lib/offline/paginas";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const pagina: SerwistPlugin = {
  // Todas las inspecciones comparten una sola copia de la página del formulario.
  cacheKeyWillBeUsed: async ({ request }) => {
    const url = new URL(request.url);
    return esRutaFormulario(url.pathname) ? new Request(new URL(RUTA_FORMULARIO, url).href) : request;
  },
  // Una navegación no puede responderse con una redirección guardada: no se guarda ninguna.
  cacheWillUpdate: async ({ response }) => (response.redirected ? null : response),
  // Sin red y sin copia de la página pedida: se abre el inicio del técnico.
  handlerDidError: async () => {
    const cache = await caches.open(CACHE_PAGINAS);
    return cache.match("/tecnico", { ignoreVary: true });
  },
};

const runtimeCaching: RuntimeCaching[] = [
  {
    // Solo el área del técnico se guarda para uso sin red; el resto de la app necesita conexión.
    matcher: ({ request, url }) =>
      request.mode === "navigate" &&
      (url.pathname === "/tecnico" || url.pathname.startsWith("/tecnico/")) &&
      // El PDF se genera en el servidor y no se guarda ni se reemplaza por una página sin red.
      !url.pathname.endsWith("/pdf"),
    handler: new NetworkFirst({
      cacheName: CACHE_PAGINAS,
      // Con señal mala se prefiere la copia local a esperar.
      networkTimeoutSeconds: 4,
      matchOptions: { ignoreVary: true },
      plugins: [pagina],
    }),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  disableDevLogs: true,
  runtimeCaching,
});

serwist.addEventListeners();
