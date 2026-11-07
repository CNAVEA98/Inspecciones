import { formatFechaHora } from "@/lib/fecha";
import { normalizar } from "@/lib/formatos/tags";
import { ESTADO_ENVIADA, type Enviada } from "./enviadas";

/** Cuántas enviadas se muestran de una vez (las últimas); «Ver más» agrega otras tantas. */
export const POR_PAGINA_ENVIADAS = 5;

export type FiltroEstado = "todas" | "revision" | "aprobadas" | "rechazadas";

export const FILTROS_ESTADO: { valor: FiltroEstado; texto: string }[] = [
  { valor: "todas", texto: "Todas" },
  { valor: "revision", texto: "En revisión" },
  { valor: "aprobadas", texto: "Aprobadas" },
  { valor: "rechazadas", texto: "Rechazadas" },
];

/** Grupo de estado al que pertenece una enviada (la revisión incluye «firmada por supervisor»). */
export const grupoDeEstado = (e: Pick<Enviada, "status">): Exclude<FiltroEstado, "todas"> =>
  e.status === "approved" ? "aprobadas" : e.status === "rejected" ? "rechazadas" : "revision";

export interface OpcionesBusqueda {
  texto: string;
  estado: FiltroEstado;
  /** Nombres del catálogo local, para buscar también por área y equipo. */
  nombreArea: (id: string) => string;
  nombreEquipo: (id: string) => string;
}

/** Todo lo que se puede buscar de una enviada, ya normalizado (sin tildes, mayúsculas ni signos). */
function pajar(e: Enviada, op: Pick<OpcionesBusqueda, "nombreArea" | "nombreEquipo">): string {
  const fecha = e.submitted_at ? formatFechaHora(e.submitted_at) : "";
  return normalizar(
    [e.equipment_tag, e.folio ?? "", e.performed_by ?? "", op.nombreArea(e.area_id), op.nombreEquipo(e.equipment_type_id), ESTADO_ENVIADA[e.status].texto, fecha].join(" "),
  );
}

/**
 * Filtra las enviadas por estado y por texto. Todas las palabras escritas deben aparecer (en cualquier orden) y se ignoran
 * tildes, mayúsculas y signos: «444sg001», «444-SG-001» y «sg 444» encuentran el mismo TAG. Mantiene el orden recibido (más recientes primero).
 */
export function filtrarEnviadas(lista: readonly Enviada[], op: OpcionesBusqueda): Enviada[] {
  const fichas = op.texto.split(/\s+/).map(normalizar).filter(Boolean);
  return lista.filter((e) => {
    if (op.estado !== "todas" && grupoDeEstado(e) !== op.estado) return false;
    if (fichas.length === 0) return true;
    const p = pajar(e, op);
    return fichas.every((f) => p.includes(f));
  });
}

/** Cantidad por estado (para los contadores de los filtros). */
export function contarPorEstado(lista: readonly Enviada[]): Record<FiltroEstado, number> {
  const c: Record<FiltroEstado, number> = { todas: lista.length, revision: 0, aprobadas: 0, rechazadas: 0 };
  for (const e of lista) c[grupoDeEstado(e)]++;
  return c;
}

export { textoSeguro as textoParaServidor } from "./enviadas";
