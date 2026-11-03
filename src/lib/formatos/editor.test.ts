import { describe, expect, it } from "vitest";
import { templateSchema, type FormTemplateSchema } from "@/lib/templates/schema";
import {
  agregarItem,
  agregarSeccion,
  editarItem,
  idsEnUso,
  itemsEnLecturas,
  moverItem,
  moverSeccion,
  notaSugerida,
  prepararParaPublicar,
  problemasDeEdicion,
  quitarItem,
  quitarSeccion,
  renombrarSeccion,
  resumenCambios,
  slugId,
  totalItems,
} from "./editor";

const base = (): FormTemplateSchema =>
  templateSchema.parse({
    title: "Formato de prueba",
    meta: { norma: "EST-1", revision: "Abril 2024", titulo: "Prueba" },
    header: [{ key: "tag", label: "TAG" }],
    roles: ["Encargado de la actividad"],
    readings: [{ label: "Temperatura", item: "temp", limit: 65 }],
    sections: [
      {
        id: "general",
        title: "General",
        items: [
          { id: "limpieza", type: "verificacion", label: "Limpieza" },
          { id: "temp", type: "verificacion", label: "Temperatura", unit: "°C", min: 0, max: 120 },
          { id: "placa", type: "nameplate", label: "Placa", fields: [{ key: "serie", label: "N° de serie" }] },
        ],
      },
      {
        id: "estructuras",
        title: "Estructuras",
        repetible: true,
        items: [{ id: "poste", type: "text", label: "Poste", required: true, multiline: false }],
      },
    ],
  });

describe("slugId", () => {
  it("quita tildes y símbolos y usa snake_case", () => {
    expect(slugId("¿Está LIMPIO el área? (sí/no)", new Set())).toBe("esta_limpio_el_area_si_no");
  });
  it("evita repetidos con sufijo numérico", () => {
    expect(slugId("Limpieza", new Set(["limpieza", "limpieza_2"]))).toBe("limpieza_3");
  });
  it("empieza siempre con letra y nunca trae «__»", () => {
    expect(slugId("123 voltios", new Set())).toBe("item_123_voltios");
    expect(slugId("a __ b", new Set())).not.toContain("__");
    expect(slugId("???", new Set())).toBe("item");
  });
  it("corta a 40 caracteres", () => {
    expect(slugId("x".repeat(100), new Set()).length).toBeLessThanOrEqual(40);
  });
});

describe("operaciones", () => {
  it("renombra una sección sin tocar su id", () => {
    const t = renombrarSeccion(base(), "general", "Datos generales");
    expect(t.sections[0]).toMatchObject({ id: "general", title: "Datos generales" });
  });

  it("agrega una sección con su primer ítem, con ids únicos y válidos", () => {
    const t = agregarSeccion(base(), "Puesta a tierra", "Resistencia de tierra");
    expect(t.sections).toHaveLength(3);
    const nueva = t.sections[2];
    expect(nueva.items).toHaveLength(1);
    expect(templateSchema.safeParse(t).success).toBe(true);
    expect(new Set([...idsEnUso(t)]).size).toBe(idsEnUso(t).size);
  });

  it("agrega ítems de cada tipo y la plantilla sigue siendo válida", () => {
    let t = base();
    for (const tipo of ["verificacion", "number", "text", "photo"] as const) t = agregarItem(t, "general", tipo, `Nuevo ${tipo}`);
    expect(t.sections[0].items).toHaveLength(7);
    expect(templateSchema.safeParse(t).success).toBe(true);
  });

  it("dos ítems con el mismo texto reciben ids distintos", () => {
    const t = agregarItem(agregarItem(base(), "general", "text", "Observación"), "general", "text", "Observación");
    const ids = t.sections[0].items.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("edita el texto y el rango pero nunca el id ni el tipo", () => {
    const t = editarItem(base(), "temp", { label: "Temperatura máxima", max: 100, id: "otro", type: "text" } as never);
    const it = t.sections[0].items.find((i) => i.label === "Temperatura máxima")!;
    expect(it.id).toBe("temp");
    expect(it.type).toBe("verificacion");
    expect(it).toMatchObject({ max: 100, min: 0 });
  });

  it("mueve secciones e ítems y respeta los bordes", () => {
    expect(moverSeccion(base(), "estructuras", -1).sections.map((s) => s.id)).toEqual(["estructuras", "general"]);
    expect(moverSeccion(base(), "general", -1).sections.map((s) => s.id)).toEqual(["general", "estructuras"]);
    expect(moverItem(base(), "general", "limpieza", 1).sections[0].items.map((i) => i.id)).toEqual(["temp", "limpieza", "placa"]);
    expect(moverItem(base(), "general", "placa", 1).sections[0].items.map((i) => i.id)).toEqual(["limpieza", "temp", "placa"]);
  });

  it("no deja una sección vacía ni sin secciones", () => {
    const una = quitarSeccion(quitarSeccion(base(), "estructuras"), "general");
    expect(una.sections).toHaveLength(1);
    expect(quitarItem(base(), "estructuras", "poste").sections[1].items).toHaveLength(1);
    expect(quitarItem(base(), "general", "limpieza").sections[0].items).toHaveLength(2);
  });

  it("reconoce los ítems que alimentan lecturas", () => {
    expect([...itemsEnLecturas(base())]).toEqual(["temp"]);
  });

  it("no muta la plantilla original", () => {
    const t = base();
    const copia = JSON.stringify(t);
    renombrarSeccion(t, "general", "X");
    agregarItem(t, "general", "text", "Y");
    quitarItem(t, "general", "limpieza");
    expect(JSON.stringify(t)).toBe(copia);
  });
});

describe("prepararParaPublicar", () => {
  it("recorta textos y quita ayudas vacías", () => {
    const t = editarItem(renombrarSeccion(base(), "general", "  General  "), "limpieza", { label: "  Limpieza  ", help: "   " });
    const r = prepararParaPublicar(t);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.template.sections[0].title).toBe("General");
      expect(r.template.sections[0].items[0]).toMatchObject({ label: "Limpieza" });
      expect(r.template.sections[0].items[0].help).toBeUndefined();
    }
  });

  it("rechaza títulos o textos vacíos", () => {
    expect(prepararParaPublicar(renombrarSeccion(base(), "general", "  ")).ok).toBe(false);
    expect(prepararParaPublicar(editarItem(base(), "limpieza", { label: "" })).ok).toBe(false);
  });

  it("rechaza un ítem numérico sin unidad", () => {
    const t = agregarItem(base(), "general", "number", "Corriente");
    const id = t.sections[0].items.at(-1)!.id;
    expect(prepararParaPublicar(editarItem(t, id, { unit: "" })).ok).toBe(false);
  });

  it("rechaza quitar un ítem que alimenta una lectura (lo exige el esquema)", () => {
    expect(prepararParaPublicar(quitarItem(base(), "general", "temp")).ok).toBe(false);
  });
});

