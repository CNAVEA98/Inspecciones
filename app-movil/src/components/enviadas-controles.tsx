import { memo, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { formatFechaHora } from "@/lib/fecha";
import { FILTROS_ESTADO, type FiltroEstado } from "@/lib/tecnico/buscar-enviadas";
import { Aviso, Boton } from "@/ui/componentes";
import { color } from "@/ui/tema";

const ESPERA_BUSQUEDA_MS = 180;

interface ControlesProps {
  conteos: Record<FiltroEstado, number>;
  estado: FiltroEstado;
  onEstado: (e: FiltroEstado) => void;
  /** Texto de búsqueda (ya con la espera aplicada). */
  onBuscar: (texto: string) => void;
  actualizadoEn: number | null;
  actualizando: boolean;
  onActualizar: () => void;
  /** Aviso bajo el título (sin conexión, no se pudo actualizar, error del servidor…). */
  aviso: string | null;
  /** Se están mostrando resultados de la búsqueda en el servidor, no las últimas guardadas. */
  enServidor: boolean;
  onVolverALocales: () => void;
}

/**
 * Cabecera de «Enviadas»: título con «Actualizar», buscador y filtros por estado. El texto se escribe en un estado propio y se
 * entrega con una pequeña espera, para que la lista no se recalcule en cada letra.
 */
export const ControlesEnviadas = memo(function ControlesEnviadas(p: ControlesProps) {
  const [texto, setTexto] = useState("");
  const alBuscar = useRef(p.onBuscar);
  useEffect(() => {
    alBuscar.current = p.onBuscar;
  });
  useEffect(() => {
    const t = setTimeout(() => alBuscar.current(texto), ESPERA_BUSQUEDA_MS);
    return () => clearTimeout(t);
  }, [texto]);

  return (
    <View style={estilos.caja}>
      <View style={estilos.titulo}>
        <Text style={estilos.seccion}>Enviadas</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Actualizar enviadas"
          disabled={p.actualizando}
          onPress={p.onActualizar}
          style={[estilos.actualizar, p.actualizando && { opacity: 0.6 }]}
        >
          <Text style={estilos.actualizarTexto}>{p.actualizando ? "Actualizando…" : "↻ Actualizar"}</Text>
        </Pressable>
      </View>
      {p.actualizadoEn ? <Text style={estilos.fecha}>Actualizado {formatFechaHora(p.actualizadoEn)}</Text> : null}
      {p.aviso ? <Aviso tono="cobre" texto={p.aviso} /> : null}

      <View style={estilos.busqueda}>
        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder="Buscar por TAG, folio, nombre, fecha…"
          placeholderTextColor={color.sub}
          accessibilityLabel="Buscar en enviadas"
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="while-editing"
          style={estilos.campo}
        />
        {texto ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Borrar búsqueda" onPress={() => setTexto("")} style={estilos.borrar}>
            <Text style={estilos.borrarTexto}>×</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={estilos.chips}>
        {FILTROS_ESTADO.map((f) => {
          const activo = p.estado === f.valor;
          return (
            <Pressable
              key={f.valor}
              accessibilityRole="button"
              accessibilityState={{ selected: activo }}
              onPress={() => p.onEstado(f.valor)}
              style={[estilos.chip, activo && { backgroundColor: color.graf, borderColor: color.graf }]}
            >
              <Text style={[estilos.chipTexto, activo && { color: color.blanco }]}>
                {f.texto} <Text style={{ opacity: 0.7 }}>{p.conteos[f.valor]}</Text>
              </Text>
            </Pressable>
          );
        })}
      </View>

      {p.enServidor ? (
        <View style={estilos.servidor}>
          <Text style={estilos.servidorTexto}>Resultados del servidor (todo el historial).</Text>
          <Pressable accessibilityRole="button" onPress={p.onVolverALocales} style={estilos.volver}>
            <Text style={estilos.volverTexto}>Volver a las últimas</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
});

interface PieProps {
  /** Cuántas coinciden en total y cuántas se están mostrando. */
  total: number;
  mostrando: number;
  hayFiltro: boolean;
  enServidor: boolean;
  /** Texto escrito, para ofrecer buscarlo en el servidor. */
  textoBuscado: string;
  buscandoServidor: boolean;
  onVerMas: () => void;
  onBuscarServidor: () => void;
}

/** Pie de «Enviadas»: «Ver más», mensaje de sin resultados y búsqueda en todo el historial. */
export const PieEnviadas = memo(function PieEnviadas(p: PieProps) {
  const quedan = p.total - p.mostrando;
  return (
    <View style={estilos.pie}>
      {p.total === 0 ? (
        <Text style={estilos.vacio}>{p.hayFiltro ? "No hay inspecciones que coincidan con la búsqueda." : "Aún no hay inspecciones enviadas."}</Text>
      ) : null}
      {quedan > 0 ? <Boton texto={`Ver más (${quedan})`} variante="secundario" onPress={p.onVerMas} /> : null}
      {p.textoBuscado.trim().length >= 2 && !p.enServidor ? (
        <Boton
          texto={p.buscandoServidor ? "Buscando…" : "Buscar en todo el historial"}
          variante="secundario"
          onPress={p.onBuscarServidor}
          deshabilitado={p.buscandoServidor}
        />
      ) : null}
    </View>
  );
});

const estilos = StyleSheet.create({
  caja: { gap: 10 },
  titulo: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  seccion: { color: color.graf, fontSize: 24, fontWeight: "700" },
  actualizar: {
    minHeight: 44,
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: color.graf,
    backgroundColor: color.blanco,
    paddingHorizontal: 16,
  },
  actualizarTexto: { color: color.graf, fontSize: 15, fontWeight: "600" },
  fecha: { color: color.sub, fontSize: 13, marginTop: -4 },
  busqueda: { justifyContent: "center" },
  campo: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: color.borde,
    backgroundColor: color.blanco,
    paddingHorizontal: 16,
    paddingRight: 44,
    fontSize: 17,
    color: color.graf,
  },
  borrar: { position: "absolute", right: 0, width: 44, height: 52, alignItems: "center", justifyContent: "center" },
  borrarTexto: { color: color.sub, fontSize: 24, lineHeight: 26 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    minHeight: 40,
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: color.borde,
    backgroundColor: color.blanco,
    paddingHorizontal: 14,
  },
  chipTexto: { color: color.graf, fontSize: 14, fontWeight: "600" },
  servidor: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, borderRadius: 12, backgroundColor: color.neutroSuave, padding: 10 },
  servidorTexto: { flex: 1, color: color.graf, fontSize: 14 },
  volver: { minHeight: 40, justifyContent: "center" },
  volverTexto: { color: color.cuTexto, fontSize: 14, fontWeight: "600", textDecorationLine: "underline" },
  pie: { gap: 10, marginTop: 4 },
  vacio: { color: color.sub, fontSize: 16, backgroundColor: color.neutroSuave, borderRadius: 12, padding: 16 },
});
