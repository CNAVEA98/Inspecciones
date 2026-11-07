import { memo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View, type LayoutChangeEvent } from "react-native";
import { ESTADOS_INSPECCION, type Estado, type TemplateItem, type VerificationValue } from "@/lib/templates/schema";
import { SEVERIDADES, type Severity } from "@/lib/tecnico/draft";
import { Campo } from "@/ui/componentes";
import { color } from "@/ui/tema";
import { FotoCampo } from "./foto-campo";

const ESTADOS: { code: Estado; palabra: string; activo: string }[] = [
  { code: "BN", palabra: "Bueno", activo: color.ok },
  { code: "ML", palabra: "Malo", activo: color.malo },
  { code: "NT", palabra: "No tiene", activo: "#6a6d70" },
  { code: "NA", palabra: "No aplica", activo: "#8a6d00" },
  { code: "NR", palabra: "No realizada", activo: "#8a4b1d" },
  { code: "RL", palabra: "Realizado", activo: color.ok },
  { code: "RMP", palabra: "Reemplazado", activo: "#1f5f8a" },
  { code: "SI", palabra: "Sí", activo: color.ok },
  { code: "NO", palabra: "No", activo: "#6a6d70" },
];

/** Columnas de la botonera según cuántos estados se ofrecen (igual que la web). */
const COLUMNAS: Record<number, number> = { 2: 2, 3: 3, 4: 4, 5: 5, 6: 3, 7: 4, 8: 4, 9: 3 };

export interface ItemFieldProps {
  item: TemplateItem;
  index: number;
  /** Estados que se ofrecen en un ítem de verificación (si falta, los de inspección). */
  estados?: readonly Estado[];
  inspectionId: string;
  value: unknown;
  severity?: Severity;
  onChange: (itemId: string, value: unknown) => void;
  onSeverity: (itemId: string, s: Severity) => void;
  /** Posición del ítem dentro del formulario, para saltar a él desde «Falta completar». */
  onLayout?: (itemId: string, e: LayoutChangeEvent) => void;
}

