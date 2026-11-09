import { useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import type { DestinoPdf, ResultadoPdf } from "@/lib/tecnico/informe";
import { Boton } from "@/ui/componentes";
import { color } from "@/ui/tema";

/**
 * Botones del PDF de una inspección: «Compartir» (WhatsApp, correo, abrir con otra app) y, en Android, «Guardar en el teléfono»
 * (el usuario elige la carpeta, p. ej. Descargas). En iPhone la hoja de compartir ya trae «Guardar en Archivos».
 */
export function AccionesPdf({
  obtener,
  oficial = false,
}: {
  obtener: (destino: DestinoPdf) => Promise<ResultadoPdf>;
  /** Rotula los botones como «PDF oficial» (revisión). */
  oficial?: boolean;
}) {
  const [trabajando, setTrabajando] = useState<DestinoPdf | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const ejecutar = async (destino: DestinoPdf) => {
    if (trabajando) return;
    setError(null);
    setInfo(null);
    setTrabajando(destino);
    const r = await obtener(destino);
    setError(r.error ?? null);
    setInfo(r.info ?? null);
    setTrabajando(null);
  };

  const pdf = oficial ? "PDF oficial" : "PDF";
  return (
    <View style={estilos.caja}>
      <View style={estilos.fila}>
        <Boton
          texto={trabajando === "compartir" ? "Preparando…" : `${pdf} · Compartir`}
          variante="secundario"
          onPress={() => void ejecutar("compartir")}
          deshabilitado={!!trabajando}
          style={estilos.boton}
        />
        {Platform.OS === "android" ? (
          <Boton
            texto={trabajando === "guardar" ? "Guardando…" : "Guardar en el teléfono"}
            variante="secundario"
            onPress={() => void ejecutar("guardar")}
            deshabilitado={!!trabajando}
            style={estilos.boton}
          />
        ) : null}
      </View>
      {info ? <Text style={estilos.info}>{info}</Text> : null}
      {error ? <Text style={estilos.error}>{error}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: { gap: 6 },
  fila: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  boton: { flexGrow: 1, flexBasis: 140 },
  info: { color: color.sub, fontSize: 14 },
  error: { color: color.malo, fontSize: 14, fontWeight: "500" },
});
