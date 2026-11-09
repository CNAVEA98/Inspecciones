import { Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AccionesPdf } from "@/components/acciones-pdf";
import { DetalleRevision } from "@/components/detalle-revision";
import { PanelRevision } from "@/components/panel-revision";
import { PiePagina } from "@/components/pie-pagina";
import { formatFechaHora } from "@/lib/fecha";
import { useEnLinea } from "@/lib/offline/use-en-linea";
import { redNativa } from "@/lib/offline/red";
import { claveDetalle, conCopia } from "@/lib/revision/cache";
import { etapaPendiente } from "@/lib/revision/estado";
import { precargarImagenes } from "@/lib/revision/precarga";
import type { DetalleInspeccion } from "@/lib/revision/queries";
import { obtenerDetalle } from "@/lib/revision/servidor";
import { useRevision } from "@/lib/revision-contexto";
import { entregarPdfOficial } from "@/lib/tecnico/informe";
import { Aviso } from "@/ui/componentes";
import { color } from "@/ui/tema";

/** Detalle de una inspección para quien revisa: informe completo, PDF oficial y, si le toca, la firma. Sin señal, la última copia. */
export default function RevisionDetalle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { supabase, rol, kv, perfil } = useRevision();
  const enLinea = useEnLinea();
  const insets = useSafeAreaInsets();
  const [d, setD] = useState<DetalleInspeccion | null | undefined>(undefined);
  const [copiaDe, setCopiaDe] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actualizando, setActualizando] = useState(false);
  const [firmada, setFirmada] = useState(false);
  const [desactualizada, setDesactualizada] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setError(null);
    try {
      const r = await conCopia(kv, claveDetalle(perfil.userId, id), redNativa.enLinea(), () => obtenerDetalle(supabase, id));
      setD(r.datos);
      setCopiaDe(r.copiaDe);
      if (r.datos && r.copiaDe === null) void precargarImagenes(r.datos);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar la inspección.");
      setD((previo) => previo ?? null);
    }
  }, [supabase, kv, perfil.userId, id]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  // Al volver la señal se actualiza solo (la copia puede estar atrasada).
  useEffect(() => {
    if (enLinea && copiaDe !== null) void cargar();
  }, [enLinea, copiaDe, cargar]);

  const refrescar = async () => {
    setActualizando(true);
    await cargar();
    setActualizando(false);
  };

  const etapa = d ? etapaPendiente(d.status, rol) : null;
  const sinSenal = !enLinea || copiaDe !== null;

  return (
    <>
      <Stack.Screen options={{ title: d?.folio ?? "Revisión" }} />
      <ScrollView
        contentContainerStyle={[estilos.contenido, { paddingBottom: insets.bottom + 24 }]}
        refreshControl={<RefreshControl refreshing={actualizando} onRefresh={() => void refrescar()} />}
      >
        {d === undefined ? <ActivityIndicator style={{ marginTop: 48 }} /> : null}
        {error ? <Aviso texto={error} /> : null}
        {copiaDe !== null ? (
          <Aviso tono="neutro" texto={`Sin señal: copia guardada el ${formatFechaHora(copiaDe)}. Puede no tener los últimos cambios.`} />
        ) : null}
        {d === null && !error ? <Aviso texto="No se encontró la inspección o su cuenta no puede verla." /> : null}
        {d ? (
          <>
            {firmada ? <Aviso tono="ok" texto="Firma registrada. La inspección se actualizó." /> : null}
            {desactualizada ? <Aviso tono="cobre" texto={desactualizada} /> : null}
            <AccionesPdf oficial obtener={(destino) => entregarPdfOficial(supabase, id, destino)} />
            <DetalleRevision d={d} />
            {etapa && sinSenal ? (
              <Aviso
                tono="cobre"
                texto="Le corresponde firmar esta inspección, pero la firma necesita señal. Revise el informe ahora y firme cuando vuelva la conexión (tire hacia abajo para actualizar)."
              />
            ) : etapa ? (
              <PanelRevision
                inspeccionId={d.id}
                folio={d.folio ?? "sin folio"}
                etapa={etapa}
                onFirmada={() => {
                  setFirmada(true);
                  void cargar();
                }}
                onDesactualizada={(mensaje) => {
                  setDesactualizada(mensaje);
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
