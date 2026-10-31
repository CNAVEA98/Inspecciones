import type { DraftRecord, PhotoRecord, SubmitPayload } from "@/lib/offline/db";
import type { FormTemplateSchema, TemplateItem, VerificationValue } from "@/lib/templates/schema";
import { answerIssues } from "@/lib/templates/validate";

/** Claves de respuestas "meta" (no son ítems de la plantilla). */
export const META = {
  header: "_header",
  /** Firma del encargado de la actividad. La clave es heredada (antes eran los «participantes»): no se cambia para no tocar los registros existentes. */
  firmaEncargado: "_participantes",
  /** Nombres de los participantes (texto libre, opcional). Participan pero no firman. */
  participantes: "_lista_participantes",
  diagnostico: "_diagnostico",
  roles: "_roles",
  ejecutor: "_ejecutor",
} as const;

/** Nombre de quien realizó la inspección, escrito en el formulario. */
export const getEjecutor = (answers: Record<string, unknown>): string => {
  const v = answers[META.ejecutor];
  return typeof v === "string" ? v : "";
};

/** Firma del encargado de la actividad (el técnico que ejecuta). El supervisor y el planificador firman después, al revisar. */
export interface FirmaEncargado {
  /** Nombre del encargado; se completa al enviar con el rol «Encargado de la actividad». */
  nombres?: string;
  firmaId?: string;
  /** Solo local, para volver a dibujar la firma; no se envía. */
  firmaDataUrl?: string;
}

/** Rol de la plantilla que corresponde al encargado de la actividad («Encargado de la actividad», «Encargado actividad»…). */
export const rolEncargado = (template: FormTemplateSchema): string | undefined =>
  template.roles.find((r) => /encargado/i.test(r));

/** Nombres de los participantes escritos en el formulario (vacío si no se anotó ninguno). */
export function nombresParticipantes(answers: Record<string, unknown>): string {
  const v = answers[META.participantes];
  return typeof v === "string" ? v.trim() : "";
}

/** Nombre escrito para el encargado de la actividad (vacío si la plantilla no tiene ese rol o no se escribió). */
export function nombreEncargado(answers: Record<string, unknown>, template: FormTemplateSchema): string {
  const rol = rolEncargado(template);
  const roles = (answers[META.roles] as Record<string, string> | undefined) ?? {};
  return rol ? (roles[rol] ?? "").trim() : "";
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

/** Reglas de envío: obligatorios, ML con observación, NR con motivo (foto opcional), nombre y firma del encargado de la actividad. */
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

  if (rolEncargado(template) && !nombreEncargado(draft.answers, template)) {
    issues.push({ section: null, area: "closing", message: "Falta el nombre del encargado de la actividad" });
  }
  const firma = draft.answers[META.firmaEncargado] as FirmaEncargado | undefined;
  if (!firma?.firmaId) issues.push({ section: null, area: "closing", message: "Falta la firma del encargado de la actividad" });
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
  const participantes = nombresParticipantes(draft.answers);
  if (participantes) answers.push({ item_key: META.participantes, value: participantes });
  const firma = draft.answers[META.firmaEncargado] as FirmaEncargado | undefined;
  if (firma?.firmaId) {
    answers.push({ item_key: META.firmaEncargado, value: { nombres: nombreEncargado(draft.answers, template), firmaId: firma.firmaId } });
    used.set(firma.firmaId, "participant_signature");
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
