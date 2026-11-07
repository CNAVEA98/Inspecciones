import { describe, expect, it } from "vitest";
import { AlmacenMemoria } from "@/lib/offline/almacen-memoria";
import { guardarUltimoEjecutor, leerUltimoEjecutor } from "./ejecutor";

describe("último nombre de «Realizada por»", () => {
  it("sin nada guardado devuelve vacío", async () => {
    expect(await leerUltimoEjecutor(new AlmacenMemoria(), "u1")).toBe("");
  });

  it("guarda el nombre sin espacios sobrantes y lo devuelve", async () => {
    const a = new AlmacenMemoria();
    await guardarUltimoEjecutor(a, "u1", "  Manuel Aguilar  ");
    expect(await leerUltimoEjecutor(a, "u1")).toBe("Manuel Aguilar");
  });

  it("un nombre vacío no borra el anterior", async () => {
    const a = new AlmacenMemoria();
    await guardarUltimoEjecutor(a, "u1", "Manuel");
    await guardarUltimoEjecutor(a, "u1", "   ");
    expect(await leerUltimoEjecutor(a, "u1")).toBe("Manuel");
  });

  it("es independiente por cuenta", async () => {
    const a = new AlmacenMemoria();
    await guardarUltimoEjecutor(a, "u1", "Manuel");
    expect(await leerUltimoEjecutor(a, "u2")).toBe("");
  });
});
