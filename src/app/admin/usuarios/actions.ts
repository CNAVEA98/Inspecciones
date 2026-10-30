"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";

const entrada = z.object({
  userId: z.string().uuid(),
  role: z.enum(["admin", "supervisor", "planner", "technician"]),
  shift: z.enum(["A", "B", ""]).transform((s) => (s === "" ? null : s)),
});

/**
 * Asigna rol y turno. Solo un administrador puede hacerlo: lo exigen esta barrera, la policy de RLS
 * y el trigger guard_profile_role en la base de datos.
 */
export async function actualizarUsuario(formData: FormData) {
  const session = await requireRole("admin");
  const parsed = entrada.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
    shift: formData.get("shift") ?? "",
  });
  if (!parsed.success) return;
  // Evita que el administrador se quite el acceso a sí mismo y deje el sistema sin administradores.
  if (parsed.data.userId === session.id) return;
  // Todos los roles salvo el administrador trabajan en un turno.
  if (parsed.data.role !== "admin" && parsed.data.shift === null) return;

  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ role: parsed.data.role, shift: parsed.data.role === "admin" ? null : parsed.data.shift })
    .eq("id", parsed.data.userId);
  revalidatePath("/admin/usuarios");
}
