"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { aPayloadBD, nuevoFormatoSchema } from "./nuevo";

export type ResultadoCrear = { ok: true; id: string } | { ok: false; error: string };

/**
 * Crea un formato nuevo copiando el contenido vigente de otro del mismo tipo. Supervisor o administrador; la función
 * `crear_formato` de la base vuelve a validar todo y hace las tres inserciones en una transacción.
 */
export async function crearFormato(input: unknown): Promise<ResultadoCrear> {
  const session = await getSession();
  if (session?.role !== "admin" && session?.role !== "supervisor") return { ok: false, error: "Solo un supervisor o un administrador puede crear formatos" };
  const p = nuevoFormatoSchema.safeParse(input);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("crear_formato", { p: aPayloadBD(p.data) });
  if (error) return { ok: false, error: error.message };

  for (const base of ["/admin", "/supervisor", "/planificador"]) revalidatePath(`${base}/formatos`);
  return { ok: true, id: data as string };
}
