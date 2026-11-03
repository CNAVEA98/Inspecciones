/**
 * Formatos de inspección (INSP) y mantención (MANT): tipos y reglas de filtrado.
 *
 * Los datos viven en la tabla `public.formatos` (migración 0016). El técnico los recibe con el catálogo que descarga
 * y guarda en el equipo (`lib/tecnico/catalog`); el personal los lee en el servidor (`lib/formatos/plantillas`).
 * Para habilitar un formato: su plantilla debe estar publicada en la base (tipo de equipo × modo) y la fila del
 * formato debe indicar esos códigos en `tipo_equipo_code` y `modo_code`.
 */

export type TipoTrabajo = "INSP" | "MANT";
export type CodigoArea = "chacay" | "mina" | "mauro" | "puerto" | "valle";
export type CodigoFamilia = "F1" | "F2" | "F3" | "F4" | "F5" | "F6" | "F7";
export type EstadoFormato = "disponible" | "proximamente";

export interface Formato {
  /** «INSP-12», «MANT-05». */
  id: string;
  tipo: TipoTrabajo;
  titulo: string;
  familia: CodigoFamilia;
  /** Áreas donde aparece. Vacía = transversal (todas las áreas). */
  areas: CodigoArea[];
  /** Designadores de TAG (segundo bloque, p. ej. XF en 320-XF-012) que filtran el selector. */
  designadores: string[];
  /** «tag» = equipo con TAG; «tramo» = «Tramo o ubicación» (usa los tramos del Maestro si hay designador). */
  campo: "tag" | "tramo";
  /** Permite agregar varios equipos («+ Equipo»), p. ej. pruebas de generadores. */
  variosEquipos: boolean;
  estado: EstadoFormato;
  /** El Maestro/usuario no confirmó en qué áreas aplica: se muestra según `areas`, pero está por revisar. */
  areasPorConfirmar?: boolean;
  /** Plantilla de la base que abre el formulario: códigos de `equipment_types` y `work_modes`. */
  plantilla?: { tipoEquipo: string; modo: string };
  /** Un formato desactivado no se ofrece al técnico; sus inspecciones siguen intactas. */
  activo: boolean;
}

export const FAMILIAS: Record<CodigoFamilia, string> = {
  F1: "Switchgear y celdas MT",
  F2: "Salas eléctricas y túnel de cables",
  F3: "Transformadores",
  F4: "Líneas, reconectadores y relés",
  F5: "Grupo Generadores",
  F6: "Filtros y Condensadores",
  F7: "Corriente Continua, BT",
};
export const ORDEN_FAMILIAS = Object.keys(FAMILIAS) as CodigoFamilia[];

export const TRABAJOS: Record<TipoTrabajo, string> = { INSP: "Inspección", MANT: "Mantención" };

/** Fila de `public.formatos` tal como la entrega PostgREST. */
export interface FilaFormatoBD {
  id: string;
  tipo: string;
  titulo: string;
  familia: string;
  areas: string[] | null;
  designadores: string[] | null;
  campo: string;
  varios_equipos: boolean;
  areas_por_confirmar: boolean;
  tipo_equipo_code: string | null;
  modo_code: string | null;
  activo: boolean;
  orden: number;
}

/** Columnas que se piden a `public.formatos`. */
export const COLUMNAS_FORMATO =
  "id, tipo, titulo, familia, areas, designadores, campo, varios_equipos, areas_por_confirmar, tipo_equipo_code, modo_code, activo, orden";

/** Convierte una fila de la base al modelo de la app (mismo resultado que el antiguo catálogo en código). */
export function filaAFormato(r: FilaFormatoBD): Formato {
  const plantilla = r.tipo_equipo_code && r.modo_code ? { tipoEquipo: r.tipo_equipo_code, modo: r.modo_code } : undefined;
  return {
    id: r.id,
    tipo: r.tipo as TipoTrabajo,
    titulo: r.titulo,
    familia: r.familia as CodigoFamilia,
    areas: (r.areas ?? []) as CodigoArea[],
    designadores: r.designadores ?? [],
    campo: r.campo === "tramo" ? "tramo" : "tag",
    variosEquipos: r.varios_equipos,
    estado: plantilla ? "disponible" : "proximamente",
    ...(r.areas_por_confirmar ? { areasPorConfirmar: true } : {}),
    ...(plantilla ? { plantilla } : {}),
    activo: r.activo,
  };
}

/** Ordena como el catálogo original: por `orden` y, a igualdad, por id. */
export const ordenarFilas = (filas: readonly FilaFormatoBD[]) =>
  [...filas].sort((a, b) => a.orden - b.orden || a.id.localeCompare(b.id));

/** Un formato aparece si es transversal o incluye el área elegida. */
export const aplicaEnArea = (formato: Formato, area: CodigoArea) =>
  formato.areas.length === 0 || formato.areas.includes(area);

/** Formatos que ve el técnico: activos, del trabajo y área elegidos (y de la familia, si se indica). */
export function formatosVisibles(
  formatos: readonly Formato[],
  area: CodigoArea,
  tipo: TipoTrabajo,
  familia?: CodigoFamilia,
): Formato[] {
  return formatos.filter(
    (x) => x.activo && x.tipo === tipo && aplicaEnArea(x, area) && (familia === undefined || x.familia === familia),
  );
}

/** Familias con al menos un formato visible para el área y el trabajo (el estado «próximamente» no oculta). */
export function familiasVisibles(formatos: readonly Formato[], area: CodigoArea, tipo: TipoTrabajo): CodigoFamilia[] {
  const con = new Set(formatosVisibles(formatos, area, tipo).map((x) => x.familia));
  return ORDEN_FAMILIAS.filter((fam) => con.has(fam));
}

export const formatoPorId = (formatos: readonly Formato[], id: string) => formatos.find((x) => x.id === id);
