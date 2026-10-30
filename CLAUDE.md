# Instrucciones del proyecto · Inspecciones MLP

PWA de inspecciones de terreno para infraestructura eléctrica de MLP. Se trabaja en equipo (2 personas) con el
repositorio privado de GitHub `CNAVEA98/Inspecciones_BBOSCH`: cada persona (y cada sesión de Claude) debe dejar
el proyecto documentado y cada cambio debe poder rastrearse en git y en la bitácora.

@AGENTS.md

## Regla de la bitácora (obligatoria)

**Cada mejora finalizada se registra en `docs/BITACORA.md` antes de darla por cerrada.**

- Agregue una entrada al inicio de la sección «Registro» con el formato descrito en la propia bitácora
  (fecha, título, autor, qué se hizo, archivos, verificación con resultado real, pendientes y riesgos).
- Actualice «Estado actual», «Pendientes» y «Decisiones» si cambian.
- Si algo no se pudo verificar, escríbalo como «no verificado» y diga por qué. No marque como hecho lo no probado.
- Antes de empezar a trabajar, lea la bitácora para saber el estado y no repetir ni pisar el trabajo de otra persona.
- No borre entradas antiguas; si algo se revierte, agregue una entrada nueva.

## Flujo de trabajo en equipo (GitHub)

Trazabilidad: **la entrada de la bitácora viaja en el mismo commit que el cambio** (no en uno aparte).

1. Antes de empezar: `git pull` en `main` y leer `docs/BITACORA.md`.
2. Trabajar en una rama (`git switch -c tipo/descripcion-corta`, p. ej. `feat/bandeja-supervisor`), nunca directo en `main`.
3. Al terminar: correr lint, tsc, tests y build; agregar la entrada en `docs/BITACORA.md` (autor = quien lo hizo,
   indicando el nombre de la rama) y hacer commit con el cambio y la bitácora juntos. Mensaje claro, en español.
4. Subir la rama y abrir un Pull Request hacia `main`; la otra persona lo revisa y lo une.
5. Si hay conflicto en `docs/BITACORA.md` al unir, conserve **ambas** entradas (la más reciente arriba) y no borre ninguna.
6. Hacer `push` o abrir PR requiere confirmación explícita del usuario en cada ocasión.
7. Cambios en el esquema: siempre una migración nueva en `supabase/migrations`, nunca editar una ya aplicada.

## Contexto y restricciones

- Stack fijo: Next.js (App Router, TypeScript estricto), Tailwind, Supabase (Postgres, Auth, Storage, RLS), despliegue futuro en Vercel.
- Next 16: el middleware se llama `src/proxy.ts`. Lea `node_modules/next/dist/docs/` antes de usar APIs de Next (ver `AGENTS.md`).
- Toda la UI en español (Chile); fechas en `America/Santiago`. Sin modo oscuro, analytics ni notificaciones push.
- Diseño: seguir `docs/DESIGN.md` (sistema «Cobre»). El logo está en `public/brand/bbosch-logo.png`.
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
corepack pnpm supabase db reset   # aplica migraciones y seed
```

Un paso se considera terminado solo con lint, tsc, tests y build en verde, y la bitácora actualizada.

## Mapa rápido

- `supabase/migrations`, `supabase/seed.sql`: esquema, RLS, RPC y plantilla del seed.
- `src/lib/templates`: esquema Zod y validación de plantillas y respuestas.
- `src/lib/offline`: Dexie, cola de envío, sincronización, compresión de fotos.
- `src/lib/tecnico`, `src/components/tecnico`, `src/app/tecnico`: flujo del técnico.
- `src/lib/formatos`: catálogo de los 60 formatos (fuente única del flujo de 4 pasos) y filtro del selector de TAG.
- `src/data/maestro-tags.json`: Maestro de TAG, generado con `python scripts/export-maestro.py` (ver `docs/EXPORT_MAESTRO.md`; no editar a mano).
- `src/app/supervisor`: área del supervisor.
- `docs/muestras`: HTML de referencia del formato y del formulario.
