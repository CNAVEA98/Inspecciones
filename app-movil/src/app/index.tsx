import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { Redirect, router } from "expo-router";
import { memo, useCallback, useEffect, useMemo, useState, type ReactElement } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BotonPdf } from "@/components/boton-pdf";
import { ControlesEnviadas, PieEnviadas } from "@/components/enviadas-controles";
import { PiePagina } from "@/components/pie-pagina";
import { SyncIndicador } from "@/components/sync-indicador";
import { formatFechaHora } from "@/lib/fecha";
import type { DraftRecord, OutboxRecord } from "@/lib/offline/db";
import { mensajeEnvioFallido } from "@/lib/offline/errores";
import { redNativa } from "@/lib/offline/red";
import { rolConTurno, useSesion } from "@/lib/sesion";
import type { Catalog } from "@/lib/tecnico/catalog";
import { useConsulta, useTecnico } from "@/lib/tecnico-contexto";
import { descartarEnvioFallido, eliminarBorrador } from "@/lib/tecnico/eliminar";
import {
  POR_PAGINA_ENVIADAS,
  contarPorEstado,
  filtrarEnviadas,
  type FiltroEstado,
} from "@/lib/tecnico/buscar-enviadas";
import {
  ESTADO_ENVIADA,
  borradorDeCorreccion,
  buscarCorreccion,
  buscarEnviadasServidor,
  correccionesEnServidor,
  cargarEnviadas,
  cargarRespuestas,
  fechaEnviadas,
  type Enviada,
} from "@/lib/tecnico/enviadas";
import { Aparecer, Esqueleto, Presionable } from "@/ui/animacion";
import { Aviso, Boton, Insignia, Tarjeta } from "@/ui/componentes";
import { color, type Tono } from "@/ui/tema";

const ESTADO_BORRADOR: Record<DraftRecord["state"], { texto: string; tono: Tono }> = {
  draft: { texto: "En curso", tono: "cobre" },
  queued: { texto: "En cola de envío", tono: "neutro" },
  sent: { texto: "Enviada", tono: "ok" },
};

type Fila =
  | { tipo: "aviso" }
  | { tipo: "cargando" }
  | { tipo: "titulo"; clave: string; texto: string }
  | { tipo: "vacio"; hayEnviadas: boolean }
  | { tipo: "borrador"; d: DraftRecord }
  | { tipo: "enviadasCab" }
  | { tipo: "enviadasPie" }
  | { tipo: "enviada"; e: Enviada; correccion?: DraftRecord };

const nombreDe = (lista: { id: string; name: string }[] | undefined, id: string) =>
  lista?.find((x) => x.id === id)?.name ?? "";

const claveFila = (f: Fila) =>
  f.tipo === "borrador" ? `b-${f.d.id}` : f.tipo === "enviada" ? `e-${f.e.id}` : f.tipo === "titulo" ? f.clave : f.tipo;

