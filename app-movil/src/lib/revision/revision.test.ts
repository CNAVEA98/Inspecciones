import { describe, expect, it, vi } from "vitest";
import { etapaPendiente, estadosDelFiltro } from "./estado";
import { filtrarBandeja } from "./filtrar";
import { FirmaDesactualizada, base64ABytes, firmarRevision, mensajeFirma } from "./firma";
import type { FilaBandeja } from "./queries";

const fila = (o: Partial<FilaBandeja>): FilaBandeja => ({
  id: "1",
  folio: "INS-2026-000001",
  status: "submitted",
  equipmentTag: "444-SG-001",
  area: "Chacay",
  equipo: "Switchgear",
  modo: "Inspección",
  tecnico: "Técnico",
  realizadoPor: "Manuel Aguilar",
  turno: "A",
  submittedAt: "2026-11-07T15:00:00.000Z",
  ...o,
});

describe("etapaPendiente y filtros por rol", () => {
  it("el supervisor firma «enviada» y el programador «firmada por supervisor»", () => {
    expect(etapaPendiente("submitted", "supervisor")).toBe("supervisor");
    expect(etapaPendiente("supervisor_signed", "planner")).toBe("planner");
    expect(etapaPendiente("supervisor_signed", "supervisor")).toBeNull();
    expect(etapaPendiente("submitted", "planner")).toBeNull();
  });
  it("el administrador nunca firma", () => {
    for (const s of ["submitted", "supervisor_signed", "approved", "rejected"] as const) {
      expect(etapaPendiente(s, "admin")).toBeNull();
    }
  });
  it("«Por firmar» muestra solo lo del rol; el administrador ve ambas etapas", () => {
    expect(estadosDelFiltro("pendientes", "supervisor")).toEqual(["submitted"]);
    expect(estadosDelFiltro("pendientes", "planner")).toEqual(["supervisor_signed"]);
    expect(estadosDelFiltro("pendientes", "admin")).toEqual(["submitted", "supervisor_signed"]);
    expect(estadosDelFiltro("todas", "supervisor")).toHaveLength(4);
  });
});

describe("filtrarBandeja", () => {
  const filas = [
    fila({ id: "1" }),
    fila({ id: "2", folio: "INS-2026-000002", equipmentTag: "740-XF-001", equipo: "Transformador", area: "Mina", turno: "B", realizadoPor: "Cristóbal Navea" }),
    fila({ id: "3", folio: null, equipmentTag: "", turno: null, submittedAt: null }),
  ];
  const ids = (r: FilaBandeja[]) => r.map((f) => f.id);
  it("sin filtros devuelve todo", () => expect(ids(filtrarBandeja(filas, ""))).toEqual(["1", "2", "3"]));
  it("busca sin distinguir tildes ni mayúsculas, en varias palabras", () => {
    expect(ids(filtrarBandeja(filas, "cristobal mina"))).toEqual(["2"]);
    expect(ids(filtrarBandeja(filas, "SWITCHGEAR"))).toEqual(["1", "3"]);
    expect(ids(filtrarBandeja(filas, "740-xf"))).toEqual(["2"]);
  });
  it("filtra por turno y por día de envío", () => {
    expect(ids(filtrarBandeja(filas, "", "B"))).toEqual(["2"]);
    expect(ids(filtrarBandeja(filas, "", "", "2026-11-07"))).toEqual(["1", "2"]);
    expect(ids(filtrarBandeja(filas, "", "", "2026-11-08"))).toEqual([]);
  });
});

describe("firma de revisión", () => {
  it("convierte base64 (con o sin prefijo) en bytes", () => {
    expect(Array.from(base64ABytes("data:image/png;base64,iVBORw0="))).toEqual([137, 80, 78, 71, 13]);
    expect(Array.from(base64ABytes("iVBORw0="))).toEqual([137, 80, 78, 71, 13]);
  });
  it("traduce errores comunes", () => {
    expect(mensajeFirma("TypeError: Network request failed")).toMatch(/Sin conexión/);
    expect(mensajeFirma("new row violates row-level security policy")).toMatch(/no puede firmar/);
    expect(mensajeFirma("otro error")).toBe("otro error");
  });

  const supabaseFalso = (rpcError: { message: string } | null = null, subidaError: { message: string } | null = null) => {
    const upload = vi.fn().mockResolvedValue({ error: subidaError });
    const rpc = vi.fn().mockResolvedValue({ error: rpcError });
    const supabase = { storage: { from: vi.fn().mockReturnValue({ upload }) }, rpc } as never;
    return { supabase, upload, rpc };
  };
  const base = { inspeccionId: "abc", etapa: "supervisor" as const, decision: "approved" as const, comentario: "  ok  ", pngBase64: "iVBORw0=" };

  it("sube la firma y llama a review_inspection con el comentario recortado", async () => {
    const { supabase, upload, rpc } = supabaseFalso();
    await firmarRevision(supabase, base);
    expect(upload.mock.calls[0][0]).toMatch(/^abc\/supervisor-.+\.png$/);
    expect(upload.mock.calls[0][2]).toEqual({ contentType: "image/png" });
    expect(rpc).toHaveBeenCalledWith("review_inspection", {
      p_id: "abc",
      p_decision: "approved",
      p_comment: "ok",
      p_signature_path: upload.mock.calls[0][0],
    });
  });
  it("exige comentario al rechazar y no sube nada", async () => {
    const { supabase, upload } = supabaseFalso();
    await expect(firmarRevision(supabase, { ...base, decision: "rejected", comentario: "  " })).rejects.toThrow(/obligatorio/);
    expect(upload).not.toHaveBeenCalled();
  });
  it("si falla la subida no llama al RPC; si falla el RPC informa el motivo", async () => {
    const a = supabaseFalso(null, { message: "boom" });
    await expect(firmarRevision(a.supabase, base)).rejects.toThrow(/No se pudo subir la firma/);
    expect(a.rpc).not.toHaveBeenCalled();
    const b = supabaseFalso({ message: "La inspección ya fue firmada" });
    await expect(firmarRevision(b.supabase, base)).rejects.toThrow(FirmaDesactualizada);
  });
});

describe("dos teléfonos con la misma cuenta", () => {
  it("si otra persona firmó antes, avisa con un mensaje claro en vez del texto interno de la base", async () => {
    const upload = vi.fn().mockResolvedValue({ error: null });
    const rpc = vi.fn().mockResolvedValue({ error: { message: "El supervisor firma una inspección enviada" } });
    const supabase = { storage: { from: vi.fn().mockReturnValue({ upload }) }, rpc } as never;
    const intento = firmarRevision(supabase, { inspeccionId: "i1", etapa: "supervisor", decision: "approved", comentario: "", pngBase64: "AAAA" });
    await expect(intento).rejects.toBeInstanceOf(FirmaDesactualizada);
    await expect(intento).rejects.toThrow(/Otra persona ya revisó/);
    expect(mensajeFirma("El planificador firma una inspección ya firmada por el supervisor")).toMatch(/Otra persona ya revisó/);
  });
});
