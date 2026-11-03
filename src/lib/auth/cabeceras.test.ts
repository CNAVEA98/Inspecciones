import { describe, expect, it } from "vitest";
import { CABECERAS_SESION, escribirCabeceras, leerCabeceras, limpiarCabeceras } from "./cabeceras";

const ID = "e973cbf2-1983-49cc-99e9-1f2c83c32cbd";
const identidad = { id: ID, email: "tecnico_a@mlp.local", fullName: "Técnico Ñandú A", role: "technician" as const, shift: "A" as const };

describe("cabeceras de sesión del proxy", () => {
  it("ida y vuelta con tildes y ñ", () => {
    const h = new Headers();
    escribirCabeceras(h, identidad);
    expect(leerCabeceras(h)).toEqual(identidad);
  });

  it("sin turno (administrador)", () => {
    const h = new Headers();
    escribirCabeceras(h, { ...identidad, role: "admin", shift: null });
    expect(leerCabeceras(h)).toMatchObject({ role: "admin", shift: null });
  });

  it("limpiar borra todo lo que traiga el cliente", () => {
    const h = new Headers({ [CABECERAS_SESION.id]: ID, [CABECERAS_SESION.rol]: "admin", otra: "x" });
    limpiarCabeceras(h);
    expect(leerCabeceras(h)).toBeNull();
    for (const n of Object.values(CABECERAS_SESION)) expect(h.has(n)).toBe(false);
    expect(h.get("otra")).toBe("x");
  });

  it("rechaza valores inválidos (no se confía: se vuelve a consultar)", () => {
    const base = () => {
      const h = new Headers();
      escribirCabeceras(h, identidad);
      return h;
    };
    const casos: [string, string][] = [
      [CABECERAS_SESION.id, "no-es-uuid"],
      [CABECERAS_SESION.rol, "superusuario"],
      [CABECERAS_SESION.turno, "C"],
      [CABECERAS_SESION.nombre, "%E0%A4%A"],
    ];
    for (const [k, v] of casos) {
      const h = base();
      h.set(k, v);
      expect(leerCabeceras(h)).toBeNull();
    }
    const sinRol = base();
    sinRol.delete(CABECERAS_SESION.rol);
    expect(leerCabeceras(sinRol)).toBeNull();
  });
});