const TarjetaBorrador = memo(function TarjetaBorrador({
  d,
  catalogo,
  falla,
  onAbrir,
  onEliminar,
  onDescartar,
}: {
  d: DraftRecord;
  catalogo: Catalog | null;
  /** Motivo por el que el servidor rechazó el envío para siempre (la cola la marcó «failed»). */
  falla?: string;
  onAbrir: (id: string) => void;
  onEliminar: (id: string) => void;
  onDescartar: (id: string) => void;
}) {
  const estado = ESTADO_BORRADOR[d.state];
  const equipo = nombreDe(catalogo?.equipmentTypes, d.equipmentTypeId);
  const area = nombreDe(catalogo?.areas, d.areaId);
  const enCurso = d.state === "draft";
  return (
    <Tarjeta style={estilos.item}>
      <Pressable
        accessibilityRole={enCurso ? "button" : undefined}
        disabled={!enCurso}
        onPress={() => onAbrir(d.id)}
        style={estilos.tarjetaCuerpo}
      >
        <View style={estilos.filaEntre}>
          <Text style={estilos.tarjetaTitulo}>{d.header.tag || equipo || "Inspección"}</Text>
          <Insignia texto={estado.texto} tono={estado.tono} />
        </View>
        <Text style={estilos.sub}>{[area, equipo].filter(Boolean).join(" · ")}</Text>
        {d.correccion ? <Text style={estilos.correccion}>Corrige {d.correccion.folio}</Text> : null}
        <Text style={estilos.mono}>
          {d.folio ? `${d.folio} · ` : ""}
          {formatFechaHora(d.updatedAt)}
        </Text>
      </Pressable>
      {falla ? (
        <View style={estilos.rechazo}>
          <Text style={estilos.rechazoError}>{mensajeEnvioFallido(falla)}</Text>
          <Pressable accessibilityRole="button" onPress={() => onDescartar(d.id)} style={estilos.eliminar}>
            <Text style={estilos.eliminarTexto}>Eliminar esta copia</Text>
          </Pressable>
        </View>
      ) : null}
      {enCurso ? (
        <Pressable accessibilityRole="button" onPress={() => onEliminar(d.id)} style={estilos.eliminar}>
          <Text style={estilos.eliminarTexto}>Eliminar</Text>
        </Pressable>
      ) : (
        <View style={estilos.pdf}>
          <BotonPdf id={d.id} />
        </View>
      )}
    </Tarjeta>
  );
});

const TarjetaEnviada = memo(function TarjetaEnviada({
  e,
  correccion,
  corregidaEn,
  catalogo,
  corrigiendo,
  error,
  onCorregir,
}: {
  e: Enviada;
  correccion?: DraftRecord;
  /** Corrección ya registrada en el servidor (de este u otro teléfono con la misma cuenta). */
  corregidaEn?: Enviada;
  catalogo: Catalog | null;
  corrigiendo: boolean;
  error?: string;
  onCorregir: (e: Enviada) => void;
}) {
  const estado = ESTADO_ENVIADA[e.status];
  const equipo = nombreDe(catalogo?.equipmentTypes, e.equipment_type_id);
  const area = nombreDe(catalogo?.areas, e.area_id);
  const enCurso = correccion?.state === "draft";
  const yaEnviada = corregidaEn !== undefined || (correccion !== undefined && !enCurso);
  const folioCorreccion = corregidaEn?.folio ?? correccion?.folio;
  return (
    <Tarjeta style={estilos.item}>
      <View style={estilos.filaEntre}>
        <Text style={estilos.tarjetaTitulo}>{e.equipment_tag || equipo || "Inspección"}</Text>
        <Insignia texto={estado.texto} tono={estado.tono} />
      </View>
      <Text style={estilos.sub}>{[area, equipo].filter(Boolean).join(" · ")}</Text>
      {e.performed_by ? <Text style={estilos.sub}>Realizada por {e.performed_by}</Text> : null}
      <Text style={estilos.mono}>
        {e.folio ? `${e.folio} · ` : ""}
        {e.submitted_at ? formatFechaHora(e.submitted_at) : ""}
      </Text>
      <View style={estilos.pdf}>
        <BotonPdf id={e.id} />
      </View>
      {e.status === "rejected" ? (
        <View style={estilos.rechazo}>
          <Text style={estilos.rechazoTitulo}>Motivo del rechazo</Text>
          <Text style={estilos.rechazoTexto}>{e.review_comment || "Sin comentario."}</Text>
          {yaEnviada ? (
            <Text style={estilos.rechazoOk}>
              Ya se envió su corrección{folioCorreccion ? ` (${folioCorreccion})` : ""}.
            </Text>
          ) : (
            <Boton
              texto={corrigiendo ? "Cargando…" : enCurso ? "Seguir corrigiendo" : "Corregir y reenviar"}
              onPress={() => onCorregir(e)}
              deshabilitado={corrigiendo}
            />
          )}
          {error ? <Text style={estilos.rechazoError}>{error}</Text> : null}
        </View>
      ) : null}
    </Tarjeta>
  );
});

