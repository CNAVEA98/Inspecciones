import { readFileSync } from "node:fs";
import path from "node:path";
import { filaAFormato, ordenarFilas, type FilaFormatoBD, type Formato } from "./catalogo";

/**
 * Los formatos tal como los carga la migración 0016 (bloque `$formatos$ … $formatos$`). Solo para tests y scripts:
 * la app los lee de la base. Usa `node:fs`, no importar desde componentes.
 */
export function formatosDeLaMigracion(): Formato[] {
  const sql = readFileSync(path.resolve(__dirname, "../../../supabase/migrations/0016_catalogo_formatos.sql"), "utf8");
  const json = sql.match(/\$formatos\$([\s\S]*?)\$formatos\$/)?.[1];
  if (!json) throw new Error("No se encontró el bloque $formatos$ en la migración 0016");
  const filas = (JSON.parse(json) as Omit<FilaFormatoBD, "activo">[]).map((f) => ({ ...f, activo: true }));
  return ordenarFilas(filas).map(filaAFormato);
}
