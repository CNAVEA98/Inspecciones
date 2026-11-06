/**
 * Genera las cuentas de desarrollo LOCALES con contraseñas aleatorias propias de este equipo.
 * Las contraseñas ya no se versionan (el repositorio es público): se guardan en `supabase/.claves-dev.json` y el SQL
 * resultante en `supabase/seed_usuarios_dev.sql`; ambos archivos están en `.gitignore`.
 *
 * Uso:  corepack pnpm seed:usuarios            (crea los archivos si faltan; conserva las claves existentes)
 *       corepack pnpm seed:usuarios --nuevas   (genera claves nuevas)
 * Después: corepack pnpm supabase db reset
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const CLAVES = "supabase/.claves-dev.json";
const PLANTILLA = "supabase/seed_usuarios_dev.plantilla.sql";
const SALIDA = "supabase/seed_usuarios_dev.sql";
const USUARIOS = ["administrador", "supervisor_a", "supervisor_b", "programador_a", "programador_b", "tecnico_a", "tecnico_b"];

const nuevas = process.argv.includes("--nuevas");
let claves = existsSync(CLAVES) && !nuevas ? JSON.parse(readFileSync(CLAVES, "utf8")) : {};
for (const u of USUARIOS) claves[u] ??= randomBytes(12).toString("base64url");
writeFileSync(CLAVES, JSON.stringify(claves, null, 2) + "\n");

let sql = readFileSync(PLANTILLA, "utf8");
for (const u of USUARIOS) sql = sql.replaceAll(`{{CLAVE_${u.toUpperCase()}}}`, claves[u]);
if (sql.includes("{{CLAVE_")) throw new Error("Quedaron claves sin reemplazar en la plantilla.");
writeFileSync(SALIDA, sql);
console.log(`Listo: ${SALIDA} y ${CLAVES} (no se versionan). Siguiente paso: corepack pnpm supabase db reset`);
