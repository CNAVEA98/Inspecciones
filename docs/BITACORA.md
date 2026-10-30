# Bitácora del proyecto · Inspecciones MLP

Registro de todo lo realizado, para trabajar en equipo en la carpeta compartida.
**Regla: cada mejora finalizada se registra aquí antes de darla por cerrada** (ver `CLAUDE.md`).

## Cómo registrar una mejora

1. Agregue una entrada **al inicio** de la sección «Registro» (la más reciente arriba), con este formato:

   ```
   ### AAAA-MM-DD · Título corto
   - **Autor:** nombre
   - **Qué se hizo:** 1 a 3 líneas
   - **Archivos:** rutas principales
   - **Verificación:** comando y resultado real (lint, tsc, tests, build, prueba manual) o «no verificado» y por qué
   - **Pendiente / riesgos:** lo que quedó sin hacer o sin probar
   ```
2. Actualice la sección «Estado actual» y la lista «Pendientes» si cambian.
3. Si un cambio modifica una decisión, anótelo también en «Decisiones».
4. No borre entradas antiguas: si algo se revierte, agregue una entrada nueva que lo diga.

## Estado actual (2026-10-29)

| Área | Estado |
|---|---|
| Scaffold Next 16 + Tailwind + TypeScript estricto | Hecho y verificado |
| Migraciones SQL (esquema, RLS, RPC) y seed | Migraciones 0001–0010 aplicadas sin errores en Supabase local (2026-10-30); roles, firma y eliminación probados en SQL y en la app |
| Test RLS (técnico A no lee lo del técnico B, firma doble, catálogo, auditoría, eliminación) | Hecho: `supabase/tests/rls.test.sql`, 30/30 con `supabase test db` (no cubre Storage ni tablas hijas) |
| Validador de plantillas (Zod) | Hecho, con tests |
| Plantilla real Transformador de piso × Plan Matriz (29 ítems) | Hecha en el seed |
| Auth, proxy por rol (admin, supervisor, planificador, técnico), turnos A/B y firma doble en BD | Hecho; probado en SQL; **login y pantallas por rol sin probar en navegador** |
| Núcleo offline (Dexie, cola, reintentos, compresión) | Hecho, con tests |
| Flujo del técnico (Área → Equipo → Modo → formulario → envío) | Hecho; **sin probar contra Supabase** |
| Service worker / PWA instalable | Hecho (2026-10-30, rama `feat/pwa-offline`): probado en Chrome con el servidor apagado; **sin probar con corte total de red, envío sin red ni instalación en teléfono** |
| Flujo del supervisor y planificador (bandeja, detalle, aprobar/rechazar, firma) | Bandeja, detalle, PDF y firma de revisión (aprobar/rechazar con comentario y firma dibujada) hechos; lógica y permisos probados contra la app; firma del supervisor probada en navegador (2026-10-30), **firma del planificador y rechazo sin probar en navegador**. Bandeja con buscador y consulta (TAG, turno, fechas) y eliminación con confirmación por el administrador, probados en navegador |
| PDF server-side | Descarga hecha para admin, supervisor y planificador (diseño Cobre, generado al pedirlo); sin guardar en Storage |
| Verificación a 375px y 1440px, prueba con red apagada | Parcial (formularios a 375px con datos simulados) |

Verificación global más reciente (2026-10-30, en `C:\Proyectos`): `pnpm lint` sin errores · `pnpm tsc --noEmit` sin errores · `pnpm test` 69/69 · `pnpm build` correcto.

## Pendientes

1. ~~Instalar WSL2 y Docker~~ — hecho 2026-10-30. Cada persona debe abrir Docker Desktop y correr `corepack pnpm supabase start` en su equipo.
2. ~~Aplicar migraciones y seed~~ — hecho 2026-10-30 (sin errores).
3. ~~Escribir y correr `supabase/tests/rls.test.sql` (pgTAP)~~ — hecho 2026-10-30 (30/30). Falta ampliarlo a Storage y a las tablas hijas.
4. Probar en el navegador el login y el cambio de rol/turno con los usuarios del seed (`admin@bbosch.cl`, `supervisor.a@bbosch.cl`, `planificador.a@bbosch.cl`, `tecnico.a@bbosch.cl` y los de turno B; contraseñas en `supabase/seed.sql`). Falta una pantalla para crear cuentas (solo el administrador).
5. ~~Service worker con Serwist + manifest + iconos~~ — hecho 2026-10-30 con `@serwist/turbopack` (ver Decisiones). Falta probar la instalación en teléfono y el envío sin red.
6. Bandejas de supervisor y planificador (y vista de solo lectura del admin): filtros, detalle, aprobar/rechazar con comentario, firma dibujada. La BD ya soporta las dos etapas de firma.
7. PDF con `@react-pdf/renderer` reproduciendo el diseño Cobre, con logo BBOSCH, guardado en Storage privado y URL firmada.
8. Vista de solo lectura de inspecciones ya enviadas en `/tecnico`.
9. Prueba de aceptación con red apagada: crear, completar, reconectar y ver en la bandeja del supervisor.
10. Documentos: `docs/DECISIONES.md` y `docs/COMO_AGREGAR_AREA_EQUIPO.md`.
11. Plantillas para los otros 4 equipos y el modo Mantenimiento programado (hoy solo existen en el catálogo, sin plantilla).

## Decisiones

- **PWA con `@serwist/turbopack` (2026-10-30):** no se usa `@serwist/next` porque exige webpack y con webpack el CSS de Tailwind no se genera (el loader es solo de Turbopack). El service worker se sirve desde una ruta (`/serwist/sw.js`) y solo se registra en producción. Solo el área del técnico funciona sin red.
- **Roles y firma doble (2026-10-30):** admin, supervisor, planificador y técnico, cada uno con turno A/B (el admin sin turno). El turno es solo etiqueta. Firma en dos etapas: supervisor y luego planificador. Solo el admin cambia rol y turno. Cuentas nuevas parten como técnico y no hay autoregistro.
- **Diseño «Cobre»** (grafito + cobre, bordes redondeados, números tipo instrumento), aprobado por el usuario. Nació de la familia SAP de awesome-design-md; IBM Carbon descartado. Detalle en `docs/DESIGN.md`.
- **Sin geo-referencia:** se evaluó y el usuario la descartó; no hay columnas geo en el esquema.
- **Sin modo oscuro, analytics ni notificaciones push** (fuera de alcance).
- **Next 16:** el antiguo middleware se llama `src/proxy.ts`. Se desactivó `cacheComponents` (venía activo desde create-next-app) porque la app es autenticada y dinámica.
- **Rol:** el registro crea siempre `technician`; solo un supervisor lo cambia (acción de servidor + RLS + trigger `guard_profile_role`). Un supervisor no puede quitarse su propio rol.
- **Plantillas versionadas e inmutables** una vez publicadas; la inspección guarda `template_id` y `template_version`.
- **Folio** `INS-AAAA-NNNNNN` lo asigna el servidor al enviar. Los IDs de inspección, fotos y hallazgos se generan en el cliente (idempotencia offline).
- **Fotos** comprimidas en el cliente (lado mayor 1600 px, JPEG 0,7), ruta `{uid}/{inspection_id}/{foto}.jpg` en bucket privado.
- **ML exige observación; NR exige motivo; la foto es opcional en todos los estados** (validado en cliente y en el validador de plantillas). Hasta el 2026-10-30 ML exigía también foto; se cambió a pedido del usuario para todas las inspecciones.
- **Firma del participante** se guarda como adjunto `participant_signature`; la firma del supervisor va en la tabla `signatures`.
- **Fuente Geist** vía `next/font` (se descarga en el build; requiere internet al compilar).

## Cómo correr el proyecto

