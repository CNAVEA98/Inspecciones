import { describe, expect, it } from "vitest";
import { esquemaClave, esquemaDatosCuenta, esquemaNuevaCuenta, estaBloqueada, generarClave, problemaClave, usuarioDeEmail } from "./cuentas";

const ID = "3f1c2b6e-5d1a-4c7e-9b0a-2a6f0c9d1e11";

describe("contraseñas", () => {
  it("exige 10 caracteres con letras y números, sin espacios en los extremos", () => {
    expect(problemaClave("abc123")).toMatch(/al menos 10/);
    expect(problemaClave("abcdefghijkl")).toMatch(/letras y números/);
    expect(problemaClave("1234567890123")).toMatch(/letras y números/);
    expect(problemaClave(" abcde12345")).toMatch(/espacio/);
    expect(problemaClave("a1".repeat(40))).toMatch(/72/);
    expect(problemaClave("Mina2026segura")).toBeNull();
    expect(problemaClave("ñandú-2026-ok")).toBeNull();
  });

  it("genera claves válidas de 14 caracteres sin letras ambiguas", () => {
    let semilla = 7;
    const aleatorio = (n: number) => Uint8Array.from({ length: n }, () => (semilla = (semilla * 73 + 41) % 256));
    const clave = generarClave(aleatorio);
    expect(clave).toHaveLength(14);
    expect(problemaClave(clave)).toBeNull();
    expect(clave).not.toMatch(/[0O1lI]/);
  });

  it("reintenta si la primera clave sale sin números", () => {
    let llamadas = 0;
    // Primera tanda: solo «A» (byte 0); después, bytes variados.
    const aleatorio = (n: number) => Uint8Array.from({ length: n }, (_, i) => (llamadas++ < n ? 0 : (i * 37 + 50) % 200));
    expect(problemaClave(generarClave(aleatorio))).toBeNull();
  });
});

describe("usuario y bloqueo", () => {
  it("muestra el usuario, no el correo interno", () => {
    expect(usuarioDeEmail("tecnico_a@mlp.local")).toBe("TECNICO_A");
    expect(usuarioDeEmail("persona@empresa.cl")).toBe("persona@empresa.cl");
    expect(usuarioDeEmail(null)).toBe("");
  });

  it("una cuenta está bloqueada solo mientras dura el bloqueo", () => {
    const ahora = new Date("2026-11-10T12:00:00Z");
    expect(estaBloqueada(null, ahora)).toBe(false);
    expect(estaBloqueada("2026-11-09T12:00:00Z", ahora)).toBe(false);
    expect(estaBloqueada("2126-01-01T00:00:00Z", ahora)).toBe(true);
    expect(estaBloqueada("no es fecha", ahora)).toBe(false);
  });
});

describe("formularios de cuentas", () => {
  it("una cuenta nueva necesita usuario válido, nombre, turno (salvo el administrador) y contraseña", () => {
    const base = { usuario: "TECNICO_C", fullName: "Técnico C", role: "technician", shift: "A", clave: "Mina2026segura" };
    const ok = esquemaNuevaCuenta.safeParse(base);
    expect(ok.success && ok.data.email).toBe("tecnico_c@mlp.local");

    const mensajes = (d: object) => {
      const r = esquemaNuevaCuenta.safeParse(d);
      return r.success ? [] : r.error.issues.map((i) => i.path.join("."));
    };
    expect(mensajes({ ...base, usuario: "técnico c" })).toEqual(["usuario"]);
    expect(mensajes({ ...base, shift: "" })).toEqual(["shift"]);
    expect(mensajes({ ...base, clave: "corta1" })).toEqual(["clave"]);
    expect(mensajes({ ...base, fullName: " " })).toEqual(["fullName"]);
    expect(mensajes({ ...base, role: "jefe" })).toEqual(["role"]);
  });

  it("el administrador queda sin turno aunque se envíe uno", () => {
    const r = esquemaDatosCuenta.safeParse({ userId: ID, fullName: "Administrador 2", role: "admin", shift: "B" });
    expect(r.success && r.data.shift).toBeNull();
    const s = esquemaDatosCuenta.safeParse({ userId: ID, fullName: "Supervisor C", role: "supervisor", shift: "B" });
    expect(s.success && s.data.shift).toBe("B");
    expect(esquemaDatosCuenta.safeParse({ userId: ID, fullName: "Supervisor C", role: "supervisor", shift: "" }).success).toBe(false);
    expect(esquemaDatosCuenta.safeParse({ userId: "x", fullName: "Supervisor C", role: "supervisor", shift: "A" }).success).toBe(false);
  });

  it("el cambio de contraseña aplica la misma regla", () => {
    expect(esquemaClave.safeParse({ userId: ID, clave: "Mina2026segura" }).success).toBe(true);
    expect(esquemaClave.safeParse({ userId: ID, clave: "12345678" }).success).toBe(false);
  });
});
