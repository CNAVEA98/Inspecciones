import { describe, expect, it } from "vitest";
import { nombreDeContentDisposition, nombreSeguro } from "./archivo";

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

describe("nombreDeContentDisposition", () => {
  it("prefiere el nombre UTF-8 con tildes", () => {
    const h = `attachment; filename="Inspeccion Switchgear - 430-SG-431.pdf"; filename*=UTF-8''Inspecci%C3%B3n%20Switchgear%20-%20430-SG-431.pdf`;
    expect(nombreDeContentDisposition(h)).toBe("Inspección Switchgear - 430-SG-431.pdf");
  });
  it("usa el nombre simple si no hay UTF-8", () => {
    expect(nombreDeContentDisposition('attachment; filename="informe.pdf"')).toBe("informe.pdf");
    expect(nombreDeContentDisposition("attachment; filename=informe.pdf")).toBe("informe.pdf");
  });
  it("devuelve null sin cabecera o sin nombre", () => {
    expect(nombreDeContentDisposition(null)).toBeNull();
    expect(nombreDeContentDisposition("attachment")).toBeNull();
  });
  it("un UTF-8 mal codificado cae al nombre simple", () => {
    expect(nombreDeContentDisposition(`attachment; filename="a.pdf"; filename*=UTF-8''%E0%A4%A`)).toBe("a.pdf");
  });
});
