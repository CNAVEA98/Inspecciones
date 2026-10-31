import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { DetalleInspeccion } from "@/lib/revision/queries";
import { validateTemplate } from "@/lib/templates/validate";
import { armarInforme } from "./modelo";

const sql = readFileSync(path.resolve(__dirname, "../../../supabase/seed_catalogo.sql"), "utf8");
const parsed = validateTemplate(JSON.parse(sql.match(/\$tpl\$([\s\S]*?)\$tpl\$/)![1]));
if (!parsed.ok) throw new Error("seed inválido");

const detalle = (hallazgos: DetalleInspeccion["hallazgos"]): DetalleInspeccion => ({
  id: "i1",
  folio: "INS-2026-000001",
  status: "approved",
  equipmentTag: "320-XF-007",
  area: "Chacay",
  equipo: "Transformador",
  modo: "Inspección",
  tecnico: "Técnico A",
  realizadoPor: "Pedro Soto",
  turno: "A",
  templateVersion: 1,
  startedAt: "2026-10-30T12:00:00Z",
  submittedAt: "2026-10-30T13:00:00Z",
  reviewComment: null,
  plantilla: parsed.template,
  respuestas: { item_03: { estado: "ML", obs: "Fuga" }, item_04: { estado: "BN" } },
  hallazgos,
  adjuntos: [],
  firmas: [],
});

const hallazgo = (seguimiento: DetalleInspeccion["hallazgos"][number]["seguimiento"]) => ({
  id: "f1",
  itemKey: "item_03",
  severity: "alta" as const,
  description: "",
  photoAttachmentId: null,
  seguimiento,
});

const filasDe = (d: DetalleInspeccion) => armarInforme(d).grupos.flatMap((g) => g.filas);

describe("trazabilidad en el informe", () => {
  it("el hallazgo con aviso subsecuente lo muestra en su fila", () => {
    const f = filasDe(detalle([hallazgo({ scope: "bbosch", sapNotice: "300123456", channelNote: null })])).find((x) => x.estado === "ML");
    expect(f?.traza).toBe("Aviso subsecuente N.º 300123456");
  });

  it("canalizado con MLP también", () => {
    const f = filasDe(detalle([hallazgo({ scope: "terceros", sapNotice: null, channelNote: "por radio" })])).find((x) => x.estado === "ML");
    expect(f?.traza).toContain("canalizado con MLP");
  });

  it("pendiente o sin seguimiento no agrega línea, ni en ítems conformes", () => {
    const sin = filasDe(detalle([hallazgo(null)]));
    expect(sin.every((x) => !x.traza)).toBe(true);
    const conAviso = filasDe(detalle([{ ...hallazgo({ scope: "bbosch", sapNotice: "1", channelNote: null }), itemKey: "item_04" }]));
    expect(conAviso.every((x) => !x.traza)).toBe(true); // item_04 está en BN, no en «Malo»
  });
});
