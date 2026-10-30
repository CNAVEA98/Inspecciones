import type { CodigoArea } from "./catalogo";

/**
 * Estado del TAG en el Maestro. «propuesto» y «reasignado» son provisionales (no existen en las bases del
 * cliente) y se guardan en el registro para que supervisión los revise. «sin_tag» = el técnico no encontró el equipo.
 */
export type EstadoTag = "oficial" | "por_validar" | "propuesto" | "reasignado";
export type EstadoRegistroTag = EstadoTag | "sin_tag";

export interface Equipo {
  /** TAG con guiones separadores (999-AA-999), normalizado por el script de export. */
  tag: string;
  /** El TAG tal como está en el Maestro, solo si la normalización lo cambió. */
  tagFuente: string | null;
  /** Datos de placa que venían entre paréntesis en el nombre (kVA, MVA, N.° de serie…). */
  datos: string | null;
  /** Aclaraciones de alcance que venían entre paréntesis («solo muestras de aceite»). */
  nota: string | null;
  nombre: string;
  instalacion: string;
  zona: string;
  tipoEquipo: string | null;
  descripcion: string | null;
  designador: string | null;
  area: CodigoArea;
  sector: string | null;
  estado: EstadoTag;
  /** TAG que tenía antes de reasignarlo (solo «reasignado»). */
  tagOriginal: string | null;
  /** Solo transformadores: «piso» o «aereo» cuando el Maestro lo dice; null si no alcanza. */
  tipoTrafo: "piso" | "aereo" | null;
}

export const esProvisional = (e: EstadoRegistroTag | undefined) => e === "propuesto" || e === "reasignado";

/** Datos del equipo que se guardan en la cabecera del registro (la clave `tag` sigue siendo el texto del TAG). */
export interface SeleccionTag {
  tag: string;
  estado: EstadoRegistroTag;
  tagOriginal?: string;
}

export const seleccionDe = (e: Equipo): SeleccionTag => ({
  tag: e.tag,
  estado: e.estado,
  ...(e.estado === "reasignado" && e.tagOriginal ? { tagOriginal: e.tagOriginal } : {}),
});

/** Minúsculas, sin tildes ni signos: «740-XF-001», «740xf001» y «740 XF 001» quedan iguales. */
export const normalizar = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

export interface Filtro {
  designadores: string[];
  area: CodigoArea;
  todasAreas: boolean;
  sector: string | null;
  texto: string;
}

const pajar = new WeakMap<Equipo, string>();
function textoBuscable(e: Equipo): string {
  let p = pajar.get(e);
  if (p === undefined) {
    p = normalizar(`${e.tag} ${e.tagFuente ?? ""} ${e.nombre} ${e.instalacion} ${e.tipoEquipo ?? ""}`);
    pajar.set(e, p);
  }
  return p;
}

/** Equipos del formato (por designador) y del área elegida, o de todas con el interruptor. */
export function equiposDelFormato(todos: Equipo[], f: Pick<Filtro, "designadores" | "area" | "todasAreas">): Equipo[] {
  return todos.filter(
    (e) =>
      (f.designadores.length === 0 || (e.designador !== null && f.designadores.includes(e.designador))) &&
      (f.todasAreas || e.area === f.area),
  );
}

export function filtrarEquipos(todos: Equipo[], f: Filtro): Equipo[] {
  const fichas = f.texto.split(/\s+/).map(normalizar).filter(Boolean);
  return equiposDelFormato(todos, f)
    .filter((e) => f.sector === null || e.sector === f.sector)
    .filter((e) => fichas.every((t) => textoBuscable(e).includes(t)))
    .sort((a, b) => a.tag.localeCompare(b.tag, "es", { numeric: true }));
}

/** Sectores presentes (con cantidad) entre los equipos ya filtrados por formato y área. */
export function sectoresDe(equipos: Equipo[]): { sector: string; cantidad: number }[] {
  const cuenta = new Map<string, number>();
  for (const e of equipos) if (e.sector) cuenta.set(e.sector, (cuenta.get(e.sector) ?? 0) + 1);
  return [...cuenta].map(([sector, cantidad]) => ({ sector, cantidad })).sort((a, b) => a.sector.localeCompare(b.sector, "es"));
}

/** Designadores de formatos guardados antes de existir el catálogo: salen del tipo de equipo de la base. */
export const DESIGNADORES_POR_TIPO_EQUIPO: Record<string, string[]> = {
  transformador_piso: ["XF"],
  transformador_aereo: ["XF"],
  reconectador: ["GV", "NJ"],
  inspeccion_lineas: ["LI"],
  grupo_generador: ["GG", "GE", "DG"],
};

/**
 * Cómo viaja la selección en la cabecera del registro (que ya se guarda completa en `answers._header`):
 * `tag` (texto, como siempre), `tag_estado`, `tag_original` y `equipos_extra` (JSON, formatos con varios equipos).
 */
export function conTag(header: Record<string, string>, sel: SeleccionTag | null): Record<string, string> {
  const { tag_estado: _e, tag_original: _o, ...resto } = header;
  void _e;
  void _o;
  if (!sel) return { ...resto, tag: "" };
  return {
    ...resto,
    tag: sel.tag,
    tag_estado: sel.estado,
    ...(sel.tagOriginal ? { tag_original: sel.tagOriginal } : {}),
  };
}

export function seleccionDeCabecera(header: Record<string, string>): SeleccionTag | null {
  const tag = (header.tag ?? "").trim();
  if (!tag) return null;
  return {
    tag,
    estado: (header.tag_estado as EstadoRegistroTag | undefined) ?? "oficial",
    ...(header.tag_original ? { tagOriginal: header.tag_original } : {}),
  };
}

export function extrasDe(header: Record<string, string>): SeleccionTag[] {
  try {
    const v: unknown = JSON.parse(header.equipos_extra ?? "[]");
    return Array.isArray(v) ? (v as SeleccionTag[]).filter((x) => x && typeof x.tag === "string") : [];
  } catch {
    return [];
  }
}

export const conExtras = (header: Record<string, string>, extras: SeleccionTag[]): Record<string, string> => {
  const { equipos_extra: _x, ...resto } = header;
  void _x;
  return extras.length ? { ...resto, equipos_extra: JSON.stringify(extras) } : resto;
};

export const ETIQUETA_ESTADO: Record<EstadoRegistroTag, string | null> = {
  oficial: null,
  por_validar: "TAG por validar",
  propuesto: "TAG provisional",
  reasignado: "TAG provisional",
  sin_tag: "Sin TAG · pendiente de revisión",
};
