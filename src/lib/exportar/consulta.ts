import { inicioDiaChile, sumarDias } from "@/lib/fecha";
import { SIN_TURNO, tipoDeModo, zonaDeArea } from "@/lib/revision/carpetas";
import type { InspectionStatus } from "@/lib/revision/estado";
import { estadoGestion, type Alcance } from "@/lib/revision/fallas";
import { leerTodo } from "@/lib/supabase/paginas";
import { createClient } from "@/lib/supabase/server";
import { MAX_FILAS_EXPORTAR, estadosDe, patronTag, zonaDelFiltro, type FiltroExportar } from "./filtro";
import type { FirmaExportada, InspeccionExportada } from "./libro";

interface ItemCatalogo {
  id: string;
  code: string;
  name: string;
}

export interface CatalogoExportar {
  areas: ItemCatalogo[];
  equipos: ItemCatalogo[];
  modos: ItemCatalogo[];
  /** «código de equipo|código de modo» → formato del catálogo. */
  formatos: Map<string, { id: string; titulo: string }>;
}

/** Catálogos para armar los filtros y traducir sus códigos a los id de la base. */
export async function leerCatalogoExportar(): Promise<CatalogoExportar> {
  const supabase = await createClient();
  const [areas, equipos, modos, formatos] = await Promise.all([
    supabase.from("areas").select("id, code, name").order("sort"),
    supabase.from("equipment_types").select("id, code, name").order("name"),
    supabase.from("work_modes").select("id, code, name").order("sort"),
    supabase.from("formatos").select("id, titulo, tipo_equipo_code, modo_code").order("orden"),
  ]);
  const error = areas.error ?? equipos.error ?? modos.error ?? formatos.error;
  if (error) throw new Error(`No se pudo cargar el catálogo: ${error.message}`);
  const porPar = new Map<string, { id: string; titulo: string }>();
  for (const f of formatos.data ?? []) {
    if (!f.tipo_equipo_code || !f.modo_code) continue;
    const clave = `${f.tipo_equipo_code}|${f.modo_code}`;
    const previo = porPar.get(clave);
    // Dos formatos pueden abrir la misma plantilla (p. ej. una copia): se muestran ambos códigos.
    porPar.set(clave, previo ? { id: `${previo.id} / ${f.id}`, titulo: previo.titulo } : { id: f.id as string, titulo: f.titulo as string });
  }
  return {
    areas: (areas.data ?? []) as ItemCatalogo[],
    equipos: (equipos.data ?? []) as ItemCatalogo[],
    modos: (modos.data ?? []) as ItemCatalogo[],
    formatos: porPar,
  };
}

/** Lo mínimo del constructor de consultas de Supabase que usan los filtros (cada método devuelve la misma consulta). */
interface Filtrable {
  in(columna: string, valores: readonly string[]): Filtrable;
  eq(columna: string, valor: string): Filtrable;
  is(columna: string, valor: null): Filtrable;
  ilike(columna: string, patron: string): Filtrable;
  gte(columna: string, valor: string): Filtrable;
  lt(columna: string, valor: string): Filtrable;
}

/**
 * Aplica el filtro en la base (no en memoria): así el conteo de la pantalla y el archivo descargado salen de la misma
 * condición y no dependen de cuántas filas quepan en una respuesta. Un código que no existe no devuelve nada.
 */
export function aplicarFiltro<Q>(consulta: Q, f: FiltroExportar, cat: CatalogoExportar): Q {
  const NADA = ["00000000-0000-0000-0000-000000000000"];
  // El tipo real de la consulta de Supabase es demasiado profundo para un genérico; se usa su forma mínima.
  let q = (consulta as unknown as Filtrable).in("status", estadosDe(f.estado));
  // Rango en días de Chile: desde las 00:00 de «desde» hasta antes de las 00:00 del día siguiente a «hasta».
  q = q.gte("submitted_at", inicioDiaChile(f.desde).toISOString());
  q = q.lt("submitted_at", inicioDiaChile(sumarDias(f.hasta, 1)).toISOString());
  if (f.turno === SIN_TURNO) q = q.is("technician_shift", null);
  else if (f.turno) q = q.eq("technician_shift", f.turno);
  if (f.tipo) {
    const ids = cat.modos.filter((m) => tipoDeModo(m.name) === f.tipo).map((m) => m.id);
    q = q.in("work_mode_id", ids.length > 0 ? ids : NADA);
  }
  if (f.area) {
    const zona = zonaDelFiltro(f.area);
    const ids = cat.areas.filter((a) => (zona ? zonaDeArea(a.name) === zona : a.code === f.area)).map((a) => a.id);
    q = q.in("area_id", ids.length > 0 ? ids : NADA);
  }
  if (f.equipo) {
    const id = cat.equipos.find((e) => e.code === f.equipo)?.id;
    q = q.in("equipment_type_id", id ? [id] : NADA);
  }
  if (f.tag) q = q.ilike("equipment_tag", patronTag(f.tag));
  return q as unknown as Q;
}

