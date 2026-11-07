import { type ReactNode } from "react";
import { StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from "react-native";
import { Presionable } from "./animacion";
import { alto, color, radio, tono, type Tono } from "./tema";

/** Botón principal (grafito), secundario (borde) o de peligro. */
export function Boton({
  texto,
  onPress,
  variante = "primario",
  deshabilitado,
  style,
}: {
  texto: string;
  onPress: () => void;
  variante?: "primario" | "secundario" | "peligro" | "cobre";
  deshabilitado?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Presionable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!deshabilitado }}
      disabled={deshabilitado}
      onPress={onPress}
      style={[
        estilos.boton,
        variante === "primario" && { backgroundColor: color.graf },
        variante === "cobre" && { backgroundColor: color.cu },
        variante === "peligro" && { backgroundColor: color.malo },
        variante === "secundario" && { backgroundColor: color.blanco, borderWidth: 1.5, borderColor: color.graf },
        variante !== "secundario" && estilos.sombraBoton,
        deshabilitado && { opacity: 0.5 },
        style,
      ]}
    >
      <Text style={[estilos.botonTexto, variante === "secundario" && { color: color.graf }]}>{texto}</Text>
    </Presionable>
  );
}

/** Campo de texto con etiqueta. */
export function Campo({
  etiqueta,
  multilinea,
  style,
  ...props
}: TextInputProps & { etiqueta?: string; multilinea?: boolean }) {
  return (
    <View style={estilos.campoCaja}>
      {etiqueta ? <Text style={estilos.etiqueta}>{etiqueta}</Text> : null}
      <TextInput
        placeholderTextColor={color.sub}
        multiline={multilinea}
        textAlignVertical={multilinea ? "top" : "center"}
        {...props}
        style={[estilos.campo, multilinea && { minHeight: 96, paddingTop: 12 }, style]}
      />
    </View>
  );
}

/** Opción grande de una lista de selección (área, trabajo, familia, formato). */
export function Opcion({
  etiqueta,
  detalle,
  deshabilitada,
  onPress,
}: {
  etiqueta: string;
  detalle?: string;
  deshabilitada?: boolean;
  onPress: () => void;
}) {
  return (
    <Presionable
      accessibilityRole="button"
      disabled={deshabilitada}
      onPress={onPress}
      escala={0.985}
      style={[estilos.opcion, deshabilitada ? { backgroundColor: color.neutroSuave, borderColor: color.linea } : estilos.sombra]}
    >
      <Text style={[estilos.opcionTitulo, deshabilitada && { color: color.sub }]}>{etiqueta}</Text>
      {detalle ? <Text style={[estilos.opcionDetalle, deshabilitada && { color: color.sub }]}>{detalle}</Text> : null}
    </Presionable>
  );
}

/** Insignia de estado. */
export function Insignia({ texto, tono: t }: { texto: string; tono: Tono }) {
  return (
    <View style={[estilos.insignia, { backgroundColor: tono[t].fondo }]}>
      <Text style={[estilos.insigniaTexto, { color: tono[t].texto }]}>{texto}</Text>
    </View>
  );
}

/** Tarjeta blanca con borde fino. */
export function Tarjeta({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[estilos.tarjeta, estilos.sombra, style]}>{children}</View>;
}

/** Aviso destacado (error, información, éxito). */
export function Aviso({ texto, tono: t = "malo" }: { texto: string; tono?: Tono }) {
  return (
    <View
      accessibilityRole="alert"
      style={[estilos.aviso, { backgroundColor: tono[t].fondo, borderColor: tono[t].texto }]}
    >
      <Text style={{ color: tono[t].texto, fontSize: 16, fontWeight: "500" }}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  sombra: {
    shadowColor: "#14181d",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  sombraBoton: {
    shadowColor: "#14181d",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  boton: {
    minHeight: alto.boton,
    borderRadius: radio.chico,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  botonTexto: { color: color.blanco, fontSize: 17, fontWeight: "600" },
  campoCaja: { gap: 6 },
  etiqueta: { color: color.graf, fontSize: 14, fontWeight: "600" },
  campo: {
    minHeight: alto.campo,
    borderRadius: radio.chico,
    borderWidth: 1.5,
    borderColor: color.borde,
    backgroundColor: color.blanco,
    paddingHorizontal: 16,
    fontSize: 18,
    color: color.graf,
  },
  opcion: {
    minHeight: alto.opcion,
    borderRadius: radio.medio,
    borderWidth: 1.5,
    borderColor: color.borde,
    backgroundColor: color.blanco,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: "center",
  },
  opcionTitulo: { color: color.graf, fontSize: 20, fontWeight: "600" },
  opcionDetalle: { color: color.graf, fontSize: 16 },
  insignia: { borderRadius: radio.pill, paddingHorizontal: 12, paddingVertical: 4, alignSelf: "flex-start" },
  insigniaTexto: { fontSize: 14, fontWeight: "600" },
  tarjeta: {
    borderRadius: radio.medio,
    borderWidth: 1,
    borderColor: color.linea,
    backgroundColor: color.blanco,
    padding: 16,
  },
  aviso: { borderRadius: radio.medio, borderWidth: 1, padding: 16 },
});
