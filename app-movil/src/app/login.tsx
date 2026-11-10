import { Image } from "expo-image";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { PiePagina } from "@/components/pie-pagina";
import { useSesion } from "@/lib/sesion";
import { Aparecer } from "@/ui/animacion";
import { color } from "@/ui/tema";
import { Aviso, Boton, Campo } from "@/ui/componentes";

/** Ingreso por usuario y contraseña (igual que la web: el usuario se convierte en un correo interno). */
export default function Login() {
  const { ingresar, aviso } = useSesion();
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);

  const enviar = async () => {
    if (entrando) return;
    setEntrando(true);
    setError(await ingresar(usuario, clave));
    setEntrando(false);
  };

  const mensaje = error ?? aviso;
  return (
    <KeyboardAvoidingView style={estilos.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={estilos.contenido}
      >
        <Aparecer desde={-24} escalaDesde={0.94} duracion={550}>
          <View style={estilos.marca}>
            <Image source={require("../../assets/bbosch-logo-solo.png")} style={estilos.logo} contentFit="contain" />
            <Text style={estilos.titulo}>Inspecciones</Text>
            <Text style={estilos.sub}>Ingrese con su usuario para trabajar, incluso sin señal.</Text>
          </View>
        </Aparecer>
        <View style={estilos.formulario}>
          <Aparecer retraso={180}>
            <Campo
              etiqueta="Usuario"
              value={usuario}
              onChangeText={setUsuario}
              autoCapitalize="characters"
              autoCorrect={false}
              autoComplete="username"
              placeholder="Ej.: TECNICO_A"
            />
          </Aparecer>
          <Aparecer retraso={260}>
            <Campo
              etiqueta="Contraseña"
              value={clave}
              onChangeText={setClave}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="current-password"
              onSubmitEditing={() => void enviar()}
            />
          </Aparecer>
          {mensaje ? (
            <Aparecer desde={-8} duracion={250}>
              <Aviso texto={mensaje} />
            </Aparecer>
          ) : null}
          <Aparecer retraso={340}>
            <Boton texto={entrando ? "Procesando…" : "Ingresar"} onPress={() => void enviar()} deshabilitado={entrando} />
          </Aparecer>
          <Aparecer retraso={420}>
            <Text style={estilos.ayuda}>Si no tiene acceso, solicítelo al administrador.</Text>
          </Aparecer>
        </View>
        <Aparecer retraso={500}>
          <PiePagina />
        </Aparecer>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  contenido: { flexGrow: 1, justifyContent: "center", padding: 24, gap: 28 },
  marca: { alignItems: "center", gap: 8, backgroundColor: color.graf, borderRadius: 24, padding: 24 },
  logo: { width: 180, height: 44 },
  titulo: { color: color.blanco, fontSize: 24, fontWeight: "700" },
  sub: { color: "#c9d0d6", fontSize: 15, textAlign: "center" },
  formulario: { gap: 16 },
  ayuda: { color: color.sub, fontSize: 14 },
});
