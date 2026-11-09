import { esErrorDeRed } from "@/lib/offline/errores";

/** Sin señal no se puede validar la contraseña: el primer ingreso de cada teléfono necesita señal. */
export const MENSAJE_INGRESO_SIN_SENAL =
  "Sin señal no se puede ingresar: la contraseña la valida el servidor. Ingrese una vez con señal (por ejemplo, en la base antes de salir a terreno). Después puede trabajar sin señal mientras no cierre sesión.";

interface ErrorIngreso {
  name?: string;
  message?: string;
  status?: number;
  code?: string;
}

/**
 * Mensaje para un ingreso fallido. Un error de conexión NO es «contraseña incorrecta»: al abrir la app en frío sin señal, la
 * app todavía no sabe que no hay red, intenta ingresar y Supabase devuelve `AuthRetryableFetchError` (status 0). Mostrar
 * «incorrectos» haría creer al técnico que se equivocó de clave (visto en el emulador en modo avión, 2026-11-09).
 */
export function mensajeErrorIngreso(e: unknown): string {
  const o = (e && typeof e === "object" ? e : {}) as ErrorIngreso;
  if (e instanceof TypeError || o.name === "AuthRetryableFetchError" || esErrorDeRed({ message: o.message, status: o.status })) {
    return MENSAJE_INGRESO_SIN_SENAL;
  }
  if (typeof o.status === "number" && o.status >= 500) return "El servidor no respondió. Intente de nuevo en unos minutos.";
  return "Usuario o contraseña incorrectos";
}
