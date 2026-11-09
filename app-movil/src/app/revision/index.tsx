import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PiePagina } from "@/components/pie-pagina";
import { formatFechaHora } from "@/lib/fecha";
import { redNativa } from "@/lib/offline/red";
import { useEnLinea } from "@/lib/offline/use-en-linea";
import { claveBandeja, conCopia } from "@/lib/revision/cache";
import { precargarDetalles } from "@/lib/revision/precarga";
import { FILTROS, STATUS_SHORT, estadosDelFiltro, type Filtro, type InspectionStatus } from "@/lib/revision/estado";
import { filtrarBandeja, type TurnoFiltro } from "@/lib/revision/filtrar";
import type { FilaBandeja } from "@/lib/revision/queries";
import { listarBandeja } from "@/lib/revision/servidor";
import { useRevision } from "@/lib/revision-contexto";
import { rolConTurno, useSesion } from "@/lib/sesion";
import { Presionable } from "@/ui/animacion";
import { Aviso, Boton, Campo, Insignia, Tarjeta } from "@/ui/componentes";
import { color, type Tono } from "@/ui/tema";

const TONO: Record<InspectionStatus, Tono> = {
  draft: "neutro",
  submitted: "cobre",
  supervisor_signed: "cobre",
  approved: "ok",
  rejected: "malo",
};

const TURNOS: { valor: TurnoFiltro; etiqueta: string }[] = [
  { valor: "", etiqueta: "Todos los turnos" },
  { valor: "A", etiqueta: "Turno A" },
  { valor: "B", etiqueta: "Turno B" },
];

const Chip = memo(function Chip({ texto, activo, onPress }: { texto: string; activo: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      onPress={onPress}
      style={[estilos.chip, activo && estilos.chipActivo]}
    >
      <Text style={[estilos.chipTexto, activo && { color: color.blanco }]}>{texto}</Text>
    </Pressable>
  );
});