```bash
corepack pnpm install
corepack pnpm lint
corepack pnpm tsc --noEmit
corepack pnpm test
corepack pnpm build
corepack pnpm dev            # necesita .env.local (copiar de .env.example)
```

Con Docker funcionando: `corepack pnpm supabase start` y `corepack pnpm supabase db reset`.
Referencia visual interactiva (sin servidor): `docs/muestras/formulario-transformador-piso.html`.

## Registro

### 2026-10-30 · PWA instalable y uso sin servidor (service worker con Serwist)
- **Autor:** CNAVEA98 con Claude (rama `feat/pwa-offline`, creada sobre `feat/roles-turnos-firma-doble`)
- **Qué se hizo:** la app se instala y el área del técnico abre sin red. Service worker (`src/app/sw.ts`) servido en `/serwist/sw.js`: precachea los 28 archivos del build (JS, CSS, fuentes, logo) y guarda las páginas `/tecnico`, `/tecnico/nueva` y el formulario (red primero, con espera máxima de 4 s y copia local si falla). Manifest e íconos (`src/app/manifest.ts`, `public/icons/`). Las páginas se guardan al abrir la app con red y al volver la conexión (`src/lib/offline/paginas.ts`); al cerrar sesión se borran, porque llevan el nombre del técnico. El formulario ahora toma el `id` de la URL (todas las inspecciones comparten una sola página guardada; los datos salen de Dexie), para poder abrir una inspección creada sin red. El service worker solo se registra en producción.
- **Decisión de herramienta:** se usó `@serwist/turbopack` en vez de `@serwist/next`. Este último obliga a compilar con webpack y, con webpack, el CSS de Tailwind sale sin estilos (se comprobó en el build: falta `bg-graf`), porque el loader está configurado solo para Turbopack. Dependencias nuevas (autorizadas por el usuario): `serwist`, `@serwist/turbopack`, `esbuild`, `esbuild-wasm` (este último es dependencia obligatoria de `@serwist/turbopack`). pnpm avisa que ignora los scripts de instalación de `esbuild` y `@swc/core`; no se aprobaron y `esbuild` funciona igual. El build sigue siendo el normal (`next build`, sin `--webpack`).
- **Archivos:** `src/app/sw.ts`, `src/app/serwist/[path]/route.ts`, `src/app/manifest.ts`, `src/app/layout.tsx`, `next.config.ts`, `src/proxy.ts`, `src/lib/offline/paginas.ts`, `src/components/tecnico/{formulario,nueva-inspeccion,tecnico-provider}.tsx`, `src/components/shared/sign-out-button.tsx`, `public/icons/*`, `tsconfig.json`, `tsconfig.sw.json`, `package.json`, `pnpm-lock.yaml`.
- **Verificación:** `pnpm lint` sin errores · `pnpm typecheck` sin errores (ahora revisa también el service worker con `tsconfig.sw.json`; el worker queda fuera del `tsconfig.json` porque su tipado de `webworker` rompe los tipos del DOM del resto) · `pnpm test` 69/69 · `pnpm build` correcto con 28 entradas precacheadas. **Prueba real en Chrome** con `next start` en el puerto 3100 y Supabase local: tras entrar como `tecnico.a@bbosch.cl` el service worker queda activo y controlando la página, con el precaché y las 3 páginas en `mlp-paginas`. Se apagó el servidor de la app y: `/tecnico` abre desde la copia local; «Nueva inspección» → Área → Equipo → Modo crea el borrador y abre el formulario con un `id` que el servidor nunca vio; recargar esa URL también abre el formulario con el borrador. Con el servidor de nuevo arriba, «Salir» borra `mlp-paginas`.
- **No verificado:** (1) **corte total de red**: en la prueba solo se apagó el servidor de la app; Supabase local seguía disponible, así que el envío y la sincronización con la red caída no se probaron de punta a punta (esa lógica sí tiene tests unitarios en `outbox.test.ts`). (2) Completar y enviar una inspección sin red, y verla después en la bandeja del supervisor (prueba de aceptación, pendiente 9). (3) La instalación en un teléfono real (Android e iOS) y el aspecto de los íconos; en iOS el manifest se usa de forma limitada. (4) Actualización del service worker cuando hay una versión nueva con la app abierta (`skipWaiting` y `clientsClaim` activados). (5) El funcionamiento en `next dev` (el worker está desactivado ahí).
- **Pendiente / riesgos:** (1) un técnico que nunca abrió la app con red no puede usarla sin red (hace falta una primera carga con conexión, que además baja el catálogo). (2) Los íconos son el logo sobre fondo claro, hechos a mano; conviene que diseño los revise. (3) Si cambia el contenido de las páginas del técnico, la copia local se actualiza sola al abrir la app con red. (4) Las áreas de supervisor, planificador y administrador siguen necesitando conexión (decisión de alcance).

### 2026-10-30 · Test RLS en pgTAP (cierra el Checkpoint 1)
- **Autor:** CNAVEA98 con Claude (rama `feat/roles-turnos-firma-doble`)
- **Qué se hizo:** `supabase/tests/rls.test.sql` con 30 pruebas pgTAP sobre los usuarios del seed, dentro de una transacción que se revierte (no deja datos; solo consume números del folio). Cubre: (1) visibilidad: cada técnico ve solo lo suyo y supervisor, planificador y administrador ven ambos turnos; (2) perfiles: el técnico no se asciende ni cambia su turno, el supervisor no cambia el rol de otro, el administrador sí cambia el turno; (3) catálogo: solo el administrador escribe; (4) `audit_log` solo lo lee el administrador; (5) firma doble: técnico y administrador no firman, el planificador no firma antes del supervisor, comentario obligatorio, el supervisor no firma dos veces, flujo `submitted` → `supervisor_signed` → `approved`, una aprobada no la modifica el técnico, rechazo del supervisor deja la inspección en `rejected`; (6) eliminación: el supervisor no puede, el DELETE directo (también del administrador) no borra y la función `delete_inspections` sí, con auditoría. Se corre con `corepack pnpm supabase test db` (descarga la imagen `pg_prove` la primera vez; requiere Docker y el seed aplicado).
- **Archivos:** `supabase/tests/rls.test.sql` (nuevo), `docs/BITACORA.md`.
- **Verificación:** `supabase test db` → `All tests successful`, 30/30. La primera corrida mostró 2 fallos que eran de mi expectativa (un UPDATE o DELETE filtrado por RLS afecta 0 filas y no lanza error); se cambiaron para comprobar el efecto real. No se tocó código de la app, así que no se repitieron lint, tsc, tests ni build.
- **Pendiente / riesgos:** el test no cubre las políticas de Storage ni las tablas hijas (`answers`, `findings`, `attachments`: escritura solo del técnico dueño en borrador), ni la RPC `submit_inspection` ni la lectura por lado del cliente (PostgREST); depende de los correos y turnos del seed y falla si se cambian. Los turnos A/B no restringen nada (es una decisión), por eso no hay prueba de «no ver otro turno».

