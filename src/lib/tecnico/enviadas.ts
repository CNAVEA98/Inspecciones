import type { SupabaseClient } from "@supabase/supabase-js";
import type { DraftRecord, MlpDB } from "@/lib/offline/db";
import type { FormTemplateSchema, VerificationValue } from "@/lib/templates/schema";
import type { InspectionStatus } from "@/lib/revision/estado";
import { META, allItems, newDraft, type Participantes } from "./draft";
import { hoyIso } from "@/lib/fecha";

/** Inspección ya enviada, tal como la ve el técnico dueño (RLS: solo las suyas). */
export interface Enviada {
  id: string;
  folio: string | null;
  status: InspectionStatus;
  equipment_tag: string;
  area_id: string;
  equipment_type_id: string;
  work_mode_id: string;
  template_id: string;
  submitted_at: string | null;
  review_comment: string | null;
  reviewed_at: string | null;
}

/** Texto y colores del estado desde el punto de vista del técnico. */
export const ESTADO_ENVIADA: Record<InspectionStatus, { texto: string; clase: string }> = {
  draft: { texto: "Borrador", clase: "bg-cu-soft text-[#7a3d12]" },
  submitted: { texto: "Enviada · en revisión", clase: "bg-[#f1f0ec] text-graf" },
  supervisor_signed: { texto: "Revisada por supervisor", clase: "bg-[#f1f0ec] text-graf" },
  approved: { texto: "Aprobada", clase: "bg-[#e1f2e8] text-[#0b4a28]" },
  rejected: { texto: "Rechazada", clase: "bg-[#fbe4e4] text-[#8a0000]" },
};

const KEY = (userId: string) => `enviadas:${userId}`;
const COLUMNAS =
  "id, folio, status, equipment_tag, area_id, equipment_type_id, work_mode_id, template_id, submitted_at, review_comment, reviewed_at";

export async function readEnviadasCache(db: MlpDB, userId: string): Promise<Enviada[] | null> {
  const row = await db.catalog.get(KEY(userId));
  return (row?.value as Enviada[] | undefined) ?? null;
}

/** Últimas inspecciones enviadas por el técnico. Con red actualiza la copia local; sin red usa la última. */
export async function cargarEnviadas(
  db: MlpDB,
  supabase: SupabaseClient,
  userId: string,
  online: boolean,
): Promise<{ lista: Enviada[]; fromCache: boolean }> {
  if (online) {
    try {
      const { data, error } = await supabase
        .from("inspections")
        .select(COLUMNAS)
        .eq("technician_id", userId)
        .neq("status", "draft")
        .order("submitted_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      const lista = (data ?? []) as Enviada[];
      await db.catalog.put({ key: KEY(userId), value: lista, updatedAt: Date.now() });
      return { lista, fromCache: false };
    } catch {
      // cae a la copia local
    }
  }
  return { lista: (await readEnviadasCache(db, userId)) ?? [], fromCache: true };
}

/**
 * Borrador nuevo a partir de una inspección rechazada. Una inspección rechazada es definitiva: la corrección
 * se envía como inspección nueva (otro folio). Se copian cabecera, respuestas y hallazgos; las fotos y la firma
 * del participante NO se copian (viven en el servidor, no en este equipo) y hay que volver a tomarlas.
 */
export function borradorDeCorreccion(input: {
  userId: string;
  rechazada: Enviada;
  respuestas: { item_key: string; value: unknown }[];
  template: FormTemplateSchema;
}): DraftRecord {
  const { userId, rechazada, respuestas, template } = input;
  const draft = newDraft({
    userId,
    areaId: rechazada.area_id,
    equipmentTypeId: rechazada.equipment_type_id,
    workModeId: rechazada.work_mode_id,
    templateId: rechazada.template_id,
  });
  const porClave = new Map(respuestas.map((r) => [r.item_key, r.value]));

  const header = porClave.get(META.header);
  draft.header = {
    ...(header && typeof header === "object" ? (header as Record<string, string>) : {}),
    tag: rechazada.equipment_tag,
    fecha: hoyIso(),
  };

  for (const item of allItems(template)) {
    const v = porClave.get(item.id);
    if (v === undefined) continue;
    if (item.type === "verificacion") {
      const sinFotos = { ...(v as VerificationValue) };
      delete sinFotos.fotos;
      draft.answers[item.id] = sinFotos;
      if (sinFotos.estado === "ML") {
        draft.findings.push({
          id: crypto.randomUUID(),
          item_key: item.id,
          severity: "media",
          description: "",
          photo_attachment_id: null,
        });
      }
    } else if (item.type === "photo") {
      draft.answers[item.id] = [];
    } else {
      draft.answers[item.id] = v;
    }
  }

  for (const key of [META.ejecutor, META.diagnostico, META.roles]) {
    const v = porClave.get(key);
    if (v !== undefined) draft.answers[key] = v;
  }
  const part = porClave.get(META.participantes) as Participantes | undefined;
  if (part) draft.answers[META.participantes] = { nombres: part.nombres };

  draft.correccion = {
    de: rechazada.id,
    folio: rechazada.folio ?? "",
    motivo: rechazada.review_comment ?? "",
  };
  return draft;
}

/** Respuestas de una inspección propia, para armar la corrección. */
export async function cargarRespuestas(supabase: SupabaseClient, inspectionId: string) {
  const { data, error } = await supabase.from("answers").select("item_key, value").eq("inspection_id", inspectionId);
  if (error) throw error;
  return (data ?? []) as { item_key: string; value: unknown }[];
}
