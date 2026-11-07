import { describe, expect, it } from "vitest";
import {
  POR_PAGINA_ENVIADAS,
  contarPorEstado,
  filtrarEnviadas,
  grupoDeEstado,
  textoParaServidor,
  type OpcionesBusqueda,
} from "./buscar-enviadas";
import type { Enviada } from "./enviadas";

const e = (id: string, extra: Partial<Enviada>): Enviada => ({
  id,
  folio: null,
  status: "submitted",
  equipment_tag: "",
  area_id: "a1",
  equipment_type_id: "t1",
  work_mode_id: "m",
  template_id: "tpl",
  submitted_at: "2026-11-07T17:51:00Z",
  review_comment: null,
  reviewed_at: null,
  ...extra,
});

const lista: Enviada[] = [
  e("1", { equipment_tag: "444-SG-001", folio: "INS-2026-000004", performed_by: "Cristóbal Navea", status: "rejected" }),
  e("2", { equipment_tag: "740-XF-001", folio: "INS-2026-000003", performed_by: "Manuel Aguilar", status: "approved", area_id: "a2", equipment_type_id: "t2" }),
  e("3", { equipment_tag: "740-XF-002", folio: "INS-2026-000002", performed_by: "Manuel Aguilar", status: "supervisor_signed", area_id: "a2", equipment_type_id: "t2" }),
  e("4", { equipment_tag: "320-XC-001", folio: "INS-2026-000001", performed_by: "Pedro Soto", status: "submitted", submitted_at: "2026-10-15T13:00:00Z" }),
];

const op = (texto: string, estado: OpcionesBusqueda["estado"] = "todas"): OpcionesBusqueda => ({
  texto,
  estado,
  nombreArea: (id) => ({ a1: "Chacay", a2: "Mina" })[id] ?? "",
  nombreEquipo: (id) => ({ t1: "Switchgear 23 kV", t2: "Transformador de piso" })[id] ?? "",
});

const ids = (r: Enviada[]) => r.map((x) => x.id);

describe("filtrarEnviadas", () => {
  it("sin texto ni estado devuelve todas, en el mismo orden", () => {
    expect(ids(filtrarEnviadas(lista, op("")))).toEqual(["1", "2", "3", "4"]);
  });

  it("encuentra el TAG con o sin guiones y en minúsculas", () => {
    expect(ids(filtrarEnviadas(lista, op("444-SG-001")))).toEqual(["1"]);
    expect(ids(filtrarEnviadas(lista, op("444sg001")))).toEqual(["1"]);
    expect(ids(filtrarEnviadas(lista, op("xf 001")))).toEqual(["2"]);
  });

  it("busca por folio, por quien la realizó (sin tildes) y por área o equipo", () => {
    expect(ids(filtrarEnviadas(lista, op("000003")))).toEqual(["2"]);
    expect(ids(filtrarEnviadas(lista, op("cristobal")))).toEqual(["1"]);
    expect(ids(filtrarEnviadas(lista, op("Cristóbal")))).toEqual(["1"]);
    expect(ids(filtrarEnviadas(lista, op("mina")))).toEqual(["2", "3"]);
    expect(ids(filtrarEnviadas(lista, op("transformador")))).toEqual(["2", "3"]);
  });

  it("exige todas las palabras, en cualquier orden", () => {
    expect(ids(filtrarEnviadas(lista, op("manuel mina")))).toEqual(["2", "3"]);
    expect(ids(filtrarEnviadas(lista, op("manuel chacay")))).toEqual([]);
    expect(ids(filtrarEnviadas(lista, op("aguilar manuel")))).toEqual(["2", "3"]);
  });

  it("busca por estado escrito y por fecha", () => {
    expect(ids(filtrarEnviadas(lista, op("rechazada")))).toEqual(["1"]);
    expect(ids(filtrarEnviadas(lista, op("15-10-2026")))).toEqual(["4"]);
  });

  it("combina el filtro de estado con el texto", () => {
    expect(ids(filtrarEnviadas(lista, op("", "revision")))).toEqual(["3", "4"]);
    expect(ids(filtrarEnviadas(lista, op("", "aprobadas")))).toEqual(["2"]);
    expect(ids(filtrarEnviadas(lista, op("xf", "revision")))).toEqual(["3"]);
    expect(ids(filtrarEnviadas(lista, op("444", "aprobadas")))).toEqual([]);
  });

  it("ignora espacios sobrantes", () => {
    expect(ids(filtrarEnviadas(lista, op("   444   ")))).toEqual(["1"]);
  });
});

describe("contarPorEstado y grupoDeEstado", () => {
  it("cuenta por grupo, con «firmada por supervisor» dentro de la revisión", () => {
    expect(contarPorEstado(lista)).toEqual({ todas: 4, revision: 2, aprobadas: 1, rechazadas: 1 });
    expect(grupoDeEstado({ status: "supervisor_signed" })).toBe("revision");
  });
});

describe("textoParaServidor", () => {
  it("quita comodines y separadores del filtro", () => {
    expect(textoParaServidor("444%,(sg)*")).toBe("444 sg");
    expect(textoParaServidor("a_b\\c")).toBe("a b c");
  });

  it("devuelve null si es muy corto", () => {
    expect(textoParaServidor("")).toBeNull();
    expect(textoParaServidor(" a ")).toBeNull();
    expect(textoParaServidor("%%")).toBeNull();
  });

  it("acota el largo", () => {
    expect(textoParaServidor("x".repeat(200))!.length).toBe(60);
  });
});

describe("constantes", () => {
  it("muestra las últimas 5", () => {
    expect(POR_PAGINA_ENVIADAS).toBe(5);
  });
});