/** Filas de la vista previa de la pestaña «Exportar». */
export const FILAS_VISTA_PREVIA = 15;

export interface FilaVistaPrevia {
  id: string;
  folio: string | null;
  status: InspectionStatus;
  equipmentTag: string;
  equipo: string;
  modo: string;
  area: string;
  turno: "A" | "B" | null;
  realizadoPor: string;
  submittedAt: string | null;
}

/** Página de la vista previa pedida en la URL («pagina=2»); lo inválido es la primera. */
export function parsePagina(v: string | string[] | undefined): number {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isInteger(n) && n >= 1 && n <= 10_000 ? n : 1;
}

/**
 * Una página de las filas que saldrán en el Excel, con el mismo filtro y el mismo orden que la descarga (de la más
 * reciente a la más antigua), y el total que cumple el filtro. Una sola consulta liviana: sin firmas, respuestas ni
 * hallazgos. Si la página pedida ya no existe (cambió el filtro o los datos), devuelve la última.
 */
export async function previsualizarExportar(
  f: FiltroExportar,
  cat: CatalogoExportar,
  pagina = 1,
): Promise<{ total: number; filas: FilaVistaPrevia[]; pagina: number; paginas: number }> {
  const supabase = await createClient();
  const desde = (pagina - 1) * FILAS_VISTA_PREVIA;
  const { data, count, error } = await aplicarFiltro(
    supabase
      .from("inspections")
      .select(
        `id, folio, status, equipment_tag, submitted_at, performed_by, technician_shift,
         area:areas(name), equipo:equipment_types(name), modo:work_modes(name)`,
        { count: "exact" },
      ),
    f,
    cat,
  )
    .order("submitted_at", { ascending: false })
    .order("id")
    .range(desde, desde + FILAS_VISTA_PREVIA - 1);
  // PGRST103: la página pedida queda más allá del final. Se cuenta de nuevo y se muestra la última que existe.
  if (error?.code === "PGRST103" && pagina > 1) {
    const { count: n } = await aplicarFiltro(supabase.from("inspections").select("id", { count: "exact", head: true }), f, cat);
    return previsualizarExportar(f, cat, Math.min(pagina - 1, Math.max(1, Math.ceil((n ?? 0) / FILAS_VISTA_PREVIA))));
  }
  if (error) throw new Error(`No se pudo cargar la vista previa: ${error.message}`);
  const filas = (data ?? []).map((r): FilaVistaPrevia => ({
    id: r.id as string,
    folio: r.folio as string | null,
    status: r.status as InspectionStatus,
    equipmentTag: (r.equipment_tag as string) || "",
    equipo: una<{ name: string }>(r.equipo)?.name ?? "",
    modo: una<{ name: string }>(r.modo)?.name ?? "",
    area: una<{ name: string }>(r.area)?.name ?? "",
    turno: r.technician_shift === "A" || r.technician_shift === "B" ? r.technician_shift : null,
    realizadoPor: (r.performed_by as string) || "",
    submittedAt: r.submitted_at as string | null,
  }));
  const total = count ?? filas.length;
  const paginas = Math.max(1, Math.ceil(total / FILAS_VISTA_PREVIA));
  // Una página vacía que no es la primera (justo después del final) también vuelve a la última.
  if (filas.length === 0 && pagina > 1) return previsualizarExportar(f, cat, Math.min(pagina - 1, paginas));
  return { total, filas, pagina, paginas };
}

