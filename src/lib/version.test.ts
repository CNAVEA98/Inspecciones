import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { VERSION_APP, VERSION_ETIQUETA } from "./version";

describe("versión de la app", () => {
  it("coincide con package.json", () => {
    const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as { version: string };
    expect(VERSION_APP).toBe(pkg.version);
  });

  it("tiene formato mayor.menor.parche y se muestra con V", () => {
    expect(VERSION_APP).toMatch(/^\d+\.\d+\.\d+$/);
    expect(VERSION_ETIQUETA).toBe(`V${VERSION_APP}`);
  });
});
