# Licencias de terceros · Inspección Eléctrica Bbosch-MLP

Revisado el 2026-11-03 (versión V1.1.0) con `corepack pnpm licenses list --prod`. Vuelva a correrlo al agregar o
actualizar dependencias y actualice este archivo si aparece una licencia distinta de las de abajo.

## Dependencias de producción (170 paquetes)

| Licencia | Paquetes | Uso permitido |
|---|---|---|
| MIT | 127 (Next, React, Supabase, @react-pdf/renderer, Serwist, signature_pad, react-hook-form, Zod, clsx…) | Sí, conservando el aviso de copyright |
| Apache-2.0 | 9 (Dexie, sharp, SWC, class-variance-authority…) | Sí |
| ISC | 11 (lucide-react —íconos—, semver, idb…) | Sí |
| BlueOak-1.0.0 | 6 (glob, minimatch, lru-cache… usados al construir el service worker) | Sí |
| BSD-3-Clause, 0BSD, MIT o CC0 | 4 (source-map, tslib, type-fest) | Sí |
| CC-BY-4.0 | 1 (caniuse-lite, datos de compatibilidad usados al compilar) | Sí, con atribución (no se distribuye en la app) |
| Apache-2.0 y LGPL-3.0 | 1 (`@img/sharp-win32-x64`, libvips) | Sí: se usa en el servidor para optimizar imágenes, enlazada sin modificar |

No hay licencias que obliguen a publicar el código de la app (GPL/AGPL).

## Tipografías

| Fuente | Dónde | Licencia |
|---|---|---|
| Geist y Geist Mono (Vercel) | Toda la interfaz, vía `next/font/google` | SIL Open Font License 1.1: uso comercial permitido. Se descarga al compilar y la sirve la propia app (no se llama a Google mientras se usa) |
| Helvetica y Courier | Informe PDF (`@react-pdf/renderer`) | Fuentes estándar de PDF: no se incrustan, las aporta el lector de PDF |

## Imágenes y marcas

| Recurso | Origen | Estado |
|---|---|---|
| `public/brand/bbosch-logo.png`, `bbosch-logo-solo.png` | Marca de Bbosch | Uso autorizado por Bbosch (aplicación aceptada por Bbosch y MLP, 2026-11-03) |
| Nombre «MLP» / Minera Los Pelambres | Cliente | Uso autorizado por MLP (misma aceptación) |
| `public/icons/icon-*.png` | Íconos de la app generados para el proyecto | Propios |
| Íconos de interfaz | `lucide-react` | ISC |
