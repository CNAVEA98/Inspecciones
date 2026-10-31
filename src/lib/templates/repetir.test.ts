import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { armarInforme } from "@/lib/informe/modelo";
import type { DetalleInspeccion } from "@/lib/revision/queries";
import type { DraftRecord, PhotoRecord } from "@/lib/offline/db";
import { META, buildSubmission, newDraft, validateDraft } from "@/lib/tecnico/draft";
import { borradorDeCorreccion, type Enviada } from "@/lib/tecnico/enviadas";
import { MAX_REPETICIONES, expandirPlantilla, expandirSecciones, idEnCopia, leerRepeticiones } from "./repetir";
import { validateTemplate } from "./validate";

const plantilla = {
  title: "Línea aérea",
  header: [],
  roles: ["Encargado de la actividad", "Supervisor Bbosch", "Planificador Bbosch"],
  sections: [
    {
      id: "estructura",
      title: "Estructura",
      repetible: true,
      items: [
        { id: "numero", type: "text", label: "N° de estructura", required: true, multiline: false },
        { id: "poste", type: "verificacion", label: "Estado del poste" },
      ],
    },
    { id: "cierre", title: "Cierre", items: [{ id: "limpieza", type: "verificacion", label: "Limpieza" }] },
  ],
};

const parsed = validateTemplate(plantilla);
if (!parsed.ok) throw new Error(parsed.errors.join("; "));
const tpl = parsed.template;

describe("secciones repetibles", () => {
  it("la plantilla acepta `repetible` en una sección", () => {
    expect(tpl.sections[0].repetible).toBe(true);
    expect(tpl.sections[1].repetible).toBeUndefined();
  });

  it("leerRepeticiones ignora lo que no sea un entero entre 2 y el máximo", () => {
    expect(leerRepeticiones({ estructura: 3, otra: 1, mala: "2", neg: -4, dec: 2.5 })).toEqual({ estructura: 3 });
    expect(leerRepeticiones({ estructura: 999 })).toEqual({ estructura: MAX_REPETICIONES });
    expect(leerRepeticiones(undefined)).toEqual({});
    expect(leerRepeticiones([2])).toEqual({});
  });

  it("sin copias, la sección repetible igual se numera y los ids no cambian", () => {
    const s = expandirSecciones(tpl, {});
    expect(s.map((x) => x.title)).toEqual(["Estructura 1", "Cierre"]);
    expect(s[0].items.map((i) => i.id)).toEqual(["numero", "poste"]);
    expect(s.map((x) => x.origen)).toEqual([0, 1]);
  });

  it("con 3 copias: la 1 conserva los ids y las demás llevan el sufijo __k", () => {
    const s = expandirSecciones(tpl, { estructura: 3 });
    expect(s.map((x) => x.title)).toEqual(["Estructura 1", "Estructura 2", "Estructura 3", "Cierre"]);
    expect(s.flatMap((x) => x.items.map((i) => i.id))).toEqual([
      "numero", "poste", "numero__2", "poste__2", "numero__3", "poste__3", "limpieza",
    ]);
    expect(s.map((x) => x.origen)).toEqual([0, 0, 0, 1]);
    expect(idEnCopia("poste", 1)).toBe("poste");
    expect(idEnCopia("poste", 2)).toBe("poste__2");
  });

  it("expandirPlantilla devuelve la misma plantilla si no hay secciones repetibles", () => {
    const simple = { ...tpl, sections: [tpl.sections[1]] };
    expect(expandirPlantilla(simple, { cierre: 4 })).toBe(simple);
    expect(expandirPlantilla(tpl, { estructura: 2 }).sections).toHaveLength(3);
  });
});

function borrador(): DraftRecord {
  const d = newDraft({ userId: "u", areaId: "a", equipmentTypeId: "e", workModeId: "m", templateId: "t" });
  d.answers.numero = "12";
  d.answers.poste = { estado: "BN" };
  d.answers.limpieza = { estado: "BN" };
  d.answers[META.ejecutor] = "Pedro";
  d.answers[META.roles] = { "Encargado de la actividad": "Pedro" };
  d.answers[META.firmaEncargado] = { firmaId: "44444444-4444-4444-8444-444444444444" };
  return d;
}
const firma = { id: "44444444-4444-4444-8444-444444444444", storagePath: "x", mime: "image/png", sizeBytes: 1 } as unknown as PhotoRecord;

