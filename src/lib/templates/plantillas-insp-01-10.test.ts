import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FORMATOS } from "@/lib/formatos/catalogo";
import { validateTemplate } from "./validate";

const sql = readFileSync(path.resolve(__dirname, "../../../supabase/seed_plantillas_insp_01_10.sql"), "utf8");

interface Cargada {
  codigoTipo: string;
  json: unknown;
}

/** Cada `insert … $tpl$ {json} $tpl$ … where et.code = '…'` del seed. */
function plantillasDelSeed(): Cargada[] {
  const bloques = sql.split("insert into public.form_templates").slice(1);
  return bloques.map((b) => {
    const json = b.match(/\$tpl\$([\s\S]*?)\$tpl\$/)?.[1];
    const codigoTipo = b.match(/where et\.code = '([a-z_0-9]+)'/)?.[1];
    if (!json || !codigoTipo) throw new Error("Bloque de plantilla sin JSON o sin tipo de equipo");
    return { codigoTipo, json: JSON.parse(json) };
  });
}

/** Norma y cantidad de ítems según el Word revisado de cada formato. */
const ESPERADO: Record<string, { formato: string; norma: string; items: number }> = {
  desconectador_seccionador: { formato: "INSP-01", norma: "EST-ELEC-MLP-Bbosch-01", items: 24 },
  banco_condensadores_mauro: { formato: "INSP-02", norma: "EST-ELEC-MLP-Bbosch-02", items: 56 },
  grupo_generador_mauro: { formato: "INSP-03", norma: "EST-ELEC-INSP-MLP-Bbosch-03", items: 45 },
  sala_electrica_stmg: { formato: "INSP-04", norma: "EST-ELEC-MLP-Bbosch-04", items: 23 },
  reconectador: { formato: "INSP-05", norma: "EST-ELEC-MLP-Bbosch-05", items: 22 },
  subestacion_movil: { formato: "INSP-06", norma: "EST-ELEC-MLP-Bbosch-06", items: 90 },
  transformador_aereo: { formato: "INSP-07", norma: "EST-ELEC-MLP-Bbosch-07", items: 18 },
  switchgear_sala_12: { formato: "INSP-08", norma: "EST-ELEC-MLP-Bbosch-08", items: 28 },
  parron_maniobra: { formato: "INSP-09", norma: "EST-ELEC-MLP-Bbosch-09", items: 39 },
  sistema_presurizado_sala_12: { formato: "INSP-10", norma: "EST-ELEC-MLP-Bbosch-10", items: 6 },
};

describe("plantillas INSP-01 a INSP-10 (seed_plantillas_insp_01_10.sql)", () => {
  const cargadas = plantillasDelSeed();

  it("carga las 10 plantillas y cada una pasa el validador de la app", () => {
    expect(cargadas.map((c) => c.codigoTipo).sort()).toEqual(Object.keys(ESPERADO).sort());
    for (const c of cargadas) {
      const res = validateTemplate(c.json);
      expect(res.ok, `${c.codigoTipo}: ${res.ok ? "" : JSON.stringify(res.errors)}`).toBe(true);
    }
  });

  it("cada una tiene la norma y la cantidad de ítems del Word", () => {
    for (const c of cargadas) {
      const res = validateTemplate(c.json);
      if (!res.ok) throw new Error(c.codigoTipo);
      const esperado = ESPERADO[c.codigoTipo];
      expect(res.template.meta?.norma, c.codigoTipo).toBe(esperado.norma);
      expect(res.template.sections.flatMap((s) => s.items), c.codigoTipo).toHaveLength(esperado.items);
    }
  });

  it("todas piden TAG, fecha y horas, y los 3 firmantes del estándar", () => {
    for (const c of cargadas) {
      const res = validateTemplate(c.json);
      if (!res.ok) throw new Error(c.codigoTipo);
      const claves = res.template.header.map((h) => h.key);
      expect(claves, c.codigoTipo).toEqual(expect.arrayContaining(["tag", "ot", "fecha", "h_inicio", "h_fin"]));
      expect(res.template.roles).toEqual(["Encargado de la actividad", "Supervisor Bbosch", "Planificador Bbosch"]);
    }
  });

  it("ninguna menciona STN y ninguna trae galería de fotos (se quitó de los Word)", () => {
    expect(sql).not.toMatch(/\bSTN\b/);
    for (const c of cargadas) {
      const res = validateTemplate(c.json);
      if (!res.ok) throw new Error(c.codigoTipo);
      expect(res.template.sections.flatMap((s) => s.items).some((i) => i.type === "photo"), c.codigoTipo).toBe(false);
    }
  });

  it("los tipos de equipo del seed son exactamente los que el catálogo de formatos espera", () => {
    const delCatalogo = FORMATOS.filter((f) => f.estado === "disponible" && f.id !== "INSP-12").map((f) => [
      f.plantilla!.tipoEquipo,
      f.id,
    ]);
    expect(Object.fromEntries(delCatalogo)).toEqual(
      Object.fromEntries(Object.entries(ESPERADO).map(([tipo, e]) => [tipo, e.formato])),
    );
  });

  it("es repetible: tipos con on conflict y plantillas con on conflict do nothing", () => {
    expect((sql.match(/on conflict \(code\) do nothing/g) ?? []).length).toBe(10);
    expect((sql.match(/on conflict \(equipment_type_id, work_mode_id, version\) do nothing/g) ?? []).length).toBe(10);
  });
});
