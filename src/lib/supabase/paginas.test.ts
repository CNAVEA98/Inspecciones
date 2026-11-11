import { describe, expect, it } from "vitest";
import { leerTodo } from "./paginas";

/** Simula PostgREST: devuelve el tramo pedido de `total` filas. */
const fuente = (total: number) => {
  const pedidos: [number, number][] = [];
  const pagina = async (desde: number, hasta: number) => {
    pedidos.push([desde, hasta]);
    const data = Array.from({ length: Math.max(0, Math.min(hasta + 1, total) - desde) }, (_, i) => desde + i);
    return { data, error: null };
  };
  return { pagina, pedidos };
};

describe("leerTodo", () => {
  it("junta varias páginas y se detiene en la primera incompleta", async () => {
    const f = fuente(25);
    const r = await leerTodo<number>(f.pagina, 100, 10);
    expect(r.filas).toHaveLength(25);
    expect(r.filas[24]).toBe(24);
    expect(r.truncado).toBe(false);
    expect(f.pedidos).toEqual([[0, 9], [10, 19], [20, 29]]);
  });
  it("no marca truncado cuando hay justo el máximo", async () => {
    const r = await leerTodo<number>(fuente(20).pagina, 20, 10);
    expect(r.filas).toHaveLength(20);
    expect(r.truncado).toBe(false);
  });
  it("corta en el máximo y avisa que había más", async () => {
    const r = await leerTodo<number>(fuente(21).pagina, 20, 10);
    expect(r.filas).toHaveLength(20);
    expect(r.truncado).toBe(true);
  });
  it("propaga el error de la consulta", async () => {
    await expect(leerTodo(async () => ({ data: null, error: { message: "sin permiso" } }))).rejects.toThrow("sin permiso");
  });
});
