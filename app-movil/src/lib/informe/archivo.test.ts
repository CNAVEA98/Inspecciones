import { describe, expect, it } from "vitest";
import { nombreSeguro } from "./archivo";

describe("nombreSeguro", () => {
  it("quita tildes y deja el resto del nombre", () => {
    expect(nombreSeguro("Inspección Switchgear 23 kV - 444-SG-001 - 2026-11-07.pdf")).toBe(
      "Inspeccion Switchgear 23 kV - 444-SG-001 - 2026-11-07.pdf",
    );
  });

  it("también quita las tildes ya descompuestas (como las deja iOS)", () => {
    const descompuesto = "Inspección Mantención.pdf";
    expect(nombreSeguro(descompuesto)).toBe("Inspeccion Mantencion.pdf");
  });

  it("reemplaza caracteres no permitidos y no duplica la extensión", () => {
    expect(nombreSeguro('Informe: 12/34 "prueba"?.PDF')).toBe("Informe 12 34 prueba.pdf");
  });

  it("usa un nombre por defecto si no queda nada", () => {
    expect(nombreSeguro("???")).toBe("Informe.pdf");
    expect(nombreSeguro("")).toBe("Informe.pdf");
  });

  it("acorta nombres muy largos", () => {
    expect(nombreSeguro("a".repeat(300)).length).toBeLessThanOrEqual(124);
  });
});
