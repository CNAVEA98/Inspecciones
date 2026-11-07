import type { Almacen } from "@/lib/offline/almacen";

const clave = (userId: string) => `ejecutor:${userId}`;

/**
 * Último nombre escrito en «Realizada por» en este teléfono. Las cuentas se comparten por turno y cada técnico escribe su nombre en cada
 * inspección: se precarga el último para ahorrar tipeo (se puede cambiar). Es local del teléfono; no viaja al servidor.
 */
export async function leerUltimoEjecutor(almacen: Almacen, userId: string): Promise<string> {
  const v = (await almacen.leerCatalogo(clave(userId)))?.value;
  return typeof v === "string" ? v : "";
}

export async function guardarUltimoEjecutor(almacen: Almacen, userId: string, nombre: string): Promise<void> {
  const limpio = nombre.trim();
  if (!limpio) return;
  await almacen.guardarCatalogo({ key: clave(userId), value: limpio, updatedAt: Date.now() });
}
