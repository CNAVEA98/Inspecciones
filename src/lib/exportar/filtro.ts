import { sumarDias } from "@/lib/fecha";
import { SIN_TURNO, parseTipo, parseZona, type Tipo, type Zona } from "@/lib/revision/carpetas";
import type { InspectionStatus } from "@/lib/revision/estado";

/** Filtros de la pestaña «Exportar»; viajan en la URL (la misma consulta sirve para la vista previa y la descarga). */
export interface FiltroExportar {
  /** Inspecciones o mantenciones. */
  tipo: "" | Tipo;
  turno: "" | "A" | "B" | typeof SIN_TURNO;
  /** Área: código del catálogo («chacay») o una zona con el prefijo «zona:» («zona:chacay-mina»). */
  area: string;
  /** Código del tipo de equipo («transformador_piso»). */
  equipo: string;
  /** Texto contenido en el TAG («740-XF» encuentra «740-XF-001»). */
  tag: string;
  estado: EstadoExportar;
  /** Fechas de envío (yyyy-mm-dd, Chile), ambas inclusive. Siempre hay rango. */
  desde: string;
  hasta: string;
}

export type EstadoExportar = "todas" | "en_revision" | "aprobadas" | "rechazadas";

export const ESTADOS_EXPORTAR: { value: EstadoExportar; label: string; estados: InspectionStatus[] }[] = [
  { value: "todas", label: "Todas", estados: ["submitted", "supervisor_signed", "approved", "rejected"] },
  { value: "en_revision", label: "En revisión (por firmar)", estados: ["submitted", "supervisor_signed"] },
  { value: "aprobadas", label: "Aprobadas", estados: ["approved"] },
  { value: "rechazadas", label: "Rechazadas", estados: ["rejected"] },
];

export const estadosDe = (e: EstadoExportar) => ESTADOS_EXPORTAR.find((x) => x.value === e)?.estados ?? [];

/** Rango que se ofrece al entrar: los últimos 30 días. */
export const DIAS_POR_DEFECTO = 30;
/** Tope de inspecciones por archivo; si la consulta trae más, se pide acotar las fechas o los filtros. */
export const MAX_FILAS_EXPORTAR = 5000;

const PREFIJO_ZONA = "zona:";
export const valorZona = (z: Zona) => `${PREFIJO_ZONA}${z}`;
/** Zona elegida en el filtro de área, o "" si es un área suelta o ninguna. */
export const zonaDelFiltro = (area: string): "" | Zona => (area.startsWith(PREFIJO_ZONA) ? parseZona(area.slice(PREFIJO_ZONA.length)) : "");

type Params = Record<string, string | string[] | undefined>;
const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const esFecha = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
const esCodigo = (v: string) => /^[a-z0-9_-]{1,60}$/i.test(v);

export function filtroInicial(hoy: string): FiltroExportar {
  return { tipo: "", turno: "", area: "", equipo: "", tag: "", estado: "todas", desde: sumarDias(hoy, -(DIAS_POR_DEFECTO - 1)), hasta: hoy };
}

/** Lee el filtro de la URL; lo inválido vuelve a su valor inicial y un rango invertido se ordena. */
export function parseFiltroExportar(sp: Params, hoy: string): FiltroExportar {
  const ini = filtroInicial(hoy);
  const turno = uno(sp.turno);
  const area = uno(sp.area);
  const equipo = uno(sp.equipo);
  const estado = uno(sp.estado);
  let desde = esFecha(uno(sp.desde)) ? uno(sp.desde) : ini.desde;
  let hasta = esFecha(uno(sp.hasta)) ? uno(sp.hasta) : ini.hasta;
  if (desde > hasta) [desde, hasta] = [hasta, desde];
  return {
    tipo: parseTipo(uno(sp.tipo)),
    turno: turno === "A" || turno === "B" || turno === SIN_TURNO ? turno : "",
    area: zonaDelFiltro(area) || esCodigo(area) ? area : "",
    equipo: esCodigo(equipo) ? equipo : "",
    tag: uno(sp.tag).trim().slice(0, 60),
    estado: ESTADOS_EXPORTAR.some((e) => e.value === estado) ? (estado as EstadoExportar) : "todas",
    desde,
    hasta,
  };
}

/** Query string del filtro (las fechas van siempre: así el archivo descargado es el mismo que se vio en pantalla). */
export function queryExportar(f: FiltroExportar): string {
  const p = new URLSearchParams();
  for (const k of ["tipo", "turno", "area", "equipo", "tag"] as const) if (f[k]) p.set(k, f[k]);
  if (f.estado !== "todas") p.set("estado", f.estado);
  p.set("desde", f.desde);
  p.set("hasta", f.hasta);
  return p.toString();
}

/** Escapa los comodines de LIKE para que el TAG se busque literal (un «_» o «%» del usuario no es comodín). */
export const patronTag = (tag: string) => `%${tag.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

/** «Inspecciones_2026-10-12_a_2026-11-10.xlsx» (con el tipo y el turno si se filtró por ellos). */
export function nombreArchivo(f: FiltroExportar): string {
  const que = f.tipo === "mantencion" ? "Mantenciones" : f.tipo === "inspeccion" ? "Inspecciones" : "Inspecciones_y_mantenciones";
  const turno = f.turno === "A" || f.turno === "B" ? `_Turno_${f.turno}` : "";
  return `${que}${turno}_${f.desde}_a_${f.hasta}.xlsx`;
}

