import { describe, expect, it } from "vitest";
import { filtrarEquipos, normalizar, seleccionDe, sectoresDe, type Equipo } from "./tags";

const eq = (o: Partial<Equipo> & Pick<Equipo, "tag">): Equipo => ({
  tagFuente: null,
  datos: null,
  nota: null,
  nombre: "Equipo",
  instalacion: "Instalación",
  zona: "Zona",
  tipoEquipo: "Transformador",
  descripcion: null,
  designador: "XF",
  area: "mina",
  sector: null,
  estado: "oficial",
  tagOriginal: null,
  tipoTrafo: null,
  ...o,
});

const TODOS = [
  eq({ tag: "740-XF-001", area: "mina", nombre: "Transformador Parrón PM3", sector: "Parrones" }),
  eq({ tag: "740XF002", area: "mina", estado: "propuesto" }),
  eq({ tag: "320ML001XF4", area: "chacay", sector: "Planta" }),
  eq({ tag: "740SG001 / CUB-52-10", designador: "SG", area: "mina" }),
  eq({ tag: "52-E1", designador: null, area: "mauro" }),
];
const base = { designadores: ["XF"], area: "mina" as const, todasAreas: false, sector: null, texto: "" };

describe("selector de TAG", () => {
  it("normaliza TAG escritos distinto", () => {
    expect(normalizar("740-XF-001")).toBe(normalizar("740 xf 001"));
    expect(normalizar("Parrón")).toBe("parron");
  });

  it("filtra por designador y por el área elegida", () => {
    expect(filtrarEquipos(TODOS, base).map((e) => e.tag)).toEqual(["740-XF-001", "740XF002"]);
  });

  it("«Ver todas las áreas» suma los equipos de otras zonas", () => {
    expect(filtrarEquipos(TODOS, { ...base, todasAreas: true }).map((e) => e.tag)).toContain("320ML001XF4");
  });

  it("encuentra un equipo por el TAG normalizado o por el del Maestro", () => {
    const e = [eq({ tag: "740-XF-005", tagFuente: "740XF005" })];
    expect(filtrarEquipos(e, { ...base, area: "mina", texto: "740XF005" })).toHaveLength(1);
    expect(filtrarEquipos(e, { ...base, area: "mina", texto: "740-xf-005" })).toHaveLength(1);
  });

  it("busca por texto parcial sin importar guiones ni tildes", () => {
    expect(filtrarEquipos(TODOS, { ...base, texto: "740xf001" }).map((e) => e.tag)).toEqual(["740-XF-001"]);
    expect(filtrarEquipos(TODOS, { ...base, texto: "parron pm3" })).toHaveLength(1);
  });

  it("filtra por sector", () => {
    expect(filtrarEquipos(TODOS, { ...base, todasAreas: true, sector: "Planta" }).map((e) => e.tag)).toEqual(["320ML001XF4"]);
    expect(sectoresDe(filtrarEquipos(TODOS, { ...base, todasAreas: true })).map((s) => s.sector)).toEqual(["Parrones", "Planta"]);
  });

  it("sin designadores muestra todos los equipos del área (formatos de tramo)", () => {
    expect(filtrarEquipos(TODOS, { ...base, designadores: [], area: "mauro" }).map((e) => e.tag)).toEqual(["52-E1"]);
  });

  it("guarda el TAG original solo en los reasignados", () => {
    const r = eq({ tag: "120-BS-001", estado: "reasignado", tagOriginal: "120-SG-162" });
    expect(seleccionDe(r)).toEqual({ tag: "120-BS-001", estado: "reasignado", tagOriginal: "120-SG-162" });
    expect(seleccionDe(TODOS[1])).toEqual({ tag: "740XF002", estado: "propuesto" });
  });
});

import { conExtras, conTag, extrasDe, seleccionDeCabecera } from "./tags";

describe("cabecera del registro", () => {
  it("guarda y recupera el estado del TAG sin perder otros campos", () => {
    const h = conTag({ fecha: "2026-10-30", formato: "INSP-12" }, { tag: "120-BS-001", estado: "reasignado", tagOriginal: "120-SG-162" });
    expect(h).toMatchObject({ fecha: "2026-10-30", tag: "120-BS-001", tag_estado: "reasignado", tag_original: "120-SG-162" });
    expect(seleccionDeCabecera(h)).toEqual({ tag: "120-BS-001", estado: "reasignado", tagOriginal: "120-SG-162" });
  });

  it("al cambiar de TAG limpia el estado y el original anteriores", () => {
    const h = conTag(conTag({}, { tag: "A", estado: "reasignado", tagOriginal: "X" }), { tag: "B", estado: "oficial" });
    expect(h.tag_original).toBeUndefined();
    expect(h.tag_estado).toBe("oficial");
  });

  it("un registro anterior (solo `tag`) se lee como oficial", () => {
    expect(seleccionDeCabecera({ tag: "740-XF-001" })).toEqual({ tag: "740-XF-001", estado: "oficial" });
    expect(seleccionDeCabecera({ tag: " " })).toBeNull();
  });

  it("guarda varios equipos y tolera JSON dañado", () => {
    const h = conExtras({ tag: "A" }, [{ tag: "B", estado: "oficial" }]);
    expect(extrasDe(h)).toEqual([{ tag: "B", estado: "oficial" }]);
    expect(extrasDe({ equipos_extra: "{no" })).toEqual([]);
    expect(conExtras(h, []).equipos_extra).toBeUndefined();
  });
});
