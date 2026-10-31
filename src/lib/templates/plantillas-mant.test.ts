import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FORMATOS } from "@/lib/formatos/catalogo";
import type { FormTemplateSchema } from "./schema";
import { validateTemplate } from "./validate";

const sql = readFileSync(path.resolve(__dirname, "../../../supabase/seed_plantillas_mant.sql"), "utf8");

/** Cada `insert … $tpl$ {json} $tpl$ … where et.code = '…'` del seed. */
function cargar(): Map<string, unknown> {
  const mapa = new Map<string, unknown>();
  for (const b of sql.split("insert into public.form_templates").slice(1)) {
    const json = b.match(/\$tpl\$([\s\S]*?)\$tpl\$/)?.[1];
    const tipo = b.match(/where et\.code = '([a-z_0-9]+)' and wm\.code = '([a-z_]+)'/);
    if (!json || !tipo) throw new Error("Bloque de plantilla sin JSON o sin tipo de equipo");
    expect(tipo[2]).toBe("mantenimiento_programado");
    mapa.set(tipo[1], JSON.parse(json));
  }
  return mapa;
}

/** Cantidad de ítems y nomenclatura según el Word revisado de cada mantención (MANT-18 y 19 aún no están). */
const ESPERADO: Record<string, { mant: string; items: number; estados: "A" | "B" | "inspeccion" }> = {
  mant_generadores_locales: { mant: "MANT-01", items: 24, estados: "A" },
  mant_parques_generacion: { mant: "MANT-02", items: 26, estados: "A" },
  mant_subestacion_movil: { mant: "MANT-03", items: 50, estados: "A" },
  mant_cargadores_baterias: { mant: "MANT-04", items: 28, estados: "inspeccion" },
  mant_tablero_bt: { mant: "MANT-05", items: 13, estados: "A" },
  mant_reconectador: { mant: "MANT-06", items: 21, estados: "inspeccion" },
  mant_switchgear_sala_12: { mant: "MANT-07", items: 57, estados: "B" },
  mant_switchgear_estaciones: { mant: "MANT-08", items: 58, estados: "B" },
  mant_switchgear_sala_1_y_12: { mant: "MANT-09", items: 113, estados: "B" },
  mant_switchgear_mauro: { mant: "MANT-10", items: 58, estados: "B" },
  mant_transformador_aereo: { mant: "MANT-11", items: 17, estados: "B" },
  mant_filtro_chancado: { mant: "MANT-12", items: 96, estados: "B" },
  mant_filtro_planta: { mant: "MANT-13", items: 149, estados: "B" },
  mant_filtro_ppch: { mant: "MANT-14", items: 47, estados: "B" },
  mant_parrones: { mant: "MANT-15", items: 19, estados: "inspeccion" },
  mant_transformador_piso: { mant: "MANT-16", items: 37, estados: "A" },
  mant_transformador_poder_correas: { mant: "MANT-17", items: 26, estados: "A" },
  mant_linea_aerea: { mant: "MANT-20", items: 17, estados: "B" },
};

const A = ["SI", "NO", "RL", "NR", "BN", "ML", "RMP", "NT"];
const B = ["RL", "NR", "BN", "ML", "RMP", "NT"];

function plantilla(tipo: string): FormTemplateSchema {
  const res = validateTemplate(cargar().get(tipo));
  if (!res.ok) throw new Error(`${tipo}: ${res.errors.join("; ")}`);
  return res.template;
}
const items = (t: FormTemplateSchema) => t.sections.flatMap((s) => s.items);

