import { describe, expect, it } from "vitest";
import {
  agruparPorEquipo,
  estadoGestion,
  fichaSap,
  filtrarFallas,
  parseFiltroFallas,
  queryFallas,
  textoBreve,
  textoTrazabilidad,
  type HallazgoFalla,
  FILTRO_FALLAS_INICIAL,
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
  it("sin seguimiento está pendiente", () => {
    expect(estadoGestion(null)).toBe("pendiente");
  });
  it("de Bbosch pasa a «con aviso» al registrar el N.º", () => {
    expect(estadoGestion({ scope: "bbosch", sapNotice: null, channelNote: null })).toBe("pendiente");
    expect(estadoGestion({ scope: "bbosch", sapNotice: "4500012345", channelNote: null })).toBe("con_aviso");
  });
  it("de terceros pasa a «canalizado» al registrar la nota", () => {
    expect(estadoGestion({ scope: "terceros", sapNotice: null, channelNote: null })).toBe("pendiente");
    expect(estadoGestion({ scope: "terceros", sapNotice: null, channelNote: "Avisado a MLP" })).toBe("canalizado");
  });
});

describe("agruparPorEquipo", () => {
  it("ordena los equipos por severidad máxima, luego por cantidad de hallazgos", () => {
    const eq = agruparPorEquipo([
      h({ tag: "A", severidad: "media" }),
      h({ tag: "B", severidad: "critica" }),
      h({ tag: "C", severidad: "media" }),
      h({ tag: "C", severidad: "baja" }),
    ]);
    expect(eq.map((e) => e.tag)).toEqual(["B", "C", "A"]);
    expect(eq[0].severidadMax).toBe("critica");
  });

  it("dentro de un equipo, el hallazgo más grave va primero", () => {
    const [e] = agruparPorEquipo([h({ severidad: "baja" }), h({ severidad: "alta" }), h({ severidad: "media" })]);
    expect(e.hallazgos.map((x) => x.severidad)).toEqual(["alta", "media", "baja"]);
    expect(e.severidadMax).toBe("alta");
  });

  it("agrupa por TAG y área", () => {
    expect(agruparPorEquipo([h({ tag: "X", area: "Mina" }), h({ tag: "X", area: "Planta" })])).toHaveLength(2);
  });
});

describe("filtrarFallas", () => {
  const lista = [
    h({ severidad: "alta" }),
    h({ severidad: "baja", seguimiento: { scope: "bbosch", sapNotice: "45", channelNote: null } }),
    h({ severidad: "alta", area: "Mina" }),
  ];
  it("por defecto muestra solo los pendientes", () => {
    expect(filtrarFallas(lista, FILTRO_FALLAS_INICIAL)).toHaveLength(2);
  });
  it("«todos» incluye los ya gestionados, y filtra por severidad y área", () => {
    expect(filtrarFallas(lista, { ...FILTRO_FALLAS_INICIAL, gestion: "todos" })).toHaveLength(3);
    expect(filtrarFallas(lista, { ...FILTRO_FALLAS_INICIAL, gestion: "todos", severidad: "alta", area: "Mina" })).toHaveLength(1);
  });
});

describe("parseFiltroFallas", () => {
  it("ignora valores inválidos", () => {
    expect(parseFiltroFallas({ severidad: "grave", gestion: "x" })).toEqual(FILTRO_FALLAS_INICIAL);
    expect(parseFiltroFallas({ severidad: "critica", gestion: "todos", area: "Mina" })).toEqual({
      ...FILTRO_FALLAS_INICIAL,
      gestion: "todos",
      severidad: "critica",
      area: "Mina",
    });
  });
});

describe("ficha para SAP", () => {
  it("el texto breve se corta a 40 caracteres", () => {
    expect(textoBreve("Estado de aisladores")).toBe("Estado de aisladores");
    const largo = textoBreve("Verificar el estado de las uniones estancas y costuras del transformador");
    expect(largo.length).toBeLessThanOrEqual(40);
    expect(largo.endsWith("…")).toBe(true);
  });

  it("incluye la OT padre, el TAG, la prioridad sugerida y marca lo que falta", () => {
    const t = fichaSap(h({ severidad: "critica", observacion: "Aislador roto", realizadoPor: "Cristobal Navea Valdes" }));
    expect(t).toContain("hijo de la OT 3504667");
    expect(t).toContain("320-XF-007");
    expect(t).toContain("Aislador roto");
    expect(t).toContain("Urgente");
    expect(t).toContain("(completar)");
    expect(t).toMatch(/\(máx\. 12 caracteres\): Cristobal Na$/m); // el autor se corta a 12 caracteres
    expect(t).toContain("por Cristobal Navea Valdes"); // en la descripción va completo
  });

  it("sin N° OT lo pide explícitamente", () => {
    expect(fichaSap(h({ ot: "" }))).toContain("(completar N° OT)");
  });
});

