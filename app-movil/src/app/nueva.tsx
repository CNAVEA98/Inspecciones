import { Stack, router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Aparecer, Esqueleto } from "@/ui/animacion";
import { Aviso, Boton, Opcion } from "@/ui/componentes";
import { color } from "@/ui/tema";
import { hoyIso } from "@/lib/fecha";
import {
  FAMILIAS,
  TRABAJOS,
  familiasVisibles,
  formatosVisibles,
  type CodigoArea,
  type CodigoFamilia,
  type Formato,
  type TipoTrabajo,
} from "@/lib/formatos/catalogo";
import { templateFor, type CatalogEntry } from "@/lib/tecnico/catalog";
import { newDraft } from "@/lib/tecnico/draft";
import { useTecnico } from "@/lib/tecnico-contexto";

type Paso = "area" | "trabajo" | "familia" | "formato";
const PASOS: Paso[] = ["area", "trabajo", "familia", "formato"];
const TITULO: Record<Paso, string> = {
  area: "¿En qué área está?",
  trabajo: "¿Qué tipo de trabajo es?",
  familia: "¿Qué equipo?",
  formato: "¿Qué formato va a llenar?",
};

/** Flujo de selección en 4 pasos: Área → Trabajo → Familia → Formato. Los formatos llegan con el catálogo local. */
export default function NuevaInspeccion() {
  const { catalog, almacen, userId } = useTecnico();
  const [paso, setPaso] = useState<Paso>("area");
  const [area, setArea] = useState<CatalogEntry | null>(null);
  const [trabajo, setTrabajo] = useState<TipoTrabajo | null>(null);
  const [familia, setFamilia] = useState<CodigoFamilia | null>(null);
  const [creando, setCreando] = useState(false);

  if (catalog.status === "loading") {
    return (
      <View style={estilos.contenido}>
        <Esqueleto alto={40} style={{ width: "70%" }} />
        <Esqueleto alto={64} />
        <Esqueleto alto={64} />
        <Esqueleto alto={64} />
      </View>
    );
  }
  if (catalog.status === "error" || !catalog.catalog) {
    return (
      <View style={estilos.contenido}>
        <Aviso texto={catalog.error ?? "No se pudo cargar el catálogo. Conéctese a internet una vez para descargarlo."} />
        <Boton texto="Volver" variante="secundario" onPress={() => router.back()} />
      </View>
    );
  }
  const cat = catalog.catalog;

  /** Plantilla de la base que abre un formato «disponible»; sin ella el formato se muestra como próximamente. */
  const plantillaDe = (formato: Formato) => {
    if (formato.estado !== "disponible" || !formato.plantilla) return null;
    const tipo = cat.equipmentTypes.find((e) => e.code === formato.plantilla!.tipoEquipo);
    const modo = cat.workModes.find((m) => m.code === formato.plantilla!.modo);
    if (!tipo || !modo) return null;
    const template = templateFor(cat, tipo.id, modo.id);
    return template ? { template, tipo, modo } : null;
  };

  const iniciar = async (formato: Formato) => {
    const plantilla = plantillaDe(formato);
    if (!area || !plantilla || creando) return;
    setCreando(true);
    const draft = newDraft({
      userId,
      areaId: area.id,
      equipmentTypeId: plantilla.tipo.id,
      workModeId: plantilla.modo.id,
      templateId: plantilla.template.id,
    });
    draft.header = { fecha: hoyIso(), formato: formato.id };
    await almacen.guardarBorrador(draft);
    router.replace({ pathname: "/inspeccion/[id]", params: { id: draft.id } });
  };

  const atras = () => {
    const i = PASOS.indexOf(paso);
    if (i > 0) setPaso(PASOS[i - 1]);
  };

  const codigoArea = area?.code as CodigoArea | undefined;
  const familias = codigoArea && trabajo ? familiasVisibles(cat.formatos, codigoArea, trabajo) : [];
  const formatos = codigoArea && trabajo && familia ? formatosVisibles(cat.formatos, codigoArea, trabajo, familia) : [];

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={estilos.contenido}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ headerBackVisible: false }} />
      <View style={estilos.barra}>
        <Boton
          texto={paso === "area" ? "Cancelar" : "Atrás"}
          variante="secundario"
          onPress={() => (paso === "area" ? router.back() : atras())}
          style={estilos.botonBarra}
        />
        <Text style={estilos.paso}>Paso {PASOS.indexOf(paso) + 1} de 4</Text>
      </View>

      <Aparecer key={`titulo-${paso}`} desde={10} duracion={260}>
        <Text style={estilos.titulo}>{TITULO[paso]}</Text>
      </Aparecer>
      {catalog.fromCache && !catalog.actualizando ? (
        <Aviso tono="cobre" texto="Usando el catálogo guardado en el teléfono." />
      ) : null}

      <Aparecer key={`lista-${paso}`} desde={14} duracion={300} retraso={60} style={estilos.lista}>
        {paso === "area" &&
          cat.areas.map((a) => (
            <Opcion
              key={a.id}
              etiqueta={a.name}
              onPress={() => {
                setArea(a);
                setPaso("trabajo");
              }}
            />
          ))}

        {paso === "trabajo" &&
          (Object.keys(TRABAJOS) as TipoTrabajo[]).map((t) => (
            <Opcion
              key={t}
              etiqueta={TRABAJOS[t]}
              onPress={() => {
                setTrabajo(t);
                setPaso("familia");
              }}
            />
          ))}

        {paso === "familia" &&
          (familias.length === 0 ? (
            <Text style={estilos.vacio}>No hay formatos para esta área y este tipo de trabajo.</Text>
          ) : (
            familias.map((fam) => (
              <Opcion
                key={fam}
                etiqueta={FAMILIAS[fam]}
                onPress={() => {
                  setFamilia(fam);
                  setPaso("formato");
                }}
              />
            ))
          ))}

        {paso === "formato" &&
          formatos.map((x) => {
            const ok = plantillaDe(x) !== null;
            return (
              <Opcion
                key={x.id}
                etiqueta={x.titulo}
                detalle={ok ? x.id : `${x.id} · Próximamente`}
                deshabilitada={!ok || creando}
                onPress={() => void iniciar(x)}
              />
            );
          })}
      </Aparecer>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: 20, gap: 20 },
  cargando: { color: color.sub, fontSize: 18, padding: 20 },
  barra: { flexDirection: "row", alignItems: "center", gap: 12 },
  botonBarra: { minHeight: 48 },
  paso: { color: color.sub, fontSize: 14 },
  titulo: { color: color.graf, fontSize: 30, fontWeight: "700", lineHeight: 36 },
  lista: { gap: 12 },
  vacio: { color: color.sub, fontSize: 18 },
});
