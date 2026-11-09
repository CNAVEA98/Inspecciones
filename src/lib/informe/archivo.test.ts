import { describe, expect, it, vi } from "vitest";
import { obtenerOArchivar, rutaInforme, type AlmacenInformes } from "./archivo";

const ID = "3f2c1a9e-8b7d-4c6e-9f1a-2b3c4d5e6f70";
const pdf = (s: string) => new TextEncoder().encode(s);

function almacenEnMemoria(inicial: Record<string, Uint8Array> = {}) {
  const archivos = new Map(Object.entries(inicial));
  const almacen: AlmacenInformes = {
    leer: vi.fn(async (ruta: string) => archivos.get(ruta) ?? null),
    guardar: vi.fn(async (ruta: string, bytes: Uint8Array) => {
      if (archivos.has(ruta)) return "existe" as const;
      archivos.set(ruta, bytes);
      return "guardado" as const;
    }),
  };
  return { almacen, archivos };
}

describe("rutaInforme", () => {
  it("arma {id}/{folio}.pdf", () => {
    expect(rutaInforme(ID, "INS-2026-000031")).toBe(`${ID}/INS-2026-000031.pdf`);
  });
  it("rechaza ids o folios con otra forma (evita rutas inventadas)", () => {
    expect(rutaInforme("../otro", "INS-2026-000031")).toBeNull();
    expect(rutaInforme(ID, null)).toBeNull();
    expect(rutaInforme(ID, "INS-2026-31")).toBeNull();
    expect(rutaInforme(ID, "INS-2026-000031/../x")).toBeNull();
  });
});

describe("obtenerOArchivar", () => {
  const ruta = `${ID}/INS-2026-000031.pdf`;

  it("si no existe, genera, guarda y entrega", async () => {
    const { almacen, archivos } = almacenEnMemoria();
    const generar = vi.fn(async () => pdf("nuevo"));
    const r = await obtenerOArchivar(ruta, generar, almacen);
    expect(r.origen).toBe("nuevo");
    expect(new TextDecoder().decode(r.bytes)).toBe("nuevo");
    expect(archivos.get(ruta)).toBeDefined();
    expect(generar).toHaveBeenCalledOnce();
  });

  it("si ya existe, entrega la copia archivada sin generar", async () => {
    const { almacen } = almacenEnMemoria({ [ruta]: pdf("archivado") });
    const generar = vi.fn(async () => pdf("otro"));
    const r = await obtenerOArchivar(ruta, generar, almacen);
    expect(r.origen).toBe("archivo");
    expect(new TextDecoder().decode(r.bytes)).toBe("archivado");
    expect(generar).not.toHaveBeenCalled();
    expect(almacen.guardar).not.toHaveBeenCalled();
  });

  it("si otro proceso lo guardó entre medio, entrega esa copia (gana la primera)", async () => {
    const { almacen, archivos } = almacenEnMemoria();
    const generar = vi.fn(async () => {
      archivos.set(ruta, pdf("primero")); // otra petición subió mientras se generaba
      return pdf("segundo");
    });
    const r = await obtenerOArchivar(ruta, generar, almacen);
    expect(r.origen).toBe("archivo");
    expect(new TextDecoder().decode(r.bytes)).toBe("primero");
  });

  it("si el almacenamiento falla, igual entrega el PDF generado", async () => {
    const { almacen } = almacenEnMemoria();
    almacen.guardar = vi.fn(async () => {
      throw new Error("Storage caído");
    });
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const r = await obtenerOArchivar(ruta, async () => pdf("al vuelo"), almacen);
    expect(r.origen).toBe("sin-archivar");
    expect(new TextDecoder().decode(r.bytes)).toBe("al vuelo");
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });

  it("no da por buena una copia vacía", async () => {
    const { almacen } = almacenEnMemoria({ [ruta]: new Uint8Array() });
    const r = await obtenerOArchivar(ruta, async () => pdf("x"), almacen);
    expect(r.origen).not.toBe("archivo");
    expect(new TextDecoder().decode(r.bytes)).toBe("x");
  });
});
