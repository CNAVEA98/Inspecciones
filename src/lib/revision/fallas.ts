import { formatFechaHora } from "@/lib/fecha";
import type { InspectionStatus } from "./estado";

export type Severidad = "baja" | "media" | "alta" | "critica";
/** «bbosch»: lo repara Bbosch 23 kV (lleva aviso subsecuente). «terceros»: requiere apoyo de otra empresa (se canaliza con MLP). */
export type Alcance = "bbosch" | "terceros";
export type EstadoGestion = "pendiente" | "con_aviso" | "canalizado";

export const SEVERIDAD_NOMBRE: Record<Severidad, string> = { baja: "Baja", media: "Media", alta: "Alta", critica: "Crítica" };
export const ORDEN_SEVERIDAD: Record<Severidad, number> = { baja: 1, media: 2, alta: 3, critica: 4 };
export const SEVERIDADES_ORDENADAS: Severidad[] = ["critica", "alta", "media", "baja"];

export const ALCANCE_NOMBRE: Record<Alcance, string> = {
  bbosch: "Bbosch 23 kV (aviso subsecuente)",
  terceros: "Requiere apoyo de terceros (canalizar con MLP)",
};
export const GESTION_NOMBRE: Record<EstadoGestion, string> = {
  pendiente: "Pendiente",
  con_aviso: "Con aviso subsecuente",
  canalizado: "Canalizado con MLP",
};

/** Seguimiento que registra la Supervisión. Sin fila, el hallazgo es de Bbosch y está pendiente. */
export interface Seguimiento {
  scope: Alcance;
  sapNotice: string | null;
  channelNote: string | null;
}

/** Línea de trazabilidad para el informe; vacía mientras el hallazgo siga pendiente. */
export function textoTrazabilidad(s: Seguimiento | null | undefined): string {
  if (!s) return "";
  if (s.scope === "bbosch") return s.sapNotice ? `Aviso subsecuente N.º ${s.sapNotice}` : "";
  return `Requiere apoyo de terceros: canalizado con MLP${s.channelNote ? ` · ${s.channelNote}` : ""}`;
}

export const SEGUIMIENTO_INICIAL: Seguimiento = { scope: "bbosch", sapNotice: null, channelNote: null };

export function estadoGestion(s: Seguimiento | null | undefined): EstadoGestion {
  if (!s) return "pendiente";
  if (s.scope === "bbosch") return s.sapNotice ? "con_aviso" : "pendiente";
  return s.channelNote ? "canalizado" : "pendiente";
}

export interface HallazgoFalla {
  id: string;
  inspeccionId: string;
  folio: string | null;
  status: InspectionStatus;
  itemKey: string;
  itemTexto: string;
  severidad: Severidad;
  observacion: string;
  enviadaEn: string | null;
  tag: string;
  area: string;
  equipo: string;
  /** N.º de la orden de trabajo padre (el «N° OT» de la cabecera del formato). */
  ot: string;
  /** Quien realizó la inspección según el formulario. */
  realizadoPor: string;
  seguimiento: Seguimiento | null;
}

export interface EquipoConFallas {
  tag: string;
  area: string;
  equipo: string;
  severidadMax: Severidad;
  hallazgos: HallazgoFalla[];
}

const fechaMs = (h: HallazgoFalla) => (h.enviadaEn ? Date.parse(h.enviadaEn) : 0);

/** Equipos con fallas: primero los de mayor severidad, luego los de más hallazgos y los más recientes. */
export function agruparPorEquipo(hallazgos: HallazgoFalla[]): EquipoConFallas[] {
  const porTag = new Map<string, HallazgoFalla[]>();
  for (const h of hallazgos) {
    const clave = `${h.tag}\u0000${h.area}`;
    const lista = porTag.get(clave);
    if (lista) lista.push(h);
    else porTag.set(clave, [h]);
  }
  const equipos: EquipoConFallas[] = [...porTag.values()].map((lista) => {
    const ordenados = [...lista].sort(
      (a, b) => ORDEN_SEVERIDAD[b.severidad] - ORDEN_SEVERIDAD[a.severidad] || fechaMs(b) - fechaMs(a),
    );
    return {
      tag: ordenados[0].tag,
      area: ordenados[0].area,
      equipo: ordenados[0].equipo,
      severidadMax: ordenados[0].severidad,
      hallazgos: ordenados,
    };
  });
  return equipos.sort(
    (a, b) =>
      ORDEN_SEVERIDAD[b.severidadMax] - ORDEN_SEVERIDAD[a.severidadMax] ||
      b.hallazgos.length - a.hallazgos.length ||
      Math.max(...b.hallazgos.map(fechaMs)) - Math.max(...a.hallazgos.map(fechaMs)),
  );
}

