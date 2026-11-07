import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";
import { AppState } from "react-native";
import type { Red } from "./sync";

let ultimo: NetInfoState | null = null;
const oyentes = new Set<() => void>();

/** `isConnected` / `isInternetReachable` son null mientras se averigua: solo un `false` explícito cuenta como sin red. */
const hayRed = (s: NetInfoState | null) => s === null || (s.isConnected !== false && s.isInternetReachable !== false);

let iniciada = false;
function iniciar() {
  if (iniciada) return;
  iniciada = true;
  NetInfo.addEventListener((s) => {
    const antes = hayRed(ultimo);
    ultimo = s;
    if (antes !== hayRed(s)) oyentes.forEach((o) => o());
  });
  // Al volver a primer plano se reintenta aunque NetInfo no haya notificado un cambio.
  AppState.addEventListener("change", (estado) => {
    if (estado === "active") oyentes.forEach((o) => o());
  });
}

/** Conectividad real del teléfono para el `SyncController`. */
export const redNativa: Red = {
  enLinea: () => {
    iniciar();
    return hayRed(ultimo);
  },
  escuchar: (cambio) => {
    iniciar();
    oyentes.add(cambio);
    return () => {
      oyentes.delete(cambio);
    };
  },
};
