import { describe, expect, it } from "vitest";
import { templateSchema } from "@/lib/templates/schema";
import { CABECERA_ESTANDAR, ROLES_ESTANDAR, plantillaEnBlanco } from "./estandar";
import {
  agregarCampoCabecera,
  agregarItem,
  editarCampoCabecera,
  prepararParaPublicar,
  problemasDeEdicion,
  quitarCampoCabecera,
  resumenCambios,
} from "./editor";
import { aPayloadBD, nuevoFormatoSchema } from "./nuevo";

describe("plantilla en blanco", () => {
  it("inspección: cabecera estándar, tres firmas, leyenda BN/ML… y una sección", () => {
    const t = plantillaEnBlanco("INSP", "Celdas nuevas", "EST-1", "Nov 2026");
    expect(templateSchema.safeParse(t).success).toBe(true);
    expect(t.header.map((h) => h.key)).toEqual(["tag", "ot", "ubicacion", "fecha", "h_inicio", "h_fin"]);
    expect(t.roles).toEqual(ROLES_ESTANDAR);
    expect(t.estados).toBeUndefined();
    expect(t.nomenclature).toContain("BN: Bueno");
    expect(t.meta).toEqual({ norma: "EST-1", revision: "Nov 2026", titulo: "Celdas nuevas" });
    expect(t.sections).toHaveLength(1);
  });

  it("mantención: estados RL/NR/BN/ML/RMP/NT", () => {
    const t = plantillaEnBlanco("MANT", "Mant nueva", "EST-2", "Nov 2026");
    expect(t.estados).toEqual(["RL", "NR", "BN", "ML", "RMP", "NT"]);
    expect(t.nomenclature).toContain("RL: REALIZADO");
  });

  it("se arma pregunta a pregunta y se puede publicar", () => {
    let t = plantillaEnBlanco("INSP", "X", "EST", "Rev 1");
    t = agregarItem(t, "seccion_1", "verificacion", "¿Estado de la carcasa?");
    t = agregarItem(t, "seccion_1", "number", "Temperatura");
    expect(prepararParaPublicar(t).ok).toBe(true);
  });
});

describe("cabecera en el editor", () => {
  const base = () => plantillaEnBlanco("INSP", "X", "EST", "Rev 1");

  it("agrega campos extra con clave propia, sin chocar con las estándar", () => {
    let t = agregarCampoCabecera(base(), "Marca", "text");
    t = agregarCampoCabecera(t, "Marca", "text");
    t = agregarCampoCabecera(t, "Fecha", "date");
    const extra = t.header.slice(CABECERA_ESTANDAR.length);
    expect(extra.map((h) => h.key)).toEqual(["marca", "marca_2", "fecha_2"]);
    expect(extra.every((h) => h.required === false)).toBe(true);
    expect(prepararParaPublicar(t).ok).toBe(true);
    expect(problemasDeEdicion(base(), t)).toEqual([]);
  });

  it("edita y quita solo los extra; los estándar no cambian", () => {
    let t = agregarCampoCabecera(base(), "Serie", "text");
    t = editarCampoCabecera(t, "serie", { label: "N° de serie", required: true });
    expect(t.header.at(-1)).toMatchObject({ key: "serie", label: "N° de serie", required: true });
    expect(editarCampoCabecera(t, "ot", { label: "Otra" })).toBe(t);
    expect(quitarCampoCabecera(t, "tag")).toBe(t);
    expect(quitarCampoCabecera(t, "serie").header).toHaveLength(CABECERA_ESTANDAR.length);
  });

  it("el servidor rechaza tocar un campo estándar o cambiar el tipo de uno extra", () => {
    const b = agregarCampoCabecera(base(), "Potencia", "number");
    expect(problemasDeEdicion(b, { ...b, header: b.header.filter((h) => h.key !== "ot") })).not.toEqual([]);
    expect(problemasDeEdicion(b, { ...b, header: b.header.map((h) => (h.key === "tag" ? { ...h, label: "Equipo" } : h)) })).not.toEqual([]);
    expect(problemasDeEdicion(b, { ...b, header: b.header.map((h) => (h.key === "potencia" ? { ...h, input: "text" as const } : h)) })).not.toEqual([]);
    expect(problemasDeEdicion(b, quitarCampoCabecera(b, "potencia"))).toEqual([]);
  });

  it("el resumen describe los cambios de cabecera", () => {
    const b = agregarCampoCabecera(base(), "Marca", "text");
    let t = agregarCampoCabecera(b, "Modelo", "text");
    t = editarCampoCabecera(t, "marca", { label: "Fabricante" });
    const tipos = resumenCambios(b, quitarCampoCabecera(t, "modelo")).map((c) => c.tipo);
    expect(tipos).toEqual(["campo-editado"]);
    expect(resumenCambios(b, t).map((c) => c.tipo).sort()).toEqual(["campo-editado", "campo-nuevo"]);
    expect(resumenCambios(t, b).map((c) => c.tipo)).toContain("campo-quitado");
  });
});

describe("nuevo formato en blanco", () => {
  const v = { tipo: "MANT", numero: 21, titulo: "Mant nueva", familia: "F7", areas: [], designadores: [], campo: "tag", variosEquipos: false, norma: "EST-21", revision: "Nov 2026" };
  it("en blanco no pide formato de origen y manda la plantilla estándar", () => {
    const r = nuevoFormatoSchema.safeParse({ ...v, origen: "blanco" });
    expect(r.success).toBe(true);
    if (r.success) {
      const p = aPayloadBD(r.data);
      expect(p.copiar_de).toBeNull();
      expect("schema" in p && p.schema.estados).toEqual(["RL", "NR", "BN", "ML", "RMP", "NT"]);
    }
  });
  it("copia sin origen o de otro tipo se rechaza", () => {
    expect(nuevoFormatoSchema.safeParse({ ...v, origen: "copia" }).success).toBe(false);
    expect(nuevoFormatoSchema.safeParse({ ...v, origen: "copia", copiarDe: "INSP-12" }).success).toBe(false);
    expect(nuevoFormatoSchema.safeParse({ ...v, origen: "copia", copiarDe: "MANT-03" }).success).toBe(true);
  });
});