### 2026-10-30 · Prueba en navegador del login por rol y del panel de firma del supervisor
- **Autor:** CNAVEA98 con Claude (rama `feat/roles-turnos-firma-doble`)
- **Qué se hizo:** prueba manual en Chrome contra la app y Supabase locales. Solo se probó, no se cambió código.
- **Verificación:** (1) el administrador ya tenía sesión y vio la bandeja con sus 4 inspecciones. (2) Se cerró sesión y se entró con `supervisor.b@bbosch.cl`: redirige a `/supervisor` y la bandeja muestra «Por firmar» con 3 inspecciones y el enlace «Revisar y firmar». (3) En el detalle de `INS-2026-000007`, «Firmar» sin datos muestra los 3 mensajes (elegir decisión, comentario obligatorio, falta la firma). (4) Elegir Aprobar, escribir el comentario y dibujar la firma con el mouse funciona. (5) Aparece el cuadro de confirmación propio («Va a APROBAR la inspección… es definitiva») y deja los campos bloqueados. (6) «Confirmar y firmar» guarda: en «Firmas de revisión» aparece «Supervisor · aprobó · Supervisor Turno B · 30-10-2026 16:10», con el comentario y la imagen de la firma. Sin errores en la consola del navegador. Esto cierra el «no verificado» de la entrada del panel de firma, salvo lo indicado abajo.
- **Segunda etapa (misma sesión):** con `planificador.a@bbosch.cl` la bandeja lista 2 inspecciones por firmar y el detalle muestra la firma del supervisor y el panel del planificador. Se aprobó `INS-2026-000007`: quedó con las dos firmas (supervisor 16:10, planificador 16:44), comentario e imagen de cada una. El rechazo se probó solo hasta el cuadro de confirmación («Va a RECHAZAR… es definitiva», decisión en rojo, comentario obligatorio) y se canceló con «Volver» sobre `INS-2026-000009`, que sigue por firmar; no se confirmó para no cerrar una inspección con firma manuscrita de pruebas anteriores. Sin errores en la consola.
- **Efecto sobre los datos:** `INS-2026-000007` quedó en «Aprobada» (dato de prueba local).
- **No verificado:** que «Confirmar y firmar» de un rechazo guarde el estado «Rechazada» desde la interfaz (sí se probó en SQL), la firma con lápiz táctil y el uso en teléfono.
- **Pendiente / riesgos:** el pull request no se abrió desde aquí porque la CLI `gh` no está instalada; se abre con el enlace `https://github.com/CNAVEA98/Inspecciones_BBOSCH/pull/new/feat/roles-turnos-firma-doble`.

### 2026-10-30 · Buscador y consulta en la bandeja; eliminación por el administrador
- **Autor:** CNAVEA98 con Claude (rama `feat/roles-turnos-firma-doble`)
- **Qué se hizo:** la bandeja (admin, supervisor, planificador) tiene buscador de texto (folio, TAG, equipo, área, modo, quien realizó, cuenta; sin distinguir tildes) y consulta por TAG exacto, turno y rango de fechas de envío; viaja en la URL. Al hacer clic en el TAG de una fila se ve el historial de ese equipo. El administrador marca casillas y elimina con cuadro de confirmación (folios listados). Cada eliminación deja copia de la fila (y de sus firmas) en `audit_log` con quién la hizo, y borra los archivos de Storage.
- **Archivos:** `supabase/migrations/0009_admin_elimina_inspecciones.sql` y `0010_delete_inspections_firmas.sql` (RPC `delete_inspections`, guards que ceden solo a un administrador dentro del RPC, política de borrado en Storage), `src/lib/revision/consulta.ts` (+ test), `src/components/revision/{bandeja,tabla-bandeja}.tsx`, `src/app/admin/actions.ts`, páginas de bandeja de los 3 roles, `src/lib/fecha.ts` (`fechaIso`).
- **Verificación:** lint y tsc sin errores · tests 69/69 · build correcto · SQL con rollback: el supervisor no puede borrar, el DELETE directo del admin no borra, el RPC borra inspección con respuestas, adjuntos y firmas y registra la auditoría (la 0009 fallaba con inspecciones firmadas; corregido en la 0010) · navegador (Chrome, local): búsqueda y filtro por TAG, casillas, confirmación y borrado de una inspección de prueba, que desapareció de la lista y de la base. El navegador detectó un error que el build no (función pasada de servidor a cliente), ya corregido.
- **Pendiente / riesgos:** no verificado: borrado de archivos en Storage desde la app (la prueba usó una inspección sin adjuntos) ni el borrado de varias a la vez. La búsqueda de texto se hace sobre las últimas 1000 inspecciones del estado elegido. El folio eliminado no se reutiliza (queda un salto en la numeración). Base de datos de equipos con TAG (para elegir un TAG y consultar solo ese equipo): sigue pendiente, ver `docs/ARBOL_INSPECCIONES.md`; hoy el TAG es texto libre del técnico.

### 2026-10-30 · Firma de revisión en las pestañas de supervisor y planificador
- **Autor:** CNAVEA98 (con Claude) · rama `feat/roles-turnos-firma-doble`
- **Qué se hizo:** el detalle de una inspección ahora tiene un panel «Revisión» para quien debe firmar: el supervisor ve el panel cuando la inspección está *Enviada*, y el planificador cuando está *Firmada por supervisor*. El administrador no firma. El panel pide decisión (Aprobar / Rechazar), comentario obligatorio y firma dibujada, valida antes de enviar, pide una confirmación («Va a APROBAR/RECHAZAR…, es definitivo») y luego sube la firma al bucket `signatures` (ruta única por intento) y llama a `review_inspection`. En la bandeja, las filas pendientes del rol muestran «Revisar y firmar» además de «PDF»; el detalle tiene el acceso «Ir a firmar ↓». `SignatureField` pasó a `components/shared` con texto de ayuda configurable (mouse o lápiz en escritorio).
- **Decisión de diseño:** la firma se dibuja cada vez (queda como evidencia propia de cada revisión); no hay firma guardada en el perfil. Un rechazo (de cualquiera de las dos etapas) cierra la inspección; el técnico debe crear una nueva. No se cambió el orden obligatorio supervisor → planificador, que ya garantiza la base de datos.
- **Archivos:** `src/components/revision/panel-revision.tsx` (nuevo), `src/components/revision/{detalle,bandeja}.tsx`, `src/components/shared/signature-field.tsx` (movido desde `tecnico`), `src/components/tecnico/formulario.tsx` (import), `src/app/{supervisor,planificador}/[id]/page.tsx`, `src/lib/revision/estado.ts` (+ tests).
- **Verificación:** `pnpm lint` sin errores · `pnpm tsc --noEmit` sin errores · `pnpm test` 59/59 · `pnpm build` correcto. **Flujo completo contra la app local** (inicio de sesión real de cada rol, páginas pedidas por HTTP, mismas llamadas de Storage y RPC que usa el panel), 20/20 comprobaciones: el supervisor ve el panel con la inspección *Enviada*, y ni el planificador ni el administrador lo ven; la bandeja del supervisor ofrece «Revisar y firmar»; sin comentario la base de datos rechaza («El comentario es obligatorio»); el planificador no puede firmar antes; el supervisor firma y la inspección pasa a *Firmada por supervisor*; entonces el panel pasa al planificador y su bandeja la lista; el supervisor no puede firmar dos veces; el planificador rechaza y el administrador ve el rechazo con su comentario; en estado final no hay panel. Las inspecciones de prueba se eliminaron (`audit_log` conserva su rastro porque es de solo inserción). Una primera corrida falló 2 de 22 comprobaciones del supervisor por compilación en caliente del servidor de desarrollo; repetida sobre una inspección nueva, pasaron todas.
- **No verificado:** **el uso en un navegador real**: dibujar la firma con el mouse, pulsar los botones, el mensaje de validación y el cuadro de confirmación. Lo comprobado es la lógica de servidor, los permisos y los datos, no la interacción del panel. Tampoco se probó la firma dibujada con lápiz táctil.
- **Pendiente / riesgos:** (1) probar el panel en el navegador con `supervisor.b@bbosch.cl` y `planificador.a@bbosch.cl`; (2) tras un rechazo el técnico no puede corregir la misma inspección (se evaluó y se dejó como mejora futura); (3) si falla la llamada `review_inspection` tras subir la firma, queda una imagen huérfana en `signatures` (inofensiva, no se muestra); (4) el PDF de una inspección firmada ya incluye ambas firmas, pero no se guarda congelado en el bucket `reports`.

