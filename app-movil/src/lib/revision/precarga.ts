import type { SupabaseClient } from "@supabase/supabase-js";
import { Image } from "expo-image";
import { claveDetalle, guardarCopia, leerCopia, type Kv } from "./cache";
import type { DetalleInspeccion, FilaBandeja } from "./queries";
import { obtenerDetalle } from "./servidor";

/** Cuántos detalles se dejan listos para revisar sin señal cada vez que se abre la bandeja con señal. */
export const MAX_PRECARGA = 20;

/** Baja al disco las fotos y firmas del detalle para que se vean sin señal (expo-image las busca por la misma URL). */
export async function precargarImagenes(d: DetalleInspeccion): Promise<void> {
  const urls = [...d.adjuntos.map((a) => a.url), ...d.firmas.map((f) => f.url)].filter((u): u is string => !!u);
  if (urls.length === 0) return;
  try {
    await Image.prefetch(urls, "disk");
  } catch {
    // se verán con señal
  }
}

/**
 * Deja guardado en el teléfono el detalle (y sus fotos) de las primeras inspecciones de la bandeja, para poder revisarlas sin
 * señal. Salta las que ya tienen copia con el mismo estado. Es de mejor esfuerzo: se detiene al primer error de red.
 */
export async function precargarDetalles(supabase: SupabaseClient, kv: Kv, userId: string, filas: FilaBandeja[]): Promise<number> {
  let n = 0;
  for (const f of filas.slice(0, MAX_PRECARGA)) {
    const clave = claveDetalle(userId, f.id);
    const copia = await leerCopia<DetalleInspeccion>(kv, clave);
    if (copia && copia.datos.status === f.status) continue;
    try {
      const d = await obtenerDetalle(supabase, f.id);
      if (!d) continue;
      await guardarCopia(kv, clave, d);
      await precargarImagenes(d);
      n++;
    } catch {
      break;
    }
  }
  return n;
}
