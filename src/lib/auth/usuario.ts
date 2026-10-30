/**
 * Las cuentas se identifican por «usuario» (TECNICO_A, SUPERVISOR_B…), no por correo, para que no parezcan
 * un correo real que se pueda prestar. Supabase Auth exige un correo: se arma uno interno y nunca se muestra.
 */
export const DOMINIO_INTERNO = "mlp.local";

/** Usuario → correo interno. No distingue mayúsculas. null si el usuario trae caracteres no permitidos. */
export function usuarioAEmail(usuario: string): string | null {
  const u = usuario.trim().toLowerCase();
  return /^[a-z0-9][a-z0-9._-]{1,38}$/.test(u) ? `${u}@${DOMINIO_INTERNO}` : null;
}
