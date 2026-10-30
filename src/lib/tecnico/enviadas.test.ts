import "fake-indexeddb/auto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { MlpDB } from "@/lib/offline/db";
import { validateTemplate } from "@/lib/templates/validate";
import { META, allItems, validateDraft } from "./draft";
import { borradorDeCorreccion, cargarEnviadas, readEnviadasCache, type Enviada } from "./enviadas";

const sql = readFileSync(path.resolve(__dirname, "../../../supabase/seed.sql"), "utf8");
const parsed = validateTemplate(JSON.parse(sql.match(/\$tpl\$([\s\S]*?)\$tpl\$/)![1]));
if (!parsed.ok) throw new Error("seed inválido");
const template = parsed.template;

const UID = "11111111-1111-4111-8111-111111111111";
const FOTO = "33333333-3333-4333-8333-333333333333";
const FIRMA = "44444444-4444-4444-8444-444444444444";

const rechazada: Enviada = {
  id: "55555555-5555-4555-8555-555555555555",
  folio: "INS-2026-000012",
  status: "rejected",
  equipment_tag: "740-XF-001",
  area_id: "a",
  equipment_type_id: "e",
  work_mode_id: "m",
  template_id: "t",
  submitted_at: "2026-10-30T15:00:00Z",
  review_comment: "Falta evidencia del aceite",
  reviewed_at: "2026-10-30T16:00:00Z",
};

function respuestasServidor() {
  const r: { item_key: string; value: unknown }[] = allItems(template).map((i) => ({
    item_key: i.id,
    value: { estado: "BN", fotos: [FOTO] },
  }));
  r.push({ item_key: "item_21", value: { estado: "ML", obs: "Mancha de aceite", fotos: [FOTO] } });
  const cabecera = Object.fromEntries(template.header.map((h) => [h.key, "x"]));
  r.push({ item_key: META.header, value: { ...cabecera, tag: "VIEJO", ot: "OT-9" } });
  r.push({ item_key: META.ejecutor, value: "Pedro Soto" });
  r.push({ item_key: META.participantes, value: { nombres: "Manuel Aguilar", firmaId: FIRMA } });
  return r;
}

describe("borradorDeCorreccion", () => {
  const d = borradorDeCorreccion({ userId: UID, rechazada, respuestas: respuestasServidor(), template });

  it("es un borrador nuevo (otro id) que apunta a la rechazada", () => {
    expect(d.id).not.toBe(rechazada.id);
    expect(d.state).toBe("draft");
    expect(d.correccion).toEqual({ de: rechazada.id, folio: "INS-2026-000012", motivo: "Falta evidencia del aceite" });
  });

  it("copia cabecera, ejecutor y respuestas; el TAG es el de la inspección", () => {
    expect(d.header.tag).toBe("740-XF-001");
    expect(d.header.ot).toBe("OT-9");
    expect(d.answers[META.ejecutor]).toBe("Pedro Soto");
    expect(d.answers.item_21).toEqual({ estado: "ML", obs: "Mancha de aceite" });
  });

  it("no copia fotos ni la firma del participante (no existen en este equipo)", () => {
    expect(JSON.stringify(d.answers)).not.toContain(FOTO);
    expect(JSON.stringify(d.answers)).not.toContain(FIRMA);
    expect(d.answers[META.participantes]).toEqual({ nombres: "Manuel Aguilar" });
  });

  it("crea el hallazgo de los ítems ML y solo falta la firma para poder reenviar", () => {
    expect(d.findings.map((f) => f.item_key)).toEqual(["item_21"]);
    expect(validateDraft(d, template).map((i) => i.message)).toEqual(["Falta la firma del participante"]);
  });
});

describe("cargarEnviadas", () => {
  const consultaCon = (resultado: () => Promise<unknown>) => {
    const c: Record<string, unknown> = {};
    for (const m of ["select", "eq", "neq", "order"]) c[m] = () => c;
    c.limit = resultado;
    return { from: () => c } as never;
  };

  it("con red guarda la lista y la usa sin red después", async () => {
    const db = new MlpDB(`test-${crypto.randomUUID()}`);
    const supabase = consultaCon(() => Promise.resolve({ data: [rechazada], error: null }));
    expect(await cargarEnviadas(db, supabase, UID, true)).toEqual({ lista: [rechazada], fromCache: false });
    expect(await cargarEnviadas(db, supabase, UID, false)).toEqual({ lista: [rechazada], fromCache: true });
    expect(await readEnviadasCache(db, "otro")).toBeNull();
  });

  it("si la consulta falla y no hay copia, devuelve una lista vacía", async () => {
    const db = new MlpDB(`test-${crypto.randomUUID()}`);
    const supabase = consultaCon(() => Promise.reject(new Error("sin red")));
    expect(await cargarEnviadas(db, supabase, UID, true)).toEqual({ lista: [], fromCache: true });
  });
});
