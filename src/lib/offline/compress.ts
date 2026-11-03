export const MAX_SIDE = 1600;
export const JPEG_QUALITY = 0.7;

/** Escala (w, h) para que el lado mayor no pase de `max`, sin agrandar. */
export function fitWithin(w: number, h: number, max = MAX_SIDE): { width: number; height: number } {
  const k = Math.min(1, max / Math.max(w, h));
  return { width: Math.max(1, Math.round(w * k)), height: Math.max(1, Math.round(h * k)) };
}

/**
 * Comprime una foto en el cliente (JPEG, lado mayor 1600 px) antes de guardarla o subirla. Solo navegador.
 * Siempre devuelve la imagen redibujada: al pasar por el canvas se pierden los metadatos EXIF (ubicación GPS, modelo
 * del teléfono, fecha), que la app no necesita. Antes, si el original pesaba menos se conservaba con sus metadatos.
 */
export async function compressImage(file: Blob, max = MAX_SIDE, quality = JPEG_QUALITY): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const { width, height } = fitWithin(bitmap.width, bitmap.height, max);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo procesar la imagen");
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob) throw new Error("No se pudo comprimir la imagen");
    return blob;
  } finally {
    bitmap.close();
  }
}
