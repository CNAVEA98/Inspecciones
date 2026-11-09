import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PiePagina } from "@/components/pie-pagina";
import { SeguimientoHallazgo } from "@/components/seguimiento-hallazgo";
import { formatFechaHora } from "@/lib/fecha";
import { redNativa } from "@/lib/offline/red";
import { useEnLinea } from "@/lib/offline/use-en-linea";
import { claveFallas, conCopia } from "@/lib/revision/cache";
import {
  FILTRO_FALLAS_INICIAL,
  SEVERIDADES_ORDENADAS,
  SEVERIDAD_NOMBRE,
  agruparPorEquipo,
  filtrarFallas,
  type EquipoConFallas,
  type FiltroFallas,
  type HallazgoFalla,
  type Severidad,
} from "@/lib/revision/fallas";
import { listarFallas } from "@/lib/revision/servidor";
import { useRevision } from "@/lib/revision-contexto";
import { Aviso, Campo, Insignia, Tarjeta } from "@/ui/componentes";
import { color, type Tono } from "@/ui/tema";

const TONO_SEV: Record<Severidad, Tono> = { critica: "malo", alta: "malo", media: "cobre", baja: "neutro" };

function Chip({ texto, activo, onPress }: { texto: string; activo: boolean; onPress: () => void }) {
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
}

const TarjetaEquipo = memo(function TarjetaEquipo({
  e,
  puedeGestionar,
  enLinea,
  onGuardado,
}: {
  e: EquipoConFallas;
  puedeGestionar: boolean;
  enLinea: boolean;
  onGuardado: () => void;
}) {
  return (
    <Tarjeta style={estilos.tarjeta}>
      <View style={estilos.filaEntre}>
        <Text style={estilos.tag}>{e.tag || "Sin TAG"}</Text>
        <Insignia texto={SEVERIDAD_NOMBRE[e.severidadMax]} tono={TONO_SEV[e.severidadMax]} />
      </View>
      <Text style={estilos.sub}>
        {e.equipo} · {e.area} · {e.hallazgos.length} {e.hallazgos.length === 1 ? "hallazgo" : "hallazgos"}
      </Text>
      {e.hallazgos.map((h: HallazgoFalla) => (
        <View key={h.id} style={estilos.hallazgo}>
          <View style={estilos.filaEntre}>
            <Text style={estilos.item}>{h.itemTexto}</Text>
            <Insignia texto={SEVERIDAD_NOMBRE[h.severidad]} tono={TONO_SEV[h.severidad]} />
          </View>
          {h.observacion ? <Text style={estilos.sub}>{h.observacion}</Text> : null}
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push({ pathname: "/revision/[id]", params: { id: h.inspeccionId } })}
            style={estilos.enlace}
          >
            <Text style={estilos.enlaceTexto}>
              {h.folio ?? "Sin folio"}
              {h.enviadaEn ? ` · ${formatFechaHora(h.enviadaEn)}` : ""} · Ver inspección
            </Text>
          </Pressable>
          <Text style={estilos.pequeno}>
            Realizó: {h.realizadoPor || "—"}
            {h.turno ? ` · Turno ${h.turno}` : ""}
            {h.ot ? ` · OT ${h.ot}` : ""}
          </Text>
          <SeguimientoHallazgo h={h} puedeGestionar={puedeGestionar} enLinea={enLinea} onGuardado={onGuardado} />
        </View>
      ))}
    </Tarjeta>
  );
});

/**
 * Equipos con fallas (igual que la web): hallazgos «Malo» de las inspecciones vigentes agrupados por equipo, con su seguimiento
 * SAP. Supervisor y administrador registran el seguimiento; el programador consulta. Sin señal, la última copia.
 */
