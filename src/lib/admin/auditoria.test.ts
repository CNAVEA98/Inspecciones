import { describe, expect, it } from "vitest";
import { criterioAuditoria, describirEvento, parseTipoAuditoria, type FilaAuditoria } from "./auditoria";

const ADMIN = "11111111-1111-4111-8111-111111111111";
const TEC = "22222222-2222-4222-8222-222222222222";
const INSP = "33333333-3333-4333-8333-333333333333";
const nombres = new Map([
  [ADMIN, "Administrador"],
  [TEC, "Técnico A"],
]);
const fila = (f: Partial<FilaAuditoria>): FilaAuditoria => ({
  id: 1,
  table_name: "inspections",
  row_id: INSP,
  action: "UPDATE",
  actor_id: ADMIN,
  at: "2026-11-10T12:00:00Z",
  ...f,
});

describe("filtro de auditoría", () => {
  it("un tipo desconocido muestra todo", () => {
    expect(parseTipoAuditoria("cuentas")).toBe("cuentas");
    expect(parseTipoAuditoria(["formatos", "x"])).toBe("formatos");
    expect(parseTipoAuditoria("drop table")).toBe("todas");
    expect(parseTipoAuditoria(undefined)).toBe("todas");
  });

  it("cada tipo se traduce a tablas y acciones", () => {
    expect(criterioAuditoria("todas").tablas).toBeNull();
    expect(criterioAuditoria("eliminaciones")).toEqual({ tablas: ["inspections"], accion: "DELETE" });
    expect(criterioAuditoria("inspecciones")).toEqual({ tablas: ["inspections", "signatures"], sinAccion: "DELETE" });
    expect(criterioAuditoria("cuentas").tablas).toEqual(["profiles", "cuentas"]);
  });
});

describe("describirEvento", () => {
  it("nombra cada paso de una inspección y enlaza a su detalle", () => {
    const e = describirEvento(fila({ estado_antes: "draft", estado_nuevo: "submitted", folio_nuevo: "INS-2026-000012", actor_id: TEC }), nombres);
    expect(e).toMatchObject({ categoria: "inspeccion", titulo: "Inspección enviada", detalle: "INS-2026-000012", actor: "Técnico A", href: `/admin/${INSP}`, sensible: false });
    expect(describirEvento(fila({ estado_antes: "submitted", estado_nuevo: "supervisor_signed" }), nombres).titulo).toBe("Firmada por el supervisor");
    expect(describirEvento(fila({ estado_antes: "supervisor_signed", estado_nuevo: "approved" }), nombres).titulo).toBe("Aprobada por el programador");
    expect(describirEvento(fila({ estado_antes: "submitted", estado_nuevo: "rejected" }), nombres).titulo).toBe("Inspección rechazada");
    expect(describirEvento(fila({ estado_antes: "submitted", estado_nuevo: "submitted" }), nombres).titulo).toBe("Inspección actualizada");
    const borrador = describirEvento(fila({ action: "INSERT", estado: "draft" }), nombres);
    expect(borrador).toMatchObject({ titulo: "Borrador creado", detalle: "sin folio", href: null });
  });

  it("una eliminación es sensible y no enlaza (la inspección ya no existe)", () => {
    const e = describirEvento(fila({ action: "DELETE", folio: "INS-2026-000003" }), nombres);
    expect(e).toMatchObject({ categoria: "eliminacion", titulo: "Inspección eliminada", href: null, sensible: true });
    expect(e.detalle).toContain("INS-2026-000003");
  });

  it("los cambios de una cuenta se detallan; el de rol es sensible", () => {
    const e = describirEvento(
      fila({ table_name: "profiles", row_id: TEC, rol_antes: "technician", rol_nuevo: "supervisor", turno_antes: "A", turno_nuevo: "B", nombre_antes: "Técnico A", nombre_nuevo: "Técnico A" }),
      nombres,
    );
    expect(e).toMatchObject({ categoria: "cuenta", titulo: "Cuenta modificada", sensible: true, href: `/admin/usuarios/${TEC}` });
    expect(e.detalle).toBe("Técnico A · rol: Técnico → Supervisor · turno: Turno A → Turno B");

    const nombre = describirEvento(fila({ table_name: "profiles", row_id: TEC, rol_antes: "technician", rol_nuevo: "technician", nombre_antes: "T", nombre_nuevo: "Técnico A" }), nombres);
    expect(nombre).toMatchObject({ titulo: "Cuenta modificada", sensible: false });

    const aviso = describirEvento(fila({ table_name: "profiles", row_id: TEC, actor_id: TEC, rol_antes: "technician", rol_nuevo: "technician", aviso_nuevo: "2026-11-10T12:00:00Z" }), nombres);
    expect(aviso).toMatchObject({ titulo: "Aviso de privacidad leído", sensible: false });
  });

  it("las acciones del administrador sobre una cuenta son sensibles", () => {
    const e = describirEvento(fila({ table_name: "cuentas", row_id: TEC, action: "CAMBIAR_CLAVE", usuario: "TECNICO_A" }), nombres);
    expect(e).toMatchObject({ categoria: "cuenta", titulo: "Contraseña cambiada", detalle: "TECNICO_A · Técnico A", actor: "Administrador", sensible: true });
    expect(describirEvento(fila({ table_name: "cuentas", row_id: TEC, action: "BLOQUEAR" }), nombres).titulo).toBe("Cuenta bloqueada");
  });

  it("firmas, formatos y seguimiento", () => {
    const firma = describirEvento(fila({ table_name: "signatures", action: "INSERT", etapa: "planner", decision: "approved", inspeccion_id: INSP }), nombres);
    expect(firma).toMatchObject({ categoria: "firma", titulo: "Firma del programador: aprueba", href: `/admin/${INSP}` });
    expect(describirEvento(fila({ table_name: "signatures", action: "INSERT", etapa: "supervisor", decision: "rejected" }), nombres).titulo).toBe("Firma del supervisor: rechaza");

    expect(describirEvento(fila({ table_name: "form_templates", action: "INSERT", estado: "published", version: "3" }), nombres)).toMatchObject({ titulo: "Formato publicado", detalle: "Versión 3" });
    expect(describirEvento(fila({ table_name: "form_templates", action: "UPDATE", estado_antes: "draft", estado_nuevo: "draft", version_nueva: "2" }), nombres).titulo).toBe("Borrador de formato modificado");

    expect(describirEvento(fila({ table_name: "finding_followups", action: "SET", alcance: "bbosch", aviso_sap: "10004567" }), nombres).detalle).toBe("Aviso SAP 10004567");
    expect(describirEvento(fila({ table_name: "finding_followups", action: "SET", alcance: "terceros" }), nombres).detalle).toMatch(/Canalizado/);
    expect(describirEvento(fila({ table_name: "finding_followups", action: "SET", alcance: "bbosch" }), nombres).detalle).toBe("Seguimiento quitado");
  });

  it("sin sesión el actor es «Sistema»; una cuenta que ya no existe se dice", () => {
    expect(describirEvento(fila({ actor_id: null }), nombres).actor).toBe("Sistema");
    expect(describirEvento(fila({ actor_id: INSP }), nombres).actor).toBe("Cuenta eliminada");
    expect(describirEvento(fila({ table_name: "otra", action: "X" }), nombres)).toMatchObject({ categoria: "otro", titulo: "otra · X" });
  });
});
