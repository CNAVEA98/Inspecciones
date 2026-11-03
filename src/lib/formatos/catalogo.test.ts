import { describe, expect, it } from "vitest";
import { familiasVisibles as famV, filaAFormato, formatoPorId as porId, formatosVisibles as fmtV, type CodigoArea, type CodigoFamilia, type TipoTrabajo } from "./catalogo";
import { formatosDeLaMigracion } from "./semilla";

const FORMATOS = formatosDeLaMigracion();
const formatoPorId = (id: string) => porId(FORMATOS, id);
const formatosVisibles = (a: CodigoArea, t: TipoTrabajo, f?: CodigoFamilia) => fmtV(FORMATOS, a, t, f);
const familiasVisibles = (a: CodigoArea, t: TipoTrabajo) => famV(FORMATOS, a, t);

const ids = (xs: { id: string }[]) => xs.map((x) => x.id);

describe("catálogo de formatos", () => {
  it("tiene los 60 formatos (40 INSP + 20 MANT), sin INSP-36 ni ids repetidos", () => {
    expect(FORMATOS.filter((x) => x.tipo === "INSP")).toHaveLength(40);
    expect(FORMATOS.filter((x) => x.tipo === "MANT")).toHaveLength(20);
    expect(formatoPorId("INSP-36")).toBeUndefined();
    expect(new Set(ids(FORMATOS)).size).toBe(60);
  });

  it("los 40 INSP (01 a 41, sin 36) están disponibles y cada uno apunta a su propia plantilla", () => {
    const disponibles = FORMATOS.filter((x) => x.tipo === "INSP" && x.estado === "disponible");
    expect(disponibles).toHaveLength(40);
    expect(ids(disponibles).slice(0, 3)).toEqual(["INSP-01", "INSP-02", "INSP-03"]);
    expect(ids(disponibles)).not.toContain("INSP-36");
    expect(formatoPorId("INSP-12")?.plantilla).toEqual({ tipoEquipo: "transformador_piso", modo: "plan_matriz" });
    expect(formatoPorId("INSP-05")?.plantilla).toEqual({ tipoEquipo: "reconectador", modo: "plan_matriz" });
    // La plantilla se busca por tipo de equipo × modo: no puede haber dos formatos con la misma.
    const claves = disponibles.map((x) => `${x.plantilla!.tipoEquipo}/${x.plantilla!.modo}`);
    expect(new Set(claves).size).toBe(disponibles.length);
  });

  it("Mauro → Mantención: 5 familias y 11 formatos, sin MANT-07/09 ni filtros de otras áreas", () => {
    expect(familiasVisibles("mauro", "MANT")).toEqual(["F1", "F3", "F4", "F5", "F7"]);
    expect(ids(formatosVisibles("mauro", "MANT"))).toEqual([
      "MANT-01", "MANT-02", "MANT-04", "MANT-05", "MANT-06", "MANT-10", "MANT-11", "MANT-16", "MANT-18", "MANT-19", "MANT-20",
    ]);
  });

  it("Mina → Inspección → Transformadores: INSP-06, 07 y 12", () => {
    expect(ids(formatosVisibles("mina", "INSP", "F3"))).toEqual(["INSP-06", "INSP-07", "INSP-12"]);
  });

  it("Puerto → Inspección → Switchgear y celdas MT: INSP-13, 20 y 29", () => {
    expect(ids(formatosVisibles("puerto", "INSP", "F1"))).toEqual(["INSP-13", "INSP-20", "INSP-29"]);
  });

  it("una familia sin formatos para el área y el trabajo no se muestra", () => {
    expect(familiasVisibles("mauro", "MANT")).not.toContain("F6");
    expect(familiasVisibles("valle", "INSP")).not.toContain("F6");
  });

  it("Valle solo ve formatos transversales", () => {
    expect(formatosVisibles("valle", "INSP").every((x) => x.areas.length === 0)).toBe(true);
  });

  it("los formatos con designador «—» o de tramos usan el campo de tramo", () => {
    for (const id of ["INSP-10", "INSP-11", "INSP-15", "INSP-19", "INSP-37", "INSP-38", "MANT-20"]) {
      expect(formatoPorId(id)?.campo).toBe("tramo");
    }
  });

  it("los formatos de generación permiten varios equipos", () => {
    for (const x of FORMATOS.filter((y) => y.designadores.includes("GG"))) expect(x.variosEquipos).toBe(true);
  });

  it("un formato desactivado no se ofrece, pero se sigue encontrando por id (borradores e historial)", () => {
    const sin = FORMATOS.map((x) => (x.id === "INSP-12" ? { ...x, activo: false } : x));
    expect(ids(fmtV(sin, "mina", "INSP", "F3"))).toEqual(["INSP-06", "INSP-07"]);
    expect(porId(sin, "INSP-12")?.titulo).toBe("Transformadores de Piso");
    // Si una familia queda sin formatos activos, deja de mostrarse.
    const sinF3 = FORMATOS.map((x) => (x.familia === "F3" ? { ...x, activo: false } : x));
    expect(famV(sinF3, "mina", "INSP")).not.toContain("F3");
  });
});

describe("filaAFormato", () => {
  const fila = {
    id: "INSP-99", tipo: "INSP", titulo: "Prueba", familia: "F2", areas: null, designadores: null, campo: "tramo",
    varios_equipos: true, areas_por_confirmar: false, tipo_equipo_code: null, modo_code: null, activo: true, orden: 1,
  };
  it("sin plantilla queda «próximamente» y sin campos opcionales", () => {
    const f = filaAFormato(fila);
    expect(f).toEqual({ id: "INSP-99", tipo: "INSP", titulo: "Prueba", familia: "F2", areas: [], designadores: [], campo: "tramo", variosEquipos: true, estado: "proximamente", activo: true });
  });
  it("con plantilla queda disponible y conserva «áreas por confirmar»", () => {
    const f = filaAFormato({ ...fila, campo: "otro", areas_por_confirmar: true, tipo_equipo_code: "x", modo_code: "plan_matriz" });
    expect(f).toMatchObject({ estado: "disponible", plantilla: { tipoEquipo: "x", modo: "plan_matriz" }, areasPorConfirmar: true, campo: "tag" });
  });
});
