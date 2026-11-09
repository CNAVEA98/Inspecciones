import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { VERSION_ETIQUETA } from "@/lib/version";
import { WEB_URL } from "@/lib/supabase";
import { color } from "@/ui/tema";

/** Abre una página del sitio en el navegador. Sin señal no carga: el teléfono lo avisa. */
const abrir = (ruta: string) => void Linking.openURL(`${WEB_URL}${ruta}`).catch(() => undefined);

/**
 * Pie de página común (igual al de la web): autoría, uso autorizado, enlaces a Privacidad y Condiciones de uso, y la
 * versión de la app (referencia para reportar problemas).
 */
export function PiePagina({ oscuro = false }: { oscuro?: boolean }) {
  const texto = oscuro ? "#9aa4ad" : color.sub;
  const enlace = oscuro ? "#c9d0d6" : color.graf;
  return (
    <View style={estilos.pie}>
      <Text style={[estilos.texto, { color: texto }]}>© 2026 Cristóbal Navea y Manuel Aguilar · Desarrollada para Bbosch · Uso exclusivo del personal autorizado de Bbosch y MLP</Text>
      <View style={estilos.fila}>
        {WEB_URL ? (
          <>
            <Pressable accessibilityRole="link" onPress={() => abrir("/privacidad")} style={estilos.enlace}>
              <Text style={[estilos.enlaceTexto, { color: enlace }]}>Privacidad</Text>
            </Pressable>
            <Text style={[estilos.texto, { color: texto }]}>·</Text>
            <Pressable accessibilityRole="link" onPress={() => abrir("/condiciones")} style={estilos.enlace}>
              <Text style={[estilos.enlaceTexto, { color: enlace }]}>Condiciones de uso</Text>
            </Pressable>
            <Text style={[estilos.texto, { color: texto }]}>·</Text>
          </>
        ) : null}
        <Text style={[estilos.version, { color: texto }]} accessibilityLabel="Versión de la aplicación">
          {VERSION_ETIQUETA}
        </Text>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  pie: { alignItems: "center", gap: 2, paddingTop: 16 },
  texto: { fontSize: 12, textAlign: "center" },
  fila: { flexDirection: "row", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 10 },
  // Área táctil cómoda aunque el texto sea pequeño.
  enlace: { minHeight: 44, justifyContent: "center" },
  enlaceTexto: { fontSize: 12, textDecorationLine: "underline" },
  version: { fontSize: 12, fontVariant: ["tabular-nums"] },
});
