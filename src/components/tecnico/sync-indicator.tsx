"use client";

import { useSyncExternalStore } from "react";
import { useTecnico } from "./tecnico-provider";
import type { SyncSnapshot } from "@/lib/offline/outbox";

const SERVER: SyncSnapshot = { state: "synced", pending: 0, failed: 0 };

const ESTILO: Record<SyncSnapshot["state"], string> = {
  synced: "bg-[#e1f2e8] text-[#0b4a28]",
  pending: "bg-[#f1f0ec] text-graf",
  syncing: "bg-[#f1f0ec] text-graf",
  offline: "bg-cu-soft text-[#7a3d12]",
  attention: "bg-[#fdecec] text-[#7a0000]",
};

function texto(s: SyncSnapshot): string {
  switch (s.state) {
    case "synced":
      return "Todo sincronizado";
    case "syncing":
      return "Enviando…";
    case "pending":
      return `${s.pending} por enviar`;
    case "offline":
      return s.pending ? `Sin conexión, ${s.pending} guardada${s.pending > 1 ? "s" : ""} en el equipo` : "Sin conexión";
    case "attention":
      return `${s.failed} requiere${s.failed > 1 ? "n" : ""} atención`;
  }
}

/** Estado de sincronización siempre visible (exigencia del flujo offline). */
export function SyncIndicator() {
  const { sync } = useTecnico();
  const snap = useSyncExternalStore(sync.subscribe, sync.getSnapshot, () => SERVER);
  const puedeReintentar = snap.state === "pending" || snap.state === "attention";
  return (
    <div className="flex items-center gap-2" role="status" aria-live="polite">
      <span className={`rounded-full px-3 py-1 text-sm font-semibold ${ESTILO[snap.state]}`}>{texto(snap)}</span>
      {puedeReintentar ? (
        <button
          type="button"
          onClick={() => void sync.syncNow()}
          className="min-h-10 rounded-full border-[1.5px] border-current px-3 text-sm font-semibold text-white"
        >
          Reintentar
        </button>
      ) : null}
    </div>
  );
}
