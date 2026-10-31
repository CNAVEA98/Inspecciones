import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FORMATOS } from "@/lib/formatos/catalogo";
import { validateTemplate } from "./validate";

const sql = readFileSync(path.resolve(__dirname, "../../../supabase/seed_plantillas_insp_01_05.sql"), "utf8");

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

const ESPERADO: Record<string, { norma: string; items: number }> = {
  desconectador_seccionador: { norma: "EST-ELEC-MLP-BBOSCH-01", items: 24 },
  banco_condensadores_mauro: { norma: "EST-ELEC-MLP-BBOSCH-02", items: 56 },
  grupo_generador_mauro: { norma: "EST-ELEC-INSP-MLP-BBOSCH-03", items: 45 },
  sala_electrica_stmg: { norma: "EST-ELEC-MLP-BBOSCH-04", items: 24 },
  reconectador: { norma: "EST-ELEC-MLP-BBOSCH-05", items: 23 },
};

describe("plantillas INSP-01 a INSP-05 (seed_plantillas_insp_01_05.sql)", () => {
  const cargadas = plantillasDelSeed();

  it("carga las 5 plantillas y cada una pasa el validador de la app", () => {
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
      expect(res.template.meta?.norma).toBe(esperado.norma);
      expect(res.template.sections.flatMap((s) => s.items)).toHaveLength(esperado.items);
    }
  });

  it("todas piden TAG, fecha y horas, y los 3 firmantes del estándar", () => {
    for (const c of cargadas) {
      const res = validateTemplate(c.json);
      if (!res.ok) throw new Error(c.codigoTipo);
      const claves = res.template.header.map((h) => h.key);
      expect(claves).toEqual(expect.arrayContaining(["tag", "ot", "fecha", "h_inicio", "h_fin"]));
      expect(res.template.roles).toEqual(["Encargado de la actividad", "Supervisor Bbosch", "Planificador Bbosch"]);
    }
  });

  it("los tipos de equipo del seed son exactamente los que el catálogo de formatos espera", () => {
    const delCatalogo = FORMATOS.filter((f) => f.estado === "disponible" && f.id !== "INSP-12").map(
      (f) => f.plantilla!.tipoEquipo,
    );
    expect(delCatalogo.sort()).toEqual(Object.keys(ESPERADO).sort());
  });

  it("es repetible: tipos con on conflict y plantillas con on conflict do nothing", () => {
    expect((sql.match(/on conflict \(code\) do nothing/g) ?? []).length).toBe(5);
    expect((sql.match(/on conflict \(equipment_type_id, work_mode_id, version\) do nothing/g) ?? []).length).toBe(5);
  });
});
