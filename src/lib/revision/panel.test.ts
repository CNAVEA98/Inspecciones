import { describe, expect, it } from "vitest";
import { calcularPanel, filtrarPorTurnoZona, parseFiltroPanel, queryFiltroPanel, textoDuracion, topeEje, DIAS_SERIE, type FilaPanel, type HallazgoPanel } from "./panel";

const ahora = new Date("2026-11-10T15:00:00Z"); // 12:00 en Chile
const fila = (o: Partial<FilaPanel>): FilaPanel => ({
  id: "x", folio: "INS-2026-000001", status: "submitted", equipmentTag: "740-XF-001", area: "Chacay",
  equipo: "Transformador de piso", modo: "Inspección según Plan Matriz", turno: "A",
  submittedAt: "2026-11-10T13:00:00Z", reviewedAt: null, ...o,
});
const hallazgo = (o: Partial<HallazgoPanel>): HallazgoPanel => ({
  severidad: "media", tag: "740-XF-001", area: "Chacay", equipo: "Transformador de piso", gestion: "pendiente", ...o,
});

const abiertas = [
  fila({ id: "1" }),
  fila({ id: "2", turno: "B", area: "Mauro", submittedAt: "2026-11-01T13:00:00Z" }),
  fila({ id: "3", status: "supervisor_signed", submittedAt: "2026-11-09T13:00:00Z" }),
];

describe("calcularPanel", () => {
  it("cuenta lo que le toca firmar a cada rol", () => {
    const de = (rol: "supervisor" | "planner" | "admin") => calcularPanel({ abiertas, recientes: [], hallazgos: [], rol, ahora });
    expect(de("supervisor")).toMatchObject({ porFirmar: 2, enOtraEtapa: 1, atrasadas: 1, enSupervisor: 2, enProgramador: 1 });
    expect(de("planner")).toMatchObject({ porFirmar: 1, enOtraEtapa: 2, atrasadas: 0 });
    expect(de("admin")).toMatchObject({ porFirmar: 3, enOtraEtapa: 0 });
  });

  it("ordena las pendientes de la más antigua a la más nueva, con sus días de espera", () => {
    const p = calcularPanel({ abiertas, recientes: [], hallazgos: [], rol: "supervisor", ahora });
    expect(p.antiguas.map((a) => [a.id, a.dias])).toEqual([["2", 9], ["1", 0]]);
  });

  it("reparte lo pendiente por turno y zona, y solo muestra «sin turno» u «otras» si tienen algo", () => {
    const p = calcularPanel({ abiertas, recientes: [], hallazgos: [], rol: "supervisor", ahora });
    expect(p.turnoZona).toEqual([
      { turno: "A", zona: "chacay-mina", porFirmar: 1 },
      { turno: "A", zona: "puerto-mauro", porFirmar: 0 },
      { turno: "B", zona: "chacay-mina", porFirmar: 0 },
      { turno: "B", zona: "puerto-mauro", porFirmar: 1 },
    ]);
    const conValle = calcularPanel({ abiertas: [fila({ turno: null, area: "Valle" })], recientes: [], hallazgos: [], rol: "admin", ahora });
    expect(conValle.turnoZona).toContainEqual({ turno: "-", zona: "otras", porFirmar: 1 });
  });

  it("arma la serie diaria con el día de Chile y separa inspecciones de mantenciones", () => {
    const recientes = [
      fila({ id: "a" }),
      // 02:30 UTC del día 10 todavía es el día 9 en Chile.
      fila({ id: "b", submittedAt: "2026-11-10T02:30:00Z", modo: "Mantenimiento programado" }),
      fila({ id: "c", submittedAt: "2026-11-02T15:00:00Z", status: "approved", reviewedAt: "2026-11-03T15:00:00Z" }),
      fila({ id: "d", submittedAt: "2026-11-03T15:00:00Z", status: "rejected" }),
      fila({ id: "viejo", submittedAt: "2026-09-01T15:00:00Z" }),
      fila({ id: "sin-fecha", submittedAt: null }),
    ];
    const p = calcularPanel({ abiertas: [], recientes, hallazgos: [], rol: "admin", ahora });
    expect(p.serie).toHaveLength(DIAS_SERIE);
    expect(p.serie.at(-1)).toEqual({ dia: "2026-11-10", inspecciones: 1, mantenciones: 0 });
    expect(p.serie.at(-2)).toEqual({ dia: "2026-11-09", inspecciones: 0, mantenciones: 1 });
    expect(p.serie[0].dia).toBe("2026-10-12");
    expect(p).toMatchObject({
      recibidas: 4, inspecciones: 3, mantenciones: 1, recibidas7: 2, recibidas7Previas: 2, aprobadas: 1, rechazadas: 1, esperanSupervisor: 2, esperanProgramador: 0,
      horasHastaAprobar: 24,
    });
    expect(p.porArea).toEqual([{ nombre: "Chacay", inspecciones: 3, mantenciones: 1, total: 4 }]);
    expect(p.porEquipo[0]).toMatchObject({ nombre: "Transformador de piso", total: 4 });
  });

  it("resume los hallazgos pendientes por severidad y por equipo", () => {
    const hallazgos = [
      hallazgo({}),
      hallazgo({ severidad: "critica" }),
      hallazgo({ tag: "MA-TP-012", area: "Mauro", severidad: "alta" }),
      hallazgo({ tag: "MA-TP-012", area: "Mauro", gestion: "con_aviso" }),
    ];
    const p = calcularPanel({ abiertas: [], recientes: [], hallazgos, rol: "supervisor", ahora });
    expect(p.hallazgosPendientes).toBe(3);
    expect(p.hallazgosGestionados).toBe(1);
    expect(p.pendientesPorSeveridad).toEqual({ critica: 1, alta: 1, media: 1, baja: 0 });
    expect(p.equiposPendientes.map((e) => [e.tag, e.hallazgos, e.severidadMax])).toEqual([
      ["740-XF-001", 2, "critica"],
      ["MA-TP-012", 1, "alta"],
    ]);
    expect(p.horasHastaAprobar).toBeNull();
  });
});

