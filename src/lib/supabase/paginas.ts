/** Filas por petición. PostgREST corta cada respuesta en `max_rows` (1000 en este proyecto), pida lo que se pida. */
export const TAMANO_PAGINA = 1000;

interface Respuesta {
  data: unknown[] | null;
  error: { message: string } | null;
}

/**
 * Lee todas las filas de una consulta, página por página (`.range(desde, hasta)`), hasta `max`.
 * Un `.limit(2000)` no basta: el servidor igual corta en 1000 y lo que sobra se pierde sin aviso.
 * La consulta debe traer un orden estable (p. ej. terminar en `.order("id")`) para que las páginas no se pisen.
 * `truncado` avisa que había más filas que `max`.
 */
export async function leerTodo<T>(
  pagina: (desde: number, hasta: number) => PromiseLike<Respuesta>,
  max = 10_000,
  tamano = TAMANO_PAGINA,
): Promise<{ filas: T[]; truncado: boolean }> {
  const filas: T[] = [];
  // Se llega a pedir una fila más que el tope (la de índice `max`) para saber si quedó algo fuera.
  for (let desde = 0; desde <= max; desde += tamano) {
    const hasta = Math.min(desde + tamano - 1, max);
    const { data, error } = await pagina(desde, hasta);
    if (error) throw new Error(error.message);
    const lote = (data ?? []) as T[];
    filas.push(...lote);
    if (lote.length < hasta - desde + 1) return { filas, truncado: false };
  }
  return { filas: filas.slice(0, max), truncado: filas.length > max };
}
