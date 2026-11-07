import { Stack, router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type ScrollViewInstance,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BotonPdf } from "@/components/boton-pdf";
import { CampoFechaHora } from "@/components/campo-fecha-hora";
import { FirmaCampo } from "@/components/firma-campo";
import { ItemField } from "@/components/item-field";
import { SelectorTag } from "@/components/selector-tag";
import { nuevoId } from "@/lib/id";
import { formatoPorId, type CodigoArea } from "@/lib/formatos/catalogo";
import { DESIGNADORES_POR_TIPO_EQUIPO } from "@/lib/formatos/tags";
import type { DraftRecord } from "@/lib/offline/db";
import { enqueueSubmission } from "@/lib/offline/outbox";
import { MAX_REPETICIONES, expandirSecciones, idEnCopia, leerRepeticiones } from "@/lib/templates/repetir";
import { estadoPorDefecto, type FormTemplateSchema } from "@/lib/templates/schema";
import {
  META,
  buildSubmission,
  getEjecutor,
  rolEncargado,
  validateDraft,
  type Diagnostico,
  type FirmaEncargado,
  type Severity,
} from "@/lib/tecnico/draft";
import { deletePhoto, saveSignature } from "@/lib/tecnico/photos";
import { useTecnico } from "@/lib/tecnico-contexto";
import { Aparecer, BarraProgreso, MarcaExito } from "@/ui/animacion";
import { Aviso, Boton, Campo } from "@/ui/componentes";
import { color } from "@/ui/tema";

