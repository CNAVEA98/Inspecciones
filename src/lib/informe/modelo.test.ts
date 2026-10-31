import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { DetalleInspeccion } from "@/lib/revision/queries";
import { validateTemplate } from "@/lib/templates/validate";
import { armarInforme, fmtFecha, fmtNumero } from "./modelo";

const sql = readFileSync(path.resolve(__dirname, "../../../supabase/seed_catalogo.sql"), "utf8");
const parsed = validateTemplate(JSON.parse(sql.match(/\$tpl\$([\s\S]*?)\$tpl\$/)![1]));
if (!parsed.ok) throw new Error("seed inválido");
const plantilla = parsed.template;

const FOTO = "33333333-3333-4333-8333-333333333333";
const FIRMA = "44444444-4444-4444-8444-444444444444";

function detalle(extra: Partial<DetalleInspeccion> = {}): DetalleInspeccion {
  const respuestas: Record<string, unknown> = {};
  for (const s of plantilla.sections) for (const it of s.items) respuestas[it.id] = { estado: "BN" };
  Object.assign(respuestas, {
    item_02: { estado: "BN", valor: 45 },
    item_03: { estado: "BN", valor: 65 },
    item_07: { estado: "BN", valor: 12.5 },
    item_10: { estado: "ML", obs: "Fuga en flange", fotos: [FOTO] },
    item_23: { estado: "NA" },
    _header: { tag: "740XF001", ot: "8264819", ubicacion: "SE Piuquenes", fecha: "2026-10-17", h_inicio: "09:45", h_fin: "10:45", potencia: "100 MVA" },
    _ejecutor: "Pedro Soto",
    _participantes: { nombres: "Manuel Aguilar", firmaId: FIRMA },
    _diagnostico: { observaciones: "Fuga leve", consideraciones: "Reapretar" },
    _roles: { "Encargado de la actividad": "Pedro Soto" },
  });
  return {
    id: "i1",
    folio: "INS-2026-000006",
    status: "supervisor_signed",
    equipmentTag: "740XF001",
    area: "Chacay",
    equipo: "Transformador de piso",
    modo: "Plan Matriz",
    tecnico: "Técnico Turno A",
    realizadoPor: "Pedro Soto",
    turno: "A",
    templateVersion: 1,
    startedAt: "2026-10-17T12:45:00Z",
    submittedAt: "2026-10-17T13:50:00Z",
    reviewComment: null,
    plantilla,
    respuestas,
    hallazgos: [],
    adjuntos: [
      { id: FOTO, kind: "finding_photo", url: "http://x/foto.jpg" },
      { id: FIRMA, kind: "participant_signature", url: "http://x/firma.png" },
    ],
    firmas: [
      { stage: "supervisor", decision: "approved", comment: "Conforme", signedAt: "2026-10-17T14:00:00Z", firmante: "Supervisor Turno B", url: "http://x/sup.png" },
    ],
    ...extra,
  };
}

