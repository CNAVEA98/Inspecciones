import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { leerCabeceras } from "./cabeceras";
import { homeFor, type Role, type Shift } from "./roles";

export interface SessionProfile {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  shift: Shift | null;
}

/**
 * Usuario verificado + perfil (el rol viene de la tabla profiles, nunca del cliente).
 * Normalmente lo trae el proxy en cabeceras internas ya verificadas (sin volver a consultar Supabase); si faltan
 * (p. ej. una ruta fuera del matcher del proxy), se consulta como siempre.
 */
export const getSession = cache(async (): Promise<SessionProfile | null> => {
  const delProxy = leerCabeceras(await headers());
  if (delProxy) return delProxy;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, shift")
    .eq("id", user.id)
    .single();
  if (!profile) return null;
  return {
    id: user.id,
    email: user.email ?? "",
    fullName: profile.full_name || user.email || "Usuario",
    role: profile.role as Role,
    shift: (profile.shift as Shift | null) ?? null,
  };
});

/** Barrera de autorización de los layouts: segunda línea tras el proxy, antes de RLS. */
export async function requireRole(role: Role): Promise<SessionProfile> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== role) redirect(homeFor(session.role));
  return session;
}