export default function Fallas() {
  const { supabase, rol, kv, perfil } = useRevision();
  const enLinea = useEnLinea();
  const insets = useSafeAreaInsets();
  const [hallazgos, setHallazgos] = useState<HallazgoFalla[] | null>(null);
  const [copiaDe, setCopiaDe] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actualizando, setActualizando] = useState(false);
  const [filtro, setFiltro] = useState<FiltroFallas>(FILTRO_FALLAS_INICIAL);
  const puedeGestionar = rol === "supervisor" || rol === "admin";

  const cargar = useCallback(async () => {
    setError(null);
    try {
      const r = await conCopia(kv, claveFallas(perfil.userId), redNativa.enLinea(), () => listarFallas(supabase));
      setHallazgos(r.datos);
      setCopiaDe(r.copiaDe);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los equipos con fallas.");
      setHallazgos((x) => x ?? []);
    }
  }, [supabase, kv, perfil.userId]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  useEffect(() => {
    if (enLinea && copiaDe !== null) void cargar();
  }, [enLinea, copiaDe, cargar]);

  const refrescar = async () => {
    setActualizando(true);
    await cargar();
    setActualizando(false);
  };

  const equipos = useMemo(() => agruparPorEquipo(filtrarFallas(hallazgos ?? [], filtro)), [hallazgos, filtro]);
  const cambiar = (c: Partial<FiltroFallas>) => setFiltro((f) => ({ ...f, ...c }));
  const onGuardado = useCallback(() => void cargar(), [cargar]);

  const cabecera = (
    <View style={estilos.controles}>
      <Campo etiqueta="Buscar" placeholder="TAG, equipo, área, folio o ítem" value={filtro.q} onChangeText={(q) => cambiar({ q })} autoCapitalize="none" autoCorrect={false} />
      <View style={estilos.chips}>
        <Chip texto="Pendientes" activo={filtro.gestion === "abiertos"} onPress={() => cambiar({ gestion: "abiertos" })} />
        <Chip texto="Todos" activo={filtro.gestion === "todos"} onPress={() => cambiar({ gestion: "todos" })} />
      </View>
      <View style={estilos.chips}>
        <Chip texto="Toda severidad" activo={!filtro.severidad} onPress={() => cambiar({ severidad: "" })} />
        {SEVERIDADES_ORDENADAS.map((s) => (
          <Chip key={s} texto={SEVERIDAD_NOMBRE[s]} activo={filtro.severidad === s} onPress={() => cambiar({ severidad: s })} />
        ))}
      </View>
      <View style={estilos.chips}>
        <Chip texto="Todos los turnos" activo={!filtro.turno} onPress={() => cambiar({ turno: "" })} />
        <Chip texto="Turno A" activo={filtro.turno === "A"} onPress={() => cambiar({ turno: "A" })} />
        <Chip texto="Turno B" activo={filtro.turno === "B"} onPress={() => cambiar({ turno: "B" })} />
      </View>
      {copiaDe !== null ? (
        <Aviso tono="neutro" texto={`Sin señal: datos guardados el ${formatFechaHora(copiaDe)}. Para registrar seguimiento necesita señal.`} />
      ) : null}
      {error ? <Aviso texto={error} /> : null}
      <Text style={estilos.sub}>
        {hallazgos === null
          ? "Cargando…"
          : `${equipos.length} ${equipos.length === 1 ? "equipo" : "equipos"} · ${equipos.reduce((n, e) => n + e.hallazgos.length, 0)} hallazgos`}
      </Text>
      {!puedeGestionar ? <Text style={estilos.pequeno}>El seguimiento lo registra la Supervisión; su cuenta consulta.</Text> : null}
    </View>
  );

  return (
    <FlashList
      data={equipos}
      keyExtractor={(e) => `${e.tag}|${e.area}`}
      renderItem={({ item }) => <TarjetaEquipo e={item} puedeGestionar={puedeGestionar} enLinea={enLinea} onGuardado={onGuardado} />}
      ListHeaderComponent={cabecera}
      ListEmptyComponent={
        hallazgos === null ? null : (
          <Tarjeta style={estilos.tarjeta}>
            <Text style={estilos.item}>Sin equipos con fallas</Text>
            <Text style={estilos.sub}>
              {filtro.gestion === "abiertos" ? "No hay hallazgos pendientes con este filtro." : "Pruebe con otro filtro."}
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
  );
}

const estilos = StyleSheet.create({
  controles: { gap: 12, marginBottom: 16 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { minHeight: 44, justifyContent: "center", paddingHorizontal: 16, borderRadius: 999, borderWidth: 1.5, borderColor: color.graf, backgroundColor: color.blanco },
  chipActivo: { backgroundColor: color.graf },
  chipTexto: { fontSize: 15, fontWeight: "600", color: color.graf },
  tarjeta: { gap: 8, padding: 16 },
  filaEntre: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  tag: { fontSize: 17, fontWeight: "700", fontFamily: "monospace", color: color.graf },
  item: { flex: 1, fontSize: 16, fontWeight: "700", color: color.graf },
  sub: { fontSize: 14, color: color.sub },
  pequeno: { fontSize: 13, color: color.sub },
  hallazgo: { gap: 4, backgroundColor: color.neutroSuave, borderRadius: 12, padding: 12 },
  enlace: { minHeight: 44, justifyContent: "center" },
  enlaceTexto: { color: color.cu, fontSize: 14, fontWeight: "700" },
});
