# Instrucciones del proyecto · Inspecciones MLP

PWA de inspecciones de terreno para infraestructura eléctrica de MLP. Se trabaja en equipo (2 personas) con el
repositorio de GitHub `CNAVEA98/Inspecciones_BBOSCH` (debe ser privado; hoy figura PUBLIC, ver el Maestro): cada persona (y cada sesión de Claude) debe dejar
el proyecto documentado y cada cambio debe poder rastrearse en git y en la bitácora.

## LECTURA OBLIGATORIA AL INICIAR CADA SESIÓN

**Antes de hacer cualquier cosa, lea `docs/MAESTRO.md` completo** (se carga abajo) y luego `docs/bitacora/ESTADO.md` (estado, pendientes y decisiones) y las 3 últimas entradas de `docs/bitacora/REGISTRO.md`.
El Maestro es el directorio de todo el proyecto: dónde está cada documento y cada carpeta, el estado actual, lo que
falta y las revisiones pendientes. Si no tiene contexto previo (otra cuenta o PC), parta por ahí. Al cerrar una
mejora, actualice `docs/bitacora/ESTADO.md` (y la sección 6 del Maestro si cambia el contexto de negocio) en el mismo commit que la bitácora.

@docs/MAESTRO.md

@AGENTS.md

## Regla de la bitácora (obligatoria)

**Cada mejora finalizada se registra en la bitácora oficial (`docs/bitacora/`) antes de darla por cerrada.** Hay una sola bitácora para web y app.

- Agregue una entrada al inicio de `docs/bitacora/REGISTRO.md` con el formato de `docs/bitacora/LEEME.md`, etiquetada `[WEB]` o `[APP]`
  (fecha, título, autor, qué se hizo, archivos, verificación con resultado real, pendientes y riesgos).
- Reescriba `docs/bitacora/ESTADO.md` (estado, pendientes y decisiones) si cambian, con la fecha del día en su primera línea.
- Si algo no se pudo verificar, escríbalo como «no verificado» y diga por qué. No marque como hecho lo no probado.
- Antes de empezar a trabajar, lea la bitácora para saber el estado y no repetir ni pisar el trabajo de otra persona.
- No borre entradas antiguas; si algo se revierte, agregue una entrada nueva.

### App móvil (`app-movil/`)

Los cambios de la app nativa (React Native/Expo) se registran en la misma bitácora con la etiqueta `[APP]`, con la
misma regla (mismo commit, verificación real). Instrucciones de esa carpeta en `app-movil/CLAUDE.md`. Si un cambio
toca la web y la app, una sola entrada con ambas etiquetas.

## Flujo de trabajo en equipo (GitHub)

Trazabilidad: **la entrada de la bitácora viaja en el mismo commit que el cambio** (no en uno aparte).

1. Antes de empezar: `git pull` en `main` y leer `docs/bitacora/ESTADO.md`.
2. Trabajar en una rama (`git switch -c tipo/descripcion-corta`, p. ej. `feat/bandeja-supervisor`), nunca directo en `main`.
3. Al terminar: correr lint, tsc, tests y build; agregar la entrada en `docs/bitacora/REGISTRO.md` (autor = quien lo hizo,
   indicando el nombre de la rama) y hacer commit con el cambio y la bitácora juntos. Mensaje claro, en español.
   **Versión:** cada mejora sube el último número (V1.1.0 → V1.1.1…) en `package.json` y `src/lib/version.ts`
   (se ve al pie de la app) y se anota en la entrada de la bitácora (ver «Versiones» en `docs/bitacora/LEEME.md`).
4. Subir la rama y abrir un Pull Request hacia `main`; la otra persona lo revisa y lo une.
5. Si hay conflicto en `docs/bitacora/REGISTRO.md` al unir, conserve **ambas** entradas (la más reciente arriba) y no borre ninguna.
6. Hacer `push` o abrir PR requiere confirmación explícita del usuario en cada ocasión.
7. Cambios en el esquema: siempre una migración nueva en `supabase/migrations`, nunca editar una ya aplicada.

## Contexto y restricciones

- Stack fijo: Next.js (App Router, TypeScript estricto), Tailwind, Supabase (Postgres, Auth, Storage, RLS), despliegue futuro en Vercel.
- Next 16: el middleware se llama `src/proxy.ts`. Lea `node_modules/next/dist/docs/` antes de usar APIs de Next (ver `AGENTS.md`).
- Toda la UI en español (Chile); fechas en `America/Santiago`. Sin modo oscuro, analytics ni notificaciones push.
- Diseño: seguir `docs/guias/DESIGN.md` (sistema «Cobre»). El logo está en `public/brand/bbosch-logo.png`.
- Dependencias permitidas: dexie, zod, react-hook-form, signature_pad, @react-pdf/renderer, serwist, @serwist/turbopack (con esbuild y esbuild-wasm) y las ya instaladas.
  Cualquier otra: preguntar antes.
- No tocar archivos `.env*`. No ejecutar migraciones contra un Supabase remoto: solo Supabase CLI local y archivos SQL.
  No modificar migraciones ya aplicadas (crear una nueva).
- RLS en todas las tablas; buckets privados; sin credenciales en el código.
- Pedir confirmación antes de borrar archivos, conectar a un Supabase remoto o hacer deploy.

## Comandos

```bash
corepack pnpm lint
corepack pnpm tsc --noEmit
corepack pnpm test
corepack pnpm build
corepack pnpm supabase start      # requiere Docker (WSL2)
corepack pnpm seed:usuarios         # 1.ª vez en cada equipo: crea las cuentas locales con claves aleatorias (no se versionan)
corepack pnpm supabase db reset   # aplica migraciones y seed
```

Un paso se considera terminado solo con lint, tsc, tests y build en verde, y la bitácora actualizada.

## Datos que no se ven leyendo el código

- `src/lib/formatos`: los formatos viven en la tabla `formatos` (migración 0016); los tests los leen de esa migración con `semilla.ts`.
- `src/data/maestro-tags.json` se genera con `python scripts/export-maestro.py` (ver `docs/guias/EXPORT_MAESTRO.md`); no editar a mano.
- Directorio completo del repositorio: `docs/MAESTRO.md`, sección 3.
