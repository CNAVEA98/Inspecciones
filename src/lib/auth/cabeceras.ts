import { ROLES, SHIFTS, type Role, type Shift } from "./roles";

/**
 * Identidad verificada que el proxy (`src/proxy.ts`) entrega al resto del servidor en cabeceras internas de la
 * petición, para que layouts, páginas, acciones y rutas no vuelvan a consultar Supabase Auth y `profiles`.
 *
 * Seguridad: el proxy BORRA siempre estas cabeceras de la petición entrante y solo las escribe después de validar
 * el JWT (`getClaims`) y leer el perfil con la sesión del usuario. Un cliente no puede inyectarlas. Las consultas de
 * datos siguen pasando por RLS con la sesión real, así que estas cabeceras solo deciden qué pantalla mostrar.
 */
export const CABECERAS_SESION = {
  id: "x-mlp-user-id",
  email: "x-mlp-user-email",
  nombre: "x-mlp-user-name",
  rol: "x-mlp-user-role",
  turno: "x-mlp-user-shift",
} as const;

export interface IdentidadVerificada {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  shift: Shift | null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Quita las cabeceras de sesión que pudiera traer la petición (nunca se confía en las del cliente). */
export function limpiarCabeceras(h: Headers): void {
  for (const nombre of Object.values(CABECERAS_SESION)) h.delete(nombre);
}

/** Escribe la identidad verificada. Los textos van codificados (las cabeceras solo admiten ASCII). */
export function escribirCabeceras(h: Headers, s: IdentidadVerificada): void {
  h.set(CABECERAS_SESION.id, s.id);
  h.set(CABECERAS_SESION.email, encodeURIComponent(s.email));
  h.set(CABECERAS_SESION.nombre, encodeURIComponent(s.fullName));
  h.set(CABECERAS_SESION.rol, s.role);
  if (s.shift) h.set(CABECERAS_SESION.turno, s.shift);
}

const decodificar = (v: string) => {
  try {
    return decodeURIComponent(v);
  } catch {
    return null;
  }
};

/** Lee la identidad que dejó el proxy; null si falta o no es válida (entonces se consulta como antes). */
export function leerCabeceras(h: Pick<Headers, "get">): IdentidadVerificada | null {
  const id = h.get(CABECERAS_SESION.id);
  const rol = h.get(CABECERAS_SESION.rol);
  const turno = h.get(CABECERAS_SESION.turno);
  if (!id || !UUID.test(id) || !rol || !(ROLES as readonly string[]).includes(rol)) return null;
  if (turno !== null && !(SHIFTS as readonly string[]).includes(turno)) return null;
  const email = decodificar(h.get(CABECERAS_SESION.email) ?? "");
  const nombre = decodificar(h.get(CABECERAS_SESION.nombre) ?? "");
  if (email === null || nombre === null) return null;
  return { id, email, fullName: nombre || email || "Usuario", role: rol as Role, shift: (turno as Shift | null) ?? null };
}
