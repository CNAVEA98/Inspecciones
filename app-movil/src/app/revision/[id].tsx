import { Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DetalleRevision } from "@/components/detalle-revision";
import { PanelRevision } from "@/components/panel-revision";
import { PiePagina } from "@/components/pie-pagina";
import { etapaPendiente } from "@/lib/revision/estado";
import type { DetalleInspeccion } from "@/lib/revision/queries";
import { obtenerDetalle } from "@/lib/revision/servidor";
import { useRevision } from "@/lib/revision-contexto";
import { entregarPdfOficial } from "@/lib/tecnico/informe";
import { Aviso, Boton } from "@/ui/componentes";
import { color } from "@/ui/tema";

/** Detalle de una inspección para quien revisa: informe completo, PDF oficial y, si le toca, la firma. */
export default function RevisionDetalle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { supabase, rol } = useRevision();
  const insets = useSafeAreaInsets();
  const [d, setD] = useState<DetalleInspeccion | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [actualizando, setActualizando] = useState(false);
  const [firmada, setFirmada] = useState(false);
  const [pdf, setPdf] = useState<{ trabajando: boolean; error?: string }>({ trabajando: false });

  const cargar = useCallback(async () => {
    setError(null);
    try {
      setD(await obtenerDetalle(supabase, id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar la inspección.");
      setD((previo) => previo ?? null);
    }
  }, [supabase, id]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const refrescar = async () => {
    setActualizando(true);
    await cargar();
    setActualizando(false);
  };

  const descargarPdf = async () => {
    if (pdf.trabajando) return;
    setPdf({ trabajando: true });
    const r = await entregarPdfOficial(supabase, id);
    setPdf({ trabajando: false, error: r.error });
  };

  const etapa = d ? etapaPendiente(d.status, rol) : null;

  return (
    <>
      <Stack.Screen options={{ title: d?.folio ?? "Revisión" }} />
      <ScrollView
        contentContainerStyle={[estilos.contenido, { paddingBottom: insets.bottom + 24 }]}
        refreshControl={<RefreshControl refreshing={actualizando} onRefresh={() => void refrescar()} />}
      >
        {d === undefined ? <ActivityIndicator style={{ marginTop: 48 }} /> : null}
        {error ? <Aviso texto={error} /> : null}
        {d === null && !error ? <Aviso texto="No se encontró la inspección o su cuenta no puede verla." /> : null}
        {d ? (
          <>
            {firmada ? <Aviso tono="ok" texto="Firma registrada. La inspección se actualizó." /> : null}
            <Boton
              texto={pdf.trabajando ? "Preparando PDF…" : "PDF oficial · Guardar o compartir"}
              variante="secundario"
              onPress={() => void descargarPdf()}
              deshabilitado={pdf.trabajando}
            />
            {pdf.error ? <Aviso texto={pdf.error} /> : null}
            <DetalleRevision d={d} />
            {etapa ? (
              <PanelRevision
                inspeccionId={d.id}
                folio={d.folio ?? "sin folio"}
                etapa={etapa}
                onFirmada={() => {
                  setFirmada(true);
                  void cargar();
                }}
              />
            ) : (
              <View style={estilos.sinPanel}>
                <Text style={estilos.sub}>
                  {rol === "admin"
                    ? "El administrador consulta y descarga el informe; no firma."
                    : "A su cuenta no le corresponde firmar esta inspección en su estado actual."}
                </Text>
              </View>
            )}
          </>
        ) : null}
        <PiePagina />
      </ScrollView>
    </>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: 16, gap: 16 },
  sinPanel: { paddingVertical: 4 },
  sub: { color: color.sub, fontSize: 14, textAlign: "center" },
});
