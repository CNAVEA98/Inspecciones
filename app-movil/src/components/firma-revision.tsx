import { Image } from "expo-image";
import { useRef, useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SignatureCanvas, { type SignatureViewRef } from "react-native-signature-canvas";
import { Boton } from "@/ui/componentes";
import { color } from "@/ui/tema";

/** Se oculta el pie del lienzo: los botones son los de la app (igual que en la firma del técnico). */
const ESTILO_LIENZO = [
  ".m-signature-pad { box-shadow: none; border: 1.5px solid #8f897e; border-radius: 12px; margin: 0; inset: 0; }",
  ".m-signature-pad--body { border: none; position: absolute; inset: 0; }",
  ".m-signature-pad--footer { display: none; }",
].join("\n");

/**
 * Firma de revisión dibujada con el dedo a pantalla completa. Entrega el PNG en base64 (`data:image/png;base64,…`) a `onChange`
 * y lo muestra como vista previa; no guarda nada en el teléfono (la firma se sube al firmar).
 */
export function FirmaRevisionCampo({
  png,
  onChange,
  deshabilitado,
}: {
  png: string | null;
  onChange: (png: string | null) => void;
  deshabilitado?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const lienzo = useRef<SignatureViewRef>(null);
  const [abierto, setAbierto] = useState(false);
  const [vacia, setVacia] = useState(false);

  return (
    <View style={estilos.caja}>
      {png ? (
        <View style={estilos.vista}>
          <Image source={{ uri: png }} style={estilos.imagen} contentFit="contain" accessibilityLabel="Firma dibujada" />
        </View>
      ) : null}
      <View style={estilos.botones}>
        <Boton
          texto={png ? "Volver a firmar" : "Firmar con el dedo"}
          variante={png ? "secundario" : "primario"}
          onPress={() => {
            setVacia(false);
            setAbierto(true);
          }}
          deshabilitado={deshabilitado}
          style={estilos.boton}
        />
        {png ? <Boton texto="Quitar" variante="secundario" onPress={() => onChange(null)} deshabilitado={deshabilitado} style={estilos.boton} /> : null}
      </View>

      <Modal visible={abierto} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setAbierto(false)}>
        <View style={[estilos.hoja, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }]}>
          <Text style={estilos.titulo}>Firme con el dedo</Text>
          <View style={estilos.lienzo}>
            <SignatureCanvas
              ref={lienzo}
              penColor={color.graf}
              webStyle={ESTILO_LIENZO}
              onBegin={() => setVacia(false)}
              onOK={(dataUrl) => {
                onChange(dataUrl);
                setAbierto(false);
              }}
              onEmpty={() => setVacia(true)}
            />
          </View>
          {vacia ? <Text style={estilos.vacia}>Dibuje su firma dentro del recuadro antes de guardar.</Text> : null}
          <View style={estilos.botones}>
            <Boton
              texto="Limpiar"
              variante="secundario"
              onPress={() => {
                setVacia(false);
                lienzo.current?.clearSignature();
              }}
              style={estilos.boton}
            />
            <Boton texto="Guardar firma" onPress={() => lienzo.current?.readSignature()} style={estilos.boton} />
          </View>
          <Boton texto="Cancelar" variante="secundario" onPress={() => setAbierto(false)} />
        </View>
      </Modal>
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: { gap: 12 },
  vista: { height: 140, borderRadius: 12, borderWidth: 1.5, borderColor: color.borde, backgroundColor: color.blanco, padding: 8 },
  imagen: { flex: 1 },
  botones: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  boton: { flexGrow: 1, flexBasis: 0 },
  hoja: { flex: 1, backgroundColor: color.papel, paddingHorizontal: 16, gap: 12 },
  titulo: { color: color.graf, fontSize: 22, fontWeight: "700" },
  lienzo: { flex: 1, borderRadius: 12, overflow: "hidden", backgroundColor: color.blanco },
  vacia: { color: color.maloTexto, fontSize: 14, fontWeight: "500" },
});
