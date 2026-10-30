import { createClient } from "@/lib/supabase/server";
import { templateSchema, type FormTemplateSchema } from "@/lib/templates/schema";
import type { InspectionStatus } from "./estado";

export interface FilaBandeja {
  id: string;
  folio: string | null;
  status: InspectionStatus;
  equipmentTag: string;
  area: string;
  equipo: string;
  modo: string;
  /** Cuenta de técnico con la que se envió. */
  tecnico: string;
  /** Persona que realizó la inspección, según el formulario. */
  realizadoPor: string;
  turno: "A" | "B" | null;
  submittedAt: string | null;
}

export interface Hallazgo {
  id: string;
  itemKey: string;
  severity: "baja" | "media" | "alta" | "critica";
  description: string;
  photoAttachmentId: string | null;
}

export interface Adjunto {
  id: string;
  kind: "photo" | "finding_photo" | "participant_signature";
  url: string | null;
}

export interface FirmaRevision {
  stage: "supervisor" | "planner";
  decision: "approved" | "rejected";
  comment: string | null;
  signedAt: string;
  firmante: string;
  url: string | null;
}

export interface DetalleInspeccion {
  id: string;
  folio: string | null;
  status: InspectionStatus;
  equipmentTag: string;
  area: string;
  equipo: string;
  modo: string;
  tecnico: string;
  realizadoPor: string;
  turno: "A" | "B" | null;
  templateVersion: number;
  startedAt: string;
  submittedAt: string | null;
  reviewComment: string | null;
  plantilla: FormTemplateSchema | null;
  respuestas: Record<string, unknown>;
  hallazgos: Hallazgo[];
  adjuntos: Adjunto[];
  firmas: FirmaRevision[];
}

/** PostgREST devuelve la relación como objeto o como lista de un elemento según la inferencia. */
const nombre = (rel: unknown): string => {
  const o = Array.isArray(rel) ? rel[0] : rel;
  return (o as { name?: string; full_name?: string } | null | undefined)?.name ??
    (o as { full_name?: string } | null | undefined)?.full_name ??
    "—";
};

const URL_SEGUNDOS = 60 * 60;

export async function listarBandeja(estados: InspectionStatus[]): Promise<FilaBandeja[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inspections")
    .select(
      `id, folio, status, equipment_tag, submitted_at, performed_by, technician_shift,
       area:areas(name), equipo:equipment_types(name), modo:work_modes(name),
       tecnico:profiles!technician_id(full_name)`,
    )
    .in("status", estados)
    .order("submitted_at", { ascending: false, nullsFirst: false })
    .limit(1000);
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
export async function obtenerDetalle(id: string): Promise<DetalleInspeccion | null> {
  const supabase = await createClient();
  const { data: insp, error } = await supabase
    .from("inspections")
    .select(
      `id, folio, status, equipment_tag, template_id, template_version, started_at, submitted_at, review_comment,
       performed_by, technician_shift,
       area:areas(name), equipo:equipment_types(name), modo:work_modes(name),
       tecnico:profiles!technician_id(full_name)`,
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`No se pudo cargar la inspección: ${error.message}`);
  if (!insp) return null;

  const [plantillaRes, respuestasRes, hallazgosRes, adjuntosRes, firmasRes] = await Promise.all([
    supabase.from("form_templates").select("schema").eq("id", insp.template_id).maybeSingle(),
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
  ]);

  const parsed = templateSchema.safeParse(plantillaRes.data?.schema);

  const rutas = (adjuntosRes.data ?? []).map((a) => a.storage_path as string);
  const urlDeFoto = new Map<string, string>();
  if (rutas.length > 0) {
    const { data: firmadas } = await supabase.storage.from("inspection-photos").createSignedUrls(rutas, URL_SEGUNDOS);
    for (const f of firmadas ?? []) if (f.path && f.signedUrl) urlDeFoto.set(f.path, f.signedUrl);
  }

  const firmasRaw = firmasRes.data ?? [];
  const urlDeFirma = new Map<string, string>();
  if (firmasRaw.length > 0) {
    const { data: firmadas } = await supabase.storage
      .from("signatures")
      .createSignedUrls(
        firmasRaw.map((f) => f.image_path as string),
        URL_SEGUNDOS,
      );
    for (const f of firmadas ?? []) if (f.path && f.signedUrl) urlDeFirma.set(f.path, f.signedUrl);
  }

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
    hallazgos: (hallazgosRes.data ?? []).map((h) => ({
      id: h.id as string,
      itemKey: h.item_key as string,
      severity: h.severity as Hallazgo["severity"],
      description: h.description as string,
      photoAttachmentId: h.photo_attachment_id as string | null,
    })),
    adjuntos: (adjuntosRes.data ?? []).map((a) => ({
      id: a.id as string,
      kind: a.kind as Adjunto["kind"],
      url: urlDeFoto.get(a.storage_path as string) ?? null,
    })),
    firmas: firmasRaw.map((f) => ({
      stage: f.stage as FirmaRevision["stage"],
      decision: f.decision as FirmaRevision["decision"],
      comment: f.comment as string | null,
      signedAt: f.signed_at as string,
      firmante: nombre(f.firmante),
      url: urlDeFirma.get(f.image_path as string) ?? null,
    })),
  };
}
