/**
 * Paginado de las tablas del informe en dos pasadas: la primera anota en qué página cae cada fila y la segunda
 * dibuja un recuadro cerrado por página («tramo»), en vez de un marco abierto cortado por el salto de página.
 */

/** Por grupo, la página donde quedó cada fila en la pasada de medición. */
export type PaginasPorGrupo = number[][];

/** Índice de la primera fila de cada tramo: empieza uno nuevo cada vez que la fila cae en otra página. */
export function inicioDeTramos(paginas: number[]): number[] {
  const inicios = [0];
  for (let i = 1; i < paginas.length; i++) if (paginas[i] !== paginas[i - 1]) inicios.push(i);
  return inicios;
}

/** Corta las filas en tramos según sus inicios. */
export function cortarEnTramos<T>(filas: T[], inicios: number[]): T[][] {
  return inicios.map((desde, k) => filas.slice(desde, inicios[k + 1] ?? filas.length)).filter((t) => t.length > 0);
}
