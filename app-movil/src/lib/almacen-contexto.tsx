import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import type { Almacen } from "@/lib/offline/almacen";
import { AlmacenSqlite } from "@/lib/offline/almacen-sqlite";

const AlmacenContext = createContext<Almacen | null>(null);

/** Abre la base local una sola vez y la entrega a toda la app. Mientras abre, muestra un indicador. */
export function AlmacenProvider({ children }: { children: ReactNode }) {
  const [almacen, setAlmacen] = useState<Almacen | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    AlmacenSqlite.abrir()
      .then((a) => {
        if (vivo) setAlmacen(a);
      })
      .catch((e: unknown) => {
        if (vivo) setError(e instanceof Error ? e.message : "No se pudo abrir la base local");
      });
    return () => {
      vivo = false;
    };
  }, []);

  if (error) {
    return (
      <View style={styles.centro}>
        <Text style={styles.error}>No se pudo abrir el almacenamiento del teléfono.</Text>
        <Text style={styles.detalle}>{error}</Text>
      </View>
    );
  }
  if (!almacen) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator />
      </View>
    );
  }
  return <AlmacenContext.Provider value={almacen}>{children}</AlmacenContext.Provider>;
}

export function useAlmacen(): Almacen {
  const almacen = useContext(AlmacenContext);
  if (!almacen) throw new Error("useAlmacen debe usarse dentro de AlmacenProvider");
  return almacen;
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 8 },
  error: { color: "#8a0000", fontSize: 16, fontWeight: "600", textAlign: "center" },
  detalle: { color: "#5b646d", fontSize: 13, textAlign: "center" },
});
