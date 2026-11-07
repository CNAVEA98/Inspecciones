// Utilidades puras de rutas de archivos locales (sin módulos nativos, para poder probarlas con Vitest).

/** Nombre del archivo al final de una ruta o URI (`file:///…/fotos/abc.jpg` → `abc.jpg`). */
export function nombreDeRuta(uri: string): string {
  const limpio = uri.split(/[?#]/)[0];
  return limpio.slice(limpio.lastIndexOf("/") + 1);
}

/**
 * Reubica un archivo guardado en la carpeta de fotos vigente. En iOS la ruta absoluta del contenedor de la app puede cambiar
 * al actualizar o reinstalar; si se guardara tal cual, las fotos de borradores y de la cola quedarían apuntando a la nada.
 * `carpeta` es la URI de la carpeta actual (con o sin barra final).
 */
export function reubicarUri(uri: string, carpeta: string): string {
  const nombre = nombreDeRuta(uri);
  if (!nombre) return uri;
  return `${carpeta.replace(/\/+$/, "")}/${nombre}`;
}
