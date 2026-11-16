import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * El `router` global de expo-router depende de que el contenedor de navegación lo deje enlazado; si se desmonta o se
 * vuelve a registrar, queda en `unboundRouter` y cualquier botón que lo use cierra la app con «The imperative router is
 * unavailable before the first render has finished» (visto en el APK 1.1.7 al tocar «Nuevo Standard», 2026-11-16).
 * Las pantallas deben usar `useRouter()`, que toma la navegación del contexto.
 */
const SRC = fileURLToPath(new URL("..", import.meta.url));

function archivos(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const ruta = join(dir, n);
    if (statSync(ruta).isDirectory()) return archivos(ruta);
    return /\.tsx?$/.test(n) && !n.endsWith(".test.ts") ? [ruta] : [];
  });
}

describe("navegación", () => {
  it("ninguna pantalla importa el router global de expo-router", () => {
    const conRouterGlobal = archivos(SRC).filter((f) =>
      /import\s*\{[^}]*\brouter\b[^}]*\}\s*from\s*["']expo-router["']/.test(readFileSync(f, "utf8")),
    );
    expect(conRouterGlobal).toEqual([]);
  });
});
