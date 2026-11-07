import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { rolConTurno } from "@/lib/sesion";
import { entregarPdf } from "@/lib/tecnico/informe";
import { useTecnico } from "@/lib/tecnico-contexto";
import { Boton } from "@/ui/componentes";
import { color } from "@/ui/tema";

/**
 * Botón único del PDF de una inspección: abre la hoja de compartir del teléfono (guardar en Archivos, WhatsApp, correo…).
 * Con señal y enviada usa el PDF oficial del servidor; sin señal (o sin enviar) lo genera en el teléfono, así que siempre se puede obtener.
 */
export function BotonPdf({ id, variante = "secundario" }: { id: string; variante?: "primario" | "secundario" }) {
  const { almacen, supabase, catalog, perfil } = useTecnico();
  const [trabajando, setTrabajando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const ejecutar = async () => {
    if (trabajando) return;
    setError(null);
    setInfo(null);
    setTrabajando(true);
    const r = await entregarPdf({ almacen, supabase, catalog: catalog.catalog, tecnico: rolConTurno(perfil), turno: perfil.turno }, id);
    setError(r.error ?? null);
    setInfo(r.info ?? null);
    setTrabajando(false);
  };

  return (
    <View style={estilos.caja}>
      <Boton
        texto={trabajando ? "Preparando PDF…" : "PDF · Guardar o compartir"}
        variante={variante}
        onPress={() => void ejecutar()}
        deshabilitado={trabajando}
      />
      {info ? <Text style={estilos.info}>{info}</Text> : null}
      {error ? <Text style={estilos.error}>{error}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: { gap: 6 },
  info: { color: color.sub, fontSize: 14 },
  error: { color: color.malo, fontSize: 14, fontWeight: "500" },
});
