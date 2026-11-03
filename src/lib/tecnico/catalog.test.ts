import { describe, expect, it } from "vitest";
import { mensajeSinCatalogo } from "./catalog";

describe("mensajeSinCatalogo", () => {
  it("sin red pide conectarse", () => {
    expect(mensajeSinCatalogo(false, null)).toMatch(/Conéctese a internet/);
  });

  it("con red y error del servidor muestra el error real y no pide conectarse", () => {
    const err = { message: 'relation "public.formatos" does not exist', code: "42P01" };
    const m = mensajeSinCatalogo(true, err);
    expect(m).toContain("El servidor no entregó el catálogo");
    expect(m).toContain('relation "public.formatos" does not exist (42P01)');
    expect(m).not.toMatch(/Conéctese/);
  });

  it("con red aparente pero fetch caído (TypeError) pide conectarse", () => {
    expect(mensajeSinCatalogo(true, new TypeError("Failed to fetch"))).toMatch(/Conéctese a internet/);
  });

  it("error sin mensaje no rompe", () => {
    expect(mensajeSinCatalogo(true, {})).toContain("error desconocido");
  });
});
