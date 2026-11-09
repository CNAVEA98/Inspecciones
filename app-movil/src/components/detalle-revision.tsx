import { Image } from "expo-image";
import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { ETIQUETA_ESTADO, extrasDe, seleccionDeCabecera } from "@/lib/formatos/tags";
import { formatFechaHora } from "@/lib/fecha";
import { STATUS_LABEL } from "@/lib/revision/estado";
import type { Adjunto, DetalleInspeccion } from "@/lib/revision/queries";
import { expandirPlantilla } from "@/lib/templates/repetir";
import type { TemplateItem, VerificationValue } from "@/lib/templates/schema";
import { Insignia, Tarjeta } from "@/ui/componentes";
import { color, type Tono } from "@/ui/tema";

const ESTADO_NOMBRE: Record<string, string> = {
  BN: "Bueno",
  ML: "Malo",
  NT: "No tiene",
  NA: "No aplica",
  NR: "No realizada",
  RL: "Realizado",
  RMP: "Reemplazado",
  SI: "Sí",
  NO: "No",
};

const SEVERIDAD: Record<string, { nombre: string; tono: Tono }> = {
  baja: { nombre: "Baja", tono: "neutro" },
  media: { nombre: "Media", tono: "cobre" },
  alta: { nombre: "Alta", tono: "malo" },
  critica: { nombre: "Crítica", tono: "malo" },
};

const tonoEstado = (s: string): Tono => (s === "ML" ? "malo" : s === "approved" ? "ok" : s === "rejected" ? "malo" : "cobre");

function Fotos({ ids, adjuntos, onAmpliar }: { ids: string[]; adjuntos: Map<string, Adjunto>; onAmpliar: (url: string) => void }) {
  const visibles = ids.map((id) => adjuntos.get(id)).filter((a): a is Adjunto => !!a);
  if (visibles.length === 0) return null;
  return (
    <View style={estilos.fotos}>
      {visibles.map((a) =>
        a.url ? (
          <Pressable key={a.id} accessibilityRole="imagebutton" accessibilityLabel="Ampliar foto" onPress={() => onAmpliar(a.url as string)}>
            <Image source={{ uri: a.url }} style={estilos.foto} contentFit="cover" />
          </Pressable>
        ) : (
          <View key={a.id} style={[estilos.foto, estilos.sinAcceso]}>
            <Text style={estilos.pequeno}>Sin acceso</Text>
          </View>
        ),
      )}
    </View>
  );
}

function Respuesta({
  item,
  valor,
  adjuntos,
  onAmpliar,
}: {
  item: TemplateItem;
  valor: unknown;
  adjuntos: Map<string, Adjunto>;
  onAmpliar: (url: string) => void;
}) {
  if (valor === undefined) return <Text style={estilos.sub}>Sin respuesta</Text>;

  if (item.type === "verificacion") {
    const v = valor as Partial<VerificationValue>;
    return (
      <View style={estilos.respuesta}>
        <Text style={[estilos.valor, v.estado === "ML" && { color: color.malo }]}>
          {v.estado ? `${v.estado} · ${ESTADO_NOMBRE[v.estado] ?? v.estado}` : "Sin estado"}
          {v.valor !== undefined ? `   ${v.valor} ${item.unit ?? ""}` : ""}
        </Text>
        {v.obs ? <Text style={estilos.sub}>{v.obs}</Text> : null}
        <Fotos ids={v.fotos ?? []} adjuntos={adjuntos} onAmpliar={onAmpliar} />
      </View>
    );
  }
  if (item.type === "photo") return <Fotos ids={(valor as string[]) ?? []} adjuntos={adjuntos} onAmpliar={onAmpliar} />;
  if (item.type === "nameplate") {
    const campos = valor as Record<string, string | number>;
    return (
      <View style={estilos.respuesta}>
        {item.fields.map((f) => (
          <Text key={f.key} style={estilos.mono}>
            {f.label}: {campos[f.key] ?? "—"} {f.unit ?? ""}
          </Text>
        ))}
      </View>
    );
  }
  if (item.type === "number") {
    return (
      <Text style={estilos.mono}>
        {String(valor)} {item.unit}
      </Text>
    );
  }
  return <Text style={estilos.valor}>{String(valor)}</Text>;
}

