import type { DraftRecord, PhotoRecord, SubmitPayload } from "@/lib/offline/db";
import type { FormTemplateSchema, TemplateItem, VerificationValue } from "@/lib/templates/schema";
import { answerIssues } from "@/lib/templates/validate";

/** Claves de respuestas "meta" (no son ítems de la plantilla). */
export const META = {
  header: "_header",
  participantes: "_participantes",
  diagnostico: "_diagnostico",
  roles: "_roles",
  ejecutor: "_ejecutor",
} as const;

/** Nombre de quien realizó la inspección, escrito en el formulario. */
export const getEjecutor = (answers: Record<string, unknown>): string => {
  const v = answers[META.ejecutor];
  return typeof v === "string" ? v : "";
};

export interface Participantes {
  nombres: string;
  firmaId?: string;
  /** Solo local, para volver a dibujar la firma; no se envía. */
  firmaDataUrl?: string;
}

export interface Diagnostico {
  observaciones: string;
  consideraciones: string;
}

export type Severity = SubmitPayload["findings"][number]["severity"];

export const SEVERIDADES: { value: Severity; label: string }[] = [
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "critica", label: "Crítica" },
];

export const photoPath = (userId: string, inspectionId: string, photoId: string, ext: "jpg" | "png" = "jpg") =>
  `${userId}/${inspectionId}/${photoId}.${ext}`;

export function newDraft(input: {
  userId: string;
  areaId: string;
  equipmentTypeId: string;
  workModeId: string;
  templateId: string;
}): DraftRecord {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    technicianId: input.userId,
    areaId: input.areaId,
    equipmentTypeId: input.equipmentTypeId,
    workModeId: input.workModeId,
    templateId: input.templateId,
    header: {},
    answers: {},
    findings: [],
    photoIds: [],
    startedAt: new Date(now).toISOString(),
    updatedAt: now,
    state: "draft",
  };
}

export const allItems = (t: FormTemplateSchema): TemplateItem[] => t.sections.flatMap((s) => s.items);

export function getVerification(draft: DraftRecord, itemId: string): Partial<VerificationValue> {
  return (draft.answers[itemId] as Partial<VerificationValue> | undefined) ?? {};
}

export interface Issue {
  /** Índice de sección (null = datos del equipo o cierre). */
  section: number | null;
  area: "header" | "item" | "closing";
  itemId?: string;
  message: string;
}

/** Reglas de envío: obligatorios, ML con observación, NR con motivo (foto opcional), firma del participante. */
export function validateDraft(draft: DraftRecord, template: FormTemplateSchema): Issue[] {
  const issues: Issue[] = [];

  if (!getEjecutor(draft.answers).trim()) {
    issues.push({ section: null, area: "header", message: "Falta el nombre de quien realiza la inspección" });
  }

  for (const h of template.header) {
    if (h.required && !(draft.header[h.key] ?? "").trim()) {
      issues.push({ section: null, area: "header", message: `Falta ${h.label}` });
    }
  }

  template.sections.forEach((section, si) => {
    for (const item of section.items) {
      const value = draft.answers[item.id];
      const requerido = item.type === "verificacion" || ("required" in item && item.required);
      if (value === undefined || (item.type === "verificacion" && !(value as Partial<VerificationValue>).estado)) {
        if (requerido) issues.push({ section: si, area: "item", itemId: item.id, message: `Sin responder: ${item.label}` });
        continue;
      }
      for (const m of answerIssues(item, value)) {
        issues.push({ section: si, area: "item", itemId: item.id, message: `${item.label} (${m})` });
      }
    }
  });

  const part = draft.answers[META.participantes] as Participantes | undefined;
  if (!part?.nombres?.trim()) issues.push({ section: null, area: "closing", message: "Falta el nombre de los participantes" });
  if (!part?.firmaId) issues.push({ section: null, area: "closing", message: "Falta la firma del participante" });
  return issues;
}

/** Convierte el borrador en el payload de la RPC submit_inspection y la lista de fotos a subir. */
export function buildSubmission(
  draft: DraftRecord,
  template: FormTemplateSchema,
  photos: PhotoRecord[],
): { payload: SubmitPayload; photoIds: string[] } {
  const byId = new Map(photos.map((p) => [p.id, p]));
  const answers: SubmitPayload["answers"] = [];
  const findings: SubmitPayload["findings"] = [];
  const used = new Map<string, "photo" | "finding_photo" | "participant_signature">();

  for (const item of allItems(template)) {
    const value = draft.answers[item.id];
    if (value === undefined) continue;
    answers.push({ item_key: item.id, value });

    if (item.type === "verificacion") {
      const v = value as VerificationValue;
      (v.fotos ?? []).forEach((id, i) => used.set(id, v.estado === "ML" && i === 0 ? "finding_photo" : "photo"));
      if (v.estado === "ML") {
        const f = draft.findings.find((x) => x.item_key === item.id);
        findings.push({
          id: f?.id ?? crypto.randomUUID(),
          item_key: item.id,
          severity: f?.severity ?? "media",
          description: (v.obs ?? "").trim(),
          photo_attachment_id: v.fotos?.[0] ?? null,
        });
      }
    } else if (item.type === "photo") {
      ((value as string[]) ?? []).forEach((id) => used.set(id, "photo"));
    }
  }

  answers.push({ item_key: META.header, value: draft.header });
  answers.push({ item_key: META.ejecutor, value: getEjecutor(draft.answers).trim() });
  const part = draft.answers[META.participantes] as Participantes | undefined;
  if (part) {
    answers.push({ item_key: META.participantes, value: { nombres: part.nombres, firmaId: part.firmaId } });
    if (part.firmaId) used.set(part.firmaId, "participant_signature");
  }
  for (const key of [META.diagnostico, META.roles]) {
    if (draft.answers[key] !== undefined) answers.push({ item_key: key, value: draft.answers[key] });
  }

  const attachments: SubmitPayload["attachments"] = [];
  for (const [id, kind] of used) {
    const p = byId.get(id);
    if (!p) continue;
    attachments.push({ id, storage_path: p.storagePath, kind, mime: p.mime, size_bytes: p.sizeBytes });
  }

  return {
    payload: {
      inspection: {
        id: draft.id,
        area_id: draft.areaId,
        equipment_type_id: draft.equipmentTypeId,
        work_mode_id: draft.workModeId,
        template_id: draft.templateId,
        equipment_tag: (draft.header.tag ?? "").trim(),
        started_at: draft.startedAt,
        performed_by: getEjecutor(draft.answers).trim(),
      },
      answers,
      findings,
      attachments,
    },
    photoIds: attachments.map((a) => a.id),
  };
}