### 2026-10-30 · Descarga del informe en PDF (administrador, supervisor y planificador)
- **Autor:** CNAVEA98 (con Claude) · rama `feat/roles-turnos-firma-doble`
- **Qué se hizo:** cada inspección enviada se descarga como PDF desde la bandeja (columna «Informe») y desde el detalle (botón «Descargar PDF»). El PDF reproduce el diseño «Cobre» de `docs/muestras/informe-transformador-piso.html`: encabezado grafito con logo BBOSCH, norma y estado; TAG grande; cuadrícula de datos del equipo; resultado con barra por estado (BN/ML/NT/NA/NR) y alerta de críticos; lecturas con barra y marca del máximo contra el límite; ítems agrupados por sección con pastillas de estado y observaciones; diagnóstico; tarjetas de firma (participantes, encargado, supervisor, planificador, con imagen, nombre y fecha); registro fotográfico con foto por ítem. Se agregó «Realizado por» y «Cuenta de envío · Turno» para la trazabilidad. Se genera en el servidor al pedirlo (no se guarda en Storage), así siempre refleja las firmas vigentes. El técnico no puede descargarlo (se le redirige a `/tecnico`).
- **Archivos:** `src/lib/informe/{modelo,generar.tsx,responder.ts}`, `src/lib/informe/modelo.test.ts`, `src/components/informe/informe-pdf.tsx`, `src/app/{admin,supervisor,planificador}/[id]/pdf/route.ts`, `src/components/revision/{bandeja,detalle}.tsx`, `src/lib/revision/estado.ts`.
- **Verificación:** `pnpm lint` sin errores ni avisos · `pnpm tsc --noEmit` sin errores · `pnpm test` 56/56 (10 nuevos del modelo, con la plantilla real del seed) · `pnpm build` correcto (aparecen las 3 rutas `/pdf`). **Prueba real contra la app local** (inicio de sesión con la librería de la app, petición a la ruta, conversión a imagen): admin, supervisor.b y planificador.a reciben `200 application/pdf`; técnico.a recibe `307 → /tecnico` en las rutas de admin y supervisor. Se revisaron visualmente `INS-2026-000006` y una inspección de prueba con foto JPEG, foto PNG, firma del participante y firmas de supervisor y planificador (esa inspección de prueba se eliminó después; los registros de `audit_log` quedan porque ese log es de solo inserción). Se corrigieron dos fallos vistos en esa revisión: cajas de diagnóstico encima de las firmas y título de grupo huérfano al pie de página.
- **Diferencias con la muestra:** la muestra usa las fuentes Geist y Geist Mono; el PDF usa Helvetica y Courier (incluidas en el PDF, sin descargar nada). El contenido y la composición son los de la muestra, la tipografía no. Las páginas son fluidas (se cortan donde corresponde) en vez de las 3 hojas fijas de la muestra. Las fotos aceptan PNG y JPEG; otros formatos se omiten.
- **No verificado:** el PDF abierto desde un navegador real con el botón (se probó la ruta con peticiones HTTP); un informe con muchas fotos (más de una página de fotos); `INS-2026-000003` (la enviada por la PWA) no se revisó visualmente; no se comparó pixel a pixel con la muestra.
- **Pendiente / riesgos:** (1) el PDF depende del diseño de la plantilla vigente (`readings`, `meta`, secciones): los otros formatos heredan el mismo diseño pero cada uno necesitará revisar sus lecturas; (2) si más adelante se quiere un PDF inmutable por inspección aprobada, guardarlo en el bucket `reports` al firmar el planificador; (3) el técnico no puede descargar su propio informe (pedido solo para admin, supervisor y planificador).

### 2026-10-30 · Propuesta de árbol de inspecciones (solo documento)
- **Autor:** CNAVEA98 (con Claude) · rama `feat/roles-turnos-firma-doble`
- **Qué se hizo:** se leyeron los 40 Word de `C:\Proyectos\INSPECCIONES KIZEO` (fuera del repo) y se propuso la estructura Área → Instalación → Sistema → Tipo de equipo → Variante → Modo → TAG. Ubicaciones confirmadas por el usuario: Chacay (Tranque, Planta, STATCOM, Piuquenes), Mina (Sala 12, SE Móviles, Parrones), El Mauro (Tranque general), Los Vilos (SE Los Vilos, Desalinizadora, PPCH). Chacay y Mina son sectores distintos (1600 m y 3200 m).
- **Archivos:** `docs/ARBOL_INSPECCIONES.md` (nuevo).
- **Verificación:** no aplica a código. La clasificación de formatos por sistema e instalación sale de los nombres de los documentos y de una comparación automática de texto; **es supuesto, no confirmado**. No se tocó código ni base de datos.
- **Pendiente / riesgos:** 5 decisiones abiertas listadas en el documento (formato 40, STMG, generadores sueltos, modo Plan Matriz vs Mantenimiento programado, agrupación en sistemas). Nada de esto está implementado: la app sigue con un solo formato (Transformador de piso × Plan Matriz).

### 2026-10-30 · Trazabilidad: quién realizó la inspección + turno, y revisión de todos los perfiles
- **Autor:** CNAVEA98 (con Claude) · rama `feat/roles-turnos-firma-doble`
- **Qué se hizo:** (1) el formulario del técnico pide «Nombre de quien realiza la inspección» (obligatorio, paso «Datos del equipo»); se guarda en `inspections.performed_by`. (2) Se guarda `inspections.technician_shift`, el turno de la cuenta al enviar (foto fija, aunque el admin cambie el turno después). (3) Bandeja y detalle muestran «Técnico: nombre», «Cuenta: …» y Turno. (4) Visibilidad entre turnos: sin cambios de código, `is_staff()` no filtra por turno; se comprobó.
- **Migración nueva:** `supabase/migrations/0008_ejecutor_turno.sql` (columnas + `submit_inspection` actualizada). Aplicada en Supabase local con `supabase migration up` (sin reset, se conservaron los datos). Inspecciones previas se rellenaron con el nombre y turno de la cuenta.
- **Archivos:** `src/lib/tecnico/draft.ts`, `src/lib/offline/db.ts`, `src/components/tecnico/formulario.tsx`, `src/lib/revision/queries.ts`, `src/components/revision/{bandeja,detalle}.tsx`, tests `draft.test.ts` y `outbox.test.ts`.
- **Verificación:** `pnpm lint` sin errores · `pnpm tsc --noEmit` sin errores · `pnpm test` 45/45 · `pnpm build` correcto. **Prueba de perfiles contra la BD local** (SQL con el JWT de cada usuario del seed, transacción revertida, script no guardado en el repo): técnico A y técnico B envían por la RPC real; cada técnico ve solo lo suyo (1); supervisor A/B, planificador A/B y admin ven las 2 (trazabilidad entre turnos OK); el supervisor B ve «Pedro Soto · turno A · cuenta Técnico Turno A». Firma: planificador no firma antes del supervisor, técnico y admin no firman, supervisor B firma lo del turno A, planificador B aprueba, doble firma del mismo supervisor falla, técnico no puede modificar una aprobada (0 filas), rechazo sin comentario falla, un supervisor no puede ascenderse a admin.
- **No verificado:** el formulario nuevo en navegador (campo, validación, envío real desde la PWA) y las pantallas con cada rol; la prueba SQL no pasa por la capa Next/PostgREST.
- **Pendiente / riesgos:** (1) envíos viejos en la cola del navegador (sin `performed_by`) entran con nombre vacío (la BD es permisiva; el cliente lo exige solo en envíos nuevos); (2) la prueba de perfiles conviene convertirla en `supabase/tests/rls.test.sql` (pgTAP, pendiente 3); (3) aprobar/rechazar desde la pantalla sigue pendiente.

