import type { FilaBandeja } from "./queries";

/**
 * Carpetas de la bandeja del supervisor y del planificador: Turno A / Turno B y, dentro de cada una,
 * Chacay-Mina y Puerto-Mauro. Son vistas (no se copia nada): la inspección cae sola en su carpeta según el
 * turno de la cuenta de técnico que la envió y el área elegida.
 */
export type Zona = "chacay-mina" | "puerto-mauro" | "otras";

export const ZONAS: { id: Zona; nombre: string }[] = [
  { id: "chacay-mina", nombre: "Chacay-Mina" },
  { id: "puerto-mauro", nombre: "Puerto-Mauro" },
  { id: "otras", nombre: "Otras áreas" },
];

/** Valor de `turno` en la URL para las inspecciones sin turno (cuentas viejas o sin turno). */
export const SIN_TURNO = "-";

export const nombreZona = (z: Zona) => ZONAS.find((x) => x.id === z)?.nombre ?? z;
export const nombreTurno = (t: string) => (t === SIN_TURNO ? "Sin turno" : `Turno ${t}`);

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/** Chacay y Mina van juntas; Puerto y Mauro van juntas; lo demás (p. ej. Valle) queda en «Otras áreas». */
export function zonaDeArea(area: string): Zona {
  const a = norm(area);
  if (a.includes("chacay") || a.includes("mina")) return "chacay-mina";
  if (a.includes("puerto") || a.includes("mauro")) return "puerto-mauro";
  return "otras";
}

export function parseZona(v: string): "" | Zona {
  return ZONAS.some((z) => z.id === v) ? (v as Zona) : "";
}

export const coincideTurno = (f: Pick<FilaBandeja, "turno">, turno: "" | "A" | "B" | typeof SIN_TURNO) =>
  turno === "" ? true : turno === SIN_TURNO ? f.turno === null : f.turno === turno;

export interface ConteoCarpeta {
  /** Inspecciones en la carpeta, en cualquier estado de la revisión. */
  total: number;
  /** Las que le toca firmar a quien mira. */
  porFirmar: number;
}

/** Cuenta lo que hay en una carpeta; `leTocaFirmar` es la etapa pendiente del rol que mira. */
export function contarCarpeta(filas: FilaBandeja[], leTocaFirmar: (f: FilaBandeja) => boolean): ConteoCarpeta {
  return { total: filas.length, porFirmar: filas.filter(leTocaFirmar).length };
}
