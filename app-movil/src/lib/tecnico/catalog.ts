// Port de src/lib/tecnico/catalog.ts de la web (2026-11-07), sobre `Almacen` en vez de Dexie. Ver app-movil/DISENO.md.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Almacen } from "@/lib/offline/almacen";
import { validateTemplate } from "@/lib/templates/validate";
import type { FormTemplateSchema } from "@/lib/templates/schema";
import { COLUMNAS_FORMATO, filaAFormato, ordenarFilas, type FilaFormatoBD, type Formato } from "@/lib/formatos/catalogo";

export interface CatalogEntry {
  id: string;
  code: string;
  name: string;
  sort: number;
}

export interface Combination {
  equipment_type_id: string;
  work_mode_id: string;
  template_id: string | null;
}

export interface TemplateRow {
  id: string;
  equipment_type_id: string;
  work_mode_id: string;
  version: number;
  schema: FormTemplateSchema;
}

export interface Catalog {
  areas: CatalogEntry[];
  equipmentTypes: CatalogEntry[];
  workModes: CatalogEntry[];
  combinations: Combination[];
  templates: TemplateRow[];
  /** Formatos del flujo Área → Trabajo → Familia → Formato (todos, también los desactivados, para los borradores). */
  formatos: Formato[];
}

const KEY = "catalog";

export async function readCatalogCache(almacen: Almacen): Promise<Catalog | null> {
  const row = await almacen.leerCatalogo(KEY);
  const cat = (row?.value as Catalog | undefined) ?? null;
  // Copia guardada antes de que los formatos vinieran de la base: no sirve, hay que descargar de nuevo.
  return cat && Array.isArray(cat.formatos) ? cat : null;
}

/** Filas del catálogo tal como vienen de la base (lo que descarga la app o lo que se exporta a la copia incluida). */
export interface FilasCatalogo {
  areas: CatalogEntry[];
  equipment_types: CatalogEntry[];
  work_modes: CatalogEntry[];
  catalog_combinations: Combination[];
  form_templates: { id: string; equipment_type_id: string; work_mode_id: string; version: number; schema: unknown }[];
  formatos: FilaFormatoBD[];
}

/** Arma el catálogo desde las filas: valida cada plantilla (una inválida se trata como «sin formulario») y ordena los formatos. */
export function armarCatalogo(f: FilasCatalogo): Catalog {
  const validas: TemplateRow[] = [];
  for (const t of f.form_templates) {
    const res = validateTemplate(t.schema);
    if (res.ok) validas.push({ ...t, schema: res.template });
  }
  const ids = new Set(validas.map((t) => t.id));
  return {
    areas: f.areas,
    equipmentTypes: f.equipment_types,
    workModes: f.work_modes,
    combinations: f.catalog_combinations.map((c) => ({
      ...c,
      template_id: c.template_id && ids.has(c.template_id) ? c.template_id : null,
    })),
    templates: validas,
    formatos: ordenarFilas(f.formatos).map(filaAFormato),
  };
}

/**
 * Copia del catálogo que viaja dentro de la app (`src/data/catalogo-incluido.json`, ver `scripts/exportar-catalogo.mjs`),
 * para que un teléfono pueda inspeccionar sin haber descargado nunca el catálogo (primer uso sin señal).
 */
export interface CatalogoIncluido {
  /** Project ref de Supabase del que se exportó. */
  origen: string;
  generadoEn: string;
  filas: FilasCatalogo;
}

/**
 * La copia incluida solo sirve si es de la misma base a la que apunta la app: los identificadores (áreas, equipos, plantillas)
 * son distintos en cada base y una inspección con ids de otra base sería rechazada.
 */
export function catalogoIncluido(incluido: CatalogoIncluido | null | undefined, urlSupabase: string | undefined): Catalog | null {
  if (!incluido?.origen || !urlSupabase) return null;
  let host: string;
  try {
    host = new URL(urlSupabase).hostname;
  } catch {
    return null;
  }
  return host.startsWith(`${incluido.origen}.`) ? armarCatalogo(incluido.filas) : null;
}

