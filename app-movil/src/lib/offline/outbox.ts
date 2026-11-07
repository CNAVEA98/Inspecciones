// Port de src/lib/offline/outbox.ts de la web (2026-11-07): misma lógica de reintentos, sobre `Almacen` en vez de Dexie.
import type { Almacen } from "./almacen";
import type { OutboxRecord, PhotoRecord, SubmitPayload } from "./db";

/**
 * Error de transporte. `retryable=false` (p. ej. datos rechazados por el servidor) deja la entrada
 * en estado "failed" hasta que el usuario actúe; `retryable=true` (sin red, 5xx, sesión vencida) reintenta.
 */
export class TransportError extends Error {
  constructor(
    message: string,
    public readonly retryable: boolean,
  ) {
    super(message);
    this.name = "TransportError";
  }
}

export interface SubmitResult {
  id: string;
  folio: string | null;
  status: string;
  duplicate: boolean;
}

/** Operaciones remotas; en producción las implementa Supabase, en tests un servidor simulado. */
export interface Transport {
  /** Debe ser idempotente: subir dos veces la misma ruta no es un error. */
  uploadPhoto(photo: PhotoRecord): Promise<void>;
  /** Idempotente por inspection.id (la RPC devuelve duplicate=true si ya se envió). */
  submit(payload: SubmitPayload): Promise<SubmitResult>;
}

export const MAX_ATTEMPTS = 12;
const BASE_MS = 2_000;
const CAP_MS = 5 * 60_000;

/** Espera antes del reintento n (1-based): 2 s, 4 s, 8 s … con tope de 5 min. */
export function backoffMs(attempts: number): number {
  return Math.min(CAP_MS, BASE_MS * 2 ** Math.max(0, attempts - 1));
}

export interface EnqueueInput {
  payload: SubmitPayload;
  photoIds: string[];
}

/** Encola una inspección. Es idempotente: repetir el mismo id no crea otra entrada ni resetea los intentos. */
export async function enqueueSubmission(almacen: Almacen, input: EnqueueInput, now = Date.now()): Promise<void> {
  const id = input.payload.inspection.id;
  await almacen.transaccion(async () => {
    const existing = await almacen.obtenerSalida(id);
    if (!existing) {
      const record: OutboxRecord = {
        id,
        payload: input.payload,
        photoIds: input.photoIds,
        status: "pending",
        attempts: 0,
        nextAttemptAt: now,
        createdAt: now,
      };
      await almacen.agregarSalida(record);
    }
    await almacen.actualizarBorrador(id, { state: "queued" });
  });
}

/** Reactiva una entrada fallida (acción explícita del usuario). */
export async function retryNow(almacen: Almacen, id: string, now = Date.now()): Promise<void> {
  await almacen.actualizarSalida(id, { status: "pending", nextAttemptAt: now, attempts: 0, lastError: undefined });
}

export interface ProcessOptions {
  now?: () => number;
  /** Si es false no se intenta nada (sin red). */
  isOnline?: () => boolean;
}

export interface ProcessSummary {
  sent: string[];
  retry: string[];
  failed: string[];
  skipped: boolean;
}

// Evita dos pasadas simultáneas sobre el mismo almacén (doble envío por eventos de red repetidos).
const running = new WeakMap<Almacen, Promise<ProcessSummary>>();

/** Procesa las entradas vencidas en orden de creación. Seguro de llamar varias veces a la vez. */
export function processOutbox(almacen: Almacen, transport: Transport, opts: ProcessOptions = {}): Promise<ProcessSummary> {
  const current = running.get(almacen);
  if (current) return current;
  const run = doProcess(almacen, transport, opts).finally(() => running.delete(almacen));
  running.set(almacen, run);
  return run;
}

async function doProcess(almacen: Almacen, transport: Transport, opts: ProcessOptions): Promise<ProcessSummary> {
  const now = opts.now ?? Date.now;
  const summary: ProcessSummary = { sent: [], retry: [], failed: [], skipped: false };

  if (opts.isOnline && !opts.isOnline()) {
    summary.skipped = true;
    return summary;
  }

  // Un envío que quedó "sending" por un cierre de la app se considera pendiente.
  for (const e of await almacen.listarSalidas()) {
    if (e.status === "sending") await almacen.actualizarSalida(e.id, { status: "pending" });
  }

  const due = (await almacen.listarSalidas())
    .filter((e) => e.status === "pending" && e.nextAttemptAt <= now())
    .sort((a, b) => a.createdAt - b.createdAt);

  for (const entry of due) {
    await almacen.actualizarSalida(entry.id, { status: "sending" });
    try {
      await sendOne(almacen, transport, entry);
      await almacen.transaccion(async () => {
        await almacen.eliminarSalida(entry.id);
        await almacen.actualizarBorrador(entry.id, { state: "sent" });
      });
      summary.sent.push(entry.id);
    } catch (err) {
      const retryable = !(err instanceof TransportError) || err.retryable;
      const attempts = entry.attempts + 1;
      const message = err instanceof Error ? err.message : String(err);
      if (!retryable || attempts >= MAX_ATTEMPTS) {
        await almacen.actualizarSalida(entry.id, { status: "failed", attempts, lastError: message });
        summary.failed.push(entry.id);
      } else {
        await almacen.actualizarSalida(entry.id, {
          status: "pending",
          attempts,
          lastError: message,
          nextAttemptAt: now() + backoffMs(attempts),
        });
        summary.retry.push(entry.id);
        // Sin red todo lo demás fallaría igual: se corta la pasada y se reintenta luego.
        if (err instanceof TransportError && err.retryable) break;
      }
    }
  }
  return summary;
}

async function sendOne(almacen: Almacen, transport: Transport, entry: OutboxRecord): Promise<void> {
  // 1) Fotos: primero al Storage (la ruta ya está fijada, así que reintentar no duplica).
  for (const photoId of entry.photoIds) {
    const photo = await almacen.obtenerFoto(photoId);
    if (!photo) continue; // ya subida y limpiada, o descartada
    if (!photo.uploaded) {
      await transport.uploadPhoto(photo);
      await almacen.actualizarFoto(photoId, { uploaded: true });
    }
  }
  // 2) Inspección completa en una sola RPC transaccional.
  const res = await transport.submit(entry.payload);
  if (res.folio) await almacen.actualizarBorrador(entry.id, { folio: res.folio });
  // 3) Las fotos y la firma se conservan en el teléfono: con ellas se genera el PDF sin señal. `limpiarFotosEnviadas` las libera
  //    pasados unos días.
}

export type SyncState = "synced" | "pending" | "syncing" | "offline" | "attention";

export interface SyncSnapshot {
  state: SyncState;
  pending: number;
  failed: number;
}

/** Estado para el indicador visible de sincronización. */
export async function getSyncSnapshot(almacen: Almacen, online: boolean, syncing = false): Promise<SyncSnapshot> {
  const entries = await almacen.listarSalidas();
  const failed = entries.filter((e) => e.status === "failed").length;
  const pending = entries.length - failed;
  let state: SyncState = "synced";
  if (failed) state = "attention";
  else if (!online && pending) state = "offline";
  else if (syncing) state = "syncing";
  else if (pending) state = "pending";
  else if (!online) state = "offline";
  return { state, pending, failed };
}
