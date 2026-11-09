import { Stack, type ErrorBoundaryProps } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { AlmacenProvider } from "@/lib/almacen-contexto";
import { registrarEnvioSegundoPlano } from "@/lib/offline/segundo-plano";
import { RevisionProvider } from "@/lib/revision-contexto";
import { SesionProvider, useSesion } from "@/lib/sesion";
import { TecnicoProvider } from "@/lib/tecnico-contexto";
import { color } from "@/ui/tema";
import { useEffect } from "react";

/** Pantalla de respaldo ante un error inesperado: los borradores y la cola están en el teléfono y no se pierden. */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={estilosError.centro}>
      <Text style={estilosError.titulo} accessibilityRole="header">Algo salió mal</Text>
      <Text style={estilosError.texto}>
        Sus inspecciones guardadas en este teléfono no se perdieron. Intente de nuevo; si el problema sigue, cierre y abra la app.
      </Text>
      <Text style={estilosError.detalle}>{error.message}</Text>
      <Pressable accessibilityRole="button" onPress={retry} style={estilosError.boton}>
        <Text style={estilosError.botonTexto}>Reintentar</Text>
      </Pressable>
    </View>
  );
}

const estilosError = StyleSheet.create({
  centro: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12, backgroundColor: color.papel },
  titulo: { fontSize: 20, fontWeight: "700", color: color.graf },
  texto: { fontSize: 15, textAlign: "center", color: color.graf },
  detalle: { fontSize: 12, textAlign: "center", color: color.sub },
  boton: { minHeight: 56, paddingHorizontal: 32, borderRadius: 12, backgroundColor: color.cu, alignItems: "center", justifyContent: "center" },
  botonTexto: { color: color.blanco, fontSize: 16, fontWeight: "700" },
});

function Navegador() {
  const { estado, perfil } = useSesion();
  if (estado === "cargando") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }
  const conSesion = estado === "lista";
  const esTecnico = perfil?.rol === "technician";
  const pila = (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: color.graf },
        headerTintColor: color.blanco,
        contentStyle: { backgroundColor: color.papel },
      }}
    >
      <Stack.Protected guard={conSesion}>
        <Stack.Screen name="index" options={{ headerShown: false, animation: "fade" }} />
      </Stack.Protected>
      <Stack.Protected guard={conSesion && esTecnico}>
        <Stack.Screen name="nueva" options={{ title: "Nuevo Standard", animation: "slide_from_bottom" }} />
        <Stack.Screen name="inspeccion/[id]" options={{ title: "Inspección", headerBackVisible: false, animation: "fade_from_bottom" }} />
      </Stack.Protected>
      {/* Supervisor, programador y administrador: bandeja y revisión (solo con señal). */}
      <Stack.Protected guard={conSesion && !esTecnico}>
        <Stack.Screen name="revision/index" options={{ headerShown: false, animation: "fade" }} />
        <Stack.Screen name="revision/[id]" options={{ title: "Revisión", animation: "slide_from_right" }} />
      </Stack.Protected>
      <Stack.Protected guard={!conSesion}>
        <Stack.Screen name="login" options={{ headerShown: false, animation: "fade" }} />
      </Stack.Protected>
    </Stack>
  );
  if (!perfil) return pila;
  return esTecnico ? (
    <TecnicoProvider perfil={perfil}>{pila}</TecnicoProvider>
  ) : (
    <RevisionProvider perfil={perfil}>{pila}</RevisionProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    void registrarEnvioSegundoPlano();
  }, []);
  return (
    <AlmacenProvider>
      <SesionProvider>
        <StatusBar style="light" />
        <Navegador />
      </SesionProvider>
    </AlmacenProvider>
  );
}
