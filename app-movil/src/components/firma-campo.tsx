import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SignatureCanvas, { type SignatureViewRef } from "react-native-signature-canvas";
import { useTecnico } from "@/lib/tecnico-contexto";
import { Boton } from "@/ui/componentes";
import { color } from "@/ui/tema";

/** Se oculta el pie del lienzo (sus botones quedaban fuera de la vista): los botones son los de la app. */
const ESTILO_LIENZO = [
  ".m-signature-pad { box-shadow: none; border: 1.5px solid #8f897e; border-radius: 12px; margin: 0; inset: 0; }",
  ".m-signature-pad--body { border: none; position: absolute; inset: 0; }",
  ".m-signature-pad--footer { display: none; }",
].join("\n");

/**
 * Firma dibujada con el dedo en una hoja a pantalla completa (así el gesto no compite con el scroll del formulario).
 * Entrega el PNG en base64; el formulario lo guarda como archivo.
 */
export function FirmaCampo({
  firmaId,
  deshabilitado,
  onFirmar,
  onQuitar,
}: {
  firmaId?: string;
  deshabilitado?: boolean;
  onFirmar: (pngBase64: string) => Promise<void>;
  onQuitar: () => Promise<void>;
}) {
  const insets = useSafeAreaInsets();
  const { almacen } = useTecnico();
  const lienzo = useRef<SignatureViewRef>(null);
  const [abierto, setAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [vacia, setVacia] = useState(false);
  const [uri, setUri] = useState<string>();

  useEffect(() => {
    let vivo = true;
    if (!firmaId) {
      setUri(undefined);
      return;
    }
    void almacen.obtenerFoto(firmaId).then((f) => {
      if (vivo) setUri(f?.uri);
    });
    return () => {
      vivo = false;
    };
  }, [almacen, firmaId]);

  const abrir = () => {
    setVacia(false);
    setAbierto(true);
  };

  return (
    <View style={estilos.caja}>
      {uri ? (
        <View style={estilos.vista}>
          <Image source={{ uri }} style={estilos.imagen} contentFit="contain" accessibilityLabel="Firma guardada" />
        </View>
      ) : null}
      {deshabilitado ? null : (
        <View style={estilos.botones}>
          <Boton
            texto={firmaId ? "Volver a firmar" : "Firmar"}
            variante={firmaId ? "secundario" : "primario"}
            onPress={abrir}
            style={estilos.boton}
          />
          {firmaId ? <Boton texto="Quitar firma" variante="secundario" onPress={() => void onQuitar()} style={estilos.boton} /> : null}
        </View>
      )}

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
                setGuardando(true);
                void onFirmar(dataUrl).finally(() => {
                  setGuardando(false);
                  setAbierto(false);
                });
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
              deshabilitado={guardando}
              style={estilos.boton}
            />
            <Boton
              texto={guardando ? "Guardando…" : "Guardar firma"}
              onPress={() => lienzo.current?.readSignature()}
              deshabilitado={guardando}
              style={estilos.boton}
            />
          </View>
          <Boton texto="Cancelar" variante="secundario" onPress={() => setAbierto(false)} deshabilitado={guardando} />
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