describe("borrador con varias estructuras", () => {
  it("una estructura sola es válida y no manda `_repeticiones`", () => {
    const d = borrador();
    expect(validateDraft(d, tpl)).toEqual([]);
    const { payload } = buildSubmission(d, tpl, [firma]);
    expect(payload.answers.map((a) => a.item_key)).not.toContain(META.repeticiones);
  });

  it("al agregar una estructura se exige completarla, con el paso de la sección original", () => {
    const d = borrador();
    d.answers[META.repeticiones] = { estructura: 2 };
    const issues = validateDraft(d, tpl);
    expect(issues.map((i) => i.message)).toEqual([
      "Sin responder: Estructura 2 · N° de estructura",
      "Sin responder: Estructura 2 · Estado del poste",
    ]);
    expect(issues.every((i) => i.section === 0)).toBe(true);
    expect(issues.map((i) => i.itemId)).toEqual(["numero__2", "poste__2"]);
  });

  it("con la estructura 2 completa se envía con sus respuestas, su hallazgo y `_repeticiones`", () => {
    const d = borrador();
    d.answers[META.repeticiones] = { estructura: 2 };
    d.answers.numero__2 = "13";
    d.answers.poste__2 = { estado: "ML", obs: "Poste inclinado" };
    expect(validateDraft(d, tpl)).toEqual([]);
    const { payload } = buildSubmission(d, tpl, [firma]);
    const claves = payload.answers.map((a) => a.item_key);
    expect(claves).toEqual(expect.arrayContaining(["numero", "poste", "numero__2", "poste__2", "limpieza", META.repeticiones]));
    expect(payload.answers.find((a) => a.item_key === META.repeticiones)?.value).toEqual({ estructura: 2 });
    expect(payload.findings.map((f) => f.item_key)).toEqual(["poste__2"]);
  });

  it("las respuestas de una copia que ya no existe no viajan", () => {
    const d = borrador();
    d.answers.numero__2 = "13"; // quedó de una copia quitada: no hay `_repeticiones`
    const { payload } = buildSubmission(d, tpl, [firma]);
    expect(payload.answers.map((a) => a.item_key)).not.toContain("numero__2");
  });
});

describe("informe y detalle con varias estructuras", () => {
  it("el informe arma un grupo por estructura", () => {
    const d = {
      id: "i1", folio: "INS-2026-000001", status: "approved", equipmentTag: "T", area: "Mina", equipo: "E", modo: "M", tecnico: "T",
      realizadoPor: "R", turno: "A", templateVersion: 1, startedAt: "2026-10-31T12:00:00Z", submittedAt: "2026-10-31T13:00:00Z",
      reviewComment: null, plantilla: tpl, hallazgos: [], adjuntos: [], firmas: [],
      respuestas: {
        numero: "12", poste: { estado: "BN" }, numero__2: "13", poste__2: { estado: "ML", obs: "Inclinado" }, limpieza: { estado: "BN" },
        _repeticiones: { estructura: 2 }, _header: {},
      },
    } as unknown as DetalleInspeccion;
    const r = armarInforme(d);
    expect(r.grupos.map((g) => g.titulo)).toEqual(["Estructura 1", "Estructura 2", "Cierre"]);
    expect(r.grupos[1].filas.map((f) => f.estado)).toEqual([null, "ML"]);
    expect(r.resumen.criticos.map((c) => c.texto)).toEqual(["Estado del poste"]);
    expect(r.resumen.total).toBe(3);
  });
});

describe("corrección de una inspección rechazada con varias estructuras", () => {
  it("copia las copias de la sección y sus respuestas (sin fotos ni firma)", () => {
    const rechazada = {
      id: "55555555-5555-4555-8555-555555555555", folio: "INS-2026-000009", status: "rejected", equipment_tag: "T-1", area_id: "a",
      equipment_type_id: "e", work_mode_id: "m", template_id: "t", submitted_at: "2026-10-31T15:00:00Z", review_comment: "Falta la 3",
      reviewed_at: "2026-10-31T16:00:00Z",
    } as Enviada;
    const respuestas = [
      { item_key: "numero", value: "12" }, { item_key: "poste", value: { estado: "BN" } },
      { item_key: "numero__2", value: "13" }, { item_key: "poste__2", value: { estado: "ML", obs: "Inclinado" } },
      { item_key: "limpieza", value: { estado: "BN" } }, { item_key: META.repeticiones, value: { estructura: 2 } },
    ];
    const d = borradorDeCorreccion({ userId: "u", rechazada, respuestas, template: tpl });
    expect(d.answers[META.repeticiones]).toEqual({ estructura: 2 });
    expect(d.answers.numero__2).toBe("13");
    expect(d.answers.poste__2).toEqual({ estado: "ML", obs: "Inclinado" });
    expect(d.findings.map((f) => f.item_key)).toEqual(["poste__2"]);
  });
});
