import { describe, expect, it } from "vitest";
import { SIN_TURNO, coincideTipo, coincideTurno, contarCarpeta, nombreTurno, nombreZona, parseTipo, parseZona, tipoDeModo, zonaDeArea } from "./carpetas";
import { CONSULTA_VACIA, filtrarFilas, hayBusqueda, parseConsulta } from "./consulta";
import type { FilaBandeja } from "./queries";

const fila = (o: Partial<FilaBandeja>): FilaBandeja => ({
  id: "x", folio: null, status: "submitted", equipmentTag: "T", area: "Mina", equipo: "E", modo: "M", tecnico: "T",
  realizadoPor: "R", turno: "A", submittedAt: "2026-10-20T12:00:00Z", ...o,
});

describe("carpetas de la bandeja", () => {
  it("Chacay y Mina van juntas, Puerto y Mauro van juntas, lo demás queda aparte", () => {
    expect(zonaDeArea("Chacay")).toBe("chacay-mina");
    expect(zonaDeArea("Mina")).toBe("chacay-mina");
    expect(zonaDeArea("Puerto")).toBe("puerto-mauro");
    expect(zonaDeArea("El Mauro")).toBe("puerto-mauro");
    expect(zonaDeArea("Valle")).toBe("otras");
  });

  it("nombres y valores de la URL", () => {
    expect(nombreZona("chacay-mina")).toBe("Chacay-Mina");
    expect(nombreZona("puerto-mauro")).toBe("Puerto-Mauro");
    expect(nombreTurno("A")).toBe("Turno A");
    expect(nombreTurno(SIN_TURNO)).toBe("Sin turno");
    expect(parseZona("puerto-mauro")).toBe("puerto-mauro");
    expect(parseZona("otra-cosa")).toBe("");
  });

  it("la consulta lee turno, carpeta y vista, y la búsqueda no cuenta el turno ni la carpeta", () => {
    const c = parseConsulta({ turno: "B", zona: "chacay-mina", vista: "lista" });
    expect(c).toMatchObject({ turno: "B", zona: "chacay-mina", vista: "lista" });
    expect(hayBusqueda(c)).toBe(false);
    expect(hayBusqueda({ ...c, q: "mina" })).toBe(true);
    expect(parseConsulta({ turno: SIN_TURNO }).turno).toBe(SIN_TURNO);
    expect(parseConsulta({ zona: "x", vista: "y" })).toMatchObject({ zona: "", vista: "" });
  });

  it("cada inspección cae en su carpeta: turno de la cuenta y área", () => {
    const filas = [
      fila({ id: "1", turno: "A", area: "Mina" }),
      fila({ id: "2", turno: "A", area: "Chacay" }),
      fila({ id: "3", turno: "B", area: "Chacay" }),
      fila({ id: "4", turno: "B", area: "Puerto" }),
      fila({ id: "5", turno: "B", area: "Valle" }),
      fila({ id: "6", turno: null, area: "Mauro" }),
    ];
    const ids = (c: Partial<typeof CONSULTA_VACIA>) => filtrarFilas(filas, { ...CONSULTA_VACIA, ...c }).map((f) => f.id);
    expect(ids({ turno: "A", zona: "chacay-mina" })).toEqual(["1", "2"]);
    expect(ids({ turno: "A", zona: "puerto-mauro" })).toEqual([]);
    expect(ids({ turno: "B", zona: "chacay-mina" })).toEqual(["3"]);
    expect(ids({ turno: "B", zona: "puerto-mauro" })).toEqual(["4"]);
    expect(ids({ turno: "B", zona: "otras" })).toEqual(["5"]);
    expect(ids({ turno: SIN_TURNO })).toEqual(["6"]);
    expect(coincideTurno(filas[5], SIN_TURNO)).toBe(true);
    expect(coincideTurno(filas[0], "")).toBe(true);
  });

  it("cuenta el total y lo que le toca firmar a quien mira", () => {
    const filas = [fila({ status: "submitted" }), fila({ status: "approved" }), fila({ status: "supervisor_signed" })];
    expect(contarCarpeta(filas, (f) => f.status === "submitted")).toEqual({ total: 3, porFirmar: 1 });
    expect(contarCarpeta([], () => true)).toEqual({ total: 0, porFirmar: 0 });
  });
});

describe("tipo de trabajo", () => {
  it("el modo «Mantenimiento programado» es mantención y lo demás es inspección", () => {
    expect(tipoDeModo("Mantenimiento programado")).toBe("mantencion");
    expect(tipoDeModo("Inspección según Plan Matriz")).toBe("inspeccion");
    expect(tipoDeModo("")).toBe("inspeccion");
    expect(parseTipo("mantencion")).toBe("mantencion");
    expect(parseTipo("x")).toBe("");
    expect(coincideTipo({ modo: "Mantenimiento programado" }, "inspeccion")).toBe(false);
    expect(coincideTipo({ modo: "Mantenimiento programado" }, "")).toBe(true);
  });

  it("la bandeja filtra por tipo", () => {
    const filas = [fila({ id: "1", modo: "Inspección según Plan Matriz" }), fila({ id: "2", modo: "Mantenimiento programado" })];
    const ids = (tipo: "" | "inspeccion" | "mantencion") =>
      filtrarFallasBandeja(filas, tipo);
    expect(ids("mantencion")).toEqual(["2"]);
    expect(ids("inspeccion")).toEqual(["1"]);
    expect(ids("")).toEqual(["1", "2"]);
    expect(parseConsulta({ tipo: "mantencion" }).tipo).toBe("mantencion");
    expect(parseConsulta({ tipo: "otro" }).tipo).toBe("");
  });
});

const filtrarFallasBandeja = (filas: FilaBandeja[], tipo: "" | "inspeccion" | "mantencion") =>
  filtrarFilas(filas, { ...CONSULTA_VACIA, tipo }).map((f) => f.id);
