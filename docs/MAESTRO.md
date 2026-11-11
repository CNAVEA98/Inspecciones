# MAESTRO · Inspecciones MLP (lectura obligatoria al iniciar cada sesión)

Este es el **documento de entrada**. Cualquier persona o sesión de Claude, desde cualquier cuenta o PC, debe leerlo
completo **antes de tocar nada**. Dice qué es el proyecto, dónde está cada cosa, cómo está hoy y qué falta.
Si algo de aquí contradice a `docs/bitacora/` o al código, manda el código, luego la bitácora; y este documento
se corrige en el mismo commit.

> **Instantánea:** la versión publicada, el commit y los pendientes vigentes están en `docs/bitacora/ESTADO.md` (su primera línea lleva la fecha).
> Todo lo marcado «no verificado» no se ha probado. Al terminar una mejora se reescribe `ESTADO.md` (no se agrega al final).

## 1. Cómo empezar una sesión (en este orden)

1. `git fetch origin` · `git status` · `git switch main` · `git pull --ff-only origin main`. Si hay cambios locales
   sin commit, no los pise: pregunte.
2. Leer este archivo, luego `docs/bitacora/ESTADO.md` (estado, pendientes, decisiones) y las 3 últimas entradas de `docs/bitacora/REGISTRO.md`.
3. Trabajar en rama nueva (`tipo/descripcion`), nunca directo en `main`. Reglas completas en `CLAUDE.md`.
4. Si cambian dependencias o migraciones: `corepack pnpm install` y `corepack pnpm supabase db reset`.
   **En un equipo nuevo, antes del primer `db reset`: `corepack pnpm seed:usuarios`** (crea las cuentas locales y sus claves; las claves quedan en `supabase/.claves-dev.json`, que no se versiona).
   El CLI de Supabase es dependencia del proyecto (v3.0.0): se usa siempre como `corepack pnpm supabase …`; no hay uno global.
   Para el remoto hace falta `corepack pnpm supabase login` en una terminal interactiva (no funciona desde Claude Code).
5. Al terminar: lint, tsc, tests y build en verde; entrada en la bitácora y versión nueva en el mismo commit; PR.
   `push`, PR, deploy, borrados y cualquier conexión a Supabase remoto **requieren confirmación explícita** del usuario.

## 2. Qué es el proyecto

PWA de inspecciones y mantenciones de terreno de **BBOSCH** para infraestructura eléctrica de **Minera Los Pelambres
(MLP)**. El técnico trabaja **sin señal** y envía al reconectar; supervisor y planificador firman en dos etapas.
60 formatos (INSP-01 a 41 sin el 36, y MANT-01 a 20). Stack: Next.js 16 (App Router), TypeScript estricto, Tailwind,
Supabase (Postgres, Auth, Storage, RLS), Vercel. UI en español (Chile), fechas en `America/Santiago`.
Roles: técnico, supervisor, planificador/programador, administrador. Turnos A/B. Cuentas genéricas por **usuario**
(`TECNICO_A`, `SUPERVISOR_A`, `PROGRAMADOR_A`, `ADMINISTRADOR`…), sin correo.
Repositorio: `CNAVEA98/Inspecciones_BBOSCH` (**PUBLIC** a propósito: Cristóbal y Manuel trabajan con cuentas distintas; ver sección 4).
Equipo: 2 personas (Cristóbal y Manuel).

## 3. Directorio: dónde buscar cada cosa

### Documentos (en el repositorio)

| Archivo | Para qué |
|---|---|
| `docs/MAESTRO.md` | Este documento: entrada, directorio, estado y faltantes |
| `docs/bitacora/` | **Bitácora oficial única (web y app):** `REGISTRO.md` (historial), `ESTADO.md` (estado, pendientes, decisiones), `LEEME.md` (reglas y versiones) |
| `.claude/skills/` | Skills de Vercel Labs: `react-best-practices` y `web-design-guidelines` (web), `react-native-skills` (app móvil, 2026-11-07) |
| `CLAUDE.md` · `AGENTS.md` | Reglas de trabajo en equipo; aviso de que este Next 16 difiere de lo conocido (leer `node_modules/next/dist/docs/`) |
| `docs/guias/DESIGN.md` | Sistema visual «Cobre» (colores, estados BN/ML/NT/NA/NR, severidades) |
| `docs/guias/DEPLOY_VERCEL.md` | Despliegue en Vercel y comprobación de la región `gru1` |
| `docs/guias/EXPORT_MAESTRO.md` · `docs/referencia/MAPEO_ZONA_AREA.md` | Cómo se genera el Maestro de TAG y el mapeo zona → área (el segundo lo escribe el script; no editar a mano) |
| `docs/guias/LICENCIAS.md` | Licencias de dependencias |
| `docs/referencia/COMPARATIVA_MANUALES_2026-11-07.md` | Papel de terreno vs formatos digitales: diferencias, auditoría del menú y pendientes |
| `docs/guias/DESARROLLO.md` | Cómo correr la web y la app |
| `docs/referencia/` | Análisis y datos de apoyo (auditoría de UI, comparativa, mapeo zona → área) |
| `docs/muestras/` | HTML de referencia del formato, formulario e informe |

