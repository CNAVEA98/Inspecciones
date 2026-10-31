import { describe, expect, it } from "vitest";
import type { FilaInforme, GrupoInforme } from "./modelo";
import { alturaEstimadaGrupo, grupoSinCortes } from "./paginado";

const fila = (n: number, texto = "Verificar estado general del equipo.", obs = ""): FilaInforme => ({
  n,
  texto,
  valor: "",
  estado: "BN",
  obs,
});
const grupo = (filas: FilaInforme[]): GrupoInforme => ({ titulo: "G", filas, conformes: filas.length, total: filas.length });

describe("paginado del informe", () => {
  it("un grupo de tamaño normal se mantiene entero", () => {
    expect(grupoSinCortes(grupo(Array.from({ length: 12 }, (_, i) => fila(i + 1))))).toBe(true);
  });

  it("un grupo más alto que una página puede partirse (no hay otra salida)", () => {
    expect(grupoSinCortes(grupo(Array.from({ length: 60 }, (_, i) => fila(i + 1))))).toBe(false);
  });

  it("las observaciones y los textos largos aumentan la altura estimada", () => {
    const base = alturaEstimadaGrupo(grupo([fila(1)]));
    expect(alturaEstimadaGrupo(grupo([fila(1, "x".repeat(200))]))).toBeGreaterThan(base);
    expect(alturaEstimadaGrupo(grupo([fila(1, undefined, "o".repeat(250))]))).toBeGreaterThan(base + 18);
  });
});