/** Inicio del técnico: nuevo Standard, resumen, inspecciones en curso y enviadas (igual que la web). */
function InicioTecnico() {
  const insets = useSafeAreaInsets();
  const { salir } = useSesion();
  const { perfil, almacen, userId, supabase, catalog, sync } = useTecnico();
  const [version, setVersion] = useState(0);

  const [borradores, cargados] = useConsulta(() => almacen.listarBorradores(userId), [] as DraftRecord[], `${userId}:${version}`);
  // Envíos que el servidor rechazó para siempre (p. ej. una corrección que ya hizo otro teléfono de la cuenta).
  const [salidas] = useConsulta(() => almacen.listarSalidas(), [] as OutboxRecord[], `salidas:${version}`);
  const fallas = useMemo(
    () => new Map(salidas.filter((s) => s.status === "failed").map((s) => [s.id, s.lastError ?? ""])),
    [salidas],
  );
  const [enviadas, setEnviadas] = useState<Enviada[]>([]);
  // Búsqueda y filtro de «Enviadas». Se muestran las últimas 5; «Ver más» agrega otras 5.
  const [consulta, setConsulta] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todas");
  const [mostrar, setMostrar] = useState(POR_PAGINA_ENVIADAS);
  const [remotas, setRemotas] = useState<Enviada[] | null>(null);
  const [actualizadoEn, setActualizadoEn] = useState<number | null>(null);
  const [actualizando, setActualizando] = useState(false);
  const [buscandoServidor, setBuscandoServidor] = useState(false);
  const [avisoEnviadas, setAvisoEnviadas] = useState<string | null>(null);
  const [corrigiendo, setCorrigiendo] = useState<string | null>(null);
  const [errorCorreccion, setErrorCorreccion] = useState<{ id: string; mensaje: string } | null>(null);

  // La lista se vuelve a pedir cuando cambia lo que está en cola o enviado, y al volver la red.
  const huella = borradores.map((d) => `${d.id}:${d.state}`).join(",");
  useEffect(() => {
    let vivo = true;
    const refrescar = async () => {
      const r = await cargarEnviadas(almacen, supabase, userId, redNativa.enLinea());
      const fecha = await fechaEnviadas(almacen, userId);
      if (!vivo) return;
      setEnviadas(r.lista);
      setActualizadoEn(fecha);
    };
    void refrescar();
    const dejar = redNativa.escuchar(() => void refrescar());
    return () => {
      vivo = false;
      dejar();
    };
  }, [almacen, supabase, userId, huella]);

  const idsEnviadas = useMemo(() => new Set(enviadas.map((e) => e.id)), [enviadas]);
  const corregidas = useMemo(() => correccionesEnServidor(enviadas), [enviadas]);
  // Una enviada ya confirmada por el servidor se muestra en «Enviadas», no en la lista local.
  const locales = useMemo(() => borradores.filter((d) => !idsEnviadas.has(d.id)), [borradores, idsEnviadas]);

  /** «Actualizar»: vuelve a pedir las enviadas al servidor. Sin señal (o si falla) deja la última copia y lo avisa. */
  const actualizar = useCallback(async () => {
    if (actualizando) return;
    setAvisoEnviadas(null);
    setRemotas(null);
    const enLinea = redNativa.enLinea();
    if (!enLinea) {
      setAvisoEnviadas("Sin conexión: se muestra la última copia guardada en el teléfono.");
      return;
    }
    setActualizando(true);
    const r = await cargarEnviadas(almacen, supabase, userId, true);
    setEnviadas(r.lista);
    setActualizadoEn(await fechaEnviadas(almacen, userId));
    if (r.fromCache) setAvisoEnviadas("No se pudo actualizar. Se muestra la última copia guardada.");
    setActualizando(false);
  }, [actualizando, almacen, supabase, userId]);

  /** Busca en el servidor lo que ya no está entre las últimas guardadas en el teléfono. */
  const buscarEnServidor = useCallback(async () => {
    if (buscandoServidor) return;
    setAvisoEnviadas(null);
    if (!redNativa.enLinea()) {
      setAvisoEnviadas("Para buscar en todo el historial necesita conexión a internet.");
      return;
    }
    setBuscandoServidor(true);
    try {
      setRemotas(await buscarEnviadasServidor(supabase, userId, consulta));
      setMostrar(POR_PAGINA_ENVIADAS);
    } catch {
      setAvisoEnviadas("No se pudo buscar en el servidor. Intente de nuevo.");
    } finally {
      setBuscandoServidor(false);
    }
  }, [buscandoServidor, consulta, supabase, userId]);

  const cambiarConsulta = useCallback((texto: string) => {
    setConsulta(texto);
    setMostrar(POR_PAGINA_ENVIADAS);
    setRemotas(null); // un texto nuevo vuelve a la búsqueda local
  }, []);

  const cambiarEstado = useCallback((e: FiltroEstado) => {
    setFiltroEstado(e);
    setMostrar(POR_PAGINA_ENVIADAS);
  }, []);

  const verMas = useCallback(() => setMostrar((m) => m + POR_PAGINA_ENVIADAS), []);
  const volverALocales = useCallback(() => {
    setRemotas(null);
    setMostrar(POR_PAGINA_ENVIADAS);
  }, []);

  const abrir = useCallback((id: string) => router.push({ pathname: "/inspeccion/[id]", params: { id } }), []);

  const cerrarSesion = useCallback(() => {
    const porEnviar = sync.getSnapshot().pending + sync.getSnapshot().failed;
    Alert.alert(
      "¿Cerrar sesión?",
      porEnviar > 0
        ? `Tiene ${porEnviar} inspección${porEnviar > 1 ? "es" : ""} por enviar. Quedan guardadas en el teléfono y se envían cuando vuelva a ingresar con señal.`
        : "Sus inspecciones guardadas en el teléfono se conservan. Para trabajar de nuevo deberá ingresar con su usuario.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Cerrar sesión", style: "destructive", onPress: () => void salir() },
      ],
    );
  }, [salir, sync]);

  const eliminar = useCallback(
    (id: string) => {
      Alert.alert("¿Eliminar esta inspección?", "Se borran sus datos y fotos de este teléfono. No se puede deshacer.", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, eliminar",
          style: "destructive",
          onPress: () => void eliminarBorrador(almacen, id).then(() => setVersion((v) => v + 1)),
        },
      ]);
    },
    [almacen],
  );

  const descartar = useCallback(
    (id: string) => {
      Alert.alert(
        "¿Eliminar esta copia?",
        "El servidor no la aceptó. Se borran sus datos y fotos de este teléfono. No se puede deshacer.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Sí, eliminar",
            style: "destructive",
            onPress: () =>
              void descartarEnvioFallido(almacen, id).then(() => {
                setVersion((v) => v + 1);
                void sync.notifyQueued(); // recalcula el indicador («requiere atención»)
              }),
          },
        ],
      );
    },
    [almacen, sync],
  );

  const corregir = useCallback(
    async (e: Enviada) => {
      setErrorCorreccion(null);
      const existente = borradores.find((d) => d.correccion?.de === e.id && d.state === "draft");
      if (existente) {
        abrir(existente.id);
        return;
      }
      const falla = (mensaje: string) => setErrorCorreccion({ id: e.id, mensaje });
      if (!redNativa.enLinea()) return falla("Para corregir necesita conexión a internet.");
      const template = catalog.catalog?.templates.find((t) => t.id === e.template_id)?.schema;
      if (!template) return falla("El formulario de esta inspección ya no está disponible.");
      setCorrigiendo(e.id);
      try {
        // La cuenta del turno la comparten varios teléfonos: si otro ya la corrigió, no se ofrece una segunda corrección.
        const yaCorregida = await buscarCorreccion(supabase, e.id);
        if (yaCorregida) {
          void actualizar();
          return falla(
            `Esta inspección ya fue corregida${yaCorregida.folio ? ` con el folio ${yaCorregida.folio}` : ""} (puede haber sido desde otro teléfono con la misma cuenta).`,
          );
        }
        const respuestas = await cargarRespuestas(supabase, e.id);
        const draft = borradorDeCorreccion({ userId, rechazada: e, respuestas, template });
        await almacen.guardarBorrador(draft);
        abrir(draft.id);
      } catch {
        falla("No se pudo cargar la inspección. Intente de nuevo.");
      } finally {
        setCorrigiendo(null);
      }
    },
    [abrir, actualizar, almacen, borradores, catalog.catalog, supabase, userId],
  );

  // Lo que se ve en «Enviadas»: la búsqueda se hace sobre las guardadas en el teléfono (o sobre los resultados del servidor).
  const base = remotas ?? enviadas;
  const opcionesBusqueda = useMemo(
    () => ({
      nombreArea: (id: string) => nombreDe(catalog.catalog?.areas, id),
      nombreEquipo: (id: string) => nombreDe(catalog.catalog?.equipmentTypes, id),
    }),
    [catalog.catalog],
  );
  const porTexto = useMemo(
    () => filtrarEnviadas(base, { texto: consulta, estado: "todas", ...opcionesBusqueda }),
    [base, consulta, opcionesBusqueda],
  );
  const conteos = useMemo(() => contarPorEstado(porTexto), [porTexto]);
  const filtradas = useMemo(
    () => (filtroEstado === "todas" ? porTexto : filtrarEnviadas(porTexto, { texto: "", estado: filtroEstado, ...opcionesBusqueda })),
    [porTexto, filtroEstado, opcionesBusqueda],
  );
  const visibles = useMemo(() => filtradas.slice(0, mostrar), [filtradas, mostrar]);

  const filas = useMemo<Fila[]>(() => {
    const r: Fila[] = [{ tipo: "aviso" }, { tipo: "titulo", clave: "t-mis", texto: "Mis inspecciones" }];
    if (!cargados) r.push({ tipo: "cargando" });
    else if (locales.length === 0) r.push({ tipo: "vacio", hayEnviadas: enviadas.length > 0 });
    for (const d of locales) r.push({ tipo: "borrador", d });
    if (enviadas.length > 0 || remotas) {
      r.push({ tipo: "enviadasCab" });
      for (const e of visibles) r.push({ tipo: "enviada", e, correccion: borradores.find((d) => d.correccion?.de === e.id) });
      r.push({ tipo: "enviadasPie" });
    }
    return r;
  }, [cargados, locales, enviadas, remotas, visibles, borradores]);

  const aceptadas = enviadas.filter((e) => e.status === "approved").length;
  const rechazadas = enviadas.filter((e) => e.status === "rejected").length;

  const renderItem = useCallback(
    ({ item, index }: { item: Fila; index: number }) => {
      const entrada = (contenido: ReactElement) => <Aparecer retraso={Math.min(index, 8) * 60}>{contenido}</Aparecer>;
      switch (item.tipo) {
        case "aviso":
          return <ErrorCatalogo />;
        case "cargando":
          return (
            <View style={{ gap: 12 }}>
              <Esqueleto alto={96} />
              <Esqueleto alto={96} />
            </View>
          );
        case "titulo":
          return entrada(<Text style={estilos.seccion}>{item.texto}</Text>);
        case "vacio":
          return entrada(
            <View style={estilos.vacio}>
              <Text style={estilos.vacioTitulo}>
                {item.hayEnviadas ? "No tiene inspecciones en curso" : "Aún no tiene inspecciones en este teléfono"}
              </Text>
              {item.hayEnviadas ? null : <Text style={estilos.sub}>Toque «Nuevo Standard» para empezar.</Text>}
            </View>,
          );
        case "borrador":
          return entrada(
            <TarjetaBorrador
              d={item.d}
              catalogo={catalog.catalog}
              falla={fallas.get(item.d.id)}
              onAbrir={abrir}
              onEliminar={eliminar}
              onDescartar={descartar}
            />,
          );
        case "enviadasCab":
          return (
            <ControlesEnviadas
              conteos={conteos}
              estado={filtroEstado}
              onEstado={cambiarEstado}
              onBuscar={cambiarConsulta}
              actualizadoEn={actualizadoEn}
              actualizando={actualizando}
              onActualizar={() => void actualizar()}
              aviso={avisoEnviadas}
              enServidor={remotas !== null}
              onVolverALocales={volverALocales}
            />
          );
        case "enviadasPie":
          return (
            <PieEnviadas
              total={filtradas.length}
              mostrando={visibles.length}
              hayFiltro={consulta.trim() !== "" || filtroEstado !== "todas"}
              enServidor={remotas !== null}
              textoBuscado={consulta}
              buscandoServidor={buscandoServidor}
              onVerMas={verMas}
              onBuscarServidor={() => void buscarEnServidor()}
            />
          );
        case "enviada":
          return entrada(
            <TarjetaEnviada
              e={item.e}
              correccion={item.correccion}
              corregidaEn={corregidas.get(item.e.id)}
              catalogo={catalog.catalog}
              corrigiendo={corrigiendo === item.e.id}
              error={errorCorreccion?.id === item.e.id ? errorCorreccion.mensaje : undefined}
              onCorregir={corregir}
            />,
          );
      }
    },
    [
      abrir,
      actualizadoEn,
      actualizando,
      actualizar,
      avisoEnviadas,
      buscandoServidor,
      buscarEnServidor,
      cambiarConsulta,
      cambiarEstado,
      catalog.catalog,
      conteos,
      consulta,
      corregidas,
      corregir,
      corrigiendo,
      descartar,
      eliminar,
      errorCorreccion,
      fallas,
      filtradas.length,
      filtroEstado,
      remotas,
      verMas,
      visibles.length,
      volverALocales,
    ],
  );

  const resumen = [
    { valor: enviadas.length, texto: "Enviadas", alerta: false },
    { valor: aceptadas, texto: "Aceptadas", alerta: false },
    { valor: rechazadas, texto: "Rechazadas", alerta: rechazadas > 0 },
  ];

  return (
    <View style={estilos.pantalla}>
      <Aparecer desde={-24} duracion={450}>
        <View style={[estilos.cabecera, { paddingTop: insets.top + 12 }]}>
        <View style={estilos.filaEntre}>
          <Image source={require("../../assets/bbosch-logo-solo.png")} style={estilos.logo} contentFit="contain" />
          <Pressable accessibilityRole="button" onPress={cerrarSesion} style={estilos.salir}>
            <Text style={estilos.salirTexto}>Cerrar sesión</Text>
          </Pressable>
        </View>
        <View style={[estilos.bienvenida, { marginTop: 20 }]}>
          <Text style={estilos.kicker}>BIENVENIDO</Text>
          <Text style={estilos.rol} numberOfLines={1}>
            {rolConTurno(perfil)}
          </Text>
        </View>
        {/* En su propia fila: junto al saludo lo cortaba («Técnico · Tur…») cuando el aviso era largo. */}
        <View style={estilos.filaSync}>
          <SyncIndicador />
        </View>
        </View>
      </Aparecer>

      <FlashList
        data={filas}
        renderItem={renderItem}
        keyExtractor={claveFila}
        getItemType={(f) => f.tipo}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}
        ItemSeparatorComponent={Separador}
        ListFooterComponent={<PiePagina />}
        ListHeaderComponent={
          <View style={estilos.encabezadoLista}>
            <Aparecer retraso={120}>
              <Presionable accessibilityRole="button" onPress={() => router.push("/nueva")} escala={0.98} style={estilos.nuevo}>
                <View style={estilos.nuevoIcono}>
                  <Text style={estilos.nuevoMas}>+</Text>
                </View>
                <View>
                  <Text style={estilos.nuevoTitulo}>Nuevo Standard</Text>
                  <Text style={estilos.nuevoSub}>Elija área, trabajo y formato</Text>
                </View>
              </Presionable>
            </Aparecer>
            <View style={estilos.resumen}>
              {resumen.map((r, i) => (
                <Aparecer key={r.texto} retraso={200 + i * 70} style={estilos.resumenItem}>
                  <View style={[estilos.resumenCaja, r.alerta && { backgroundColor: color.cuSuave, borderColor: color.cu }]}>
                    <Text style={estilos.resumenValor}>{r.valor}</Text>
                    <Text style={estilos.resumenTexto}>{r.texto.toUpperCase()}</Text>
                  </View>
                </Aparecer>
              ))}
            </View>
          </View>
        }
      />
    </View>
  );
}

