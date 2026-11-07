import { TransportError } from "./outbox";

interface ErrorLike {
  code?: string;
  message?: string;
  status?: number;
}

/** Mensajes con los que `fetch` (iOS, Android y Supabase) avisa que no hubo respuesta del servidor. */
const PATRON_RED = /network request failed|failed to fetch|network error|networkerror|timed? ?out|timeout|offline|internet|connection (was )?(lost|closed|reset|refused)|no se pudo conectar|unable to resolve host/i;

/** True si el fallo es de conectividad (no llegó una respuesta del servidor): no debe gastar intentos de la cola. */
export function esErrorDeRed(e: unknown): boolean {
  if (e instanceof TypeError) return true;
  if (!e || typeof e !== "object") return false;
  const o = e as ErrorLike;
  if (o.code) return false; // PostgREST/Postgres respondieron: no es un problema de red
  if (o.status !== undefined && o.status !== 0) return false; // hubo respuesta HTTP
  return PATRON_RED.test(o.message ?? "");
}

/** Errores que no mejoran reintentando: datos inválidos o sin permiso. El resto se reintenta. */
export function aTransportError(e: unknown): TransportError {
  const o = (e && typeof e === "object" ? e : {}) as ErrorLike;
  const mensaje = o.message || (e instanceof Error ? e.message : "") || "Sin conexión";
  if (esErrorDeRed(e)) return new TransportError(mensaje, true, true);
  const code = o.code ?? "";
  const permanente =
    code === "42501" || // sin permiso / transición no permitida
    code.startsWith("22") || // datos inválidos
    code.startsWith("23") || // violación de restricción
    code === "P0001"; // RAISE EXCEPTION de las reglas del servidor
  return new TransportError(mensaje, !permanente);
}
