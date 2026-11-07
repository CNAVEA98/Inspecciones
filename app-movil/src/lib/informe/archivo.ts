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
