import { describe, expect, it } from "vitest";
import { consultaAQuery, filtrarFilas, hayConsulta, parseConsulta, tagsDe, CONSULTA_VACIA } from "./consulta";
import type { FilaBandeja } from "./queries";

const fila = (o: Partial<FilaBandeja>): FilaBandeja => ({
  id: "x",
  folio: "INS-2026-000001",
  status: "submitted",
  equipmentTag: "740-XF-001",
  area: "Chacay",
  equipo: "Transformador de piso",
  modo: "Mantenimiento",
  tecnico: "Técnico A",
  realizadoPor: "Luis Herrera",
  turno: "A",
  submittedAt: "2026-10-15T15:00:00Z",
  ...o,
});

const filas = [
  fila({ id: "1" }),
  fila({ id: "2", folio: "INS-2026-000002", equipmentTag: "MA-TP-012", area: "El Mauro", turno: "B", realizadoPor: "Camila Vera", submittedAt: "2026-10-20T15:00:00Z" }),
  fila({ id: "3", folio: "INS-2026-000003", equipmentTag: "740-XF-001", turno: "B", submittedAt: null }),
];
const ids = (r: FilaBandeja[]) => r.map((f) => f.id);

describe("parseConsulta", () => {
  it("descarta valores inválidos y recorta espacios", () => {
    expect(parseConsulta({ q: "  mauro ", turno: "C", desde: "ayer", hasta: "2026-10-31" })).toEqual({
      q: "mauro", tag: "", turno: "", zona: "", tipo: "", vista: "", desde: "", hasta: "2026-10-31",
    });
  });
  it("toma el primer valor si viene repetido", () => {
    expect(parseConsulta({ tag: ["A-1", "B-2"] }).tag).toBe("A-1");
  });
});

describe("filtrarFilas", () => {
  it("sin consulta devuelve todo", () => {
    expect(filtrarFilas(filas, CONSULTA_VACIA)).toHaveLength(3);
    expect(hayConsulta(CONSULTA_VACIA)).toBe(false);
  });
  it("busca sin distinguir tildes ni mayúsculas, en cualquier campo", () => {
    expect(ids(filtrarFilas(filas, { ...CONSULTA_VACIA, q: "CAMILA" }))).toEqual(["2"]);
    expect(ids(filtrarFilas(filas, { ...CONSULTA_VACIA, q: "tecnico a" }))).toEqual(["1", "2", "3"]);
  });
  it("exige todas las palabras", () => {
    expect(ids(filtrarFilas(filas, { ...CONSULTA_VACIA, q: "mauro herrera" }))).toEqual([]);
    expect(ids(filtrarFilas(filas, { ...CONSULTA_VACIA, q: "mauro camila" }))).toEqual(["2"]);
  });
  it("filtra por TAG exacto", () => {
    expect(ids(filtrarFilas(filas, { ...CONSULTA_VACIA, tag: "740-xf-001" }))).toEqual(["1", "3"]);
    expect(ids(filtrarFilas(filas, { ...CONSULTA_VACIA, tag: "740" }))).toEqual([]);
  });
  it("filtra por turno", () => {
    expect(ids(filtrarFilas(filas, { ...CONSULTA_VACIA, turno: "B" }))).toEqual(["2", "3"]);
  });
  it("filtra por fechas inclusivas y excluye las sin fecha de envío", () => {
    expect(ids(filtrarFilas(filas, { ...CONSULTA_VACIA, desde: "2026-10-20" }))).toEqual(["2"]);
    expect(ids(filtrarFilas(filas, { ...CONSULTA_VACIA, hasta: "2026-10-15" }))).toEqual(["1"]);
  });
});

describe("tagsDe y consultaAQuery", () => {
  it("lista TAGs distintos y ordenados", () => {
    expect(tagsDe(filas)).toEqual(["740-XF-001", "MA-TP-012"]);
  });
  it("omite campos vacíos", () => {
    expect(consultaAQuery("todas", { ...CONSULTA_VACIA, tag: "A 1" })).toBe("estado=todas&tag=A+1");
  });
});
