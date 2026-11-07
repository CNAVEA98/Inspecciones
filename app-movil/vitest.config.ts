import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const aqui = (ruta: string) => fileURLToPath(new URL(ruta, import.meta.url));

/** Pruebas solo de la lógica pura de `src/lib` (sin React Native ni módulos nativos). */
export default defineConfig({
  resolve: {
    alias: {
      "@": aqui("./src"),
      "expo-crypto": aqui("./test/expo-crypto.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["src/lib/**/*.test.ts"],
  },
});
