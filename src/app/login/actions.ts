"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { homeFor, safeNext, type Role } from "@/lib/auth/roles";
import { usuarioAEmail } from "@/lib/auth/usuario";

/** `usuario` se devuelve para no obligar a escribirlo de nuevo tras un error. */
export type FormState = { error?: string; usuario?: string } | undefined;

const credenciales = z.object({
  usuario: z.string().trim().min(1, "Ingrese su usuario"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export async function iniciarSesion(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = credenciales.safeParse({
    usuario: formData.get("usuario"),
    password: formData.get("password"),
  });
  const usuario = String(formData.get("usuario") ?? "").trim();
  if (!parsed.success) return { error: parsed.error.issues[0].message, usuario };

  const email = usuarioAEmail(parsed.data.usuario);
  if (!email) return { error: "Usuario o contraseña incorrectos", usuario };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: parsed.data.password });
  if (error || !data.user) return { error: "Usuario o contraseña incorrectos", usuario };

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