### 2026-10-30 · Bandeja y detalle de solo lectura para supervisor y planificador
- **Autor:** CNAVEA98 (con Claude) · rama `feat/roles-turnos-firma-doble`
- **Qué se hizo:** la bandeja lista las inspecciones con filtro por estado (por firmar, todas, aprobadas, rechazadas). El detalle muestra datos generales, respuestas por sección según la plantilla, fotos (URL firmada de 1 hora), hallazgos, diagnóstico, participantes con su firma y las firmas de revisión. Componentes compartidos entre `/supervisor` y `/planificador`. **Aún no se puede aprobar ni rechazar desde la pantalla.**
- **Comprobación de que el envío del técnico llega a la BD:** en Supabase local hay 1 inspección `INS-2026-000003` (`submitted`, TAG `740-XF-001`) con 32 respuestas, 2 hallazgos, 1 adjunto y 1 archivo en Storage. El envío funciona; lo que faltaba era la pantalla del supervisor.
- **Archivos:** `src/lib/revision/{estado,queries}.ts`, `src/lib/revision/estado.test.ts`, `src/components/revision/{bandeja,detalle}.tsx`, `src/app/supervisor/{page.tsx,[id]/page.tsx}`, `src/app/planificador/{page.tsx,[id]/page.tsx}`.
- **Verificación:** `pnpm lint` sin errores · `pnpm tsc --noEmit` sin errores · `pnpm test` 43/43 · `pnpm build` correcto. **No verificado en navegador:** la bandeja y el detalle no se abrieron con un supervisor real, así que las consultas con relaciones de PostgREST (`profiles!technician_id`, `profiles!signer_id`) y las URL firmadas no se han probado.
- **Ampliación (mismo día):** el administrador entró y vio la bandeja vacía porque `/admin` seguía siendo una maqueta. Se conectó la misma bandeja y el detalle en `/admin` y `/admin/[id]` (solo lectura, por defecto «Todas»). Archivos: `src/app/admin/{page.tsx,[id]/page.tsx}`. Verificación: lint, tsc, tests 44/44 y build correctos; sigue sin probarse en navegador.
- **Pendiente / riesgos:** (1) probar en el navegador con `supervisor.a@bbosch.cl`; (2) solo hay 1 adjunto en la inspección enviada, por lo que las fotos de los ítems se ven poco o nada; conviene revisar si las fotos se están subiendo y asociando; (3) aprobar/rechazar con comentario y firma dibujada (RPC `review_inspection` ya existe); (4) filtros por área, equipo y fecha; (5) los folios 000001 y 000002 se consumieron sin inspección guardada, probablemente por envíos que fallaron y revirtieron.

### 2026-10-30 · Roles (admin, supervisor, planificador, técnico), turnos A/B y firma doble
- **Autor:** CNAVEA98 con Claude · rama `feat/roles-turnos-firma-doble`
- **Qué se hizo:** cuatro roles con turno A/B. Técnico llena formularios; supervisor firma la 1.ª etapa (`submitted` → `supervisor_signed`); planificador firma la 2.ª (`supervisor_signed` → `approved`) y descargará el PDF; cualquiera de los dos puede rechazar (`rejected`, terminal). Solo el administrador cambia rol y turno, ve todo y escribe catálogo y plantillas (no firma ni llena formularios). Supervisores y planificadores solo leen y firman. El turno es solo una etiqueta (no limita la visibilidad). Se eliminó «Crear cuenta» del login y se agregó el logo BBOSCH. La gestión de usuarios pasó de `/supervisor/usuarios` a `/admin/usuarios` (rol + turno). Áreas nuevas: `/admin`, `/planificador`.
- **Archivos:** `supabase/migrations/0007_roles_turnos.sql`, `supabase/seed.sql`, `src/lib/auth/roles.ts` (+ test), `src/lib/auth/session.ts`, `src/proxy.ts`, `src/components/shared/staff-shell.tsx`, `src/app/{admin,planificador,supervisor}/`, `src/app/login/*`.
- **Verificación:** `pnpm lint` sin errores · `pnpm tsc --noEmit` sin errores · `pnpm test` 38/38 · `pnpm build` correcto · `supabase db reset` aplica 0001–0007 y el seed sin errores. Pruebas SQL con rollback en la base local (como cada rol): supervisor no cambia roles (RLS, 0 filas); técnico no se auto-asciende ni cambia su turno (trigger); admin cambia rol y turno; técnico B no ve inspecciones del A; supervisor, planificador y admin las ven; planificador no firma antes del supervisor; admin no firma; supervisor no firma dos veces; flujo completo `submitted` → `supervisor_signed` → `approved`; una inspección aprobada no se puede modificar. **No verificado:** login y navegación por rol desde el navegador, la pantalla `/admin/usuarios` con datos, el logo en pantalla, y el rechazo en etapa 2 (solo por lectura del código).
- **Pendiente / riesgos:** (1) no existe UI para crear cuentas: hoy solo se crean por seed o por Supabase; falta una pantalla de alta en `/admin/usuarios`. (2) Las bandejas, la firma dibujada y el PDF siguen pendientes (pendientes 6 y 7); `review_inspection` ya soporta ambas etapas. (3) El rechazo sigue siendo terminal (la inspección rechazada no vuelve al técnico), igual que antes; si se quiere que vuelva a corrección, es un cambio aparte. (4) Antes solo el supervisor escribía catálogo y plantillas; ahora solo el administrador. (5) El seed trae usuarios `@bbosch.cl` para cada rol/turno, más los anteriores, cada uno con una contraseña numérica de 8 dígitos distinta (ver `supabase/seed.sql`); la `1234` anterior ya no sirve y además el formulario exige mínimo 8 caracteres. Solo para desarrollo local; se probó el login de las 10 cuentas contra la API de auth. (6) Se hizo `supabase db reset`: se borraron los datos locales de prueba. (7) La prueba SQL fue manual (no está en `supabase/tests`); falta convertirla a pgTAP (pendiente 3). (8) El envío a SAP no está modelado.

### 2026-10-30 · Una sola carpeta de trabajo: limpieza de copias duplicadas
- **Autor:** Claude Code (sesión de Cristóbal)
- **Qué se hizo:** la única carpeta de trabajo es `C:\Proyectos\mlp-inspecciones` (enlazada a `CNAVEA98/Inspecciones_BBOSCH`). Se eliminó el contenido de la copia antigua `E:\Proyectos\mlp-inspecciones` tras comprobar que no tenía nada que no estuviera en C: (los 6 archivos distintos eran los actualizados hoy en C:). La carpeta `entregas-vercel` (ZIP, SQL concatenados, demo) queda **obsoleta**: la demo vigente es `demo/` del repo (idéntica, comprobado archivo por archivo) y los ZIP y SQL ya no se mantienen. Las entradas antiguas de esta bitácora que citan `entregas-vercel/` o `vercel-demo.zip` se conservan como historia. `docs/DEPLOY_VERCEL.md` se reescribió: la demo se despliega desde GitHub con Root Directory `demo`, y los SQL salen de `supabase/migrations/` y `supabase/seed.sql`.
- **Archivos:** `docs/DEPLOY_VERCEL.md`, `docs/BITACORA.md`.
- **Verificación:** comparación por hash de la demo (E:, C: y `demo/`): sin diferencias. `C:\Proyectos\entregas-vercel` y `E:\Proyectos\entregas-vercel` se eliminaron por orden explícita del usuario (el primer intento fue bloqueado por el sistema de permisos; el segundo, con la orden directa, se ejecutó); se comprobó que ya no existen y que `C:\Proyectos` solo contiene `mlp-inspecciones`. **Pendiente de ejecutar por el usuario:** en `E:\Proyectos\mlp-inspecciones` queda solo la carpeta vacía `.claude` porque la sesión de Claude Code la tenía en uso; hay que borrar esa carpeta a mano tras cerrar la sesión.
- **Pendiente / riesgos:** nunca abrir Claude Code ni Visual Studio Code desde E:. El despliegue en Vercel descrito en `docs/DEPLOY_VERCEL.md` no se ha probado.