export interface FiltroFallas {
  /** «abiertos» = pendientes; «todos» incluye los ya gestionados. */
  gestion: "abiertos" | "todos";
  severidad: Severidad | "";
  area: string;
}

export const FILTRO_FALLAS_INICIAL: FiltroFallas = { gestion: "abiertos", severidad: "", area: "" };

export function filtrarFallas(hallazgos: HallazgoFalla[], f: FiltroFallas): HallazgoFalla[] {
  return hallazgos.filter(
    (h) =>
      (f.gestion === "todos" || estadoGestion(h.seguimiento) === "pendiente") &&
      (!f.severidad || h.severidad === f.severidad) &&
      (!f.area || h.area === f.area),
  );
}

const esSeveridad = (v: unknown): v is Severidad => v === "baja" || v === "media" || v === "alta" || v === "critica";

export function parseFiltroFallas(sp: Record<string, string | string[] | undefined>): FiltroFallas {
  const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const sev = uno(sp.severidad);
  return {
    gestion: uno(sp.gestion) === "todos" ? "todos" : "abiertos",
    severidad: esSeveridad(sev) ? sev : "",
    area: uno(sp.area).slice(0, 60),
  };
}

/** Prioridad de SAP que se sugiere según la severidad; la define finalmente la Supervisión de Mantenimiento. */
export const PRIORIDAD_SUGERIDA: Record<Severidad, string> = {
  critica: "Urgente (ejecutar en 24 horas)",
  alta: "Programada en ejecución (dentro del programa actual)",
  media: "Próximos programas (semanas +1 a +12)",
  baja: "Próximos programas (semanas +1 a +12)",
};

/** Texto breve del aviso en SAP: 40 caracteres. */
export const LARGO_TEXTO_BREVE = 40;

export function textoBreve(itemTexto: string): string {
  const limpio = itemTexto.replace(/\s+/g, " ").trim();
  return limpio.length <= LARGO_TEXTO_BREVE ? limpio : `${limpio.slice(0, LARGO_TEXTO_BREVE - 1).trimEnd()}…`;
}

export function fichaSap(h: HallazgoFalla): string {
  const folio = h.folio ?? "sin folio";
  const fecha = h.enviadaEn ? formatFechaHora(h.enviadaEn) : "sin fecha";
  return [
    `AVISO SUBSECUENTE · hijo de la OT ${h.ot || "(completar N° OT)"}`,
    "",
    `Ubicación técnica / Equipo (TAG): ${h.tag || "(completar)"}`,
    `Texto breve (máx. ${LARGO_TEXTO_BREVE} caracteres): ${textoBreve(h.itemTexto)}`,
    "",
    "Circunstancias:",
    `- Descripción del problema: ${h.itemTexto}.${h.observacion ? ` ${h.observacion}` : ""} Detectado en la inspección ${folio} (${fecha}) por ${h.realizadoPor}. Severidad: ${SEVERIDAD_NOMBRE[h.severidad]}.`,
    "- Recursos para la reparación (especialidad, cantidad y duración): (completar)",
    "- Materiales y componentes (N° de stock / N° de parte / descripción): (completar)",
    "- Equipos y herramientas especiales: (completar)",
    "- Condición de la planta (detenida u operando): (completar)",
    "",
    `Prioridad sugerida: ${PRIORIDAD_SUGERIDA[h.severidad]} · la define la Supervisión de Mantenimiento`,
    "Fin deseado: (completar)",
    "Repercusión: (completar: 1 Producción, 2 Seguridad, 3 Salud, 4 Medio ambiente, 5 Legal, 6 Reputación)",
    "Riesgos de fatalidad: (completar)",
    `Autor del aviso (máx. 12 caracteres): ${h.realizadoPor.slice(0, 12)}`,
    "Datos de falla: parte objeto, síntoma y causa (completar)",
    `Anexo: PDF del informe de la inspección ${folio}`,
  ].join("\n");
}