/** Vista de solo lectura de una inspección enviada: datos generales, respuestas con fotos, hallazgos, diagnóstico y firmas. */
export function DetalleRevision({ d }: { d: DetalleInspeccion }) {
  const [foto, setFoto] = useState<string | null>(null);
  const adjuntos = useMemo(() => new Map(d.adjuntos.map((a) => [a.id, a])), [d.adjuntos]);
  const header = (d.respuestas._header ?? {}) as Record<string, string>;
  const seleccion = seleccionDeCabecera(header);
  const avisoTag = seleccion ? ETIQUETA_ESTADO[seleccion.estado] : null;
  const extras = extrasDe(header);
  // La clave `_participantes` es heredada: hoy guarda la firma del encargado de la actividad.
  const plantilla = useMemo(
    () => (d.plantilla ? expandirPlantilla(d.plantilla, d.respuestas._repeticiones) : d.plantilla),
    [d.plantilla, d.respuestas],
  );
  const encargado = d.respuestas._participantes as { nombres?: string; firmaId?: string } | undefined;
  const diagnostico = d.respuestas._diagnostico as { observaciones?: string; consideraciones?: string } | undefined;
  const participantes = typeof d.respuestas._lista_participantes === "string" ? d.respuestas._lista_participantes.trim() : "";
  const firmaEncargado = encargado?.firmaId ? adjuntos.get(encargado.firmaId) : undefined;

  const datos: [string, string][] = [
    ["Área", d.area],
    ["TAG", d.equipmentTag || "—"],
    ["Técnico (realizó)", d.realizadoPor],
    ["Cuenta de envío", `${d.tecnico}${d.turno ? ` · Turno ${d.turno}` : ""}`],
    ["Inicio", formatFechaHora(d.startedAt)],
    ["Envío", d.submittedAt ? formatFechaHora(d.submittedAt) : "—"],
    ["Plantilla", `versión ${d.templateVersion}`],
    ...(d.plantilla?.header ?? []).filter((h) => h.key !== "tag" && header[h.key]).map((h): [string, string] => [h.label, header[h.key]]),
  ];

  return (
    <View style={estilos.columna}>
      <Tarjeta style={estilos.bloque}>
        <Insignia texto={STATUS_LABEL[d.status]} tono={tonoEstado(d.status)} />
        <Text style={estilos.titulo}>
          {d.folio ?? "Sin folio"} · {d.equipo} · {d.modo}
        </Text>
        {avisoTag ? (
          <Text style={estilos.avisoTag}>
            {avisoTag}
            {seleccion?.tagOriginal ? ` · TAG original: ${seleccion.tagOriginal}` : ""}
          </Text>
        ) : null}
        {extras.length > 0 ? (
          <Text style={estilos.sub}>
            Otros equipos:{" "}
            {extras.map((x) => `${x.tag}${ETIQUETA_ESTADO[x.estado] ? ` (${ETIQUETA_ESTADO[x.estado]})` : ""}`).join(" · ")}
          </Text>
        ) : null}
        {datos.map(([k, v]) => (
          <Text key={k} style={estilos.dato}>
            <Text style={estilos.sub}>{k}: </Text>
            {v}
          </Text>
        ))}
      </Tarjeta>

      {!d.plantilla ? (
        <Tarjeta style={[estilos.bloque, { borderColor: color.malo }]}>
          <Text style={{ color: color.malo }}>No se pudo leer la plantilla de esta inspección; se muestran solo los datos generales.</Text>
        </Tarjeta>
      ) : null}

      {plantilla?.sections.map((s) => (
        <Tarjeta key={s.id} style={estilos.seccion}>
          <Text style={estilos.tituloSeccion}>{s.title}</Text>
          {s.items.map((item) => (
            <View key={item.id} style={estilos.item}>
              <Text style={estilos.sub}>{item.label}</Text>
              <Respuesta item={item} valor={d.respuestas[item.id]} adjuntos={adjuntos} onAmpliar={setFoto} />
            </View>
          ))}
        </Tarjeta>
      ))}

      <Tarjeta style={estilos.bloque}>
        <Text style={estilos.tituloBloque}>Hallazgos ({d.hallazgos.length})</Text>
        {d.hallazgos.length === 0 ? <Text style={estilos.sub}>Sin hallazgos registrados.</Text> : null}
        {d.hallazgos.map((h) => {
          const item = plantilla?.sections.flatMap((s) => s.items).find((i) => i.id === h.itemKey);
          const sev = SEVERIDAD[h.severity] ?? SEVERIDAD.baja;
          return (
            <View key={h.id} style={estilos.hallazgo}>
              <Insignia texto={sev.nombre} tono={sev.tono} />
              <Text style={estilos.valor}>{item?.label ?? h.itemKey}</Text>
              {h.description ? <Text style={estilos.sub}>{h.description}</Text> : null}
              {h.seguimiento ? (
                <Text style={estilos.pequeno}>
                  {h.seguimiento.scope === "bbosch"
                    ? h.seguimiento.sapNotice
                      ? `Aviso subsecuente N.º ${h.seguimiento.sapNotice}`
                      : "Aviso subsecuente pendiente"
                    : `Requiere apoyo de terceros: canalizado con MLP${h.seguimiento.channelNote ? ` · ${h.seguimiento.channelNote}` : ""}`}
                </Text>
              ) : (
                <Text style={estilos.pequeno}>Seguimiento pendiente (se registra desde el sitio web).</Text>
              )}
            </View>
          );
        })}
      </Tarjeta>

      {diagnostico?.observaciones || diagnostico?.consideraciones ? (
        <Tarjeta style={estilos.bloque}>
          <Text style={estilos.tituloBloque}>Diagnóstico</Text>
          {diagnostico.observaciones ? <Text style={estilos.valor}>{diagnostico.observaciones}</Text> : null}
          {diagnostico.consideraciones ? <Text style={estilos.sub}>{diagnostico.consideraciones}</Text> : null}
        </Tarjeta>
      ) : null}

      <Tarjeta style={estilos.bloque}>
        {participantes ? (
          <>
            <Text style={estilos.tituloBloque}>Participantes</Text>
            <Text style={estilos.valor}>{participantes}</Text>
          </>
        ) : null}
        <Text style={estilos.tituloBloque}>Encargado de la actividad</Text>
        <Text style={estilos.valor}>{encargado?.nombres?.trim() || d.realizadoPor || "—"}</Text>
        {firmaEncargado?.url ? (
          <Image source={{ uri: firmaEncargado.url }} style={estilos.firma} contentFit="contain" accessibilityLabel="Firma del encargado" />
        ) : null}
      </Tarjeta>

      <Tarjeta style={estilos.bloque}>
        <Text style={estilos.tituloBloque}>Firmas de revisión</Text>
        {d.firmas.length === 0 ? <Text style={estilos.sub}>Aún sin firmas.</Text> : null}
        {d.firmas.map((f) => (
          <View key={f.stage} style={estilos.hallazgo}>
            <Text style={estilos.valor}>
              {f.stage === "supervisor" ? "Supervisor" : "Programador"} · {f.decision === "approved" ? "aprobó" : "rechazó"}
            </Text>
            <Text style={estilos.sub}>
              {f.firmante} · {formatFechaHora(f.signedAt)}
            </Text>
            {f.comment ? <Text style={estilos.valor}>{f.comment}</Text> : null}
            {f.url ? <Image source={{ uri: f.url }} style={estilos.firma} contentFit="contain" accessibilityLabel={`Firma del ${f.stage}`} /> : null}
          </View>
        ))}
      </Tarjeta>

      <Modal visible={!!foto} transparent animationType="fade" onRequestClose={() => setFoto(null)}>
        <Pressable style={estilos.visor} onPress={() => setFoto(null)} accessibilityRole="button" accessibilityLabel="Cerrar foto">
          {foto ? <Image source={{ uri: foto }} style={estilos.visorImagen} contentFit="contain" /> : null}
          <Text style={estilos.visorTexto}>Toque para cerrar</Text>
        </Pressable>
      </Modal>
    </View>
  );
}

