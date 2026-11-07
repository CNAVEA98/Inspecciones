// Recorre las plantillas REALES de los 60 formatos (los seeds SQL de ../supabase) con el código propio de la app:
// validar la plantilla, llenar el formulario completo, forzar un hallazgo, armar el envío y generar el informe.
// Es la versión automática de «abrir cada formato en el teléfono»: detecta una plantilla que la app no sabe llenar, validar o imprimir.
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { DraftRecord, PhotoRecord } from "@/lib/offline/db";
import { informeAHtml } from "@/lib/informe/html";
import { PREFIJO_LOCAL, detalleLocal } from "@/lib/informe/local";
import { armarInforme } from "@/lib/informe/modelo";
import { META, allItems, buildSubmission, newDraft, rolEncargado, validateDraft } from "@/lib/tecnico/draft";
import { expandirPlantilla } from "@/lib/templates/repetir";
import type { FormTemplateSchema, TemplateItem } from "@/lib/templates/schema";
import { validateTemplate } from "@/lib/templates/validate";

const SEEDS = ["seed_plantillas_insp.sql", "seed_plantillas_insp_16_41.sql", "seed_plantillas_mant.sql"];

interface Cargada {
  archivo: string;
  codigoTipo: string;
  json: unknown;
}

function plantillasDelSeed(archivo: string): Cargada[] {
  const sql = readFileSync(path.resolve(__dirname, "../../../../supabase", archivo), "utf8");
  return sql
    .split("insert into public.form_templates")
    .slice(1)
    .map((b) => {
      const json = b.match(/\$tpl\$([\s\S]*?)\$tpl\$/)?.[1];
      const codigoTipo = b.match(/where et\.code = '([a-z_0-9]+)'/)?.[1];
      if (!json || !codigoTipo) throw new Error(`Bloque de plantilla sin JSON o sin tipo en ${archivo}`);
      return { archivo, codigoTipo, json: JSON.parse(json) };
    });
}

const TODAS = SEEDS.flatMap(plantillasDelSeed);

const FIRMA = "99999999-9999-4999-8999-999999999999";
const unId = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

/** Respuesta válida y «conforme» para un ítem, respetando mínimo y máximo. */
function respuestaConforme(item: TemplateItem): unknown {
  switch (item.type) {
    case "verificacion": {
      const base: { estado: string; valor?: number } = { estado: "BN" };
      if (item.unit !== undefined) base.valor = clamp(item.min, item.max);
      return base;
    }
    case "number":
      return clamp(item.min, item.max);
    case "text":
      return "ok";
    case "photo":
      return [];
    case "nameplate":
      return Object.fromEntries(item.fields.map((f) => [f.key, "x"]));
  }
}

function clamp(min: number | undefined, max: number | undefined): number {
  const v = min ?? 1;
  return max !== undefined && v > max ? max : v;
}

function borradorCompleto(t: FormTemplateSchema, conHallazgo: boolean): { draft: DraftRecord; fotos: PhotoRecord[] } {
  const draft = newDraft({ userId: "u1", areaId: "a", equipmentTypeId: "e", workModeId: "m", templateId: "t" });
  for (const h of t.header) draft.header[h.key] = h.input === "date" ? "2026-11-07" : h.input === "time" ? "10:00" : h.input === "number" ? "1" : "x";
  draft.header.tag = "740-XF-001";
  const items = allItems(expandirPlantilla(t, {}));
  for (const it of items) draft.answers[it.id] = respuestaConforme(it);

  const fotos: PhotoRecord[] = [];
  if (conHallazgo) {
    const v = items.find((i) => i.type === "verificacion");
    if (v) {
      const fotoId = unId(1);
      draft.answers[v.id] = { estado: "ML", obs: "Hallazgo de prueba", fotos: [fotoId] };
      draft.findings = [{ id: unId(2), item_key: v.id, severity: "alta", description: "Hallazgo de prueba", photo_attachment_id: fotoId }];
      fotos.push({ id: fotoId, inspectionId: draft.id, uri: "file:///f.jpg", mime: "image/jpeg", sizeBytes: 10, storagePath: `u/${draft.id}/${fotoId}.jpg`, uploaded: false });
    }
  }
  draft.answers[META.ejecutor] = "Prueba Claude";
  const rol = rolEncargado(t);
  if (rol) draft.answers[META.roles] = { [rol]: "Encargado Prueba" };
  draft.answers[META.firmaEncargado] = { firmaId: FIRMA };
  fotos.push({ id: FIRMA, inspectionId: draft.id, uri: "file:///s.png", mime: "image/png", sizeBytes: 10, storagePath: `u/${draft.id}/${FIRMA}.png`, uploaded: false });
  draft.photoIds = fotos.map((f) => f.id);
  return { draft, fotos };
}

describe("plantillas reales de los 60 formatos", () => {
  // Los seeds traen 59 plantillas (14 + 25 + 20) para 60 formatos; igual que en la web. Si un día aparece la que falta, sube el número.
  it("los seeds traen las 59 plantillas conocidas", () => {
    expect(TODAS.length).toBeGreaterThanOrEqual(59);
  });

  describe.each(TODAS.map((p) => [`${p.archivo.replace("seed_plantillas_", "").replace(".sql", "")} · ${p.codigoTipo}`, p] as const))("%s", (_nombre, p) => {
    const res = validateTemplate(p.json);

    it("la plantilla es válida para la app", () => {
      expect(res.ok, res.ok ? "" : JSON.stringify(res.errors).slice(0, 300)).toBe(true);
    });

    it("se puede llenar y validar completa, sin ningún pendiente", () => {
      if (!res.ok) return;
      const { draft } = borradorCompleto(res.template, false);
      expect(validateDraft(draft, res.template)).toEqual([]);
    });

    it("arma el envío al servidor y genera el informe con un hallazgo", () => {
      if (!res.ok) return;
      const { draft, fotos } = borradorCompleto(res.template, true);
      expect(validateDraft(draft, res.template)).toEqual([]);

      const { payload } = buildSubmission(draft, res.template, fotos);
      expect(payload.inspection.equipment_tag).toBe("740-XF-001");
      expect(payload.answers.length).toBeGreaterThan(0);
      expect(payload.findings.length).toBeLessThanOrEqual(1);
      // La firma siempre viaja adjunta; los ítems de foto vacíos no generan adjuntos huérfanos.
      expect(payload.attachments.some((a) => a.kind === "participant_signature")).toBe(true);

      const detalle = detalleLocal({ draft, template: res.template, fotos, area: "Chacay", equipo: "Equipo", modo: "Inspección", tecnico: "Técnico · Turno B", turno: "B" });
      const informe = armarInforme(detalle, new Date("2026-11-07T15:00:00Z"));
      const html = informeAHtml(informe, {
        logoBase64: "LOGO",
        imagenes: Object.fromEntries(fotos.map((f) => [`${PREFIJO_LOCAL}${f.id}`, `data:${f.mime};base64,AAAA`])),
        aviso: "Copia de prueba",
      });
      expect(html).toContain("740-XF-001");
      expect(html.length).toBeGreaterThan(2000);
    });
  });
});
