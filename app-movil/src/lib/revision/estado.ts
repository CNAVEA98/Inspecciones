// Copia de src/lib/revision/estado.ts de la web (2026-11-07; ampliada el 2026-11-09 con la revisión). Ver app-movil/DISENO.md.
export type InspectionStatus = "draft" | "submitted" | "supervisor_signed" | "approved" | "rejected";

/** Estado tal como se rotula en el informe PDF. */
export const STATUS_LABEL_INFORME: Record<InspectionStatus, string> = {
  draft: "Borrador",
  submitted: "Enviada",
  supervisor_signed: "Firmada por supervisor",
  approved: "Aprobada",
  rejected: "Rechazada",
};

export const STATUS_LABEL: Record<InspectionStatus, string> = {
  draft: "Borrador",
  submitted: "Enviada · por firmar supervisor",
  supervisor_signed: "Firmada por supervisor · por firmar programador",
  approved: "Aprobada",
  rejected: "Rechazada",
};

/** Texto corto para las tarjetas de la bandeja. */
export const STATUS_SHORT: Record<InspectionStatus, string> = {
  draft: "Borrador",
  submitted: "Por firmar (supervisor)",
  supervisor_signed: "Por firmar (programador)",
  approved: "Aprobada",
  rejected: "Rechazada",
};

export type RolRevisor = "supervisor" | "planner" | "admin";

/** Etapa de firma que corresponde a cada rol, o null si no firma (administrador, técnico). */
export type EtapaFirma = "supervisor" | "planner";

/** ¿Le toca firmar a este rol? El supervisor firma «Enviada»; el programador, «Firmada por supervisor». */
export function etapaPendiente(status: InspectionStatus, rol: RolRevisor): EtapaFirma | null {
  if (rol === "supervisor" && status === "submitted") return "supervisor";
  if (rol === "planner" && status === "supervisor_signed") return "planner";
  return null;
}

export type Filtro = "pendientes" | "todas" | "aprobadas" | "rechazadas";

export const FILTROS: { value: Filtro; label: string }[] = [
  { value: "pendientes", label: "Por firmar" },
  { value: "todas", label: "Todas" },
  { value: "aprobadas", label: "Aprobadas" },
  { value: "rechazadas", label: "Rechazadas" },
];

/** Estados que muestra cada filtro según quién mira (el supervisor firma «submitted», el programador «supervisor_signed»). */
export function estadosDelFiltro(filtro: Filtro, rol: RolRevisor): InspectionStatus[] {
  switch (filtro) {
    case "pendientes":
      if (rol === "admin") return ["submitted", "supervisor_signed"];
      return [rol === "supervisor" ? "submitted" : "supervisor_signed"];
    case "aprobadas":
      return ["approved"];
    case "rechazadas":
      return ["rejected"];
    case "todas":
      return ["submitted", "supervisor_signed", "approved", "rejected"];
  }
}
