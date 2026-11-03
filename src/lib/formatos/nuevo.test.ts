import { describe, expect, it } from "vitest";
import { aPayloadBD, idFormato, leerDesignadores, nuevoFormatoSchema, siguienteNumero } from "./nuevo";
import { formatosDeLaMigracion } from "./semilla";

const valido = {
  tipo: "INSP" as const,
  numero: 42,
  titulo: "  Transformador seco  ",
  familia: "F3" as const,
  areas: ["mina" as const],
  designadores: ["XF"],
  campo: "tag" as const,
  variosEquipos: false,
  norma: "EST-ELEC-MLP-Bbosch-42",
  revision: "Noviembre 2026",
  origen: "copia" as const,
  copiarDe: "INSP-12",
};

describe("nuevo formato", () => {
  it("arma el id con dos dígitos como mínimo", () => {
    expect(idFormato("INSP", 7)).toBe("INSP-07");
    expect(idFormato("MANT", 21)).toBe("MANT-21");
    expect(idFormato("INSP", 105)).toBe("INSP-105");
  });

  it("propone el número siguiente al mayor de su tipo (no rellena huecos)", () => {
    const f = formatosDeLaMigracion();
    expect(siguienteNumero(f, "INSP")).toBe(42);
    expect(siguienteNumero(f, "MANT")).toBe(21);
    expect(siguienteNumero([], "INSP")).toBe(1);
  });

  it("lee designadores en mayúsculas, sin repetidos ni vacíos", () => {
    expect(leerDesignadores(" xf, Sw ;GG  xf ")).toEqual(["XF", "SW", "GG"]);
    expect(leerDesignadores("   ")).toEqual([]);
  });

  it("acepta un formulario válido y recorta los textos", () => {
    const r = nuevoFormatoSchema.safeParse(valido);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.titulo).toBe("Transformador seco");
      expect(aPayloadBD(r.data)).toMatchObject({ id: "INSP-42", copiar_de: "INSP-12", varios_equipos: false, areas: ["mina"] });
    }
  });

  it("rechaza copiar un formato de otro tipo", () => {
    const r = nuevoFormatoSchema.safeParse({ ...valido, copiarDe: "MANT-03" });
    expect(r.success).toBe(false);
  });

  it("rechaza datos incompletos o inválidos", () => {
    for (const malo of [{ titulo: " a " }, { norma: "" }, { revision: "" }, { numero: 0 }, { designadores: ["X1"] }, { areas: ["luna"] }, { familia: "F9" }]) {
      expect(nuevoFormatoSchema.safeParse({ ...valido, ...malo }).success).toBe(false);
    }
  });
});
