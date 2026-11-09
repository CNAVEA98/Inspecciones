// Solo los tipos de src/lib/revision/queries.ts de la web (2026-11-07): la consulta a la base no se copia, en la app el detalle se arma
// con los datos locales (ver `lib/informe/local.ts`). Ver app-movil/DISENO.md.
import type { FormTemplateSchema } from "@/lib/templates/schema";
import type { InspectionStatus } from "./estado";
import type { Seguimiento } from "./fallas";

/** Fila de la bandeja del supervisor, programador y administrador. */
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
  /** Seguimiento que registra la Supervisión; null = pendiente. */
  seguimiento: Seguimiento | null;
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
