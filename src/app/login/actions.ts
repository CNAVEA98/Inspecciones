"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { homeFor, safeNext, type Role } from "@/lib/auth/roles";

export type FormState = { error?: string } | undefined;

const credenciales = z.object({
  email: z.string().trim().email("Ingrese un correo válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export async function iniciarSesion(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = credenciales.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return { error: "Correo o contraseña incorrectos" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
  const role = (profile?.role ?? "technician") as Role;
  const next = safeNext(String(formData.get("next") ?? ""));
  // Un destino de otra área se corrige por rol en el proxy.
  redirect(next ?? homeFor(role));
}

export async function cerrarSesion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
