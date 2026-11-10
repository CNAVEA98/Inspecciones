# MAESTRO · Inspecciones MLP (lectura obligatoria al iniciar cada sesión)

Este es el **documento de entrada**. Cualquier persona o sesión de Claude, desde cualquier cuenta o PC, debe leerlo
completo **antes de tocar nada**. Dice qué es el proyecto, dónde está cada cosa, cómo está hoy y qué falta.
Si algo de aquí contradice a `docs/bitacora/` o al código, manda el código, luego la bitácora; y este documento
se corrige en el mismo commit.

> **Instantánea al 2026-11-10 · versión V1.1.7 publicada y app móvil 1.1.7 · `main` = commit 4b7a729 (PR #21 unido el 2026-11-09; incluye el PR #20, V1.1.5 documentación, V1.1.6 PDF archivado en Storage, V1.1.7 corrección única con la migración 0021 —aplicada en el remoto— y la app 1.1.0 a 1.1.7: revisores, trabajo sin señal, envío con la app cerrada y logo de Bbosch; los identificadores se reescribieron el 2026-11-07 para quitar claves del historial, ver 5.1) · sitio publicado en V1.1.7 (verificado el 2026-11-09, región `gru1`) · PDF archivado en `reports` funcionando en producción (verificado el 2026-11-10).** El estado detallado y los pendientes vigentes viven en `docs/bitacora/ESTADO.md`. Todo lo marcado «no verificado»
> no se ha probado. Al terminar una mejora, actualice las secciones 4, 5 y 6 (se **reescriben**, no se agrega al final).

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
Repositorio: `CNAVEA98/Inspecciones_BBOSCH` (**PUBLIC** a propósito: Cristóbal y Manuel trabajan con cuentas distintas; ver sección 5.1).
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
| `supabase/migrations/` | Esquema, RLS y RPC (0001–0021; la 0021, corrección única, aplicada en el remoto el 2026-11-09). Nunca editar una aplicada: crear una nueva |
| `supabase/seed_catalogo.sql`, `seed_plantillas_*.sql` | Catálogo y plantillas de los 60 formatos (seguros para remoto) |
| `supabase/seed_usuarios_dev.plantilla.sql` + `scripts/generar-seed-usuarios.mjs` | Cuentas de prueba **solo locales**. `corepack pnpm seed:usuarios` genera `seed_usuarios_dev.sql` y `supabase/.claves-dev.json` con claves aleatorias; ambos archivos están en `.gitignore` (repo público) |
| `supabase/tests/` | Pruebas pgTAP (`supabase test db`; requiere Docker) |
| `src/lib/templates` | Esquema Zod y validación de plantillas y respuestas |
| `src/lib/offline` | Dexie, cola de envío, sincronización, compresión de fotos |
| `src/lib/tecnico` · `src/components/tecnico` · `src/app/tecnico` | Flujo del técnico |
| `src/lib/formatos` | Tipos y filtros de formatos; editor y selector de TAG |
| `src/lib/informe` · `src/components/informe/informe-pdf.tsx` | Modelo y generador del PDF |
| `src/app/supervisor` · `planificador` · `admin` | Áreas por rol |
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

## 4. Estado actual (V1.1.7, publicada el 2026-11-09)

- **PR #21 unido el 2026-11-09 (`main` = 4b7a729):** el sitio publicado pasó de V1.1.4 a **V1.1.7** (comprobado con `curl`, región `gru1`). **El PDF archivado (V1.1.6) funciona en producción (verificado el 2026-11-10):** `SUPABASE_SERVICE_ROLE_KEY` ya estaba en Vercel desde la integración con Supabase; la primera descarga de `INS-2026-000007` (aprobada) dejó `reports/…/INS-2026-000007.pdf` (203 KB) y la de `INS-2026-000006` (rechazada) no se archivó. Desde el 2026-11-10 la clave está solo en Production (se quitó de Preview).
- `main` incluye además, desde el PR #12: catálogo de formatos en base de datos, pestaña «Formatos» (editor), carpetas por
  turno y área en la bandeja, «Equipos con fallas» y seguimiento de hallazgos SAP, visor de PDF del técnico,
  aviso de privacidad, Privacidad y Condiciones, fotos sin GPS, versión al pie.
- Verificación del 2026-11-06 (V1.1.3, CLI de Supabase 3.0.0): lint, tsc y build en verde; tests 253/253; `supabase db reset` y
  `supabase test db` 76/76; simulación local 120/120 PDF en `C:\Proyectos\simulacion-formatos\2026-11-06\`.
- V1.1.1 (PR #13, unido) corrige las 5 fallas altas de PDF y varias medias; su parche de plantillas ya se aplicó en el remoto.
  Quedan abiertas las fallas medias y bajas de PDF (sección 5.3).
- Remoto: migraciones 0001–0021 aplicadas y registradas (la 0021 el 2026-11-09), plantillas con las correcciones (v2), registro libre
  cerrado. **El sitio publicado está en V1.1.7** (PR #21, 2026-11-09; Vercel despliega en menos de 1 minuto).
- Prueba de carga local del 2026-11-06 (12 técnicos del turno A + supervisor + programador, hasta 36 técnicos): sin errores ni
  operaciones pegadas, 384 formularios enviados y firmados. Lo más lento es generar el PDF (1 s solo; 5 s con 12 a la vez).
  No es prueba del sitio publicado ni de la PWA en navegador.
- **App móvil (`app-movil/`, PR #18 unido el 2026-11-07):** flujo del técnico probado en un **emulador Android** (API 37, Expo Go): ingreso, inspección con foto y firma, modo avión, cierre y reapertura sin señal,
  envío único con folio, PDF del teléfono y PDF oficial del servidor (V1.1.4 ya está desplegado). 292 pruebas de la app en verde (incluye el recorrido de las 59 plantillas reales). Envío en segundo plano escrito (solo funciona en un APK/TestFlight).
  El primer APK de EAS falló por `npm ci` (corregido con `app-movil/.npmrc`); ver `docs/bitacora/ESTADO.md` para el estado del segundo intento.
- **V1.1.6 (unida en el PR #21):** el PDF de cada inspección aprobada se archiva en el bucket privado `reports` y se entrega desde ahí; lo escribe solo el servidor con `SUPABASE_SERVICE_ROLE_KEY` (en Vercel, solo Production). Probado por HTTP contra el Supabase local y, el 2026-11-10, en el sitio publicado.
- **App 1.1.2 (unida en el PR #21):** supervisor, programador y administrador consultan sin señal (copia en el teléfono), «Equipos con fallas» y seguimiento SAP en la app, PDF «Guardar en el teléfono», y el plugin que corrige el cierre al abrir de toda compilación release (R8). Probado con una APK release local en el emulador contra el Supabase local.
- **App 1.1.3 (misma rama):** prueba sin señal del técnico con la APK release en el emulador: inspección completa en modo avión, cerrar y reabrir, y **envío con la app cerrada al volver la señal** (corregido: la tarea no existía con la app cerrada); el arranque sin señal con la sesión vencida bajó de ~2 min a 4–6 s.
- **V1.1.7 / app 1.1.5 (misma rama):** prueba con dos teléfonos y la misma cuenta: envíos y firmas simultáneas bien; las correcciones duplicadas se corrigieron con la migración 0021 (una rechazada, una corrección), aplicada en el remoto el 2026-11-09.
- **App 1.1.6 contra el Supabase real (emulador, `TECNICO_B`):** envío con señal (`INS-2026-000006`), en modo avión con cierre y reapertura, y con la app cerrada al volver la señal (`INS-2026-000007`, una vez); PDF oficial del sitio publicado guardado en el teléfono; `SUPERVISOR_B` y `PROGRAMADOR_B` aprobaron `INS-2026-000007` desde la app (ciclo completo contra el remoto).
- **App 1.1.7 (misma rama):** primer uso en terreno: se ingresa una vez con señal y la sesión queda; sin señal el ingreso lo dice claramente, «Cerrar sesión» queda bloqueado y, si nunca se descargó el catálogo, se usan los formatos incluidos en la APK (reexportar con `app-movil/scripts/exportar-catalogo.mjs` al cambiar formatos). Probado contra el remoto en el emulador.
- **App 1.1.8 (rama `feat/app-nombre-inspecciones`, 2026-11-10):** la app se llama «Inspecciones» (sin MLP). Primera compilación iOS local (Xcode en el Mac de Cristóbal) probada en el simulador contra el Supabase real (envío `INS-2026-000008`) y **en un iPhone físico por cable**: inspección en modo avión con cámara real, pendiente y enviada sola al volver la señal con la app abierta, sin duplicados; fotos sin GPS.
- **Sin probar:** en el iPhone, cerrar y reabrir sin señal y el envío con la app cerrada; dispositivo Android físico (ahorro de batería), el APK de EAS y el sitio web con clics.

## 5. Faltantes y revisiones antes de pasar a React Native

Estados: **Abierto** · **Necesita a Cristóbal** · **Sin probar**. Detalle numerado de cada pendiente en `docs/bitacora/ESTADO.md`.
Orden de trabajo: 1 repo → 2 producción → 3 fallas altas de PDF → 4 prueba sin señal → 5 decisión de cuentas → 6 separar lógica.

### 5.1 Repositorio y seguridad (revisado el 2026-11-06)
- **Revisión de claves en el historial (106 commits, todas las ramas): NO hay** claves `service_role`, `sb_secret_`, tokens, URL de base con
  contraseña, claves de GitHub/AWS ni claves privadas; `.env.example` está vacío; los `eyJ…` de `docs/muestras/` son imágenes base64.
- **Contraseñas de las 7 cuentas de prueba:** estuvieron publicadas en `seed_usuarios_dev.sql`. Desde la V1.1.3 salieron del árbol de archivos
  (plantilla sin claves + `corepack pnpm seed:usuarios`). **El 2026-11-07 se reescribió el historial de GitHub** y se reemplazaron por `CLAVE-ELIMINADA` en los 112 commits
  (todos cambiaron de identificador; ver `docs/bitacora/REGISTRO.md`). **Quedan:** las 17 referencias `refs/pull/*` de GitHub con commits viejos (hay que pedir su limpieza a GitHub Support),
  cualquier copia previa del repo, y **las 7 cuentas del Supabase remoto siguen usando esas mismas contraseñas** (incluye `ADMINISTRADOR`): Cristóbal decidió no rotarlas (sistema de prueba).
  **Obligatorio antes de datos reales:** rotarlas y cerrar sesiones.
  Ingresos recientes en `administrador` (3 nov), `supervisor_b` (4 nov) y `tecnico_b` (6 nov) no se pudieron atribuir (sin registro de auditoría).
- **Repo PUBLIC** por decisión de Cristóbal (trabaja con Manuel desde cuentas distintas). Un repo privado también admite colaboradores. El repo público
  contiene además los formatos Word/Excel de MLP/Bbosch (36 archivos) y el Maestro de TAG (1.073 equipos): información del cliente.
- Nunca mostrar valores secretos en pantalla ni en la bitácora.

### 5.2 Producción (estado verificado el 2026-11-06 por CLI; el CLI tiene sesión en el PC de Cristóbal y, desde el 2026-11-10, en su Mac)
- **Hecho:** migraciones 0020 y 0021 aplicadas; parche de plantillas aplicado (10 plantillas en v2); migraciones 0001–0021 registradas
  (`db push` ya no intenta repetirlas); registro libre **desactivado**; sitio en región `gru1`.
- **Cómo consultar el remoto sin contraseña:** `corepack pnpm supabase db query --remote=etdeiyjzibgihqtvdrpt --read-only "select …"`
  (escribir exige `--yes`). Nuevas migraciones: `corepack pnpm supabase db push --remote=etdeiyjzibgihqtvdrpt` (hoy «up to date»).
- **NUNCA `supabase config push`** con el `config.toml` local: sobrescribiría la configuración del remoto (reabre el registro, cambia `site_url`, MFA…).
- Despliegue: Vercel despliega desde `main` y tarda menos de 1 minuto; comprobar con `curl -s https://inspecciones-bbosch.vercel.app/login | grep -o "V1\.[0-9]*\.[0-9]*"`.
- Pendiente: plan Supabase Free (1 GB, se pausa, sin respaldos diarios) vs ~60 técnicos con fotos; términos de Vercel Hobby.
- Pendiente: `inspecciones-mlp-prueba` (Supabase) está pausado y `inspecciones-mlp-demo-formatos` (Vercel, demo estática cuya carpeta `demo/` se eliminó del repositorio el 2026-11-09) sin revisar: decidir si se borran.
- Pendiente: definir dónde se guardan las contraseñas remotas y cambiarlas antes de producción.

### 5.3 Fallas de PDF (las 5 altas: corregidas y comprobadas en la V1.1.1, rama `fix/pdf-fallas-altas`)
Comprobado el 2026-11-06 regenerando los 120 PDF con la base local (0 TAG partidos; severidad y bloque «Hallazgos»;
foto en los 16 formatos «conforme» con ítem de foto; mantenciones con «Resultado de la mantención»):
- **S01** era un error del script de simulación (no adjuntaba la foto), no del PDF. **S02** severidad en fila, bloque
  «Hallazgos» y pie de foto. **S05** TAG en una línea (sin guionado). **P01** TAG 740HF003 en MANT-13. **P04** «ausencia de óxido».
- También corregidas: S03, S09, S11 (NA fuera del denominador) y la redacción de P02, P06, P11, P27, P28 y otras erratas.
- El parche `supabase/parches/parche_plantillas_2026-11-06.sql` **ya se aplicó en el remoto** (ver 5.2); se conserva solo como registro. Las bases nuevas ya vienen corregidas por los seeds.
- Siguen abiertas (medias y bajas): P03, P05, P07, P08, P14, P16, P19, P37, P38, P41, S04, S06, S07 (fuentes Geist),
  S13, S19–S22 y X01; el detalle está en el Excel de revisión (fuera del repo).
- Corregir datos de plantilla exige un parche/versión nueva (no editar una plantilla ya publicada).

### 5.4 Trabajo sin señal (decisión: se resuelve en React Native)
- **Decisión de Cristóbal (2026-11-06):** la PWA se abre desde un enlace y no sirve para trabajar sin señal; por eso se
  migra a React Native. La prueba de aceptación sin señal se hará **en la app nativa**, no en la PWA.
- Los 120 PDF **no prueban** el modo sin señal: `simular-formatos.mjs` llama a `submit_inspection` con conexión.
- Prueba de aceptación (en la app nativa, iPhone y Android reales): señal → catálogo → modo avión → abrir app desde
  cero → inspección con fotos y firma → cerrar y reabrir sin perder nada → enviar sin señal (queda pendiente) →
  reconectar (se envía una sola vez, con folio, visible para el supervisor con fotos). Necesita a Cristóbal.
- Casos a diseñar bien en la app nativa (hoy sin prueba en la PWA): sesión vencida sin señal; almacenamiento que el
  sistema puede borrar y aviso de borradores sin enviar; cerrar sesión con envíos pendientes (`SignOutButton` solo
  borra páginas en caché); formato desactivado o con versión nueva sin señal; fotos reales de cámara sin GPS.

### 5.5 Decisiones de Cristóbal pendientes
- Cuentas **por persona** o genéricas (trazabilidad, RLS, firmas, historial). Preferencia inicial: por persona.
- Qué ve cada supervisor (hoy sin filtro por área ni turno, ~24 revisores).
- Reglas de SAP con MLP (sección 6): alcance por ítem y supuestos de prioridad. Usar el término **«Supervisión»**
  (nunca «Torre de Control»). No debe bloquear firmas ni depende de la app nativa.

### 5.6 Pruebas en el sitio publicado (todas sin hacer)
Recorrido con supervisor, técnico y programador (aprobar, enviar, ver PDF, segunda firma); revisar plantillas;
región `gru1`; pestaña «Formatos» con clics; firma del planificador y rechazo en navegador;
el PDF archivado en `reports` ya está comprobado (2026-11-10, ver la bitácora).

### 5.7 Preparación para React Native (solo después de 5.1 a 5.4)
> **Actualización 2026-11-07:** se decidió **duplicar** la lógica en `app-movil/src/lib/` (`app-movil/DISENO.md`), no separarla dentro de la web; la web no se toca. Una regla que cambie en la web hay que replicarla en la app.

Separar la lógica (esquemas, validación, borradores, cola) de Dexie, `window` y `next/*` detrás de una interfaz de
almacenamiento, sin cambiar comportamiento y con los tests en verde: **primero proponer el diseño**. Inventario de
lo atado al navegador/Next: `compress.ts` (canvas), detección de red, firma, `login/actions.ts` y rutas
`/tecnico/[id]/pdf` (cookies). **No invertir ahora** en retoques visuales del técnico, auditoría restante, service
worker fino, peso del JavaScript ni el visor de PDF en iPhone, salvo errores que impidan probar.

**Cuándo terminamos:** sin secretos reales en el repo ni en su historial; 0020 confirmada y registro libre cerrado; 5 fallas altas
corregidas; prueba sin señal hecha en la app nativa, en iPhone y Android, con su resultado escrito; decisión de cuentas tomada; lógica
separada con tests en verde; todo con evidencia en la bitácora.

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

- Se lee al inicio de **cada** sesión y se actualiza al cerrar cada mejora: secciones 4, 5 y 6 se reescriben; la
  instantánea de la cabecera lleva fecha, versión y commit.
- Cada archivo `.md` nuevo debe quedar listado en la sección 3. Un documento que deja de ser cierto se **elimina** (queda en el historial de git); no se deja desactualizado en `docs/`.
  Estructura de `docs/`: `bitacora/` (historial único), `guias/` (procedimientos estables), `referencia/` (análisis y datos de apoyo), `muestras/` y `formatos/`.
- No poner aquí contraseñas, claves ni valores de `.env`.
