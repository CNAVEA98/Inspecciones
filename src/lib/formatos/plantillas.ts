import { createClient } from "@/lib/supabase/server";
import { templateSchema, type FormTemplateSchema } from "@/lib/templates/schema";
import { COLUMNAS_FORMATO, FAMILIAS, filaAFormato, ordenarFilas, type FilaFormatoBD, type Formato } from "./catalogo";

export interface VersionPlantilla {
  id: string;
  version: number;
  publicadaEn: string | null;
  nota: string | null;
  autor: string | null;
}

export interface FilaFormato {
  formato: Formato;
  familia: string;
  /** Última versión publicada; null si el formato aún no tiene plantilla cargada en la base. */
  actual: VersionPlantilla | null;
  versiones: number;
}

export interface PlantillaEditable {
  formato: Formato;
  familia: string;
  /** Versión sobre la que se edita (la última publicada). */
  actual: VersionPlantilla;
  schema: FormTemplateSchema;
  historial: VersionPlantilla[];
}

const nombre = (rel: unknown): string | null => {
  const o = Array.isArray(rel) ? rel[0] : rel;
  return (o as { full_name?: string } | null | undefined)?.full_name ?? null;
};

interface FilaVersion {
  id: string;
  equipment_type_id: string;
  work_mode_id: string;
  version: number;
  published_at: string | null;
  change_note: string | null;
  autor: unknown;
}

const aVersion = (r: FilaVersion): VersionPlantilla => ({
  id: r.id,
  version: r.version,
  publicadaEn: r.published_at,
  nota: r.change_note,
  autor: nombre(r.autor),
});

/** Todos los formatos de la tabla `formatos` (también los desactivados), en el orden del catálogo. */
export async function cargarFormatos(): Promise<Formato[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("formatos").select(COLUMNAS_FORMATO);
  if (error) throw new Error(`No se pudieron cargar los formatos: ${error.message}`);
  return ordenarFilas((data ?? []) as FilaFormatoBD[]).map(filaAFormato);
}

/** Un formato por su id («INSP-12»); null si no existe. */
export async function formatoPorIdBD(id: string): Promise<Formato | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("formatos").select(COLUMNAS_FORMATO).eq("id", id).maybeSingle();
  if (error) throw new Error(`No se pudo cargar el formato: ${error.message}`);
  return data ? filaAFormato(data as FilaFormatoBD) : null;
}

/** Mapas código → id del catálogo, para unir los formatos del código con las plantillas de la base. */
async function idsDelCatalogo() {
  const supabase = await createClient();
  const [tipos, modos] = await Promise.all([
    supabase.from("equipment_types").select("id, code"),
    supabase.from("work_modes").select("id, code"),
  ]);
  if (tipos.error) throw new Error(`No se pudieron cargar los tipos de equipo: ${tipos.error.message}`);
  if (modos.error) throw new Error(`No se pudieron cargar los modos de trabajo: ${modos.error.message}`);
  return {
    tipos: new Map((tipos.data ?? []).map((t) => [t.code as string, t.id as string])),
    modos: new Map((modos.data ?? []).map((m) => [m.code as string, m.id as string])),
  };
}

const COLUMNAS = "id, equipment_type_id, work_mode_id, version, published_at, change_note, autor:profiles!created_by(full_name)";

/** Los formatos disponibles con su versión vigente (sin cargar el contenido, que pesa). */
export async function listarFormatos(): Promise<FilaFormato[]> {
  const supabase = await createClient();
  const [{ tipos, modos }, formatos] = await Promise.all([idsDelCatalogo(), cargarFormatos()]);
  const { data, error } = await supabase.from("form_templates").select(COLUMNAS).eq("status", "published").limit(5000);
  if (error) throw new Error(`No se pudieron cargar los formatos: ${error.message}`);

  const porClave = new Map<string, FilaVersion[]>();
  for (const r of (data ?? []) as unknown as FilaVersion[]) {
    const k = `${r.equipment_type_id}|${r.work_mode_id}`;
    porClave.set(k, [...(porClave.get(k) ?? []), r]);
  }
  return formatos.filter((f) => f.estado === "disponible" && f.plantilla).map((f) => {
    const k = `${tipos.get(f.plantilla!.tipoEquipo)}|${modos.get(f.plantilla!.modo)}`;
    const versiones = (porClave.get(k) ?? []).sort((a, b) => b.version - a.version);
    return { formato: f, familia: FAMILIAS[f.familia], actual: versiones[0] ? aVersion(versiones[0]) : null, versiones: versiones.length };
  });
}

/** La plantilla vigente de un formato con su contenido y su historial de versiones. null si no existe o es inválida. */
export async function obtenerPlantillaEditable(formatoId: string): Promise<PlantillaEditable | null> {
  const formato = await formatoPorIdBD(formatoId);
  if (!formato || formato.estado !== "disponible" || !formato.plantilla) return null;
  const { tipos, modos } = await idsDelCatalogo();
  const tipoId = tipos.get(formato.plantilla.tipoEquipo), modoId = modos.get(formato.plantilla.modo);
  if (!tipoId || !modoId) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("form_templates")
    .select(`${COLUMNAS}, schema`)
    .eq("status", "published")
    .eq("equipment_type_id", tipoId)
    .eq("work_mode_id", modoId)
    .order("version", { ascending: false });
  if (error) throw new Error(`No se pudo cargar el formato: ${error.message}`);
  const filas = (data ?? []) as unknown as (FilaVersion & { schema: unknown })[];
  if (!filas.length) return null;
  const parsed = templateSchema.safeParse(filas[0].schema);
  if (!parsed.success) return null;
  return { formato, familia: FAMILIAS[formato.familia], actual: aVersion(filas[0]), schema: parsed.data, historial: filas.map(aVersion) };
}
