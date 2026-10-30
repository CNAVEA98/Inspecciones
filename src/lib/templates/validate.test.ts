import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { answerIssues, validateAnswer, validateTemplate } from "./validate";

const item = (over: Record<string, unknown> = {}) => ({ id: "a", type: "verificacion", label: "A", ...over });
const minimal = { title: "T", sections: [{ id: "s1", title: "S", items: [item()] }] };

function seedTemplate(): unknown {
  const sql = readFileSync(path.resolve(__dirname, "../../../supabase/seed_catalogo.sql"), "utf8");
  const match = sql.match(/\$tpl\$([\s\S]*?)\$tpl\$/);
  if (!match) throw new Error("No se encontró la plantilla en seed_catalogo.sql");
  return JSON.parse(match[1]);
}

describe("validateTemplate", () => {
  it("acepta una plantilla mínima", () => {
    expect(validateTemplate(minimal).ok).toBe(true);
  });

  it("acepta la plantilla real del seed (Transformador de piso × Plan Matriz, 29 ítems)", () => {
    const res = validateTemplate(seedTemplate());
    expect(res.ok).toBe(true);
    if (res.ok) {
      const count = res.template.sections.reduce((n, s) => n + s.items.length, 0);
      expect(count).toBe(29);
      expect(res.template.roles).toHaveLength(3);
      expect(res.template.readings.length).toBeGreaterThan(0);
    }
  });

  it("rechaza ids de ítem duplicados entre secciones", () => {
    const res = validateTemplate({
      title: "T",
      sections: [
        { id: "s1", title: "S1", items: [item()] },
        { id: "s2", title: "S2", items: [item({ type: "text" })] },
      ],
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.join(" ")).toContain("duplicado");
  });

  it("rechaza tipo de campo desconocido", () => {
    expect(validateTemplate({ title: "T", sections: [{ id: "s1", title: "S", items: [item({ type: "firma" })] }] }).ok).toBe(false);
  });

  it("rechaza número sin unidad y min > max", () => {
    expect(validateTemplate({ title: "T", sections: [{ id: "s", title: "S", items: [item({ type: "number" })] }] }).ok).toBe(false);
    expect(
      validateTemplate({ title: "T", sections: [{ id: "s", title: "S", items: [item({ type: "number", unit: "V", min: 5, max: 1 })] }] }).ok,
    ).toBe(false);
  });

  it("rechaza plantilla sin secciones o ids no snake_case", () => {
    expect(validateTemplate({ title: "T", sections: [] }).ok).toBe(false);
    expect(validateTemplate({ title: "T", sections: [{ id: "Sec 1", title: "S", items: [item()] }] }).ok).toBe(false);
  });

  it("rechaza una lectura que referencia un ítem inexistente", () => {
    const res = validateTemplate({ ...minimal, readings: [{ label: "X", item: "no_existe" }] });
    expect(res.ok).toBe(false);
  });

  it("rechaza campos de cabecera duplicados", () => {
    const res = validateTemplate({ ...minimal, header: [{ key: "tag", label: "TAG" }, { key: "tag", label: "TAG 2" }] });
    expect(res.ok).toBe(false);
  });
});

describe("validateAnswer", () => {
  const res = validateTemplate(seedTemplate());
  if (!res.ok) throw new Error("seed inválido");
  const items = Object.fromEntries(res.template.sections.flatMap((s) => s.items).map((i) => [i.id, i]));
  const foto = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";

  it("BN y NT sin extras son válidos", () => {
    expect(validateAnswer(items.item_01, { estado: "BN" })).toBe(true);
    expect(validateAnswer(items.item_11, { estado: "NT" })).toBe(true);
  });

  it("rechaza un estado fuera de la nomenclatura", () => {
    expect(validateAnswer(items.item_01, { estado: "OK" })).toBe(false);
  });

  it("ML exige observación; la foto es opcional", () => {
    expect(answerIssues(items.item_21, { estado: "ML" })).toEqual(["ML exige observación"]);
    expect(validateAnswer(items.item_21, { estado: "ML", obs: "Pintura en mal estado" })).toBe(true);
    expect(validateAnswer(items.item_21, { estado: "ML", obs: "Pintura en mal estado", fotos: [foto] })).toBe(true);
  });

  it("NR exige el motivo", () => {
    expect(validateAnswer(items.item_05, { estado: "NR" })).toBe(false);
    expect(validateAnswer(items.item_05, { estado: "NR", obs: "Equipo desenergizado" })).toBe(true);
  });

  it("el valor numérico solo se admite en ítems con unidad", () => {
    expect(validateAnswer(items.item_02, { estado: "BN", valor: 45 })).toBe(true);
    expect(validateAnswer(items.item_01, { estado: "BN", valor: 45 })).toBe(false);
  });

  it("rechaza fotos que no son UUID", () => {
    expect(validateAnswer(items.item_21, { estado: "ML", obs: "x", fotos: ["no-uuid"] })).toBe(false);
  });
});
