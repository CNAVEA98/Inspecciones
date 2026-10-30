export type InspectionStatus = "draft" | "submitted" | "supervisor_signed" | "approved" | "rejected";

export const STATUS_LABEL: Record<InspectionStatus, string> = {
  draft: "Borrador",
  submitted: "Enviada · por firmar supervisor",
  supervisor_signed: "Firmada por supervisor · por firmar planificador",
  approved: "Aprobada",
  rejected: "Rechazada",
};

/** Texto corto para la columna de estado de la bandeja. */
export const STATUS_SHORT: Record<InspectionStatus, string> = {
  draft: "Borrador",
  submitted: "Por firmar (supervisor)",
  supervisor_signed: "Por firmar (planificador)",
  approved: "Aprobada",
  rejected: "Rechazada",
};

/** Etapa de firma que corresponde a cada rol, o null si no firma (administrador, técnico). */
export type EtapaFirma = "supervisor" | "planner";

/** ¿Le toca firmar a este rol? El supervisor firma «Enviada»; el planificador, «Firmada por supervisor». */
export function etapaPendiente(status: InspectionStatus, rol: "supervisor" | "planner" | "admin"): EtapaFirma | null {
  if (rol === "supervisor" && status === "submitted") return "supervisor";
  if (rol === "planner" && status === "supervisor_signed") return "planner";
  return null;
}

/** Texto del chip de estado en el encabezado del PDF. */
export const STATUS_LABEL_INFORME: Record<InspectionStatus, string> = {
  draft: "Borrador",
  submitted: "Enviada",
  supervisor_signed: "Firmada por supervisor",
  approved: "Aprobada",
  rejected: "Rechazada",
};

export type Filtro = "pendientes" | "todas" | "aprobadas" | "rechazadas";

export const FILTROS: { value: Filtro; label: string }[] = [
  { value: "pendientes", label: "Por firmar" },
  { value: "todas", label: "Todas" },
  { value: "aprobadas", label: "Aprobadas" },
  { value: "rechazadas", label: "Rechazadas" },
];

/** Estados que muestra cada filtro según quién mira (el supervisor firma «submitted», el planificador «supervisor_signed»). */
export function estadosDelFiltro(filtro: Filtro, rol: "supervisor" | "planner" | "admin"): InspectionStatus[] {
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

export function parseFiltro(valor: string | string[] | undefined): Filtro {
  const v = Array.isArray(valor) ? valor[0] : valor;
  return FILTROS.some((f) => f.value === v) ? (v as Filtro) : "pendientes";
}
