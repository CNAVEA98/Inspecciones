// Port de las consultas de revisión de src/lib/revision/queries.ts de la web (2026-11-09): la misma lectura (con RLS) pero con el
// cliente de Supabase de la app. No incluye «Equipos con fallas» ni el seguimiento SAP (siguen en la web). Ver app-movil/DISENO.md.
import type { SupabaseClient } from "@supabase/supabase-js";
import { templateSchema } from "@/lib/templates/schema";
import type { InspectionStatus } from "./estado";
import type { Alcance, Seguimiento } from "./fallas";
import type { Adjunto, DetalleInspeccion, FilaBandeja, FirmaRevision, Hallazgo } from "./queries";

/** PostgREST devuelve la relación como objeto o como lista de un elemento según la inferencia. */
const nombre = (rel: unknown): string => {
  const o = Array.isArray(rel) ? rel[0] : rel;
  return (
    (o as { name?: string } | null | undefined)?.name ??
    (o as { full_name?: string } | null | undefined)?.full_name ??
    "—"
  );
};

const URL_SEGUNDOS = 60 * 60;

const aSeguimiento = (r: { scope: unknown; sap_notice: unknown; channel_note: unknown }): Seguimiento => ({
  scope: r.scope as Alcance,
  sapNotice: (r.sap_notice as string | null) ?? null,
  channelNote: (r.channel_note as string | null) ?? null,
});

export async function listarBandeja(supabase: SupabaseClient, estados: InspectionStatus[]): Promise<FilaBandeja[]> {
  const { data, error } = await supabase
    .from("inspections")
    .select(
      `id, folio, status, equipment_tag, submitted_at, performed_by, technician_shift,
       area:areas(name), equipo:equipment_types(name), modo:work_modes(name),
       tecnico:profiles!technician_id(full_name)`,
    )
    .in("status", estados)
    .order("submitted_at", { ascending: false, nullsFirst: false })
    .limit(500);
  if (error) throw new Error(`No se pudo cargar la bandeja: ${error.message}`);

  return (data ?? []).map((r) => ({
    id: r.id as string,
    folio: r.folio as string | null,
    status: r.status as InspectionStatus,
    equipmentTag: r.equipment_tag as string,
    area: nombre(r.area),
    equipo: nombre(r.equipo),
    modo: nombre(r.modo),
    tecnico: nombre(r.tecnico),
    realizadoPor: (r.performed_by as string) || "—",
    turno: (r.technician_shift as "A" | "B" | null) ?? null,
    submittedAt: r.submitted_at as string | null,
  }));
}

/** Devuelve null si la inspección no existe o el usuario no puede verla (RLS). */
export async function obtenerDetalle(supabase: SupabaseClient, id: string): Promise<DetalleInspeccion | null> {
  const [inspRes, respuestasRes, hallazgosRes, adjuntosRes, firmasRes, seguimientoRes] = await Promise.all([
    supabase
      .from("inspections")
      .select(
        `id, folio, status, equipment_tag, template_id, template_version, started_at, submitted_at, review_comment,
         performed_by, technician_shift,
         area:areas(name), equipo:equipment_types(name), modo:work_modes(name),
         tecnico:profiles!technician_id(full_name), plantilla:form_templates(schema)`,
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("answers").select("item_key, value").eq("inspection_id", id),
    supabase
      .from("findings")
      .select("id, item_key, severity, description, photo_attachment_id")
      .eq("inspection_id", id)
      .order("created_at"),
    supabase.from("attachments").select("id, kind, storage_path").eq("inspection_id", id),
    supabase
      .from("signatures")
      .select("stage, decision, comment, signed_at, image_path, firmante:profiles!signer_id(full_name)")
      .eq("inspection_id", id)
      .order("signed_at"),
    supabase.from("finding_followups").select("finding_id, scope, sap_notice, channel_note").eq("inspection_id", id),
  ]);
  const { data: insp, error } = inspRes;
  if (error) throw new Error(`No se pudo cargar la inspección: ${error.message}`);
  if (!insp) return null;
  const plantillaRel = (Array.isArray(insp.plantilla) ? insp.plantilla[0] : insp.plantilla) as { schema?: unknown } | null;
  const seguimientoDe = new Map((seguimientoRes.data ?? []).map((r) => [r.finding_id as string, aSeguimiento(r)]));
  const parsed = templateSchema.safeParse(plantillaRel?.schema);

  const rutas = (adjuntosRes.data ?? []).map((a) => a.storage_path as string);
  const firmasRaw = firmasRes.data ?? [];
  const [fotosFirmadas, firmasFirmadas] = await Promise.all([
    rutas.length > 0 ? supabase.storage.from("inspection-photos").createSignedUrls(rutas, URL_SEGUNDOS) : null,
    firmasRaw.length > 0
      ? supabase.storage.from("signatures").createSignedUrls(
          firmasRaw.map((f) => f.image_path as string),
          URL_SEGUNDOS,
        )
      : null,
  ]);
  const urlDeFoto = new Map<string, string>();
  for (const f of fotosFirmadas?.data ?? []) if (f.path && f.signedUrl) urlDeFoto.set(f.path, f.signedUrl);
  const urlDeFirma = new Map<string, string>();
  for (const f of firmasFirmadas?.data ?? []) if (f.path && f.signedUrl) urlDeFirma.set(f.path, f.signedUrl);

  return {
    id: insp.id as string,
    folio: insp.folio as string | null,
    status: insp.status as InspectionStatus,
    equipmentTag: insp.equipment_tag as string,
    area: nombre(insp.area),
    equipo: nombre(insp.equipo),
    modo: nombre(insp.modo),
    tecnico: nombre(insp.tecnico),
    realizadoPor: (insp.performed_by as string) || "—",
    turno: (insp.technician_shift as "A" | "B" | null) ?? null,
    templateVersion: insp.template_version as number,
    startedAt: insp.started_at as string,
    submittedAt: insp.submitted_at as string | null,
    reviewComment: insp.review_comment as string | null,
    plantilla: parsed.success ? parsed.data : null,
    respuestas: Object.fromEntries((respuestasRes.data ?? []).map((r) => [r.item_key as string, r.value])),
    hallazgos: (hallazgosRes.data ?? []).map(
      (h): Hallazgo => ({
        id: h.id as string,
        itemKey: h.item_key as string,
        severity: h.severity as Hallazgo["severity"],
        description: h.description as string,
        photoAttachmentId: h.photo_attachment_id as string | null,
        seguimiento: seguimientoDe.get(h.id as string) ?? null,
      }),
    ),
    adjuntos: (adjuntosRes.data ?? []).map(
      (a): Adjunto => ({
        id: a.id as string,
        kind: a.kind as Adjunto["kind"],
        url: urlDeFoto.get(a.storage_path as string) ?? null,
      }),
    ),
    firmas: firmasRaw.map(
      (f): FirmaRevision => ({
        stage: f.stage as FirmaRevision["stage"],
        decision: f.decision as FirmaRevision["decision"],
        comment: f.comment as string | null,
        signedAt: f.signed_at as string,
        firmante: nombre(f.firmante),
        url: urlDeFirma.get(f.image_path as string) ?? null,
      }),
    ),
  };
}
