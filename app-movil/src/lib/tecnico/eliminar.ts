// Port de src/lib/tecnico/eliminar.ts de la web (2026-11-07), sobre `Almacen`.
import type { Almacen } from "@/lib/offline/almacen";

/**
 * Elimina un borrador que todavía no se envió (p. ej. uno abierto sin querer), con sus fotos y firmas del teléfono.
 * Solo borra lo local: un borrador no existe en el servidor hasta que se envía. Una inspección en cola o ya
 * enviada no se puede eliminar desde aquí. -> true si se eliminó.
 */
export async function eliminarBorrador(almacen: Almacen, id: string): Promise<boolean> {
  return almacen.transaccion(async () => {
    const draft = await almacen.obtenerBorrador(id);
    if (!draft || draft.state !== "draft") return false;
    const fotos = await almacen.fotosDeInspeccion(id);
    await almacen.eliminarFotos(fotos.map((f) => f.id));
    await almacen.eliminarBorrador(id);
    return true;
  });
}

/**
 * Descarta una inspección en cola que el servidor rechazó sin posibilidad de reintento (p. ej. una corrección duplicada):
 * borra la entrada de la cola, el borrador y sus fotos del teléfono. Solo si la cola la marcó «failed». -> true si se descartó.
 */
export async function descartarEnvioFallido(almacen: Almacen, id: string): Promise<boolean> {
  return almacen.transaccion(async () => {
    const salida = await almacen.obtenerSalida(id);
    if (!salida || salida.status !== "failed") return false;
    const fotos = await almacen.fotosDeInspeccion(id);
    await almacen.eliminarFotos(fotos.map((f) => f.id));
    await almacen.eliminarSalida(id);
    await almacen.eliminarBorrador(id);
    return true;
  });
}

/** Días que se conservan las fotos y firmas de una inspección ya enviada (para generar su PDF sin señal). */
export const DIAS_FOTOS_ENVIADAS = 14;

/**
 * Libera el espacio de las fotos y firmas de las inspecciones enviadas hace más de `dias` días (el informe oficial sigue en el
 * servidor). No toca borradores ni inspecciones en cola. -> cantidad de inspecciones limpiadas.
 */
export async function limpiarFotosEnviadas(
  almacen: Almacen,
  technicianId: string,
  dias = DIAS_FOTOS_ENVIADAS,
  ahora = Date.now(),
): Promise<number> {
  const limite = ahora - dias * 24 * 60 * 60 * 1000;
  let limpiadas = 0;
  for (const d of await almacen.listarBorradores(technicianId)) {
    if (d.state !== "sent" || d.updatedAt >= limite) continue;
    const fotos = await almacen.fotosDeInspeccion(d.id);
    if (fotos.length === 0) continue;
    await almacen.eliminarFotos(fotos.map((f) => f.id));
    limpiadas++;
  }
  return limpiadas;
}
