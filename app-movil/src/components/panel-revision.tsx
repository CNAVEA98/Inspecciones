import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { FirmaRevisionCampo } from "@/components/firma-revision";
import type { EtapaFirma } from "@/lib/revision/estado";
import { firmarRevision, type Decision } from "@/lib/revision/firma";
import { archivarOficial } from "@/lib/tecnico/informe";
import { useRevision } from "@/lib/revision-contexto";
import { Aviso, Boton, Campo, Tarjeta } from "@/ui/componentes";
import { color } from "@/ui/tema";

const TEXTO = {
  supervisor: {
    titulo: "Revisión del supervisor",
    aprobar: "Al aprobar, la inspección pasa al programador para su firma final.",
  },
  planner: {
    titulo: "Revisión del programador",
    aprobar: "Al aprobar, la inspección queda cerrada con la firma de ambos.",
  },
} as const;

/**
 * Firma de una etapa de revisión: decisión, comentario (obligatorio solo al rechazar) y firma dibujada. La base de datos exige
 * el orden (supervisor, luego programador) y el comentario al rechazar; aquí se valida antes y se pide confirmación porque
 * la firma es definitiva. Necesita señal.
 */
export function PanelRevision({
  inspeccionId,
  folio,
  etapa,
  onFirmada,
}: {
  inspeccionId: string;
  folio: string;
  etapa: EtapaFirma;
  onFirmada: () => void;
}) {
  const { supabase } = useRevision();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [comentario, setComentario] = useState("");
  const [firma, setFirma] = useState<string | null>(null);
  const [intentado, setIntentado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const faltas = [
    !decision && "Elija si aprueba o rechaza.",
    decision === "rejected" && !comentario.trim() && "El comentario es obligatorio al rechazar.",
    !firma && "Falta la firma.",
  ].filter((f): f is string => !!f);

  const firmar = async () => {
    if (enviando || !decision || !firma) return;
    setEnviando(true);
    setError(null);
    try {
      await firmarRevision(supabase, { inspeccionId, etapa, decision, comentario, pngBase64: firma });
      // Firma final aprobada: el servidor guarda el PDF oficial en Storage (si falla, lo hace en la próxima descarga).
      if (etapa === "planner" && decision === "approved") await archivarOficial(supabase, inspeccionId);
      onFirmada();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo registrar la firma.");
      setEnviando(false);
    }
  };

  const continuar = () => {
    setIntentado(true);
    setError(null);
    if (faltas.length > 0 || !decision) return;
    const verbo = decision === "approved" ? "APROBAR" : "RECHAZAR";
    Alert.alert(
      "Confirmar firma",
      `Va a ${verbo} la inspección ${folio}. Esta acción es definitiva: la firma queda registrada con su nombre, la fecha y la hora.`,
      [
        { text: "Volver", style: "cancel" },
        { text: "Confirmar y firmar", style: decision === "rejected" ? "destructive" : "default", onPress: () => void firmar() },
      ],
    );
  };

  return (
    <Tarjeta style={estilos.panel}>
      <Text style={estilos.titulo} accessibilityRole="header">{TEXTO[etapa].titulo}</Text>
      <Text style={estilos.sub}>Revise el informe completo antes de firmar. La firma es definitiva.</Text>

      <Text style={estilos.etiqueta}>Decisión</Text>
      <View style={estilos.fila}>
        <Boton
          texto="Aprobar"
          variante={decision === "approved" ? "primario" : "secundario"}
          onPress={() => setDecision("approved")}
          deshabilitado={enviando}
          style={[estilos.boton, decision === "approved" && { backgroundColor: color.ok }]}
        />
        <Boton
          texto="Rechazar"
          variante={decision === "rejected" ? "peligro" : "secundario"}
          onPress={() => setDecision("rejected")}
          deshabilitado={enviando}
          style={estilos.boton}
        />
      </View>
      {decision === "approved" ? <Text style={estilos.sub}>{TEXTO[etapa].aprobar}</Text> : null}
      {decision === "rejected" ? (
        <Text style={estilos.sub}>Rechazar cierra la inspección: el técnico deberá crear una nueva. Explique el motivo en el comentario.</Text>
      ) : null}

      <Campo
        etiqueta={decision === "rejected" ? "Comentario (obligatorio)" : "Comentario (opcional)"}
        multilinea
        value={comentario}
        onChangeText={setComentario}
        editable={!enviando}
      />

      <Text style={estilos.etiqueta}>Firma</Text>
      <FirmaRevisionCampo png={firma} onChange={setFirma} deshabilitado={enviando} />

      {intentado && faltas.length > 0 ? <Aviso texto={faltas.join(" ")} /> : null}
      {error ? <Aviso texto={error} /> : null}

      <Boton texto={enviando ? "Firmando…" : "Firmar"} variante="cobre" onPress={continuar} deshabilitado={enviando} />
    </Tarjeta>
  );
}

const estilos = StyleSheet.create({
  panel: { gap: 12, borderColor: color.cu, borderWidth: 2, padding: 16 },
  titulo: { fontSize: 20, fontWeight: "700", color: color.graf },
  sub: { fontSize: 14, color: color.sub },
  etiqueta: { fontSize: 15, fontWeight: "700", color: color.graf },
  fila: { flexDirection: "row", gap: 12 },
  boton: { flexGrow: 1, flexBasis: 0 },
});