### Código

| Ruta | Contenido |
|---|---|
| `supabase/migrations/` | Esquema, RLS y RPC (0001–0022; la 0021, corrección única, aplicada en el remoto el 2026-11-09; la 0022, administración de cuentas, aplicada en el remoto el 2026-11-10). Nunca editar una aplicada: crear una nueva |
| `supabase/seed_catalogo.sql`, `seed_plantillas_*.sql` | Catálogo y plantillas de los 60 formatos (seguros para remoto) |
| `supabase/seed_usuarios_dev.plantilla.sql` + `scripts/generar-seed-usuarios.mjs` | Cuentas de prueba **solo locales**. `corepack pnpm seed:usuarios` genera `seed_usuarios_dev.sql` y `supabase/.claves-dev.json` con claves aleatorias; ambos archivos están en `.gitignore` (repo público) |
| `supabase/tests/` | Pruebas pgTAP (`supabase test db`; requiere Docker) |
| `src/lib/templates` | Esquema Zod y validación de plantillas y respuestas |
| `src/lib/offline` | Dexie, cola de envío, sincronización, compresión de fotos |
| `src/lib/tecnico` · `src/components/tecnico` · `src/app/tecnico` | Flujo del técnico |
| `src/lib/formatos` | Tipos y filtros de formatos; editor y selector de TAG |
| `src/lib/informe` · `src/components/informe/informe-pdf.tsx` | Modelo y generador del PDF |
| `src/app/supervisor` · `planificador` · `admin` | Áreas por rol; cada una con `panel/` (pantalla «Inicio» con indicadores, V1.1.8) y `exportar/` (pestaña y descarga del Excel) |
| `src/lib/revision` · `src/components/revision` | Bandeja, «Equipos con fallas» y el panel de indicadores (`panel.ts` calcula, `panel-queries.ts` lee) |
| `src/lib/admin` · `src/components/admin` · `src/app/admin/usuarios` · `auditoria` | Administración (solo administrador): cuentas (crear, nombre, rol, turno, contraseña, bloqueo; usa la clave de servicio en el servidor) y pestaña «Auditoría» sobre `audit_log` |
| `src/lib/exportar` | Exportación a Excel: filtros, consulta filtrada en la base, hojas y generador `.xlsx` propio (sin dependencias) |
| `src/data/maestro-tags.json` | Maestro de TAG (1.073 equipos); se genera con `scripts/export-maestro.py` |
| `scripts/simular-formatos.mjs` | Genera 2 PDF por formato contra la app local |
| `scripts/prueba-carga.mjs` | Prueba de carga local: N técnicos + supervisor + programador enviando y firmando; informe de tiempos y de operaciones pegadas |
| `app-movil/` | App nativa (técnico; y revisión para supervisor, programador y administrador desde la V1.1.0 de la app, 2026-11-09; consulta sin señal y equipos con fallas desde la 1.1.2; `plugins/` = plugins de configuración locales): proyecto Expo SDK 58 (npm, lockfile propio) creado el 2026-11-07; fase 1 hecha (lógica del técnico copiada de la web sobre SQLite, `app-movil/DISENO.md`; pantallas pendientes); bitácora en `docs/bitacora/` (entradas `[APP]`) e instrucciones en `app-movil/CLAUDE.md`. Excluida del `tsc` y el lint de la web |
| `src/lib/version.ts` + `package.json` | Versión visible al pie; deben coincidir (hay un test) |

### Fuera del repositorio (solo en el PC de Cristóbal; no están en git)