/** Formulario de inspección: una sección por pantalla, guardado automático en el teléfono. */
export default function Formulario() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { almacen, userId, catalog, sync } = useTecnico();
  const [draft, setDraft] = useState<DraftRecord | null | undefined>(undefined);
  const [paso, setPaso] = useState(0);
  const [guardado, setGuardado] = useState<"ok" | "guardando">("ok");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const draftRef = useRef<DraftRecord | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pendiente = useRef(false);
  const scroll = useRef<ScrollViewInstance>(null);
  const posiciones = useRef(new Map<string, number>());

  /** Guarda ya lo que esté pendiente (al salir de la pantalla o al enviar). */
  const guardarYa = useCallback(async () => {
    clearTimeout(timer.current);
    if (pendiente.current && draftRef.current) {
      pendiente.current = false;
      await almacen.guardarBorrador(draftRef.current);
    }
    setGuardado("ok");
  }, [almacen]);

  useEffect(() => {
    let vivo = true;
    void almacen.obtenerBorrador(id).then((d) => {
      if (!vivo) return;
      draftRef.current = d ?? null;
      setDraft(d ?? null);
    });
    return () => {
      vivo = false;
      void guardarYa();
    };
  }, [almacen, id, guardarYa]);

  const template: FormTemplateSchema | null = useMemo(() => {
    if (!draft) return null;
    return catalog.catalog?.templates.find((t) => t.id === draft.templateId)?.schema ?? null;
  }, [draft, catalog.catalog]);

  const actualizar = useCallback(
    (cambio: (d: DraftRecord) => DraftRecord) => {
      const actual = draftRef.current;
      if (!actual || actual.state !== "draft") return;
      const next = { ...cambio(actual), updatedAt: Date.now() };
      draftRef.current = next;
      pendiente.current = true;
      setDraft(next);
      setGuardado("guardando");
      clearTimeout(timer.current);
      timer.current = setTimeout(() => void guardarYa(), 350);
    },
    [guardarYa],
  );

  const setAnswer = useCallback(
    (key: string, value: unknown) => actualizar((d) => ({ ...d, answers: { ...d.answers, [key]: value } })),
    [actualizar],
  );

  const setSeverity = useCallback(
    (itemId: string, severity: Severity) =>
      actualizar((d) => {
        const rest = d.findings.filter((f) => f.item_key !== itemId);
        const prev = d.findings.find((f) => f.item_key === itemId);
        return {
          ...d,
          findings: [
            ...rest,
            { id: prev?.id ?? nuevoId(), item_key: itemId, severity, description: "", photo_attachment_id: null },
          ],
        };
      }),
    [actualizar],
  );

  const guardarPosicion = useCallback((itemId: string, e: LayoutChangeEvent) => {
    posiciones.current.set(itemId, e.nativeEvent.layout.y);
  }, []);

  if (draft === undefined) return <Text style={estilos.cargando}>Abriendo inspección…</Text>;
  if (draft === null) {
    return (
      <View style={estilos.contenido}>
        <Aviso texto="No se encontró esta inspección en el teléfono." />
        <Boton texto="Volver al inicio" onPress={() => router.replace("/")} />
      </View>
    );
  }
  if (!template) {
    return (
      <View style={estilos.contenido}>
        <Aviso
          texto={
            catalog.status === "loading"
              ? "Cargando el formulario…"
              : "No se encontró el formulario de esta inspección. Conéctese a internet para descargarlo."
          }
        />
        <Boton texto="Volver al inicio" variante="secundario" onPress={() => router.replace("/")} />
      </View>
    );
  }

  if (enviado) return <EnvioListo id={id} />;

  const secciones = template.sections;
  // Secciones repetibles ya desplegadas (p. ej. «Estructura 1», «Estructura 2»): cada paso muestra sus copias.
  const reps = leerRepeticiones(draft.answers[META.repeticiones]);
  const seccionesX = expandirSecciones(template, reps);
  const itemsX = seccionesX.flatMap((s) => s.items);
  const total = secciones.length + 3; // datos + secciones + cierre + revisar
  const iCierre = secciones.length + 1;
  const iRevisar = secciones.length + 2;
  const titulo =
    paso === 0
      ? "Datos del equipo"
      : paso <= secciones.length
        ? secciones[paso - 1].title
        : paso === iCierre
          ? "Cierre y firma"
          : "Revisar y enviar";
  const bloqueado = draft.state !== "draft";

  // Filtro del selector de TAG: el formato elegido en el flujo; los borradores anteriores usan el tipo de equipo.
  const formato = formatoPorId(catalog.catalog?.formatos ?? [], draft.header.formato ?? "");
  const codigoArea = (catalog.catalog?.areas.find((a) => a.id === draft.areaId)?.code ?? "chacay") as CodigoArea;
  const tipoEquipo = catalog.catalog?.equipmentTypes.find((e) => e.id === draft.equipmentTypeId)?.code ?? "";
  const designadores = formato?.designadores ?? DESIGNADORES_POR_TIPO_EQUIPO[tipoEquipo] ?? [];

  const participantes = typeof draft.answers[META.participantes] === "string" ? (draft.answers[META.participantes] as string) : "";
  const firmaEncargado = (draft.answers[META.firmaEncargado] as FirmaEncargado | undefined) ?? {};
  const diag = (draft.answers[META.diagnostico] as Diagnostico | undefined) ?? { observaciones: "", consideraciones: "" };
  const roles = (draft.answers[META.roles] as Record<string, string> | undefined) ?? {};
  const issues = validateDraft(draft, template);
  const seccionActual = paso >= 1 && paso <= secciones.length ? secciones[paso - 1] : null;

  /** Agrega (+1) o quita (-1) la última copia de una sección repetible; al quitarla se descartan sus respuestas y hallazgos. */
  const cambiarCopias = (seccionId: string, delta: 1 | -1) =>
    actualizar((d) => {
      const actuales = leerRepeticiones(d.answers[META.repeticiones]);
      const n = actuales[seccionId] ?? 1;
      const nuevo = Math.min(Math.max(n + delta, 1), MAX_REPETICIONES);
      if (nuevo === n) return d;
      const answers = { ...d.answers };
      let findings = d.findings;
      if (delta === -1) {
        const origen = template.sections.find((s) => s.id === seccionId);
        const claves = new Set((origen?.items ?? []).map((i) => idEnCopia(i.id, n)));
        for (const k of claves) delete answers[k];
        findings = findings.filter((f) => !claves.has(f.item_key));
      }
      const siguientes = { ...actuales, [seccionId]: nuevo };
      if (nuevo === 1) delete siguientes[seccionId];
      if (Object.keys(siguientes).length) answers[META.repeticiones] = siguientes;
      else delete answers[META.repeticiones];
      return { ...d, answers, findings };
    });

  const quitarCopia = (seccionId: string, titulo: string, n: number) =>
    confirmarQuitar(`¿Quitar ${titulo.toLowerCase()} ${n}?`, () => cambiarCopias(seccionId, -1));

  const firmar = async (pngBase64: string) => {
    const anterior = (draftRef.current?.answers[META.firmaEncargado] as FirmaEncargado | undefined)?.firmaId;
    if (anterior) await deletePhoto(almacen, anterior);
    const firmaId = await saveSignature(almacen, userId, id, pngBase64);
    setAnswer(META.firmaEncargado, { firmaId });
  };

  const quitarFirma = async () => {
    const anterior = (draftRef.current?.answers[META.firmaEncargado] as FirmaEncargado | undefined)?.firmaId;
    if (anterior) await deletePhoto(almacen, anterior);
    setAnswer(META.firmaEncargado, { firmaId: undefined });
  };

  const enviar = async () => {
    if (enviando || issues.length || !draftRef.current) return;
    setEnviando(true);
    await guardarYa();
    await almacen.guardarBorrador(draftRef.current);
    const fotos = await almacen.fotosDeInspeccion(id);
    const { payload, photoIds } = buildSubmission(draftRef.current, template, fotos);
    await enqueueSubmission(almacen, { payload, photoIds });
    void sync.notifyQueued();
    setEnviado(true);
  };

  const irA = (n: number, itemId?: string) => {
    setPaso(n);
    if (itemId) {
      setTimeout(() => {
        const y = posiciones.current.get(itemId);
        if (y !== undefined) scroll.current?.scrollTo({ y: Math.max(0, y - 20), animated: true });
      }, 120);
    } else {
      scroll.current?.scrollTo({ y: 0, animated: false });
    }
  };

  const respondidos = itemsX.filter((i) => {
    const v = draft.answers[i.id];
    return v !== undefined && (i.type !== "verificacion" || (v as { estado?: string }).estado);
  }).length;

  return (
    <KeyboardAvoidingView style={estilos.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Stack.Screen
        options={{
          title: titulo,
          headerRight: () => (
            <Pressable accessibilityRole="button" onPress={() => router.replace("/")} hitSlop={12}>
              <Text style={{ color: color.blanco, fontSize: 16, fontWeight: "600" }}>Inicio</Text>
            </Pressable>
          ),
        }}
      />
      <Aparecer key={paso} desde={16} duracion={280} style={estilos.flex}>
      <ScrollView
        ref={scroll}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[estilos.contenido, { paddingBottom: insets.bottom + 120 }]}
      >
        <View style={{ gap: 8 }}>
          <View style={estilos.filaEntre}>
            <Text style={estilos.paso}>
              Paso {paso + 1} de {total}
            </Text>
            <Text style={estilos.guardado} accessibilityLiveRegion="polite">
              {guardado === "ok" ? "Guardado en el teléfono" : "Guardando…"}
            </Text>
          </View>
          <BarraProgreso progreso={(paso + 1) / total} />
          <Text style={estilos.titulo}>{titulo}</Text>
          {template.note ? <Text style={estilos.nota}>{template.note}</Text> : null}
          {draft.correccion ? (
            <View style={estilos.correccion}>
              <Text style={estilos.correccionTitulo}>Corrección de {draft.correccion.folio}</Text>
              <Text style={estilos.correccionTexto}>Motivo del rechazo: {draft.correccion.motivo || "sin comentario"}</Text>
              <Text style={estilos.nota}>
                Se copiaron los datos y respuestas. Las fotos y la firma del encargado de la actividad hay que tomarlas de nuevo.
              </Text>
            </View>
          ) : null}
        </View>

        {paso === 0 ? (
          <View style={estilos.grupo}>
            <Campo
              etiqueta="Nombre de quien realiza la inspección"
              value={getEjecutor(draft.answers)}
              onChangeText={(t) => setAnswer(META.ejecutor, t)}
              editable={!bloqueado}
              autoComplete="name"
            />
            {template.header.map((h) =>
              h.key === "tag" ? (
                <SelectorTag
                  key={h.key}
                  etiqueta={`${formato?.campo === "tramo" ? "Tramo o ubicación" : "TAG del equipo"}${h.required ? "" : " (opcional)"}`}
                  area={codigoArea}
                  designadores={designadores}
                  tramo={formato?.campo === "tramo"}
                  variosEquipos={formato?.variosEquipos ?? false}
                  header={draft.header}
                  onHeader={(cambio) => actualizar((d) => ({ ...d, header: cambio(d.header) }))}
                  deshabilitado={bloqueado}
                />
              ) : h.input === "time" || h.input === "date" ? (
                <CampoFechaHora
                  key={h.key}
                  etiqueta={`${h.label}${h.required ? "" : " (opcional)"}`}
                  tipo={h.input}
                  value={draft.header[h.key] ?? ""}
                  deshabilitado={bloqueado}
                  onChange={(v) => actualizar((d) => ({ ...d, header: { ...d.header, [h.key]: v } }))}
                />
              ) : (
                <Campo
                  key={h.key}
                  etiqueta={`${h.label}${h.required ? "" : " (opcional)"}`}
                  value={draft.header[h.key] ?? ""}
                  editable={!bloqueado}
                  keyboardType={h.input === "number" ? "decimal-pad" : "default"}
                  onChangeText={(t) => actualizar((d) => ({ ...d, header: { ...d.header, [h.key]: t } }))}
                />
              ),
            )}
          </View>
        ) : null}

        {seccionActual
          ? seccionesX
              .filter((s) => s.origen === paso - 1)
              .flatMap((inst) => [
                inst.repetible ? (
                  <Text key={`h-${inst.id}`} style={estilos.subtitulo}>
                    {inst.title}
                  </Text>
                ) : null,
                ...inst.items.map((item, k) => (
                  <ItemField
                    key={item.id}
                    item={item}
                    index={k + 1}
                    inspectionId={id}
                    value={draft.answers[item.id]}
                    estados={item.type === "verificacion" ? (item.estados ?? template.estados) : undefined}
                    severity={draft.findings.find((f) => f.item_key === item.id)?.severity}
                    onChange={setAnswer}
                    onSeverity={setSeverity}
                    onLayout={guardarPosicion}
                  />
                )),
              ])
          : null}

        {seccionActual?.repetible && !bloqueado ? (
          <View style={estilos.filaBotones}>
            <Boton
              texto={`+ Agregar ${seccionActual.title.toLowerCase()}`}
              variante="secundario"
              onPress={() => cambiarCopias(seccionActual.id, 1)}
              style={estilos.crece}
            />
            {(reps[seccionActual.id] ?? 1) > 1 ? (
              <Boton
                texto={`Quitar ${seccionActual.title.toLowerCase()} ${reps[seccionActual.id]}`}
                variante="secundario"
                onPress={() => quitarCopia(seccionActual.id, seccionActual.title, reps[seccionActual.id])}
                style={estilos.crece}
              />
            ) : null}
          </View>
        ) : null}

        {seccionActual && !bloqueado && seccionesX.some((s) => s.origen === paso - 1 && s.items.some((i) => i.type === "verificacion")) ? (
          <Boton
            variante="secundario"
            texto={`Marcar pendientes de esta sección como ${estadoPorDefecto(
              (() => {
                const v = seccionActual.items.find((i) => i.type === "verificacion");
                return v && v.type === "verificacion" ? (v.estados ?? template.estados) : undefined;
              })(),
            )}`}
            onPress={() =>
              actualizar((d) => {
                const answers = { ...d.answers };
                for (const i of seccionesX.filter((s) => s.origen === paso - 1).flatMap((s) => s.items)) {
                  if (i.type === "verificacion" && !(answers[i.id] as { estado?: string } | undefined)?.estado) {
                    answers[i.id] = { ...(answers[i.id] as object), estado: estadoPorDefecto(i.estados ?? template.estados) };
                  }
                }
                return { ...d, answers };
              })
            }
          />
        ) : null}

        {paso === iCierre ? (
          <View style={estilos.grupo}>
            <Campo
              etiqueta="Observaciones generales"
              multilinea
              numberOfLines={3}
              value={diag.observaciones}
              editable={!bloqueado}
              onChangeText={(t) => setAnswer(META.diagnostico, { ...diag, observaciones: t })}
            />
            <Campo
              etiqueta="Consideraciones"
              multilinea
              numberOfLines={3}
              value={diag.consideraciones}
              editable={!bloqueado}
              onChangeText={(t) => setAnswer(META.diagnostico, { ...diag, consideraciones: t })}
            />
            <Campo
              etiqueta="Participantes (opcional)"
              multilinea
              numberOfLines={2}
              placeholder="Nombres de quienes participaron. No firman."
              value={participantes}
              editable={!bloqueado}
              onChangeText={(t) => setAnswer(META.participantes, t)}
            />
            {template.roles.map((r) => (
              <Campo
                key={r}
                etiqueta={r}
                value={roles[r] ?? ""}
                editable={!bloqueado}
                onChangeText={(t) => setAnswer(META.roles, { ...roles, [r]: t })}
              />
            ))}
            <View style={{ gap: 8 }}>
              <Text style={estilos.etiqueta}>Firma de {rolEncargado(template) ?? "encargado de la actividad"}</Text>
              <Text style={estilos.nota}>El supervisor y el planificador firman después, al revisar la inspección.</Text>
              <FirmaCampo firmaId={firmaEncargado.firmaId} deshabilitado={bloqueado} onFirmar={firmar} onQuitar={quitarFirma} />
            </View>
          </View>
        ) : null}

        {paso === iRevisar ? (
          <View style={estilos.grupo}>
            <View style={estilos.resumen}>
              <Text style={estilos.resumenTexto}>
                {respondidos} de {itemsX.length} ítems respondidos.
              </Text>
            </View>
            {issues.length ? (
              <View accessibilityRole="alert" style={estilos.faltan}>
                <Text style={estilos.faltanTitulo}>Falta completar ({issues.length})</Text>
                {issues.slice(0, 15).map((i, k) => (
                  <Pressable
                    key={k}
                    accessibilityRole="button"
                    onPress={() => irA(i.area === "item" ? i.section! + 1 : i.area === "header" ? 0 : iCierre, i.itemId)}
                    style={estilos.faltaFila}
                  >
                    <Text style={estilos.faltaTexto}>{i.message}</Text>
                  </Pressable>
                ))}
                {issues.length > 15 ? <Text style={estilos.faltaTexto}>y {issues.length - 15} más</Text> : null}
              </View>
            ) : (
              <Aviso tono="ok" texto="Todo listo. Si no hay red, se enviará apenas vuelva la conexión." />
            )}
            <Boton
              texto={enviando ? "Enviando…" : "Enviar inspección"}
              onPress={() => void enviar()}
              deshabilitado={issues.length > 0 || enviando || bloqueado}
              style={{ minHeight: 64 }}
            />
          </View>
        ) : null}
      </ScrollView>
      </Aparecer>

      <View style={[estilos.navegacion, { paddingBottom: insets.bottom + 12 }]}>
        {paso === 0 ? (
          <Boton texto="Salir" variante="secundario" onPress={() => router.replace("/")} style={estilos.crece} />
        ) : (
          <Boton texto="Anterior" variante="secundario" onPress={() => irA(paso - 1)} style={estilos.crece} />
        )}
        {paso < iRevisar ? <Boton texto="Siguiente" onPress={() => irA(paso + 1)} style={estilos.crece} /> : null}
      </View>
    </KeyboardAvoidingView>
  );
}