describe("textoTrazabilidad", () => {
  it("queda vacío mientras el hallazgo está pendiente", () => {
    expect(textoTrazabilidad(null)).toBe("");
    expect(textoTrazabilidad({ scope: "bbosch", sapNotice: null, channelNote: null })).toBe("");
  });
  it("indica el aviso subsecuente o la canalización con MLP", () => {
    expect(textoTrazabilidad({ scope: "bbosch", sapNotice: "300123456", channelNote: null })).toBe("Aviso subsecuente N.º 300123456");
    expect(textoTrazabilidad({ scope: "terceros", sapNotice: null, channelNote: "Informado por radio" })).toContain(
      "canalizado con MLP · Informado por radio",
    );
  });
});

describe("queryFallas", () => {
  it("el filtro inicial no agrega parámetros", () => {
    expect(queryFallas(FILTRO_FALLAS_INICIAL)).toBe("");
  });
  it("incluye solo lo que se salió del valor inicial y admite un cambio", () => {
    const f = { ...FILTRO_FALLAS_INICIAL, gestion: "todos", severidad: "alta", area: "Mina" } as const;
    expect(queryFallas(f)).toBe("gestion=todos&severidad=alta&area=Mina");
    expect(queryFallas(f, { severidad: "" })).toBe("gestion=todos&area=Mina");
  });
  it("ida y vuelta con parseFiltroFallas", () => {
    const f = { ...FILTRO_FALLAS_INICIAL, gestion: "todos", severidad: "critica", area: "Puerto", turno: "B", zona: "puerto-mauro", vista: "lista" } as const;
    expect(parseFiltroFallas(Object.fromEntries(new URLSearchParams(queryFallas(f))))).toEqual(f);
  });
});

describe("carpetas de equipos con fallas", () => {
  const lista = [
    h({ id: "a", turno: "A", area: "Mina" }),
    h({ id: "b", turno: "A", area: "Chacay" }),
    h({ id: "c", turno: "B", area: "Puerto" }),
    h({ id: "d", turno: "B", area: "Valle" }),
    h({ id: "e", turno: null, area: "Mauro" }),
  ];
  const ids = (f: Partial<typeof FILTRO_FALLAS_INICIAL>) =>
    filtrarFallas(lista, { ...FILTRO_FALLAS_INICIAL, ...f }).map((x) => x.id);

  it("cada hallazgo cae en la carpeta del turno del técnico y de su área", () => {
    expect(ids({ turno: "A", zona: "chacay-mina" })).toEqual(["a", "b"]);
    expect(ids({ turno: "A", zona: "puerto-mauro" })).toEqual([]);
    expect(ids({ turno: "B", zona: "puerto-mauro" })).toEqual(["c"]);
    expect(ids({ turno: "B", zona: "otras" })).toEqual(["d"]);
    expect(ids({ turno: "-" })).toEqual(["e"]);
    expect(ids({})).toHaveLength(5);
  });

  it("la carpeta viaja en la URL y se lee de vuelta; lo inválido se descarta", () => {
    expect(queryFallas({ ...FILTRO_FALLAS_INICIAL, turno: "A", zona: "chacay-mina" })).toBe("turno=A&zona=chacay-mina");
    expect(parseFiltroFallas({ turno: "C", zona: "x", vista: "y" })).toEqual(FILTRO_FALLAS_INICIAL);
    expect(parseFiltroFallas({ turno: "-", vista: "lista" })).toMatchObject({ turno: "-", vista: "lista" });
  });
});

describe("filtro por tipo (inspecciones y mantenciones)", () => {
  const lista = [
    h({ id: "i", modo: "Inspección según Plan Matriz" }),
    h({ id: "m", modo: "Mantenimiento programado" }),
  ];
  const ids = (tipo: "" | "inspeccion" | "mantencion") =>
    filtrarFallas(lista, { ...FILTRO_FALLAS_INICIAL, tipo }).map((x) => x.id);

  it("separa las inspecciones de las mantenciones y sin filtro trae ambas", () => {
    expect(ids("inspeccion")).toEqual(["i"]);
    expect(ids("mantencion")).toEqual(["m"]);
    expect(ids("")).toEqual(["i", "m"]);
  });

  it("viaja en la URL y se lee de vuelta; lo inválido se descarta", () => {
    expect(queryFallas({ ...FILTRO_FALLAS_INICIAL, tipo: "mantencion" })).toBe("tipo=mantencion");
    expect(parseFiltroFallas({ tipo: "mantencion" }).tipo).toBe("mantencion");
    expect(parseFiltroFallas({ tipo: "otro" }).tipo).toBe("");
  });
});
