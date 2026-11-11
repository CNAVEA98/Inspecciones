import { hoyIso, inicioDiaChile, sumarDias } from "@/lib/fecha";
import { leerTodo } from "@/lib/supabase/paginas";
import { createClient } from "@/lib/supabase/server";
import type { InspectionStatus } from "./estado";
import { estadoGestion, type Alcance, type Severidad } from "./fallas";
import { DIAS_COMPARACION, DIAS_SERIE, type FilaPanel, type HallazgoPanel } from "./panel";

const una = <T,>(rel: unknown): T | null => ((Array.isArray(rel) ? rel[0] : rel) as T | null | undefined) ?? null;
const nombre = (rel: unknown) => una<{ name?: string }>(rel)?.name ?? "—";

const SELECT_FILA = `id, folio, status, equipment_tag, submitted_at, reviewed_at, technician_shift,
  area:areas(name), equipo:equipment_types(name), modo:work_modes(name)`;

const SELECT_HALLAZGO = `id, severity,
  inspections!inner(status, equipment_tag, technician_shift, area:areas(name), equipo:equipment_types(name)),
  finding_followups(scope, sap_notice, channel_note)`;

export interface DatosPanel {
  abiertas: FilaPanel[];
  recientes: FilaPanel[];
  hallazgos: HallazgoPanel[];
  /** Inspecciones enviadas desde que existe la plataforma (cualquier estado). */
  totalHistorico: number;
  aprobadasHistorico: number;
}

/**
 * Datos de la pantalla de inicio. Son cuatro lecturas livianas y en paralelo (sin respuestas, plantillas ni fotos):
 * lo que está por firmar, lo enviado en el período (`dias`; nunca menos de 14 días), los hallazgos vigentes y dos conteos que hace la base.
 * La lectura pasa por RLS con la sesión de quien mira.
 */
export async function leerDatosPanel(dias: number = DIAS_SERIE): Promise<DatosPanel> {
  const supabase = await createClient();
  const desde = inicioDiaChile(sumarDias(hoyIso(), -(Math.max(dias, DIAS_COMPARACION) - 1))).toISOString();
  const inspecciones = () => supabase.from("inspections").select(SELECT_FILA);
  type Fila = NonNullable<Awaited<ReturnType<typeof inspecciones>>["data"]>[number];
  const hallazgosQ = () => supabase.from("findings").select(SELECT_HALLAZGO);
  type FilaH = NonNullable<Awaited<ReturnType<typeof hallazgosQ>>["data"]>[number];
  const contar = (estados: InspectionStatus[]) =>
    supabase.from("inspections").select("id", { count: "exact", head: true }).in("status", estados);

  const [abiertas, recientes, hallazgos, total, aprobadas] = await Promise.all([
    leerTodo<Fila>((d, h) =>
      inspecciones().in("status", ["submitted", "supervisor_signed"]).order("submitted_at").order("id").range(d, h),
    ),
    leerTodo<Fila>((d, h) =>
      inspecciones()
        .in("status", ["submitted", "supervisor_signed", "approved", "rejected"])
        .gte("submitted_at", desde)
        .order("submitted_at")
        .order("id")
        .range(d, h),
    ),
    leerTodo<FilaH>((d, h) =>
      hallazgosQ().in("inspections.status", ["submitted", "supervisor_signed", "approved"]).order("id").range(d, h),
    ),
    contar(["submitted", "supervisor_signed", "approved", "rejected"]),
    contar(["approved"]),
  ]);
  if (total.error) throw new Error(`No se pudieron contar las inspecciones: ${total.error.message}`);

  const aFila = (r: Fila): FilaPanel => ({
    id: r.id as string,
    folio: r.folio as string | null,
    status: r.status as InspectionStatus,
    equipmentTag: (r.equipment_tag as string) || "",
    area: nombre(r.area),
    equipo: nombre(r.equipo),
    modo: nombre(r.modo),
    turno: r.technician_shift === "A" || r.technician_shift === "B" ? r.technician_shift : null,
    submittedAt: r.submitted_at as string | null,
    reviewedAt: r.reviewed_at as string | null,
  });

  return {
    abiertas: abiertas.filas.map(aFila),
    recientes: recientes.filas.map(aFila),
    hallazgos: hallazgos.filas.map((h): HallazgoPanel => {
      const insp = una<{ equipment_tag: string | null; technician_shift: string | null; area: unknown; equipo: unknown }>(h.inspections);
      const seg = una<{ scope: unknown; sap_notice: unknown; channel_note: unknown }>(h.finding_followups);
      return {
        severidad: h.severity as Severidad,
        tag: insp?.equipment_tag || "",
        area: nombre(insp?.area),
        equipo: nombre(insp?.equipo),
        turno: insp?.technician_shift === "A" || insp?.technician_shift === "B" ? insp.technician_shift : null,
        gestion: estadoGestion(
          seg
            ? { scope: seg.scope as Alcance, sapNotice: (seg.sap_notice as string | null) ?? null, channelNote: (seg.channel_note as string | null) ?? null }
            : null,
        ),
      };
    }),
    totalHistorico: total.count ?? 0,
    aprobadasHistorico: aprobadas.count ?? 0,
  };
}
