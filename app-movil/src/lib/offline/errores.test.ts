import { describe, expect, it } from "vitest";
import { aTransportError, esErrorDeRed, mensajeEnvioFallido } from "./errores";

describe("clasificación de errores de transporte", () => {
  it("reconoce fallos de conectividad", () => {
    expect(esErrorDeRed(new TypeError("Network request failed"))).toBe(true);
    expect(esErrorDeRed({ message: "TypeError: Network request failed", code: "" })).toBe(true);
    expect(esErrorDeRed({ message: "Failed to fetch", status: 0 })).toBe(true);
    expect(esErrorDeRed({ message: "The request timed out." })).toBe(true);
  });

  it("una respuesta del servidor no es un fallo de red", () => {
    expect(esErrorDeRed({ message: "permission denied", code: "42501" })).toBe(false);
    expect(esErrorDeRed({ message: "Bad Gateway", status: 502 })).toBe(false);
    expect(esErrorDeRed("texto")).toBe(false);
    expect(esErrorDeRed(null)).toBe(false);
  });

  it("los fallos de red se reintentan sin consumir intentos", () => {
    const e = aTransportError(new TypeError("Network request failed"));
    expect(e.retryable).toBe(true);
    expect(e.sinRed).toBe(true);
  });

  it("los errores permanentes del servidor no se reintentan", () => {
    for (const code of ["42501", "22P02", "23505", "P0001"]) {
      const e = aTransportError({ message: "x", code });
      expect(e.retryable, code).toBe(false);
      expect(e.sinRed).toBe(false);
    }
  });

  it("otros errores del servidor sí se reintentan, contando el intento", () => {
    const e = aTransportError({ message: "upstream error", code: "XX000" });
    expect(e.retryable).toBe(true);
    expect(e.sinRed).toBe(false);
  });
});

describe("mensajeEnvioFallido", () => {
  it("explica la corrección duplicada (otra copia ya llegó, p. ej. desde otro teléfono)", () => {
    expect(mensajeEnvioFallido("CORRECCION_DUPLICADA: INS-2026-000034 ya fue corregida con el folio INS-2026-000036")).toBe(
      "No se envió: INS-2026-000034 ya fue corregida con el folio INS-2026-000036 (puede haber sido desde otro teléfono con la misma cuenta). Puede eliminar esta copia.",
    );
    expect(mensajeEnvioFallido('duplicate key value violates unique constraint "inspections_corrects_id_key"')).toMatch(/ya fue corregida/);
    expect(mensajeEnvioFallido("CORRECCION_INVALIDA: INS-2026-000001 no está rechazada")).toMatch(/no está rechazada/);
    expect(mensajeEnvioFallido("otro")).toBe("No se pudo enviar: otro");
  });
});
