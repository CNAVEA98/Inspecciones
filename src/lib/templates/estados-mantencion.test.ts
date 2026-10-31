import { describe, expect, it } from "vitest";
import { armarInforme } from "@/lib/informe/modelo";
import type { DetalleInspeccion } from "@/lib/revision/queries";
import { ESTADOS_CONFORMES, estadoPorDefecto } from "./schema";
import { answerIssues, validateTemplate } from "./validate";

const MANTENCION = ["RL", "NR", "BN", "ML", "RMP", "NT"];

const plantilla = {
  title: "Mantención de prueba",
  nomenclature: "RL: REALIZADO / NR: NO REALIZADO / BN: BUENO / ML: MALO / RMP: REEMPLAZADO / NT: NO TIENE",
  estados: MANTENCION,
  sections: [
    {
      id: "s1",
      title: "Tareas",
      items: [
        { id: "limpieza", type: "verificacion", label: "Limpieza general" },
        { id: "luces", type: "verificacion", label: "Cambiar luces", estados: ["SI", "NO"] },
        { id: "temp", type: "verificacion", label: "Registrar temperatura", unit: "°C" },
      ],
    },
  ],
};

describe("estados de mantención (RL, RMP, SI, NO)", () => {
  it("la plantilla puede elegir los estados que ofrece, por plantilla y por ítem", () => {
    const res = validateTemplate(plantilla);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.template.estados).toEqual(MANTENCION);
      expect(res.template.sections[0].items[1]).toMatchObject({ estados: ["SI", "NO"] });
    }
  });

  it("rechaza estados que no existen o una lista de uno solo", () => {
    expect(validateTemplate({ ...plantilla, estados: ["RL", "XX"] }).ok).toBe(false);
    expect(validateTemplate({ ...plantilla, estados: ["RL"] }).ok).toBe(false);
  });

  it("RMP exige el motivo en observaciones, igual que ML y NR; RL, SI y NO no", () => {
    const item = { id: "a", type: "verificacion", label: "A" } as const;
    expect(answerIssues(item, { estado: "RMP" })).toEqual(["RMP exige el motivo en observaciones"]);
    expect(answerIssues(item, { estado: "RMP", obs: "Se cambió el contactor" })).toEqual([]);
    expect(answerIssues(item, { estado: "ML" })).toEqual(["ML exige observación"]);
    for (const estado of ["RL", "SI", "NO", "BN"]) expect(answerIssues(item, { estado })).toEqual([]);
  });

  it("«Marcar pendientes» usa RL en las mantenciones y BN en las inspecciones", () => {
    expect(estadoPorDefecto(undefined)).toBe("BN");
    expect(estadoPorDefecto(["RL", "NR", "BN", "ML", "RMP", "NT"] as const)).toBe("RL");
    expect(estadoPorDefecto(["SI", "NO", "RL", "NR"] as const)).toBe("RL");
    expect(estadoPorDefecto(["BN", "ML"] as const)).toBe("BN");
    expect(estadoPorDefecto(["SI", "NO"] as const)).toBe("SI");
  });

  it("el informe cuenta RL y SI como conformes, no solo BN", () => {
    const res = validateTemplate(plantilla);
    if (!res.ok) throw new Error("plantilla inválida");
    const d = {
      id: "i1", folio: "INS-2026-000001", status: "approved", equipmentTag: "X", area: "Mina", equipo: "E", modo: "Mantenimiento programado",
      tecnico: "T", realizadoPor: "R", turno: "A", templateVersion: 1, startedAt: "2026-10-31T12:00:00Z", submittedAt: "2026-10-31T13:00:00Z",
      reviewComment: null, plantilla: res.template, hallazgos: [], adjuntos: [], firmas: [],
      respuestas: { limpieza: { estado: "RL" }, luces: { estado: "SI" }, temp: { estado: "RMP", valor: 80, obs: "Cambiado" }, _header: {} },
    } as unknown as DetalleInspeccion;
    const r = armarInforme(d);
    expect(r.resumen.cuenta).toMatchObject({ RL: 1, SI: 1, RMP: 1, BN: 0 });
    expect(r.resumen.conformes).toBe(2);
    expect(r.grupos[0].conformes).toBe(2);
    expect(r.nomenclatura).toBe(plantilla.nomenclature);
    expect(ESTADOS_CONFORMES).toEqual(["BN", "RL", "SI"]);
  });
});
