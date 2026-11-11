import { fechaIso, sumarDias } from "@/lib/fecha";
import { ZONAS, parseZona, tipoDeModo, zonaDeArea, type Zona } from "./carpetas";
import { etapaPendiente, type InspectionStatus } from "./estado";
import { ORDEN_SEVERIDAD, type EstadoGestion, type Severidad } from "./fallas";

/**
 * Indicadores de la pantalla de inicio de supervisor, programador y administrador. Aquí solo hay cálculo (sin base de
 * datos): recibe filas livianas y devuelve los números que se muestran, para poder probarlo.
 */
export type RolPanel = "supervisor" | "planner" | "admin";

/** Inspección enviada, con lo mínimo para contar. */
export interface FilaPanel {
  id: string;
  folio: string | null;
  status: InspectionStatus;
  equipmentTag: string;
  area: string;
  equipo: string;
  modo: string;
  turno: "A" | "B" | null;
  submittedAt: string | null;
  /** Fecha de la última firma (aprobación o rechazo). */
  reviewedAt: string | null;
}

/** Hallazgo («Malo») de una inspección vigente. */
export interface HallazgoPanel {
  severidad: Severidad;
  tag: string;
  area: string;
  equipo: string;
  gestion: EstadoGestion;
  /** Turno de la cuenta que envió la inspección del hallazgo. */
  turno?: "A" | "B" | null;
}

export interface DiaSerie {
  /** yyyy-mm-dd (Chile). */
  dia: string;
  inspecciones: number;
  mantenciones: number;
}

export interface PendienteAntiguo {
  id: string;
  folio: string | null;
  equipmentTag: string;
  equipo: string;
  area: string;
  turno: "A" | "B" | null;
  submittedAt: string | null;
  /** Días completos desde el envío. */
  dias: number;
}

export interface CeldaTurnoZona {
  turno: "A" | "B" | "-";
  zona: Zona;
  porFirmar: number;
}

export interface EquipoPendiente {
  tag: string;
  equipo: string;
  area: string;
  hallazgos: number;
  severidadMax: Severidad;
}

/** Documentos recibidos en el período, agrupados (por área o por tipo de equipo). */
export interface GrupoRecibidas {
  nombre: string;
  inspecciones: number;
  mantenciones: number;
  total: number;
}

export interface Panel {
  /** Lo que le toca firmar a quien mira (el administrador ve las dos etapas). */
  porFirmar: number;
  /** De esas, las que llevan más de `DIAS_ATRASO` días esperando. */
  atrasadas: number;
  /** En revisión, pero en la etapa de otro rol. */
  enOtraEtapa: number;
  enSupervisor: number;
  enProgramador: number;
  recibidas7: number;
  recibidas7Previas: number;
  /** De lo recibido en el período de la serie. */
  aprobadas: number;
  rechazadas: number;
  /** De lo recibido en el período, lo que sigue esperando cada firma. */
  esperanSupervisor: number;
  esperanProgramador: number;
  recibidas: number;
  inspecciones: number;
  mantenciones: number;
  /** Horas promedio entre el envío y la aprobación final; null si no hubo aprobadas en el período. */
  horasHastaAprobar: number | null;
  serie: DiaSerie[];
  /** Total recibido en cada uno de los últimos 14 días (para comparar la semana con la anterior), sea cual sea el período. */
  ultimos14: number[];
  /** Recibidas en el período por área, de más a menos. */
  porArea: GrupoRecibidas[];
  /** Los tipos de equipo con más documentos en el período. */
  porEquipo: GrupoRecibidas[];
  turnoZona: CeldaTurnoZona[];
  antiguas: PendienteAntiguo[];
  hallazgosPendientes: number;
  hallazgosGestionados: number;
  pendientesPorSeveridad: Record<Severidad, number>;
  equiposPendientes: EquipoPendiente[];
}

/** Días de la serie «recibidas por día» cuando no se elige otro período. */
export const DIAS_SERIE = 30;
/** Períodos que se pueden elegir en la pantalla. */
export const PERIODOS = [7, 30, 90] as const;
export type Periodo = (typeof PERIODOS)[number];
/** «Recibidas · 7 días» compara con los 7 previos: siempre se leen al menos 14 días. */
export const DIAS_COMPARACION = 14;

/** Lo que se elige arriba del panel; viaja en la URL. */
export interface FiltroPanel {
  dias: Periodo;
  turno: "" | "A" | "B";
  zona: "" | Zona;
}

export const FILTRO_PANEL_INICIAL: FiltroPanel = { dias: DIAS_SERIE, turno: "", zona: "" };