const SELECT_EXPORTAR = `id, folio, status, equipment_tag, template_version, started_at, submitted_at, review_comment,
  performed_by, technician_shift,
  area:areas(name), equipo:equipment_types(code, name), modo:work_modes(code, name),
  tecnico:profiles!technician_id(full_name),
  signatures(stage, decision, signed_at, comment, firmante:profiles!signer_id(full_name)),
  answers(value),
  findings(id, finding_followups(scope, sap_notice, channel_note))`;

const una = <T,>(rel: unknown): T | null => ((Array.isArray(rel) ? rel[0] : rel) as T | null | undefined) ?? null;
const lista = <T,>(rel: unknown): T[] => (Array.isArray(rel) ? (rel as T[]) : rel ? [rel as T] : []);

/**
 * Inspecciones que cumplen el filtro, de la más reciente a la más antigua, con sus firmas, el N.º de OT de la cabecera
 * y el conteo de hallazgos, en una sola consulta por página. La lectura pasa por RLS con la sesión de quien descarga.
 */
export async function leerExportar(
  f: FiltroExportar,
  cat: CatalogoExportar,
): Promise<{ inspecciones: InspeccionExportada[]; truncado: boolean }> {
  const supabase = await createClient();
  const consulta = () => supabase.from("inspections").select(SELECT_EXPORTAR);
  type Fila = NonNullable<Awaited<ReturnType<typeof consulta>>["data"]>[number];
  const { filas, truncado } = await leerTodo<Fila>(
    (d, h) =>
      aplicarFiltro(consulta(), f, cat)
        // De las respuestas solo interesa la cabecera (trae el N.º de OT).
        .eq("answers.item_key", "_header")
        .order("submitted_at", { ascending: false })
        .order("id")
        .range(d, h),
    MAX_FILAS_EXPORTAR,
  );

  type Firma = { stage: string; decision: string; signed_at: string; comment: string | null; firmante: unknown };
  const inspecciones = filas.map((r): InspeccionExportada => {
    const equipo = una<{ code: string; name: string }>(r.equipo);
    const modo = una<{ code: string; name: string }>(r.modo);
    const firmas = lista<Firma>(r.signatures);
    const firma = (etapa: string): FirmaExportada | null => {
      const s = firmas.find((x) => x.stage === etapa);
      return s
        ? {
            fecha: s.signed_at,
            firmante: una<{ full_name?: string }>(s.firmante)?.full_name ?? "",
            decision: s.decision === "rejected" ? "rejected" : "approved",
          }
        : null;
    };
    const cabecera = (lista<{ value: unknown }>(r.answers)[0]?.value ?? {}) as Record<string, unknown>;
    const hallazgos = lista<{ finding_followups: unknown }>(r.findings);
    const pendientes = hallazgos.filter((h) => {
      const s = una<{ scope: unknown; sap_notice: unknown; channel_note: unknown }>(h.finding_followups);
      return (
        estadoGestion(
          s ? { scope: s.scope as Alcance, sapNotice: (s.sap_notice as string | null) ?? null, channelNote: (s.channel_note as string | null) ?? null } : null,
        ) === "pendiente"
      );
    }).length;
    const formato = equipo && modo ? cat.formatos.get(`${equipo.code}|${modo.code}`) : undefined;
    return {
      id: r.id as string,
      folio: r.folio as string | null,
      status: r.status as InspectionStatus,
      equipmentTag: (r.equipment_tag as string) || "",
      area: una<{ name: string }>(r.area)?.name ?? "",
      equipo: equipo?.name ?? "",
      modo: modo?.name ?? "",
      formatoId: formato?.id ?? "",
      formatoTitulo: formato?.titulo ?? "",
      templateVersion: (r.template_version as number | null) ?? null,
      turno: r.technician_shift === "A" || r.technician_shift === "B" ? r.technician_shift : null,
      realizadoPor: (r.performed_by as string) || "",
      cuenta: una<{ full_name?: string }>(r.tecnico)?.full_name ?? "",
      ot: typeof cabecera.ot === "string" ? cabecera.ot : "",
      startedAt: r.started_at as string | null,
      submittedAt: r.submitted_at as string | null,
      firmaSupervisor: firma("supervisor"),
      firmaProgramador: firma("planner"),
      comentarioRechazo: (r.review_comment as string | null) ?? firmas.find((x) => x.decision === "rejected")?.comment ?? "",
      hallazgos: hallazgos.length,
      hallazgosPendientes: pendientes,
    };
  });
  return { inspecciones, truncado };
}