describe("armarInforme", () => {
  it("toma título, norma y revisión de la plantilla", () => {
    const r = armarInforme(detalle());
    expect(r.norma).toBe("EST-ELEC-INSP-MLP-BBOSCH-12");
    expect(r.titulo).toBe("Inspección Transformador Piso");
    expect(r.folio).toBe("INS-2026-000006");
    expect(r.estadoRegistro).toBe("Firmada por supervisor");
  });

  it("cuenta estados y lista los críticos", () => {
    const r = armarInforme(detalle());
    expect(r.resumen.total).toBe(29);
    expect(r.resumen.cuenta.ML).toBe(1);
    expect(r.resumen.cuenta.NA).toBe(1);
    expect(r.resumen.cuenta.BN).toBe(27);
    expect(r.resumen.criticos).toEqual([{ n: 10, texto: "Verificar estado de flanges, fugas.", obs: "Fuga en flange" }]);
  });

  it("numera los ítems de corrido entre grupos y arma valores con unidad", () => {
    const r = armarInforme(detalle());
    expect(r.grupos).toHaveLength(4);
    expect(r.grupos.flatMap((g) => g.filas).map((f) => f.n)).toEqual(Array.from({ length: 29 }, (_, i) => i + 1));
    const todas = r.grupos.flatMap((g) => g.filas);
    expect(todas[1].valor).toBe("45 °C");
    expect(todas[6].valor).toBe("12,5 %");
  });

  it("separa lecturas anchas (con máximo y límite) de las chicas", () => {
    const r = armarInforme(detalle());
    const ancha = r.lecturas.find((l) => l.titulo === "Aceite · cuba");
    expect(ancha).toMatchObject({ tipo: "ancha", actual: 45, max: 65, limite: 65, unidad: "°C" });
    expect(r.lecturas.find((l) => l.titulo === "Nivel conservador")).toMatchObject({ tipo: "chica", valor: 12.5, unidad: "%" });
  });

  it("deja en la cuadrícula solo los campos que no están en el encabezado oscuro", () => {
    const r = armarInforme(detalle());
    const etiquetas = r.specs.map((s) => s.label);
    expect(etiquetas).toContain("Potencia");
    expect(etiquetas).not.toContain("TAG Equipo");
    expect(etiquetas).not.toContain("N° OT");
    expect(r.specs.find((s) => s.label === "Realizado por")?.valor).toBe("Pedro Soto");
    expect(r.specs.find((s) => s.label === "Cuenta de envío")?.valor).toBe("Técnico Turno A · Turno A");
  });

  it("muestra los participantes (si se anotaron) como dato, sin firma", () => {
    expect(armarInforme(detalle()).specs.some((s) => s.label === "Participantes")).toBe(false);
    const r = armarInforme(detalle({ respuestas: { ...detalle().respuestas, _lista_participantes: "Ana Pérez, Luis Soto" } }));
    expect(r.specs.find((s) => s.label === "Participantes")?.valor).toBe("Ana Pérez, Luis Soto");
    expect(r.firmas.some((f) => /participante/i.test(f.rol))).toBe(false);
  });

  it("formatea fecha y horario de Chile", () => {
    const r = armarInforme(detalle());
    expect(r.fecha).toBe("17-10-2026");
    expect(r.horario).toBe("09:45 – 10:45");
    expect(r.lugar).toBe("SE Piuquenes · Chacay");
  });

  it("relaciona las firmas por rol: supervisor firmado, planificador pendiente", () => {
    const r = armarInforme(detalle());
    const por = (rol: string) => r.firmas.find((f) => f.rol === rol)!;
    expect(r.firmas.map((f) => f.rol)).toEqual(["Encargado de la actividad", "Supervisor Bbosch", "Planificador Bbosch"]);
    expect(por("Encargado de la actividad")).toMatchObject({ nombre: "Pedro Soto", imagenUrl: "http://x/firma.png" });
    expect(por("Supervisor Bbosch")).toMatchObject({ nombre: "Supervisor Turno B", imagenUrl: "http://x/sup.png", detalle: "Conforme" });
    expect(por("Planificador Bbosch")).toMatchObject({ nombre: "", imagenUrl: null });
  });

  it("marca el rechazo en el detalle de la firma", () => {
    const r = armarInforme(
      detalle({
        status: "rejected",
        firmas: [{ stage: "supervisor", decision: "rejected", comment: "Falta evidencia", signedAt: "2026-10-17T14:00:00Z", firmante: "Supervisor Turno A", url: null }],
      }),
    );
    expect(r.firmas.find((f) => f.rol === "Supervisor Bbosch")?.detalle).toBe("Rechazó: Falta evidencia");
    expect(r.estadoRegistro).toBe("Rechazada");
  });

  it("reúne las fotos con el número del ítem y omite las sin acceso", () => {
    const r = armarInforme(detalle());
    expect(r.fotos).toEqual([{ n: 10, texto: "Verificar estado de flanges, fugas.", url: "http://x/foto.jpg" }]);
    const sin = armarInforme(detalle({ adjuntos: [{ id: FOTO, kind: "photo", url: null }] }));
    expect(sin.fotos).toEqual([]);
  });

  it("no falla si no se pudo leer la plantilla", () => {
    const r = armarInforme(detalle({ plantilla: null }));
    expect(r.grupos).toEqual([]);
    expect(r.titulo).toBe("Transformador de piso · Plan Matriz");
  });
});

describe("formato", () => {
  it("fmtFecha y fmtNumero", () => {
    expect(fmtFecha("2026-10-17")).toBe("17-10-2026");
    expect(fmtFecha("ayer")).toBe("ayer");
    expect(fmtNumero(12.5)).toBe("12,5");
  });
});
