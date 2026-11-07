import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { memo, useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useTecnico } from "@/lib/tecnico-contexto";
import { deletePhoto, savePhoto } from "@/lib/tecnico/photos";
import { color } from "@/ui/tema";

const Miniatura = memo(function Miniatura({ id, numero, onQuitar }: { id: string; numero: number; onQuitar: () => void }) {
  const { almacen } = useTecnico();
  const [uri, setUri] = useState<string>();
  useEffect(() => {
    let vivo = true;
    void almacen.obtenerFoto(id).then((f) => {
      if (vivo) setUri(f?.uri);
    });
    return () => {
      vivo = false;
    };
  }, [almacen, id]);

  const confirmar = () =>
    Alert.alert(`¿Quitar la foto ${numero}?`, "Se borra de este teléfono. No se puede deshacer.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sí, quitar", style: "destructive", onPress: onQuitar },
    ]);

  return (
    <View style={estilos.miniatura}>
      <Image source={uri ? { uri } : undefined} style={estilos.imagen} contentFit="cover" accessibilityLabel={`Foto ${numero}`} />
      {/* Área táctil de 44 px (guantes); el círculo visible es más pequeño. */}
      <Pressable accessibilityRole="button" accessibilityLabel={`Quitar foto ${numero}`} onPress={confirmar} style={estilos.quitar}>
        <View style={estilos.quitarCirculo}>
          <Text style={estilos.quitarX}>×</Text>
        </View>
      </Pressable>
    </View>
  );
});

/** Adjunta fotos (cámara o galería): se comprimen y quedan guardadas en el teléfono. */
export function FotoCampo({
  inspectionId,
  ids,
  max,
  onChange,
}: {
  inspectionId: string;
  ids: string[];
  max: number;
  onChange: (ids: string[]) => void;
}) {
  const { almacen, userId } = useTecnico();
  const [error, setError] = useState<string>();
  const [ocupado, setOcupado] = useState(false);

  const guardar = async (assets: ImagePicker.ImagePickerAsset[]) => {
    setOcupado(true);
    setError(undefined);
    try {
      const nuevos: string[] = [];
      for (const a of assets.slice(0, max - ids.length)) {
        nuevos.push(await savePhoto(almacen, userId, inspectionId, { uri: a.uri, width: a.width, height: a.height }));
      }
      onChange([...ids, ...nuevos]);
    } catch {
      setError("No se pudo guardar la foto. Intente de nuevo.");
    } finally {
      setOcupado(false);
    }
  };

  const tomar = async () => {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      setError("Permita el uso de la cámara en los ajustes del teléfono.");
      return;
    }
    const r = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 1, exif: false });
    if (!r.canceled) await guardar(r.assets);
  };

  const elegir = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
      exif: false,
      allowsMultipleSelection: max - ids.length > 1,
      selectionLimit: max - ids.length,
    });
    if (!r.canceled) await guardar(r.assets);
  };

  return (
    <View style={estilos.fila}>
      {ids.map((id, i) => (
        <Miniatura
          key={id}
          id={id}
          numero={i + 1}
          onQuitar={() => {
            void deletePhoto(almacen, id);
            onChange(ids.filter((x) => x !== id));
          }}
        />
      ))}
      {ids.length < max ? (
        <>
          <Pressable accessibilityRole="button" disabled={ocupado} onPress={() => void tomar()} style={[estilos.agregar, ocupado && { opacity: 0.6 }]}>
            <Text style={estilos.agregarTexto}>{ocupado ? "Guardando…" : ids.length ? "Agregar otra foto" : "Tomar foto"}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" disabled={ocupado} onPress={() => void elegir()} style={[estilos.agregar, ocupado && { opacity: 0.6 }]}>
            <Text style={estilos.agregarTexto}>Galería</Text>
          </Pressable>
        </>
      ) : null}
      {error ? <Text style={estilos.error}>{error}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 12 },
  miniatura: { width: 80, height: 80 },
  imagen: { width: 80, height: 80, borderRadius: 12, borderWidth: 1, borderColor: color.linea, backgroundColor: color.neutroSuave },
  quitar: { position: "absolute", top: -12, right: -12, width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  quitarCirculo: { width: 28, height: 28, borderRadius: 14, backgroundColor: color.graf, alignItems: "center", justifyContent: "center" },
  quitarX: { color: color.blanco, fontSize: 18, lineHeight: 20 },
  agregar: {
    minHeight: 56,
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#6f695f",
    backgroundColor: "#faf8f4",
    paddingHorizontal: 20,
  },
  agregarTexto: { color: color.graf, fontSize: 16, fontWeight: "600" },
  error: { width: "100%", color: color.maloTexto, fontSize: 14, fontWeight: "500" },
});
