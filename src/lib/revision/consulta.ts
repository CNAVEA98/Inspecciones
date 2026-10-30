import { fechaIso } from "@/lib/fecha";
import type { FilaBandeja } from "./queries";

/** Búsqueda y consulta de la bandeja; viaja en la URL para poder compartir o volver a una consulta. */
export interface Consulta {
  /** Texto libre: folio, TAG, equipo, área, modo, quien realizó o cuenta de envío. */
  q: string;
  /** TAG exacto (consulta de un solo equipo). */
  tag: string;
  turno: "" | "A" | "B";
  /** Fechas de envío (yyyy-mm-dd, horario de Chile), ambas inclusive. */
  desde: string;
  hasta: string;
}

export const CONSULTA_VACIA: Consulta = { q: "", tag: "", turno: "", desde: "", hasta: "" };

type Params = Record<string, string | string[] | undefined>;

const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const esFecha = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);

export function parseConsulta(sp: Params): Consulta {
  const turno = uno(sp.turno);
  const desde = uno(sp.desde);
  const hasta = uno(sp.hasta);
  return {
    q: uno(sp.q).trim().slice(0, 100),
    tag: uno(sp.tag).trim().slice(0, 60),
    turno: turno === "A" || turno === "B" ? turno : "",
    desde: esFecha(desde) ? desde : "",
    hasta: esFecha(hasta) ? hasta : "",
  };
}

export const hayConsulta = (c: Consulta) => Object.values(c).some((v) => v !== "");

/** Minúsculas y sin tildes, para que «Estacion» encuentre «Estación». */
const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function filtrarFilas(filas: FilaBandeja[], c: Consulta): FilaBandeja[] {
  const palabras = norm(c.q).split(/\s+/).filter(Boolean);
  const tag = norm(c.tag);
  return filas.filter((f) => {
    if (tag && norm(f.equipmentTag) !== tag) return false;
    if (c.turno && f.turno !== c.turno) return false;
    if (c.desde || c.hasta) {
      if (!f.submittedAt) return false;
      const dia = fechaIso(f.submittedAt);
      if (c.desde && dia < c.desde) return false;
      if (c.hasta && dia > c.hasta) return false;
    }
    if (palabras.length > 0) {
      const texto = norm(
        [f.folio, f.equipmentTag, f.equipo, f.modo, f.area, f.realizadoPor, f.tecnico].filter(Boolean).join(" "),
      );
      // Todas las palabras deben aparecer (en cualquier orden).
      if (!palabras.every((p) => texto.includes(p))) return false;
    }
    return true;
  });
}

/** TAGs distintos, ordenados, para sugerirlos en la consulta. */
export function tagsDe(filas: FilaBandeja[]): string[] {
  return [...new Set(filas.map((f) => f.equipmentTag).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
}

/** Query string de la consulta más el estado, sin los campos vacíos. */
export function consultaAQuery(estado: string, c: Consulta): string {
  const p = new URLSearchParams({ estado });
  for (const [k, v] of Object.entries(c)) if (v) p.set(k, v);
  return p.toString();
}
