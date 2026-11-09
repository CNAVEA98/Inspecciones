import type { SupabaseClient } from "@supabase/supabase-js";
import { nuevoId } from "@/lib/id";
import type { EtapaFirma } from "./estado";

export type Decision = "approved" | "rejected";

/** PNG en base64 (con o sin el prefijo `data:image/png;base64,`) → bytes. */
export function base64ABytes(base64: string): Uint8Array {
  const limpio = base64.replace(/^data:[^,]*,/, "").replace(/\s+/g, "");
  const bin = atob(limpio);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/**
 * La inspección cambió de estado mientras se revisaba: otra persona ya la firmó (por ejemplo, la misma cuenta genérica en otro
 * teléfono). La base rechaza la segunda firma; la pantalla debe recargarse. Probado con dos teléfonos el 2026-11-09.
 */
export class FirmaDesactualizada extends Error {}

export const MENSAJE_DESACTUALIZADA =
  "Otra persona ya revisó esta inspección mientras usted la tenía abierta (puede ser la misma cuenta en otro teléfono). Su firma no se registró. La pantalla se actualizó con el estado actual.";

/** Textos del RPC `review_inspection` cuando el estado ya no admite esa firma (migración 0007). */
const ESTADO_CAMBIADO = /firma una inspecci[oó]n|inmutable|ya (fue )?firmada/i;

/** Mensajes comprensibles para los errores más comunes. */
export function mensajeFirma(detalle: string): string {
  if (ESTADO_CAMBIADO.test(detalle)) return MENSAJE_DESACTUALIZADA;
  if (/network|fetch|conexi|timeout/i.test(detalle)) return "Sin conexión. Revise su señal e intente de nuevo.";
  if (/permission|not authorized|policy|row-level/i.test(detalle)) return "Su cuenta no puede firmar esta inspección.";
  return detalle || "No se pudo registrar la firma.";
}

/**
 * Firma una etapa de revisión: sube la firma dibujada a Storage y llama al RPC `review_inspection` (la base exige el orden
 * supervisor → programador y el comentario al rechazar). La ruta es única por intento, así un reintento no choca con la
 * imagen ya subida. Lanza un Error con un mensaje apto para la pantalla.
 */
export async function firmarRevision(
  supabase: SupabaseClient,
  p: { inspeccionId: string; etapa: EtapaFirma; decision: Decision; comentario: string; pngBase64: string },
): Promise<void> {
  const comentario = p.comentario.trim();
  if (p.decision === "rejected" && !comentario) throw new Error("El comentario es obligatorio al rechazar.");
  try {
    const ruta = `${p.inspeccionId}/${p.etapa}-${nuevoId()}.png`;
    const subida = await supabase.storage
      .from("signatures")
      .upload(ruta, base64ABytes(p.pngBase64), { contentType: "image/png" });
    if (subida.error) throw new Error(`No se pudo subir la firma: ${subida.error.message}`);
    const { error } = await supabase.rpc("review_inspection", {
      p_id: p.inspeccionId,
      p_decision: p.decision,
      p_comment: comentario,
      p_signature_path: ruta,
    });
    if (error) throw new Error(error.message);
  } catch (e) {
    const detalle = e instanceof Error ? e.message : String(e);
    // La imagen ya subida queda sin usar (solo el administrador puede borrar en Storage).
    if (ESTADO_CAMBIADO.test(detalle)) throw new FirmaDesactualizada(MENSAJE_DESACTUALIZADA);
    throw new Error(mensajeFirma(detalle));
  }
}
