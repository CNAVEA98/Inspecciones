import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FORMATOS } from "@/lib/formatos/catalogo";
import type { FormTemplateSchema } from "./schema";
import { validateTemplate } from "./validate";

const sql = readFileSync(path.resolve(__dirname, "../../../supabase/seed_plantillas_insp_16_41.sql"), "utf8");

/** Cada `insert … $tpl$ {json} $tpl$ … where et.code = '…'` del seed. */
function cargar(): Map<string, unknown> {
  const mapa = new Map<string, unknown>();
  for (const b of sql.split("insert into public.form_templates").slice(1)) {
    const json = b.match(/\$tpl\$([\s\S]*?)\$tpl\$/)?.[1];
    const tipo = b.match(/where et\.code = '([a-z_0-9]+)' and wm\.code = '([a-z_]+)'/);
    if (!json || !tipo) throw new Error("Bloque de plantilla sin JSON o sin tipo de equipo");
    expect(tipo[2]).toBe("plan_matriz");
    mapa.set(tipo[1], JSON.parse(json));
  }
  return mapa;
}

/** Norma y cantidad de ítems según el Word revisado de cada formato (INSP-36 no existe). */
const ESPERADO: Record<string, { formato: string; norma: string; items: number }> = {
  grupo_generador: { formato: "INSP-16", norma: "EST-ELEC-INSP-MLP-Bbosch-16", items: 30 },
  cargador_banco_baterias: { formato: "INSP-17", norma: "EST-ELEC-INSP-MLP-Bbosch-17", items: 24 },
  pruebas_generadores_chacay_mina: { formato: "INSP-18", norma: "EST-ELEC-INSP-MLP-Bbosch-18", items: 31 },
  cables_tierras_escalerillas: { formato: "INSP-19", norma: "EST-ELEC-INSP-MLP-Bbosch-19", items: 4 },
  celda_alimentador_23kv: { formato: "INSP-20", norma: "EST-ELEC-INSP-MLP-Bbosch-20", items: 25 },
  cruce_camino_mina: { formato: "INSP-21", norma: "EST-ELEC-MLP-Bbosch-21", items: 8 },
  luminarias: { formato: "INSP-22", norma: "EST-ELEC-MLP-Bbosch-22", items: 18 },
  tablero_electrico_bt: { formato: "INSP-23", norma: "EST-ELEC-MLP-Bbosch-23", items: 20 },
  parque_generador: { formato: "INSP-24", norma: "EST-ELEC-MLP-Bbosch-24", items: 25 },
  filtro_armonico_statcom: { formato: "INSP-25", norma: "EST-ELEC-MLP-Bbosch-25", items: 94 },
  tablero_respaldo_ups: { formato: "INSP-26", norma: "EST-ELEC-INSP-MLP-Bbosch-26", items: 29 },
  filtro_molino_bolas_5002: { formato: "INSP-27", norma: "EST-ELEC-MLP-Bbosch-27", items: 142 },
  filtro_molino_sag_5001: { formato: "INSP-28", norma: "EST-ELEC-MLP-Bbosch-28", items: 206 },
  switchgear_ppch: { formato: "INSP-29", norma: "EST-ELEC-MLP-Bbosch-29", items: 22 },
  sala_electrica_740_er_5002: { formato: "INSP-30", norma: "EST-ELEC-INSP-MLP-Bbosch-30", items: 163 },
  ficha_generadores_agk: { formato: "INSP-31", norma: "EST-ELEC-INSP-MLP-Bbosch-31", items: 67 },
  checklist_grupo_generador: { formato: "INSP-32", norma: "EST-ELEC-INSP-MLP-Bbosch-32", items: 15 },
  sala_electrica_741_er_5001: { formato: "INSP-33", norma: "EST-ELEC-INSP-MLP-Bbosch-33", items: 169 },
  reles_proteccion: { formato: "INSP-34", norma: "EST-ELEC-INSP-MLP-Bbosch-34", items: 31 },
  banco_condensadores_ppch: { formato: "INSP-35", norma: "EST-ELEC-INSP-MLP-Bbosch-35", items: 19 },
  cerco_perimetral_statcom: { formato: "INSP-37", norma: "EST-ELEC-MLP-Bbosch-37", items: 12 },
  carga_combustible_piuquenes: { formato: "INSP-38", norma: "EST-ELEC-MLP-Bbosch-38", items: 32 },
  limpieza_sala_740_er_5002_l4: { formato: "INSP-39", norma: "EST-ELEC-MLP-Bbosch-39", items: 22 },
  pruebas_generadores_puerto_mauro: { formato: "INSP-40", norma: "EST-ELEC-INSP-MLP-Bbosch-40", items: 57 },
  sala_electrica_741_er_5002: { formato: "INSP-41", norma: "EST-ELEC-INSP-MLP-Bbosch-41", items: 35 },
};

function plantilla(tipo: string): FormTemplateSchema {
  const res = validateTemplate(cargar().get(tipo));
  if (!res.ok) throw new Error(`${tipo}: ${res.errors.join("; ")}`);
  return res.template;
}
const items = (t: FormTemplateSchema) => t.sections.flatMap((s) => s.items);

