# App móvil · Inspecciones MLP (React Native)

App nativa para **iPhone y Android** del técnico de terreno. Su razón de ser: **el técnico hace la inspección sin
señal y, cuando vuelve a tener señal, se envía sola**. La PWA no lo resolvía (se abre desde un enlace; decisión de
Cristóbal del 2026-11-06, ver «Decisiones» en `docs/bitacora/ESTADO.md`).

- **Quién la usa:** solo el técnico. Supervisor, programador y administrador siguen en la web Next (`src/`).
- **Backend:** el mismo Supabase (Auth, Postgres con RLS, Storage, RPC `submit_inspection`). No se crea otro.
- **Estado (2026-11-07, rama `feat/app-movil`):** proyecto Expo **SDK 58** (React Native 0.88, React 19.3, TypeScript
  estricto) creado, con navegación `expo-router` (rutas en `src/app/`) y una pantalla provisoria. Aún no hay lógica ni pantallas reales.

## Cómo correrla

Esta carpeta usa **npm** (no pnpm como la web): Expo y Metro funcionan mejor así y no se mezcla con el `pnpm-lock.yaml`
de la raíz.

Detalle de ejecución en `docs/guias/DESARROLLO.md` y la bitácora oficial (`docs/bitacora/`, etiqueta `[APP]`): todo cambio en
esta carpeta se registra ahí.

```powershell
cd C:\Proyectos\mlp-inspecciones\app-movil
npm install
npx expo start
```

## Dependencias (autorizadas por Cristóbal el 2026-11-07)

| Para qué | Paquete |
|---|---|
| Base local sin señal (borradores, cola, catálogo) | `expo-sqlite` |
| Fotos como archivos en el teléfono | `expo-file-system` |
| Cámara y galería | `expo-image-picker` |
| Comprimir fotos (lado mayor 1600 px, JPEG 0,7) y quitar metadatos | `expo-image-manipulator` |
| Saber si hay señal | `@react-native-community/netinfo` |
| Firma dibujada | `react-native-signature-canvas` (usa `react-native-webview`) |
| Navegación entre pantallas | `expo-router` (con `expo-linking`, `expo-constants`, `react-native-screens`, `react-native-safe-area-context`) |
| Backend y validación (las mismas de la web) | `@supabase/supabase-js`, `zod` |

`overrides` en `package.json` fuerza `glob` ≥14.0.3 y `minimatch` ≥11.0.1 (vulnerabilidades moderadas dentro del CLI de
Expo; misma corrección que la raíz). Quitar cuando Expo las actualice. `AGENTS.md` y `.claude/settings.json` (plugin de
Expo para Claude Code) los generó `create-expo-app`.

## Plan (propuesto, sin aprobar por completo)

1. **Proyecto Expo** (React Native + TypeScript estricto) en esta carpeta.
2. **Lógica compartida:** esquemas Zod y validación (`src/lib/templates`), borradores (`src/lib/tecnico/draft.ts`) y
   cola de envío (`src/lib/offline/outbox.ts`, `sync.ts`, `transport.ts`) se usan desde aquí detrás de una interfaz de
   almacenamiento: Dexie en la web, SQLite en el teléfono. **Primero se propone el diseño** (Maestro, sección 5.7).
3. **Pantallas del técnico:** ingreso → catálogo guardado en el teléfono → Área, Trabajo, Familia, Formato →
   formulario con fotos y firma → cola que envía al reconectar.
4. **Prueba de aceptación sin señal** en iPhone y Android reales (Maestro, sección 5.4).

## Lo que hay que rehacer para el teléfono

Compresión de fotos (`compress.ts` usa canvas), fotos guardadas como archivos y no dentro de la base, firma
(`signature_pad` es del navegador), detección de red, ingreso (hoy por cookies) y las pantallas del técnico.

## Reglas

**Skill de buenas prácticas:** `.claude/skills/react-native-skills/` (Vercel Labs). Revísela antes de crear pantallas:
listas virtualizadas (selector de TAG, borradores), `expo-image` para fotos, `Pressable`, stack nativo de `expo-router`,
`gap` y `StyleSheet.create`. Sus librerías recomendadas que aún no están instaladas requieren autorización.


Las mismas del repositorio (`CLAUDE.md`): rama nueva, bitácora en el mismo commit, UI en español (Chile), fechas en
`America/Santiago`, diseño «Cobre» (`docs/guias/DESIGN.md`), sin credenciales en el código.
