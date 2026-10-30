"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";

const entrada = z.array(z.string().uuid()).min(1).max(200);

export type ResultadoEliminar = { ok: true; eliminadas: number; avisoArchivos?: string } | { ok: false; error: string };

/**
 * Elimina inspecciones. Solo un administrador: lo exigen esta barrera, el RPC `delete_inspections`
 * y los guards de la base de datos. La copia de cada fila queda en `audit_log`.
 */
export async function eliminarInspecciones(ids: string[]): Promise<ResultadoEliminar> {
  await requireRole("admin");
  const parsed = entrada.safeParse(ids);
  if (!parsed.success) return { ok: false, error: "Seleccione entre 1 y 200 inspecciones." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("delete_inspections", { p_ids: parsed.data });
  if (error) return { ok: false, error: `No se pudo eliminar: ${error.message}` };

  const r = data as { eliminadas: number; fotos: string[]; firmas: string[] };

  // Los archivos se borran después de las filas: si falla, quedan huérfanos pero no hay datos a medias.
  let avisoArchivos: string | undefined;
  const borrar = async (bucket: "inspection-photos" | "signatures", rutas: string[]) => {
    if (rutas.length === 0) return;
    const { error: e } = await supabase.storage.from(bucket).remove(rutas);
    if (e) avisoArchivos = `Las inspecciones se eliminaron, pero no se pudieron borrar algunos archivos (${e.message}).`;
  };
  await borrar("inspection-photos", r.fotos);
  await borrar("signatures", r.firmas);

  revalidatePath("/admin");
  revalidatePath("/supervisor");
  revalidatePath("/planificador");
  return { ok: true, eliminadas: r.eliminadas, avisoArchivos };
}