describe("plantillas de mantención (seed_plantillas_mant.sql)", () => {
  it("carga las 18 y cada una pasa el validador de la app", () => {
    expect([...cargar().keys()].sort()).toEqual(Object.keys(ESPERADO).sort());
    for (const tipo of Object.keys(ESPERADO)) expect(() => plantilla(tipo)).not.toThrow();
  });

  it("cada una tiene la cantidad de ítems del Word y su norma EST-ELEC-MANT-MLP-BBOSCH-NN", () => {
    for (const [tipo, e] of Object.entries(ESPERADO)) {
      const t = plantilla(tipo);
      expect(items(t), tipo).toHaveLength(e.items);
      expect(t.meta?.norma, tipo).toBe(`EST-ELEC-MANT-MLP-BBOSCH-${e.mant.slice(5)}`);
    }
  });

  it("usan la nomenclatura de su Word: SI/NO/RL…, RL/NR…, o la de inspección", () => {
    for (const [tipo, e] of Object.entries(ESPERADO)) {
      const t = plantilla(tipo);
      if (e.estados === "A") expect(t.estados, tipo).toEqual(A);
      else if (e.estados === "B") expect(t.estados, tipo).toEqual(B);
      else expect(t.estados, tipo).toBeUndefined();
      expect(t.nomenclature, tipo).toBeTruthy();
    }
  });

  it("piden TAG (o circuito), OT y fecha, y los 3 firmantes; ninguna menciona STN", () => {
    expect(sql).not.toMatch(/\bSTN\b/);
    for (const tipo of Object.keys(ESPERADO)) {
      const t = plantilla(tipo);
      expect(t.header.map((h) => h.key), tipo).toEqual(expect.arrayContaining(["tag", "ot", "fecha"]));
      expect(t.roles).toEqual(["Encargado de la actividad", "Supervisor Bbosch", "Planificador Bbosch"]);
    }
  });

  it("MANT-05 responde SI / NO y pide la capacidad de la protección principal como número", () => {
    const t = plantilla("mant_tablero_bt");
    const verif = items(t).filter((i) => i.type === "verificacion");
    expect(verif).toHaveLength(12);
    for (const i of verif) expect(i.estados).toEqual(["SI", "NO"]);
    expect(items(t).find((i) => i.type === "number")).toMatchObject({ unit: "A", required: false });
  });

  it("MANT-07 a 10 traen el protocolo de torque (ítems del Word) y la tabla de interruptores", () => {
    const torque = (tipo: string) =>
      items(plantilla(tipo)).filter((i) => i.type === "nameplate" && i.label.startsWith("Protocolo de torque"));
    expect(torque("mant_switchgear_sala_12")).toHaveLength(12);
    expect(torque("mant_switchgear_estaciones")).toHaveLength(14);
    expect(torque("mant_switchgear_sala_1_y_12")).toHaveLength(26); // ítems 1–14 y 30–41 que quedaron en el Word
    expect(torque("mant_switchgear_mauro")).toHaveLength(14);
    const fila = torque("mant_switchgear_sala_12")[0];
    if (fila.type !== "nameplate") throw new Error("ficha de torque");
    expect(fila.fields.map((f) => f.key)).toEqual(["cubiculo", "revision", "torque", "f1", "f2", "f3", "pernos", "observaciones"]);
    expect(fila.fields.find((f) => f.key === "torque")?.unit).toBe("Nm");
    // Sala 12: 12 circuitos con su N° de operaciones; Sala 1 + Sala 12 de MANT-09: 39 + 12
    expect(items(plantilla("mant_switchgear_sala_12")).filter((i) => i.type === "number")).toHaveLength(12);
    expect(items(plantilla("mant_switchgear_sala_1_y_12")).filter((i) => i.type === "number")).toHaveLength(51);
  });

  it("los filtros armónicos preguntan el estado (Bueno/Malo) y si se realizó mantención (Sí/No) por componente", () => {
    const t = plantilla("mant_filtro_ppch");
    const porComponente = items(t).filter((i) => i.type === "verificacion" && i.estados);
    expect(porComponente).toHaveLength(36); // 18 componentes × 2
    expect(porComponente.filter((i) => i.type === "verificacion" && i.estados?.join() === "BN,ML")).toHaveLength(18);
    expect(porComponente.filter((i) => i.type === "verificacion" && i.estados?.join() === "SI,NO")).toHaveLength(18);
  });

  it("los valores se piden con su unidad (°C, V, A) en las lecturas", () => {
    const unit = (tipo: string, texto: string) => {
      const i = items(plantilla(tipo)).find((x) => x.label.includes(texto));
      return i && "unit" in i ? i.unit : "no-existe";
    };
    expect(unit("mant_subestacion_movil", "temperatura actual de enrollado")).toBe("°C");
    expect(unit("mant_generadores_locales", "tensión de baterías")).toBe("V");
    expect(unit("mant_cargadores_baterias", "corriente de consumo")).toBe("A");
    expect(unit("mant_transformador_piso", "Capacidad de los fusibles")).toBe("A");
  });

  it("MANT-20 registra una estructura por inspección", () => {
    const t = plantilla("mant_linea_aerea");
    expect(t.header.map((h) => h.key)).toContain("estructura");
    expect(t.note).toContain("una estructura");
  });

  it("los tipos de equipo del seed son exactamente los de las mantenciones disponibles en el catálogo", () => {
    const delCatalogo = FORMATOS.filter((f) => f.tipo === "MANT" && f.estado === "disponible").map((f) => [
      f.plantilla!.tipoEquipo,
      f.id,
    ]);
    expect(Object.fromEntries(delCatalogo)).toEqual(Object.fromEntries(Object.entries(ESPERADO).map(([tipo, e]) => [tipo, e.mant])));
    expect(FORMATOS.filter((f) => f.tipo === "MANT" && f.estado === "disponible").every((f) => f.plantilla?.modo === "mantenimiento_programado")).toBe(true);
    // MANT-18 y 19 siguen sin plantilla (sus Word aún son .doc)
    expect(FORMATOS.filter((f) => f.tipo === "MANT" && f.estado !== "disponible").map((f) => f.id)).toEqual(["MANT-18", "MANT-19"]);
  });

  it("es repetible: tipos con on conflict y plantillas con on conflict do nothing", () => {
    expect((sql.match(/on conflict \(code\) do nothing/g) ?? []).length).toBe(18);
    expect((sql.match(/on conflict \(equipment_type_id, work_mode_id, version\) do nothing/g) ?? []).length).toBe(18);
  });
});