function confirmarQuitar(titulo: string, alConfirmar: () => void) {
  Alert.alert(titulo, "Se borran sus respuestas y hallazgos. No se puede deshacer.", [
    { text: "Cancelar", style: "cancel" },
    { text: "Sí, quitar", style: "destructive", onPress: alConfirmar },
  ]);
}

/**
 * Pantalla al terminar el formulario. Con señal el envío se completa en segundos; sin señal la inspección queda en la
 * cola y se envía al reconectar. El PDF se descargará desde «Enviadas» cuando esa función llegue a la app.
 */
function EnvioListo({ id }: { id: string }) {
  const { almacen } = useTecnico();
  const [estado, setEstado] = useState<DraftRecord["state"]>();
  useEffect(() => {
    let vivo = true;
    const leer = () => void almacen.obtenerBorrador(id).then((d) => vivo && setEstado(d?.state));
    leer();
    const t = setInterval(leer, 1500);
    return () => {
      vivo = false;
      clearInterval(t);
    };
  }, [almacen, id]);
  const enviada = estado === "sent";
  return (
    <View style={estilos.contenido}>
      <Stack.Screen options={{ title: enviada ? "Inspección enviada" : "Inspección guardada" }} />
      <View style={{ marginTop: 24 }}>
        <MarcaExito />
      </View>
      <Aparecer retraso={250}>
      <Aviso
        tono="ok"
        texto={
          enviada
            ? "Inspección enviada. El supervisor ya puede revisarla."
            : "Inspección guardada en el teléfono. Se enviará apenas haya conexión. Mientras tanto puede generar el PDF y compartirlo."
        }
      />
      </Aparecer>
      <Aparecer retraso={380} style={{ gap: 20 }}>
        <BotonPdf id={id} variante="primario" />
        <Boton texto="Volver al inicio" variante="secundario" onPress={() => router.replace("/")} />
      </Aparecer>
    </View>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  contenido: { padding: 20, gap: 20 },
  cargando: { color: color.sub, fontSize: 18, padding: 20 },
  filaEntre: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  paso: { color: color.sub, fontSize: 14, fontVariant: ["tabular-nums"] },
  guardado: { color: color.sub, fontSize: 14, fontWeight: "500" },
  titulo: { color: color.graf, fontSize: 30, fontWeight: "700", lineHeight: 36, marginTop: 8 },
  subtitulo: { color: color.graf, fontSize: 20, fontWeight: "700", borderBottomWidth: 2, borderBottomColor: color.cu, paddingBottom: 4 },
  nota: { color: color.sub, fontSize: 14 },
  etiqueta: { color: color.graf, fontSize: 14, fontWeight: "600" },
  grupo: { gap: 16 },
  filaBotones: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  crece: { flexGrow: 1, flexBasis: 0 },
  correccion: { borderRadius: 12, borderWidth: 1, borderColor: "#e8b4b4", backgroundColor: "#fbe4e4", padding: 12, gap: 4 },
  correccionTitulo: { color: "#8a0000", fontSize: 14, fontWeight: "600" },
  correccionTexto: { color: color.graf, fontSize: 16 },
  resumen: { borderRadius: 16, borderWidth: 1, borderColor: color.linea, backgroundColor: color.blanco, padding: 16 },
  resumenTexto: { color: color.graf, fontSize: 18 },
  faltan: { borderRadius: 16, borderWidth: 1, borderColor: color.malo, backgroundColor: color.maloSuave, padding: 16, gap: 8 },
  faltanTitulo: { color: color.maloTexto, fontSize: 18, fontWeight: "600" },
  faltaFila: { minHeight: 48, justifyContent: "center", borderRadius: 12, backgroundColor: color.blanco, paddingHorizontal: 16 },
  faltaTexto: { color: color.maloTexto, fontSize: 16, fontWeight: "500", textDecorationLine: "underline" },
  navegacion: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: color.linea,
    backgroundColor: "rgba(255,255,255,0.96)",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
});
