import { describe, expect, it } from "vitest";
import { fechaIso, inicioDiaChile, serieExcelChile, sumarDias } from "./fecha";

describe("fechas de Chile", () => {
  it("suma días cruzando meses y años", () => {
    expect(sumarDias("2026-11-10", -29)).toBe("2026-10-12");
    expect(sumarDias("2026-12-31", 1)).toBe("2027-01-01");
    expect(sumarDias("2028-02-28", 1)).toBe("2028-02-29");
  });

  it("encuentra el primer instante del día en horario de verano y de invierno", () => {
    expect(inicioDiaChile("2026-11-10").toISOString()).toBe("2026-11-10T03:00:00.000Z");
    expect(inicioDiaChile("2026-06-15").toISOString()).toBe("2026-06-15T04:00:00.000Z");
  });

  it("el día siempre empieza donde termina el anterior, también en los cambios de hora", () => {
    for (const dia of ["2026-04-04", "2026-04-05", "2026-04-06", "2026-09-05", "2026-09-06", "2026-09-07"]) {
      const inicio = inicioDiaChile(dia).getTime();
      expect(fechaIso(inicio)).toBe(dia);
      expect(fechaIso(inicio - 1)).toBe(sumarDias(dia, -1));
    }
  });

  it("convierte a número de serie de Excel con la hora de Chile", () => {
    // 2026-01-01 00:00 en Chile (UTC-3) = día 46023.
    expect(serieExcelChile("2026-01-01T03:00:00Z")).toBe(46023);
    expect(serieExcelChile("2026-06-15T16:00:00Z")).toBe(46188 + 0.5);
  });
});
