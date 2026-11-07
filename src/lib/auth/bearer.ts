/**
 * Token de acceso de la app móvil: cabecera `Authorization: Bearer <jwt>`. Devuelve null si falta o no tiene la forma
 * de un JWT (tres partes en base64url), sin validar la firma: eso lo hace Supabase al consultar al usuario.
 */
export function leerBearer(cabecera: string | null): string | null {
  const m = /^Bearer\s+([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)\s*$/i.exec(cabecera ?? "");
  return m ? m[1] : null;
}
