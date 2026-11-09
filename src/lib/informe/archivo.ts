import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseEnv } from "@/lib/env";

/**
 * PDF oficial archivado (pendiente 4, decisión de Cristóbal del 2026-11-09).
 *
 * Al aprobarse una inspección (firma del programador) su PDF se guarda una sola vez en el bucket privado `reports`,
 * ruta `{inspection_id}/{folio}.pdf`, y desde ahí toda descarga de una inspección aprobada entrega esa misma copia.
 * Solo escribe el servidor, con la clave de servicio: ningún usuario tiene política de escritura en `reports`, así que
 * nadie puede subir un PDF armado a mano. Tampoco hay políticas de update ni delete: la copia no se reemplaza.
 * Quién puede ver la inspección lo decide antes la lectura con la sesión del usuario (RLS); la clave de servicio se usa
 * solo para leer y escribir el archivo.
 */
export const BUCKET_INFORMES = "reports";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FOLIO = /^INS-\d{4}-\d{6}$/;

/** `{inspection_id}/{folio}.pdf`, o `null` si el id o el folio no tienen la forma esperada. */
export function rutaInforme(inspeccionId: string, folio: string | null | undefined): string | null {
  if (!UUID.test(inspeccionId) || !folio || !FOLIO.test(folio)) return null;
  return `${inspeccionId.toLowerCase()}/${folio}.pdf`;
}

/** Lectura y escritura del archivo; se separa para probar la lógica sin Supabase. */
export interface AlmacenInformes {
  /** Bytes del archivo, o `null` si no existe (o no se pudo leer). */
  leer(ruta: string): Promise<Uint8Array | null>;
  /** Sube sin reemplazar. `"existe"` si otro proceso ya lo guardó. Lanza un Error si falla por otro motivo. */
  guardar(ruta: string, bytes: Uint8Array): Promise<"guardado" | "existe">;
}

export type OrigenInforme = "archivo" | "nuevo" | "sin-archivar";

/**
 * Devuelve la copia archivada; si no existe, genera el PDF, lo guarda y lo devuelve. Si dos peticiones llegan a la vez,
 * gana la primera que sube y la otra entrega esa misma copia. Si el almacenamiento falla, entrega el PDF recién generado
 * (`"sin-archivar"`) para no dejar al usuario sin informe; se reintenta en la próxima descarga.
 */
export async function obtenerOArchivar(
  ruta: string,
  generar: () => Promise<Uint8Array>,
  almacen: AlmacenInformes,
): Promise<{ bytes: Uint8Array; origen: OrigenInforme }> {
  const guardado = await almacen.leer(ruta);
  if (guardado && guardado.length > 0) return { bytes: guardado, origen: "archivo" };

  const bytes = await generar();
  try {
    const r = await almacen.guardar(ruta, bytes);
    if (r === "existe") {
      const otro = await almacen.leer(ruta);
      if (otro && otro.length > 0) return { bytes: otro, origen: "archivo" };
    }
    return { bytes, origen: r === "guardado" ? "nuevo" : "sin-archivar" };
  } catch (e) {
    console.error(`[informe] No se pudo archivar ${ruta}:`, e instanceof Error ? e.message : e);
    return { bytes, origen: "sin-archivar" };
  }
}

/**
 * Cliente con la clave de servicio, solo para el servidor. `null` si `SUPABASE_SERVICE_ROLE_KEY` no está definida
 * (entonces el PDF se sigue generando al vuelo, sin archivar). Nunca lleva `NEXT_PUBLIC_`.
 */
export function clienteServicio(): SupabaseClient | null {
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!clave) return null;
  const { url } = supabaseEnv();
  return createClient(url, clave, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

/** Almacén sobre el bucket `reports` de Supabase Storage. */
export function almacenSupabase(supabase: SupabaseClient): AlmacenInformes {
  const bucket = () => supabase.storage.from(BUCKET_INFORMES);
  return {
    async leer(ruta) {
      const { data, error } = await bucket().download(ruta);
      if (error || !data) return null;
      return new Uint8Array(await data.arrayBuffer());
    },
    async guardar(ruta, bytes) {
      const { error } = await bucket().upload(ruta, bytes, { contentType: "application/pdf", upsert: false });
      if (!error) return "guardado";
      if (esDuplicado(error)) return "existe";
      throw new Error(error.message);
    },
  };
}

/** Storage responde «The resource already exists» (409) al subir sin `upsert` sobre un archivo existente. */
function esDuplicado(error: { message?: string; statusCode?: string | number; status?: number }): boolean {
  const codigo = String(error.statusCode ?? error.status ?? "");
  return codigo === "409" || /already exists|duplicate/i.test(error.message ?? "");
}
