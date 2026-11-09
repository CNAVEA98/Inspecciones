// Adaptado de src/lib/revision/fallas.test.ts de la web (2026-11-09).
import { describe, expect, it } from "vitest";
import {
  FILTRO_FALLAS_INICIAL,
  agruparPorEquipo,
  estadoGestion,
  fichaSap,
  filtrarFallas,
  textoBreve,
  validarSeguimiento,
  type HallazgoFalla,
} from "./fallas";

let n = 0;
const h = (p: Partial<HallazgoFalla> = {}): HallazgoFalla => ({
  id: `f${++n}`,
  inspeccionId: "i1",
  folio: "INS-2026-000001",
  status: "approved",
  itemKey: "item_01",
  itemTexto: "Estado de aisladores",
  severidad: "media",
  observacion: "",
  enviadaEn: "2026-10-30T12:00:00Z",
  tag: "320-XF-007",
  area: "Chacay",
  equipo: "Transformador aéreo",
  ot: "3504667",
  realizadoPor: "Pedro Soto",
  turno: "A",
  modo: "Inspección según Plan Matriz",
  seguimiento: null,
  ...p,
});

describe("estadoGestion", () => {
  it("pendiente, con aviso o canalizado", () => {
    expect(estadoGestion(null)).toBe("pendiente");
    expect(estadoGestion({ scope: "bbosch", sapNotice: "4500012345", channelNote: null })).toBe("con_aviso");
    expect(estadoGestion({ scope: "terceros", sapNotice: null, channelNote: null })).toBe("pendiente");
    expect(estadoGestion({ scope: "terceros", sapNotice: null, channelNote: "Avisado a MLP" })).toBe("canalizado");
  });
});

describe("agruparPorEquipo", () => {
  it("ordena por severidad máxima y luego por cantidad de hallazgos", () => {
    const eq = agruparPorEquipo([
      h({ tag: "A", severidad: "media" }),
      h({ tag: "B", severidad: "critica" }),
      h({ tag: "C", severidad: "media" }),
      h({ tag: "C", severidad: "baja" }),
    ]);
    expect(eq.map((e) => e.tag)).toEqual(["B", "C", "A"]);
  });
  it("agrupa por TAG y área", () => {
    expect(agruparPorEquipo([h({ tag: "X", area: "Mina" }), h({ tag: "X", area: "Planta" })])).toHaveLength(2);
  });
});

describe("filtrarFallas", () => {
  const lista = [
    h({ severidad: "alta", turno: "B" }),
    h({ severidad: "baja", seguimiento: { scope: "bbosch", sapNotice: "45", channelNote: null } }),
    h({ severidad: "alta", tag: "740-HF-003", area: "Estación" }),
  ];
  it("por defecto muestra solo los pendientes", () => {
    expect(filtrarFallas(lista, FILTRO_FALLAS_INICIAL)).toHaveLength(2);
  });
  it("filtra por gestión, severidad, turno y texto sin tildes", () => {
    expect(filtrarFallas(lista, { ...FILTRO_FALLAS_INICIAL, gestion: "todos" })).toHaveLength(3);
    expect(filtrarFallas(lista, { ...FILTRO_FALLAS_INICIAL, turno: "B" })).toHaveLength(1);
    expect(filtrarFallas(lista, { ...FILTRO_FALLAS_INICIAL, q: "estacion 740" })).toHaveLength(1);
    expect(filtrarFallas(lista, { ...FILTRO_FALLAS_INICIAL, gestion: "todos", severidad: "baja" })).toHaveLength(1);
  });
});

describe("ficha para SAP", () => {
  it("texto breve de 40 caracteres como máximo", () => {
    const largo = textoBreve("Verificar el estado de las uniones estancas y costuras del transformador");
    expect(largo.length).toBeLessThanOrEqual(40);
    expect(largo.endsWith("…")).toBe(true);
  });
  it("incluye la OT padre, el TAG y la prioridad sugerida", () => {
    const t = fichaSap(h({ severidad: "critica", observacion: "Aislador roto" }));
    expect(t).toContain("hijo de la OT 3504667");
    expect(t).toContain("320-XF-007");
    expect(t).toContain("Aislador roto");
    expect(t).toContain("Urgente");
    expect(fichaSap(h({ ot: "" }))).toContain("(completar N° OT)");
  });
});

describe("validarSeguimiento", () => {
  it("aplica los mismos límites que la web", () => {
    expect(validarSeguimiento({ scope: "bbosch", sapNotice: "300123456", channelNote: "" })).toBeNull();
    expect(validarSeguimiento({ scope: "bbosch", sapNotice: "1".repeat(21), channelNote: "" })).toMatch(/20/);
    expect(validarSeguimiento({ scope: "terceros", sapNotice: "", channelNote: "x".repeat(301) })).toMatch(/300/);
  });
});
