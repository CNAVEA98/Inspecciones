import { FlashList } from "@shopify/flash-list";
import { memo, useCallback, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { CodigoArea } from "@/lib/formatos/catalogo";
import {
  ETIQUETA_ESTADO,
  conExtras,
  conTag,
  equiposDelFormato,
  esProvisional,
  extrasDe,
  filtrarEquipos,
  seleccionDe,
  seleccionDeCabecera,
  sectoresDe,
  type Equipo,
  type SeleccionTag,
} from "@/lib/formatos/tags";
import { Boton, Campo } from "@/ui/componentes";
import { color } from "@/ui/tema";

/** El Maestro pesa unos 400 KB: se carga la primera vez que se abre el buscador, no al iniciar la app. */
let maestro: Equipo[] | null = null;
function equiposDelMaestro(): Equipo[] {
  maestro ??= require("@/data/maestro-tags.json") as Equipo[];
  return maestro;
}

function Insignia({ estado }: { estado: SeleccionTag["estado"] }) {
  const texto = ETIQUETA_ESTADO[estado];
  if (!texto) return null;
  const fuerte = esProvisional(estado) || estado === "sin_tag";
  return (
    <View style={[estilos.insignia, { backgroundColor: fuerte ? color.cuSuave : color.neutroSuave }]}>
      <Text style={[estilos.insigniaTexto, { color: fuerte ? color.cuTexto : color.sub }]}>{texto}</Text>
    </View>
  );
}

const FilaEquipo = memo(function FilaEquipo({ e, onElegir }: { e: Equipo; onElegir: (e: Equipo) => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={() => onElegir(e)} style={estilos.fila}>
      <View style={estilos.filaTag}>
        <Text style={estilos.tag}>{e.tag}</Text>
        <Insignia estado={e.estado} />
        {e.tipoTrafo ? (
          <View style={[estilos.insignia, { backgroundColor: color.neutroSuave }]}>
            <Text style={[estilos.insigniaTexto, { color: color.sub }]}>{e.tipoTrafo === "piso" ? "De piso" : "Aéreo"}</Text>
          </View>
        ) : null}
      </View>
      <Text style={estilos.nombre}>{e.nombre}</Text>
      <Text style={estilos.detalle}>
        {e.instalacion}
        {e.sector ? ` · ${e.sector}` : ""}
      </Text>
      {e.datos ? <Text style={estilos.detalle}>{e.datos}</Text> : null}
    </Pressable>
  );
});

interface BuscadorProps {
  area: CodigoArea;
  designadores: string[];
  tramo: boolean;
  onElegir: (sel: SeleccionTag) => void;
  onCerrar: () => void;
}

/** Lista filtrada por formato y área, con búsqueda, sectores y la opción de equipo sin TAG. */
function Buscador({ area, designadores, tramo, onElegir, onCerrar }: BuscadorProps) {
  const insets = useSafeAreaInsets();
  const equipos = equiposDelMaestro();
  const [texto, setTexto] = useState("");
  const [todasAreas, setTodasAreas] = useState(false);
  const [sector, setSector] = useState<string | null>(null);
  const [sinTag, setSinTag] = useState(false);
  const [nombre, setNombre] = useState("");

  const delFormato = useMemo(
    () => equiposDelFormato(equipos, { designadores, area, todasAreas }),
    [equipos, designadores, area, todasAreas],
  );
  const sectores = useMemo(() => sectoresDe(delFormato), [delFormato]);
  const lista = useMemo(
    () => filtrarEquipos(equipos, { designadores, area, todasAreas, sector, texto }),
    [equipos, designadores, area, todasAreas, sector, texto],
  );
  const elegir = useCallback((e: Equipo) => onElegir(seleccionDe(e)), [onElegir]);

  if (sinTag) {
    return (
      <View style={[estilos.hoja, { paddingTop: 20, paddingBottom: insets.bottom + 16 }]}>
        <Campo
          etiqueta={tramo ? "Nombre del tramo o ubicación" : "Nombre del equipo"}
          value={nombre}
          onChangeText={setNombre}
          autoFocus
          autoCorrect={false}
        />
        <Text style={estilos.detalle}>Queda marcado como pendiente de revisión para que supervisión lo identifique.</Text>
        <Boton texto="Usar este nombre" onPress={() => onElegir({ tag: nombre.trim(), estado: "sin_tag" })} deshabilitado={!nombre.trim()} />
        <Boton texto="Volver" variante="secundario" onPress={() => setSinTag(false)} />
      </View>
    );
  }

  return (
    <View style={[estilos.hoja, { paddingTop: 20, paddingBottom: insets.bottom + 16 }]}>
      <TextInput
        value={texto}
        onChangeText={setTexto}
        placeholder="Buscar por TAG, nombre o instalación…"
        placeholderTextColor={color.sub}
        accessibilityLabel="Buscar equipo"
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        style={estilos.busqueda}
      />

      {sectores.length > 1 ? (
        <View style={estilos.sectores}>
          {[{ sector: null as string | null, cantidad: delFormato.length }, ...sectores].map((s) => {
            const activo = sector === s.sector;
            return (
              <Pressable
                key={s.sector ?? "todos"}
                accessibilityRole="button"
                accessibilityState={{ selected: activo }}
                onPress={() => setSector(s.sector)}
                style={[estilos.sector, activo && { backgroundColor: color.graf, borderColor: color.graf }]}
              >
                <Text style={[estilos.sectorTexto, activo && { color: color.blanco }]}>
                  {s.sector ?? "Todos"} <Text style={{ opacity: 0.7 }}>{s.cantidad}</Text>
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <View style={estilos.interruptor}>
        <Switch
          value={todasAreas}
          onValueChange={(v) => {
            setTodasAreas(v);
            setSector(null);
          }}
          trackColor={{ true: color.cu }}
        />
        <Text style={estilos.interruptorTexto}>Ver todas las áreas</Text>
      </View>

      <View style={{ flex: 1 }}>
        {lista.length === 0 ? (
          <Text style={estilos.vacio}>No hay equipos con ese filtro.{todasAreas ? "" : " Pruebe «Ver todas las áreas»."}</Text>
        ) : (
          <FlashList
            data={lista}
            renderItem={({ item }) => <FilaEquipo e={item} onElegir={elegir} />}
            keyExtractor={(e) => e.tag}
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={Separador}
          />
        )}
      </View>

      <View style={estilos.pie}>
        <Boton texto={tramo ? "Otro tramo (escribir)" : "Equipo sin TAG"} variante="secundario" onPress={() => setSinTag(true)} style={{ flex: 1 }} />
        <Boton texto="Cancelar" variante="secundario" onPress={onCerrar} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const Separador = () => <View style={{ height: 8 }} />;

function Elegido({ sel, onQuitar, etiquetaQuitar }: { sel: SeleccionTag; onQuitar?: () => void; etiquetaQuitar: string }) {
  return (
    <View style={estilos.elegido}>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={estilos.elegidoTag}>{sel.tag}</Text>
        <View style={estilos.filaTag}>
          <Insignia estado={sel.estado} />
          {sel.tagOriginal ? <Text style={estilos.detalle}>TAG original: {sel.tagOriginal}</Text> : null}
        </View>
      </View>
      {onQuitar ? <Boton texto={etiquetaQuitar} variante="secundario" onPress={onQuitar} style={estilos.botonChico} /> : null}
    </View>
  );
}

interface Props {
  etiqueta: string;
  area: CodigoArea;
  designadores: string[];
  /** «Tramo o ubicación» en lugar de TAG de equipo. */
  tramo: boolean;
  variosEquipos: boolean;
  header: Record<string, string>;
  onHeader: (cambio: (h: Record<string, string>) => Record<string, string>) => void;
  deshabilitado: boolean;
}

/** Campo «TAG del equipo» del formulario. Guarda en la cabecera: `tag` (texto), `tag_estado` y `tag_original`. */
export function SelectorTag({ etiqueta, area, designadores, tramo, variosEquipos, header, onHeader, deshabilitado }: Props) {
  const [buscando, setBuscando] = useState<"principal" | "extra" | null>(null);
  const elegido = seleccionDeCabecera(header);
  const extras = extrasDe(header);

  // Tramos sin lista en el Maestro (sin designador): texto simple.
  if (tramo && designadores.length === 0) {
    return (
      <Campo
        etiqueta={etiqueta}
        value={header.tag ?? ""}
        editable={!deshabilitado}
        onChangeText={(t) => onHeader((h) => ({ ...conTag(h, null), tag: t }))}
      />
    );
  }

  const elegirEquipo = (sel: SeleccionTag) => {
    if (buscando === "extra") onHeader((h) => conExtras(h, [...extrasDe(h), sel]));
    else onHeader((h) => conTag(h, sel));
    setBuscando(null);
  };

  return (
    <View style={{ gap: 8 }}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      {elegido ? (
        <Elegido sel={elegido} etiquetaQuitar="Cambiar" onQuitar={deshabilitado ? undefined : () => onHeader((h) => conTag(h, null))} />
      ) : deshabilitado ? null : (
        <Boton texto={tramo ? "Buscar tramo o ubicación" : "Buscar equipo"} variante="secundario" onPress={() => setBuscando("principal")} />
      )}

      {variosEquipos && elegido ? (
        <View style={{ gap: 8 }}>
          {extras.map((x, i) => (
            <Elegido
              key={`${x.tag}-${i}`}
              sel={x}
              etiquetaQuitar="Quitar"
              onQuitar={deshabilitado ? undefined : () => onHeader((h) => conExtras(h, extrasDe(h).filter((_, j) => j !== i)))}
            />
          ))}
          {deshabilitado ? null : (
            <Boton texto="+ Equipo" variante="secundario" onPress={() => setBuscando("extra")} style={{ alignSelf: "flex-start" }} />
          )}
        </View>
      ) : null}

      <Modal visible={buscando !== null} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setBuscando(null)}>
        {buscando ? (
          <Buscador area={area} designadores={designadores} tramo={tramo} onElegir={elegirEquipo} onCerrar={() => setBuscando(null)} />
        ) : null}
      </Modal>
    </View>
  );
}

const estilos = StyleSheet.create({
  hoja: { flex: 1, backgroundColor: color.papel, paddingHorizontal: 16, gap: 12 },
  etiqueta: { color: color.graf, fontSize: 14, fontWeight: "600" },
  busqueda: {
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: color.borde,
    backgroundColor: color.blanco,
    paddingHorizontal: 16,
    fontSize: 18,
    color: color.graf,
  },
  sectores: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sector: {
    minHeight: 44,
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: color.borde,
    backgroundColor: color.blanco,
    paddingHorizontal: 16,
  },
  sectorTexto: { color: color.graf, fontSize: 16, fontWeight: "600" },
  interruptor: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 48 },
  interruptorTexto: { color: color.graf, fontSize: 16, fontWeight: "500" },
  vacio: { color: color.sub, fontSize: 16, backgroundColor: color.neutroSuave, borderRadius: 12, padding: 16 },
  fila: {
    minHeight: 64,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: color.borde,
    backgroundColor: color.blanco,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 2,
  },
  filaTag: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  tag: { color: color.graf, fontSize: 18, fontWeight: "700", fontVariant: ["tabular-nums"] },
  nombre: { color: color.graf, fontSize: 16 },
  detalle: { color: color.sub, fontSize: 14 },
  insignia: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  insigniaTexto: { fontSize: 12, fontWeight: "600" },
  pie: { flexDirection: "row", gap: 12 },
  elegido: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: color.graf,
    backgroundColor: color.blanco,
    padding: 16,
  },
  elegidoTag: { color: color.graf, fontSize: 20, fontWeight: "700", fontVariant: ["tabular-nums"] },
  botonChico: { minHeight: 48 },
});
