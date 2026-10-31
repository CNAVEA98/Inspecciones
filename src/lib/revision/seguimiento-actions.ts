"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const entrada = z.object({
  findingId: z.string().uuid(),
  scope: z.enum(["bbosch", "terceros"]),
  sapNotice: z.string().trim().max(20, "El N.º de aviso admite hasta 20 caracteres."),
  channelNote: z.string().trim().max(300, "La nota admite hasta 300 caracteres."),
});

export type ResultadoSeguimiento = { ok: true } | { ok: false; error: string };

/**
 * Registra el seguimiento de un hallazgo: N.º de aviso subsecuente (alcance Bbosch) o nota de canalización con MLP
 * (alcance terceros). Solo supervisor y administrador; lo exigen también el RPC y la base de datos. No toca las firmas.
 */
export async function guardarSeguimiento(datos: z.input<typeof entrada>): Promise<ResultadoSeguimiento> {
  const session = await getSession();
  if (!session || (session.role !== "supervisor" && session.role !== "admin")) {
    return { ok: false, error: "Solo la Supervisión registra el seguimiento de hallazgos." };
  }
  const parsed = entrada.safeParse(datos);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_finding_followup", {
    p_finding: parsed.data.findingId,
    p_scope: parsed.data.scope,
    p_sap_notice: parsed.data.sapNotice,
    p_channel_note: parsed.data.channelNote,
  });
  if (error) return { ok: false, error: `No se pudo guardar: ${error.message}` };

  for (const area of ["/supervisor", "/admin", "/planificador"]) revalidatePath(area, "layout");
  return { ok: true };
}
