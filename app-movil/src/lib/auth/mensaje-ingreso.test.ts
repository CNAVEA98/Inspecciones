import { describe, expect, it } from "vitest";
import { MENSAJE_INGRESO_SIN_SENAL, mensajeErrorIngreso } from "./mensaje-ingreso";

describe("mensajeErrorIngreso", () => {
  it("sin señal no dice «contraseña incorrecta» (la app aún no sabía que no había red)", () => {
    expect(mensajeErrorIngreso({ name: "AuthRetryableFetchError", message: "Network request failed", status: 0 })).toBe(
      MENSAJE_INGRESO_SIN_SENAL,
    );
    expect(mensajeErrorIngreso(new TypeError("Network request failed"))).toBe(MENSAJE_INGRESO_SIN_SENAL);
    expect(mensajeErrorIngreso({ message: "Failed to fetch", status: 0 })).toBe(MENSAJE_INGRESO_SIN_SENAL);
  });

  it("credenciales malas siguen siendo «incorrectos»", () => {
    expect(mensajeErrorIngreso({ name: "AuthApiError", message: "Invalid login credentials", status: 400, code: "invalid_credentials" })).toBe(
      "Usuario o contraseña incorrectos",
    );
  });

  it("un servidor caído no culpa a la contraseña", () => {
    expect(mensajeErrorIngreso({ name: "AuthApiError", message: "upstream error", status: 503 })).toMatch(/servidor no respondió/);
  });
});
