import type { Almacen } from "./almacen";
import { processOutbox, type Transport } from "./outbox";

export type ResultadoEnvio = "exito" | "fallo";

/**
 * Lo que hace la tarea en segundo plano: si hay inspecciones en la cola, intenta enviarlas. Es la misma `processOutbox` de la app abierta
 * (idempotente: reintentar una inspección ya enviada no la duplica, y una pasada simultánea con la app abierta no envía dos veces).
 * «fallo» solo significa que algo inesperado rompió la tarea; un envío que no pasó por falta de señal NO es un fallo: queda pendiente.
 */
export async function ejecutarEnvio(almacen: Almacen, transport: Transport): Promise<ResultadoEnvio> {
  try {
    if ((await almacen.listarSalidas()).length === 0) return "exito"; // nada que enviar: no se gasta batería ni red
    await processOutbox(almacen, transport);
    return "exito";
  } catch {
    return "fallo";
  }
}
