/**
 * Exporta el catálogo de formatos (áreas, equipos, modos, combinaciones, plantillas publicadas y formatos) del Supabase al que
 * apuntará la app, a `src/data/catalogo-incluido.json`. La app lo usa cuando todavía no descargó el catálogo (primer uso sin
 * señal). Los identificadores son distintos en cada base, así que hay que exportarlo de la MISMA base que usa la compilación.
 *
 * Solo lectura (`supabase db query --read-only`). Ejecutar desde la raíz del repositorio:
 *   node app-movil/scripts/exportar-catalogo.mjs --remote=etdeiyjzibgihqtvdrpt
 * Volver a exportar y recompilar cuando cambie un formato o se publique una plantilla nueva.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ref = process.argv.find((a) => a.startsWith("--remote="))?.split("=")[1];
if (!ref || !/^[a-z0-9]{20}$/.test(ref)) {
  console.error("Uso: node app-movil/scripts/exportar-catalogo.mjs --remote=<project-ref>");
  process.exit(1);
}

const SQL = `select json_build_object(
  'areas', (select coalesce(json_agg(a order by a.sort), '[]') from (select id, code, name, sort from public.areas where active) a),
  'equipment_types', (select coalesce(json_agg(e order by e.sort), '[]') from (select id, code, name, sort from public.equipment_types where active) e),
  'work_modes', (select coalesce(json_agg(m order by m.sort), '[]') from (select id, code, name, sort from public.work_modes where active) m),
  'catalog_combinations', (select coalesce(json_agg(c), '[]') from (select equipment_type_id, work_mode_id, template_id from public.catalog_combinations) c),
  'form_templates', (select coalesce(json_agg(t), '[]') from (select id, equipment_type_id, work_mode_id, version, schema from public.form_templates where status = 'published') t),
  'formatos', (select coalesce(json_agg(f), '[]') from (select id, tipo, titulo, familia, areas, designadores, campo, varios_equipos, areas_por_confirmar, tipo_equipo_code, modo_code, activo, orden from public.formatos) f)
) as catalogo`;

// La consulta va en un archivo: en Windows (shell) un argumento con espacios y saltos de línea se parte.
const dir = mkdtempSync(path.join(tmpdir(), "catalogo-"));
const archivoSql = path.join(dir, "catalogo.sql");
writeFileSync(archivoSql, SQL);
let salida;
try {
  salida = execFileSync(
    "corepack",
    ["pnpm", "supabase", "db", "query", `--remote=${ref}`, "--read-only", "--file", JSON.stringify(archivoSql)],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, shell: process.platform === "win32" },
  );
} finally {
  rmSync(dir, { recursive: true, force: true });
}
const json = JSON.parse(salida.slice(salida.indexOf("{")));
const filas = json.rows?.[0]?.catalogo;
if (!filas || !Array.isArray(filas.form_templates)) throw new Error("La consulta no devolvió el catálogo.");

const destino = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "catalogo-incluido.json");
writeFileSync(destino, JSON.stringify({ origen: ref, generadoEn: new Date().toISOString(), filas }) + "\n");
console.log(
  `Catálogo de ${ref}: ${filas.areas.length} áreas, ${filas.equipment_types.length} equipos, ${filas.form_templates.length} plantillas, ` +
    `${filas.formatos.length} formatos → ${path.relative(process.cwd(), destino)}`,
);
