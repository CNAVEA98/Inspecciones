// Copia parcial de src/lib/revision/estado.ts de la web (2026-11-07). Ver app-movil/DISENO.md.
export type InspectionStatus = "draft" | "submitted" | "supervisor_signed" | "approved" | "rejected";

/** Estado tal como se rotula en el informe PDF. */
export const STATUS_LABEL_INFORME: Record<InspectionStatus, string> = {
  draft: "Borrador",
  submitted: "Enviada",
  supervisor_signed: "Firmada por supervisor",
  approved: "Aprobada",
  rejected: "Rechazada",
};
