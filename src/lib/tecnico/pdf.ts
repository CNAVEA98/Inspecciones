/**
 * Utilidades del visor de PDF del técnico (sin dependencias del navegador, para poder probarlas).
 */

/** Nombre del archivo desde `Content-Disposition` (prefiere `filename*` en UTF-8). */
export function nombreDesdeDisposition(cabecera: string | null, porDefecto = "Informe.pdf"): string {
  if (!cabecera) return porDefecto;
  const utf8 = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(cabecera);
  if (utf8) {
    try {
      const n = decodeURIComponent(utf8[1].trim());
      if (n) return n;
    } catch {
      // nombre mal codificado: se prueba con el simple
    }
  }
  const simple = /filename\s*=\s*"([^"]*)"/i.exec(cabecera) ?? /filename\s*=\s*([^;]+)/i.exec(cabecera);
  const n = simple?.[1].trim();
  return n || porDefecto;
}

/**
 * iPhone y iPad (también el iPad que se presenta como Mac). En iOS, descargar un archivo desde la app instalada
 * puede dejar el PDF a pantalla completa sin salida; ahí «Guardar» usa la hoja de compartir («Guardar en Archivos»).
 */
export function esIos(userAgent: string, platform: string, maxTouchPoints: number): boolean {
  return /iPad|iPhone|iPod/.test(userAgent) || (platform === "MacIntel" && maxTouchPoints > 1);
}
