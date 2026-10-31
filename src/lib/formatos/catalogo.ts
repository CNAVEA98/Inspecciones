/**
 * Fuente única de los formatos de inspección (INSP) y mantención (MANT).
 *
 * Para habilitar un formato: (1) cambiar su `estado` a "disponible" y (2) cargar su plantilla en la base
 * (tipo de equipo × modo, como INSP-12) e indicar cuál en `plantilla`. Nada más cambia en las pantallas.
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
}

export const FAMILIAS: Record<CodigoFamilia, string> = {
  F1: "Switchgear y celdas MT",
  F2: "Salas eléctricas y túneles",
  F3: "Transformadores",
  F4: "Líneas, reconectadores y relés",
  F5: "Generación",
  F6: "Condensadores y filtros",
  F7: "BT, respaldo y otros",
};
export const ORDEN_FAMILIAS = Object.keys(FAMILIAS) as CodigoFamilia[];

export const TRABAJOS: Record<TipoTrabajo, string> = { INSP: "Inspección", MANT: "Mantención" };

const AREA: Record<string, CodigoArea> = { CH: "chacay", MI: "mina", MA: "mauro", PU: "puerto" };
const GEN = ["GG", "GE", "DG"];

interface Opciones {
  tramo?: boolean;
  varios?: boolean;
  porConfirmar?: boolean;
  disponible?: Formato["plantilla"];
}

/** f("INSP", 12, "Titulo", "F3", "T", ["XF"]) — áreas: «T» (transversal) o «CH,MI». */
function f(
  tipo: TipoTrabajo,
  n: number,
  titulo: string,
  familia: CodigoFamilia,
  areas: string,
  designadores: string[],
  o: Opciones = {},
): Formato {
  return {
    id: `${tipo}-${String(n).padStart(2, "0")}`,
    tipo,
    titulo,
    familia,
    areas: areas === "T" ? [] : areas.split(",").map((a) => AREA[a]),
    designadores,
    campo: o.tramo ? "tramo" : "tag",
    variosEquipos: o.varios ?? false,
    estado: o.disponible ? "disponible" : "proximamente",
    ...(o.porConfirmar ? { areasPorConfirmar: true } : {}),
    ...(o.disponible ? { plantilla: o.disponible } : {}),
  };
}

