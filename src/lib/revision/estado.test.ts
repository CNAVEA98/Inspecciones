import { describe, expect, it } from "vitest";
import { estadosDelFiltro, etapaPendiente, parseFiltro } from "./estado";

describe("etapaPendiente", () => {
  it("el supervisor firma solo lo recién enviado", () => {
    expect(etapaPendiente("submitted", "supervisor")).toBe("supervisor");
    expect(etapaPendiente("supervisor_signed", "supervisor")).toBeNull();
  });

  it("el planificador firma solo lo ya firmado por el supervisor", () => {
    expect(etapaPendiente("supervisor_signed", "planner")).toBe("planner");
    expect(etapaPendiente("submitted", "planner")).toBeNull();
  });

  it("el administrador nunca firma y los estados finales no se firman", () => {
    expect(etapaPendiente("submitted", "admin")).toBeNull();
    expect(etapaPendiente("approved", "supervisor")).toBeNull();
    expect(etapaPendiente("rejected", "planner")).toBeNull();
  });
});

describe("estadosDelFiltro", () => {
  it("el supervisor ve por firmar lo recién enviado", () => {
    expect(estadosDelFiltro("pendientes", "supervisor")).toEqual(["submitted"]);
  });

  it("el planificador ve por firmar lo ya firmado por el supervisor", () => {
    expect(estadosDelFiltro("pendientes", "planner")).toEqual(["supervisor_signed"]);
  });

  it("el administrador ve como pendientes las de ambas etapas", () => {
    expect(estadosDelFiltro("pendientes", "admin")).toEqual(["submitted", "supervisor_signed"]);
  });

  it("«todas» no incluye borradores", () => {
    expect(estadosDelFiltro("todas", "supervisor")).not.toContain("draft");
  });
});

describe("parseFiltro", () => {
  it("acepta un filtro válido", () => {
    expect(parseFiltro("aprobadas")).toBe("aprobadas");
  });

  it("vuelve a «pendientes» ante valores desconocidos o ausentes", () => {
    expect(parseFiltro("x")).toBe("pendientes");
    expect(parseFiltro(undefined)).toBe("pendientes");
  });
});
