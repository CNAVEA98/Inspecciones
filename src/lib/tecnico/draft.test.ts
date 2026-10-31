import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { DraftRecord, PhotoRecord } from "@/lib/offline/db";
import { validateTemplate } from "@/lib/templates/validate";
import { META, allItems, buildSubmission, newDraft, photoPath, validateDraft } from "./draft";

const sql = readFileSync(path.resolve(__dirname, "../../../supabase/seed_catalogo.sql"), "utf8");
const parsed = validateTemplate(JSON.parse(sql.match(/\$tpl\$([\s\S]*?)\$tpl\$/)![1]));
if (!parsed.ok) throw new Error("seed inválido");
const template = parsed.template;

const UID = "11111111-1111-4111-8111-111111111111";
const FOTO = "33333333-3333-4333-8333-333333333333";
const FIRMA = "44444444-4444-4444-8444-444444444444";

function completo(): DraftRecord {
  const d = newDraft({ userId: UID, areaId: "a", equipmentTypeId: "e", workModeId: "m", templateId: "t" });
  d.header = Object.fromEntries(template.header.map((h) => [h.key, "x"]));
  d.header.tag = "740XF001";
  for (const item of allItems(template)) d.answers[item.id] = { estado: "BN" };
  d.answers[META.ejecutor] = "Pedro Soto";
  d.answers[META.roles] = { "Encargado de la actividad": "Manuel Aguilar", "Supervisor Bbosch": "", "Planificador Bbosch": "" };
  d.answers[META.firmaEncargado] = { firmaId: FIRMA, firmaDataUrl: "data:image/png;base64,AA" };
  return d;
}

const foto = (id: string, ext: "jpg" | "png" = "jpg"): PhotoRecord => ({
  id,
  inspectionId: "i",
  blob: new Blob(["x"]),
  mime: ext === "png" ? "image/png" : "image/jpeg",
  sizeBytes: 1,
  storagePath: photoPath(UID, "i", id, ext),
  uploaded: false,
});

describe("validateDraft", () => {
  it("un borrador completo no tiene problemas", () => {
    expect(validateDraft(completo(), template)).toEqual([]);
  });

  it("detecta ítems sin responder y cabecera incompleta", () => {
    const d = completo();
    delete d.answers.item_03;
    d.header.ot = "";
    const issues = validateDraft(d, template);
    expect(issues.some((i) => i.area === "header" && i.message.includes("N° OT"))).toBe(true);
    expect(issues.some((i) => i.itemId === "item_03")).toBe(true);
  });

  it("ML exige observación (foto opcional); NR exige motivo", () => {
    const d = completo();
    d.answers.item_21 = { estado: "ML" };
    d.answers.item_05 = { estado: "NR" };
    const msgs = validateDraft(d, template).map((i) => i.message).join(" | ");
    expect(msgs).toContain("ML exige observación");
    expect(msgs).not.toContain("foto");
    expect(msgs).toContain("NR exige el motivo");

    d.answers.item_21 = { estado: "ML", obs: "Pintura en mal estado" };
    d.answers.item_05 = { estado: "NR", obs: "Equipo desenergizado" };
    expect(validateDraft(d, template)).toEqual([]);
  });

  it("exige el nombre de quien realiza la inspección", () => {
    const d = completo();
    d.answers[META.ejecutor] = "   ";
    const msgs = validateDraft(d, template).map((i) => i.message);
    expect(msgs).toContain("Falta el nombre de quien realiza la inspección");
  });

  it("exige el nombre y la firma del encargado de la actividad, y ya no pide participantes", () => {
    const d = completo();
    d.answers[META.roles] = {};
    d.answers[META.firmaEncargado] = {};
    const msgs = validateDraft(d, template).map((i) => i.message);
    expect(msgs).toContain("Falta el nombre del encargado de la actividad");
    expect(msgs).toContain("Falta la firma del encargado de la actividad");
    expect(msgs.join(" ")).not.toMatch(/participante/i);
  });

  it("los participantes son opcionales, no firman y viajan como texto si se anotan", () => {
    const d = completo();
    expect(validateDraft(d, template)).toEqual([]);
    expect(buildSubmission(d, template, [foto(FIRMA, "png")]).payload.answers.map((a) => a.item_key)).not.toContain(META.participantes);

    d.answers[META.participantes] = "  Ana Pérez, Luis Soto  ";
    expect(validateDraft(d, template)).toEqual([]);
    const { payload } = buildSubmission(d, template, [foto(FIRMA, "png")]);
    expect(payload.answers.find((a) => a.item_key === META.participantes)?.value).toBe("Ana Pérez, Luis Soto");
    expect(payload.attachments.filter((a) => a.kind === "participant_signature")).toHaveLength(1); // solo la del encargado
  });

  it("no pide el nombre del supervisor ni del planificador: firman al revisar", () => {
    const d = completo();
    d.answers[META.roles] = { "Encargado de la actividad": "Manuel Aguilar" };
    expect(validateDraft(d, template)).toEqual([]);
  });
});

describe("buildSubmission", () => {
  it("arma payload con hallazgo, adjuntos y claves meta", () => {
    const d = completo();
    d.answers.item_21 = { estado: "ML", obs: "Pintura en mal estado", fotos: [FOTO] };
    d.findings = [{ id: "55555555-5555-4555-8555-555555555555", item_key: "item_21", severity: "alta", description: "", photo_attachment_id: null }];

    const { payload, photoIds } = buildSubmission(d, template, [foto(FOTO), foto(FIRMA, "png")]);

    expect(payload.inspection.id).toBe(d.id);
    expect(payload.inspection.equipment_tag).toBe("740XF001");
    expect(payload.inspection.performed_by).toBe("Pedro Soto");
    expect(payload.answers.find((a) => a.item_key === META.ejecutor)?.value).toBe("Pedro Soto");
    expect(payload.findings).toEqual([
      {
        id: "55555555-5555-4555-8555-555555555555",
        item_key: "item_21",
        severity: "alta",
        description: "Pintura en mal estado",
        photo_attachment_id: FOTO,
      },
    ]);
    expect(payload.attachments.map((a) => [a.id, a.kind])).toEqual([
      [FOTO, "finding_photo"],
      [FIRMA, "participant_signature"],
    ]);
    expect(photoIds).toEqual([FOTO, FIRMA]);
    const keys = payload.answers.map((a) => a.item_key);
    expect(keys).toContain(META.header);
    expect(keys).toContain(META.firmaEncargado);
    // la firma como imagen local no viaja en el payload; el nombre sale del rol «Encargado de la actividad»
    const firma = payload.answers.find((a) => a.item_key === META.firmaEncargado)!.value as Record<string, unknown>;
    expect(firma).toEqual({ nombres: "Manuel Aguilar", firmaId: FIRMA });
  });

  it("usa severidad media por defecto y genera un id de hallazgo", () => {
    const d = completo();
    d.answers.item_21 = { estado: "ML", obs: "x", fotos: [FOTO] };
    const { payload } = buildSubmission(d, template, [foto(FOTO), foto(FIRMA, "png")]);
    expect(payload.findings[0].severity).toBe("media");
    expect(payload.findings[0].id).toMatch(/^[0-9a-f-]{36}$/);
  });
});
