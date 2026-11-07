/**
 * Nombre de archivo seguro para guardar y compartir un PDF en el teléfono. iOS guarda las tildes descompuestas («o» + acento
 * suelto, `%CC%81` en la ruta) y después la hoja de compartir no encontraba el archivo («You don't have access to the provided file»).
 * Se quitan las tildes y los caracteres que los sistemas de archivos no aceptan, y se garantiza la extensión `.pdf`.
 */
export function nombreSeguro(nombre: string, porDefecto = "Informe.pdf"): string {
  const base = nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 ._()-]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\.pdf$/i, "")
    .trim()
    .slice(0, 120)
    .trim();
  return `${base || porDefecto.replace(/\.pdf$/i, "")}.pdf`;
}

/**
 * Nombre de archivo que declara el servidor en `Content-Disposition` (prefiere `filename*=UTF-8''…`, con tildes, y si no `filename="…"`).
 * Devuelve null si no hay cabecera o no trae nombre.
 */
export function nombreDeContentDisposition(cabecera: string | null | undefined): string | null {
  if (!cabecera) return null;
  const utf8 = cabecera.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)?.[1];
  if (utf8) {
    try {
      return decodeURIComponent(utf8.trim());
    } catch {
      // cae al nombre simple
    }
  }
  const simple = cabecera.match(/filename\s*=\s*"([^"]+)"/i)?.[1] ?? cabecera.match(/filename\s*=\s*([^;]+)/i)?.[1];
  return simple ? simple.trim() : null;
}