describe("textos del panel", () => {
  it("escribe la duración en la unidad que se lee mejor", () => {
    expect(textoDuracion(0.5)).toBe("30 min");
    expect(textoDuracion(5.4)).toBe("5 h");
    expect(textoDuracion(60)).toBe("2,5 días");
  });
  it("elige un tope redondo para el eje", () => {
    expect([0, 3, 7, 12, 37, 80, 130].map(topeEje)).toEqual([4, 4, 10, 20, 40, 100, 200]);
  });
});

describe("período y filtros del panel", () => {
  it("lee el filtro de la URL y descarta lo inválido", () => {
    expect(parseFiltroPanel({})).toEqual({ dias: 30, turno: "", zona: "" });
    expect(parseFiltroPanel({ dias: "7", turno: "B", zona: "puerto-mauro" })).toEqual({ dias: 7, turno: "B", zona: "puerto-mauro" });
    expect(parseFiltroPanel({ dias: "45", turno: "C", zona: "luna" })).toEqual({ dias: 30, turno: "", zona: "" });
    expect(parseFiltroPanel({ dias: ["90", "7"] }).dias).toBe(90);
  });

  it("la URL solo lleva lo que se aparta del valor por defecto", () => {
    expect(queryFiltroPanel({ dias: 30, turno: "", zona: "" })).toBe("");
    expect(queryFiltroPanel({ dias: 90, turno: "A", zona: "chacay-mina" })).toBe("dias=90&turno=A&zona=chacay-mina");
  });

  it("filtra por turno y por zona (Chacay y Mina van juntas)", () => {
    const filas = [fila({ id: "1" }), fila({ id: "2", turno: "B", area: "Mauro" }), fila({ id: "3", area: "Mina", turno: null })];
    expect(filtrarPorTurnoZona(filas, { turno: "", zona: "" })).toBe(filas);
    expect(filtrarPorTurnoZona(filas, { turno: "A", zona: "" }).map((f) => f.id)).toEqual(["1"]);
    expect(filtrarPorTurnoZona(filas, { turno: "", zona: "chacay-mina" }).map((f) => f.id)).toEqual(["1", "3"]);
    expect(filtrarPorTurnoZona(filas, { turno: "B", zona: "chacay-mina" })).toEqual([]);
    expect(filtrarPorTurnoZona([hallazgo({ turno: "B" }), hallazgo({ turno: "A" })], { turno: "B", zona: "" })).toHaveLength(1);
  });

  it("con 7 días la serie es de 7, pero la comparación con la semana previa se mantiene", () => {
    const recientes = [
      fila({ id: "a", submittedAt: "2026-11-10T13:00:00Z" }),
      fila({ id: "b", submittedAt: "2026-11-05T13:00:00Z", status: "approved", reviewedAt: "2026-11-05T15:00:00Z" }),
      fila({ id: "c", submittedAt: "2026-11-01T13:00:00Z", status: "approved", reviewedAt: "2026-11-01T15:00:00Z" }),
      fila({ id: "d", submittedAt: "2026-10-20T13:00:00Z" }),
    ];
    const p = calcularPanel({ abiertas: [], recientes, hallazgos: [], rol: "supervisor", ahora, dias: 7 });
    expect(p.serie).toHaveLength(7);
    expect(p.serie[0].dia).toBe("2026-11-04");
    expect(p).toMatchObject({ recibidas: 2, aprobadas: 1, recibidas7: 2, recibidas7Previas: 1 });
    expect(p.ultimos14).toHaveLength(14);
    expect(p.ultimos14.reduce((a, b) => a + b, 0)).toBe(3);
    const p90 = calcularPanel({ abiertas: [], recientes, hallazgos: [], rol: "supervisor", ahora, dias: 90 });
    expect(p90.serie).toHaveLength(90);
    expect(p90).toMatchObject({ recibidas: 4, aprobadas: 2, recibidas7: 2, recibidas7Previas: 1 });
  });
});