export function parseFiltroPanel(sp: Record<string, string | string[] | undefined>): FiltroPanel {
  const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const dias = Number(uno(sp.dias));
  const turno = uno(sp.turno);
  return {
    dias: (PERIODOS as readonly number[]).includes(dias) ? (dias as Periodo) : DIAS_SERIE,
    turno: turno === "A" || turno === "B" ? turno : "",
    zona: parseZona(uno(sp.zona)),
  };
}

/** Query string del filtro, sin los valores por defecto («» si no hay ninguno). */
export function queryFiltroPanel(f: FiltroPanel): string {
  const p = new URLSearchParams();
  if (f.dias !== DIAS_SERIE) p.set("dias", String(f.dias));
  if (f.turno) p.set("turno", f.turno);
  if (f.zona) p.set("zona", f.zona);
  return p.toString();
}

/** Deja solo lo del turno y la zona elegidos (inspecciones u hallazgos). */
export function filtrarPorTurnoZona<T extends { area: string; turno?: "A" | "B" | null }>(filas: T[], f: Pick<FiltroPanel, "turno" | "zona">): T[] {
  if (!f.turno && !f.zona) return filas;
  return filas.filter((x) => (!f.turno || x.turno === f.turno) && (!f.zona || zonaDeArea(x.area) === f.zona));
}
/** Una inspección por firmar hace más de estos días se marca como atrasada. */
export const DIAS_ATRASO = 3;

const MS_DIA = 86_400_000;
const leToca = (status: InspectionStatus, rol: RolPanel) =>
  rol === "admin" ? status === "submitted" || status === "supervisor_signed" : etapaPendiente(status, rol) !== null;

/**
 * @param abiertas inspecciones «por firmar supervisor» o «por firmar programador», de cualquier fecha.
 * @param recientes inspecciones enviadas en el período (y al menos en los últimos 14 días), en cualquier estado.
 * @param hallazgos hallazgos de inspecciones vigentes.
 * @param dias largo del período (7, 30 o 90 días, contando hoy).
 */