const TarjetaFila = memo(function TarjetaFila({ f }: { f: FilaBandeja }) {
  return (
    <Presionable
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${f.folio ?? "inspección"} ${f.equipmentTag}`}
      onPress={() => router.push({ pathname: "/revision/[id]", params: { id: f.id } })}
    >
      <Tarjeta style={estilos.tarjeta}>
        <View style={estilos.filaEntre}>
          <Text style={estilos.folio}>{f.folio ?? "Sin folio"}</Text>
          <Insignia texto={STATUS_SHORT[f.status]} tono={TONO[f.status]} />
        </View>
        <Text style={estilos.titulo} numberOfLines={2}>
          {f.equipo} · {f.modo}
        </Text>
        <Text style={estilos.tag}>{f.equipmentTag || "Sin TAG"}</Text>
        <Text style={estilos.sub}>
          {f.area} · Realizó: {f.realizadoPor}
          {f.turno ? ` · Turno ${f.turno}` : ""}
        </Text>
        {f.submittedAt ? <Text style={estilos.sub}>Enviada {formatFechaHora(f.submittedAt)}</Text> : null}
      </Tarjeta>
    </Presionable>
  );
});

/**
 * Bandeja de revisión para supervisor, programador y administrador: lo que les toca firmar y el resto, con búsqueda.
 * Con señal deja guardada una copia (y el detalle de las primeras) para revisar sin señal.
 */
export default function Bandeja() {
  const { supabase, rol, perfil, kv } = useRevision();
  const enLinea = useEnLinea();
  const [copiaDe, setCopiaDe] = useState<number | null>(null);
  const [guardadas, setGuardadas] = useState<number | null>(null);
  const { salir } = useSesion();
  const insets = useSafeAreaInsets();
  const [filtro, setFiltro] = useState<Filtro>("pendientes");
  const [turno, setTurno] = useState<TurnoFiltro>("");
  const [q, setQ] = useState("");
  const [filas, setFilas] = useState<FilaBandeja[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actualizando, setActualizando] = useState(false);

  const cargar = useCallback(async () => {
    setError(null);
    try {
      const r = await conCopia(kv, claveBandeja(perfil.userId, filtro), redNativa.enLinea(), () =>
        listarBandeja(supabase, estadosDelFiltro(filtro, rol)),
      );
      setFilas(r.datos);
      setCopiaDe(r.copiaDe);
      // Con señal, deja listos para revisar sin señal los detalles de las primeras de la lista.
      if (r.copiaDe === null) void precargarDetalles(supabase, kv, perfil.userId, r.datos).then((n) => n > 0 && setGuardadas(n));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar la bandeja.");
      setFilas((previas) => previas ?? []);
    }
  }, [supabase, kv, perfil.userId, filtro, rol]);

  useEffect(() => {
    setFilas(null);
  }, [filtro]);

  // Carga al abrir, al cambiar el filtro y al volver del detalle (tras firmar la lista queda al día).
  useFocusEffect(
    useCallback(() => {
      void cargar();
    }, [cargar]),
  );

  // Al volver la señal se actualiza sola.
  useEffect(() => {
    if (enLinea && copiaDe !== null) void cargar();
  }, [enLinea, copiaDe, cargar]);

  const refrescar = async () => {
    setActualizando(true);
    await cargar();
    setActualizando(false);
  };

  const visibles = useMemo(() => filtrarBandeja(filas ?? [], q, turno), [filas, q, turno]);

  const cerrarSesion = () =>
    Alert.alert("¿Cerrar sesión?", "Para volver a revisar deberá ingresar con su usuario y señal.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: () => void salir() },
    ]);

  const cabecera = (
    <View style={estilos.controles}>
      <Campo etiqueta="Buscar" placeholder="Folio, TAG, equipo, área o técnico" value={q} onChangeText={setQ} autoCapitalize="none" autoCorrect={false} />
      <View style={estilos.chips}>
        {FILTROS.map((x) => (
          <Chip key={x.value} texto={x.label} activo={filtro === x.value} onPress={() => setFiltro(x.value)} />
        ))}
      </View>
      <View style={estilos.chips}>
        {TURNOS.map((x) => (
          <Chip key={x.valor || "todos"} texto={x.etiqueta} activo={turno === x.valor} onPress={() => setTurno(x.valor)} />
        ))}
      </View>
      <Boton texto="Equipos con fallas" variante="secundario" onPress={() => router.push("/revision/fallas")} />
      {copiaDe !== null ? (
        <Aviso tono="neutro" texto={`Sin señal: lista guardada el ${formatFechaHora(copiaDe)}. Puede revisar; para firmar necesita señal.`} />
      ) : null}
      {error ? <Aviso texto={error} /> : null}
      {guardadas && copiaDe === null ? (
        <Text style={estilos.sub}>{`${guardadas} ${guardadas === 1 ? "inspección quedó guardada" : "inspecciones quedaron guardadas"} para revisar sin señal.`}</Text>
      ) : null}
      <Text style={estilos.sub}>
        {filas === null ? "Cargando…" : `${visibles.length} ${visibles.length === 1 ? "inspección" : "inspecciones"}${q || turno ? " con este filtro" : ""}`}
      </Text>
    </View>
  );

  return (
    <View style={estilos.pantalla}>
      <View style={[estilos.cabecera, { paddingTop: insets.top + 12 }]}>
        <View style={estilos.filaEntre}>
          <Image source={require("../../../assets/bbosch-logo-solo.png")} style={estilos.logo} contentFit="contain" />
          <Pressable accessibilityRole="button" onPress={cerrarSesion} style={estilos.salir}>
            <Text style={estilos.salirTexto}>Cerrar sesión</Text>
          </Pressable>
        </View>
        <Text style={estilos.kicker}>REVISIÓN DE INSPECCIONES</Text>
        <Text style={estilos.rol} numberOfLines={1}>
          {rolConTurno(perfil)}
        </Text>
        {perfil.nombre ? <Text style={estilos.kicker}>{perfil.nombre}</Text> : null}
      </View>

      <FlashList
        data={visibles}
        keyExtractor={(f) => f.id}
        renderItem={({ item }) => <TarjetaFila f={item} />}
        ListHeaderComponent={cabecera}
        ListEmptyComponent={
          filas === null ? null : (
            <Tarjeta style={estilos.tarjeta}>
              <Text style={estilos.titulo}>No hay inspecciones aquí</Text>
              <Text style={estilos.sub}>
                {filtro === "pendientes" ? "Nada por firmar por ahora." : "Pruebe con otro filtro o búsqueda."}
              </Text>
            </Tarjeta>
          )
        }
        ListFooterComponent={<PiePagina />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshControl={<RefreshControl refreshing={actualizando} onRefresh={() => void refrescar()} />}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.papel },
  cabecera: {
    backgroundColor: color.graf,
    borderBottomWidth: 3,
    borderBottomColor: color.cu,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 18,
    gap: 4,
  },
  filaEntre: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  logo: { width: 110, height: 28 },
  salir: { minHeight: 44, justifyContent: "center", borderRadius: 999, borderWidth: 1.5, borderColor: color.blanco, paddingHorizontal: 16 },
  salirTexto: { color: color.blanco, fontSize: 15, fontWeight: "600" },
  kicker: { color: "#9aa4ad", fontSize: 11, letterSpacing: 1.2, marginTop: 8 },
  rol: { color: color.blanco, fontSize: 22, fontWeight: "700" },
  controles: { gap: 12, marginBottom: 16 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { minHeight: 44, justifyContent: "center", paddingHorizontal: 16, borderRadius: 999, borderWidth: 1.5, borderColor: color.graf, backgroundColor: color.blanco },
  chipActivo: { backgroundColor: color.graf },
  chipTexto: { fontSize: 15, fontWeight: "600", color: color.graf },
  tarjeta: { gap: 6, padding: 16 },
  folio: { fontSize: 14, fontWeight: "700", color: color.sub, fontFamily: "monospace" },
  titulo: { fontSize: 17, fontWeight: "700", color: color.graf },
  tag: { fontSize: 15, fontFamily: "monospace", color: color.graf },
  sub: { fontSize: 14, color: color.sub },
});
