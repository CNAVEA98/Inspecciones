# MAESTRO · Inspecciones MLP (lectura obligatoria al iniciar cada sesión)

Este es el **documento de entrada**. Cualquier persona o sesión de Claude, desde cualquier cuenta o PC, debe leerlo
completo **antes de tocar nada**. Dice qué es el proyecto, dónde está cada cosa, cómo está hoy y qué falta.
Si algo de aquí contradice a `docs/BITACORA.md` o al código, manda el código, luego la bitácora; y este documento
se corrige en el mismo commit.

> **Instantánea al 2026-11-06 · versión V1.1.0 · `main` = commit 6eccd9a (PR #12).** Todo lo marcado «no verificado»
> no se ha probado. Al terminar una mejora, actualice las secciones 4, 5 y 6 (se **reescriben**, no se agrega al final).

## 1. Cómo empezar una sesión (en este orden)

1. `git fetch origin` · `git status` · `git switch main` · `git pull --ff-only origin main`. Si hay cambios locales
   sin commit, no los pise: pregunte.
2. Leer este archivo y luego `docs/BITACORA.md` (tablas «Estado actual», «Pendientes», «Decisiones» y las 3 últimas
   entradas del «Registro»).
3. Trabajar en rama nueva (`tipo/descripcion`), nunca directo en `main`. Reglas completas en `CLAUDE.md`.
4. Si cambian dependencias o migraciones: `corepack pnpm install` y `corepack pnpm supabase db reset`.
5. Al terminar: lint, tsc, tests y build en verde; entrada en la bitácora y versión nueva en el mismo commit; PR.
   `push`, PR, deploy, borrados y cualquier conexión a Supabase remoto **requieren confirmación explícita** del usuario.

## 2. Qué es el proyecto

PWA de inspecciones y mantenciones de terreno de **BBOSCH** para infraestructura eléctrica de **Minera Los Pelambres
(MLP)**. El técnico trabaja **sin señal** y envía al reconectar; supervisor y planificador firman en dos etapas.
60 formatos (INSP-01 a 41 sin el 36, y MANT-01 a 20). Stack: Next.js 16 (App Router), TypeScript estricto, Tailwind,
Supabase (Postgres, Auth, Storage, RLS), Vercel. UI en español (Chile), fechas en `America/Santiago`.
Roles: técnico, supervisor, planificador/programador, administrador. Turnos A/B. Cuentas genéricas por **usuario**
(`TECNICO_A`, `SUPERVISOR_A`, `PROGRAMADOR_A`, `ADMINISTRADOR`…), sin correo.
Repositorio: `CNAVEA98/Inspecciones_BBOSCH` (hoy figura **PUBLIC** en GitHub; debe ser privado, ver sección 5).
Equipo: 2 personas (Cristóbal y Manuel).

## 3. Directorio: dónde buscar cada cosa

### Documentos (en el repositorio)

| Archivo | Para qué |
|---|---|
| `docs/MAESTRO.md` | Este documento: entrada, directorio, estado y faltantes |
| `docs/BITACORA.md` | Historial de cada mejora, «Estado actual», «Pendientes» numerados y «Decisiones» |
| `CLAUDE.md` · `AGENTS.md` | Reglas de trabajo en equipo; aviso de que este Next 16 difiere de lo conocido (leer `node_modules/next/dist/docs/`) |
| `docs/DESIGN.md` | Sistema visual «Cobre» (colores, estados BN/ML/NT/NA/NR, severidades) |
| `docs/DEPLOY_VERCEL.md` | Despliegue en Vercel y comprobación de la región `gru1` |
| `docs/EXPORT_MAESTRO.md` · `docs/MAPEO_ZONA_AREA.md` | Cómo se genera el Maestro de TAG y el mapeo zona → área (el segundo lo escribe el script; no editar a mano) |
| `docs/LICENCIAS.md` | Licencias de dependencias |
| `docs/muestras/` · `demo/` | HTML de referencia del formato, formulario e informe; demo estática |
| `docs/archivo/` | Documentos antiguos, **solo historia**; pueden estar desactualizados |

### Código

| Ruta | Contenido |
|---|---|
| `supabase/migrations/` | Esquema, RLS y RPC (0001–0020). Nunca editar una aplicada: crear una nueva |
| `supabase/seed_catalogo.sql`, `seed_plantillas_*.sql` | Catálogo y plantillas de los 60 formatos (seguros para remoto) |
| `supabase/seed_usuarios_dev.sql` | Cuentas de prueba, **solo local** |
| `supabase/tests/` | Pruebas pgTAP (`supabase test db`; requiere Docker) |
| `src/lib/templates` | Esquema Zod y validación de plantillas y respuestas |
| `src/lib/offline` | Dexie, cola de envío, sincronización, compresión de fotos |
| `src/lib/tecnico` · `src/components/tecnico` · `src/app/tecnico` | Flujo del técnico |
| `src/lib/formatos` | Tipos y filtros de formatos; editor y selector de TAG |
| `src/lib/informe` · `src/components/informe/informe-pdf.tsx` | Modelo y generador del PDF |
| `src/app/supervisor` · `planificador` · `admin` | Áreas por rol |
| `src/data/maestro-tags.json` | Maestro de TAG (1.073 equipos); se genera con `scripts/export-maestro.py` |
| `scripts/simular-formatos.mjs` | Genera 2 PDF por formato contra la app local |
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

## 4. Estado actual (V1.1.0)

- `main` incluye hasta el PR #12: catálogo de formatos en base de datos, pestaña «Formatos» (editor), carpetas por
  turno y área en la bandeja, «Equipos con fallas» y seguimiento de hallazgos SAP, visor de PDF del técnico,
  aviso de privacidad, Privacidad y Condiciones, fotos sin GPS, versión al pie.
- Verificación del 2026-11-06 (rama de V1.1.0): lint, tsc, build en verde; tests 245/245. `supabase test db` no se
  corrió (Docker apagado); último registro 76/76 el 2026-11-03.
- Remoto: migraciones 0001–0019 aplicadas pegando SQL en el editor (no con `db push`). **La 0020 figura sin aplicar**
  (no verificado hoy: no se consultó el remoto). Cristóbal indicó que ya subió una versión a Vercel y Supabase:
  **confirmar contra el remoto qué migraciones y qué versión están realmente desplegadas.**
- Nada se ha probado en teléfono ni con clics en el sitio publicado.

## 5. Faltantes y revisiones antes de pasar a React Native

Estados: **Abierto** · **Necesita a Cristóbal** · **Sin probar**. Detalle numerado de cada pendiente en `docs/BITACORA.md`.
Orden de trabajo: 1 repo → 2 producción → 3 fallas altas de PDF → 4 prueba sin señal → 5 decisión de cuentas → 6 separar lógica.

### 5.1 Repositorio y seguridad
- **Repo PUBLIC** pero la intención es privado → Necesita a Cristóbal (cambiarlo en GitHub).
- `supabase/seed_usuarios_dev.sql` (contraseñas de prueba) y referencias al proyecto Supabase están versionados.
  Falta revisar el **historial de git** buscando claves reales (la búsqueda falló por archivos `.docx`; usar
  `git -c diff.word.textconv= log -G… --no-textconv`). Cinco HTML de `demo/` y `docs/muestras/` tienen cadenas
  tipo `eyJ…` por revisar. Nunca mostrar valores secretos en pantalla.

### 5.2 Producción (solo lectura, con confirmación previa)
- Confirmar migración **0020** (`aviso_privacidad_version`, `aviso_privacidad_at`, `registrar_aviso_privacidad`).
- Confirmar que **«Allow new users to sign up» está desactivado** (obligatorio antes de la app móvil).
- Migraciones remotas sin registrar en la tabla de control (`supabase migration repair` o proyecto nuevo con `db push`).
- Plan: Supabase Free (1 GB, se pausa, sin respaldos diarios) vs ~60 técnicos con fotos; términos de Vercel Hobby.
- Identificar proyectos sobrantes (`inspecciones-mlp-prueba` en Supabase, `inspecciones-mlp-demo-formatos` en Vercel).
- Definir dónde se guardan las contraseñas remotas y cambiarlas antes de producción.

### 5.3 Fallas de PDF (condición para pasar a React Native: las 5 altas corregidas y comprobadas)
Abiertas al 2026-11-06 (verificado en código; PDF no regenerados):
- **S01** fotos de ítems de foto no salen en PDF «conforme» (`modelo.ts` ya recoge ítems `photo`; falta regenerar para confirmar).
- **S02** la severidad de los hallazgos no aparece en ningún PDF (`informe-pdf.tsx` no la usa).
- **S05** el TAG del encabezado se parte con guion («740--»/«XF-001»): desactivar guionado y limitar ancho del horario.
- **P01** MANT-13: unidades resistivas del filtro 740HF003 con TAG de 740HF001 (`seed_plantillas_mant.sql`).
- **P04** MANT-05: «Verificar presencia de oxido» con lógica invertida y sin tilde.
- 27 medias y 43 bajas siguen en el Excel; entre ellas S03 («OBSERVACIÓNES CRÍTICAS» y solo el primer hallazgo,
  `informe-pdf.tsx:208`), S07 (sin fuentes Geist) y S09 («Resultado de la inspección» también en mantenciones).
- Corregir datos de plantilla exige **migración nueva** (no editar seeds ya aplicados).

### 5.4 Trabajo sin señal (lo más importante)
- Los 120 PDF **no prueban** el modo sin señal: `simular-formatos.mjs` llama a `submit_inspection` con conexión.
- Prueba de aceptación en iPhone y Android reales: señal → catálogo → modo avión → abrir app desde cero → inspección
  con fotos y firma → cerrar y reabrir sin perder nada → enviar sin señal (queda pendiente) → reconectar (se envía una
  sola vez, con folio, visible para el supervisor con fotos). Necesita a Cristóbal.
- Abiertos y sin prueba: sesión vencida sin señal; falta `navigator.storage.persist` y el aviso de borradores sin
  enviar (iPhone puede borrar datos); cerrar sesión con envíos pendientes (`SignOutButton` solo borra páginas en caché);
  formato desactivado o con versión nueva sin señal; fotos reales de cámara (que el archivo en Storage no traiga GPS).

### 5.5 Decisiones de Cristóbal pendientes
- Cuentas **por persona** o genéricas (trazabilidad, RLS, firmas, historial). Preferencia inicial: por persona.
- Qué ve cada supervisor (hoy sin filtro por área ni turno, ~24 revisores).
- Reglas de SAP con MLP (sección 6): alcance por ítem y supuestos de prioridad. Usar el término **«Supervisión»**
  (nunca «Torre de Control»). No debe bloquear firmas ni depende de la app nativa.

### 5.6 Pruebas en el sitio publicado (todas sin hacer)
Recorrido con supervisor, técnico y programador (aprobar, enviar, ver PDF, segunda firma); revisar plantillas;
región `gru1`; pestaña «Formatos» con clics; firma del planificador y rechazo en navegador; decidir si hace falta
guardar el PDF final firmado en Storage como registro oficial.

### 5.7 Preparación para React Native (solo después de 5.1 a 5.4)
Separar la lógica (esquemas, validación, borradores, cola) de Dexie, `window` y `next/*` detrás de una interfaz de
almacenamiento, sin cambiar comportamiento y con los tests en verde: **primero proponer el diseño**. Inventario de
lo atado al navegador/Next: `compress.ts` (canvas), detección de red, firma, `login/actions.ts` y rutas
`/tecnico/[id]/pdf` (cookies). **No invertir ahora** en retoques visuales del técnico, auditoría restante, service
worker fino, peso del JavaScript ni el visor de PDF en iPhone, salvo errores que impidan probar.

**Cuándo terminamos:** repo privado y sin secretos; 0020 confirmada y registro libre cerrado; 5 fallas altas
corregidas; prueba sin señal hecha en iPhone y Android con su resultado escrito; decisión de cuentas tomada; lógica
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
- Cada archivo `.md` nuevo debe quedar listado en la sección 3. Un documento que deja de ser cierto se mueve a
  `docs/archivo/` (no se deja desactualizado en `docs/`).
- No poner aquí contraseñas, claves ni valores de `.env`.