/** Un ítem de la plantilla. Se dibuja según su tipo: el formulario no conoce equipos concretos. */
export const ItemField = memo(function ItemField(props: ItemFieldProps) {
  const { item, index, value, onChange, onLayout } = props;
  return (
    <View style={estilos.item} onLayout={(e) => onLayout?.(item.id, e)}>
      <View style={estilos.encabezado}>
        <View style={estilos.numero}>
          <Text style={estilos.numeroTexto}>{String(index).padStart(2, "0")}</Text>
        </View>
        <Text style={estilos.etiqueta}>{item.label}</Text>
      </View>
      <View style={estilos.cuerpo}>
        {item.type === "verificacion" ? (
          <Verificacion {...props} item={item} value={value as Partial<VerificationValue> | undefined} />
        ) : null}
        {item.type === "number" ? (
          <NumeroInput
            unidad={item.unit}
            inicial={typeof value === "number" ? value : undefined}
            onChange={(n) => onChange(item.id, n)}
          />
        ) : null}
        {item.type === "text" ? (
          <Campo
            accessibilityLabel={item.label}
            multilinea
            numberOfLines={item.multiline ? 4 : 2}
            value={typeof value === "string" ? value : ""}
            onChangeText={(t) => onChange(item.id, t)}
          />
        ) : null}
        {item.type === "photo" ? (
          <FotoCampo
            inspectionId={props.inspectionId}
            ids={Array.isArray(value) ? (value as string[]) : []}
            max={item.maxPhotos}
            onChange={(ids) => onChange(item.id, ids)}
          />
        ) : null}
        {item.type === "nameplate" ? (
          <View style={estilos.placa}>
            {item.fields.map((f) => (
              <Campo
                key={f.key}
                etiqueta={`${f.label}${f.unit ? ` (${f.unit})` : ""}`}
                value={((value as Record<string, string> | undefined) ?? {})[f.key] ?? ""}
                onChangeText={(t) => onChange(item.id, { ...((value as Record<string, string> | undefined) ?? {}), [f.key]: t })}
              />
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
});

/** Valor numérico: se edita como texto y se guarda como número solo cuando es válido. */
function NumeroInput({
  unidad,
  inicial,
  onChange,
}: {
  unidad: string;
  inicial: number | undefined;
  onChange: (n: number | undefined) => void;
}) {
  const [texto, setTexto] = useState(inicial === undefined ? "" : String(inicial).replace(".", ","));
  return (
    <View style={estilos.numeroFila}>
      <TextInput
        keyboardType="decimal-pad"
        accessibilityLabel={`Valor en ${unidad}`}
        value={texto}
        onChangeText={(t) => {
          setTexto(t);
          const n = Number(t.replace(",", "."));
          onChange(t.trim() !== "" && Number.isFinite(n) ? n : undefined);
        }}
        style={estilos.numeroCampo}
      />
      <Text style={estilos.unidad}>{unidad}</Text>
    </View>
  );
}

function Verificacion({
  item,
  value,
  inspectionId,
  onChange,
  severity,
  onSeverity,
  estados,
}: ItemFieldProps & { item: Extract<TemplateItem, { type: "verificacion" }>; value: Partial<VerificationValue> | undefined }) {
  const v = value ?? {};
  const set = (patch: Partial<VerificationValue>) => onChange(item.id, { ...v, ...patch });
  const critico = v.estado === "ML";
  const necesitaMotivo = v.estado === "NR" || v.estado === "RMP";
  const ofrecidos = (estados ?? ESTADOS_INSPECCION).flatMap((c) => ESTADOS.filter((e) => e.code === c));
  const columnas = COLUMNAS[ofrecidos.length] ?? 4;
  const sev = severity ?? "media";

  return (
    <View style={estilos.verificacion}>
      <View accessibilityRole="radiogroup" style={estilos.estados}>
        {ofrecidos.map((e) => {
          const activo = v.estado === e.code;
          return (
            <View key={e.code} style={{ width: `${100 / columnas}%`, padding: 3 }}>
              <Pressable
                accessibilityRole="radio"
                accessibilityLabel={`${e.code} ${e.palabra}`}
                accessibilityState={{ selected: activo }}
                onPress={() => set({ estado: e.code })}
                style={[estilos.estado, activo && { backgroundColor: e.activo, borderColor: "transparent" }]}
              >
                <Text style={[estilos.estadoCodigo, activo && { color: color.blanco }]}>{e.code}</Text>
                <Text style={[estilos.estadoPalabra, activo && { color: color.blanco }]} numberOfLines={2}>
                  {e.palabra}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      {item.unit !== undefined ? (
        <View style={estilos.numeroFila}>
          <Text style={estilos.etiquetaChica}>Valor</Text>
          <NumeroInput unidad={item.unit || "valor"} inicial={v.valor} onChange={(n) => set({ valor: n })} />
        </View>
      ) : null}

      {critico ? (
        <View style={{ gap: 8 }}>
          <Text style={estilos.etiquetaChica}>Severidad del hallazgo</Text>
          <View style={estilos.severidades}>
            {SEVERIDADES.map((s) => (
              <Pressable
                key={s.value}
                accessibilityRole="radio"
                accessibilityState={{ selected: sev === s.value }}
                onPress={() => onSeverity(item.id, s.value)}
                style={[estilos.severidad, sev === s.value && { backgroundColor: color.graf, borderColor: color.graf }]}
              >
                <Text style={[estilos.severidadTexto, sev === s.value && { color: color.blanco }]}>{s.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <Campo
        etiqueta={`Observación${critico || necesitaMotivo ? " (obligatoria)" : ""}`}
        multilinea
        numberOfLines={2}
        value={v.obs ?? ""}
        onChangeText={(t) => set({ obs: t })}
      />

      <View style={{ gap: 8 }}>
        <Text style={estilos.etiquetaChica}>Foto (opcional)</Text>
        <FotoCampo inspectionId={inspectionId} ids={v.fotos ?? []} max={3} onChange={(ids) => set({ fotos: ids })} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  item: { borderRadius: 16, borderWidth: 1.5, borderColor: color.linea, backgroundColor: color.blanco, padding: 16 },
  encabezado: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  numero: { borderRadius: 999, backgroundColor: color.graf, paddingHorizontal: 10, paddingVertical: 2, marginTop: 2 },
  numeroTexto: { color: color.blanco, fontSize: 14, fontWeight: "600", fontVariant: ["tabular-nums"] },
  etiqueta: { flex: 1, color: color.graf, fontSize: 18, fontWeight: "500", lineHeight: 24 },
  cuerpo: { marginTop: 16 },
  placa: { gap: 12 },
  verificacion: { gap: 16 },
  estados: { flexDirection: "row", flexWrap: "wrap", margin: -3 },
  estado: {
    minHeight: 64,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: color.borde,
    backgroundColor: color.blanco,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  estadoCodigo: { color: color.graf, fontSize: 18, fontWeight: "700" },
  estadoPalabra: { color: color.graf, fontSize: 11, textAlign: "center" },
  etiquetaChica: { color: color.graf, fontSize: 14, fontWeight: "600" },
  numeroFila: { flexDirection: "row", alignItems: "center", gap: 12 },
  numeroCampo: {
    minHeight: 56,
    width: 150,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: color.borde,
    backgroundColor: color.blanco,
    paddingHorizontal: 16,
    fontSize: 18,
    color: color.graf,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
  unidad: { color: color.sub, fontSize: 18, fontWeight: "600" },
  severidades: { flexDirection: "row", gap: 6 },
  severidad: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: color.borde,
    backgroundColor: color.blanco,
    alignItems: "center",
    justifyContent: "center",
  },
  severidadTexto: { color: color.graf, fontSize: 14, fontWeight: "600" },
});
