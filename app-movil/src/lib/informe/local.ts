import type { DraftRecord, PhotoRecord } from "@/lib/offline/db";
import type { DetalleInspeccion } from "@/lib/revision/queries";
import type { FormTemplateSchema } from "@/lib/templates/schema";
import { buildSubmission, getEjecutor } from "@/lib/tecnico/draft";

/** Prefijo de las «URL» de imágenes locales: `local:{id de la foto}`; el generador las reemplaza por datos `data:`. */
export const PREFIJO_LOCAL = "local:";

export interface EntradaDetalleLocal {
  draft: DraftRecord;
  template: FormTemplateSchema;
  /** Fotos y firma guardadas en el teléfono para esta inspección. */
  fotos: PhotoRecord[];
  area: string;
  equipo: string;
  modo: string;
  /** Cuenta con la que se trabaja («Técnico · Turno B»). */
  tecnico: string;
  turno: "A" | "B" | null;
}

/**
 * Arma el mismo `DetalleInspeccion` que la web lee de la base, pero con los datos del teléfono (borrador, plantilla y fotos),
 * para generar el informe sin conexión. Usa `buildSubmission`, o sea exactamente lo que se envía al servidor. Aún no hay firmas
 * de revisión ni seguimiento de hallazgos: eso lo agrega el servidor después.
 */
export function detalleLocal(e: EntradaDetalleLocal): DetalleInspeccion {
  const { draft, template } = e;
  const { payload } = buildSubmission(draft, template, e.fotos);
  const respuestas: Record<string, unknown> = {};
  for (const a of payload.answers) respuestas[a.item_key] = a.value;

  return {
    id: draft.id,
    folio: draft.folio ?? null,
    status: draft.state === "draft" ? "draft" : "submitted",
    equipmentTag: payload.inspection.equipment_tag,
    area: e.area,
    equipo: e.equipo,
    modo: e.modo,
    tecnico: e.tecnico,
    realizadoPor: getEjecutor(draft.answers).trim(),
    turno: e.turno,
    templateVersion: 0,
    startedAt: draft.startedAt,
    submittedAt: null,
    reviewComment: null,
    plantilla: template,
    respuestas,
    hallazgos: payload.findings.map((f) => ({
      id: f.id,
      itemKey: f.item_key,
      severity: f.severity,
      description: f.description,
      photoAttachmentId: f.photo_attachment_id ?? null,
      seguimiento: null,
    })),
    adjuntos: payload.attachments.map((a) => ({ id: a.id, kind: a.kind, url: `${PREFIJO_LOCAL}${a.id}` })),
    firmas: [],
  };
}

/** Texto del estado y del aviso del informe local según en qué punto está la inspección en el teléfono. */
export function rotulosLocal(draft: Pick<DraftRecord, "state" | "folio">): { estado: string; aviso: string } {
  if (draft.state === "draft") {
    return {
      estado: "Borrador sin enviar",
      aviso: "Copia generada en el teléfono: la inspección todavía no se ha enviado. No tiene folio ni firmas de revisión.",
    };
  }
  if (draft.state === "queued") {
    return {
      estado: "Pendiente de envío",
      aviso: "Copia generada en el teléfono: la inspección se enviará cuando haya señal. No tiene folio ni firmas de revisión.",
    };
  }
  return {
    estado: "Enviada",
    aviso: "Copia generada en el teléfono. No incluye las firmas de supervisión ni de programación; el informe oficial se obtiene del servidor.",
  };
}
