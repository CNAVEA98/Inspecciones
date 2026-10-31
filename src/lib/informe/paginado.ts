import type { GrupoInforme } from "./modelo";

/** Alto útil de una página A4 del informe (842 pt menos márgenes superior e inferior) con un margen de seguridad. */
const ALTO_UTIL = 700;

/**
 * Altura aproximada (pt) de un grupo del informe: título, filas de una o dos líneas y observaciones.
 * Solo sirve para decidir si el grupo cabe en una página; no necesita ser exacta, pero sí no quedarse corta.
 */
export function alturaEstimadaGrupo(g: GrupoInforme): number {
  let alto = 40; // marco, título y espacios
  for (const f of g.filas) {
    alto += 21 + (f.texto.length > 85 ? 11 : 0) + (f.texto.length > 170 ? 11 : 0);
    if (f.obs) alto += 18 + 11 * Math.floor(f.obs.length / 100);
    if (f.traza) alto += 12;
  }
  return alto;
}

/**
 * Un grupo (tabla) se mantiene entero en una sola página si cabe en una; si es más alto que una página
 * no hay otra salida que dejarlo partirse. Así ninguna tabla queda cortada a la mitad por el salto de página.
 */
export function grupoSinCortes(g: GrupoInforme): boolean {
  return alturaEstimadaGrupo(g) <= ALTO_UTIL;
}
