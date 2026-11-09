import { fechaIso } from "@/lib/fecha";
import type { FilaBandeja } from "./queries";

export type TurnoFiltro = "" | "A" | "B";

/** Minúsculas y sin tildes, para que «Estacion» encuentre «Estación». */
const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/**
 * Búsqueda de la bandeja (versión simple de la de la web): texto libre en folio, TAG, equipo, modo, área, quien realizó y
 * cuenta de envío; turno y día de envío (yyyy-mm-dd, horario de Chile).
 */
export function filtrarBandeja(filas: FilaBandeja[], q: string, turno: TurnoFiltro = "", fecha = ""): FilaBandeja[] {
  const palabras = norm(q).split(/\s+/).filter(Boolean);
  return filas.filter((f) => {
    if (turno && f.turno !== turno) return false;
    if (fecha && (!f.submittedAt || fechaIso(f.submittedAt) !== fecha)) return false;
    if (palabras.length === 0) return true;
    const texto = norm(
      [f.folio, f.equipmentTag, f.equipo, f.modo, f.area, f.realizadoPor, f.tecnico].filter(Boolean).join(" "),
    );
    return palabras.every((p) => texto.includes(p));
  });
}