### 2026-10-30 · Supabase local funcionando y usuario supervisor@bbosch.cl
- **Autor:** Claude Code (sesión de Cristóbal)
- **Qué se hizo:** con Docker Desktop y WSL2 operativos se levantó Supabase local (`supabase start`): **las migraciones 0001 a 0006 y el seed se aplicaron sin errores por primera vez en Postgres real**. Se agregó al seed el usuario `supervisor@bbosch.cl` (contraseña `1234`, rol `supervisor`). Se actualizó `.env.local` (no versionado) con la URL y la anon key locales. Se documentó en `CLAUDE.md` el flujo de equipo con GitHub (rama, bitácora en el mismo commit, PR).
- **Archivos:** `supabase/seed.sql`, `CLAUDE.md`, `docs/BITACORA.md`.
- **Verificación:** `supabase start` aplicó las 6 migraciones y el seed sin errores. Inicio de sesión de `supervisor@bbosch.cl` / `1234` contra la API de auth local: correcto. `/login` en `localhost:3000` responde 200. **No verificado:** inicio de sesión desde la interfaz en el navegador, redirección por rol, test RLS (sigue sin escribir) ni envío completo de una inspección.
- **Pendiente / riesgos:** la contraseña `1234` es solo para desarrollo local y está en el seed del repo (privado); no usarla en un Supabase remoto. El seed se aplica con `supabase db reset`, que borra los datos locales. Los usuarios de `mlp.local` siguen en el seed.

### 2026-10-30 · Migración a C:\Proyectos y preparación del repositorio en GitHub
- **Autor:** Claude Code
- **Qué se hizo:** el proyecto se copió del disco E: (exFAT, sin symlinks, fallaba `pnpm install`) a `C:\Proyectos\mlp-inspecciones` (NTFS). La demo estática pasó a `demo/` dentro del repo (antes `entregas-vercel/vercel-demo`; las entradas antiguas de esta bitácora conservan la ruta vieja). Se creó `.env.local` con valores de relleno para poder abrir `localhost:3000` sin Supabase (no se versiona: `.gitignore` excluye `.env*`). Repositorio privado en GitHub: `CNAVEA98/Inspecciones_BBOSCH`. Usuario de Linux en WSL renombrado a `cnv`.
- **Archivos:** `demo/*`, `docs/formatos/LEEME.md`, `docs/BITACORA.md`.
- **Verificación:** copia comparada con el original (101 archivos cada uno, sin `node_modules` ni `.next`); revisión previa al commit sin secretos ni archivos de más de 500 KB. Ya en C: con `corepack pnpm install` normal (35 s, sin `hoisted`): `lint` sin errores, `tsc --noEmit` sin errores, `test` 33/33, `build` correcto. Con el linker `hoisted` (necesario solo en exFAT), `npm run dev` había arrancado y `/login` respondió 200 en E:. Primer commit `7fbf991` subido a `origin/main`. Esto cierra el pendiente «lint/tsc/tests/build sin verificar» de la entrada sobre la foto en ML.
- **Pendiente / riesgos:** en C: reinstalar con `corepack pnpm install` (sin `hoisted`). Supabase local sigue sin probarse (Docker/WSL2 recién instalados). Usuario `supervisor@bbosch.cl` aún no creado (hoy el seed trae `supervisor@mlp.local`). Trabajo en equipo: ramas y Pull Requests; la bitácora es el punto con más riesgo de conflicto, agregar la entrada propia arriba y resolver al unir.

### 2026-10-30 · Formatos STN pasan a BBOSCH (firmantes)
- **Autor:** Claude Code
- **Qué se hizo:** el usuario indicó que STN era el contratista anterior y ahora es BBOSCH. En `formatos/desconectador-23kv.js` y `formatos/banco-condensadores-mauro.js` los firmantes pasan a «Supervisor BBOSCH» y «Planificador BBOSCH»; el logo BBOSCH del informe queda correcto. Se regeneró `vercel-demo.zip`.
- **Verificación:** cambio de texto en la configuración; no se volvió a probar en el navegador.
- **Pendiente / riesgos:** falta el número BBOSCH de cada estándar (hoy siguen como `EST-ELEC-INSP-MLP-STN-01` y `-02`). Los Word de `docs/formatos` no se modificaron.

### 2026-10-30 · Demo: motor común de formularios + Desconectador 23 kV (STN-01) y Banco de Condensadores Mauro (STN-02)
- **Autor:** Claude Code
- **Qué se hizo:** nuevo `inspeccion.html` (motor común para inspecciones de un equipo) que carga la definición desde `formatos/<id>.js` según `?f=<id>`. Se crearon `formatos/desconectador-23kv.js` (24 ítems) y `formatos/banco-condensadores-mauro.js` (56 ítems), y se pasó Transformador de Piso a `formatos/transformador-piso.js` (conserva la clave de borrador `mlp-form-trafo-v1`). `formulario.html` quedó como redirección. El motor agrega lista de opciones por ítem (`opc`, usada en Abierto/Cerrado de los relés), lecturas y «Consideraciones» opcionales. Menú: se activaron los dos formatos nuevos y el formulario de grupos generadores pasó a la entrada «Insp. Prueba de Grupos Generadores… Chacay-Mina» que agregó el usuario; «Insp. Grupo Generador» queda «Próximamente».
- **Supuestos:** norma `EST-ELEC-INSP-MLP-STN-0X`, confirmada por el usuario (el texto dentro del .docx dice `EST-ELEC-MLP-STN-0X`, sin INSP). Corrientes de relé en A; termografía del desconectador con valor opcional en °C. Agrupación de ítems en secciones propias. Logo BBOSCH en el informe aunque los firmantes sean STN.
- **Archivos:** `entregas-vercel/vercel-demo/{inspeccion,formulario,inspecciones}.html`, `entregas-vercel/vercel-demo/formatos/*.js`, `entregas-vercel/vercel-demo.zip`, `docs/formatos/LEEME.md`.
- **Verificación:** Edge headless, prueba scriptada de los 3 formatos: grupos cubren todos los ítems, validación completa, ML sin observación bloquea y sin foto no, consideraciones según formato, lista Abierto/Cerrado guarda y se ve en el informe, lectura de corriente 12,5 A, firmantes STN, lecturas del transformador intactas; sin errores de JavaScript. `?f=` inexistente muestra «Formulario no encontrado». Sin prueba en teléfono ni redeploy.
- **Pendiente / riesgos:** confirmar códigos de norma, unidades y si el logo del informe debe cambiar para formatos STN.

