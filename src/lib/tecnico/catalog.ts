import type { SupabaseClient } from "@supabase/supabase-js";
import type { MlpDB } from "@/lib/offline/db";
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

export async function readCatalogCache(db: MlpDB): Promise<Catalog | null> {
  const row = await db.catalog.get(KEY);
  const cat = (row?.value as Catalog | undefined) ?? null;
  // Copia guardada antes de que los formatos vinieran de la base: no sirve, hay que descargar de nuevo.
  return cat && Array.isArray(cat.formatos) ? cat : null;
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

  // Una plantilla con JSON inválido no se ofrece: se trata como "sin formulario".
  const validas: TemplateRow[] = [];
  for (const t of templates.data ?? []) {
    const res = validateTemplate(t.schema);
    if (res.ok) validas.push({ ...t, schema: res.template });
  }
  const ids = new Set(validas.map((t) => t.id));

  return {
    areas: (areas.data ?? []) as CatalogEntry[],
    equipmentTypes: (equipment.data ?? []) as CatalogEntry[],
    workModes: (modes.data ?? []) as CatalogEntry[],
    combinations: ((combos.data ?? []) as Combination[]).map((c) => ({
      ...c,
      template_id: c.template_id && ids.has(c.template_id) ? c.template_id : null,
    })),
    templates: validas,
    formatos: ordenarFilas((formatos.data ?? []) as FilaFormatoBD[]).map(filaAFormato),
  };
}

/**
 * Catálogo para el flujo Área → Equipo → Modo. Con red se actualiza la copia local;
 * sin red (o si falla) se usa la última copia guardada.
 */
export async function loadCatalog(
  db: MlpDB,
  supabase: SupabaseClient,
  online: boolean,
): Promise<{ catalog: Catalog; fromCache: boolean }> {
  if (online) {
    try {
      const catalog = await fetchCatalog(supabase);
      await db.catalog.put({ key: KEY, value: catalog, updatedAt: Date.now() });
      return { catalog, fromCache: false };
    } catch {
      // cae a la copia local
    }
  }
  const cached = await readCatalogCache(db);
  if (!cached) throw new Error("Sin catálogo local. Conéctese a internet al menos una vez.");
  return { catalog: cached, fromCache: true };
}

export function templateFor(catalog: Catalog, equipmentTypeId: string, workModeId: string): TemplateRow | null {
  const combo = catalog.combinations.find(
    (c) => c.equipment_type_id === equipmentTypeId && c.work_mode_id === workModeId,
  );
  if (!combo?.template_id) return null;
  return catalog.templates.find((t) => t.id === combo.template_id) ?? null;
}
