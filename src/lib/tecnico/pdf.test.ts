import { describe, expect, it } from "vitest";
import { contentDisposition } from "@/lib/informe/nombre-archivo";
import { esIos, nombreDesdeDisposition } from "./pdf";

describe("nombreDesdeDisposition", () => {
  it("recupera el nombre con tildes que arma el servidor", () => {
    const nombre = "Inspección Transformadores de Piso - 320-XF-012 - 2026-11-03.pdf";
    expect(nombreDesdeDisposition(contentDisposition(nombre))).toBe(nombre);
  });

  it("usa el nombre simple si no hay filename*", () => {
    expect(nombreDesdeDisposition('attachment; filename="Informe 1.pdf"')).toBe("Informe 1.pdf");
  });

  it("sin cabecera usa el nombre por defecto", () => {
    expect(nombreDesdeDisposition(null)).toBe("Informe.pdf");
  });

  it("con filename* mal codificado cae al simple", () => {
    expect(nombreDesdeDisposition("attachment; filename=\"a.pdf\"; filename*=UTF-8''%E0%A4%A")).toBe("a.pdf");
  });
});

describe("esIos", () => {
  it("detecta iPhone", () => {
    expect(esIos("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)", "iPhone", 5)).toBe(true);
  });
  it("detecta iPad que se presenta como Mac", () => {
    expect(esIos("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", "MacIntel", 5)).toBe(true);
  });
  it("Android y Mac de escritorio no son iOS", () => {
    expect(esIos("Mozilla/5.0 (Linux; Android 14)", "Linux armv8l", 5)).toBe(false);
    expect(esIos("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", "MacIntel", 0)).toBe(false);
  });
});
