import { z } from "zod";
import { ROLES, type Role, type Shift } from "@/lib/auth/roles";
import { DOMINIO_INTERNO, usuarioAEmail } from "@/lib/auth/usuario";

/**
 * Reglas de las cuentas que administra el administrador (crear, cambiar datos, contraseña y bloqueo). Aquí solo hay
 * validación y texto, sin base de datos, para poder probarlo.
 */
export const LARGO_MINIMO_CLAVE = 10;
/** bcrypt ignora lo que pase de 72 bytes. */
export const LARGO_MAXIMO_CLAVE = 72;

/** Duración que Supabase Auth entiende como bloqueo sin fecha de término (100 años). */
export const BLOQUEO_INDEFINIDO = "876000h";
export const SIN_BLOQUEO = "none";

/** Motivo por el que una contraseña no sirve, o null si cumple. */
export function problemaClave(clave: string): string | null {
  if (clave.length < LARGO_MINIMO_CLAVE) return `La contraseña debe tener al menos ${LARGO_MINIMO_CLAVE} caracteres.`;
  if (new TextEncoder().encode(clave).length > LARGO_MAXIMO_CLAVE) return `La contraseña no puede pasar de ${LARGO_MAXIMO_CLAVE} caracteres.`;
  if (clave !== clave.trim()) return "La contraseña no puede empezar ni terminar con un espacio.";
  if (!/\p{L}/u.test(clave) || !/\d/.test(clave)) return "La contraseña debe combinar letras y números.";
  return null;
}

/** Letras y números que no se confunden al dictarlos o copiarlos a mano (sin 0/O, 1/l/I). */
const ALFABETO_CLAVE = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

/**
 * Contraseña temporal de 14 caracteres. `aleatorio` entrega bytes al azar (`crypto.getRandomValues`); se descartan los
 * bytes que sesgarían el reparto y se repite hasta que tenga letras y números.
 */
export function generarClave(aleatorio: (n: number) => Uint8Array, largo = 14): string {
  const tope = 256 - (256 % ALFABETO_CLAVE.length);
  for (;;) {
    let clave = "";
    while (clave.length < largo) {
      for (const b of aleatorio(largo * 2)) {
        if (b < tope && clave.length < largo) clave += ALFABETO_CLAVE[b % ALFABETO_CLAVE.length];
      }
    }
    if (problemaClave(clave) === null) return clave;
  }
}

/** «tecnico_a@mlp.local» → «TECNICO_A». Un correo que no es interno se muestra tal cual. */
export function usuarioDeEmail(email: string | null | undefined): string {
  if (!email) return "";
  const [local, dominio] = email.split("@");
  return dominio === DOMINIO_INTERNO ? local.toUpperCase() : email;
}

/** ¿La cuenta tiene un bloqueo vigente? (`banned_until` de Supabase Auth). */
export function estaBloqueada(bannedUntil: string | null | undefined, ahora: Date): boolean {
  if (!bannedUntil) return false;
  const t = Date.parse(bannedUntil);
  return Number.isFinite(t) && t > ahora.getTime();
}

const rol = z.enum(ROLES as readonly [Role, ...Role[]]);
const turno = z.enum(["A", "B", ""]).transform((s): Shift | null => (s === "" ? null : s));
const nombre = z.string().trim().min(2, "Escriba el nombre de la cuenta.").max(80, "El nombre no puede pasar de 80 caracteres.");

/** Todos los roles salvo el administrador trabajan en un turno; el administrador no lleva turno. */
function conTurno<T extends { role: Role; shift: Shift | null }>(d: T, ctx: z.RefinementCtx) {
  if (d.role !== "admin" && d.shift === null) ctx.addIssue({ code: "custom", path: ["shift"], message: "Elija el turno (A o B)." });
}

export const esquemaDatosCuenta = z
  .object({ userId: z.string().uuid(), fullName: nombre, role: rol, shift: turno })
  .superRefine(conTurno)
  .transform((d) => ({ ...d, shift: d.role === "admin" ? null : d.shift }));

export const esquemaNuevaCuenta = z
  .object({
    usuario: z.string().trim().min(1, "Escriba el usuario."),
    fullName: nombre,
    role: rol,
    shift: turno,
    clave: z.string(),
  })
  .superRefine((d, ctx) => {
    conTurno(d, ctx);
    if (!usuarioAEmail(d.usuario)) {
      ctx.addIssue({ code: "custom", path: ["usuario"], message: "El usuario lleva de 2 a 39 letras, números, punto, guion o guion bajo (p. ej. TECNICO_C)." });
    }
    const p = problemaClave(d.clave);
    if (p) ctx.addIssue({ code: "custom", path: ["clave"], message: p });
  })
  .transform((d) => ({ ...d, shift: d.role === "admin" ? null : d.shift, email: usuarioAEmail(d.usuario) as string }));

export const esquemaClave = z
  .object({ userId: z.string().uuid(), clave: z.string() })
  .superRefine((d, ctx) => {
    const p = problemaClave(d.clave);
    if (p) ctx.addIssue({ code: "custom", path: ["clave"], message: p });
  });

/** Resultado de una acción de «Usuarios», para mostrarlo bajo el formulario. */
export type EstadoAccion = { ok: true; mensaje: string } | { ok: false; error: string } | undefined;