async function fetchCatalog(supabase: SupabaseClient): Promise<Catalog> {
  const entries = (table: string) =>
    supabase.from(table).select("id, code, name, sort").eq("active", true).order("sort");

  const [areas, equipment, modes, combos, templates, formatos] = await Promise.all([
    entries("areas"),
    entries("equipment_types"),
    entries("work_modes"),
    supabase.from("catalog_combinations").select("equipment_type_id, work_mode_id, template_id"),
    supabase
      .from("form_templates")
      .select("id, equipment_type_id, work_mode_id, version, schema")
      .eq("status", "published"),
    supabase.from("formatos").select(COLUMNAS_FORMATO),
  ]);
  for (const r of [areas, equipment, modes, combos, templates, formatos]) if (r.error) throw r.error;

  return armarCatalogo({
    areas: (areas.data ?? []) as CatalogEntry[],
    equipment_types: (equipment.data ?? []) as CatalogEntry[],
    work_modes: (modes.data ?? []) as CatalogEntry[],
    catalog_combinations: (combos.data ?? []) as Combination[],
    form_templates: templates.data ?? [],
    formatos: (formatos.data ?? []) as FilaFormatoBD[],
  });
}

/**
 * Catálogo para el flujo Área → Equipo → Modo. Con red se actualiza la copia local;
 * sin red (o si falla) se usa la última copia guardada; si el teléfono nunca la descargó, la copia incluida en la app.
 */
export async function loadCatalog(
  almacen: Almacen,
  supabase: SupabaseClient,
  online: boolean,
  incluido: () => Catalog | null = () => null,
): Promise<{ catalog: Catalog; fromCache: boolean; incluido?: boolean }> {
  let falloServidor: unknown = null;
  if (online) {
    try {
      const catalog = await fetchCatalog(supabase);
      await almacen.guardarCatalogo({ key: KEY, value: catalog, updatedAt: Date.now() });
      return { catalog, fromCache: false };
    } catch (e) {
      // cae a la copia local, pero se deja rastro: un error del servidor no se arregla "conectándose a internet".
      falloServidor = e;
      console.error("[catalogo] No se pudo descargar el catálogo:", e);
    }
  }
  const cached = await readCatalogCache(almacen);
  if (cached) return { catalog: cached, fromCache: true };
  // Primer uso sin señal: la copia que viaja dentro de la app (no se guarda; se reemplaza en la primera descarga).
  const deLaApp = incluido();
  if (deLaApp) return { catalog: deLaApp, fromCache: true, incluido: true };
  throw new Error(mensajeSinCatalogo(online, falloServidor));
}

/** Texto de un error de Supabase/PostgREST o de JavaScript, sin depender de su forma exacta. */
function detalleError(e: unknown): string {
  if (e && typeof e === "object") {
    const o = e as { message?: unknown; code?: unknown };
    const msg = typeof o.message === "string" ? o.message : "";
    const code = typeof o.code === "string" && o.code ? ` (${o.code})` : "";
    if (msg) return msg + code;
  }
  return typeof e === "string" && e ? e : "error desconocido";
}

/**
 * Mensaje cuando no hay catálogo que mostrar. Distingue "sin red" de "el servidor respondió con error", porque en el
 * segundo caso pedir que se conecte a internet confunde: el problema está en el servidor (p. ej. falta una migración).
 */
export function mensajeSinCatalogo(online: boolean, falloServidor: unknown): string {
  if (online && falloServidor) {
    const red = falloServidor instanceof TypeError; // fetch falla con TypeError cuando no hay conexión real
    if (!red) {
      return `El servidor no entregó el catálogo de formatos: ${detalleError(falloServidor)}. Avise al administrador.`;
    }
  }
  return "Sin catálogo local. Conéctese a internet al menos una vez para descargarlo.";
}

export function templateFor(catalog: Catalog, equipmentTypeId: string, workModeId: string): TemplateRow | null {
  const combo = catalog.combinations.find(
    (c) => c.equipment_type_id === equipmentTypeId && c.work_mode_id === workModeId,
  );
  if (!combo?.template_id) return null;
  return catalog.templates.find((t) => t.id === combo.template_id) ?? null;
}

/** Cuándo se descargó la copia local del catálogo (ms), para mostrar «Listo para trabajar sin señal · fecha». */
export async function fechaCatalogo(almacen: Almacen): Promise<number | null> {
  return (await almacen.leerCatalogo(KEY))?.updatedAt ?? null;
}
