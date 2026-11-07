import { describe, expect, it } from "vitest";
import type { DraftRecord, PhotoRecord } from "@/lib/offline/db";
import { META } from "@/lib/tecnico/draft";
import { validateTemplate } from "@/lib/templates/validate";
import { informeAHtml } from "./html";
import { PREFIJO_LOCAL, detalleLocal, rotulosLocal } from "./local";
import { armarInforme } from "./modelo";

const resultado = validateTemplate({
  title: "Inspección de prueba",
  meta: { norma: "INSP-99", revision: "1", titulo: "Inspección de prueba" },
  header: [{ key: "tag", label: "TAG", input: "text", required: true }],
  roles: ["Encargado de la actividad"],
  sections: [
    {
      id: "general",
      title: "General",
      items: [
        { id: "aislador", label: "Estado del aislador", type: "verificacion" },
        { id: "tablero", label: "Estado del tablero", type: "verificacion" },
        { id: "foto_general", label: "Foto general", type: "photo", maxPhotos: 2 },
      ],
    },
  ],
});
if (!resultado.ok) throw new Error("plantilla de prueba inválida");
const template = resultado.template;

const FOTO = "11111111-1111-4111-8111-111111111111";
const FIRMA = "22222222-2222-4222-8222-222222222222";

const foto = (id: string, mime: string): PhotoRecord => ({
  id,
  inspectionId: "ins-1",
  uri: `file:///fotos/${id}`,
  mime,
  sizeBytes: 10,
  storagePath: `u/ins-1/${id}`,
  uploaded: false,
});

const borrador = (state: DraftRecord["state"]): DraftRecord => ({
  id: "ins-1",
  technicianId: "u1",
  areaId: "a",
  equipmentTypeId: "e",
  workModeId: "m",
  templateId: "t",
  header: { tag: "740-XF-001", fecha: "2026-11-07" },
  answers: {
    aislador: { estado: "ML", obs: "Rajadura <script>alert(1)</script> & humedad", fotos: [FOTO] },
    tablero: { estado: "BN" },
    [META.ejecutor]: "Manuel Aguilar",
    [META.roles]: { "Encargado de la actividad": "Manuel Aguilar" },
    [META.firmaEncargado]: { firmaId: FIRMA },
  },
  findings: [{ id: "h1", item_key: "aislador", severity: "alta", description: "", photo_attachment_id: FOTO }],
  photoIds: [FOTO, FIRMA],
  startedAt: "2026-11-07T14:00:00.000Z",
  updatedAt: 1,
  state,
});

const entrada = (state: DraftRecord["state"]) => ({
  draft: borrador(state),
  template,
  fotos: [foto(FOTO, "image/jpeg"), foto(FIRMA, "image/png")],
  area: "Chacay",
  equipo: "Transformador",
  modo: "Inspección",
  tecnico: "Técnico · Turno B",
  turno: "B" as const,
});

describe("detalleLocal", () => {
  it("arma las respuestas, hallazgos y adjuntos como los envía la app al servidor", () => {
    const d = detalleLocal(entrada("queued"));
    expect(d.equipmentTag).toBe("740-XF-001");
    expect(d.realizadoPor).toBe("Manuel Aguilar");
    expect(d.status).toBe("submitted");
    expect(d.respuestas._header).toEqual({ tag: "740-XF-001", fecha: "2026-11-07" });
    expect(d.hallazgos).toHaveLength(1);
    expect(d.hallazgos[0]).toMatchObject({ itemKey: "aislador", severity: "alta", seguimiento: null });
    expect(d.adjuntos.map((a) => a.url)).toEqual(expect.arrayContaining([`${PREFIJO_LOCAL}${FOTO}`, `${PREFIJO_LOCAL}${FIRMA}`]));
    expect(d.firmas).toEqual([]);
  });

  it("un borrador queda como borrador y sin folio", () => {
    const d = detalleLocal(entrada("draft"));
    expect(d.status).toBe("draft");
    expect(d.folio).toBeNull();
  });

  it("conserva el folio de una inspección ya enviada", () => {
    const e = entrada("sent");
    e.draft.folio = "INS-2026-000123";
    expect(detalleLocal(e).folio).toBe("INS-2026-000123");
  });
});

describe("informeAHtml", () => {
  const informe = { ...armarInforme(detalleLocal(entrada("queued")), new Date("2026-11-07T15:00:00Z")), estadoRegistro: rotulosLocal({ state: "queued" }).estado };
  const imagenes = {
    [`${PREFIJO_LOCAL}${FOTO}`]: "data:image/jpeg;base64,AAAA",
    [`${PREFIJO_LOCAL}${FIRMA}`]: "data:image/png;base64,BBBB",
  };
  const html = informeAHtml(informe, { logoBase64: "LOGO", imagenes, aviso: "Copia de prueba" });

  it("incluye los datos del informe, el logo, el aviso y las imágenes", () => {
    expect(html).toContain("740-XF-001");
    expect(html).toContain("Inspección de prueba");
    expect(html).toContain("data:image/png;base64,LOGO");
    expect(html).toContain("Copia de prueba");
    expect(html).toContain("data:image/jpeg;base64,AAAA"); // foto del hallazgo
    expect(html).toContain("data:image/png;base64,BBBB"); // firma del encargado
    // Textos del PDF de la web (components/informe/informe-pdf.tsx).
    expect(html).toContain("Resultado de la inspección");
    expect(html).toContain("1 hallazgo");
    expect(html).toContain("1 alta");
    expect(html).toContain("Registro fotográfico");
    expect(html).toContain("Punto 1: Estado del aislador · Severidad alta");
    expect(html).toContain("Pendiente de envío"); // estado del registro (se rotula al generar el PDF; aquí es el del modelo)
  });

  it("sigue la estructura del PDF de la web, en el mismo orden", () => {
    const orden = ["class=\"hero\"", "class=\"specs\"", "class=\"resumen\"", "class=\"grupo\"", "class=\"hall\"", "class=\"cierre\"", "class=\"fotos\""];
    const posiciones = orden.map((o) => html.indexOf(o));
    expect(posiciones.every((x) => x >= 0)).toBe(true);
    expect([...posiciones].sort((a, b) => a - b)).toEqual(posiciones);
    // Pie en cada página: norma · TAG · fecha de generación.
    expect(html).toContain("INSP-99 · 740-XF-001 · Generado digitalmente");
  });

  it("escapa el texto escrito por el técnico", () => {
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt; &amp; humedad");
  });

  it("sin la imagen de una foto, omite el registro fotográfico en vez de dejar una imagen rota", () => {
    const sinFotos = informeAHtml(informe, { logoBase64: null, imagenes: {} });
    expect(sinFotos).not.toContain("Registro fotográfico");
    expect(sinFotos).toContain("BBOSCH");
  });
});

describe("rotulosLocal", () => {
  it("rotula según el estado de la inspección en el teléfono", () => {
    expect(rotulosLocal({ state: "draft" }).estado).toBe("Borrador sin enviar");
    expect(rotulosLocal({ state: "queued" }).estado).toBe("Pendiente de envío");
    expect(rotulosLocal({ state: "sent", folio: "X" }).estado).toBe("Enviada");
  });
});
