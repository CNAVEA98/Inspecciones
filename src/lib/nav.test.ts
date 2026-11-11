import { describe, expect, it } from "vitest";
import { pestanaActiva } from "./nav";

const nav = ["/supervisor/panel", "/supervisor", "/supervisor/fallas", "/supervisor/exportar"].map((href) => ({ href, label: href }));

describe("pestanaActiva", () => {
  it("marca la pestaña de la ruta más específica", () => {
    expect(pestanaActiva("/supervisor/panel", nav)).toBe("/supervisor/panel");
    expect(pestanaActiva("/supervisor/fallas", nav)).toBe("/supervisor/fallas");
    expect(pestanaActiva("/supervisor", nav)).toBe("/supervisor");
  });
  it("el detalle de una inspección pertenece a la bandeja", () => {
    expect(pestanaActiva("/supervisor/3f2c0a9e-0000-4000-8000-000000000001", nav)).toBe("/supervisor");
  });
  it("no marca nada fuera del área ni confunde prefijos", () => {
    expect(pestanaActiva("/privacidad", nav)).toBeNull();
    expect(pestanaActiva("/supervisores", nav)).toBeNull();
  });
});