### 2026-10-30 · La foto deja de ser obligatoria en ML (todas las inspecciones)
- **Autor:** Claude Code
- **Qué se hizo:** a pedido del usuario, ML, NO y NR exigen solo observación; la opción de tomar foto sigue disponible en todos los ítems. Aplicado en la app Next (validador de plantillas, borrador del técnico, etiqueta «Foto (opcional)»), en los dos formularios de la demo y en la muestra de `docs/muestras`. Se actualizaron los tests y `docs/DESIGN.md`. Se regeneró `vercel-demo.zip`.
- **Archivos:** `src/lib/templates/{validate,schema,validate.test}.ts`, `src/lib/tecnico/{draft,draft.test}.ts`, `src/components/tecnico/item-field.tsx`, `docs/DESIGN.md`, `docs/muestras/formulario-transformador-piso.html`, `entregas-vercel/vercel-demo/{formulario,formulario-grupo-generador}.html`.
- **Verificación:** **lint, tsc y tests no verificados**: en este equipo Node.js no está instalado o no está en el PATH (`node`, `corepack`, `pnpm` no se reconocen). Demo verificada en Edge headless: en ambos formularios un ítem ML con observación y sin foto queda sin faltas, sin errores de JavaScript.
- **Pendiente / riesgos:** correr `corepack pnpm lint`, `tsc --noEmit`, `test` y `build` en un equipo con Node. Un hallazgo ML sin foto se envía con `photo_attachment_id = null` (la columna lo admite).

### 2026-10-30 · Demo: formulario Pruebas Grupos Generadores Chacay-Mina (EST-ELEC-INSP-MLP-BBOSCH-18)
- **Autor:** Claude Code
- **Qué se hizo:** a partir de `docs/formatos/18_INSPECCION PRUEBAS DE GRUPOS GENERADORES…docx` se creó `formulario-grupo-generador.html` (mismo diseño y motor que el de transformador). Una inspección incluye **varios grupos generadores** (el formato pide «Cantidad de equipos»): selector de grupos con «＋ Agregar», TAG y 30 ítems por grupo. Ítems 22 y 26 usan SÍ/NO/NA/NR; ítem 27 es fecha. Reglas: ML exige observación y foto; NO y NR exigen observación. El informe muestra un resumen total y, por grupo, lecturas con horas de prueba y energía generada calculadas (horómetro y energía después − actual). Activado en el menú `inspecciones.html`.
- **Supuestos:** unidades no indicadas en el formato: Voltaje batería y Tensión cargador en V, Potencia en kW, Horómetro en h, Corrientes en A. Agrupación de ítems en 7 secciones (no está en el formato).
- **Archivos:** `entregas-vercel/vercel-demo/{formulario-grupo-generador,inspecciones}.html`, `entregas-vercel/vercel-demo.zip`.
- **Verificación:** Edge headless a 1300px y 600px sin errores de JavaScript. Prueba scriptada con 2 grupos: agregar/quitar grupo, SÍ/NO, validación (NO sin observación y ML sin foto bloquean), 58/60 conformes, horas de prueba 0,5 y energía 150 kWh correctas, fecha del extintor en dd-mm-aaaa. Sin prueba en teléfono ni redeploy.
- **Pendiente / riesgos:** confirmar unidades y si Potencia es kW; no existe aún plantilla de este formato en `supabase/seed.sql` para la app Next.

### 2026-10-30 · Demo: menú de tipos de inspección
- **Autor:** Claude Code
- **Qué se hizo:** nueva página `inspecciones.html` con la lista de tipos (Transformador de Piso, Transformador Aéreo, Reconectador, Grupo Generador, Parrón de Maniobras). Solo Transformador de Piso abre formulario (`formulario.html`); los demás muestran «Próximamente». La lista es el arreglo `TIPOS` al inicio del script: para habilitar uno se agrega su formulario y su `href`. «Formularios Inspecciones» en la portada lleva ahora al menú, y el formulario tiene «← Volver» al menú y título «Insp. Transformador de Piso». Se regeneró `vercel-demo.zip`.
- **Archivos:** `entregas-vercel/vercel-demo/{inspecciones,index,formulario}.html`, `entregas-vercel/vercel-demo.zip`.
- **Verificación:** Edge headless a 600px: menú y barra del formulario se ven correctos. Sin redeploy ni prueba en teléfono.
- **Pendiente / riesgos:** listado final de tipos y sus formularios; en la app Next el equivalente es el catálogo de equipos y plantillas en Supabase.

### 2026-10-30 · Demo: texto superpuesto del informe en iPhone
- **Autor:** Claude Code
- **Qué se hizo:** el informe reduce las hojas A4 con `zoom` y Safari iOS agrandaba el texto (autosizing), por lo que las filas se superponían. Se agregó `text-size-adjust: 100%` en `formulario.html` e `informe.html` de la demo. Se regeneró `vercel-demo.zip`.
- **Archivos:** `entregas-vercel/vercel-demo/{formulario,informe}.html`, `entregas-vercel/vercel-demo.zip`.
- **Verificación:** Edge a 1200px: el informe se ve igual que antes. **En iPhone no verificado** (el autosizing solo ocurre en Safari iOS; falta redeploy y prueba en el teléfono).
- **Pendiente / riesgos:** las muestras de `docs/muestras/` tienen el mismo problema; la app Next debe incluir la misma regla cuando tenga la vista de informe.

### 2026-10-30 · Demo: se quitan botones Formulario, Informe y Cargar ejemplo
- **Autor:** Claude Code
- **Qué se hizo:** en `entregas-vercel/vercel-demo/formulario.html` se eliminaron los botones «Formulario», «Informe» (pestañas que solo se veían bajo 1000px) y «Cargar ejemplo», con su listener. En móvil queda siempre la vista del formulario; «Imprimir / PDF» pasa al informe y vuelve al formulario al cerrar la impresión (`afterprint`). Se regeneró `vercel-demo.zip`. La muestra original en `docs/muestras/` no se tocó.
- **Archivos:** `entregas-vercel/vercel-demo/formulario.html`, `entregas-vercel/vercel-demo.zip`.
- **Verificación:** Edge headless a 600px: carga sin errores de JavaScript y la barra muestra solo En línea, Borrar todo, Enviar inspección e Imprimir / PDF. La vuelta tras imprimir en un teléfono real no se probó. Sin redeploy.
- **Pendiente / riesgos:** en móvil el informe ya no se puede ver en pantalla, solo al imprimir. En la vista de informe en el teléfono el texto de los ítems se superpone (visto en captura del usuario).

### 2026-10-30 · Portada de la demo: «Standard Job» con logo BBOSCH
- **Autor:** Claude Code
- **Qué se hizo:** en `entregas-vercel/vercel-demo/index.html` el título pasa de «Inspecciones MLP» a «Standard Job», se agrega el logo BBOSCH arriba (caja blanca redondeada, copia en `vercel-demo/brand/`) y las opciones pasan a «Formularios Inspecciones» (abre `formulario.html`) y «Formulario Mantenciones» (deshabilitada, «Próximamente», porque aún no hay plantilla de mantenimiento). Se quitó el acceso a `informe.html` desde la portada (el archivo sigue publicado). Se regeneró `vercel-demo.zip`.
- **Archivos:** `entregas-vercel/vercel-demo/index.html`, `entregas-vercel/vercel-demo/brand/bbosch-logo.png`, `entregas-vercel/vercel-demo.zip`.
- **Verificación:** captura con Edge headless a 600px: logo, título y botones correctos. No se volvió a desplegar en Vercel.
- **Pendiente / riesgos:** falta redeploy en Vercel para ver el cambio en el teléfono; definir a dónde lleva «Formulario Mantenciones».

### 2026-10-29 · Entregables para probar en Vercel
- **Autor:** Claude Code
- **Qué se hizo:** carpeta `Proyectos/entregas-vercel/` con `mlp-inspecciones.zip` (proyecto sin `node_modules`, `.next`, `.git` ni `.env*`), `vercel-demo.zip` (HTML estáticos del formulario e informe, sin Supabase), `supabase-sql.zip` (migraciones concatenadas y catálogo con la plantilla, sin usuarios de desarrollo) y `LEEME_DEPLOY_VERCEL.md`. Guía en `docs/DEPLOY_VERCEL.md`. No se hizo ningún deploy ni se tocó ningún Supabase remoto.
- **Archivos:** `docs/DEPLOY_VERCEL.md`, `entregas-vercel/*`.
- **Verificación:** el ZIP del proyecto pesa 682 KB, sin `node_modules` y con `pnpm-lock.yaml`; los SQL no incluyen `mlp.local`. El deploy en Vercel y la ejecución de los SQL en un Supabase real **no se han probado**.
- **Pendiente / riesgos:** las migraciones nunca se han ejecutado en Postgres real; pueden fallar al primer intento. Sin service worker, la prueba con red apagada solo funciona si no se recarga la página.