const estilos = StyleSheet.create({
  columna: { gap: 16 },
  bloque: { gap: 8, padding: 16 },
  seccion: { padding: 0, overflow: "hidden" },
  titulo: { fontSize: 20, fontWeight: "700", color: color.graf },
  tituloSeccion: { fontSize: 17, fontWeight: "700", color: color.graf, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  tituloBloque: { fontSize: 17, fontWeight: "700", color: color.graf },
  item: { gap: 4, paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: color.linea },
  respuesta: { gap: 4 },
  valor: { fontSize: 16, color: color.graf },
  mono: { fontSize: 15, color: color.graf, fontFamily: "monospace" },
  sub: { fontSize: 14, color: color.sub },
  pequeno: { fontSize: 12, color: color.sub },
  dato: { fontSize: 15, color: color.graf },
  avisoTag: { fontSize: 14, fontWeight: "600", color: color.cuTexto, backgroundColor: color.cuSuave, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: "flex-start" },
  hallazgo: { gap: 4, backgroundColor: color.neutroSuave, borderRadius: 12, padding: 12 },
  fotos: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  foto: { width: 96, height: 96, borderRadius: 10, borderWidth: 1, borderColor: color.linea },
  sinAcceso: { alignItems: "center", justifyContent: "center" },
  firma: { height: 72, width: 200, borderRadius: 10, borderWidth: 1, borderColor: color.linea, backgroundColor: color.blanco },
  visor: { flex: 1, backgroundColor: "rgba(0,0,0,0.92)", alignItems: "center", justifyContent: "center", padding: 12 },
  visorImagen: { width: "100%", height: "88%" },
  visorTexto: { color: color.blanco, fontSize: 14, marginTop: 8 },
});