describe("plantillas INSP-16 a INSP-41 (seed_plantillas_insp_16_41.sql)", () => {
  it("carga las 25 y cada una pasa el validador de la app", () => {
    expect([...cargar().keys()].sort()).toEqual(Object.keys(ESPERADO).sort());
    for (const tipo of Object.keys(ESPERADO)) expect(() => plantilla(tipo)).not.toThrow();
  });

  it("cada una tiene la cantidad de ítems del Word y su norma", () => {
    for (const [tipo, e] of Object.entries(ESPERADO)) {
      const t = plantilla(tipo);
      expect(items(t), tipo).toHaveLength(e.items);
      expect(t.meta?.norma, tipo).toBe(e.norma);
      expect(t.nomenclature, tipo).toBeTruthy();
    }
  });

  it("piden TAG, OT y fecha, y los 3 firmantes; ninguna menciona STN ni deja marcas ##", () => {
    expect(sql).not.toMatch(/STN/);
    expect(sql).not.toContain("##");
    for (const tipo of Object.keys(ESPERADO)) {
      const t = plantilla(tipo);
      expect(t.header.map((h) => h.key), tipo).toEqual(expect.arrayContaining(["tag", "ot", "fecha", "h_inicio", "h_fin"]));
      expect(t.roles).toEqual(["Encargado de la actividad", "Supervisor Bbosch", "Planificador Bbosch"]);
    }
  });

  it("los grupos generadores (INSP-18, 24 y 40) y las patas de INSP-19 son secciones repetibles", () => {
    for (const tipo of ["pruebas_generadores_chacay_mina", "parque_generador", "pruebas_generadores_puerto_mauro"]) {
      const rep = plantilla(tipo).sections.filter((s) => s.repetible);
      expect(rep.map((s) => s.title), tipo).toEqual(["Grupo generador"]);
      expect(rep[0].items[0], tipo).toMatchObject({ type: "text", label: "TAG del grupo generador", required: true });
    }
    const pata = plantilla("cables_tierras_escalerillas").sections;
    expect(pata).toHaveLength(1);
    expect(pata[0]).toMatchObject({ title: "Pata", repetible: true });
  });

  it("las lecturas piden su unidad (V, A, °C, h, kWh, %)", () => {
    const unit = (tipo: string, texto: string) => {
      const i = items(plantilla(tipo)).find((x) => x.label.includes(texto));
      return i && "unit" in i ? i.unit : "no-existe";
    };
    expect(unit("grupo_generador", "Tensión de cargador")).toBe("V");
    expect(unit("grupo_generador", "Corriente cargador")).toBe("A");
    expect(unit("grupo_generador", "Horómetro")).toBe("h");
    expect(unit("pruebas_generadores_chacay_mina", "Nivel de Diesel")).toBe("%");
    expect(unit("pruebas_generadores_chacay_mina", "Energía actual")).toBe("kWh");
    expect(unit("pruebas_generadores_puerto_mauro", "Temperatura de aceite")).toBe("°C");
    expect(unit("cables_tierras_escalerillas", "Voltaje tierra")).toBe("V");
  });

  it("INSP-29 anota horómetro y operaciones de cada carro; INSP-25, 27, 28, 30, 33 y 41 van por componente o tablero", () => {
    const carros = items(plantilla("switchgear_ppch")).filter((i) => i.type === "nameplate");
    expect(carros).toHaveLength(5);
    for (const tipo of ["filtro_armonico_statcom", "filtro_molino_bolas_5002", "filtro_molino_sag_5001", "sala_electrica_740_er_5002", "sala_electrica_741_er_5001", "sala_electrica_741_er_5002"]) {
      const t = plantilla(tipo);
      expect(t.sections.filter((s) => /\(.+\)/.test(s.title)).length, tipo).toBeGreaterThanOrEqual(2);
    }
    expect(plantilla("sala_electrica_741_er_5002").sections.map((s) => s.title).slice(0, 2)).toEqual([
      "Tablero Alumbrado (740-LP-5001)",
      "Tablero Instrumentación 120 VAC (741-JP-1303)",
    ]);
  });

  it("los tipos de equipo del seed son exactamente los de INSP-16 a 41 del catálogo, todos disponibles", () => {
    const delCatalogo = FORMATOS.filter((f) => f.tipo === "INSP" && Number(f.id.slice(5)) >= 16);
    expect(delCatalogo).toHaveLength(25);
    expect(delCatalogo.every((f) => f.estado === "disponible" && f.plantilla?.modo === "plan_matriz")).toBe(true);
    expect(Object.fromEntries(delCatalogo.map((f) => [f.plantilla!.tipoEquipo, f.id]))).toEqual(
      Object.fromEntries(Object.entries(ESPERADO).map(([tipo, e]) => [tipo, e.formato])),
    );
    expect(FORMATOS.filter((f) => f.estado !== "disponible")).toEqual([]);
  });

  it("es repetible: tipos con on conflict y plantillas con on conflict do nothing", () => {
    expect((sql.match(/on conflict \(code\) do nothing/g) ?? []).length).toBe(25);
    expect((sql.match(/on conflict \(equipment_type_id, work_mode_id, version\) do nothing/g) ?? []).length).toBe(25);
  });
});
