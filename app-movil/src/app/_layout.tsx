import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { AlmacenProvider } from "@/lib/almacen-contexto";
import { SesionProvider, useSesion } from "@/lib/sesion";
import { TecnicoProvider } from "@/lib/tecnico-contexto";
import { color } from "@/ui/tema";

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
        <Stack.Screen name="nueva" options={{ title: "Nuevo Standard", animation: "slide_from_bottom" }} />
        <Stack.Screen name="inspeccion/[id]" options={{ title: "Inspección", headerBackVisible: false, animation: "fade_from_bottom" }} />
      </Stack.Protected>
      <Stack.Protected guard={!conSesion}>
        <Stack.Screen name="login" options={{ headerShown: false, animation: "fade" }} />
      </Stack.Protected>
    </Stack>
  );
  return perfil ? <TecnicoProvider perfil={perfil}>{pila}</TecnicoProvider> : pila;
}

export default function RootLayout() {
  return (
    <AlmacenProvider>
      <SesionProvider>
        <StatusBar style="light" />
        <Navegador />
      </SesionProvider>
    </AlmacenProvider>
  );
}
