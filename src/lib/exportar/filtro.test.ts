import { describe, expect, it } from "vitest";
import { estadosDe, filtroInicial, nombreArchivo, parseFiltroExportar, patronTag, queryExportar, zonaDelFiltro } from "./filtro";

const hoy = "2026-11-10";

describe("parseFiltroExportar", () => {
  it("sin parámetros ofrece los últimos 30 días y todo lo demás abierto", () => {
    expect(parseFiltroExportar({}, hoy)).toEqual({
      tipo: "", turno: "", area: "", equipo: "", tag: "", estado: "todas", desde: "2026-10-12", hasta: "2026-11-10",
    });
    expect(parseFiltroExportar({}, hoy)).toEqual(filtroInicial(hoy));
  });
  it("acepta los filtros válidos", () => {
    const f = parseFiltroExportar(
      { tipo: "mantencion", turno: "B", area: "zona:chacay-mina", equipo: "transformador_piso", tag: " 740-XF ", estado: "aprobadas", desde: "2026-01-01", hasta: "2026-03-31" },
      hoy,
    );
    expect(f).toEqual({
      tipo: "mantencion", turno: "B", area: "zona:chacay-mina", equipo: "transformador_piso", tag: "740-XF", estado: "aprobadas",
      desde: "2026-01-01", hasta: "2026-03-31",
    });
  });
  it("descarta lo inválido y ordena un rango invertido", () => {
    const f = parseFiltroExportar(
      { tipo: "otro", turno: "C", area: "zona:marte", equipo: "x'); drop table", estado: "borradores", desde: "2026-11-05", hasta: "2026-11-01" },
      hoy,
    );
    expect(f).toMatchObject({ tipo: "", turno: "", area: "", equipo: "", estado: "todas", desde: "2026-11-01", hasta: "2026-11-05" });
    expect(parseFiltroExportar({ desde: "ayer", hasta: "2026-13-45" }, hoy)).toMatchObject({ desde: "2026-10-12", hasta: hoy });
  });
});

describe("utilidades del filtro", () => {
  it("vuelve a la URL sin los campos vacíos, pero siempre con las fechas", () => {
    expect(queryExportar(filtroInicial(hoy))).toBe("desde=2026-10-12&hasta=2026-11-10");
    expect(queryExportar({ ...filtroInicial(hoy), turno: "A", tag: "740-XF", estado: "rechazadas" })).toBe(
      "turno=A&tag=740-XF&estado=rechazadas&desde=2026-10-12&hasta=2026-11-10",
    );
  });
  it("distingue zona de área suelta", () => {
    expect(zonaDelFiltro("zona:puerto-mauro")).toBe("puerto-mauro");
    expect(zonaDelFiltro("mauro")).toBe("");
  });
  it("busca el TAG literal", () => {
    expect(patronTag("740-XF")).toBe("%740-XF%");
    expect(patronTag("50%_a")).toBe("%50\\%\\_a%");
  });
  it("traduce el estado a los estados de la base (nunca borradores)", () => {
    expect(estadosDe("todas")).toEqual(["submitted", "supervisor_signed", "approved", "rejected"]);
    expect(estadosDe("en_revision")).toEqual(["submitted", "supervisor_signed"]);
  });
  it("nombra el archivo según lo filtrado", () => {
    expect(nombreArchivo(filtroInicial(hoy))).toBe("Inspecciones_y_mantenciones_2026-10-12_a_2026-11-10.xlsx");
    expect(nombreArchivo({ ...filtroInicial(hoy), tipo: "mantencion", turno: "B" })).toBe("Mantenciones_Turno_B_2026-10-12_a_2026-11-10.xlsx");
  });
});
