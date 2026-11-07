import { useSyncExternalStore } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { SyncSnapshot } from "@/lib/offline/outbox";
import { useTecnico } from "@/lib/tecnico-contexto";
import { tono, type Tono } from "@/ui/tema";

const TONO: Record<SyncSnapshot["state"], Tono> = {
  synced: "ok",
  pending: "neutro",
  syncing: "neutro",
  offline: "cobre",
  attention: "malo",
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
      return s.pending ? `Sin conexión, ${s.pending} guardada${s.pending > 1 ? "s" : ""} en el teléfono` : "Sin conexión";
    case "attention":
      return `${s.failed} requiere${s.failed > 1 ? "n" : ""} atención`;
  }
}

/** Estado de sincronización siempre visible (exigencia del flujo sin señal). */
export function SyncIndicador() {
  const { sync } = useTecnico();
  const snap = useSyncExternalStore(sync.subscribe, sync.getSnapshot);
  // Todo sincronizado no necesita aviso: solo se muestra lo que requiere la atención del técnico.
  if (snap.state === "synced") return null;
  const reintentar = snap.state === "pending" || snap.state === "attention";
  const t = tono[TONO[snap.state]];
  return (
    <View style={estilos.fila} accessibilityRole="summary" accessibilityLiveRegion="polite">
      <View style={[estilos.insignia, { backgroundColor: t.fondo }]}>
        <Text style={[estilos.texto, { color: t.texto }]}>{texto(snap)}</Text>
      </View>
      {reintentar ? (
        <Pressable accessibilityRole="button" onPress={() => void sync.syncNow()} style={estilos.reintentar}>
          <Text style={estilos.reintentarTexto}>Reintentar</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 },
  insignia: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, flexShrink: 1 },
  texto: { fontSize: 13, fontWeight: "600" },
  reintentar: {
    minHeight: 40,
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "#ffffff",
    paddingHorizontal: 12,
  },
  reintentarTexto: { color: "#ffffff", fontSize: 13, fontWeight: "600" },
});
