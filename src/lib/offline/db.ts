import Dexie, { type EntityTable } from "dexie";

/** Foto comprimida guardada localmente hasta que se sube al Storage. */
export interface PhotoRecord {
  id: string; // UUID generado en el cliente
  inspectionId: string;
  blob: Blob;
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

/** Copia local del catálogo y de las plantillas publicadas, para trabajar sin red. */
export interface CatalogRecord {
  key: string; // "areas" | "equipment_types" | "work_modes" | "combinations" | "template:{id}"
  value: unknown;
  updatedAt: number;
}

export class MlpDB extends Dexie {
  drafts!: EntityTable<DraftRecord, "id">;
  outbox!: EntityTable<OutboxRecord, "id">;
  photos!: EntityTable<PhotoRecord, "id">;
  catalog!: EntityTable<CatalogRecord, "key">;

  constructor(name = "mlp-inspecciones") {
    super(name);
    this.version(1).stores({
      drafts: "id, technicianId, state, updatedAt",
      outbox: "id, status, nextAttemptAt, createdAt",
      photos: "id, inspectionId, uploaded",
      catalog: "key",
    });
  }
}

let shared: MlpDB | null = null;
/** Instancia única para la app (en tests se crean instancias propias). */
export function getDb(): MlpDB {
  return (shared ??= new MlpDB());
}
