import { describe, expect, it } from "vitest";
import { homeFor, roleOfPath, roleWithShift, safeNext } from "./roles";

describe("roles", () => {
  it("cada rol tiene su área de inicio", () => {
    expect(homeFor("admin")).toBe("/admin");
    expect(homeFor("supervisor")).toBe("/supervisor");
    expect(homeFor("planner")).toBe("/planificador");
    expect(homeFor("technician")).toBe("/tecnico");
  });

  it("identifica el rol dueño de una ruta", () => {
    expect(roleOfPath("/admin/usuarios")).toBe("admin");
    expect(roleOfPath("/planificador")).toBe("planner");
    expect(roleOfPath("/tecnico/inspeccion/1")).toBe("technician");
    expect(roleOfPath("/supervisor")).toBe("supervisor");
    expect(roleOfPath("/login")).toBeNull();
  });

  it("no confunde prefijos parecidos", () => {
    expect(roleOfPath("/administrador")).toBeNull();
    expect(roleOfPath("/tecnicos")).toBeNull();
  });

  it("safeNext solo acepta rutas internas de áreas protegidas", () => {
    expect(safeNext("/planificador/bandeja")).toBe("/planificador/bandeja");
    expect(safeNext("//evil.com")).toBeNull();
    expect(safeNext("https://evil.com")).toBeNull();
    expect(safeNext("/login")).toBeNull();
    expect(safeNext(null)).toBeNull();
  });

  it("muestra el turno solo cuando existe", () => {
    expect(roleWithShift("supervisor", "B")).toBe("Supervisor · Turno B");
    expect(roleWithShift("admin", null)).toBe("Administrador");
  });
});
