import { createSerwistRoute } from "@serwist/turbopack";

// Sirve el service worker (`src/app/sw.ts`) en /serwist/sw.js con su lista de archivos del build.
export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute({
  swSrc: "src/app/sw.ts",
  useNativeEsbuild: true,
});
