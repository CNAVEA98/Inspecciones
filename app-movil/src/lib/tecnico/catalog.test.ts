// Copia de src/lib/tecnico/catalog.test.ts de la web (2026-11-07).
import { describe, expect, it } from "vitest";
import { AlmacenMemoria } from "@/lib/offline/almacen-memoria";
import incluido from "@/data/catalogo-incluido.json";
import { catalogoIncluido, loadCatalog, mensajeSinCatalogo, type CatalogoIncluido } from "./catalog";

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

describe("catálogo incluido en la app (primer uso sin señal)", () => {
  const copia = incluido as unknown as CatalogoIncluido;
  const url = `https://${copia.origen}.supabase.co`;

  it("la copia exportada es válida: todas las plantillas pasan la validación y están los 60 formatos", () => {
    const c = catalogoIncluido(copia, url);
    expect(c).not.toBeNull();
    expect(c!.templates).toHaveLength(copia.filas.form_templates.length);
    expect(c!.formatos.filter((f) => f.activo)).toHaveLength(60);
    expect(c!.areas.length).toBeGreaterThan(0);
    expect(c!.combinations.some((x) => x.template_id)).toBe(true);
  });

  it("solo se usa si es de la misma base a la que apunta la app", () => {
    expect(catalogoIncluido(copia, "http://localhost:54321")).toBeNull();
    expect(catalogoIncluido(copia, "https://otroproyecto0000000000.supabase.co")).toBeNull();
    expect(catalogoIncluido(copia, undefined)).toBeNull();
    expect(catalogoIncluido(copia, "no es url")).toBeNull();
  });

  it("sin señal y sin copia descargada usa la incluida; con copia descargada, la descargada", async () => {
    const almacen = new AlmacenMemoria();
    const sinRed = {} as never;
    const r = await loadCatalog(almacen, sinRed, false, () => catalogoIncluido(copia, url));
    expect(r.incluido).toBe(true);
    expect(r.catalog.formatos.length).toBe(60);

    await almacen.guardarCatalogo({ key: "catalog", value: { ...r.catalog, areas: [] }, updatedAt: 1 });
    const r2 = await loadCatalog(almacen, sinRed, false, () => catalogoIncluido(copia, url));
    expect(r2.incluido).toBeUndefined();
    expect(r2.catalog.areas).toEqual([]);
  });

  it("sin señal, sin copia y sin incluida (otra base) avisa que hay que conectarse", async () => {
    await expect(loadCatalog(new AlmacenMemoria(), {} as never, false, () => null)).rejects.toThrow(/Conéctese/);
  });
});