### 2026-10-29 · Flujo del técnico (UI)
- **Autor:** Claude Code
- **Qué se hizo:** inicio con lista de inspecciones e indicador de sincronización; selección Área → Equipo → Modo desde el catálogo (con copia local); formulario por secciones con estados BN/ML/NT/NA/NR, valores con unidad, fotos, severidad de hallazgo, firma dibujada, revisión y envío a la cola offline. La copia local del catálogo se muestra al instante y se actualiza en segundo plano.
- **Archivos:** `src/components/tecnico/*`, `src/app/tecnico/**`, `src/lib/tecnico/{catalog,draft,photos,hooks}.ts`, `src/lib/fecha.ts`; migración `0004` (adjunto `participant_signature`).
- **Verificación:** lint, tsc y build sin errores; `pnpm test` 33/33 (6 nuevos en `draft.test.ts`). Prueba manual a 375px con Supabase inalcanzable y catálogo simulado: selección, creación del borrador, guardado local y pantalla de revisión con 7 problemas.
- **Pendiente / riesgos:** envío completo (firma real, subida de fotos, RPC) sin probar contra Supabase; falta vista de solo lectura de enviadas; si se pulsan estado y valor en el mismo instante el valor puede pisar el estado (solo ocurre con eventos simultáneos, no con uso humano).

### 2026-10-29 · Núcleo offline
- **Autor:** Claude Code
- **Qué se hizo:** base Dexie (borradores, cola, fotos, catálogo); cola de envío idempotente con reintentos de espera creciente (2 s hasta 5 min, 12 intentos), recuperación de entradas `sending`, distinción de errores reintentables; transporte Supabase (Storage + RPC `submit_inspection`); controlador de sincronización; compresión de fotos.
- **Archivos:** `src/lib/offline/{db,outbox,transport,sync,compress}.ts`, `outbox.test.ts`.
- **Verificación:** `pnpm test` 27/27 en ese momento (13 nuevos): encola sin red, envía al reconectar, sin duplicados (pasadas simultáneas, mismo id, respuesta perdida), fotos no se re-suben, rechazo permanente no se reintenta.
- **Pendiente / riesgos:** probado con servidor simulado, no con Supabase ni red real en el navegador; la compresión real de imagen no tiene test (solo el cálculo de tamaño).

### 2026-10-29 · Logo BBOSCH en los formatos
- **Autor:** Claude Code
- **Qué se hizo:** logo en el encabezado de los dos formatos (Cobre y Clásico) dentro de una caja blanca redondeada; copia en `public/brand/`. Regla anotada en `docs/DESIGN.md`.
- **Archivos:** `public/brand/bbosch-logo.png`, `docs/muestras/*.html`, `docs/DESIGN.md`.
- **Verificación:** logo carga en pantalla; páginas del formato Cobre caben; Clásico quedó con 16 ítems en la página 1 y no se revisó visualmente tras el ajuste.
- **Pendiente / riesgos:** el PDF final debe usar el mismo PNG.

### 2026-10-29 · Paso 3: autenticación y rutas por rol
- **Autor:** Claude Code
- **Qué se hizo:** clientes Supabase (navegador, servidor, proxy), `src/proxy.ts` con chequeo optimista por rol, `requireRole()` en los layouts, login y registro (solo técnico) con diseño propio, pantalla `/supervisor/usuarios` para asignar roles.
- **Archivos:** `src/proxy.ts`, `src/lib/supabase/*`, `src/lib/auth/*`, `src/app/login/*`, `src/app/{tecnico,supervisor}/**`, `src/app/globals.css`, `next.config.ts`.
- **Verificación:** lint, tsc, build sin errores; sin sesión `/tecnico` redirige a `/login?next=/tecnico`; login visto a 1440px y 375px.
- **Pendiente / riesgos:** login real, cambio de rol y RLS sin probar (sin base local). La fuente Geist no cargó en la prueba por falta de acceso a Google Fonts.

### 2026-10-29 · Plantilla real y esquema de plantillas
- **Autor:** Claude Code
- **Qué se hizo:** el esquema Zod pasó a ítems de verificación del estándar EST-ELEC-INSP-MLP-BBOSCH-12 (estado BN/ML/NT/NA/NR, valor con unidad, observación, fotos) más cabecera, roles y lecturas. El seed reemplaza el ejemplo por la plantilla real de 29 ítems.
- **Archivos:** `src/lib/templates/{schema,validate,validate.test}.ts`, `supabase/seed.sql`.
- **Verificación:** `pnpm test` 14/14, lint y tsc sin errores.
- **Pendiente / riesgos:** plantillas de los demás equipos y del modo Mantenimiento programado.

### 2026-10-29 · Diseño Cobre y formularios de muestra
- **Autor:** Claude Code
- **Qué se hizo:** a partir del PDF 740XF001 y el .doc del estándar se hicieron `informe-transformador-piso.html` y `formulario-transformador-piso.html` (formulario interactivo con informe en vivo, validación de reglas y envío simulado). Se eligió y luego se reemplazó SAP por el diseño Cobre; se retiró la geo-referencia a pedido del usuario. `docs/DESIGN.md` documenta el sistema.
- **Archivos:** `docs/muestras/*.html`, `docs/DESIGN.md`.
- **Verificación:** probado en el navegador a 1440px y 375px; flujo completo del formulario (errores, folio simulado, bloqueo).
- **Pendiente / riesgos:** es una maqueta; el PDF real aún no existe.

### 2026-10-29 · Paso 2 (parcial): migraciones, seed y Zod
- **Autor:** Claude Code
- **Qué se hizo:** migraciones `0001` a `0006`: perfiles y guard de rol, catálogo, plantillas inmutables, inspecciones con triggers de transición e inmutabilidad, auditoría, RLS en todas las tablas, buckets privados y RPC `submit_inspection` / `review_inspection`. Seed con catálogo (4 áreas, 5 equipos, 2 modos) y usuarios de desarrollo.
- **Archivos:** `supabase/migrations/*.sql`, `supabase/seed.sql`, `supabase/config.toml`.
- **Verificación:** **no verificado contra Postgres**: Docker Desktop no arranca porque WSL2 no está instalado.
- **Pendiente / riesgos:** aplicar con `supabase db reset` y corregir lo que falle; escribir el test RLS.

### 2026-10-29 · Paso 1: scaffold
- **Autor:** Claude Code
- **Qué se hizo:** proyecto Next 16.4.3 con React 19, Tailwind 4 y TypeScript estricto en `Proyectos/mlp-inspecciones`; dependencias aprobadas (dexie, zod, react-hook-form, signature_pad, @react-pdf/renderer, @supabase/supabase-js, @supabase/ssr, base de shadcn, vitest, fake-indexeddb, supabase CLI); `.env.example` solo con nombres de variables.
- **Archivos:** `package.json`, `vitest.config.ts`, `.env.example`, `.gitignore`.
- **Verificación:** `pnpm lint`, `pnpm tsc --noEmit`, `pnpm build` sin errores.
- **Pendiente / riesgos:** `signature_pad` y `react-hook-form` están instaladas pero aún sin uso (la firma se dibujó con canvas propio).
