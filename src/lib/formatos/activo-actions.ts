"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type ResultadoActivo = { ok: true; activo: boolean } | { ok: false; error: string };

const entrada = z.object({ formatoId: z.string().regex(/^(INSP|MANT)-\d{2,3}$/), activo: z.boolean() });

/**
 * Desactiva o reactiva un formato. Solo el administrador (lo exige también la policy `formatos_write`).
 * Desactivar no borra nada: el formato deja de ofrecerse al técnico, pero sus inspecciones, PDF y versiones siguen
 * intactos, y los borradores ya empezados se pueden terminar.
 */
export async function cambiarActivo(input: z.input<typeof entrada>): Promise<ResultadoActivo> {
  const session = await getSession();
  if (session?.role !== "admin") return { ok: false, error: "Solo un administrador puede activar o desactivar formatos" };
  const p = entrada.safeParse(input);
  if (!p.success) return { ok: false, error: "Datos inválidos" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("formatos")
    .update({ activo: p.data.activo })
    .eq("id", p.data.formatoId)
    .select("activo")
    .maybeSingle();
  if (error) return { ok: false, error: `No se pudo guardar: ${error.message}` };
  if (!data) return { ok: false, error: "Formato no encontrado o sin permiso" };

  for (const base of ["/admin", "/supervisor", "/planificador"]) {
    revalidatePath(`${base}/formatos`);
    revalidatePath(`${base}/formatos/${p.data.formatoId}`);
  }
  return { ok: true, activo: data.activo as boolean };
}
