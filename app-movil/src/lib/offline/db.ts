// Tipos de src/lib/offline/db.ts de la web (2026-11-07), sin Dexie. Ver app-movil/DISENO.md.
// Diferencia: la foto no se guarda como Blob sino como archivo en el teléfono (`uri`).

/** Foto comprimida guardada en un archivo local hasta que se sube al Storage. */
export interface PhotoRecord {
  id: string; // UUID generado en el cliente
  inspectionId: string;
  /** Archivo local (directorio de documentos de la app). */
  uri: string;
  mime: string;
  sizeBytes: number;
  /** Ruta final en el bucket: {technician_uid}/{inspection_id}/{photo_id}.jpg */
  storagePath: string;
  uploaded: boolean;
}

/** Contenido que recibe la RPC submit_inspection. */
export interface SubmitPayload {
  inspection: {
    id: string;
    area_id: string;
    equipment_type_id: string;
    work_mode_id: string;
    template_id: string;
    equipment_tag: string;
    started_at: string;
    /** Nombre de quien realizó la inspección (la cuenta de técnico puede ser compartida). */
    performed_by: string;
  };
  answers: { item_key: string; value: unknown }[];
  findings: {
    id: string;
    item_key: string;
    severity: "baja" | "media" | "alta" | "critica";
    description: string;
    photo_attachment_id?: string | null;
  }[];
  attachments: {
    id: string;
    storage_path: string;
    kind: "photo" | "finding_photo" | "participant_signature";
    mime: string;
    size_bytes: number;
  }[];
}

/** Borrador editable por el técnico (se guarda en cada cambio, sin red). */
export interface DraftRecord {
  id: string; // = inspections.id
  technicianId: string;
  areaId: string;
  equipmentTypeId: string;
  workModeId: string;
  templateId: string;
  header: Record<string, string>;
  answers: Record<string, unknown>;
  findings: SubmitPayload["findings"];
  photoIds: string[];
  startedAt: string;
  updatedAt: number;
  /** draft = editable; queued = en la cola; sent = confirmado por el servidor */
  state: "draft" | "queued" | "sent";
  folio?: string;
  /** Si este borrador corrige una inspección rechazada: su id, folio y el motivo del rechazo. */
  correccion?: { de: string; folio: string; motivo: string };
}

export type OutboxStatus = "pending" | "sending" | "failed";

export interface OutboxRecord {
  id: string; // = inspections.id: una sola entrada por inspección
  payload: SubmitPayload;
  photoIds: string[];
  status: OutboxStatus;
  attempts: number;
  nextAttemptAt: number;
  lastError?: string;
  createdAt: number;
}

/** Copia local del catálogo, de las plantillas publicadas y de la lista de enviadas, para trabajar sin red. */
export interface CatalogRecord {
  key: string; // "catalog" | "enviadas:{userId}"
  value: unknown;
  updatedAt: number;
}
