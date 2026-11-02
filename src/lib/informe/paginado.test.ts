import { describe, expect, it } from "vitest";
import { cortarEnTramos, inicioDeTramos } from "./paginado";

describe("paginado del informe", () => {
  it("una tabla que cabe en una página es un solo tramo", () => {
    expect(inicioDeTramos([1, 1, 1])).toEqual([0]);
    expect(inicioDeTramos([])).toEqual([0]);
  });

  it("empieza un tramo nuevo en cada cambio de página", () => {
    expect(inicioDeTramos([1, 1, 2, 2, 3])).toEqual([0, 2, 4]);
  });

  it("corta las filas en tramos sin perder ni repetir ninguna", () => {
    expect(cortarEnTramos(["a", "b", "c", "d", "e"], [0, 2, 4])).toEqual([["a", "b"], ["c", "d"], ["e"]]);
    expect(cortarEnTramos(["a"], [0])).toEqual([["a"]]);
    expect(cortarEnTramos([], [0])).toEqual([]);
  });
});
