import { describe, expect, it } from "vitest";
import { contentDisposition, nombrePdf } from "./nombre-archivo";

describe("nombre del PDF", () => {
  it("usa el título, el TAG y la fecha de envío en horario de Chile", () => {
    const n = nombrePdf({ titulo: "Inspección Banco de condensadores Mauro", equipmentTag: "320-XC-001", fecha: "2026-10-31T23:30:00Z" });
    expect(n).toBe("Inspección Banco de condensadores Mauro - 320-XC-001 - 2026-10-31.pdf");
  });

  it("quita los caracteres que un archivo no admite y no deja partes vacías", () => {
    expect(nombrePdf({ titulo: 'Mantención: sala 1/12 "norte"', equipmentTag: "", fecha: "2026-01-05T15:00:00Z" })).toBe(
      "Mantención sala 1 12 norte - 2026-01-05.pdf",
    );
    expect(nombrePdf({ titulo: "", equipmentTag: "", fecha: null })).toBe("Informe.pdf");
  });

  it("Content-Disposition lleva una versión sin tildes y la completa en UTF-8", () => {
    const h = contentDisposition("Inspección Línea - 2026-10-31.pdf");
    expect(h).toContain('filename="Inspeccion Linea - 2026-10-31.pdf"');
    expect(h).toContain("filename*=UTF-8''Inspecci%C3%B3n%20L%C3%ADnea%20-%202026-10-31.pdf");
  });
});