- `C:\Proyectos\simulacion-formatos\2026-11-03\`: 120 PDF de la simulación; `revision\Revision_formatos_PDF_2026-11-03.xlsx`
  (75 fallas de PDF: 5 altas, 27 medias, 43 bajas) y `revision\evidencias`; `CONTEXTO_COWORK_REVISION_FORMATOS.md`.
- `C:\Proyectos\Bases de datos generales\Maestro_TAGs_MLP.xlsx`: origen del Maestro de TAG (solo lectura).
- `C:\Proyectos\INSPECCIONES KIZEO`: formatos originales (Word/PDF).
- OneDrive «SUMELEC… / 03 DOCUMENTACIÓN / SAP 2026 Documentación / Tutoriales SAP MLP»: manuales de SAP.
- Si no tiene esos archivos, pídaselos a Cristóbal; no los invente.

### En línea

- App publicada: https://inspecciones-bbosch.vercel.app (Vercel, proyecto `inspecciones-bbosch`, equipo `cnv10`,
  región esperada `gru1`).
- Supabase: proyecto `inspecciones-bbosch` (São Paulo, plan Free). Las contraseñas de las cuentas remotas las tiene
  Cristóbal; **no están ni deben estar en el repositorio**. No se tocan archivos `.env*`.

## 4. Estado y pendientes

El estado vigente (versión publicada, qué está probado y qué no), los pendientes, las revisiones antes de datos reales y las
decisiones viven en **`docs/bitacora/ESTADO.md`**, que se reescribe al cerrar cada mejora. El historial inmutable está en
`docs/bitacora/REGISTRO.md`. Aquí solo quedan las reglas que no deben perderse:

- **NUNCA `supabase config push`** con el `config.toml` local: sobrescribiría la configuración del remoto (reabre el registro, cambia `site_url`, MFA…).
- Nunca mostrar valores secretos en pantalla ni en la bitácora; no tocar archivos `.env*`.
- El repo es **PUBLIC** a propósito y contiene formatos y el Maestro de TAG del cliente. Las 7 cuentas de prueba del Supabase remoto
  conservan contraseñas que estuvieron publicadas: **rotarlas antes de datos reales** (detalle en `ESTADO.md`).

## 6. Contexto de negocio que no está en el código

**Seguimiento de hallazgos y SAP (pedido de Juan Pablo, MLP, 2026-10-31).**
- A la OT padre se le carga la inspección; ya firmada por programador y supervisor, esa revisión es la evidencia.
  Si hay hallazgo, el **supervisor** crea un **aviso subsecuente** en SAP y le carga aparte un informe de mejora de la
  condición (fuera de la app; la app no se conecta a SAP). Por eso el seguimiento **no bloquea la firma**.
- El N.º de orden de la cabecera es siempre la orden **padre**.
- Alcance: lleva subsecuente lo que implique el funcionamiento normal del equipo y pertenezca a Bbosch 23 kV
  (componentes, luminarias, desmalezado…). **No** lo que requiere apoyo de otra empresa (extintores, control de plagas,
  accesos). El criterio es el alcance, no la severidad. Lo que sale de nuestro alcance se informa a Supervisión.
- Sin responder: qué estados generan hallazgo (hoy solo ML), canal para avisar a Supervisión, listado de ítems fuera
  de alcance por formato, y si la app debe generar el informe de mejora o solo registrar el vínculo.
- Prioridades SAP: Urgente (24 h), Programada en ejecución, Próximos programas (semanas +1 a +12), Parada de planta; la
  final la define la Supervisión de Mantenimiento. Repercusión: 1 Producción, 2 Seguridad, 3 Salud, 4 Medio ambiente,
  5 Legal, 6 Reputación. Texto breve máx. 40 caracteres.
- La app guarda el N.º de aviso o la canalización con MLP (migración 0014), en «Equipos con fallas» y en el PDF.

## 7. Mantener este documento al día

- Se lee al inicio de **cada** sesión. Al cerrar cada mejora se reescribe `docs/bitacora/ESTADO.md`; la sección 6 de este
  documento solo cambia si cambia el contexto de negocio.
- Cada archivo `.md` nuevo debe quedar listado en la sección 3. Un documento que deja de ser cierto se **elimina** (queda en el historial de git); no se deja desactualizado en `docs/`.
  Estructura de `docs/`: `bitacora/` (historial único), `guias/` (procedimientos estables), `referencia/` (análisis y datos de apoyo), `muestras/` y `formatos/`.
- No poner aquí contraseñas, claves ni valores de `.env`.
