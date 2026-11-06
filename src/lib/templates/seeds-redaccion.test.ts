import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const leer = (f: string) => readFileSync(path.resolve(__dirname, "../../../supabase", f), "utf8");
const mant = leer("seed_plantillas_mant.sql");
const insp = leer("seed_plantillas_insp.sql") + leer("seed_plantillas_insp_16_41.sql");

describe("redacción de las plantillas (revisión de PDF 2026-11-06)", () => {
  it("no quedan las erratas ya corregidas", () => {
    const todo = mant + insp;
    for (const errata of ["Condictiones", "Procedimineto", "intrumentos", "Señaletica", "Perdidas", "Aumbrado", "chisporoteo", "oxido", "transformadora de piso", "trip OTIA", "trip WTIA"]) {
      expect(todo.includes(errata), errata).toBe(false);
    }
  });

  it("MANT-05 pregunta por la ausencia de óxido (SI = conforme)", () => {
    expect(mant).toContain("Verificar ausencia de óxido");
  });

  it("MANT-13: las unidades resistivas de la sección 740HF003 llevan el TAG 740HF003", () => {
    const ini = mant.indexOf('"title": "Filtro de Armónicos 740HF003"');
    const fin = mant.indexOf('"meta"', ini);
    const seccion = mant.slice(ini, fin);
    expect(seccion).toContain("740HF003-1-RD-A");
    expect(seccion).not.toContain("740HF001");
    expect(seccion).not.toContain("740HF002");
  });

  it("los ordinales de sintonía no quedan en inglés ni abreviados", () => {
    expect(mant).not.toMatch(/\d+(?:ta|na|th|va|ma|ra) Sintonía/);
  });
});