describe("problemasDeEdicion (barrera del servidor)", () => {
  it("permite editar textos, agregar y quitar ítems", () => {
    const t = quitarItem(agregarItem(editarItem(base(), "limpieza", { label: "Limpieza general" }), "general", "text", "Nota"), "general", "placa");
    expect(problemasDeEdicion(base(), t)).toEqual([]);
  });

  it("rechaza cambiar la cabecera, los roles o las lecturas", () => {
    const b = base();
    expect(problemasDeEdicion(b, { ...b, roles: [] })).not.toEqual([]);
    expect(problemasDeEdicion(b, { ...b, header: [] })).not.toEqual([]);
    expect(problemasDeEdicion(b, { ...b, readings: [] })).not.toEqual([]);
  });

  it("rechaza cambiar el tipo de un ítem existente", () => {
    const b = base();
    const t: FormTemplateSchema = { ...b, sections: b.sections.map((s) => ({ ...s, items: s.items.map((i) => (i.id === "limpieza" ? { id: "limpieza", label: "Limpieza", type: "text" as const, required: true, multiline: false } : i)) })) };
    expect(problemasDeEdicion(b, t)).toHaveLength(1);
  });

  it("rechaza cambiar si una sección es repetible y quitar un ítem de lectura", () => {
    const b = base();
    const rep: FormTemplateSchema = { ...b, sections: b.sections.map((s) => (s.id === "estructuras" ? { ...s, repetible: false } : s)) };
    expect(problemasDeEdicion(b, rep)).not.toEqual([]);
    expect(problemasDeEdicion(b, quitarItem(b, "general", "temp"))).not.toEqual([]);
  });

  it("rechaza cambiar los campos de una placa", () => {
    const b = base();
    const t: FormTemplateSchema = { ...b, sections: b.sections.map((s) => ({ ...s, items: s.items.map((i) => (i.type === "nameplate" ? { ...i, fields: [{ key: "otro", label: "Otro" }] } : i)) })) };
    expect(problemasDeEdicion(b, t)).not.toEqual([]);
  });
});

describe("resumenCambios", () => {
  it("sin cambios no devuelve nada", () => {
    expect(resumenCambios(base(), base())).toEqual([]);
  });

  it("describe cada tipo de cambio", () => {
    let t = renombrarSeccion(base(), "general", "Datos generales");
    t = editarItem(t, "limpieza", { label: "Limpieza del equipo" });
    t = agregarItem(t, "general", "text", "Nota nueva");
    t = quitarItem(t, "general", "placa");
    t = agregarSeccion(t, "Tierra", "Resistencia");
    t = moverSeccion(t, "estructuras", -1);
    const tipos = resumenCambios(base(), t).map((c) => c.tipo);
    expect(tipos).toEqual(expect.arrayContaining(["seccion-renombrada", "item-editado", "item-nuevo", "item-quitado", "seccion-nueva", "seccion-movida"]));
  });

  it("detecta un cambio de orden de ítems y de unidad", () => {
    const t = editarItem(moverItem(base(), "general", "limpieza", 1), "temp", { unit: "K" });
    const tipos = resumenCambios(base(), t).map((c) => c.tipo);
    expect(tipos).toContain("item-movido");
    expect(tipos).toContain("item-editado");
  });

  it("la nota sugerida resume y acota la lista", () => {
    let t = base();
    for (let i = 0; i < 8; i++) t = agregarItem(t, "general", "text", `Extra ${i}`);
    const nota = notaSugerida(resumenCambios(base(), t));
    expect(nota).toContain("Ítem nuevo");
    expect(nota).toContain("y 2 cambios más");
    expect(notaSugerida([])).toBe("");
    expect(totalItems(t)).toBe(12);
  });
});
