import type { SupabaseClient } from "@supabase/supabase-js";
import type { Role, Shift } from "@/lib/auth/roles";
import { clienteServicio } from "@/lib/informe/archivo";
import { createClient } from "@/lib/supabase/server";
import { estaBloqueada, usuarioDeEmail } from "./cuentas";

/**
 * Lectura de las cuentas para «Usuarios» (solo servidor). El perfil (nombre, rol, turno) se lee con la sesión del
 * administrador y pasa por RLS; el usuario, el último ingreso y el bloqueo viven en Supabase Auth y solo se pueden leer
 * con la clave de servicio. Quien llama debe haber exigido antes `requireRole("admin")`.
 */
export interface Cuenta {
  id: string;
  fullName: string;
  role: Role;
  shift: Shift | null;
  createdAt: string | null;
  /** «TECNICO_A»; "" si no hay clave de servicio para leerlo. */
  usuario: string;
  ultimoIngreso: string | null;
  bloqueada: boolean;
}

export interface ListaCuentas {
  cuentas: Cuenta[];
  /** false si falta `SUPABASE_SERVICE_ROLE_KEY`: se ven los perfiles, pero no se puede crear, bloquear ni cambiar claves. */
  conServicio: boolean;
}

interface DatosAuth {
  usuario: string;
  ultimoIngreso: string | null;
  bloqueada: boolean;
}

const aDatosAuth = (u: { email?: string | null; last_sign_in_at?: string | null; banned_until?: string | null }, ahora: Date): DatosAuth => ({
  usuario: usuarioDeEmail(u.email),
  ultimoIngreso: u.last_sign_in_at ?? null,
  bloqueada: estaBloqueada(u.banned_until, ahora),
});

/** Todas las cuentas de Supabase Auth, por páginas (la API entrega como máximo 1.000 por llamada). */
async function leerAuth(servicio: SupabaseClient, ahora: Date): Promise<Map<string, DatosAuth>> {
  const mapa = new Map<string, DatosAuth>();
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await servicio.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`No se pudieron leer las cuentas: ${error.message}`);
    for (const u of data.users) mapa.set(u.id, aDatosAuth(u as Parameters<typeof aDatosAuth>[0], ahora));
    if (data.users.length < 1000) break;
  }
  return mapa;
}

const ORDEN_ROL: Record<Role, number> = { admin: 0, supervisor: 1, planner: 2, technician: 3 };

interface FilaPerfil {
  id: string;
  full_name: string | null;
  role: string;
  shift: string | null;
  created_at: string | null;
}

const aCuenta = (p: FilaPerfil, a: DatosAuth | undefined): Cuenta => ({
  id: p.id,
  fullName: p.full_name || "Sin nombre",
  role: p.role as Role,
  shift: p.shift === "A" || p.shift === "B" ? p.shift : null,
  createdAt: p.created_at,
  usuario: a?.usuario ?? "",
  ultimoIngreso: a?.ultimoIngreso ?? null,
  bloqueada: a?.bloqueada ?? false,
});

export async function listarCuentas(): Promise<ListaCuentas> {
  const supabase = await createClient();
  const servicio = clienteServicio();
  const ahora = new Date();
  const [perfiles, auth] = await Promise.all([
    supabase.from("profiles").select("id, full_name, role, shift, created_at").order("created_at").order("id").limit(1000),
    servicio ? leerAuth(servicio, ahora) : Promise.resolve(null),
  ]);
  if (perfiles.error) throw new Error(`No se pudieron leer los perfiles: ${perfiles.error.message}`);
  const cuentas = ((perfiles.data ?? []) as FilaPerfil[])
    .map((p) => aCuenta(p, auth?.get(p.id)))
    .sort(
      (a, b) =>
        ORDEN_ROL[a.role] - ORDEN_ROL[b.role] ||
        (a.shift ?? "").localeCompare(b.shift ?? "") ||
        (a.usuario || a.fullName).localeCompare(b.usuario || b.fullName, "es"),
    );
  return { cuentas, conServicio: auth !== null };
}

/** Una cuenta, o null si no existe. */
export async function leerCuenta(id: string): Promise<{ cuenta: Cuenta; conServicio: boolean } | null> {
  const supabase = await createClient();
  const servicio = clienteServicio();
  const [perfil, auth] = await Promise.all([
    supabase.from("profiles").select("id, full_name, role, shift, created_at").eq("id", id).maybeSingle(),
    servicio ? servicio.auth.admin.getUserById(id) : Promise.resolve(null),
  ]);
  if (perfil.error) throw new Error(`No se pudo leer la cuenta: ${perfil.error.message}`);
  if (!perfil.data) return null;
  const u = auth && !auth.error ? auth.data.user : null;
  return {
    cuenta: aCuenta(perfil.data as FilaPerfil, u ? aDatosAuth(u as Parameters<typeof aDatosAuth>[0], new Date()) : undefined),
    conServicio: servicio !== null,
  };
}