const Separador = () => <View style={{ height: 12 }} />;

/** Solo se avisa si el catálogo no se pudo descargar y no hay copia en el teléfono (sin catálogo no se puede empezar). */
function ErrorCatalogo() {
  const { catalog } = useTecnico();
  if (catalog.status !== "error") return null;
  return <Aviso texto={catalog.error ?? "No se pudo descargar el catálogo. Conéctese a internet una vez."} />;
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
    paddingBottom: 20,
  },
  filaEntre: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  logo: { width: 110, height: 28 },
  salir: {
    minHeight: 44,
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: color.blanco,
    paddingHorizontal: 16,
  },
  salirTexto: { color: color.blanco, fontSize: 15, fontWeight: "600" },
  bienvenida: { flexShrink: 1 },
  filaSync: { alignSelf: "stretch" },
  kicker: { color: "#9aa4ad", fontSize: 11, letterSpacing: 1.2 },
  rol: { color: color.blanco, fontSize: 22, fontWeight: "700" },
  encabezadoLista: { gap: 20, marginBottom: 20 },
  nuevo: {
    minHeight: 80,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderRadius: 16,
    backgroundColor: color.graf,
    padding: 16,
  },
  nuevoIcono: { width: 48, height: 48, borderRadius: 24, backgroundColor: color.cu, alignItems: "center", justifyContent: "center" },
  nuevoMas: { color: color.blanco, fontSize: 30, lineHeight: 34, fontWeight: "600" },
  nuevoTitulo: { color: color.blanco, fontSize: 20, fontWeight: "600" },
  nuevoSub: { color: "#c9d0d6", fontSize: 14 },
  resumen: { flexDirection: "row", gap: 12 },
  resumenItem: { flex: 1 },
  resumenCaja: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: color.linea,
    backgroundColor: color.blanco,
    padding: 12,
  },
  resumenValor: { color: color.graf, fontSize: 28, fontWeight: "600" },
  resumenTexto: { color: color.sub, fontSize: 11, letterSpacing: 0.9, marginTop: 6 },
  seccion: { color: color.graf, fontSize: 24, fontWeight: "700", marginTop: 8 },
  vacio: {
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#9a9488",
    backgroundColor: color.blanco,
    padding: 24,
    alignItems: "center",
    gap: 4,
  },
  vacioTitulo: { color: color.graf, fontSize: 18, fontWeight: "600", textAlign: "center" },
  item: { gap: 4 },
  tarjetaCuerpo: { gap: 4 },
  tarjetaTitulo: { color: color.graf, fontSize: 18, fontWeight: "600", flexShrink: 1 },
  sub: { color: color.sub, fontSize: 16 },
  mono: { color: color.sub, fontSize: 14, fontVariant: ["tabular-nums"] },
  correccion: { color: color.cuTexto, fontSize: 14, fontWeight: "500" },
  eliminar: { minHeight: 48, minWidth: 96, justifyContent: "center", alignSelf: "flex-start" },
  eliminarTexto: { color: color.malo, fontSize: 15, fontWeight: "600" },
  pdf: { marginTop: 8 },
  rechazo: { marginTop: 8, borderRadius: 12, backgroundColor: "#fbe4e4", padding: 12, gap: 8 },
  rechazoTitulo: { color: "#8a0000", fontSize: 14, fontWeight: "600" },
  rechazoTexto: { color: color.graf, fontSize: 16 },
  rechazoOk: { color: color.okTexto, fontSize: 14, fontWeight: "600" },
  rechazoError: { color: color.malo, fontSize: 14, fontWeight: "500" },
});

/** Punto de entrada: el técnico ve su inicio; supervisor, programador y administrador pasan a la bandeja de revisión. */
export default function Inicio() {
  const { perfil } = useSesion();
  if (perfil && perfil.rol !== "technician") return <Redirect href="/revision" />;
  return <InicioTecnico />;
}
