import { tipoDeModo, nombreZona, zonaDeArea } from "@/lib/revision/carpetas";
import { STATUS_SHORT, type InspectionStatus } from "@/lib/revision/estado";
import { ALCANCE_NOMBRE, GESTION_NOMBRE, SEVERIDAD_NOMBRE, estadoGestion, type HallazgoFalla } from "@/lib/revision/fallas";
import type { Celda, Hoja } from "./xlsx";

/** Firma de una etapa de la revisión. */
export interface FirmaExportada {
  fecha: string;
  firmante: string;
  decision: "approved" | "rejected";
}

/** Una inspección o mantención tal como sale en la hoja «Inspecciones». */
export interface InspeccionExportada {
  id: string;
  folio: string | null;
  status: InspectionStatus;
  equipmentTag: string;
  area: string;
  equipo: string;
  modo: string;
  /** «INSP-12» y su título, si el formato sigue en el catálogo. */
  formatoId: string;
  formatoTitulo: string;
  templateVersion: number | null;
  turno: "A" | "B" | null;
  realizadoPor: string;
  cuenta: string;
  ot: string;
  startedAt: string | null;
  submittedAt: string | null;
  firmaSupervisor: FirmaExportada | null;
  firmaProgramador: FirmaExportada | null;
  comentarioRechazo: string;
  hallazgos: number;
  hallazgosPendientes: number;
}

const fecha = (iso: string | null | undefined): Celda => (iso ? new Date(iso) : null);
const tipo = (modo: string) => (tipoDeModo(modo) === "mantencion" ? "Mantención" : "Inspección");
const turno = (t: "A" | "B" | null) => (t ? `Turno ${t}` : "Sin turno");
const decision = (f: FirmaExportada | null) => (!f ? "" : f.decision === "approved" ? "Aprobó" : "Rechazó");

/** Hoja «Inspecciones»: una fila por inspección o mantención. */
export function hojaInspecciones(filas: InspeccionExportada[]): Hoja {
  return {
    nombre: "Inspecciones",
    columnas: [
      { titulo: "Folio", ancho: 18 },
      { titulo: "Tipo de trabajo", ancho: 15 },
      { titulo: "Formato", ancho: 10 },
      { titulo: "Título del formato", ancho: 44 },
      { titulo: "Estado", ancho: 26 },
      { titulo: "TAG", ancho: 20 },
      { titulo: "Tipo de equipo", ancho: 34 },
      { titulo: "Área", ancho: 12 },
      { titulo: "Zona", ancho: 14 },
      { titulo: "Turno", ancho: 10 },
      { titulo: "Realizada por", ancho: 26 },
      { titulo: "Cuenta de envío", ancho: 18 },
      { titulo: "N.º OT", ancho: 14 },
      { titulo: "Inicio", ancho: 17 },
      { titulo: "Envío", ancho: 17 },
      { titulo: "Firma supervisor", ancho: 17 },
      { titulo: "Supervisor", ancho: 20 },
      { titulo: "Decisión supervisor", ancho: 18 },
      { titulo: "Firma programador", ancho: 17 },
      { titulo: "Programador", ancho: 20 },
      { titulo: "Decisión programador", ancho: 19 },
      { titulo: "Comentario de rechazo", ancho: 40 },
      { titulo: "Hallazgos", ancho: 11 },
      { titulo: "Hallazgos pendientes", ancho: 19 },
      { titulo: "Versión del formato", ancho: 17 },
    ],
    filas: filas.map((f) => [
      f.folio ?? "",
      tipo(f.modo),
      f.formatoId,
      f.formatoTitulo,
      STATUS_SHORT[f.status],
      f.equipmentTag,
      f.equipo,
      f.area,
      nombreZona(zonaDeArea(f.area)),
      turno(f.turno),
      f.realizadoPor,
      f.cuenta,
      f.ot,
      fecha(f.startedAt),
      fecha(f.submittedAt),
      fecha(f.firmaSupervisor?.fecha),
      f.firmaSupervisor?.firmante ?? "",
      decision(f.firmaSupervisor),
      fecha(f.firmaProgramador?.fecha),
      f.firmaProgramador?.firmante ?? "",
      decision(f.firmaProgramador),
      f.comentarioRechazo,
      f.hallazgos,
      f.hallazgosPendientes,
      f.templateVersion,
    ]),
  };
}

/** Hoja «Hallazgos»: una fila por cada ítem en «Malo» de las inspecciones exportadas. */
export function hojaHallazgos(hallazgos: HallazgoFalla[]): Hoja {
  return {
    nombre: "Hallazgos",
    columnas: [
      { titulo: "Folio", ancho: 18 },
      { titulo: "Tipo de trabajo", ancho: 15 },
      { titulo: "TAG", ancho: 20 },
      { titulo: "Tipo de equipo", ancho: 34 },
      { titulo: "Área", ancho: 12 },
      { titulo: "Turno", ancho: 10 },
      { titulo: "Envío", ancho: 17 },
      { titulo: "Severidad", ancho: 11 },
      { titulo: "Ítem", ancho: 50 },
      { titulo: "Observación", ancho: 50 },
      { titulo: "Gestión", ancho: 22 },
      { titulo: "Alcance", ancho: 38 },
      { titulo: "N.º aviso SAP", ancho: 15 },
      { titulo: "Canalización con MLP", ancho: 34 },
      { titulo: "N.º OT", ancho: 14 },
      { titulo: "Realizada por", ancho: 26 },
      { titulo: "Estado de la inspección", ancho: 26 },
    ],
    filas: hallazgos.map((h) => [
      h.folio ?? "",
      tipo(h.modo),
      h.tag,
      h.equipo,
      h.area,
      turno(h.turno),
      fecha(h.enviadaEn),
      SEVERIDAD_NOMBRE[h.severidad],
      h.itemTexto,
      h.observacion,
      GESTION_NOMBRE[estadoGestion(h.seguimiento)],
      h.seguimiento ? ALCANCE_NOMBRE[h.seguimiento.scope] : "",
      h.seguimiento?.sapNotice ?? "",
      h.seguimiento?.channelNote ?? "",
      h.ot,
      h.realizadoPor,
      STATUS_SHORT[h.status],
    ]),
  };
}

/** Hoja «Criterios»: con qué filtros y cuándo se generó el archivo, para que se pueda rastrear. */
export function hojaCriterios(criterios: [string, Celda][]): Hoja {
  return { nombre: "Criterios", columnas: [{ titulo: "Criterio", ancho: 26 }, { titulo: "Valor", ancho: 44 }], filas: criterios };
}

/** Hallazgos en el mismo orden que la hoja de inspecciones y, dentro de cada una, de mayor a menor severidad. */
export function ordenarHallazgos(hallazgos: HallazgoFalla[], inspecciones: InspeccionExportada[]): HallazgoFalla[] {
  const posicion = new Map(inspecciones.map((f, i) => [f.id, i]));
  const peso = { critica: 0, alta: 1, media: 2, baja: 3 } as const;
  return [...hallazgos].sort(
    (a, b) =>
      (posicion.get(a.inspeccionId) ?? 0) - (posicion.get(b.inspeccionId) ?? 0) ||
      peso[a.severidad] - peso[b.severidad] ||
      a.itemTexto.localeCompare(b.itemTexto, "es"),
  );
}