export const FORMATOS: Formato[] = [
  // ---------- Inspección ----------
  f("INSP", 1, "Desconectador Seccionador Maniobra 23 kV", "F4", "T", ["SW"], { disponible: { tipoEquipo: "desconectador_seccionador", modo: "plan_matriz" } }),
  f("INSP", 2, "Banco de Condensadores Mauro", "F6", "MA", ["XC"], { disponible: { tipoEquipo: "banco_condensadores_mauro", modo: "plan_matriz" } }),
  f("INSP", 3, "Pruebas Grupos Generadores El Mauro", "F5", "MA", GEN, {
    varios: true,
    disponible: { tipoEquipo: "grupo_generador_mauro", modo: "plan_matriz" },
  }),
  f("INSP", 4, "Limpieza Salas Eléctricas STMG 23 kV", "F2", "MI", ["ER"], { disponible: { tipoEquipo: "sala_electrica_stmg", modo: "plan_matriz" } }),
  f("INSP", 5, "Reconectadores", "F4", "T", ["GV", "NJ"], { disponible: { tipoEquipo: "reconectador", modo: "plan_matriz" } }),
  f("INSP", 6, "Subestaciones Móviles", "F3", "MI", ["SE", "US"]),
  f("INSP", 7, "Transformadores Aéreos", "F3", "T", ["XF"]),
  f("INSP", 8, "Switchgear Sala Eléctrica 12", "F1", "MI", ["SG"]),
  f("INSP", 9, "Parrones de Maniobra 23 kV", "F4", "MI", ["PM"]),
  f("INSP", 10, "Sistema Presurizado Sala 12", "F2", "MI", [], { tramo: true }),
  f("INSP", 11, "Líneas Aéreas 23 kV", "F4", "T", ["LI"], { tramo: true }),
  f("INSP", 12, "Transformadores de Piso", "F3", "T", ["XF"], {
    disponible: { tipoEquipo: "transformador_piso", modo: "plan_matriz" },
  }),
  f("INSP", 13, "Switchgears 23 kV", "F1", "T", ["SG"]),
  f("INSP", 14, "Switchgear Principal Tranque Mauro 23 kV", "F1", "MA", ["SG"]),
  f("INSP", 15, "Túnel de Cables STMG", "F2", "MI", ["TU"], { tramo: true }),
  f("INSP", 16, "Grupos Generadores (Kizeo)", "F5", "T", GEN, { varios: true }),
  f("INSP", 17, "Cargador y Banco de Baterías", "F7", "T", ["BC", "BA"]),
  f("INSP", 18, "Pruebas Grupos Generadores Chacay-Mina", "F5", "CH,MI", GEN, { varios: true }),
  f("INSP", 19, "Cables y Tierras de Escalerillas", "F2", "T", [], { tramo: true }),
  f("INSP", 20, "Celda 23 kV", "F1", "T", ["SW"]),
  f("INSP", 21, "Cruce de Caminos Mina", "F4", "MI", ["CC"]),
  f("INSP", 22, "Luminarias", "F7", "T", ["LP", "LT", "LX"]),
  f("INSP", 23, "Tablero Eléctrico", "F7", "T", ["DP", "CO", "JP"]),
  f("INSP", 24, "Parque Generador", "F5", "T", GEN, { varios: true }),
  f("INSP", 25, "Filtro Armónico STATCOM", "F6", "CH", ["HF"]),
  f("INSP", 26, "Tablero de Respaldo UPS", "F7", "T", ["UP"]),
  f("INSP", 27, "Filtro Armónico 740-HF-5002 (SAG4)", "F6", "CH", ["HF"]),
  f("INSP", 28, "Filtro Armónico 740-HF-5001 (SAG4)", "F6", "CH", ["HF"]),
  f("INSP", 29, "Switchgear PPCH", "F1", "PU", ["SG"]),
  f("INSP", 30, "Sala Eléctrica 740-ER-5002", "F2", "CH", ["ER"]),
  f("INSP", 31, "Ficha Generadores (AGK)", "F5", "T", GEN, { varios: true }),
  f("INSP", 32, "Check List Grupo Generador", "F5", "T", GEN, { varios: true }),
  f("INSP", 33, "Sala Eléctrica 741-ER-5001 (STATCOM)", "F2", "CH", ["ER"]),
  f("INSP", 34, "Relés de Protección y Controladores de Reconectadores", "F4", "T", ["GV", "NJ"]),
  f("INSP", 35, "Banco de Condensadores PPCH", "F6", "PU", ["XC"]),
  // No existe INSP-36 (la numeración salta de 35 a 37).
  f("INSP", 37, "Cerco Perimetral STATCOM", "F7", "CH", [], { tramo: true }),
  f("INSP", 38, "Carga de Combustible PG Piuquenes", "F5", "CH", [], { tramo: true }),
  f("INSP", 39, "Limpieza Sala Eléctrica 740-ER-5002 Línea 4", "F2", "CH", ["ER"]),
  f("INSP", 40, "Pruebas Grupos Generadores Puerto-Mauro", "F5", "PU,MA", GEN, { varios: true }),
  f("INSP", 41, "Sala Eléctrica 741-ER-5002 STATCOM", "F2", "CH", ["ER"]),

  // ---------- Mantención ----------
  f("MANT", 1, "Generadores Locales", "F5", "T", GEN, { varios: true }),
  f("MANT", 2, "Parques de Generación", "F5", "T", GEN, { varios: true, porConfirmar: true }),
  f("MANT", 3, "Subestación Móvil", "F3", "MI", ["SE", "US"]),
  f("MANT", 4, "Cargadores y Banco de Baterías", "F7", "T", ["BC", "BA"]),
  f("MANT", 5, "Tablero BT", "F7", "T", ["DP", "CO"]),
  f("MANT", 6, "Reconectador", "F4", "T", ["GV", "NJ"]),
  f("MANT", 7, "Switchgear Sala 12 23 kV", "F1", "MI", ["SG"]),
  f("MANT", 8, "Switchgear Estaciones 23 kV", "F1", "MI", ["SG"], { porConfirmar: true }),
  f("MANT", 9, "Switchgear Sala 1 y Sala 12", "F1", "MI", ["SG"]),
  f("MANT", 10, "Switchgear SE El Mauro 23 kV", "F1", "MA", ["SG"]),
  f("MANT", 11, "Transformador Aéreo", "F3", "T", ["XF"]),
  f("MANT", 12, "Filtro Armónico Chancado", "F6", "MI", ["HF"]),
  f("MANT", 13, "Filtro Armónico Planta", "F6", "CH", ["HF"]),
  f("MANT", 14, "Filtro Armónico PPCH", "F6", "PU", ["HF"]),
  f("MANT", 15, "Parrones 23 kV", "F4", "MI", ["PM"]),
  f("MANT", 16, "Transformador de Piso", "F3", "T", ["XF"]),
  f("MANT", 17, "Transformador de Poder Correas", "F3", "MI", ["XF"], { porConfirmar: true }),
  f("MANT", 18, "Celda de Piso 23 kV", "F1", "T", ["SW"]),
  f("MANT", 19, "Prueba de Instrumentos Transformador Principal", "F3", "T", ["CT", "PT"]),
  f("MANT", 20, "Línea Aérea 23 kV", "F4", "T", ["LI"], { tramo: true }),
];

/** Un formato aparece si es transversal o incluye el área elegida. */
export const aplicaEnArea = (formato: Formato, area: CodigoArea) =>
  formato.areas.length === 0 || formato.areas.includes(area);

export function formatosVisibles(area: CodigoArea, tipo: TipoTrabajo, familia?: CodigoFamilia): Formato[] {
  return FORMATOS.filter(
    (x) => x.tipo === tipo && aplicaEnArea(x, area) && (familia === undefined || x.familia === familia),
  );
}

/** Familias con al menos un formato visible para el área y el trabajo (el estado «próximamente» no oculta). */
export function familiasVisibles(area: CodigoArea, tipo: TipoTrabajo): CodigoFamilia[] {
  const con = new Set(formatosVisibles(area, tipo).map((x) => x.familia));
  return ORDEN_FAMILIAS.filter((fam) => con.has(fam));
}

export const formatoPorId = (id: string) => FORMATOS.find((x) => x.id === id);