export function calcularPanel({
  abiertas,
  recientes,
  hallazgos,
  rol,
  ahora,
  dias = DIAS_SERIE,
}: {
  abiertas: FilaPanel[];
  recientes: FilaPanel[];
  hallazgos: HallazgoPanel[];
  rol: RolPanel;
  ahora: Date;
  dias?: number;
}): Panel {
  const hoy = fechaIso(ahora);
  const mias = abiertas.filter((f) => leToca(f.status, rol));
  const esperaMs = (f: FilaPanel) => (f.submittedAt ? ahora.getTime() - Date.parse(f.submittedAt) : 0);

  const antiguas = [...mias]
    .sort((a, b) => esperaMs(b) - esperaMs(a))
    .slice(0, 6)
    .map((f) => ({
      id: f.id,
      folio: f.folio,
      equipmentTag: f.equipmentTag,
      equipo: f.equipo,
      area: f.area,
      turno: f.turno,
      submittedAt: f.submittedAt,
      dias: Math.floor(esperaMs(f) / MS_DIA),
    }));

  const turnoZona: CeldaTurnoZona[] = [];
  for (const turno of ["A", "B", "-"] as const) {
    for (const z of ZONAS) {
      const n = mias.filter((f) => (f.turno ?? "-") === turno && zonaDeArea(f.area) === z.id).length;
      // «Sin turno» y «Otras áreas» solo aparecen si tienen algo.
      if (n > 0 || (turno !== "-" && z.id !== "otras")) turnoZona.push({ turno, zona: z.id, porFirmar: n });
    }
  }

  // Serie diaria: todos los días del período, también los que no tuvieron envíos.
  const porDia = new Map<string, DiaSerie>();
  for (let i = dias - 1; i >= 0; i--) {
    const dia = sumarDias(hoy, -i);
    porDia.set(dia, { dia, inspecciones: 0, mantenciones: 0 });
  }
  const desde7 = sumarDias(hoy, -6);
  const desde14 = sumarDias(hoy, -(DIAS_COMPARACION - 1));
  const dias14 = new Map<string, number>();
  for (let i = DIAS_COMPARACION - 1; i >= 0; i--) dias14.set(sumarDias(hoy, -i), 0);
  let recibidas7 = 0;
  let recibidas7Previas = 0;
  let aprobadas = 0;
  let rechazadas = 0;
  let esperanSupervisor = 0;
  let esperanProgramador = 0;
  let recibidas = 0;
  let inspecciones = 0;
  let mantenciones = 0;
  let sumaHoras = 0;
  let conHoras = 0;
  const areas = new Map<string, GrupoRecibidas>();
  const equipos = new Map<string, GrupoRecibidas>();
  const sumar = (m: Map<string, GrupoRecibidas>, nombre: string, esMantencion: boolean) => {
    const g = m.get(nombre) ?? { nombre, inspecciones: 0, mantenciones: 0, total: 0 };
    if (esMantencion) g.mantenciones++;
    else g.inspecciones++;
    g.total++;
    m.set(nombre, g);
  };
  const ordenar = (m: Map<string, GrupoRecibidas>) =>
    [...m.values()].sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre, "es"));
  for (const f of recientes) {
    if (!f.submittedAt) continue;
    const dia = fechaIso(f.submittedAt);
    // La comparación de semanas no depende del período elegido.
    if (dias14.has(dia)) dias14.set(dia, (dias14.get(dia) ?? 0) + 1);
    if (dia >= desde7 && dia <= hoy) recibidas7++;
    else if (dia >= desde14 && dia < desde7) recibidas7Previas++;
    const punto = porDia.get(dia);
    if (!punto) continue;
    const esMantencion = tipoDeModo(f.modo) === "mantencion";
    if (esMantencion) punto.mantenciones++;
    else punto.inspecciones++;
    recibidas++;
    sumar(areas, f.area, esMantencion);
    sumar(equipos, f.equipo, esMantencion);
    if (esMantencion) mantenciones++;
    else inspecciones++;
    if (f.status === "rejected") rechazadas++;
    if (f.status === "submitted") esperanSupervisor++;
    if (f.status === "supervisor_signed") esperanProgramador++;
    if (f.status === "approved") {
      aprobadas++;
      if (f.reviewedAt) {
        sumaHoras += (Date.parse(f.reviewedAt) - Date.parse(f.submittedAt)) / 3_600_000;
        conHoras++;
      }
    }
  }

  const pendientes = hallazgos.filter((h) => h.gestion === "pendiente");
  const pendientesPorSeveridad: Record<Severidad, number> = { critica: 0, alta: 0, media: 0, baja: 0 };
  const porEquipo = new Map<string, EquipoPendiente>();
  for (const h of pendientes) {
    pendientesPorSeveridad[h.severidad]++;
    const clave = `${h.tag}\u0000${h.area}`;
    const e = porEquipo.get(clave);
    if (!e) porEquipo.set(clave, { tag: h.tag, equipo: h.equipo, area: h.area, hallazgos: 1, severidadMax: h.severidad });
    else {
      e.hallazgos++;
      if (ORDEN_SEVERIDAD[h.severidad] > ORDEN_SEVERIDAD[e.severidadMax]) e.severidadMax = h.severidad;
    }
  }
  const equiposPendientes = [...porEquipo.values()]
    .sort((a, b) => ORDEN_SEVERIDAD[b.severidadMax] - ORDEN_SEVERIDAD[a.severidadMax] || b.hallazgos - a.hallazgos || a.tag.localeCompare(b.tag, "es"))
    .slice(0, 6);

  const enSupervisor = abiertas.filter((f) => f.status === "submitted").length;
  const enProgramador = abiertas.filter((f) => f.status === "supervisor_signed").length;
  return {
    porFirmar: mias.length,
    atrasadas: mias.filter((f) => esperaMs(f) > DIAS_ATRASO * MS_DIA).length,
    enOtraEtapa: abiertas.length - mias.length,
    enSupervisor,
    enProgramador,
    recibidas7,
    recibidas7Previas,
    aprobadas,
    rechazadas,
    esperanSupervisor,
    esperanProgramador,
    recibidas,
    inspecciones,
    mantenciones,
    horasHastaAprobar: conHoras > 0 ? sumaHoras / conHoras : null,
    serie: [...porDia.values()],
    ultimos14: [...dias14.values()],
    porArea: ordenar(areas),
    porEquipo: ordenar(equipos).slice(0, 6),
    turnoZona,
    antiguas,
    hallazgosPendientes: pendientes.length,
    hallazgosGestionados: hallazgos.length - pendientes.length,
    pendientesPorSeveridad,
    equiposPendientes,
  };
}

/** «5 h», «1,5 días»: duración legible para el tiempo medio de aprobación. */
export function textoDuracion(horas: number): string {
  if (horas < 1) return `${Math.max(1, Math.round(horas * 60))} min`;
  if (horas < 48) return `${Math.round(horas)} h`;
  return `${(horas / 24).toLocaleString("es-CL", { maximumFractionDigits: 1 })} días`;
}

/** Tope «redondo» del eje del gráfico (5, 10, 20, 50, 100…), para que las marcas sean números enteros. */
export function topeEje(maximo: number): number {
  if (maximo <= 4) return 4;
  const base = 10 ** Math.floor(Math.log10(maximo));
  for (const m of [1, 2, 4, 5, 10]) if (maximo <= m * base) return m * base;
  return 10 * base;
}
