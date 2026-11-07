import { describe, expect, it } from "vitest";
import { leerBearer } from "./bearer";

const JWT = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.firma-de_prueba";

describe("leerBearer", () => {
  it("extrae el token de una cabecera Bearer", () => {
    expect(leerBearer(`Bearer ${JWT}`)).toBe(JWT);
    expect(leerBearer(`bearer   ${JWT}  `)).toBe(JWT);
  });

  it("rechaza cabeceras ausentes o mal formadas", () => {
    expect(leerBearer(null)).toBeNull();
    expect(leerBearer("")).toBeNull();
    expect(leerBearer(JWT)).toBeNull();
    expect(leerBearer("Basic abc")).toBeNull();
    expect(leerBearer("Bearer solo-una-parte")).toBeNull();
    expect(leerBearer(`Bearer ${JWT} extra`)).toBeNull();
  });
});
