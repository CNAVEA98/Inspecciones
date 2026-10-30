import { describe, expect, it } from "vitest";
import { usuarioAEmail } from "./usuario";

describe("usuarioAEmail", () => {
  it("convierte el usuario en el correo interno, sin distinguir mayúsculas ni espacios", () => {
    expect(usuarioAEmail("TECNICO_A")).toBe("tecnico_a@mlp.local");
    expect(usuarioAEmail("  Supervisor_B ")).toBe("supervisor_b@mlp.local");
    expect(usuarioAEmail("ADMINISTRADOR")).toBe("administrador@mlp.local");
  });

  it("rechaza vacío, correos y caracteres raros", () => {
    for (const malo of ["", " ", "a", "juan@gmail.com", "tecnico a", "tec/nico", "x".repeat(60)]) {
      expect(usuarioAEmail(malo)).toBeNull();
    }
  });
});
