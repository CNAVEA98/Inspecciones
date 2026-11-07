// Port de src/lib/offline/sync.ts de la web (2026-11-07). Diferencia: la red y el ciclo de la app vienen de `Red`.
import type { Almacen } from "./almacen";
import { getSyncSnapshot, processOutbox, type SyncSnapshot, type Transport } from "./outbox";

const POLL_MS = 30_000;

/** Fuente de conectividad (en el teléfono: NetInfo y AppState; en pruebas, una simulada). */
export interface Red {
  enLinea(): boolean;
  /** Avisa cuando cambia la conexión o la app vuelve a primer plano. Devuelve la función para dejar de escuchar. */
  escuchar(cambio: () => void): () => void;
}

/**
 * Orquesta la sincronización: al volver la red, al encolar y cada 30 s. Expone el estado
 * para el indicador visible de sincronización (useSyncExternalStore en la UI).
 */
export class SyncController {
  private listeners = new Set<() => void>();
  private snapshot: SyncSnapshot = { state: "synced", pending: 0, failed: 0 };
  private syncing = false;
  private timer: ReturnType<typeof setInterval> | undefined;

  constructor(
    private readonly almacen: Almacen,
    private readonly transport: Transport,
    private readonly red: Red,
  ) {}

  getSnapshot = () => this.snapshot;

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };

  private async refresh() {
    this.snapshot = await getSyncSnapshot(this.almacen, this.red.enLinea(), this.syncing);
    this.listeners.forEach((l) => l());
  }

  /** Intenta enviar lo pendiente ahora. */
  async syncNow() {
    if (this.syncing) return;
    this.syncing = true;
    await this.refresh();
    try {
      await processOutbox(this.almacen, this.transport, { isOnline: () => this.red.enLinea() });
    } finally {
      this.syncing = false;
      await this.refresh();
    }
  }

  /** Llamar tras encolar: actualiza el indicador y envía si hay red. */
  async notifyQueued() {
    await this.refresh();
    void this.syncNow();
  }

  start() {
    const onChange = () => void (this.red.enLinea() ? this.syncNow() : this.refresh());
    const dejarDeEscuchar = this.red.escuchar(onChange);
    this.timer = setInterval(() => void this.syncNow(), POLL_MS);
    void this.syncNow();
    return () => {
      dejarDeEscuchar();
      if (this.timer) clearInterval(this.timer);
    };
  }
}
