import { describe, expect, it } from "vitest";
import { borrarCopias, claveBandeja, claveDetalle, conCopia, guardarCopia, leerCopia, type Kv } from "./cache";

function kvMemoria(inicial: Record<string, string> = {}): Kv & { m: Map<string, string> } {
  const m = new Map(Object.entries(inicial));
  return {
    m,
    getItemAsync: async (k) => m.get(k) ?? null,
    setItemAsync: async (k, v) => void m.set(k, v),
    removeItemAsync: async (k) => m.delete(k),
    getAllKeysAsync: async () => [...m.keys()],
  };
}

describe("copia local de revisión", () => {
  it("con señal pide al servidor y guarda la copia", async () => {
    const kv = kvMemoria();
    const r = await conCopia(kv, "k", true, async () => [1, 2]);
    expect(r).toEqual({ datos: [1, 2], copiaDe: null });
    expect((await leerCopia(kv, "k"))?.datos).toEqual([1, 2]);
  });

  it("sin señal no llama al servidor y entrega la copia con su fecha", async () => {
    const kv = kvMemoria();
    await guardarCopia(kv, "k", { a: 1 }, 1000);
    let llamado = false;
    const r = await conCopia(kv, "k", false, async () => {
      llamado = true;
      return { a: 2 };
    });
    expect(llamado).toBe(false);
    expect(r.datos).toEqual({ a: 1 });
    expect(r.copiaDe).toBe(1000);
    expect(r.aviso).toMatch(/Sin conexión/);
  });

  it("si el servidor falla, entrega la copia con el motivo", async () => {
    const kv = kvMemoria();
    await guardarCopia(kv, "k", "viejo", 5);
    const r = await conCopia(kv, "k", true, async () => {
      throw new Error("Network request failed");
    });
    expect(r).toEqual({ datos: "viejo", copiaDe: 5, aviso: "Network request failed" });
  });

  it("sin señal y sin copia avisa que hay que abrirlo con señal", async () => {
    await expect(conCopia(kvMemoria(), "k", false, async () => 1)).rejects.toThrow(/sin datos guardados/);
  });

  it("ignora una copia dañada", async () => {
    expect(await leerCopia(kvMemoria({ k: "{no es json" }), "k")).toBeNull();
    expect(await leerCopia(kvMemoria({ k: '{"datos":1}' }), "k")).toBeNull();
  });

  it("al cerrar sesión borra solo las copias de revisión", async () => {
    const kv = kvMemoria({ [claveBandeja("u1", "todas")]: "x", [claveDetalle("u1", "i1")]: "y", "perfil:u1": "z" });
    expect(await borrarCopias(kv)).toBe(2);
    expect([...kv.m.keys()]).toEqual(["perfil:u1"]);
  });
});
