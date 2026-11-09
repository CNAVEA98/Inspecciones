# Registro oficial de cambios · Inspecciones MLP

Historial completo y único de todo lo realizado (web y app móvil), de lo más reciente a lo más antiguo. Etiquetas: `[WEB]` = Next.js/Supabase, `[APP]` = `app-movil/`.
Reglas y formato de las entradas en [`LEEME.md`](LEEME.md); estado, pendientes y decisiones en [`ESTADO.md`](ESTADO.md).

> **Nota sobre rutas antiguas:** las entradas anteriores al 2026-11-09 citan rutas que luego se movieron: `docs/BITACORA.md` y `app-movil/BITACORA.md` → esta carpeta;
> `docs/DESIGN.md`, `DEPLOY_VERCEL.md`, `EXPORT_MAESTRO.md`, `LICENCIAS.md` → `docs/guias/`; `docs/MAPEO_ZONA_AREA.md`, `COMPARATIVA_MANUALES_*` y `AUDITORIA_REACT_UI_TECNICO.md` → `docs/referencia/`;
> `supabase/parche_plantillas_2026-11-06.sql` → `supabase/parches/`; `demo/` y `docs/archivo/` se eliminaron (siguen en el historial de git).

### 2026-11-09 · [WEB] [APP] V1.1.6: el PDF oficial de cada inspección aprobada queda archivado en Storage
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/pdf-archivado-storage` (sobre `feat/app-movil-revision`) · **Versión:** V1.1.6 (web) y app 1.1.1
- **Qué se hizo (pendiente 4):** al aprobarse una inspección (firma del programador) el servidor guarda su PDF una sola vez en el bucket privado `reports`, ruta `{inspection_id}/{folio}.pdf`, y desde entonces **toda descarga de una aprobada entrega esa misma copia** (web de los 4 roles y app móvil). Decisiones de Cristóbal: (1) escribe **solo el servidor** con `SUPABASE_SERVICE_ROLE_KEY` (sin `NEXT_PUBLIC_`); ningún usuario tiene política de escritura en `reports`, así que nadie puede subir un PDF armado a mano, y no hay políticas de update ni delete: la copia no se reemplaza; (2) la descarga entrega la copia archivada y, si aún no existe, la genera y la guarda (cubre las aprobadas anteriores y un archivado fallido). Rechazadas y en revisión se siguen generando al vuelo y no se archivan. Quién puede ver cada inspección lo sigue decidiendo RLS con la sesión del usuario; la clave de servicio solo toca el archivo. Si dos peticiones archivan a la vez, gana la primera (subida sin `upsert`). Sin la clave (otro equipo, Preview) todo funciona como antes, sin archivar. **Sin migración y sin dependencias nuevas.**
  Disparo justo después de la firma final: el panel web llama `POST /planificador/[id]/pdf` y la app `POST /api/movil/informe/[id]` (mejor esfuerzo: si falla, se archiva en la próxima descarga).
- **Archivos:** `src/lib/informe/archivo.ts` (+ `archivo.test.ts`, 7 pruebas), `src/lib/informe/responder.ts` (`archivarInforme`, copia archivada en la descarga), `src/lib/informe/responder-movil.ts`, `src/app/planificador/[id]/pdf/route.ts` y `src/app/api/movil/informe/[id]/route.ts` (POST), `src/components/revision/panel-revision.tsx`, `app-movil/src/lib/tecnico/informe.ts` (`archivarOficial`), `app-movil/src/components/panel-revision.tsx`, versiones (`package.json`, `src/lib/version.ts`, `app-movil/app.json`, `app-movil/package.json`), `docs/guias/DEPLOY_VERCEL.md` (variable nueva), `docs/guias/DESARROLLO.md`, `docs/bitacora/LEEME.md`, `ESTADO.md`, `docs/MAESTRO.md`.
- **Verificación (2026-11-09):** `lint` 0 errores (1 aviso previo), `tsc` sin errores, `test` **262/262**, `build` correcto; app: `tsc` sin errores y **303** pruebas. **Prueba de punta a punta contra el Supabase local** (web compilada con `next start` en el puerto 3001 y la clave de servicio local pasada por entorno, sin tocar `.env*`): supervisor y programador aprueban `INS-2026-000004` → `POST` móvil antes de la firma final 409, después **201** y la copia queda en `reports` (172 KB, `%PDF-`), segundo `POST` 204; las descargas de supervisor, programador y administrador son **idénticas byte a byte** a la copia; programador y administrador **no pueden** subir un PDF propio, reemplazar la copia ni borrarla (RLS); la aprobada antigua `INS-2026-000031` se archivó en su primera descarga; una enviada se descarga al vuelo, no se archiva y su `POST` responde 409; sin token 401. Ruta web con sesión por cookies (`INS-2026-000005`): el supervisor es redirigido (307), el programador recibe 409 antes de firmar y **201** después, y la descarga web entrega la copia archivada.
- **No verificado:** el clic real en el panel web y en la app (se probaron las mismas rutas por HTTP con sesiones reales, no la pantalla); la app 1.1.1 no se abrió en el emulador. **En Vercel falta cargar `SUPABASE_SERVICE_ROLE_KEY` (solo Production)**: no se revisó si la integración ya la dejó; sin ella el sitio publicado sigue generando al vuelo, sin archivar.
- **Pendiente / riesgos:** el borrado de inspecciones del administrador (`delete_inspections`) no borra la copia de `reports` (queda como registro; decidir). Cada aprobada suma ~170–200 KB a Storage (ver pendiente 25). Datos de prueba locales: `INS-2026-000004` y `INS-2026-000005` quedaron aprobadas y archivadas (solo local).

### 2026-11-09 · [APP] App V1.1.0: supervisor, programador y administrador pueden revisar desde el teléfono
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil-revision` (sobre `docs/reorganizar-documentacion`)
- **Qué se hizo:** hasta ahora la app solo admitía técnicos (los demás roles recibían «Esta app es solo para técnicos» y se cerraba su sesión). Ahora entran los cuatro roles: el técnico va a su inicio de siempre y los otros tres a `app/revision`: **bandeja** (filtros Por firmar / Todas / Aprobadas / Rechazadas, búsqueda por folio, TAG, equipo, área o técnico, y turno), **detalle** de solo lectura (datos, respuestas con fotos ampliables, hallazgos con su seguimiento, diagnóstico, encargado y firmas), **PDF oficial** del servidor (`/api/movil/informe/[id]`) y **firma en dos etapas** (decisión, comentario obligatorio solo al rechazar, firma dibujada, confirmación definitiva). El administrador consulta y descarga, no firma. Todo con las mismas reglas de acceso (RLS) y el RPC `review_inspection` de la web; **solo con señal**, sin cola ni base local. Sin dependencias nuevas.
- **Archivos:** `app-movil/src/app/revision/{index,[id]}.tsx`, `src/components/{detalle-revision,panel-revision,firma-revision}.tsx`, `src/lib/revision/{servidor,filtrar,firma,estado,queries}.ts`, `src/lib/revision-contexto.tsx`, `src/lib/sesion.tsx` (ya no rechaza roles), `src/app/_layout.tsx` y `index.tsx` (ruta por rol), `src/lib/tecnico/informe.ts` (`entregarPdfOficial`), `app.json` y `package.json` (versión de la app 1.0.0 → 1.1.0).
- **Verificación (2026-11-09):** `tsc` sin errores, **303 pruebas** (11 nuevas: etapa por rol, filtros, búsqueda sin tildes, base64, firma con Supabase simulado), `expo-doctor` 20/20. **Prueba en el emulador Android** (Android Studio, AVD `Medium_Phone_API_37.0`, Expo Go 58.0.5) contra el Supabase **local** en Docker y el servidor web local (por `adb reverse`; las variables `EXPO_PUBLIC_*` se pasaron por entorno, sin tocar `app-movil/.env`):
  `SUPERVISOR_A` entra a la bandeja (23 por firmar) · detalle correcto · PDF oficial descargado (HTTP 200, 2 páginas, «ENVIADA») · firma sin decidir muestra «Elija si aprueba o rechaza. Falta la firma.» · aprobó con comentario y firma: la base queda `supervisor_signed`, con el comentario y la imagen (48 KB) en Storage a nombre de «Supervisor A» ·
  `PROGRAMADOR_A` ve solo esa inspección en «Por firmar» y la firma: queda `approved` con las dos firmas · `ADMINISTRADOR` ve 22 por firmar y, al abrir una, solo la consulta («no firma») · rechazar sin comentario muestra «El comentario es obligatorio al rechazar.» y no firma · `TECNICO_A` sigue entrando a su inicio (29 enviadas).
- **Hallazgos durante la prueba:** (1) el primer arranque falló con «Cannot find native module 'ExpoSQLite'» por un estado viejo de Expo Go en el emulador: se resolvió con `adb shell pm clear host.exp.exponent` (no era el código). (2) El emulador no alcanzó el Supabase por `10.0.2.2` (cortafuegos de Windows): se usó `adb reverse tcp:54321` y `tcp:3000` y `localhost`. (3) Un error de plural («inspecciónes») y una sangría doble en los títulos del detalle: ambos corregidos en el código (el plural se vio bien en pantalla; la sangría no se volvió a ver en el emulador).
- **No verificado / pendiente:** teléfono físico, iPhone y APK con esta versión; el comportamiento sin señal (muestra el error de conexión; no se probó con modo avión); el seguimiento de hallazgos SAP y «Equipos con fallas» siguen solo en la web; la firma dibujada con el dedo real (en la prueba se simuló con deslizamientos de `adb`). Datos de prueba: la inspección `INS-2026-000031` de la base **local** quedó aprobada (solo local).

### 2026-11-09 · [WEB] [APP] V1.1.5: autoría de la aplicación, licencia y plan de la marcha en blanco
- **Autor:** Cristóbal (con Claude) · **Rama:** `docs/reorganizar-documentacion` · **Versión:** V1.1.5
- **Qué se hizo:** el código y los textos presentaban la app como «operada por Bbosch». Se corrigió: es una propuesta propia de Cristóbal Navea y Manuel Aguilar, desarrollada **para** Bbosch. Pie de página (web y app móvil), `/privacidad` y `/condiciones` actualizados; `VERSION_AVISO_PRIVACIDAD` pasó a `2026-11-09` (a cada usuario se le vuelve a mostrar el aviso). Nuevo `LICENSE` («todos los derechos reservados», formatos y datos de Bbosch/MLP excluidos) y `author`/`license: UNLICENSED` en ambos `package.json`. `ESTADO.md`: medición de uso de Supabase del 2026-11-09 (solo lectura), plan de marcha en blanco con las consultas para medir el ritmo de llenado, pendientes nuevos (autoría/acuerdo con Bbosch, marcha en blanco, supervisor y programador en la app móvil), reescritura del pendiente del repositorio público y de Vercel, y contraseñas remotas marcadas como temporales de desarrollo.
- **Archivos:** `src/components/shared/pie-pagina.tsx`, `src/app/privacidad/page.tsx`, `src/app/condiciones/page.tsx`, `src/lib/version.ts`, `package.json`, `app-movil/package.json`, `app-movil/src/components/pie-pagina.tsx`, `LICENSE`, `docs/bitacora/ESTADO.md`.
- **Verificación (2026-11-09):** `lint` 0 errores (1 aviso previo), `tsc` sin errores, `test` 255/255, `build` correcto, `tsc` de `app-movil` sin errores. Medición de Supabase por CLI en solo lectura. Textos legales **no revisados por un abogado**; la página `/privacidad` y el aviso no se vieron en pantalla (no verificado).
- **Pendiente / riesgos:** acuerdo escrito con Bbosch (licencia o cesión, responsable de los datos personales) y revisión legal antes de la marcha en blanco; la app móvil no se reprobó en teléfono tras el cambio del pie (solo texto).

### 2026-11-09 · [WEB] [APP] `ESTADO.md` depurado y con fecha de actualización
- **Autor:** Cristóbal (con Claude) · **Rama:** `docs/reorganizar-documentacion`
- **Qué se hizo:** `ESTADO.md` se reescribió a partir de las dos bitácoras: estado actual por área (web y app) con su verificación, **23 pendientes vigentes** agrupados por prioridad (A antes de datos reales, B pruebas y decisiones, C técnica; cada uno con su número antiguo), y las decisiones vigentes consolidadas (las reemplazadas o ya cumplidas salieron; siguen en este registro). La primera línea lleva ahora la fecha, versión y commit, y la regla de actualizarla en cada cambio quedó en `LEEME.md` y `CLAUDE.md`. El Maestro apunta a `main` = `e5e0993`.
- **Archivos:** `docs/bitacora/ESTADO.md`, `LEEME.md`, `docs/MAESTRO.md`, `CLAUDE.md`.
- **Verificación:** solo documentación; recontados los pendientes antiguos abiertos contra el Maestro y las últimas entradas del registro. No verificado: el resultado del APK `140db843…` ni nada probado en teléfono (se anotan como pendientes).
- **Pendiente / riesgos:** `demo/` (HTML estático STN) quedó eliminado del árbol de trabajo; se puede restaurar desde git si Cristóbal lo quiere en otra carpeta.

### 2026-11-09 · [WEB] [APP] Reorganización de la documentación y bitácora única
- **Autor:** Cristóbal (con Claude) · **Rama:** `docs/reorganizar-documentacion`
- **Versión:** sin cambio (V1.1.4; solo documentación, no toca el código de la app)
- **Qué se hizo:** se fusionaron `docs/BITACORA.md` (109 entradas) y `app-movil/BITACORA.md` (30) en `docs/bitacora/` (139 entradas, ninguna borrada, etiquetadas `[WEB]`/`[APP]`), separando el historial (`REGISTRO.md`), lo vivo (`ESTADO.md`: estado, pendientes, decisiones) y las reglas (`LEEME.md`). `docs/` queda en `bitacora/`, `guias/` (diseño, despliegue, desarrollo, licencias, Maestro de TAG), `referencia/`, `muestras/` y `formatos/`. Se eliminaron `demo/` (demo estática STN superada por la app) y `docs/archivo/` (árbol de inspecciones, contexto Cowork de TAG y leeme de formatos obsoletos). El parche de plantillas ya aplicado pasó a `supabase/parches/`. Se corrigieron en el Maestro dos datos desactualizados (el parche ya estaba aplicado en el remoto) y se añadió `logs/` a `.gitignore`.
- **Archivos:** `docs/bitacora/*`, `docs/guias/*`, `docs/referencia/*`, `CLAUDE.md`, `README.md`, `docs/MAESTRO.md`, `app-movil/CLAUDE.md`, `app-movil/README.md`, `scripts/export-maestro.py` (nueva ruta de salida del mapeo), comentarios de ruta en `informe-pdf.tsx` y `docs/muestras`.
- **Verificación:** `lint` 0 errores (1 aviso previo en `scripts/simular-manuales.mjs`), `tsc` sin errores, `test` 255/255, `build` correcto. Recuento de entradas antes/después: 109+30 = 139, ninguna perdida. Sin Docker (no cambió SQL ejecutable); `supabase test db` no se repitió.
- **Pendiente / riesgos:** `ESTADO.md` se depuró el mismo día (ver siguiente entrada). No se usó Docker: no se tocó SQL ejecutable ni migraciones.

### 2026-11-07 · [APP] Estado del APK al cierre de la sesión
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Qué pasó:** segundo intento de `eas build --platform android --profile preview` (build `140db843-1593-403f-bc78-d5daaf06ee3a`, tras agregar `.npmrc`). **Al cerrar esta entrada seguía «en progreso»** (el servidor de EAS tarda varios minutos en la cola gratuita); el resultado final **no está verificado**.
  Seguimiento: https://expo.dev/accounts/cnaveavaldes/projects/inspecciones-mlp/builds/140db843-1593-403f-bc78-d5daaf06ee3a
- **Cómo instalarlo cuando termine:** abrir ese enlace desde un teléfono Android y descargar el APK (permitir «instalar apps desconocidas»). Al ser un build propio, aquí sí corre el envío en segundo plano.
- **Qué probar primero en el teléfono:** ingreso, una inspección con la cámara real, modo avión, **cerrar la app y esperar ~15 min con señal** para ver si la tarea la envía sola, PDF del teléfono y PDF oficial, y el margen del PDF local.
- **Estado de las pruebas:** `tsc` sin errores · 292 pruebas de la app en verde.

### 2026-11-07 · [APP] PDF oficial verificado en Android, nombre legible, y APK: primer intento fallido por `npm ci`
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil` (continuación tras el PR #18)
- **Despliegue (hecho con autorización de Cristóbal):** PR #18 unido a `main` (merge `19358da`). El sitio publicado pasó a **V1.1.4** (comprobado con `curl`) y `GET /api/movil/informe/{id}` responde **401 sin token** (antes 404).
- **PDF oficial en el emulador Android:** con señal, «PDF · Guardar o compartir» de una inspección enviada descarga el del servidor. Vista previa: folio INS-2026-000005, estado «ENVIADA», «Página 1 de 3», firmas de revisión «Pendiente de firma».
  También se vio que el margen derecho «raro» del PDF **no es defecto nuestro**: el PDF oficial se ve igual en el diálogo de impresión de Android (que lo reescala a Letter); se descarta ese pendiente.
- **Corrección:** el PDF oficial se compartía como `<id>.pdf` porque `File.downloadFileAsync` nombra el archivo con la URL. Ahora `descargarOficial` usa `fetch` y toma el nombre de `Content-Disposition` (`nombreDeContentDisposition`, con 4 pruebas):
  «Inspeccion Switchgear 23 kV - 430-SG-431 - 2026-11-07.pdf». También deja de usar `move` (asíncrono en SDK 58).
- **APK (EAS Build) — intento 1 fallido:** `npm ci` falló en EAS («Missing: react-native-gesture-handler@3.5.0 from lock file…»): este equipo instala con `--legacy-peer-deps` y EAS no. **Solución:** `app-movil/.npmrc` con `legacy-peer-deps=true`
  (el `package-lock.json` no cambia; `npm ci --include=dev --dry-run` pasa). Así cualquier persona y EAS instalan igual.
- **Verificación:** `tsc` sin errores · Vitest 292 pruebas en verde · PDF oficial probado en el emulador (ver arriba).
- **Pendiente / riesgos:** resultado del segundo intento de APK (ver siguiente entrada). Si se cierra la app a la fuerza, Android no ejecuta la tarea de envío en segundo plano.

### 2026-11-07 · [APP] Envío en segundo plano y primer APK de Android (EAS Build)
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Autorizado por Cristóbal:** dependencias `expo-background-task` y `expo-task-manager`, y subir el proyecto a EAS con su cuenta de Expo.
- **Envío en segundo plano:** `src/lib/offline/envio-segundo-plano.ts` (lógica pura: si la cola tiene algo, `processOutbox`; sin señal no es un fallo y no gasta intentos) y `segundo-plano.ts` (define la tarea con `TaskManager.defineTask` y la registra cada ~15 min con `BackgroundTask`;
  se importa desde `_layout.tsx`). **Solo funciona en un build propio (APK/TestFlight):** en Expo Go el registro se ignora en silencio y la app sigue enviando al abrirse y al volver la señal. El sistema decide cuándo corre (en iPhone suele ser de noche).
- **EAS:** `eas.json` (perfil `preview` = APK interno, `production`), proyecto `@cnaveavaldes/inspecciones-mlp` (ID en `app.json`), keystore de Android generado por EAS (guardado en los servidores de Expo; no está en el repo), variables `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  en los entornos `preview` y `production` de EAS (clave pública anon; `.env` no se sube). Compilación lanzada: https://expo.dev/accounts/cnaveavaldes/projects/inspecciones-mlp/builds/9f31da24-4920-4d96-b182-7070051f55ca
- **Verificación:** `tsc` sin errores · Vitest 16 archivos, **288 pruebas en verde** (5 nuevas del envío en segundo plano: cola vacía, envío, sin señal, repetición sin duplicar, error inesperado) · en el emulador (Expo Go) la app arranca sin errores con el módulo nuevo.
  La web (V1.1.4): lint, tsc, 255 pruebas y build en verde.
- **No verificado:** que la tarea corra realmente con la app cerrada (necesita el APK en un teléfono; se puede forzar en un build de desarrollo con `triggerTaskWorkerForTestingAsync`); el resultado de la compilación del APK (ver más abajo si ya hay una entrada nueva).
- **Pendiente / riesgos:** el APK del perfil `preview` usa el Supabase remoto (igual que Expo Go); la firma de Android es la de EAS: guardar sus credenciales si algún día se publica en Play Store. Pedir al técnico que no «fuerce el cierre» la app (Android detiene las tareas de apps cerradas a la fuerza).

### 2026-11-07 · [APP] Recorrido automático de las plantillas reales y recuerdo del último nombre
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Qué se hizo:** (1) `src/lib/tecnico/plantillas-seeds.test.ts` lee las **59 plantillas reales** de `supabase/seed_plantillas_*.sql` y, con el código propio de la app, comprueba para cada una: que `validateTemplate` la acepta,
  que se puede llenar completa y `validateDraft` no devuelve pendientes, y que con un hallazgo forzado se arma el envío (`buildSubmission`, con la firma adjunta) y se genera el informe HTML. Es la versión automática de abrir cada formato.
  (2) «Realizada por» se precarga con el último nombre escrito en ese teléfono (`src/lib/tecnico/ejecutor.ts`, guardado en la tabla local de catálogo, por cuenta; se guarda al terminar de editar el campo y no viaja al servidor).
- **Archivos:** `app-movil/src/lib/tecnico/{plantillas-seeds.test,ejecutor,ejecutor.test}.ts`, `src/app/nueva.tsx`, `src/app/inspeccion/[id].tsx`.
- **Verificación:** `tsc` sin errores · Vitest 15 archivos, **283 pruebas en verde** (177 del recorrido de plantillas, 4 del nombre) · en el emulador Android: se escribió «Nombre Recordado», se salió, y el borrador nuevo de otro formato lo trajo precargado.
- **Pendiente / riesgos:** los seeds traen 59 plantillas para 60 formatos (14 + 25 + 20, igual que en la web); no se averiguó a cuál formato le falta (no verificado). El recorrido valida lógica y HTML, no el aspecto en pantalla ni el PDF real de cada formato
  (eso sigue necesitando abrirlos en el teléfono o un APK). El nombre precargado también se copia a quien use otro técnico el mismo teléfono: se puede editar.

### 2026-11-07 · [APP] Arreglos de diseño tras la prueba en Android y pruebas sin señal de «Enviadas» y borradores
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Qué se hizo:** (1) el aviso de sincronización pasó a su propia fila bajo el saludo: antes el saludo se cortaba («Técnico · Tur…») con «Sin conexión, 1 guardada en el teléfono»; (2) en las fotos, «Agregar otra foto» ahora es «Otra foto» y los botones tienen menos relleno, para que «Galería» no baje de línea; (3) «Eliminar» sube a 48 px de alto y 96 de ancho (antes 44 y solo el texto).
- **Verificación (emulador Android API 37, sin señal):** encabezado correcto con «Sin conexión» en su fila; «Actualizar» avisa «Sin conexión: se muestra la última copia guardada en el teléfono.»; el buscador filtra en local («444sg001» → 1 de 4, contadores correctos); un borrador queda «En curso» al salir con «Salir», y «Eliminar» pide confirmación («Sí, eliminar») y lo borra. `tsc` sin errores.
- **No verificado:** el aspecto de «Galería» con miniatura (no se volvió a abrir el formulario tras el cambio); «Cerrar sesión» con envíos pendientes; «Ver más»; búsqueda en el servidor.
- **Pendiente / riesgos:** el margen derecho del PDF local no se pudo medir (Expo Go no deja leer el archivo; el diálogo de impresión lo reescala a Letter): revisar con un PDF real cuando haya APK. En desarrollo el engranaje flotante de Expo Go tapa «Inicio» del formulario; desaparece en un build propio.

### 2026-11-07 · [APP] Prueba completa en Android (emulador): flujo del técnico, sin señal y PDF; 2 fallos corregidos
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Cómo:** emulador `Medium_Phone_API_37.0` (Android 37, 1080×2400) con Expo Go; Cristóbal ingresó con `TECNICO_B` (turno B); el resto con `adb` (capturas, `uiautomator`, `input`, `cmd connectivity airplane-mode`). Datos de prueba: «PRUEBA ANDROID CLAUDE», TAG 430-SG-431 (Switchgear 23 kV, INSP-13). **La inspección se envió al Supabase remoto: INS-2026-000005** (dato de prueba; conviene borrarla o rechazarla desde la web).
- **Funciona en Android (verificado con capturas):** ingreso y perfil (Técnico · Turno B); lista «Enviadas» desde el servidor; Nuevo Standard (área → trabajo → familia → formato); cabecera con selector de TAG (66 equipos, sectores, búsqueda «430sg431» sin guiones), selector de hora propio con «Ahora» en hora de Chile; 17 ítems (BN/ML, severidad Media por defecto, observación obligatoria en ML, ítem numérico de lecturas);
  foto con la cámara del sistema (permiso, captura, compresión, miniatura); firma en WebView (guarda, y avisa si está vacía); revisión «17 de 17»; **modo avión → «Inspección guardada… se enviará apenas haya conexión»; cerrar la app por completo y reabrirla sin señal: sigue la sesión y la inspección «En cola de envío» (indicador «Sin conexión, 1 guardada en el teléfono»);
  al reconectar se envió sola, una sola vez, con folio INS-2026-000005 y «Realizada por PRUEBA ANDROID CLAUDE»** (Enviadas 3 → 4, cola vacía; las fotos y la firma subieron al Storage porque el servidor aceptó el envío); PDF de la inspección enviada (con señal; cae al PDF del teléfono porque el endpoint V1.1.4 aún no está desplegado).
- **Fallo 1 (corregido): PDF del teléfono vacío.** En Expo SDK 58 `File.write`, `move`, `copy`, `bytes` y `text` son **asíncronos** (existen `writeSync`, `moveSync`, `copySync`…) y el código los llamaba sin `await`. Además `File.move` desde la carpeta de `expo-print` fallaba en Android con «Missing 'READ' permission».
  Ahora `local-nativo.ts` pide `base64: true` a `printToFileAsync` y lo escribe con `await destino.write(...)`; `photos.ts` (`move` y `write` de la firma) e `informe.ts` (`move` del PDF del servidor y `copy` para compartir) esperan sus promesas. Esto probablemente también explica el error de iOS «You don't have access to the provided file» (se compartía un archivo aún incompleto): **no verificado en iPhone**.
  Resultado en Android: el PDF generado sin señal muestra encabezado «Pendiente de envío», hallazgo (Media), lecturas, observaciones, firma del encargado y registro fotográfico; el nombre del archivo es «Inspeccion Switchgear 23 kV - 430-SG-431 - 2026-11-07 (sin enviar).pdf» y abre la hoja de compartir.
- **Fallo 2 (corregido, antes oculto): tamaño de fotos y firma.** Por lo mismo, `destino.size` se leía antes de terminar `move`/`write`, así que `sizeBytes` de los adjuntos podía quedar en 0 en el envío. Con los `await` se registra el tamaño real (la inspección ya enviada de esta prueba se hizo con el código anterior; el servidor la aceptó igual).
- **Archivos:** `app-movil/src/lib/informe/local-nativo.ts`, `src/lib/tecnico/{photos,informe}.ts`, esta bitácora.
- **Verificación:** `tsc` sin errores · Vitest 13 archivos, 101 pruebas en verde · `expo-doctor` 20/20 (una pasada dio 19/20 por una comprobación que usa red; la repetición, 20/20) · `expo export --platform android` empaqueta.
- **No verificado / pendiente:** PDF oficial del servidor (404 hasta desplegar V1.1.4); compartir hacia una app real (solo se abrió la hoja y la vista previa «Print»); Galería; sesión vencida sin señal; dos teléfonos a la vez; envío con la app cerrada; build propio (APK) fuera de Expo Go; probar los arreglos de `await` en iPhone.
- **Observaciones de diseño (no corregidas):** (1) con el aviso «Sin conexión, 1 guardada en el teléfono» el saludo «Técnico · Turno B» se corta («Tur…»); (2) en las fotos, el botón «Galería» baja de línea al haber miniatura; (3) en el PDF local el contenido deja un margen derecho mayor que el izquierdo (la cabecera oscura no llega al borde derecho; el diálogo de impresión de Android lo muestra en tamaño Letter); (4) el engranaje flotante de Expo Go tapa «Cerrar sesión» e «Inicio» (solo en desarrollo).

### 2026-11-07 · [APP] Primera prueba en Android (emulador, Expo Go): ingreso
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Qué se hizo:** se levantó el emulador de Android Studio (AVD `Medium_Phone_API_37.0`, Android 37, 1080×2400; el arranque desde la terminal se colgaba en WHPX, funcionó al abrirlo desde Android Studio), se instaló Expo Go con `expo start --android` y se abrió la app (SDK 58.0.0).
  Si Expo Go muestra «Failed to download remote update», el emulador no alcanza Metro por `10.0.2.2`: ejecutar `adb reverse tcp:8081 tcp:8081` y abrir `exp://localhost:8081`.
- **Verificación (capturas y `uiautomator`):** la pantalla de ingreso se ve correcta (logo, campos, pie con Privacidad, Condiciones y V1.0.0). Usuario vacío → «Ingrese su usuario». Contraseña de 5 caracteres → «La contraseña debe tener al menos 8 caracteres».
  Usuario y contraseña inventados con señal → «Usuario o contraseña incorrectos» (respuesta real del servidor: la app llega a Supabase). Modo avión → «Para ingresar por primera vez necesita señal.»
- **No verificado:** ingreso con una cuenta real (la contraseña la escribe Cristóbal; no está en el repositorio), catálogo, formulario, fotos con la cámara del emulador, firma, envío, modo sin señal con sesión iniciada, PDF.
- **Pendiente / riesgos:** el botón Atrás en la pantalla de ingreso sale de la app (comportamiento normal de Android). El `.env` se leyó bien en Android.

### 2026-11-07 · [APP] Revisión de ingeniería: cola, sesión, fotos, catálogo y errores
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Qué se encontró y corrigió (revisión de código, sin probar en teléfono):**
  1. **Fallos de red gastaban intentos de la cola.** Con mala señal (conectado pero sin internet) la inspección llegaba a «failed» en ~25 min (12 intentos). Ahora los fallos de conectividad
     (`esErrorDeRed`) no consumen intentos: reintentan cada 15 s y la inspección sigue pendiente hasta que vuelva la señal. Los rechazos del servidor siguen sin reintentarse.
  2. **Rutas de fotos absolutas.** En iOS el contenedor de la app puede cambiar al actualizar o reinstalar; las fotos y la firma de borradores y cola habrían quedado apuntando a la nada.
     `AlmacenSqlite` reubica la ruta en la carpeta vigente al leer (`reubicarUri`), así lo aprovechan subida, PDF local y miniaturas.
  3. **`SyncController.syncNow` podía quedar trabado:** `refresh()` estaba fuera del `try`; si fallaba, `syncing` quedaba en `true` y no se enviaba nada más. Corregido.
  4. **Renovación de sesión:** el cliente de Supabase ahora llama `startAutoRefresh`/`stopAutoRefresh` según `AppState` (recomendación oficial para React Native).
  5. **Catálogo:** se descargaba entero (60 plantillas) cada vez que la app volvía a primer plano; ahora a lo más cada 10 minutos.
  6. **`ErrorBoundary`** en español en `_layout.tsx`: un error inesperado muestra «Algo salió mal» con «Reintentar» y avisa que lo guardado no se pierde.
- **Archivos:** `src/lib/offline/{ruta,errores,outbox,transport,sync,almacen-sqlite}.ts`, `ruta.test.ts`, `errores.test.ts`, `outbox.test.ts`, `src/lib/{supabase.ts,tecnico-contexto.tsx}`, `src/app/_layout.tsx`.
- **Verificación:** `tsc` sin errores · Vitest 13 archivos, 101 pruebas en verde (9 nuevas: rutas, clasificación de errores y «mala señal no consume intentos») · `expo-doctor` 20/20 ·
  `expo export --platform android` empaqueta (4,8 MB). **No verificado en el teléfono:** `reubicarUri` sobre `expo-file-system` real, `startAutoRefresh` con `AppState` y el `ErrorBoundary`.
- **Pendiente / riesgos:**
  - `esErrorDeRed` se basa en textos de error de `fetch`/Supabase; si un dispositivo usa otro texto, se cuenta como intento normal (comportamiento anterior, sin pérdida de datos).
  - `AlmacenSqlite.transaccion` usa `withTransactionAsync`, que no es exclusiva: otra consulta concurrente (p. ej. el guardado automático) puede entrar en la misma transacción. Evaluar `withExclusiveTransactionAsync`.
  - Una foto guardada que se queda sin registro (cierre de la app entre mover el archivo y `agregarFoto`) deja un archivo huérfano; falta una limpieza.
  - Sin prueba de envío en segundo plano ni de varias sesiones de la misma cuenta.

### 2026-11-07 · [APP] «You don't have access to the provided file» persiste (captura p4): se comparte una copia
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Qué se encontró (captura `p4.jpeg`):** con el botón único, «PDF · Guardar o compartir» seguía fallando con «Calling the 'shareAsync' function has failed → You don't have access to the provided file», ya con el nombre sin tildes
  (`.../informes/Inspeccion%20Switchgear%2023%20kV%20-%20444-SG-001%20-%202026-11-07.pdf`). La hipótesis anterior (tilde descompuesta y descarga sobre el mismo archivo) **no era la causa de fondo**.
- **Qué se sabe:** en `expo-sharing` (iOS) ese mensaje sale solo si `FileSystemUtilities.isReadableFile` es falso: el permiso por carpeta (la ruta está dentro de la carpeta de la app) y que `FileManager.isReadableFile` sea verdadero, o sea que el archivo exista y se pueda leer en ese momento. La causa exacta de que no se pueda leer **no se determinó**.
  Además, esa inspección probablemente salió del PDF local (el servidor responde 404 hasta desplegar V1.1.4).
- **Qué se hizo:** `abrirArchivo` ya no comparte el archivo guardado: comprueba que existe y pesa más de 0, crea una **copia nueva** en `cache/compartir-<hora>/` (borrando las anteriores) y comparte esa copia. Si algo falla, el aviso incluye si el archivo existe, su tamaño y la ruta.
- **Archivos:** `app-movil/src/lib/tecnico/informe.ts`.
- **Verificación:** `tsc`, Vitest, `expo-doctor` y `expo export` (ver sesión). **No verificado en el teléfono;** no se reprodujo el error.
- **Pendiente / riesgos:** si vuelve a fallar, el nuevo aviso dirá si el problema es el archivo (no existe / pesa 0) o la hoja de compartir; con eso se corrige la causa real. Alternativa de respaldo: guardar con `expo-file-system` en una carpeta elegida por el usuario (selector de carpeta).

### 2026-11-07 · [APP] Un solo botón de PDF
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Pregunta de Cristóbal:** qué diferencia había entre «Ver PDF» y «Compartir PDF»: en su teléfono hacían lo mismo.
- **Respuesta:** en Expo Go `File.canPreview` es falso (sin visor de PDF para la app), así que «Ver PDF» caía a la hoja de compartir. Eran dos botones para una sola acción.
- **Qué se hizo:** un solo botón, «PDF · Guardar o compartir», que abre la hoja de compartir del teléfono (Archivos, WhatsApp, correo, abrir con otra app). Se quitó la ruta del visor (`File.preview` / `canPreview`) y el parámetro de acción de `entregarPdf`.
  Se mantiene la lógica de origen: PDF oficial del servidor si está enviada y hay señal; si no, el generado en el teléfono.
- **Archivos:** `app-movil/src/components/boton-pdf.tsx`, `app-movil/src/lib/tecnico/informe.ts`.
- **Verificación:** `tsc`, Vitest, `expo-doctor` y `expo export` (ver resultado en la sesión). **No verificado en el teléfono.**
- **Pendiente / riesgos:** si más adelante se instala la app como build propio, se puede evaluar un visor integrado (en Android requeriría un componente nuevo, con autorización).

### 2026-11-07 · [APP] «Enviadas»: últimas 5, botón Actualizar, buscador y filtros por estado
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Pedido de Cristóbal:** cuando haya muchas enviadas la pantalla se llenaría: dejar solo las últimas 5, agregar un botón para actualizar y un buscador, y que el buscador sea el más adecuado.
- **Qué se hizo:**
  - Se muestran las **últimas 5** enviadas; «Ver más (n)» agrega 5 más cada vez.
  - **Actualizar** (título de la sección): vuelve a pedir las enviadas al servidor y muestra «Actualizado {fecha}». Sin señal, o si falla, deja la última copia y lo avisa.
  - **Buscador** sobre la copia guardada en el teléfono, que ahora trae las últimas **200** (antes 50): es instantáneo y funciona sin señal. Busca por TAG, folio, quién la realizó, área, equipo, estado y fecha; ignora tildes,
    mayúsculas y signos («444sg001», «444-SG-001», «cristobal» y «Cristóbal» funcionan) y exige todas las palabras escritas, en cualquier orden. El texto se aplica con 180 ms de espera para no recalcular en cada letra.
  - **Filtros por estado** con contador: Todas · En revisión · Aprobadas · Rechazadas (se combinan con el texto; los contadores respetan el texto escrito).
  - **«Buscar en todo el historial»**: aparece al escribir; consulta al servidor (TAG, folio o nombre, sin distinguir mayúsculas, hasta 50 resultados) para lo que ya no está en las últimas 200. Requiere señal; «Volver a las últimas» regresa a la lista local.
  - Mensaje de «sin coincidencias» y de «aún no hay enviadas».
- **Archivos:** `app-movil/src/lib/tecnico/{buscar-enviadas,buscar-enviadas.test,enviadas}.ts`, `src/components/enviadas-controles.tsx`, `src/app/index.tsx`.
- **Verificación:** `tsc` sin errores · Vitest con 14 pruebas nuevas de `buscar-enviadas` (TAG con y sin guiones, folio, nombre con y sin tilde, área y equipo, varias palabras en cualquier orden, estado, fecha, combinación con el filtro de estado,
  contadores y texto para el servidor) · `expo-doctor` · `expo export`. **No verificado en el teléfono:** la pantalla, el teclado con el buscador dentro de la lista, «Actualizar» y la búsqueda en el servidor (la consulta `or(ilike…)` no se ejecutó contra Supabase).
- **Pendiente / riesgos:**
  - Los contadores de arriba (Enviadas, Aceptadas, Rechazadas) cuentan las últimas 200 guardadas, no el total histórico.
  - La búsqueda en el servidor distingue tildes (`ilike`): «Cristóbal» no encuentra «Cristobal» allí; la búsqueda local sí.
  - Cada teléfono del turno comparte la cuenta, así que las enviadas son las de todo el turno (ver decisión de cuenta compartida).

### 2026-11-07 · [APP] Segunda pulsación de «Ver PDF» fallaba («You don't have access to the provided file»)
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Qué se encontró (captura `error p3.jpeg` de Cristóbal):** la primera vez «Ver PDF» funcionaba (abre la hoja de compartir porque `File.canPreview` es falso en iOS con Expo Go: «este teléfono no tiene visor de PDF»); al pulsarlo otra vez salía
  «compartir: Calling the 'shareAsync' function has failed → You don't have access to the provided file», con la ruta `.../informes/Inspeccio%CC%81n%20Switchgear%2023%20kV%20-%20444-SG-001%20-%202026-11-07.pdf`.
- **Causa probable (no reproducida):** (1) cada descarga del PDF oficial se hacía sobre el mismo archivo (`downloadFileAsync` con `idempotent`), que la primera hoja de compartir ya había usado; (2) el nombre llevaba una tilde que iOS guarda descompuesta
  (`%CC%81`). Ambas cosas dejan la ruta devuelta apuntando a un archivo que la hoja de compartir no puede leer.
- **Qué se hizo:** `lib/informe/archivo.ts` (`nombreSeguro`: sin tildes ni caracteres raros, siempre `.pdf`) se usa en el PDF del servidor y en el generado en el teléfono. El PDF del servidor se descarga ahora a una carpeta temporal única
  (`cache/informe-<hora>`), se mueve a `Documentos/informes/<nombre sin tildes>.pdf` (borrando antes el anterior) y se limpia la carpeta temporal. El PDF local también borra el archivo previo antes de moverlo.
- **Archivos:** `app-movil/src/lib/informe/{archivo,archivo.test,local-nativo}.ts`, `app-movil/src/lib/tecnico/informe.ts`.
- **Verificación:** `tsc` sin errores · Vitest (incluye 5 pruebas nuevas de `nombreSeguro`, con tildes compuestas y descompuestas) · `expo-doctor` · `expo export` Android e iOS. **No verificado en el teléfono:** repetir «Ver PDF» varias veces debe abrir la hoja de compartir cada vez.
- **Pendiente / riesgos:** «Ver PDF» seguirá abriendo la hoja de compartir en Expo Go (no hay visor integrado); en una app instalada (build) puede abrir el visor nativo. Si la repetición vuelve a fallar, anotar el aviso.

### 2026-11-07 · [APP] «No se pudo abrir el PDF»: alternativa de compartir y motivo real
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Qué se encontró (prueba de Cristóbal):** al pulsar el botón del PDF salía «No se pudo abrir el PDF». Ese texto solo aparece en el último paso (el PDF ya estaba generado o descargado) y escondía el motivo.
- **Causa:** **no determinada**: el error del visor (`File.preview`) no se mostraba. Sospecha: el visor nativo del teléfono no abrió el archivo (en Expo Go o por el nombre del archivo, que lleva espacios y tildes).
- **Qué se hizo:** `abrirArchivo` en `lib/tecnico/informe.ts`: «Ver PDF» comprueba `File.canPreview` y, si no hay visor o falla, abre la hoja de compartir (Archivos, WhatsApp, otras apps) en lugar de rendirse. «Compartir PDF» va directo a esa hoja.
  Si también falla, el aviso incluye el motivo real (visor y compartir) y la ruta del archivo guardado.
- **Archivos:** `app-movil/src/lib/tecnico/informe.ts`.
- **Verificación:** `tsc` sin errores · Vitest 75 en verde · `expo-doctor` 20/20 · `expo export` Android e iOS empaquetan. **No verificado en el teléfono:** no se reprodujo el error; el cambio no puede probarse sin el dispositivo.
- **Pendiente / riesgos:** si vuelve a salir el aviso, anotar el motivo que muestra para corregir la causa de fondo.

### 2026-11-07 · [APP] PDF del teléfono: el contenido ocupaba solo el 75 % del ancho
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Qué se encontró (prueba de Cristóbal, muestras `p1.pdf` y `p2.pdf` en su escritorio):** el nuevo PDF salía «cargado a la izquierda»: el contenido llegaba a ~75 % del ancho y quedaba un margen blanco enorme a la derecha.
- **Causa:** el HTML estaba dibujado a 595 px de ancho (los puntos de React-PDF), pero `expo-print` imprime la hoja A4 con 793 px de ancho CSS (96 px por pulgada): 595 / 793 = 75 %. En el navegador de escritorio no se veía
  porque la prueba usaba `@page { size: 595px 842px }`, un tamaño de página propio que el teléfono no usa.
- **Qué se hizo:** la hoja se sigue dibujando a 595 px (así las medidas son las mismas del PDF de la web) y se amplía con `zoom: 4/3` (`table.hoja`); `@page` pasó a `size: A4; margin: 0`; el cuerpo usa el ancho completo.
- **Archivos:** `app-movil/src/lib/informe/html.ts`.
- **Verificación:** `tsc` sin errores · Vitest 75 en verde · `expo-doctor` 20/20 · `expo export` Android e iOS empaquetan. Se imprimió un informe de ejemplo a PDF con Chrome usando `@page { size: A4 }` (la hoja que usa el teléfono):
  página de 595 × 842 pt y contenido hasta x = 564 (595 − 31 de margen), o sea márgenes iguales a ambos lados; 3 páginas, filas sin partir y pie en cada página. **No verificado en el teléfono** tras este cambio.
- **Pendiente / riesgos:** probar de nuevo en el iPhone. El WebView de Android también debería aplicar el `zoom` (Blink), pero no se probó en Android.

### 2026-11-07 · [APP] El PDF del teléfono reproduce el diseño del PDF de la web
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Qué se encontró (pregunta de Cristóbal):** el PDF generado en el teléfono no tenía el mismo formato que el del servidor.
- **Causa:** el PDF de la web se dibuja con React-PDF (`src/components/informe/informe-pdf.tsx`), que no corre en el teléfono. La primera versión del PDF local era una interpretación propia en HTML con los
  mismos datos y colores, pero otro diseño (la tabla de datos, el resumen y los recuadros eran distintos).
- **Qué se hizo:** `lib/informe/html.ts` se reescribió como réplica del diseño de `informe-pdf.tsx`, con las mismas medidas (en `px` con el número de los puntos de React-PDF; página 595 × 842), colores y orden:
  encabezado oscuro con logo a color en pastilla blanca, norma y estado, TAG grande, lugar y folio/OT/fecha/horario; cuadrícula de datos de 3 columnas; resultado con barra de segmentos y leyenda más la
  caja de hallazgos (naranja o verde); tarjetas de lecturas; una caja por sección con filas, píldoras de estado, observación en franja cobre y trazabilidad; caja de hallazgos con severidad; nomenclatura;
  observaciones y consideraciones; firmas en tarjetas (la firma del encargado y «Pendiente de firma» para supervisión y programación); registro fotográfico en página aparte (2 por fila).
  Los márgenes (28 arriba, 50 abajo) y el pie «norma · TAG · Generado digitalmente fecha» se repiten en cada página con una tabla de una celda. El logo a color se incrusta reducido (21 KB).
- **Diferencias que quedan respecto al PDF del servidor:** no tiene «Página X de Y» (el HTML no sabe en qué página cae); el recuadro de una sección que cruza una página se corta en vez de cerrarse en cada página
  (el servidor lo cierra con una segunda pasada de medición); y lleva el aviso «Copia generada en el teléfono…». Las filas nunca se parten y el cierre (observaciones y firmas) va siempre junto, como en la web.
- **Archivos:** `app-movil/src/lib/informe/{html,logo}.ts`, `app-movil/src/lib/informe/local.test.ts`.
- **Verificación:** `tsc` sin errores · Vitest 75 en verde (incluye que el HTML sigue el orden hero → datos → resumen → secciones → hallazgos → cierre → fotos y los textos del PDF de la web) · `expo-doctor` 20/20 ·
  `expo export` Android e iOS empaquetan. **Revisión visual:** se generó un informe de ejemplo (3 secciones, hallazgos, lecturas, firma y fotos) y se imprimió a PDF con Chrome de escritorio (motor Blink): 4 páginas,
  encabezado pegado al borde superior, pie en cada página, filas sin partir. **No verificado en el iPhone ni en Android real:** `expo-print` usa WKWebView en iOS y el WebView del sistema en Android; la repetición del
  encabezado/pie de la tabla y los saltos de página pueden variar.
- **Pendiente / riesgos:** probar en el teléfono; si en iOS los márgenes o saltos salen distintos, ajustar. Una inspección sin lecturas ni datos extra simplemente omite esos bloques, igual que la web.

### 2026-11-07 · [APP] PDF generado en el teléfono (sin internet), guardar y compartir
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Qué se encontró (prueba de Cristóbal):** «Ver PDF» mostraba «Falta configurar la dirección del sitio (EXPO_PUBLIC_WEB_URL)». Además, el PDF dependía de internet, y un técnico
  debe poder generar el informe desde su teléfono, guardarlo en una carpeta y mandarlo por WhatsApp o respaldarlo en Archivos sin conexión.
- **Causa del aviso:** Expo solo lee el `.env` al arrancar; la variable se había agregado con Expo ya abierto. Ahora `WEB_URL` tiene el sitio publicado como valor por defecto, sin depender del `.env`.
- **Decisión (Cristóbal):** autorizó `expo-print` y `expo-sharing`.
- **Qué se hizo:**
  - `lib/informe/modelo.ts` (copia de `armarInforme` de la web, con su test) y `lib/informe/html.ts`: el mismo contenido del PDF de la web (encabezado con TAG, datos, resumen y hallazgos,
    lecturas, tablas por sección, observaciones, firmas, registro fotográfico, nomenclatura) en HTML con los colores «Cobre». El texto del técnico se escapa.
  - `lib/informe/local.ts`: `detalleLocal` arma el mismo `DetalleInspeccion` con datos del teléfono usando `buildSubmission` (lo que se envía al servidor). `local-nativo.ts` incrusta fotos y firma,
    lo convierte a PDF con `expo-print` y lo guarda en `Documentos de la app/informes/` con el nombre «Título - TAG - fecha.pdf» (con «(sin enviar)» si no se ha enviado).
  - `lib/tecnico/informe.ts` (`entregarPdf`): inspección enviada con señal → PDF oficial del servidor; sin señal, en cola o sin enviar → PDF del teléfono. Después se abre en el visor (`Ver PDF`) o en la
    hoja de compartir (`Compartir PDF`: WhatsApp, Archivos, correo…).
  - `BotonPdf` con los dos botones. Aparece al enviar (aunque quede en cola sin señal), en las inspecciones en cola o enviadas de este teléfono y en «Enviadas».
  - **Cambio en la cola:** las fotos y la firma de una inspección enviada ya no se borran al instante: se conservan para poder generar su PDF sin señal y se liberan a los 14 días
    (`limpiarFotosEnviadas`, al iniciar sesión). El test de la cola se actualizó a ese comportamiento.
- **Archivos:** `app-movil/src/lib/informe/{html,local,local-nativo,logo,modelo,nombre-archivo}.ts`, `src/lib/revision/{estado,fallas,queries}.ts`, `src/lib/tecnico/{informe,eliminar}.ts`,
  `src/lib/offline/outbox.ts`, `src/lib/supabase.ts`, `src/lib/tecnico-contexto.tsx`, `src/components/boton-pdf.tsx`, `src/app/{index,inspeccion/[id]}.tsx`, tests, `package.json`, `app.json`.
- **Verificación:** `tsc` sin errores · Vitest 9 archivos, 74 pruebas en verde (incluye el armado con datos locales, el HTML y el escape, la limpieza de fotos y la copia de `modelo.test.ts`) ·
  `expo-doctor` 20/20 · `expo export` Android (4,7 MB) e iOS (4,8 MB) empaquetan. **No verificado en el teléfono:** la conversión con `expo-print`, el aspecto y la paginación del PDF, el guardado en la carpeta
  y la hoja de compartir (WhatsApp / Archivos).
- **Pendiente / riesgos:**
  - Probar en iPhone y Android: PDF con muchas fotos (cada una se incrusta en base64; puede pesar o tardar), saltos de página, y compartir por WhatsApp.
  - El PDF del teléfono no tiene las firmas de supervisión y programación ni seguimiento de hallazgos (los agrega el servidor); lo dice un aviso en el informe.
  - Una inspección enviada desde **otro** teléfono del turno no tiene datos locales: sin señal no se puede generar su PDF.
  - El PDF oficial del servidor sigue requiriendo desplegar la web V1.1.4 (el sitio publicado está en V1.1.3).
  - Las inspecciones enviadas hace más de 14 días pierden sus fotos locales: su PDF local saldría sin imágenes (el oficial sí las tiene).

### 2026-11-07 · [APP] Pulido visual: animaciones, pie de página y menos banners
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Pedido de Cristóbal:** quitar el botón «Cerrar sesión» de abajo de la lista, poner al pie de página lo que tiene la web (aviso, términos y
  versión), sacar el banner verde «Todo sincronizado» y el de «Listo para trabajar sin señal», y mejorar las animaciones para que se vea más profesional.
- **Qué se hizo:**
  - Se quitó el botón de abajo (queda «Cerrar sesión» en la cabecera del inicio). Se quitaron los banners: «Todo sincronizado» ya no se muestra
    (el indicador solo aparece si hay algo por enviar, sin conexión, enviando o con error) y «Listo para trabajar sin señal» se eliminó (solo queda el aviso
    de error si el catálogo no se pudo descargar y no hay copia).
  - `pie-pagina.tsx`, igual al de la web: «© 2026 Bbosch · Uso exclusivo del personal autorizado de Bbosch y MLP», «Privacidad» y «Condiciones de
    uso» (abren las páginas del sitio en el navegador; necesitan señal) y la versión de la app (`lib/version.ts`, tomada de `app.json`). Está al final del inicio y
    en el ingreso.
  - `ui/animacion.tsx` (API `Animated` de React Native, solo `transform` y `opacity` con driver nativo, respeta «Reducir movimiento»): `Aparecer` (fundido y
    desplazamiento al montar), `Presionable` (se hunde y rebota al tocar; lo usan botones, opciones y «Nuevo Standard»), `BarraProgreso` (crece con `scaleX`),
    `Esqueleto` (marcador de carga que parpadea) y `MarcaExito` (✓ que salta al enviar).
  - Aplicado en: ingreso (logo y campos entran escalonados), inicio (cabecera baja, botón «Nuevo Standard», resumen y tarjetas de la lista escalonados, esqueletos
    mientras carga en vez de «sin inspecciones»), nueva inspección (esqueleto del catálogo y cambio de paso animado), formulario (barra de progreso animada y cambio
    de paso animado), pantalla «Inspección enviada» (✓ animado) y transiciones de pantalla (fundido, desde abajo).
  - Sombras suaves en tarjetas, opciones y botones.
- **Archivos:** `app-movil/src/ui/{animacion,componentes}.tsx`, `src/components/{pie-pagina,sync-indicador}.tsx`, `src/lib/{version,tecnico-contexto}.ts(x)`,
  `src/app/{_layout,login,index,nueva}.tsx`, `src/app/inspeccion/[id].tsx`.
- **Verificación:** `tsc` sin errores · Vitest 49 en verde · `expo-doctor` 20/20 · `expo export` Android (4,6 MB) e iOS (4,7 MB) empaquetan. **No verificado en el
  teléfono:** no se vio ninguna animación ni el pie de página en un dispositivo real; falta ajustar tiempos a ojo.
- **Pendiente / riesgos:**
  - Sin dependencias nuevas: no se usó Reanimated. Si las animaciones se sienten entrecortadas en teléfonos antiguos, evaluar Reanimated (pedir autorización).
  - El cambio de paso del formulario vuelve a montar la lista de ítems (el scroll vuelve arriba, que es lo esperado); no se probó con muchas fotos.
  - Los enlaces del pie abren el sitio publicado (`EXPO_PUBLIC_WEB_URL`); sin señal no cargan. Los textos legales no están copiados en la app.
  - La web desplegada (https://inspecciones-bbosch.vercel.app) está en V1.1.3 y todavía **no tiene** el endpoint del PDF (V1.1.4, rama `feat/app-movil` sin commit):
    «Ver PDF» seguirá dando 404 hasta que esa rama se una a `main` y se vuelva a desplegar.

### 2026-11-07 · [APP] Ver PDF de las inspecciones enviadas
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Qué se encontró (prueba de Cristóbal):** al enviar no aparecía la opción de ver el PDF y en «Enviadas» tampoco se podía descargar.
- **Decisión (Cristóbal):** endpoint nuevo en la web que acepta el token de la app (ver `docs/BITACORA.md`, V1.1.4), en vez de imitar la
  cookie de sesión o generar el PDF en el teléfono.
- **Qué se hizo:** `src/lib/tecnico/informe.ts` descarga `GET {EXPO_PUBLIC_WEB_URL}/api/movil/informe/{id}` con `Authorization: Bearer` a un archivo
  en caché y lo abre con el visor del teléfono (`File.preview`: compartir o guardar en Archivos). `boton-pdf.tsx` es el botón «Ver PDF», con mensajes
  de error claros (sin señal, sesión vencida, 404, falta de configuración). Aparece en cada tarjeta de «Enviadas» y, al enviar, en la pantalla
  «Inspección enviada» cuando el servidor ya la recibió (si quedó en cola sin señal, avisa que podrá verlo después). `EXPO_PUBLIC_WEB_URL` se agregó al `.env`
  (autorizado por Cristóbal).
- **Archivos:** `app-movil/src/lib/tecnico/informe.ts`, `app-movil/src/components/boton-pdf.tsx`, `app-movil/src/lib/supabase.ts`,
  `app-movil/src/app/index.tsx`, `app-movil/src/app/inspeccion/[id].tsx`, `app-movil/.env`.
- **Verificación:** `tsc` sin errores · Vitest 49 en verde · `expo-doctor` 20/20 · `expo export` iOS empaqueta (4,7 MB). **No verificado en el teléfono ni con
  el servidor real:** el sitio publicado responde 404 en `/api/movil/informe/...` hasta desplegar la web V1.1.4.
- **Pendiente / riesgos:** desplegar la web; probar `File.preview` en iPhone y Android (en Expo Go); el PDF no está disponible sin señal;
  la pantalla «Inspección enviada» consulta el estado cada 1,5 s hasta que el servidor confirma.

### 2026-11-07 · [APP] Cuenta compartida por turno: «Realizada por» en Enviadas
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Contexto (Cristóbal):** la app es transversal; varios técnicos de un turno usan el mismo perfil y solo escriben su nombre en cada
  inspección, así que puede haber unas 5 sesiones simultáneas de la misma cuenta (p. ej. turno B).
- **Revisión:** cada teléfono guarda sus borradores, fotos y cola en su propia base local; los id de inspección y de foto son UUID
  generados en el teléfono, así que no chocan entre teléfonos. Supabase Auth permite varias sesiones por usuario y la ruta de las fotos
  `{usuario}/{inspección}/{foto}` no se repite. La RLS limita por cuenta: todos los teléfonos del turno ven las mismas «Enviadas» y los mismos
  contadores (Enviadas, Aceptadas, Rechazadas).
- **Qué se hizo:** «Enviadas» ahora trae `performed_by` y muestra «Realizada por {nombre}» en cada tarjeta, para distinguir quién hizo cada
  inspección. El nombre ya se pide en «Datos del equipo» y es obligatorio para enviar. Un borrador de corrección copia el nombre de la original
  (editable).
- **Archivos:** `app-movil/src/lib/tecnico/enviadas.ts`, `app-movil/src/app/index.tsx`.
- **Verificación:** `tsc` sin errores · Vitest 49 en verde. **No verificado** con dos teléfonos reales a la vez.
- **Pendiente / riesgos:**
  - Probar 2 o más teléfonos con la misma cuenta en paralelo (envíos simultáneos, «Enviadas» común).
  - **No verificado:** si el proyecto Supabase tiene activado «una sola sesión por usuario» (Dashboard → Authentication → Sessions; solo en
    planes de pago). Si estuviera activo, cada ingreso cerraría la sesión de los demás teléfonos del turno.
  - «Corregir y reenviar» lo puede hacer cualquier teléfono del turno sobre una rechazada de otro: no hay candado.
  - El campo del nombre no se recuerda entre inspecciones; se puede precargar el último usado en ese teléfono si ayuda.
  - La cola de envío es del teléfono, no del usuario: aceptable mientras un teléfono sea de un solo turno.

### 2026-11-07 · [APP] Botón «Cerrar sesión» y acceso «Inicio» en el formulario
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Qué se encontró (prueba de Cristóbal):** faltaba un botón visible para salir de la sesión y volver a la pantalla de ingreso
  (existía un «Salir» de texto pequeño en la cabecera del inicio).
- **Qué se hizo:** en el inicio, botón «Cerrar sesión» en la cabecera y otro al final de la lista, con confirmación. Si hay
  inspecciones por enviar, el aviso dice cuántas y que quedan guardadas en el teléfono. Cierra la sesión solo en el teléfono (no
  necesita señal) y lleva al ingreso; borradores y cola se conservan. En el formulario, «Inicio» en la cabecera vuelve al menú desde
  cualquier paso (lo escrito se guarda solo).
- **Archivos:** `app-movil/src/app/index.tsx`, `app-movil/src/app/inspeccion/[id].tsx`.
- **Verificación:** `tsc` sin errores. **No verificado en el teléfono.**
- **Pendiente / riesgos:** con la sesión cerrada la cola no envía hasta volver a ingresar. Si ingresa otro técnico en el mismo teléfono,
  la cola de envío es del teléfono y no por usuario: probar ese caso.

### 2026-11-07 · [APP] Selector de hora y fecha, y botones de la firma
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Qué se encontró (prueba de Cristóbal en el iPhone):** (1) los campos de hora no tenían el reloj desplegable de la web (eran texto
  libre); (2) en la firma se podía dibujar pero solo se veía el botón «Cancelar»: los botones «Limpiar» y «Guardar firma» del lienzo
  (`react-native-signature-canvas`) no aparecían, así que no se podía guardar la firma ni enviar.
- **Qué se hizo:**
  - `campo-fecha-hora.tsx`: al tocar el campo se abre un menú inferior con columnas desplazables (Hora y Minutos; o Día, Mes y Año) y
    botones «Cancelar», «Ahora» (solo hora, en horario de Chile) y «Aceptar». Guarda `HH:MM` y `AAAA-MM-DD`, igual que los `input`
    de la web. Se usa en los campos de cabecera de tipo `time` y `date`. Sin dependencias nuevas.
  - `firma-campo.tsx`: se oculta el pie del lienzo y los botones son de la app: «Limpiar», «Guardar firma» (lee la firma y la guarda)
    y «Cancelar». Si se toca «Guardar firma» sin dibujar, avisa «Dibuje su firma dentro del recuadro antes de guardar».
- **Archivos:** `app-movil/src/components/campo-fecha-hora.tsx`, `app-movil/src/components/firma-campo.tsx`, `app-movil/src/app/inspeccion/[id].tsx`.
- **Verificación:** `tsc` sin errores · Vitest 49 en verde · `expo export` iOS empaqueta (4,6 MB). **No verificado en el teléfono**:
  el selector y los botones de la firma deben probarse en Expo Go.
- **Pendiente / riesgos:** si el lienzo sigue sin mostrarse completo en algún modelo, probar `webviewProps` o un tamaño fijo. La causa
  exacta de que el pie quedara fuera de vista no se reprodujo (se evitó ocultándolo).

### 2026-11-07 · [APP] `app-movil/.env` creado con el CLI de Supabase
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Qué se hizo:** Cristóbal autorizó expresamente crear `app-movil/.env` (excepción a «No tocar archivos .env*» del `CLAUDE.md`) y
  elegir el proyecto `inspecciones-bbosch` (activo, sa-east-1). Con el CLI del repositorio (`corepack pnpm supabase`, solo lectura:
  `projects list` y `projects api-keys`) se escribieron únicamente `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
  La clave `service_role` no se leyó ni se guardó. El otro proyecto (`inspecciones-mlp-prueba`) está inactivo.
- **Archivos:** `app-movil/.env` (ignorado por git, confirmado con `git check-ignore`).
- **Verificación:** `GET /auth/v1/settings` y `GET /rest/v1/areas` con la clave anon responden HTTP 200. El ingreso desde la app no se probó.
- **Pendiente / riesgos:** las cuentas de técnico del proyecto remoto y sus contraseñas no están en el repositorio (no se versionan);
  hay que usar una que ya exista. Si el proyecto remoto no tiene aplicadas las migraciones 0016 en adelante, el catálogo de formatos fallará.

### 2026-11-07 · [APP] Pantallas del técnico (ingreso, inicio, nueva inspección, formulario)
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Qué se hizo:** réplica de las pantallas del técnico de la web, con las reglas de la skill (FlashList con tipos de ítem, `Pressable`,
  `StyleSheet.create`, `expo-image`, modales nativos, `contentInsetAdjustmentBehavior`, estado mínimo). Rutas protegidas con
  `Stack.Protected`: sin sesión solo existe `login`.
  - `login`: usuario y contraseña (usuario → correo interno, igual que la web). Solo ingresa el rol técnico. La sesión queda guardada
    en el teléfono; sin señal se usa la guardada y el perfil (rol/turno) se lee de una copia local.
  - `index` (inicio): botón «Nuevo Standard», resumen Enviadas/Aceptadas/Rechazadas, «Mis inspecciones» (en curso y cola, con
    «Eliminar»), «Enviadas» con motivo de rechazo y «Corregir y reenviar», indicador de sincronización y «Listo para trabajar sin
    señal · fecha de descarga» del catálogo.
  - `nueva`: Área → Trabajo → Familia → Formato con `formatosVisibles` / `familiasVisibles`.
  - `inspeccion/[id]`: datos del equipo, una pantalla por sección, secciones repetibles, ítems de verificación / número / texto /
    foto / placa, severidad en ML, cierre (observaciones, participantes, roles, firma), revisión con lista navegable de lo que
    falta y envío a la cola. Guardado automático (350 ms) y al salir de la pantalla.
  - Componentes: `foto-campo` (cámara y galería, compresión 1600 px JPEG 0,7), `firma-campo` (hoja a pantalla completa con
    `react-native-signature-canvas`), `selector-tag` (Maestro de TAG en una hoja con búsqueda, sectores, «Ver todas las áreas»,
    «Equipo sin TAG» y «+ Equipo»), `sync-indicador`.
  - Proveedores: `sesion.tsx` (ingreso/salida/perfil) y `tecnico-contexto.tsx` (sincronización, catálogo local, `useConsulta`).
  - `app.json`: plugin `expo-image-picker` con los textos de permiso de cámara y fotos.
- **Archivos:** `app-movil/src/app/{_layout,login,index,nueva}.tsx`, `src/app/inspeccion/[id].tsx`, `src/components/*`,
  `src/lib/{sesion,tecnico-contexto}.tsx`, `src/ui/*`, `assets/bbosch-logo-solo.png`, `app.json`.
- **Verificación:** `tsc` sin errores · Vitest 101 pruebas en verde · `expo-doctor` 20/20 · `expo export` Android e iOS empaquetan
  (4,6 MB cada uno). **No verificado en el teléfono** (ni una sola de estas pantallas); tampoco el ingreso: no existe `app-movil/.env`.
- **Pendiente / riesgos:**
  - Crear `app-movil/.env` y probar con la cuenta de un técnico. Hasta entonces la app muestra «Falta configurar la conexión».
  - Sin probar: cámara y galería, compresión y guardado de archivos, firma (WebView), subida de fotos al Storage, envío real
    contra `submit_inspection`, corrección de rechazadas, selector de TAG con el Maestro completo, `AppState`/NetInfo.
  - Diferencias con la web: no hay PDF; «Eliminar» usa un aviso nativo en vez de deslizar; el buscador de TAG no limita a 30 filas.
  - El token de acceso vencido sin señal: la app deja trabajar con la sesión guardada y los envíos reintentan hasta renovarla; no
    se probó el caso de refresco fallido al reconectar.

### 2026-11-07 · [APP] Diseño y fase 1: lógica del técnico en la app (SQLite)
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Qué se hizo:** se escribió `DISENO.md` (réplica del modelo de la web, con las reglas de la skill `react-native-skills`) y se
  aplicó la fase 1. Se copió de la web, con su ruta de origen en la cabecera: plantillas (`schema`, `validate`, `repetir`),
  formatos (`catalogo`, `tags`), `draft`, `catalog`, `enviadas`, `eliminar`, `outbox`, `transport`, `sync`, `fecha`, `usuario` y el
  Maestro de TAG (`data/maestro-tags.json`). Se adaptó el almacenamiento: interfaz `Almacen` con `AlmacenSqlite` (`expo-sqlite`,
  fotos como archivos) y `AlmacenMemoria` (pruebas). Red con NetInfo y `AppState`; sesión de Supabase en `expo-sqlite/kv-store`;
  UUID con `expo-crypto`. La pantalla de inicio muestra «Base local: lista», conexión a Supabase y hora de Chile.
- **Instalado (autorizado):** `@shopify/flash-list`, `expo-image`, `expo-crypto`, `vitest`, `vite`, `react-dom@19.3.0`.
  `react-dom` y `vite` son peers de paquetes ya instalados: sin `react-dom` `expo-doctor` marca un `react` duplicado (el de la web).
- **Otros cambios:** `tsconfig.json` (alias `@/*`, `types: ["node"]`), `vitest.config.ts`, `test/expo-crypto.ts`, script `npm test`,
  `.gitignore` ahora ignora `.env` y `.env.*` (antes solo `.env*.local`: la clave se habría subido al repositorio).
- **Archivos:** `app-movil/DISENO.md`, `app-movil/src/lib/**`, `app-movil/src/data/maestro-tags.json`, `app-movil/src/app/_layout.tsx`,
  `app-movil/src/app/index.tsx`, `app-movil/package.json`, `app-movil/tsconfig.json`, `app-movil/vitest.config.ts`, `app-movil/.gitignore`.
- **Verificación:** `tsc --noEmit` sin errores · `vitest run` 6 archivos, 49 pruebas en verde (borradores, validación, cola con
  reintentos e idempotencia, eliminar, enviadas y corrección, plantillas; son las de la web adaptadas a `AlmacenMemoria`) ·
  `expo-doctor` 20/20 · `expo export --platform android` empaqueta (3,3 MB).
- **Pendiente / riesgos:**
  - **No verificado en el teléfono:** `AlmacenSqlite`, la lectura y escritura de archivos y el cliente de Supabase solo se
    comprobaron con `tsc` y el empaquetado (los tests usan la copia en memoria). Abrir en Expo Go (pendiente 11).
  - `savePhoto` y `saveSignature` están escritos pero sin usar ni probar (API nueva de `expo-file-system` y `expo-image-manipulator`).
  - Falta `app-movil/.env` (pendiente 10). No se portó `repetir.test.ts` (depende del informe PDF de la web).
  - `npm install --legacy-peer-deps` deja bloqueado el script de `esbuild` (no afecta a las pruebas).
  - Si cambia una regla en la web (`draft`, `validate`, `outbox`…), hay que replicarla en la copia.

### 2026-11-07 · [APP] Primera prueba en iPhone con Expo Go
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Qué se hizo:** se abrió la app en el iPhone con Expo Go. Muestra la pantalla provisoria «App móvil en construcción»
  (BBOSCH · técnico · inspección sin señal). No hubo cambios de código.
- **Problemas y solución:**
  1. La lista «local server» de Expo Go no mostró el servidor (el descubrimiento automático no funcionó). Se usó el QR.
  2. Expo anunciaba una IP que el teléfono no alcanzaba (hay adaptadores VMware). Se fijó la IP de la Wi-Fi antes de
     arrancar: `$env:REACT_NATIVE_PACKAGER_HOSTNAME="<IP de la Wi-Fi>"` y luego `npx expo start`.
  3. «The request timed out»: el Firewall de Windows solo permitía `node.exe` en el perfil Público y la Wi-Fi es
     Privada. Se creó una regla de entrada para `node.exe` (nombre «Node.js Expo (Privada)»; quedó con perfil `Any` por un
     salto de línea al pegar; se recomendó dejarla en `Private` con `Set-NetFirewallRule`).
  4. Al abrir `localhost:8081` en un navegador sale «Unable to resolve react-native-web/dist/index»: es el bundle web,
     que no se usa (la app es solo para teléfono). No se instaló `react-native-web`.
- **Archivos:** solo esta bitácora.
- **Verificación:** probado en iPhone con Expo Go; carga la pantalla provisoria. Android no probado.
- **Pendiente / riesgos:** la IP de la Wi-Fi puede cambiar (DHCP); si deja de conectar, revisar la IP con `ipconfig`.
  Comprobar que la regla del Firewall quedó solo en `Private`.

### 2026-11-07 · [APP] Bitácora propia de la migración y rutas en `src/app/`
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Qué se hizo:** se creó esta bitácora con la regla de actualizarla en cada cambio (también en `app-movil/CLAUDE.md` y el
  `CLAUDE.md` de la raíz). Las pantallas se movieron de `app/` a `src/app/`, la convención del `AGENTS.md` de Expo.
- **Archivos:** `app-movil/BITACORA.md`, `app-movil/CLAUDE.md`, `app-movil/src/app/`, `app-movil/README.md`, `CLAUDE.md`, `docs/MAESTRO.md`, `docs/BITACORA.md`.
- **Verificación:** `tsc --noEmit` sin errores; `expo export --platform android` empaqueta e incluye las rutas.
- **Pendiente / riesgos:** abrir en el iPhone con Expo Go (pendiente 1).

### 2026-11-07 · [APP] Comando para PowerShell 5.1
- **Autor:** Cristóbal (con Claude)
- **Qué se hizo:** el primer intento de `npx expo start` falló porque PowerShell 5.1 no acepta `&&`. Se documentó correr
  `cd` y `npx expo start` en líneas separadas, y qué hacer si el iPhone no conecta (Firewall, `--tunnel`).
- **Verificación:** no verificado en el teléfono; Cristóbal seguirá desde VS Code.

### 2026-11-07 · [APP] Skill `react-native-skills` (Vercel Labs)
- **Autor:** Cristóbal (con Claude)
- **Qué se hizo:** copiada a `.claude/skills/react-native-skills/` (38 reglas). Las pantallas actuales ya cumplen sus reglas
  (stack nativo, `gap`, `StyleSheet.create`); no hubo cambios de código.
- **Verificación:** archivos copiados completos.

### 2026-11-07 · [APP] Proyecto Expo SDK 58 y módulos
- **Autor:** Cristóbal (con Claude)
- **Qué se hizo:** plantilla `blank-typescript`; módulos `expo-sqlite`, `expo-file-system`, `expo-image-picker`,
  `expo-image-manipulator`, `@react-native-community/netinfo`, `react-native-signature-canvas` + `react-native-webview`,
  `expo-router` (y dependencias), `@supabase/supabase-js`, `zod`. `overrides` de `glob`/`minimatch` por vulnerabilidades
  moderadas del CLI de Expo. `app.json`: «Inspecciones MLP», `cl.bbosch.inspecciones`, esquema `inspeccionesmlp`. Se
  borró el `LICENSE` MIT de la plantilla (el repo contiene información del cliente).
- **Verificación:** `tsc` sin errores; `expo-doctor` 20/20; `expo install --check` al día; `npm audit` 0; `expo export
  --platform android` 2,5 MB. No probado en teléfono.

### 2026-11-07 · [APP] Carpeta `app-movil/`
- **Autor:** Cristóbal (con Claude)
- **Qué se hizo:** carpeta y `README.md`; `app-movil` excluida de `tsconfig.json` y `eslint.config.mjs` de la raíz.
- **Verificación:** lint y tsc de la raíz sin errores.

### 2026-11-07 · [WEB] Comparativa de 13 inspecciones manuales vs formatos digitales y auditoría del menú
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Qué se hizo:** se leyeron 14 PDF escaneados de terreno (carpeta `Desktop\Inspeciones manuales`), se compararon con las plantillas y el Maestro de TAG, y se cargaron 13 inspecciones (19 PDF, por cubículos) en la app **local** con `scripts/simular-manuales.mjs` para generar su PDF digital. También se auditó el filtro del menú (60 formatos × 1.073 equipos). **No se cambió ningún formato, plantilla ni código de la app.**
- **Archivos:** `docs/COMPARATIVA_MANUALES_2026-11-07.md` (hallazgos M1–M6, C1–C12, P1–P6 y auditoría), `scripts/simular-manuales.mjs`.
- **Verificación:** 19/19 PDF generados y envíos aceptados en la base local (folios INS-2026-000014 a 000032); lado a lado en `C:\Proyectos\simulacion-formatos\manuales-2026-11-07\comparativa.html` (fuera del repo). **No verificado:** el menú con clics en pantalla o en el teléfono; la transcripción de los escaneos es manual (nombres poco legibles pueden estar mal leídos).
- **Pendiente / riesgos:** corregir filtros (trafos por tipo piso/aéreo, áreas y designadores de formatos, SG de sala), decidir con MLP los TAG fuera del Maestro y la versión vigente de INSP-16 y trafo de piso; ver el documento. Las 19 inspecciones de prueba solo están en la base local.

### 2026-11-07 · [WEB] V1.1.4 desplegada y app móvil del técnico unida a `main` (PR #18)
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil` (unida) · **Versión:** V1.1.4
- **Qué se hizo:** PR #18 (`feat/app-movil` → `main`, merge `19358da`) con la carpeta `app-movil/` (app nativa del técnico, Expo SDK 58) y el endpoint `GET /api/movil/informe/[id]` de la web. Cristóbal autorizó el push, el PR y la unión.
  Vercel desplegó en menos de 1 minuto. El detalle de la app (pantallas, cola sin señal, PDF, envío en segundo plano, EAS) está en `app-movil/BITACORA.md`; aquí solo lo que toca a la web y al repositorio.
- **Verificación:** antes de unir, `corepack pnpm lint` sin errores · `tsc --noEmit` sin errores · `test` 31 archivos, 255 pruebas en verde · `build` correcto (V1.1.4 en `package.json` y `src/lib/version.ts`).
  Después de unir: `curl …/login` muestra **V1.1.4**; `GET /api/movil/informe/<id>` sin token responde **401** (antes de desplegar daba 404). En el emulador Android (con señal) el PDF oficial de una inspección enviada se descargó con folio y estado «ENVIADA».
- **Resuelve de «Pendientes»:** desplegar la V1.1.4 para que la app móvil pueda pedir el PDF oficial.
- **Pendiente / riesgos:** el APK de Android (EAS Build, proyecto `@cnaveavaldes/inspecciones-mlp`) estaba compilando al cerrar esta entrada (primer intento falló por `npm ci`, corregido con `app-movil/.npmrc`); su resultado se anota en `app-movil/BITACORA.md`.
  Quedan 3 commits locales sin subir (PDF con el nombre del servidor, `.npmrc`, Maestro): requieren otro PR y la confirmación de Cristóbal. Las contraseñas de las cuentas de prueba del Supabase remoto siguen sin cambiarse (se rotarán después).

### 2026-11-07 · [WEB] Historial de GitHub reescrito: claves de las cuentas de prueba eliminadas
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Qué se hizo:** las 7 contraseñas de las cuentas de prueba (números de 8 dígitos) estaban en el historial público en `supabase/seed.sql` (primer commit),
  `supabase/seed_usuarios_dev.sql`, `scripts/prueba-carga.mjs` y `scripts/simular-formatos.mjs`. Se reemplazaron por el texto `CLAVE-ELIMINADA` en **todos** los commits
  (`git filter-branch` sobre una copia, sin borrar archivos ni commits) y se subió con `--force-with-lease` a las 20 ramas remotas. **Los 112 commits cambiaron de identificador**
  (p. ej. `main` pasó de `d765aaf` a `b33bb0a`). El repo sigue **público**, como decidió Cristóbal (Manuel no puede enviar mejoras a uno privado). **Las contraseñas NO se cambiaron.**
- **Verificación:** antes de subir, 0 apariciones de las claves en los 1.003 archivos y los mensajes de commit de la copia; mismas rutas en las 48 ramas y solo cambian esos 4 archivos
  (los árboles de `main` y `origin/main` son idénticos). Después de subir, se clonó GitHub de nuevo: 0 apariciones en las 20 ramas (108 commits alcanzables).
- **Lo que NO se pudo limpiar:** (1) las **17 referencias `refs/pull/*`** de GitHub siguen apuntando a commits antiguos con las 34 apariciones; no se pueden borrar con git: hay que pedir a GitHub Support
  la eliminación de datos sensibles y de las vistas en caché; (2) cualquier clon o copia que alguien ya hizo del repo público (0 forks al momento de reescribir); (3) las cuentas del Supabase remoto
  **siguen usando esas mismas contraseñas**, así que quien las haya visto puede ingresar: reescribir el historial no sustituye a rotarlas.
- **Para Manuel:** su `main` local ya no coincide con GitHub. Lo más simple: clonar de nuevo. Para no perder trabajo sin unir: en su clon viejo, `git log --oneline origin/main..<su-rama>` (con el `origin/main` viejo)
  identifica sus commits; en el clon nuevo, `git switch -c <su-rama> origin/main` y `git cherry-pick <commits>`. No usar `git pull` ni `git push --force` desde el clon viejo (volvería a subir las claves).
- **Respaldo:** copia completa del historial anterior (con las claves) en la carpeta temporal de la sesión de Claude (`…\scratchpad
espaldo.git`), fuera del repo. **Borrarla cuando se confirme que todo está bien.** El repo local de Cristóbal conserva
  los commits viejos en el reflog y en un stash antiguo; se pueden purgar con `git reflog expire --expire=now --all` y `git gc --prune=now`.
- **Archivos:** ninguno del código; solo el historial de git y esta bitácora / `docs/MAESTRO.md` (sección 5.1).
- **Pendiente:** pedir a GitHub Support la limpieza de `refs/pull/*`; decidir cuándo rotar las contraseñas.

### 2026-11-07 · [WEB] Endpoint del PDF para la app móvil
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Versión:** V1.1.4
- **Qué se hizo:** la app móvil no tiene las cookies del navegador, así que no podía pedir el PDF oficial. Se agregó `GET /api/movil/informe/[id]`,
  que lee `Authorization: Bearer <token de Supabase>`, verifica el token con Supabase, comprueba el rol y genera el mismo PDF de siempre.
  La lectura de la inspección pasa por RLS con ese token (un técnico solo ve las de su cuenta; una ajena responde 404). `obtenerDetalle` y
  el responder del PDF aceptan ahora un cliente de Supabase opcional (sin él, todo funciona igual que antes por cookies). Las rutas
  `/tecnico/[id]/pdf`, `/supervisor/[id]/pdf`, etc. no cambian.
- **Archivos:** `src/app/api/movil/informe/[id]/route.ts`, `src/lib/informe/responder-movil.ts`, `src/lib/informe/responder.ts`,
  `src/lib/revision/queries.ts`, `src/lib/auth/bearer.ts` (+ `bearer.test.ts`), `package.json`, `src/lib/version.ts`.
- **Verificación:** `corepack pnpm lint` sin errores · `tsc --noEmit` sin errores (tras `next typegen`) · `corepack pnpm test` 31 archivos, 255 pruebas
  en verde (incluye `bearer.test.ts`) · `corepack pnpm build` correcto, la ruta aparece en `.next/server/app/api/movil/informe`.
  **No verificado:** la descarga real con un token; el sitio publicado aún responde 404 en esa ruta porque no está desplegado.
- **Pendiente / riesgos:** desplegar en Vercel (requiere confirmación) y probar con la app. La ruta no tiene límite de uso propio: un token válido
  puede pedir PDF repetidamente (cada uno cuesta CPU en el servidor). Es la misma exposición que la ruta por cookies.

### 2026-11-07 · [WEB] Bitácora propia para la migración a React Native
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil` · **Versión:** sin cambio (V1.1.3)
- **Qué se hizo:** desde ahora, **todo lo de la app nativa se registra en `app-movil/BITACORA.md`** (estado, pendientes, decisiones y
  registro de la migración); esta bitácora sigue para la web y Supabase. Regla escrita en `CLAUDE.md` y `app-movil/CLAUDE.md`.
- **Archivos:** `app-movil/BITACORA.md`, `app-movil/CLAUDE.md`, `CLAUDE.md`, `docs/MAESTRO.md`.
- **Verificación:** documentos; sin cambios en la web.

### 2026-11-07 · [WEB] Skill `react-native-skills` (Vercel Labs) para la app móvil
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil` · **Versión:** sin cambio (V1.1.3)
- **Qué se hizo:** se copió `react-native-skills` (Vercel, MIT, 38 reglas) desde `Documents\Code\Skills\agent-skills-main` a `.claude/skills/`,
  junto a `react-best-practices` y `web-design-guidelines`. Se revisaron `app-movil/app/_layout.tsx` e `index.tsx` con ella: ya usan el stack nativo
  de `expo-router` (`navigation-native-navigators`) y `gap`/`StyleSheet` (`ui-styling`); no hubo que cambiar código. Reglas que aplicarán al construir
  el técnico: listas virtualizadas para el selector de TAG (1.073 equipos) y los borradores (`list-performance-*`), `expo-image` para miniaturas de
  fotos (`ui-expo-image`), `Pressable` (`ui-pressable`), `contentInsetAdjustmentBehavior` en vez de `SafeAreaView` (`ui-safe-area-scroll`), estado que
  represente la verdad (`state-ground-truth`) y dependencias nativas instaladas en `app-movil` (`monorepo-native-deps-in-app`).
- **Archivos:** `.claude/skills/react-native-skills/`, `app-movil/README.md`, `docs/MAESTRO.md`.
- **Verificación:** archivos copiados completos (SKILL.md, AGENTS.md, 38 reglas); sin cambios de código, no aplica lint ni tests.
- **Pendiente / riesgos:** las reglas recomiendan `@legendapp/list` o `@shopify/flash-list` y `expo-image`: son dependencias nuevas, **pedir autorización**
  cuando se construyan esas pantallas.

### 2026-11-07 · [WEB] Proyecto Expo creado en `app-movil/` (SDK 58) con sus módulos
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil` · **Versión:** sin cambio (V1.1.3; no toca la app web)
- **Qué se hizo:** con autorización de Cristóbal se creó el proyecto Expo (plantilla `blank-typescript`, SDK 58, React Native 0.88, TypeScript
  estricto) y se instalaron `expo-sqlite`, `expo-file-system`, `expo-image-picker`, `expo-image-manipulator`, `@react-native-community/netinfo`,
  `react-native-signature-canvas` + `react-native-webview`, `expo-router` (y sus dependencias), `@supabase/supabase-js` y `zod`. Navegación con
  `expo-router` y pantalla provisoria en español con colores Cobre. `app.json`: nombre «Inspecciones MLP», identificador `cl.bbosch.inspecciones`
  (iOS y Android), solo teléfono, esquema `inspeccionesmlp`. La carpeta usa **npm** (lockfile propio), no pnpm. Se borró el `LICENSE` MIT que crea
  la plantilla (el repo contiene información del cliente).
- **Archivos:** `app-movil/` (`package.json`, `package-lock.json`, `app.json`, `app/_layout.tsx`, `app/index.tsx`, `README.md`, `tsconfig.json`,
  `.gitignore`, `assets/`, `AGENTS.md`, `.claude/settings.json`), `docs/MAESTRO.md`.
- **Verificación (2026-11-07):** en `app-movil`: `tsc --noEmit` sin errores; `expo-doctor` 20/20; `expo install --check` al día; `npm audit` 0
  vulnerabilidades (con `overrides` de `glob`/`minimatch`); `expo export --platform android` empaqueta (2,5 MB). En la raíz: lint y tsc sin errores.
  **No probado en un teléfono ni en emulador** (no se abrió con Expo Go).
- **Pendiente / riesgos:** abrir con Expo Go en un teléfono real; `react-native-signature-canvas` es de terceros (no del SDK de Expo): confirmar que
  funciona en iPhone y Android; la app final necesita una compilación propia (EAS/development build) porque la prueba sin señal no se puede hacer en
  Expo Go con todos los módulos; siguiente paso: diseño de la interfaz de almacenamiento compartida (Maestro 5.7).

### 2026-11-07 · [WEB] Carpeta `app-movil/` para la app nativa (React Native)
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil` · **Versión:** sin cambio (V1.1.3; no toca la app web)
- **Qué se hizo:** inicio de la migración a React Native: carpeta `app-movil/` con un `README.md` (propósito, plan, qué se rehace para el
  teléfono). Se excluyó `app-movil` de `tsconfig.json` y de `eslint.config.mjs` para que el futuro proyecto Expo no rompa `tsc` ni el lint de Next.
  **Sin dependencias nuevas:** instalar Expo y sus módulos (SQLite, archivos, cámara, estado de red, firma) espera autorización de Cristóbal.
- **Archivos:** `app-movil/README.md`, `tsconfig.json`, `eslint.config.mjs`, `docs/MAESTRO.md`.
- **Verificación (2026-11-07):** `corepack pnpm lint` y `corepack pnpm tsc --noEmit` sin errores. No se corrieron tests ni build (no cambia código de la app).
- **Pendiente / riesgos:** autorizar dependencias de Expo; proponer el diseño de la interfaz de almacenamiento (Maestro 5.7) antes de mover lógica;
  decidir cuentas por persona o genéricas (afecta el ingreso en la app nativa).

### 2026-11-06 · [WEB] Cierre de la jornada: PR #16 unido, sitio en V1.1.3 y estado al día
- **Autor:** Cristóbal (con Claude) · **Rama:** `docs/estado-v1-1-3` · **Versión:** sin cambio (V1.1.3)
- **Qué se hizo:** Cristóbal unió el PR #16 (contraseñas de prueba fuera del repo). Se verificó que `main` = d765aaf, que `supabase/` solo
  versiona `seed_usuarios_dev.plantilla.sql` y que el sitio publicado muestra **V1.1.3**. Resumen del día, en orden: barrido de `.md` y creación del
  Maestro (`docs/MAESTRO.md`, lectura obligatoria al iniciar sesión); V1.1.1 (PDF: severidad, TAG, mantenciones, NA; plantillas corregidas;
  prueba de carga); V1.1.2 (Supabase CLI 3.0.0); remoto al día por CLI (0020, 10 plantillas v2, historial de migraciones, registro libre cerrado);
  PR #13 a #16 unidos; revisión de claves del historial; V1.1.3.
- **Decisiones del día** (también en «Decisiones»): sin señal se resuelve migrando a React Native; el repo sigue público; las contraseñas del remoto
  no se rotan por ahora (sistema de prueba) y se vuelve a revisar antes de datos reales; el repo no pasa a privado de momento.
- **Verificación:** `main` y sitio comprobados con `git log`, `gh pr list` y `curl` del 2026-11-06; las pruebas de cada mejora están en sus entradas.
- **Pendiente / riesgos (en orden):** (1) rotar contraseñas del remoto y volver privado el repo antes de datos reales; (2) recorrer el sitio publicado con
  los tres roles; (3) fallas medias y bajas de PDF (Maestro 5.3); (4) prueba sin señal en la app nativa; (5) decidir cuentas por persona y qué ve cada
  supervisor; (6) separar la lógica de las pantallas para React Native (proponer el diseño primero); (7) Manuel: `git pull`, `corepack pnpm install`,
  `corepack pnpm seed:usuarios` y `corepack pnpm supabase start`.

### 2026-11-06 · [WEB] Revisión de claves filtradas y contraseñas de prueba fuera del repositorio público
- **Autor:** Cristóbal (con Claude) · **Rama:** `fix/claves-fuera-del-repo` · **Versión:** V1.1.3
- **Qué se hizo:** (1) Revisión del historial de git (106 commits, todas las ramas), sin mostrar valores: **no hay** claves `service_role`, `sb_secret_`,
  tokens, URL de base con contraseña, claves de GitHub/AWS ni claves privadas; `.env.example` está vacío; los `eyJ…` de los HTML de demo son imágenes
  en base64. (2) **Sí estaban publicadas las contraseñas de las 7 cuentas de prueba** (`seed_usuarios_dev.sql`), y una consulta de solo lectura al remoto
  (comparación de hashes) mostró que **las 7 cuentas del Supabase remoto usan esas mismas contraseñas**, incluida `ADMINISTRADOR` (la bitácora decía lo
  contrario). (3) Se sacaron del árbol de archivos: `supabase/seed_usuarios_dev.plantilla.sql` (sin claves), `scripts/generar-seed-usuarios.mjs`
  (`corepack pnpm seed:usuarios` genera claves aleatorias por equipo en `supabase/.claves-dev.json` y el SQL en `supabase/seed_usuarios_dev.sql`, ambos en
  `.gitignore`); `simular-formatos.mjs` y `prueba-carga.mjs` leen las claves de ese JSON.
- **Archivos:** `supabase/seed_usuarios_dev.plantilla.sql`, `scripts/generar-seed-usuarios.mjs`, `.gitignore`, `package.json`, `scripts/simular-formatos.mjs`,
  `scripts/prueba-carga.mjs`, `CLAUDE.md`, `docs/MAESTRO.md`.
- **Verificación (2026-11-06):** `seed:usuarios` + `db reset` + `supabase test db` 76/76; simulación (INSP-01 y MANT-05: 4/4 PDF) y prueba de carga chica
  (3 técnicos × 2) con las claves nuevas: 6/6 enviados y firmados, 0 errores; ninguna clave vieja queda en archivos versionados ni en la plantilla.
- **Pendiente / riesgos:** **las contraseñas siguen en el historial público de git** (borrarlas del árbol no las quita) y **siguen vigentes en el remoto**:
  Cristóbal decidió no rotarlas porque el sistema aún es de prueba; **hay que rotarlas antes de usar datos reales** (cualquiera que vea el repo puede entrar
  al sitio publicado como administrador; ingresos recientes en `administrador`, `supervisor_b` y `tecnico_b` no se pudieron atribuir). Opciones para el
  historial: volver privado el repo (Manuel puede ser colaborador) o reescribir el historial con force-push (destructivo; requiere acordarlo con Manuel).
  El repo público también contiene los formatos Word/Excel de MLP y el Maestro de TAG (1.073 equipos). Cada equipo debe correr `seed:usuarios` una vez.

### 2026-11-06 · [WEB] PR #13 y #14 unidos a `main`; el sitio publicado pasa a V1.1.2
- **Autor:** Cristóbal (con Claude) · **Rama:** `docs/estado-v1-1-2` · **Versión:** sin cambio (V1.1.2)
- **Qué se hizo:** se unieron a `main` el PR #13 (V1.1.1: PDF, plantillas, Maestro, prueba de carga) y el PR #14 (V1.1.2: Supabase CLI 3.0.0),
  en ese orden, sin borrar las ramas. Manuel no revisa hasta la próxima semana: esta vez se unió sin su revisión, por decisión de Cristóbal.
  Se actualizó el Maestro con el estado real.
- **Verificación:** `main` = 76f41ec; Vercel desplegó en menos de 1 minuto y `https://inspecciones-bbosch.vercel.app/login` muestra **V1.1.2**,
  en `gru1`; `/login`, `/privacidad`, `/condiciones` y `/manifest.webmanifest` responden 200 y `/tecnico` redirige (307) sin sesión.
  No se probó con las cuentas remotas (sus contraseñas las tiene Cristóbal) ni con clics.
- **Pendiente / riesgos:** Manuel debe hacer `git pull`, `corepack pnpm install` y `corepack pnpm supabase start` (el CLI 3 baja imágenes).
  Falta recorrer el sitio publicado con los tres roles, las fallas medias y bajas de PDF y la prueba sin señal (en la app nativa).

### 2026-11-06 · [WEB] Supabase remoto: migración 0020, parche de plantillas y registro de migraciones (por CLI)
- **Autor:** Cristóbal (con Claude) · **Rama:** `chore/supabase-cli-3` (PR #14) · **Versión:** sin cambio de código (V1.1.2)
- **Qué se hizo** (proyecto `inspecciones-bbosch`, tras `supabase login` de Cristóbal; todo con `supabase db query --remote` y `--yes`):
  1. Se consultó en solo lectura: la **0020 no estaba aplicada** (sin columnas ni función `registrar_aviso_privacidad`; el sitio
     publicado ya era V1.1.0 y la usaba), 60 formatos y 60 plantillas v1, 3 inspecciones, 7 usuarios.
  2. Se aplicó `0020_aviso_privacidad.sql` y se verificó (2 columnas y la función).
  3. Se simuló en solo lectura el parche de plantillas (10 plantillas cambiarían) y se ejecutó `parche_plantillas_2026-11-06.sql`:
     quedaron **10 versiones nuevas (v2)**: INSP-19, 27, 28, 31, 37 y MANT-05, 13, 14, 16, 19. Se comprobó en el remoto
     MANT-05 («ausencia de óxido»), MANT-13 (TAG 740HF003, ordinales «.ª») y MANT-16 («transformador de piso»).
  4. Se registraron 0001–0020 con `supabase migration repair --status applied`: `db push --dry-run` ahora dice «Remote database is up to date».
  5. `supabase config diff` mostró `auth.enable_signup = false` en el remoto (**registro libre cerrado**) y `site_url = http://localhost:3000`.
- **Verificación:** las consultas de comprobación de cada paso, ejecutadas contra el remoto el 2026-11-06 (resultados arriba). No se probó la
  app publicada con clics ni con las cuentas.
- **Pendiente / riesgos:** **NUNCA correr `supabase config push` con el `config.toml` actual:** sobrescribiría el remoto (reabriría el registro,
  cambiaría `site_url`, MFA, etc.). Las inspecciones nuevas del sitio publicado usan las plantillas v2 (las 3 antiguas conservan la v1). Falta
  desplegar V1.1.2 en Vercel (unir los PR #13 y #14 a `main`) para que el sitio muestre los PDF nuevos; hasta entonces los PDF del sitio son los de V1.1.0
  con plantillas nuevas. `site_url` remoto en localhost no afecta el ingreso por usuario y contraseña, pero conviene fijarlo a la URL real si algún día se usan correos.

### 2026-11-06 · [WEB] Supabase CLI 3.0.0 (antes 2.122.0), con todas las pruebas repetidas
- **Autor:** Cristóbal (con Claude) · **Rama:** `chore/supabase-cli-3` (parte de `fix/pdf-fallas-altas`, PR #13) · **Versión:** V1.1.2
- **Qué se hizo:** `supabase` en `devDependencies` pasó de `^2.122.0` a `^3.0.0` (decisión de Cristóbal: trabajar siempre con la
  última versión). En `supabase/config.toml` se renombró `enable_signup` por `enabled` en `[auth.email]` y `[auth.sms]` (el CLI 3 avisa
  que la clave vieja desaparece en la v4; los valores no cambiaron). La primera vez descarga imágenes nuevas (Postgres 17.11).
- **Archivos:** `package.json`, `pnpm-lock.yaml`, `supabase/config.toml`, `src/lib/version.ts`.
- **Verificación (2026-11-06, CLI 3.0.0):** `supabase start`, `db reset` y `test db` 76/76 sin avisos · `lint` y `tsc` sin errores ·
  `test` 253/253 · `build` correcto · `pnpm audit --prod` sin vulnerabilidades · simulación 120/120 PDF · prueba de carga
  (12 técnicos × 5 + supervisor + programador): 60/60 enviados y firmados, 0 errores ni pegados, envío p95 307 ms.
- **Pendiente / riesgos:** Manuel debe correr `corepack pnpm install` y `corepack pnpm supabase start` (bajará imágenes) tras unir esto.
  El contenedor `supabase_vector` (recolector de logs) se reinicia en bucle en este PC (se apaga solo y Docker lo relanza); no
  afecta a la base, la API ni a las pruebas, y no se investigó más. El **remoto** no se tocó: el `login` del CLI sigue pendiente.
  Los ajustes del Supabase remoto (p. ej. registro libre) no dependen de `config.toml`.

### 2026-11-06 · [WEB] Prueba de estabilidad y rendimiento: 12 técnicos del turno A, supervisor y programador
- **Autor:** Cristóbal (con Claude) · **Rama:** `fix/pdf-fallas-altas` · **Versión:** V1.1.1 (sin cambios en la app; solo se agregó el script)
- **Qué se hizo:** nuevo `scripts/prueba-carga.mjs` (solo contra la app y el Supabase locales). Abre N sesiones de técnico que
  envían a la vez (fotos y firma a Storage + `submit_inspection`), 1 sesión de supervisor y 1 de programador que consultan su
  bandeja (carpetas y lista completa), abren cada inspección y la firman, y al final cada técnico descarga su PDF. Marca
  como «pegada» cualquier operación que pase de 60 s.
- **Archivos:** `scripts/prueba-carga.mjs`; resultados en `C:\Proyectos\simulacion-formatos\2026-11-06-carga-*` (fuera del repo).
- **Verificación (app en producción local `next start`, V1.1.1, base local):**
  - 12 técnicos × 5 envíos (60 formularios): **60/60 enviados, 60/60 firmados por supervisor y por programador, 0 errores,
    0 pegados**; envío completo p50 198 ms (p95 349 ms); firmar p50 28 ms.
  - 12 técnicos × 15 envíos (180, corrida larga): 180/180, 0 errores; envío p95 829 ms.
  - 36 técnicos × 4 envíos (144, ráfaga 3 veces mayor): 144/144, 0 errores; envío p95 507 ms.
  - Lo más lento es el **PDF**: con 12 descargas simultáneas p50 4,9 s (solo ~1 s); con 36 simultáneas p50 12 s. Mientras se
    generan, el mismo servidor Node tarda hasta 2–6 s en responder otras páginas (máximos de bandeja y de «abrir
    inspección»); sin ese pico, bandeja y detalle responden en 20–100 ms. No hubo errores ni mensajes de error en el log.
- **Pendiente / riesgos:** es una prueba **local** (un solo proceso, sin latencia de red, sin Vercel ni Supabase Free con
  sus límites de conexiones y de Storage), así que **no demuestra el rendimiento del sitio publicado**: repetirla contra el
  remoto requiere confirmación de Cristóbal y un script que lo permita (hoy se niega a correr contra un Supabase remoto).
  No ejercita el navegador, Dexie ni la cola offline de la PWA. «Hasta verse en la bandeja» incluye que el supervisor
  esté ocupado firmando la fila anterior. Dejó ~390 inspecciones de prueba en la base local (`supabase db reset` las limpia).

### 2026-11-06 · [WEB] PDF: severidad, TAG, mantenciones y plantillas corregidas (5 fallas altas de la revisión)
- **Autor:** Cristóbal (con Claude) · **Rama:** `fix/pdf-fallas-altas` · **Versión:** V1.1.1
- **Qué se hizo:** (S02) el PDF muestra la severidad de cada hallazgo (píldora en la fila, bloque «Hallazgos» y pie de
  foto); (S03) el aviso de resultado dice «N hallazgos» con desglose por severidad y los ítems, sin la tilde mal puesta;
  (S05) sin guionado automático del texto y ancho máximo del bloque de datos, así el TAG queda en una línea; (S09) las
  mantenciones dicen «Resultado de la mantención»; (S11) los ítems NA ya no restan: «18 de 21 ítems conformes (3 no
  aplican)» y «x/y» por grupo; (S01) no era un error del PDF sino del script de simulación (no adjuntaba la foto en los
  ítems de foto cuando no eran obligatorios): corregido, y un test comprueba que la foto de un ítem de foto sale sin
  hallazgos; (P01) MANT-13, sección 740HF003, ahora usa TAG 740HF003; (P04) MANT-05 «Verificar ausencia de óxido»;
  además erratas de MANT-05/16/19, INSP-27/28/31 y otros (tildes, «chisporroteo», OTIT/WTIT, ordinales «5.ª sintonía»).
- **Archivos:** `src/lib/informe/modelo.ts`, `src/components/informe/informe-pdf.tsx`, `scripts/simular-formatos.mjs`,
  `supabase/seed_plantillas_*.sql` (bases nuevas), `supabase/parche_plantillas_2026-11-06.sql` (**bases existentes**),
  tests en `modelo.test.ts` y `seeds-redaccion.test.ts`.
- **Verificación (2026-11-06):** `lint` y `tsc` sin errores · `test` 253/253 · `build` correcto · `supabase db reset` +
  `supabase test db` 76/76 · simulación local: 120/120 PDF en `C:\Proyectos\simulacion-formatos\2026-11-06\`
  (fuera del repo), revisados por texto en los 120 y por imagen en INSP-01, INSP-14 y MANT-16: 0 TAG partidos, bloque
  de hallazgos y severidad en 59 de 60 «con hallazgos» (MANT-05 no tiene ML posible, falla X01), 16 de 16 PDF
  «conforme» con foto, 0 mantenciones con «inspección». El parche SQL se probó en la base local: degradando a propósito
  MANT-05 y MANT-13 crea la versión siguiente y una segunda ejecución no hace nada.
- **Pendiente / riesgos:** **el parche SQL no se ha ejecutado en el Supabase remoto** (requiere confirmación de
  Cristóbal; pegarlo en el SQL Editor como «postgres (Superuser)»); las inspecciones ya enviadas conservan su versión.
  Siguen abiertas las fallas medias de plantilla no tratadas (P03, P05, P07, P08, P14, P16, P19, P37, P38, P41, S06,
  S19–S22, S04, S07 y S13) y las bajas.

### 2026-11-06 · [WEB] Barrido de documentos `.md`: lo antiguo pasa a `docs/archivo/`
- **Autor:** Cristóbal (con Claude) · **Rama:** `docs/limpieza-md` · **Versión:** sin cambio (solo documentación, V1.1.0)
- **Qué se hizo:** se movieron a `docs/archivo/` (con `git mv`, sin borrar) los documentos desactualizados:
  `ARBOL_INSPECCIONES.md` (propuesta ya superada), `CONTEXTO_COWORK_TAGS.md` (dice que existe un solo formato),
  `AUDITORIA_REACT_UI_TECNICO.md` (auditoría puntual del 2026-10-31; el pendiente 29 la menciona) y `formatos/LEEME.md`
  (ahora `FORMATOS_LEEME.md`). El `README.md` de plantilla de Next se reemplazó por un índice corto. Siguen vigentes:
  `BITACORA.md`, `CLAUDE.md`, `AGENTS.md`, `DESIGN.md`, `DEPLOY_VERCEL.md`, `EXPORT_MAESTRO.md`, `MAPEO_ZONA_AREA.md`
  (la regenera el script del Maestro) y `LICENCIAS.md`. Las entradas antiguas de esta bitácora siguen citando las rutas
  anteriores de esos archivos.
- **Documento maestro:** se creó `docs/MAESTRO.md` (directorio de documentos, código, recursos fuera del repo y
  en línea; estado; faltantes y revisiones previas a React Native; contexto SAP, antes solo en la memoria local de
  Claude). `CLAUDE.md` lo importa con `@docs/MAESTRO.md` y exige leerlo al iniciar cada sesión, y se corrigió su
  frase sobre repositorio privado.
- **Verificación:** solo se movieron archivos `.md`; ningún código los importa (revisado con `git grep`). No se corrió build.
- **Pendiente / riesgos:** «Estado actual» y «Pendientes» de esta bitácora siguen siendo largos y repetidos; falta
  reescribirlos. `CLAUDE.md` aún dice que el repositorio es privado y GitHub lo muestra como PUBLIC.

### 2026-11-03 · [WEB] Prueba de rendimiento y de funciones antes de publicar V1.1.0, con correcciones
- **Autor:** Cristóbal (con Claude) · rama `feat/legal-version-1.1.0`
- **Versión:** V1.1.0 (mismo lote, aún sin unir a `main`)
- **Cómo se probó:** script propio con Chrome sin ventana (protocolo de depuración, sin dependencias nuevas; queda fuera
  del repositorio) contra la app local compilada (`next start`) y Supabase local. Entra con `TECNICO_A`, `SUPERVISOR_A`,
  `PROGRAMADOR_A`, `ADMINISTRADOR` y sin sesión; mide 21 pantallas en **celular simulado** (390 px, CPU 4× más lenta,
  4G lenta: 150 ms y 1,6 Mbps) y en **escritorio** (1440 px): tiempo de respuesta, primer contenido, LCP, saltos de diseño
  (CLS), KB descargados y errores de consola; y prueba funciones: ingreso por rol, aviso de privacidad, flujo Área →
  Trabajo → Familia → Formato hasta el formulario, «Ver PDF» → visor → «Salir», bandeja → carpeta → detalle → PDF,
  redirecciones por rol y sin sesión.
- **Resultado final (celular simulado):** 0 errores de consola · 0 pruebas fallidas · **CLS 0 en todas** · respuesta del
  servidor 7–130 ms · LCP 108–452 ms en pantallas con sesión · ingreso hasta la pantalla del técnico 563 ms · visor del PDF
  listo en 1,5 s · PDF del supervisor 1,4 s (195 KB) · la pantalla de ingreso, en una primera visita sin caché, baja 256 KB
  (147 KB de JavaScript del framework) con LCP 848 ms. Escritorio: LCP 36–200 ms. La pantalla más pesada es «Equipos con
  fallas» del administrador (79 KB, respuesta 130 ms): aceptable.
- **Encontrado y corregido:**
  1. **Salto de diseño en el inicio del técnico (CLS 0,125, sobre el límite de 0,1)** causado por el pie de página nuevo:
     aparecía abajo y la lista cargada desde el teléfono lo empujaba. Ahora el contenido del técnico ocupa al menos una
     pantalla y el pie queda siempre bajo el borde (`src/app/tecnico/layout.tsx`).
  2. **Salto en «Nuevo Standard» (CLS 0,03) y aviso engañoso:** con red se mostraba «Usando el catálogo guardado en el
     equipo» unos segundos mientras se descargaba el nuevo y luego desaparecía. Ahora solo aparece si de verdad no se pudo
     actualizar (`actualizando` en `tecnico-provider.tsx`, `nueva-inspeccion.tsx`).
  3. **Títulos de pestaña con dos nombres:** 18 pantallas decían «Inspecciones MLP»; ahora todas usan el nombre oficial
     «Inspección Eléctrica Bbosch-MLP».
  4. **Textos de carga sin «…»** («Enviando», «Cargando catálogo», «Guardando», indicador «Enviando»): normalizados.
  5. **Privacidad decía «planificador»** cuando la app llama «Programador» a ese rol: corregido.
  6. **Enlaces del pie muy pequeños para el dedo:** área táctil mayor.
- **Sin cambiar (decisión pendiente del equipo):** «Nuevo Standard» (mezcla inglés/español; lo puso Manuel al rediseñar
  el inicio) y el menú del supervisor «Fallas» frente a «Equipos con fallas» en los demás roles. Además, los formatos
  firman como «Planificador Bbosch» y la app llama «Programador» al rol.
- **Archivos:** `src/app/tecnico/layout.tsx`, `src/components/tecnico/{tecnico-provider,nueva-inspeccion,formulario,photo-field,sync-indicator}.tsx`,
  `src/components/shared/pie-pagina.tsx`, `src/app/privacidad/page.tsx`, títulos en `src/app/**/page.tsx`.
- **Verificación:** lint y tsc sin errores · `test` 245/245 · `build` correcto · prueba en navegador descrita arriba
  (celular simulado y escritorio, 21 pantallas cada uno, 0 fallas). **No verificado:** en un teléfono real ni en el sitio
  publicado (la red y la CPU fueron simuladas; Supabase local está en el mismo PC, así que la respuesta real desde
  São Paulo será mayor).
- **Pendiente / riesgos:** decidir los nombres anteriores; repetir esta prueba en el sitio publicado después de desplegar.

### 2026-11-03 · [WEB] V1.1.0: versión al pie, Privacidad, Condiciones de uso, aviso al ingresar, fotos sin GPS y dependencias
- **Autor:** Cristóbal (con Claude) · rama `feat/legal-version-1.1.0` (sale de `fix/visor-pdf-tecnico`, que sale de `docs/bitacora-al-dia`)
- **Versión:** V1.1.0 (la primera numerada; ver «Versiones»)
- **Contexto:** el usuario pidió revisar una lista de cumplimiento (privacidad, términos, cookies, banner, consentimientos,
  minimización, SDK de terceros, dark patterns, licencias) y aplicar lo recomendado en orden. Bbosch y MLP ya aceptaron la
  aplicación (dicho por el usuario el 2026-11-03).
- **Qué se hizo:**
  1. **Fotos sin metadatos:** `compressImage` ahora devuelve siempre la imagen redibujada en el canvas (sin EXIF: GPS,
     modelo, fecha). Antes, si el original pesaba menos que el comprimido, se subía el original con sus metadatos.
  2. **Dependencias:** `pnpm audit --prod` daba 3 vulnerabilidades (zod <4.6.6 alta; glob y minimatch moderadas), todas
     dentro de `@serwist/turbopack`/`@serwist/build` (herramientas del service worker). Se fijaron versiones corregidas con
     `overrides` en `pnpm-workspace.yaml`; ahora «No known vulnerabilities found».
  3. **Licencias:** `docs/LICENCIAS.md` (170 dependencias de producción: MIT, Apache-2.0, ISC, BlueOak, BSD; ninguna
     GPL/AGPL; Geist con SIL OFL; Helvetica/Courier del PDF; logos y nombre MLP autorizados).
  4. **Versión y pie de página:** `package.json` y `src/lib/version.ts` en 1.1.0; pie (`pie-pagina.tsx`) en técnico,
     personal de escritorio, ingreso y páginas legales: «© 2026 Bbosch · Uso exclusivo del personal autorizado de Bbosch y
     MLP · Privacidad · Condiciones de uso · V1.1.0». En el formulario del técnico deja espacio para la barra fija.
  5. **Páginas públicas `/privacidad` y `/condiciones`** (se leen sin sesión): qué datos se guardan, para qué, quién los
     ve, dónde (Supabase y Vercel en São Paulo: transferencia fuera de Chile), cookies solo necesarias (por eso **no hay
     banner de cookies**), datos guardados en el teléfono, conservación según plazos de Bbosch/MLP, derechos (Ley 19.628 y
     Ley 21.719 desde su vigencia) y condiciones de uso internas.
  6. **Aviso al primer ingreso:** ventana con resumen y botón «Entendido» (no es consentimiento: la base es la relación
     laboral/contractual). Registra versión y fecha en el perfil con la función `registrar_aviso_privacidad` (migración
     **0020**). Se consulta cuando el teléfono queda ocioso y nunca bloquea: sin red o con error del servidor no aparece.
- **No se hizo (no aplica):** banner de cookies (solo hay cookies necesarias) ni política de cookies aparte (es una sección
  de Privacidad). Dark patterns: no se encontraron; queda la revisión con `web-design-guidelines` (pendiente 29).
- **Archivos:** `src/lib/offline/compress.ts`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `package.json`, `docs/LICENCIAS.md`,
  `src/lib/version.ts` (+ test), `src/components/shared/{pie-pagina,pagina-legal,aviso-privacidad,staff-shell}.tsx`,
  `src/app/{privacidad,condiciones}/page.tsx`, `src/app/tecnico/layout.tsx`, `src/app/login/page.tsx`,
  `supabase/migrations/0020_aviso_privacidad.sql`, `supabase/tests/aviso.test.sql`, `CLAUDE.md` (regla de versión).
- **Verificación:** lint y tsc sin errores · `test` 245/245 · `build` correcto · `supabase test db` 76/76 (6 nuevas del
  aviso) · `pnpm audit --prod` sin vulnerabilidades. En Chrome contra la app local compilada con `TECNICO_A`: el aviso
  apareció, «Entendido» lo cerró y quedó en la base (`aviso_privacidad_version = 2026-11-03` con fecha); pie con V1.1.0
  en `/tecnico` y en el formulario (con espacio para la barra); `/privacidad` y `/condiciones` responden 200 sin sesión;
  `/login` muestra el pie. **No verificado:** en teléfono, con supervisor/planificador/administrador en navegador, ni en el
  sitio publicado; la foto sin EXIF no se comprobó con una foto real con GPS (el canvas no copia metadatos).
- **Pendiente / riesgos:** **aplicar la migración `0020` en el Supabase remoto ANTES de unir el PR** (ver Decisiones). Si
  no se aplica, la app sigue funcionando pero el aviso no aparece. Los textos legales quedaron redactados sobre lo que la
  app hace realmente; si Bbosch/MLP tienen un texto corporativo, reemplazarlo y subir `VERSION_AVISO_PRIVACIDAD`.
  Quedó abierto de antes un `next start -p 3100` (proceso de otra sesión, no se tocó).

### 2026-11-03 · [WEB] El técnico ve el PDF dentro de la app con Compartir, Guardar y Salir
- **Autor:** Cristóbal (con Claude) · rama `fix/visor-pdf-tecnico`
- **Problema (informado por el usuario en el celular):** al tocar «Descargar PDF» en el perfil de técnico, el PDF se abría
  a pantalla completa y no había forma de volver, salir ni enviarlo. Causa: el botón abría `/tecnico/{id}/pdf` con
  `target="_blank"`; en la app instalada (sin barra del navegador) eso deja el PDF sin ningún control.
- **Qué se hizo:** el botón pasa a **«Ver PDF»**: descarga el PDF con `fetch` (misma sesión, mismo permiso por RLS) y lo
  muestra en un visor propio a pantalla completa (`visor-pdf.tsx`) con tres botones siempre visibles: **Compartir** (hoja del
  teléfono: WhatsApp, correo, «Guardar en Archivos»…; solo si el navegador admite compartir archivos), **Guardar** (descarga
  el archivo con su nombre; en iPhone/iPad usa la hoja de compartir con el aviso «Elija Guardar en Archivos», porque una
  descarga desde la app instalada vuelve a dejar el PDF sin salida) y **Salir**. El botón «atrás» del teléfono y Escape
  también cierran el visor (entrada de historial con `history.pushState`, que Next 16 integra a su router). Vista previa
  dentro de la app solo si el navegador puede mostrar PDF (`navigator.pdfViewerEnabled`); si no (Android), se muestra
  «PDF listo» con instrucciones. Mientras se genera: «Preparando PDF…»; los errores del servidor se muestran con su texto.
- **Archivos:** `src/components/tecnico/boton-pdf.tsx`, `src/components/tecnico/visor-pdf.tsx` (nuevo),
  `src/lib/tecnico/pdf.ts` y `pdf.test.ts` (nuevos: nombre desde `Content-Disposition`, detección de iOS).
- **Verificación:** lint y tsc sin errores · `test` 243/243 (7 nuevos) · `build` correcto. En Chrome de escritorio contra la
  app local compilada (`next start`) con `TECNICO_A`: «Ver PDF» abrió el visor con el nombre del archivo, las 4 páginas y
  los tres botones; «atrás» del navegador y «Salir» lo cerraron quedando en `/tecnico` **sin recargar la página**.
  **No verificado:** en iPhone ni en Android (Compartir, Guardar, vista previa en iOS y el «atrás» de Android), ni en el
  sitio publicado. Compartir y Guardar no se probaron en el PC (abren el diálogo del sistema y una descarga).
- **Pendiente / riesgos:** en iPhone la vista previa depende de que Safari informe `pdfViewerEnabled`; si informa `false`
  se verá «PDF listo» sin vista previa (Compartir muestra igual la vista del archivo). Supervisor, planificador y
  administrador siguen con la descarga directa (no se pidió cambiarla); si la usan desde la app instalada en el teléfono
  tendrían el mismo problema.

### 2026-11-03 · [WEB] Bitácora al día con todas las mejoras
- **Autor:** Cristóbal (con Claude) · rama `docs/bitacora-al-dia`
- **Qué se hizo:** a pedido del usuario se puso al día lo que había quedado atrasado: «Estado actual» (resumen al
  2026-11-03; filas de la tabla que aún decían «migración sin aplicar» o «solo administrador»; filas nuevas para la bandeja
  con carpetas y el filtro «Tipo de trabajo» de Manuel, el PDF con recuadro por página, el mensaje de error del catálogo y
  el estado real de la auditoría con las skills de Vercel Labs), la verificación global (236 tests), «Pendientes» (31 y 38
  cerrados, 22, 29 y 33 corregidos, 45 nuevo) y «Decisiones» (aplicar migraciones remotas antes de unir; «formatos en
  código» reemplazado por la tabla).
- **Archivos:** `docs/BITACORA.md`.
- **Verificación:** solo documentación; los datos salen del propio registro, de `gh pr list` (PR #1 a #10 unidos) y de la
  consulta al remoto del 2026-11-03. No se corrieron lint/tsc/tests/build porque no cambia código.
- **Pendiente / riesgos:** ninguno nuevo.

### 2026-11-03 · [WEB] El técnico ve el error real cuando el servidor no entrega el catálogo
- **Autor:** Cristóbal (con Claude) · rama `fix/error-catalogo-visible`
- **Diagnóstico (comprobado en el SQL Editor del remoto, solo lectura):** tras unir el PR #9 a `main`, en el sitio publicado
  el técnico veía «Sin catálogo local. Conéctese a internet…». Causa: **el Supabase remoto no tiene ninguna de las
  migraciones `0015` a `0019`** (`to_regclass('public.formatos')` = NULL, columna `form_templates.change_note` y funciones
  `form_templates_set_published_at` y `crear_formato` inexistentes). La descarga del catálogo fallaba, el error se
  ocultaba y la copia local antigua (sin `formatos`) se descarta a propósito, así que el mensaje pedía "conectarse".
- **Qué se hizo:** `loadCatalog` registra el error en la consola y, si hay red y el servidor responde con error, muestra
  «El servidor no entregó el catálogo de formatos: <error>. Avise al administrador.» en vez de pedir conexión
  (`mensajeSinCatalogo`). Un `TypeError` de `fetch` (sin conexión real) sigue mostrando el mensaje de conexión.
- **Archivos:** `src/lib/tecnico/catalog.ts`, `src/lib/tecnico/catalog.test.ts`, `src/components/tecnico/nueva-inspeccion.tsx`.
- **Verificación:** lint OK, tsc OK, tests 236/236, build OK. **No verificado en navegador ni en el sitio publicado.**
- **Migraciones aplicadas en el remoto (2026-11-03):** `0015` a `0019`, en orden y en una sola transacción
  (`begin … commit`), pegadas en el SQL Editor de `inspecciones-bbosch`; resultado «Success. No rows returned».
  Comprobado después con una consulta: `formatos` = 60 filas, 60 activas y 60 con plantilla publicada; columnas
  `change_note` y `created_by` en `form_templates`; funciones `crear_formato`, `form_templates_set_published_at` y
  `formatos_touch`; política `formatos_write` = `is_admin() OR is_supervisor()`; `crear_formato` en la versión de la `0019`.
- **Pendiente / riesgos:** **no verificado en el sitio publicado ni en el iPhone** que el técnico ya vea el catálogo
  (debería bastar con recargar la app). Lección: aplicar las migraciones en el remoto **antes** de unir un PR que las necesita.

### 2026-11-03 · [WEB] Simulación de los 60 formatos con PDF y contexto para revisión en Cowork
- **Autor:** Cristóbal (con Claude) · rama `perf/arranque-movil`
- **Qué se hizo:** script `scripts/simular-formatos.mjs`: entra como `TECNICO_A` a la app **local** (se niega a correr si `NEXT_PUBLIC_SUPABASE_URL` no es local), y por cada formato disponible envía una inspección por el mismo camino que la app (fotos y firma sintéticas a Storage + `submit_inspection`) en dos escenarios, «conforme» y «con hallazgos» (hasta 3 ML con severidad y foto, NA, secciones repetibles con 2 copias), descarga el PDF de `/tecnico/{id}/pdf` y escribe `RESUMEN.md`. Opciones: carpeta de salida, `--solo=INSP-01,MANT-03`, `--url=`. Lee los formatos de la tabla `formatos`. Se preparó `CONTEXTO_COWORK_REVISION_FORMATOS.md` (proyecto, nomenclatura, anatomía esperada del PDF, lista de verificación, tabla de los 60 formatos con secciones/ítems/estados, qué no es falla) junto a los PDF. A pedido del usuario se borraron de la base local las 3 inspecciones sin turno (`INS-2026-000007` a `000009`) con `delete_inspections`.
- **Archivos:** `scripts/simular-formatos.mjs`. Los PDF y el contexto están fuera del repositorio, en `C:\Proyectos\simulacion-formatos\2026-11-03\`.
- **Verificación:** 120/120 PDF generados sin errores de envío ni de generación (promedio 3,4 páginas; mínimo 1: INSP-10, 19 y 21 conforme; máximo 11: INSP-28 con hallazgos). **No verificado el aspecto visual** (no había `pdftoppm` para renderizarlos): la revisión visual queda para Cowork.
- **Pendiente / riesgos:** las imágenes y textos son sintéticos (no prueban contenido real largo, fotos verticales ni firmas de supervisor/planificador). El conteo de páginas es aproximado.

### 2026-11-03 · [WEB] Rendimiento: la app abre rápido desde el icono del iPhone
- **Autor:** Cristóbal (con Claude) · rama `perf/arranque-movil` (sale de `feat/crear-formatos`)
- **Diagnóstico (medido):** en el sitio publicado `x-vercel-id: gru1::iad1`: la petición entra por São Paulo pero las funciones corren en Washington (iad1) y Supabase está en São Paulo, así que cada consulta cruzaba el continente; la raíz `/` tardaba **2,2 s**. Además, cada página hacía 4 consultas seguidas solo para validar la sesión (proxy y layout repetían usuario y perfil); el icono abría `/`, que renderizaba una página solo para redirigir; y al abrir se recargaban 3 páginas para uso sin red en paralelo con la carga.
- **Qué se hizo:** (1) `vercel.json` con `regions: ["gru1"]`. (2) El proxy valida la sesión con `getClaims()` (sin ir a Supabase Auth si el proyecto usa claves asimétricas) y lee el perfil **una vez**; pasa la identidad verificada en cabeceras internas (`src/lib/auth/cabeceras.ts`) que `getSession()` usa sin volver a consultar. Las cabeceras que traiga el cliente se borran siempre. (3) El proxy resuelve `/` y `/login` con sesión redirigiendo a la home del rol, sin renderizar. (4) `start_url` del manifiesto = `/tecnico` (el service worker la tiene guardada, abre aunque no haya red). (5) El precalentado de páginas sin red se hace cuando el teléfono queda ocioso (`src/lib/offline/reposo.ts`). (6) Espera máxima de red del service worker: 3 s (antes 4). (7) Cascadas eliminadas: detalle de inspección (plantilla embebida y URL firmadas de fotos y firmas a la vez), lista y editor de Formatos.
- **Archivos:** `vercel.json`, `src/proxy.ts`, `src/lib/supabase/proxy.ts`, `src/lib/auth/{cabeceras,session}.ts` y `cabeceras.test.ts`, `src/app/{manifest,sw}.ts`, `src/lib/offline/{paginas,reposo}.ts`, `src/components/tecnico/tecnico-provider.tsx`, `src/lib/revision/queries.ts`, `src/lib/formatos/plantillas.ts`, `docs/DEPLOY_VERCEL.md`.
- **Verificación:** lint, typecheck y build en verde; 232 tests (4 nuevos de cabeceras). **Prueba de rendimiento antes/después** con dos compilaciones de producción (la versión anterior en una copia aparte del repositorio) contra Supabase local con un intermediario que agrega **120 ms por llamada** (simula Washington↔São Paulo) y cuenta las llamadas; mediana de 10: técnico abre el icono **1.102 → 150 ms (−86 %)**, llamadas a Supabase 8 → 1, redirecciones 1 → 0; `/tecnico` 539 → 146 ms (4 → 1); bandeja del supervisor 537 → 278 ms (5 → 2); detalle de inspección 671 → 416 ms (12 → 8); Formatos 540 → 279 ms; PDF 1.388 → 875 ms (16 → 12). **Seguridad:** con cabeceras falsas de administrador, sin sesión → redirige a `/login`; con sesión de técnico → redirige a `/tecnico` y la página no muestra el nombre inyectado.
- **Pendiente / riesgos:** **no verificado en el sitio publicado ni en un iPhone real** (requiere desplegar; comprobar `x-vercel-id: gru1::gru1` como indica `docs/DEPLOY_VERCEL.md`, y si el plan de Vercel no permite elegir región, esa mejora no aplica). Si el Supabase remoto usa clave JWT simétrica, `getClaims()` sigue consultando Auth (igual que antes, sin pérdida). En iPhone, el icono ya guardado puede seguir abriendo la URL antigua: **conviene borrarlo y volver a agregarlo** a la pantalla de inicio. El JavaScript del técnico pesa ~321 KB comprimidos (React 70 KB, cliente de Supabase con realtime 66 KB, Zod 31 KB, Dexie): queda en caché del service worker tras la primera visita; reducirlo exige cambios mayores (cargar Supabase bajo demanda, `zod/mini`). El script de rendimiento quedó fuera del repositorio.

### 2026-11-03 · [WEB] Formatos en blanco con estructura estándar y campos propios en la cabecera
- **Autor:** Cristóbal (con Claude) · rama `feat/crear-formatos`
- **Qué se hizo:** en «Nuevo formato» se elige **«Partir de»: en blanco con la estructura estándar** o copia de un formato existente. En blanco trae la cabecera estándar (TAG Equipo, N° OT, Ubicación, Fecha, Hora inicio y Hora término, tal como la tienen los formatos actuales), las tres firmas de los 60 formatos (Encargado de la actividad, Supervisor Bbosch, Planificador Bbosch), la leyenda de estados según el tipo (inspección BN/ML/NT/NA/NR; mantención RL/NR/BN/ML/RMP/NT) y una «Sección 1» con una primera pregunta; las preguntas se agregan una a una en el editor. El nombre del técnico, la firma del encargado y los participantes los sigue agregando la app en todos los formatos. El **editor** tiene ahora una tarjeta «Cabecera»: los campos estándar se ven fijos y se pueden **agregar, renombrar, marcar como obligatorios y quitar campos propios** del equipo (texto, número o fecha), que en el informe salen en la ficha de datos.
- **Archivos:** `supabase/migrations/0019_crear_formato_en_blanco.sql`, `src/lib/formatos/estandar.ts` y `estandar.test.ts`, `src/lib/formatos/{editor,nuevo,crear-actions}.ts`, `src/lib/formatos/nuevo.test.ts`, `src/components/formatos/{editor-formato,nuevo-formato,pagina-nuevo-formato,pagina-formato}.tsx`, `supabase/tests/formatos.test.sql`.
- **Verificación:** lint, typecheck y build en verde; 228 tests (9 nuevos); `supabase test db` en verde (28 de formatos; 3 nuevos: el supervisor crea en blanco, toma el modo según el tipo, en blanco sin plantilla se rechaza). En un servidor de producción aparte (puerto 3100) con la sesión del supervisor: creó INSP-42 en blanco (cabecera estándar, 3 firmas, 1 sección), publicó la v2 con campos «Marca» y «Potencia (kVA)», preguntas de verificación, número y foto y una sección nueva; el servidor rechazó quitar «N° OT»; lo activó y la simulación del técnico lo envió con Marca y Potencia en la cabecera y generó los 2 PDF (quedaron en `C:\Proyectos\simulacion-formatos\prueba-blanco\` para revisarlos). Datos de prueba borrados de la base.
- **Pendiente / riesgos:** sin probar con clics. **Migración 0019 sin aplicar en el remoto** (después de la 0018). No se pueden editar las firmas, la leyenda ni las lecturas destacadas de un formato, ni cambiar el tipo de un campo de cabecera ya publicado. El servidor `npm run dev` abierto debe reiniciarse antes de probar.

### 2026-11-03 · [WEB] El supervisor también crea, activa y desactiva formatos
- **Autor:** Cristóbal (con Claude) · rama `feat/crear-formatos`
- **Qué se hizo:** por decisión del usuario (opción B), el **supervisor** gestiona los formatos igual que el administrador: botón «Nuevo formato» (`/supervisor/formatos/nuevo`) y botones «Desactivar» / «Reactivar» en su pestaña «Formatos». El planificador y el técnico siguen sin poder. La página de creación pasó a un componente común para ambos paneles.
- **Archivos:** `supabase/migrations/0018_supervisor_gestiona_formatos.sql` (escritura de `formatos` y `crear_formato` para supervisor o administrador; no se editó la 0017), `src/lib/formatos/{crear,activo}-actions.ts`, `src/components/formatos/{pagina-nuevo-formato,nuevo-formato,boton-activo,lista-formatos,pagina-formato}.tsx`, `src/app/{admin,supervisor}/formatos/nuevo/page.tsx`, `src/app/supervisor/formatos/page.tsx`, `supabase/tests/formatos.test.sql`.
- **Verificación:** lint, typecheck y build en verde; 219 tests; `supabase test db` en verde (25 pruebas de formatos: el supervisor ya puede desactivar y crear; el planificador y el técnico no). En un servidor de producción aparte (puerto 3100) con sesiones reales: el supervisor ve «Nuevo formato» y 60 botones, creó INSP-42, lo activó y desactivó y abrió su editor; el planificador fue rechazado y no creó nada. Datos de prueba borrados (60 formatos, 60 tipos de equipo y 60 plantillas, como antes).
- **Pendiente / riesgos:** el servidor `npm run dev` que estaba abierto siguió ejecutando la versión anterior de la acción de crear (respondía «Solo un administrador…») aunque el archivo ya había cambiado: **hay que reiniciarlo** (Ctrl+C y `npm run dev`) antes de probar. **Migración 0018 sin aplicar en el remoto** (va después de la 0017). Sin probar con clics.

### 2026-11-03 · [WEB] Formatos: crear un formato nuevo copiando otro (paso 3 de 3)
- **Autor:** Cristóbal (con Claude) · rama `feat/crear-formatos` (sale de `feat/desactivar-formatos`: unir antes los PR del editor, del catálogo y de desactivar)
- **Qué se hizo:** botón «Nuevo formato» en la pestaña «Formatos» del **administrador** (`/admin/formatos/nuevo`). Se elige tipo (inspección o mantención), el formato **del mismo tipo** cuyo contenido se copia, número (propone el siguiente libre: INSP-42, MANT-21), título, norma y revisión del documento, familia, áreas (ninguna = transversal), designadores de TAG, si identifica un equipo o un tramo y si admite varios equipos (al elegir el origen se proponen sus valores). Al crear se abre el editor. El formato **nace desactivado**, para ajustarlo antes de que lo vean los técnicos; se activa desde la lista. La función `crear_formato` hace todo en una transacción: tipo de equipo propio (`fmt_insp_42`), plantilla v1 copiada de la vigente del origen con el título y la norma nuevos, y la fila del formato.
- **Archivos:** `supabase/migrations/0017_crear_formato.sql`, `src/lib/formatos/{nuevo,crear-actions}.ts` y `nuevo.test.ts`, `src/components/formatos/{nuevo-formato,lista-formatos}.tsx`, `src/app/admin/formatos/nuevo/page.tsx`, `supabase/tests/formatos.test.sql`.
- **Verificación:** lint, typecheck y build en verde; 219 tests (6 nuevos); `supabase test db` en verde (6 nuevos: el supervisor no puede crear; el administrador sí, nace desactivado y con la norma nueva; no repite id; no copia de otro tipo). En la app local: la página responde al administrador y redirige al supervisor; la acción rechazó la norma vacía y el id repetido y creó INSP-42 copiando INSP-12; la lista lo mostró desactivado y el editor abrió con la norma nueva. Activado, la simulación del técnico lo envió y generó su PDF (2/2). Después se borraron de la base local el formato, su plantilla, su tipo de equipo y las 2 inspecciones.
- **Pendiente / riesgos:** **no probado con clics** (formulario probado por HTTP). **La migración 0017 no está aplicada en el Supabase remoto** (después de la 0015 y la 0016). No se pueden copiar formatos entre inspección y mantención, ni crear uno desde cero. La función se reaplicó en local tras cambiar que el formato nazca desactivado (aún no estaba commiteada ni en el remoto). El tipo de equipo creado no se borra si luego se desactiva el formato (queda sin uso visible).

### 2026-11-03 · [WEB] Formatos: desactivar y reactivar (paso 2 de 3)
- **Autor:** Cristóbal (con Claude) · rama `feat/desactivar-formatos` (sale de `feat/catalogo-formatos-bd`: unir antes los PR del editor y del catálogo)
- **Qué se hizo:** en la pestaña «Formatos» el **administrador** tiene un botón «Desactivar» / «Reactivar» por formato, con confirmación que explica el efecto. Un formato desactivado deja de ofrecerse al técnico en el flujo de 4 pasos (y una familia sin formatos activos deja de mostrarse), pero **no se borra nada**: sus inspecciones, PDF y versiones se conservan, los borradores ya empezados se pueden terminar y se puede reactivar. En la lista aparece con la etiqueta «Desactivado» para los tres roles, y el detalle del formato lo avisa. Supervisor y planificador no ven el botón.
- **Archivos:** `src/lib/formatos/activo-actions.ts`, `src/components/formatos/{boton-activo,lista-formatos,pagina-formato}.tsx`, `src/app/admin/formatos/page.tsx`. Sin migración nueva (usa la columna `activo` de la 0016).
- **Verificación:** lint, typecheck y build en verde; 213 tests (el filtro de formatos desactivados ya estaba probado en `catalogo.test.ts`). En la app local con sesiones reales: 60 botones en el panel del administrador y ninguno en el del supervisor; la acción rechazó al supervisor y un id inválido; el administrador desactivó INSP-12, el técnico lo leyó como inactivo, la lista del supervisor mostró «Desactivado» y el detalle el aviso; después se reactivó (la base quedó con 0 formatos desactivados).
- **Pendiente / riesgos:** **no probado con clics** (el diálogo de confirmación del navegador y el refresco de la lista se probaron por HTTP, no con el ratón). Un técnico **sin red** sigue viendo el formato hasta que vuelva a descargar el catálogo con conexión. Paso siguiente: 3) crear formatos nuevos copiando uno existente.

### 2026-11-03 · [WEB] Catálogo de formatos en la base de datos (paso 1 de 3, sin cambios visibles)
- **Autor:** Cristóbal (con Claude) · rama `feat/catalogo-formatos-bd` (sale de `feat/editor-formatos`: unir primero ese PR)
- **Qué se hizo:** los 60 formatos (título, familia, áreas, designadores de TAG, tag/tramo, varios equipos y plantilla) pasan de `src/lib/formatos/catalogo.ts` a la tabla `public.formatos`. `catalogo.ts` conserva los tipos y los filtros, que ahora reciben la lista. El técnico recibe los formatos con el catálogo que ya descarga y guarda en el equipo; la pestaña «Formatos» y la publicación los leen en el servidor. Se agregó la columna `activo` (un formato desactivado deja de ofrecerse, pero se sigue encontrando para borradores e historial), que usará el paso 2. Lectura para todos los usuarios autenticados; escritura solo para el administrador.
- **Archivos:** `supabase/migrations/0016_catalogo_formatos.sql` (tabla, RLS y los 60 formatos generados desde el código), `src/lib/formatos/{catalogo,semilla,plantillas,publicar-actions}.ts`, `src/lib/tecnico/catalog.ts`, `src/components/tecnico/{nueva-inspeccion,formulario}.tsx`, tests de catálogo y plantillas (leen los formatos desde la migración con `semilla.ts`), `supabase/tests/formatos.test.sql`, `CLAUDE.md`.
- **Verificación:** lint, typecheck, build en verde; 213 tests; `supabase test db` en verde (5 pruebas nuevas: el técnico lee los 60, no puede crear; el supervisor no puede desactivar; el administrador sí). Comprobado que los 60 formatos de la migración son **idénticos** a los del código anterior (comparación objeto por objeto). Con la base local y la sesión del técnico, `loadCatalog` devuelve exactamente esos 60, los filtros por área/trabajo/familia dan lo mismo que antes, sin red usa la copia guardada y descarta una copia antigua sin formatos. Las páginas de «Formatos» siguen respondiendo en los tres roles y la simulación envió y generó el PDF de INSP-03, INSP-19 y MANT-20 (6/6).
- **Pendiente / riesgos:** **no probado con clics en el navegador del técnico** (el flujo de 4 pasos se verificó con su función de carga contra la base real, no en pantalla). Un técnico con un catálogo guardado de antes de este cambio necesita **conectarse una vez** para volver a descargarlo; sin red verá «Sin catálogo local». **La migración 0016 no está aplicada en el Supabase remoto** (pegarla en el SQL Editor después de la 0015 y antes de publicar esta versión de la app: sin la tabla, el técnico no podrá cargar el catálogo). Quedaron en la base local 6 inspecciones de simulación de esta prueba. Pasos siguientes: 2) activar/desactivar formatos desde la pestaña (administrador); 3) crear formatos nuevos copiando uno existente.

### 2026-11-03 · [WEB] Pestaña «Formatos»: editar los formatos desde la app (versiones nuevas)
- **Autor:** Cristóbal (con Claude) · rama `feat/editor-formatos`
- **Qué se hizo:** nueva pestaña «Formatos» junto a Bandeja y Fallas en los paneles de supervisor, administrador y planificador. Lista los 60 formatos con su versión vigente; al entrar, el **supervisor y el administrador** pueden cambiar títulos de secciones y textos de ítems, ayudas, unidades, rangos y obligatoriedad, **agregar, quitar y reordenar** secciones e ítems nuevos (verificación, número, texto, foto) y publicar. El **planificador solo consulta** (con historial). Publicar = insertar la **versión siguiente** (`version + 1`) con una nota obligatoria; la versión anterior no se toca, por lo que las inspecciones ya enviadas conservan su versión y su PDF. Antes de publicar se muestra el resumen de cambios. Si otra persona publicó mientras tanto, se rechaza (control por `versionBase`).
- **Reglas que protegen los datos:** el `id` y el tipo de lo que ya existe no cambian; los ids nuevos se generan solos (únicos, sin `__`); no se pueden cambiar la cabecera, los roles, las lecturas ni los estados, ni los campos de una placa, ni si una sección es repetible; no se puede quitar un ítem que alimenta una lectura del informe ni dejar una sección vacía. El servidor revalida todo (`problemasDeEdicion`), no confía en el navegador.
- **Archivos:** `supabase/migrations/0015_editor_formatos.sql` (escritura de plantillas también para el administrador, columnas `created_by` y `change_note`, fecha de publicación al insertar), `supabase/tests/formatos.test.sql`, `src/lib/formatos/{editor,plantillas,publicar-actions}.ts` y `editor.test.ts`, `src/components/formatos/*`, `src/app/{admin,supervisor,planificador}/formatos/**`, y los tres `layout.tsx`.
- **Verificación:** lint, tsc y build en verde; 210 tests (26 nuevos del editor); `supabase test db` 52/52 (10 nuevos: el técnico y el planificador no publican, el supervisor y el administrador sí, lo publicado sigue inmutable). En la app local, con sesiones reales: las páginas responden 200 en los tres roles (planificador en solo lectura) y 404 para un formato inexistente; la acción de publicar rechazó nota vacía, versión base vieja, cambio de roles y al planificador, y publicó la v2 de INSP-12 con un texto editado y una sección nueva; el catálogo del técnico pasó a la v2, una inspección nueva guardó la respuesta del ítem agregado y una inspección hecha con la v1 sigue dando su PDF. Los datos de prueba (v2 e inspecciones) se borraron de la base local.
- **Pendiente / riesgos:** **no probado con clics en un navegador** (el editor se probó por HTTP y con tests, no con ratón: conviene que alguien lo recorra y confirme el diálogo de publicación, los botones de subir/bajar y el aviso al salir con cambios). Falta una **vista previa del formulario tal como lo ve el técnico** (hoy solo se ve el resumen de cambios). **La migración 0015 no está aplicada en el Supabase remoto:** hay que pegarla en el SQL Editor antes de usar la pestaña en el sitio publicado. Quedó fuera: crear formatos nuevos o cambiar su nombre/área/familia (viven en `catalogo.ts`), editar cabecera, roles, lecturas y estados, y cambiar el tipo de un ítem existente. Quien edite contenido normativo debe actualizar a mano la revisión del documento oficial. Los técnicos con el catálogo en caché ven la versión nueva al volver a abrir el formato con conexión.

### 2026-11-01 · [WEB] PDF: las tablas siguen en la página siguiente con un recuadro cerrado por página
- **Autor:** Manuel (con Claude) · rama `feat/bandeja-carpetas-turno`
- **Qué se hizo:** a pedido de Manuel, cada tabla de ítems del PDF ya no salta entera a la página siguiente (dejaba la primera hoja casi vacía): empieza justo bajo «Resultado de la inspección» y lo que no cabe continúa en la hoja siguiente. Cada página lleva su propio recuadro **cerrado** (no un marco abierto cortado). Se logra con dos pasadas: la primera anota en qué página cae cada fila (`render` de react-pdf) y la segunda dibuja un recuadro por página (`break` entre tramos). La pasada de medición deja 16 pt libres al pie de cada página para el cierre y la apertura de los recuadros. Las filas nunca se cortan por la mitad; el título de la tabla va solo en el primer tramo y siempre junto con la primera fila. Reemplaza la regla del 31-10 («la tabla viaja entera»): `paginado.ts` ya no estima alturas.
- **Archivos:** `src/components/informe/informe-pdf.tsx`, `src/lib/informe/generar.tsx`, `src/lib/informe/paginado.ts`, `paginado.test.ts`
- **Verificación:** lint, tsc, 184 tests y build en verde. Se generaron PDF de prueba fuera de la app (copia del INS-2026-000022 y un caso de 50 + 10 ítems en 4 páginas) y se revisaron como imagen: recuadros cerrados en cada página, ninguna fila cortada. Con la app: no verificado tras este último cambio (lo revisa Manuel).
- **Pendiente / riesgos:** generar el PDF cuesta dos renderizados (algo más lento). Si una fila quedara justo en el borde, la holgura de 16 pt evita que cambie de página entre pasadas; no se probó con fotos ni con lecturas. Ojo: en local, `next dev` a veces sigue usando el código viejo del PDF; reiniciar el servidor.

### 2026-11-01 · [WEB] Bandeja: buscador más compacto, «Tipo de trabajo» se aplica al elegir, etiqueta Inspección/Mantención en fallas
- **Autor:** Manuel (con Claude) · rama `feat/bandeja-carpetas-turno`
- **Qué se hizo:** el buscador de la bandeja pasa de grilla a una fila con anchos fijos (en el celular se apilan). El filtro se llama **«Tipo de trabajo»** (opciones «Inspecciones y mantenciones», «Solo inspecciones», «Solo mantenciones»), tiene flecha visible, se pinta en cobre cuando está activo y, en la bandeja, se aplica al elegir (nuevo `SelectAuto`, que envía el formulario; sin JavaScript se usa «Buscar»); el select «Turno» de la lista completa también. En «Equipos con fallas» cada hallazgo muestra la etiqueta «Inspección» o «Mantención», porque el folio «INS-…» se usa para ambos y confundía.
- **Archivos:** `src/components/revision/bandeja.tsx`, `select-auto.tsx` (nuevo), `filtros-fallas.tsx`, `fallas-equipos.tsx`
- **Verificación:** lint, tsc, 184 tests y build en verde. En pantalla lo revisó Manuel (buscador y filtro); la etiqueta de fallas no se vio en pantalla.
- **Pendiente / riesgos:** propuesto y sin decidir: folio propio para mantenciones (p. ej. «MAN-…»), requiere migración nueva.

### 2026-11-01 · [WEB] Filtro «Tipo» (inspecciones / mantenciones) en la bandeja y en «Equipos con fallas»
- **Autor:** Manuel (con Claude) · rama `feat/bandeja-carpetas-turno`
- **Qué se hizo:** nuevo filtro **Tipo** con tres opciones, «Inspecciones y mantenciones», «Inspecciones» y «Mantenciones», junto a «Gestión» en «Equipos con fallas» (se aplica al elegir) y en el buscador de la bandeja del supervisor y del planificador (se aplica con «Buscar»). Funciona dentro de cada carpeta de turno y de área y también en la lista completa. El tipo sale del modo de trabajo del formato: «Mantenimiento programado» es mantención; «Inspección según Plan Matriz», inspección. El filtro viaja en la URL.
- **Archivos:** `src/lib/revision/carpetas.ts`, `consulta.ts`, `fallas.ts`, `queries.ts` (lee el modo de los hallazgos), `src/components/revision/filtros-fallas.tsx`, `bandeja.tsx`, `detalle.tsx`, y sus tests.
- **Verificación:** lint, tsc, 184 tests (4 nuevos) y build en verde; la consulta de hallazgos con el modo devuelve datos reales contra el Supabase local («Mantenimiento programado» en el hallazgo de MANT-20). Vista en pantalla: no verificada (la hace Manuel).
- **Pendiente / riesgos:** el tipo se deduce del **nombre** del modo de trabajo; si se renombra un modo y deja de decir «Mantenimiento», sus formatos contarían como inspecciones. En la bandeja, elegir un tipo cuenta como búsqueda («Limpiar búsqueda» lo quita y vuelve a la carpeta).

### 2026-11-01 · [WEB] «Equipos con fallas» también con carpetas por turno y por área
- **Autor:** Manuel (con Claude) · rama `feat/bandeja-carpetas-turno`
- **Qué se hizo:** la pestaña «Equipos con fallas» del supervisor y del planificador se abre ahora igual que la bandeja: carpetas **Turno A** y **Turno B** y, dentro, **Chacay-Mina** y **Puerto-Mauro**. Cada tarjeta muestra cuántos equipos y hallazgos hay y cuántos están pendientes de gestión. Dentro de la carpeta siguen los filtros de severidad, área (solo las de esa carpeta) y gestión; «Ver todos en una lista» los junta. Cada hallazgo cae en la carpeta del turno de la cuenta de técnico que envió la inspección. El administrador conserva la lista plana. Antes, en el equipo de Manuel, la pestaña daba «Could not find a relationship between findings and finding_followups»: faltaba aplicar las migraciones `0013` y `0014` en su Supabase local (se aplicaron a mano, sin borrar datos).
- **Archivos:** `src/lib/revision/fallas.ts` (+ test), `src/lib/revision/queries.ts` (lee `technician_shift`), `src/components/revision/fallas-equipos.tsx`, `filtros-fallas.tsx`, `carpetas-bandeja.tsx` (tarjeta genérica), `bandeja.tsx`, `detalle.tsx`, `src/app/{supervisor,planificador}/fallas/page.tsx`
- **Verificación:** lint, tsc, 180 tests (2 nuevos) y build en verde; la consulta de hallazgos con el turno devuelve datos reales contra el Supabase local. Vista en pantalla: no verificada (la hace Manuel).
- **Pendiente / riesgos:** igual que la bandeja: «Otras áreas» (Valle) y «Sin turno» solo aparecen si hay hallazgos. El turno es el de la cuenta, no el de quien realizó la inspección. Prueba 28 de pgTAP falla en el equipo de Manuel por datos de prueba (el técnico B ya tiene una inspección firmada); un `supabase db reset` la deja en verde.

### 2026-11-01 · [WEB] Bandeja del supervisor y del planificador con carpetas por turno y por área
- **Autor:** Manuel (con Claude) · rama `feat/bandeja-carpetas-turno`
- **Qué se hizo:** la bandeja de entrada del supervisor y del planificador se abre ahora en dos carpetas, **Turno A** y **Turno B**, y dentro de cada una **Chacay-Mina** y **Puerto-Mauro**. Cada tarjeta muestra cuántas inspecciones hay y cuántas le tocan firmar a quien mira. Son vistas, no copias: la inspección cae sola en su carpeta según el turno de la cuenta de técnico que la envió (`technician_shift`) y su área (Chacay y Mina juntas; Puerto y Mauro juntas). Dentro de la carpeta se mantiene la lista de siempre (filtros por estado, búsqueda, fechas) con una ruta «Bandeja › Turno A › Chacay-Mina». «Buscar o ver todas en una lista» (o cualquier búsqueda) muestra todo junto sin pasar por las carpetas. El administrador conserva la lista plana de siempre.
- **Archivos:** `src/lib/revision/carpetas.ts` (nuevo, con test), `src/components/revision/carpetas-bandeja.tsx` (nuevo), `src/components/revision/bandeja.tsx`, `src/lib/revision/consulta.ts` (+ test), `src/app/supervisor/page.tsx`, `src/app/planificador/page.tsx`
- **Verificación:** lint, tsc, 178 tests (5 nuevos) y build en verde. Vista en pantalla con las cuentas de supervisor y planificador: no verificada (la hace Manuel en localhost).
- **Pendiente / riesgos:** (1) Valle no tiene carpeta propia: sus inspecciones aparecen en una tercera carpeta «Otras áreas» solo cuando existen, y las que no tengan turno en «Sin turno»; confirmar si Valle debe ir en alguna de las dos carpetas. (2) Se ve el turno de la **cuenta** del técnico, no el de quien realizó la inspección. (3) Las carpetas se calculan sobre las últimas 1.000 inspecciones que carga la bandeja.

### 2026-10-31 · [WEB] Las 60 plantillas cargadas en el Supabase remoto (el sitio publicado ya muestra todos los formatos)
- **Autor:** Cristóbal (con Claude) · rama `docs/bitacora-migraciones-remotas`
- **Qué se hizo:** el sitio de Vercel mostraba pocos formatos porque las plantillas viven en la tabla `form_templates` de Supabase y no viajan con `git push`; en el remoto solo estaba la de `seed_catalogo.sql`. Cristóbal ejecutó en el SQL Editor (superusuario `postgres`) `seed_plantillas_insp.sql`, `seed_plantillas_insp_16_41.sql` y `seed_plantillas_mant.sql`. Como el editor rechazó los archivos grandes («request entity too large»: 100, 253 y 283 KB), se partieron en 19 trozos de menos de 45 KB cada uno (cortados en sentencias completas; unidos dan el contenido idéntico al original) y se ejecutaron en orden.
- **Archivos:** ninguno del repositorio (solo datos en Supabase remoto; los trozos quedaron en el directorio temporal de la sesión y no se versionan).
- **Verificación:** consulta de solo lectura en el Supabase remoto (`inspecciones-bbosch`): `mantenimiento_programado` = 20 plantillas publicadas en 20 tipos de equipo y `plan_matriz` = 40 en 40 (60 en total, sin duplicados). **No verificado:** que el contenido de cada plantilla coincida ítem por ítem con el Word, ni que cada formato abra en el sitio publicado.
- **Pendiente / riesgos:** (1) `seed_catalogo.sql` **no se puede repetir** aunque su cabecera diga lo contrario: los `insert` de `equipment_types` y `work_modes` no llevan `on conflict` y la plantilla de transformador de piso se duplicaría; al reejecutarlo dio `equipment_types_code_key` (no cambió nada, falló entero). (2) El seed no sobrescribe plantillas ya publicadas: para cambiar un formato en el remoto hace falta una **versión 2** (no hay procedimiento automatizado). (3) Cada vez que se agreguen formatos hay que cargar su seed en el remoto a mano; `git push` no lo hace.

### 2026-10-31 · [WEB] Cierre de la jornada: lo pendiente queda anotado antes de reiniciar el equipo
- **Autor:** Cristóbal (con Claude) · rama `docs/bitacora-migraciones-remotas` (sin push)
- **Qué se hizo:** solo documentación. Se detalló el pendiente 15 (pruebas en el sitio publicado, por cuenta) y se agregaron los pendientes 31 a 33: subir esta rama y abrir su PR, decisiones opcionales (renombrar el repositorio, borrar la carpeta `.fcc`) y cómo retomar el entorno local después de reiniciar el PC.
- **Archivos:** `docs/BITACORA.md`
- **Verificación:** no aplica (cambio de documentación). Estado al cierre: `main` en GitHub contiene el PR #5; las migraciones `0012` a `0014` están aplicadas en el Supabase remoto (comprobado 6/6); lint, tsc, 173 tests, build y `supabase test db` 42/42 pasaron sobre ese código.
- **Pendiente / riesgos:** lo de arriba. Lo más importante para mañana: probar el sitio publicado con las tres cuentas (pendiente 15), porque nada se ha recorrido allá con las funciones nuevas.

### 2026-10-31 · [WEB] Migraciones 0012, 0013 y 0014 aplicadas en el Supabase remoto
- **Autor:** Cristóbal (con Claude) · rama `docs/bitacora-migraciones-remotas`
- **Qué se hizo:** se pegó y ejecutó en el SQL Editor del proyecto `inspecciones-bbosch` (rama «main», PRODUCTION) un script con las migraciones `0012` (comentario solo al rechazar), `0013` (el técnico lee a quienes firmaron sus inspecciones) y `0014` (seguimiento de hallazgos), dentro de una transacción. Claude cargó el script y comprobó el estado en solo lectura; **el botón «Run» lo pulsó Cristóbal**: el sistema de permisos de la sesión bloqueó que Claude lo ejecutara. Esto es una excepción puntual a la regla de `CLAUDE.md` de no ejecutar migraciones en un Supabase remoto, hecha a pedido expreso del usuario.
- **Archivos:** ninguno del repositorio (el script salió de `supabase/migrations/0012`, `0013` y `0014`, con los comentarios abreviados y el código idéntico). Copia completa en la carpeta Descargas del usuario (`aplicar-en-supabase-0012-0013-0014.sql`). La consulta de comprobación quedó guardada en Supabase como «Comprobar migraciones 0012-0014 (31-10-2026)».
- **Verificación:** antes de ejecutar, la comprobación dio `false` en las 4 partes (nada aplicado, tampoco la `0012`); después dio `true` en 6/6: tabla `finding_followups`, funciones `set_finding_followup` y `firmo_inspeccion_mia`, `review_inspection` con la regla de la `0012`, política `profiles_select_firmantes` y RLS activa en `finding_followups`. **No verificado:** el funcionamiento en el sitio publicado (aprobar sin comentario, PDF del técnico con el nombre del firmante, «Equipos con fallas» y guardar seguimiento).
- **Pendiente / riesgos:** probar en https://inspecciones-bbosch.vercel.app con `SUPERVISOR_A`, `PROGRAMADOR_A` y `TECNICO_A` (pendiente 15); la base remota todavía no tiene inspecciones reales con hallazgos, así que «Equipos con fallas» saldrá vacía. La tabla de control de migraciones del remoto sigue sin registrarlas (pendiente 18). Los pendientes 16 (desactivar el registro libre) y 20 (contraseñas) siguen abiertos.

### 2026-10-31 · [WEB] Bitácora al día y rama publicada en GitHub
- **Autor:** Cristóbal (con Claude) · rama `feat/fallas-seguimiento`
- **Qué se hizo:** se actualizaron «Estado actual», «Pendientes» (25 a 30) y «Decisiones» con todo lo del día: correcciones de uso en terreno, PDF del técnico, PDF sin tablas cortadas, «Equipos con fallas» y seguimiento de hallazgos, skills del proyecto y la decisión de no instalar «Free Claude Code». Se subió la rama a GitHub (`git push`, a pedido expreso del usuario); `main` no se tocó.
- **Archivos:** `docs/BITACORA.md`
- **Verificación:** antes del push `main` de GitHub no había avanzado (la rama lo contiene, sin conflictos). Último control completo sobre este código: lint, tsc, 173 tests, build y `supabase test db` 42/42, todo en verde. Esta entrada solo cambia documentación.
- **Pendiente / riesgos:** **subir la rama no actualiza el sitio publicado**: Vercel publica `main`, así que falta un PR hacia `main` y su unión (requiere confirmación del usuario). Además hay que aplicar las migraciones `0013` y `0014` al Supabase remoto antes de usar las funciones nuevas en el sitio (pendiente 25).

### 2026-10-31 · [WEB] «Equipos con fallas»: los filtros de área y gestión se aplican al elegir
- **Autor:** Cristóbal (con Claude) · rama `feat/fallas-seguimiento` (sin push)
- **Qué se hizo:** los desplegables «Área» y «Gestión» aplican el filtro al elegir una opción, sin botón «Filtrar» (queda solo como respaldo si el navegador no ejecuta JavaScript). El filtro sigue en la URL (se puede compartir, el botón «atrás» funciona) y conserva la severidad elegida en las pestañas de arriba; mientras carga, el contador dice «Actualizando…». La construcción de la URL pasó a `queryFallas` (lógica pura, con tests).
- **Archivos:** `src/components/revision/filtros-fallas.tsx` (nuevo), `src/components/revision/fallas-equipos.tsx`, `src/lib/revision/fallas.ts`, `fallas.test.ts`
- **Verificación:** lint, tsc, 173 tests (3 nuevos) y build en verde. En Chrome con la app local: al cambiar «Gestión» la URL queda con `gestion=todos` y conserva `severidad=alta`, el área no se toca y desaparece el botón «Filtrar».
- **Pendiente / riesgos:** con teclado, mover las flechas sobre un desplegable cerrado aplica el filtro en cada opción (comportamiento normal de los `select` con cambio inmediato); no se probó con lector de pantalla ni en iPhone. La bandeja principal sigue con su botón «Buscar» (tiene campos de texto y fechas).

### 2026-10-31 · [WEB] «Equipos con fallas»: el filtro de área lista todas las áreas
- **Autor:** Cristóbal (con Claude) · rama `feat/fallas-seguimiento` (sin push)
- **Qué se hizo:** el filtro «Área» solo mostraba las áreas que ya tenían hallazgos (con los datos de prueba, solo Chacay). Ahora lista siempre las del catálogo, en su orden (Chacay, Mina, Mauro, Puerto, Valle), y suma cualquier área con hallazgos que ya no figure en el catálogo.
- **Archivos:** `src/lib/revision/queries.ts` (`listarAreas`), `src/components/revision/fallas-equipos.tsx`
- **Verificación:** lint, tsc y 170 tests en verde; en Chrome con la app local, el desplegable muestra Todas, Chacay, Mina, Mauro, Puerto y Valle. Build no repetido (cambio de una consulta y un desplegable).
- **Pendiente / riesgos:** ninguno propio; elegir un área sin hallazgos muestra la lista vacía, como corresponde.

### 2026-10-31 · [WEB] Equipos con fallas y seguimiento de hallazgos (aviso subsecuente SAP / canalizado con MLP)
- **Autor:** Cristóbal (con Claude) · rama `feat/fallas-seguimiento` (sale de `fix/ux-terreno-tecnico`; sin push)
- **Qué se hizo:** a pedido de MLP, cada hallazgo («Malo») puede tener seguimiento de la Supervisión **sin bloquear las firmas**: con alcance Bbosch 23 kV se anota el **N.º de aviso subsecuente** de SAP (lo crea el supervisor en paralelo; la inspección firmada es la evidencia en la OT padre y el informe de mejora de la condición se trabaja aparte, fuera de la app); con alcance «terceros» (extintores, plagas, accesos…) se registra que se **canalizó con MLP** (a quién, cuándo, medio). Nueva pestaña **«Equipos con fallas»** (supervisor, programador y administrador): hallazgos agrupados por equipo y ordenados por severidad (crítica a baja), con filtros de severidad, área y gestión (por defecto, pendientes) y enlace a la inspección. En el detalle de cada inspección, el supervisor y el administrador gestionan cada hallazgo (también con la inspección ya aprobada) y pueden **copiar una ficha para SAP** con los campos del aviso de calidad (Boletín 21: TAG, OT padre, texto breve de 40 caracteres, Circunstancias, prioridad sugerida, autor de 12 caracteres, anexo PDF). El PDF agrega una línea de trazabilidad bajo cada hallazgo ya gestionado.
- **Archivos:** `supabase/migrations/0014_seguimiento_hallazgos.sql` (tabla `finding_followups` + RPC `set_finding_followup`), `supabase/tests/rls.test.sql` (+10 pruebas, plan 42), `src/lib/revision/fallas.ts`, `seguimiento-actions.ts`, `queries.ts`, `src/components/revision/fallas-equipos.tsx`, `seguimiento-hallazgo.tsx`, `detalle.tsx`, `src/app/{supervisor,planificador,admin}/fallas/page.tsx` y sus layouts, `src/lib/informe/modelo.ts`, `paginado.ts`, `src/components/informe/informe-pdf.tsx`
- **Decisiones de diseño:** (1) los hallazgos son inmutables tras el envío (`guard_child_write`), por eso el seguimiento va en tabla aparte y se escribe solo por el RPC (supervisor y administrador; el programador solo lee; el técnico dueño ve el estado de lo suyo). (2) No se tocó `review_inspection`: las firmas no dependen del seguimiento. (3) El gatillo es el alcance, no la severidad (la severidad solo sugiere la prioridad de SAP: crítica=Urgente, alta=Programada en ejecución, media/baja=Próximos programas). (4) El alcance parte siempre en «Bbosch» y lo ajusta el supervisor por hallazgo; aún no hay marca por ítem en las plantillas. (5) Solo cuentan los hallazgos «Malo» (ML), y solo de inspecciones vigentes (enviadas, en firma o aprobadas; las rechazadas se corrigen con una inspección nueva).
- **Verificación:** lint, tsc, 170 tests (12 nuevos de `fallas`, 3 de trazabilidad en el informe) y build en verde; `supabase db reset` aplica 0001–0014 y `supabase test db` da 42/42. Probado en Chrome con la app local y datos de prueba: la pestaña ordena por severidad y agrupa por equipo; como SUPERVISOR_A se registró un N.º de aviso (el hallazgo sale de «Pendientes» y aparece con «Todos») y, sobre una inspección **aprobada**, se marcó «terceros» con nota; el PDF de esa inspección muestra la línea «Requiere apoyo de terceros: canalizado con MLP…»; el programador no ve el botón «Gestionar» y cada rol es redirigido fuera de áreas ajenas.
- **Pendiente / riesgos:** (a) falta la **marca de alcance por ítem en las plantillas** (hoy el supervisor decide caso a caso); hace falta el listado de ítems fuera de alcance por formato, que el cliente debe validar. (b) Un hallazgo no se «cierra» solo cuando una inspección posterior del mismo TAG lo muestra reparado: se gestiona por seguimiento; está por definir. (c) El largo de 40 caracteres del texto breve de SAP y la prioridad sugerida son supuestos tomados de los manuales (2019–2020): confirmar con MLP. (d) Sin probar: iPhone, pantalla angosta, botón de copiar al portapapeles en un navegador distinto de Chrome, y ver el seguimiento desde la cuenta del técnico. (e) El PDF ya adjuntado a una OT no se actualiza al anotar el aviso después; hay que descargarlo de nuevo.

### 2026-10-31 · [WEB] PDF del informe: las tablas ya no se cortan entre páginas
- **Autor:** Cristóbal (con Claude) · rama `fix/ux-terreno-tecnico` (sin push)
- **Qué se hizo:** en los PDF de ejemplo (3 informes) cada grupo de ítems (la «tabla» con borde redondeado) se partía entre dos páginas con el marco cortado. Ahora cada grupo se mantiene entero y, si no cabe en lo que queda de página, pasa completo a la siguiente; solo se permite partirlo si por sí solo es más alto que una página (estimación en `src/lib/informe/paginado.ts`). Además, observaciones generales, consideraciones y firmas forman un solo bloque de cierre para que las firmas no queden solas en una página.
- **Archivos:** `src/components/informe/informe-pdf.tsx`, `src/lib/informe/paginado.ts`, `src/lib/informe/paginado.test.ts`
- **Verificación:** lint, tsc, 153 tests (3 nuevos) y build en verde. Se regeneraron con la app local las 3 inspecciones de ejemplo y se revisaron las páginas como imagen: ninguna tabla queda cortada; el informe de piso pasa de 2 a 3 páginas (deja espacio libre al pie de las páginas 1 y 2, es el costo de no partir tablas). Sin probar: informes con fotos (registro fotográfico), con grupos de más de una página, ni abrirlos en un visor de iPhone.
- **Pendiente / riesgos:** la altura de cada grupo es una estimación (texto largo, observaciones); si un grupo real sale muy apretado podría partirse o pasarse de página, y habría que ajustar `ALTO_UTIL`/los valores de `alturaEstimadaGrupo`. Los PDF ya descargados no cambian: hay que volver a descargarlos.

### 2026-10-31 · [WEB] El técnico descarga el PDF de sus inspecciones (al enviar y en «Enviadas»)
- **Autor:** Cristóbal (con Claude) · rama `fix/ux-terreno-tecnico` (sigue la entrada anterior; sin push)
- **Qué se hizo:** (1) Nueva ruta `GET /tecnico/[id]/pdf` que reutiliza `responderPdf`; el rol `technician` entra a la lista de roles con PDF y la lectura pasa por RLS con su sesión, así que solo obtiene las suyas (una ajena da 404). (2) Al terminar el formulario ya no vuelve de golpe al inicio: muestra «Inspección enviada» con **Descargar PDF** y «Volver al inicio»; sin red muestra «Inspección guardada» y explica que el PDF se descarga después. (3) Cada tarjeta de «Enviadas» tiene **Descargar PDF**. Sin red, el botón avisa en vez de abrir una página de error. (4) El service worker ya no intercepta `/tecnico/**/pdf` (no se guarda ni se sustituye por el inicio sin red). (5) **Migración nueva `0013_tecnico_lee_firmantes.sql`**: sin ella el PDF del técnico saldría con «—» como nombre del supervisor y del planificador, porque `profiles_select` solo dejaba al técnico ver su propio perfil; la política nueva le deja leer solo el perfil de quienes firmaron **sus** inspecciones.
- **Archivos:** `supabase/migrations/0013_tecnico_lee_firmantes.sql`, `supabase/tests/rls.test.sql` (+2 pruebas, plan 32), `src/app/tecnico/[id]/pdf/route.ts`, `src/lib/informe/responder.ts`, `src/components/tecnico/boton-pdf.tsx`, `envio-listo.tsx`, `formulario.tsx`, `inicio-tecnico.tsx`, `src/app/sw.ts`
- **Verificación:** lint, tsc, 150 tests y build en verde (la ruta aparece en el build). **Probado en local (2026-10-31, Chrome en PC, Supabase local con `db reset`):** migraciones 0001–0013 aplican sin errores; `supabase test db` 32/32; como TECNICO_A, `GET /tecnico/<id>/pdf` responde 200 `application/pdf` (≈171 KB, empieza con `%PDF-`) para una inspección enviada y firmada por el supervisor, y 404 para un id inexistente o mal formado; el técnico lee el perfil del supervisor que firmó (no los demás); «Enviadas» muestra «Descargar PDF»; se llenó y envió un formato real (Transformador de piso, INSP-12) y la pantalla final mostró «Inspección enviada» con el botón, y su PDF respondió 200 (≈174 KB). **No verificado:** (a) el contenido visual del PDF (nombre del firmante) abierto en un visor; (b) el modo sin red; (c) cómo abre el PDF Safari/PWA en iPhone (`target="_blank"`); (d) la pantalla en 375 px.
- **Pendiente / riesgos:** en una base local ya existente hay que aplicar la 0013 (`corepack pnpm supabase db reset`). Para el Supabase remoto de prueba habría que pegarla en el SQL Editor (como las anteriores), **solo con confirmación del usuario**; hasta entonces el PDF del técnico en el sitio publicado mostraría «—» en las firmas. El técnico ahora puede leer el nombre, rol y turno de los firmantes de sus inspecciones (no el resto de los perfiles). Si hay un error de red durante el envío, la pantalla dice «guardada» y no «enviada»; no hay botón de PDF hasta que el servidor la reciba.

### 2026-10-31 · [WEB] Correcciones de uso en terreno del formulario del técnico
- **Autor:** Cristóbal (con Claude) · rama `fix/ux-terreno-tecnico` (sale de `chore/skills-react-best-practices`: unir primero esa)
- **Qué se hizo:** (1) «Quitar foto»: área táctil de 44 px (miniatura de 80 px, círculo visible de 28 px) y **confirmación** antes de borrar; el texto alternativo pasa a «Foto N». (2) «Quitar sección» repetible: **confirmación** antes de borrar respuestas y hallazgos. (3) Etiqueta de estado (Bueno, Malo…) de 11 a 12 px. (4) `touch-action: manipulation` global (sin zoom por doble toque; el pellizco sigue). (5) Puntos suspensivos en «Abriendo inspección…», «Cargando el formulario…», «Guardando…», «Cargando equipos…» y el placeholder de búsqueda.
- **Archivos:** `src/components/tecnico/photo-field.tsx`, `formulario.tsx`, `item-field.tsx`, `selector-tag.tsx`, `src/app/globals.css`, `docs/AUDITORIA_REACT_UI_TECNICO.md`
- **Verificación:** lint, tsc, 150 tests y build en verde. Medición (script temporal ya borrado, Node en PC): con la plantilla de 29 ítems, `validateDraft` tarda ≈7 µs y `expandirSecciones` ≈0,3 µs por render, es decir, el cálculo derivado por tecla **no** es un cuello de botella. **Prueba en teléfono: pendiente** (Cristóbal la hará); no hay tests de componentes en el proyecto, así que las confirmaciones no tienen prueba automática.
- **Pendiente / riesgos:** probar en teléfono: que «Reemplazado» y «No realizada» quepan a 12 px en 375 px de ancho, que el × de la foto se pueda tocar sin tocar la foto vecina y que las confirmaciones se vean. No se memoizó `ItemField` ni se difirió la búsqueda de TAG: sin medir el render real en el teléfono (Profiler de React) no se justifica. El paso del formulario sigue sin estar en la URL. Hallazgo 3 del informe (zona segura inferior) no era problema: el `viewport` no usa `viewport-fit=cover`, así que el navegador ya respeta la zona segura.

### 2026-10-31 · [WEB] Skills de React y de interfaz instaladas y auditoría de solo lectura del técnico
- **Autor:** Cristóbal (con Claude) · rama `chore/skills-react-best-practices`
- **Qué se hizo:** se copiaron al proyecto las skills `react-best-practices` (70 reglas de rendimiento de Vercel para React/Next) y `web-design-guidelines` (revisión de interfaz; baja las reglas de GitHub en cada uso) desde `agent-skills-main`, para que las use todo el equipo. Con ellas se auditó, sin cambiar código, `src/components/tecnico/` (5 archivos) y se dejó el informe.
- **Archivos:** `.claude/skills/react-best-practices/`, `.claude/skills/web-design-guidelines/`, `docs/AUDITORIA_REACT_UI_TECNICO.md`
- **Verificación:** lint, tsc, 150 tests (18 archivos) y build en verde (2026-10-31). La auditoría es por lectura de código; no se midió rendimiento ni se probó en teléfono.
- **Pendiente / riesgos:** los hallazgos no están aplicados (ver el informe; los de más valor en terreno: botón «Quitar foto» de 24 px, acciones destructivas sin confirmar, texto de 11 px). No se auditaron `tecnico-provider`, `nueva-inspeccion`, `tarjeta-borrador`, `sync-indicator`, `signature-field` ni el área del supervisor. `web-design-guidelines` necesita internet al usarla. Las skills no reemplazan `docs/DESIGN.md` ni `AGENTS.md`: si chocan con la documentación de Next 16 o con el sistema «Cobre», mandan estos.

### 2026-10-31 · [WEB] Inicio del técnico rediseñado, logo nuevo y nombre «Inspección Eléctrica Bbosch-MLP»
- **Autor:** Manuel (con Claude) · rama `feat/plantillas-mantenciones`
- **Qué se hizo:** (1) Logo nuevo de Bbosch (solo la palabra, sin la frase) en la portada y en el encabezado del técnico, sin pastilla blanca. (2) Inicio del técnico rediseñado: encabezado con logo, «Salir», «Técnico · Turno A/B» (turno de la cuenta) e indicador de sincronización, borde cobre; botón «Nuevo Standard» (antes «Nueva inspección») con ícono; tres recuadros **Enviadas / Aceptadas / Rechazadas** (Rechazadas en tono cobre si hay); lista vacía con título y ayuda. (3) El nombre de la app pasa a «Inspección Eléctrica Bbosch-MLP» en la portada, el encabezado de supervisor/planificador/administrador, el título general y el manifest. (4) Manuel renombró la familia F2 a «Salas eléctricas y túnel de cables» en el catálogo.
- **Archivos:** `public/brand/bbosch-logo-solo.png` (nuevo), `src/app/tecnico/layout.tsx`, `src/components/tecnico/inicio-tecnico.tsx`, `src/app/tecnico/nueva/page.tsx`, `src/app/login/page.tsx`, `src/app/layout.tsx`, `src/app/manifest.ts`, `src/components/shared/staff-shell.tsx`, `src/lib/formatos/catalogo.ts`
- **Verificación:** lint, tsc, 150 tests y build en verde. Vista en pantalla de la portada y del inicio: Manuel las revisó en localhost mientras se hacían los cambios; a 375 px y en teléfono real: no verificado.
- **Pendiente / riesgos:** el logo anterior (`bbosch-logo.png`) sigue en el PDF del informe y en `docs/DESIGN.md`; falta decidir si el PDF usa el nuevo. Los títulos de las pestañas todavía terminan en «· Inspecciones MLP». «Aceptadas» cuenta solo las aprobadas por supervisor y planificador.

### 2026-10-31 · [WEB] El PDF del informe se descarga con nombre y fecha
- **Autor:** Manuel (con Claude) · rama `feat/plantillas-mantenciones`
- **Qué se hizo:** el PDF ya no se descarga como `INS-2026-000016.pdf`; ahora se llama «<título del formato> - <TAG> - <fecha de envío>.pdf», por ejemplo «Inspección Banco de condensadores Mauro - 320-XC-001 - 2026-10-31.pdf». La fecha es la del envío en horario de Chile (si faltara, la de inicio). Se quitan los caracteres que Windows no admite y se envía también el nombre completo con tildes (`filename*`).
- **Archivos:** `src/lib/informe/nombre-archivo.ts` (nuevo), `src/lib/informe/nombre-archivo.test.ts` (nuevo), `src/lib/informe/responder.ts`
- **Verificación:** lint, tsc y 150 tests en verde (3 nuevos). Descarga real desde la bandeja: no verificada. Build: no corrido en esta entrada.
- **Pendiente / riesgos:** el folio ya no está en el nombre del archivo (sigue dentro del informe). Dos inspecciones del mismo formato, TAG y día generan el mismo nombre; el navegador agrega « (1)».

### 2026-10-31 · [WEB] El comentario de la revisión es obligatorio solo al rechazar
- **Autor:** Manuel (con Claude) · rama `feat/plantillas-mantenciones`
- **Qué se hizo:** al aprobar, el supervisor y el planificador ya no están obligados a escribir un comentario; al rechazar sigue siendo obligatorio. Nueva migración `0012_comentario_solo_al_rechazar.sql` que redefine `review_inspection` (sin comentario se guarda `null`), y el panel de revisión muestra «Comentario (opcional)» al aprobar y «(obligatorio)» al rechazar.
- **Archivos:** `supabase/migrations/0012_comentario_solo_al_rechazar.sql` (nueva), `supabase/tests/rls.test.sql`, `src/components/revision/panel-revision.tsx`
- **Verificación:** lint, tsc y 147 tests en verde; `supabase test db` 30/30 (el caso «comentario obligatorio» ahora prueba que rechazar sin comentario falla y que aprobar sin comentario funciona); migración aplicada a mano en el Supabase local. Build y vista en pantalla: no verificados en esta entrada.
- **Pendiente / riesgos:** la migración 0012 no está aplicada en el Supabase remoto (solo archivo): hay que ejecutarla allá antes de desplegar este cambio, o el supervisor recibirá «El comentario es obligatorio» al aprobar sin comentario.

### 2026-10-31 · [WEB] Logo de Bbosch arriba en el área del técnico
- **Autor:** Manuel (con Claude) · rama `feat/plantillas-mantenciones`
- **Qué se hizo:** el encabezado del técnico muestra el logo de Bbosch sobre una pastilla blanca (como el de supervisor, planificador y administrador), encima de la línea «Técnico · Turno X».
- **Archivos:** `src/app/tecnico/layout.tsx`
- **Verificación:** lint y tsc en verde; vista en pantalla: no verificada (hay que mirarlo a 375 px).
- **Pendiente / riesgos:** ninguno conocido.

### 2026-10-31 · [WEB] El encabezado del técnico muestra su turno
- **Autor:** Manuel (con Claude) · rama `feat/plantillas-mantenciones`
- **Qué se hizo:** la etiqueta de arriba del encabezado del técnico decía solo «Técnico»; ahora dice «Técnico · Turno A» o «Técnico · Turno B» según el turno de la cuenta (usa `roleWithShift`, igual que las otras áreas).
- **Archivos:** `src/app/tecnico/layout.tsx`
- **Verificación:** lint y tsc en verde; vista en pantalla: no verificada.
- **Ajuste posterior:** el nombre de la cuenta («Técnico B») repetía lo mismo, así que se quitó: el encabezado muestra una sola línea, «Técnico · Turno B», con el tamaño del nombre.
- **Pendiente / riesgos:** si una cuenta de técnico no tiene turno, la línea queda solo «Técnico». El nombre de la cuenta ya no se ve en el encabezado del técnico.

### 2026-10-31 · [WEB] INSP-02: la sección «Banco de condensadores» numera sus ítems de 1 a 35
- **Autor:** Manuel (con Claude) · rama `feat/plantillas-mantenciones`
- **Qué se hizo:** Manuel renumeró en `seed_plantillas_insp.sql` los ítems de la sección «Banco de condensadores» de INSP-02 (venían como `item_22` a `item_56`, correlativos con la sala de control) para que partan en 1. Quedaron repetidos los ids `item_01` a `item_21` con los de la sala de control y la app rechazaba la plantilla («Id de ítem duplicado»). Se dejaron ids únicos con prefijo de la sección: `banco_01` a `banco_35`.
- **Archivos:** `supabase/seed_plantillas_insp.sql`
- **Verificación:** 147 tests en verde (volvió a pasar el validador de INSP-02); plantilla actualizada en el Supabase local saltando el trigger de inmutabilidad. Revisión en pantalla: no verificada.
- **También (numeración en pantalla):** el número que se ve junto a cada ítem era correlativo de toda la plantilla (INSP-02 llegaba a 56) y no dependía de los ids. Ahora parte en 1 en cada sección (`formulario.tsx`); vale para todos los formatos y, en las secciones repetibles, para cada copia. El paso de cierre y los conteos no cambian.
- **Pendiente / riesgos:** los ids no se ven en pantalla; sirven para guardar las respuestas y deben ser únicos en toda la plantilla. En un Supabase remoto con INSP-02 ya publicada, el cambio de ids exige una versión 2 (las inspecciones enviadas usan los ids antiguos).

### 2026-10-31 · [WEB] Plantillas INSP-16 a INSP-41 (los 25 formatos que faltaban)
- **Autor:** Manuel (con Claude) · rama `feat/plantillas-mantenciones`
- **Qué se hizo:** con los Word ya revisados se crearon las 25 plantillas restantes (INSP-16 a 41, sin el 36): 40 de 40 inspecciones y 20 de 20 mantenciones disponibles, ningún formato «próximamente». Cada Word se leyó con un generador (no se escribieron a mano) y las decisiones de estructura son: las lecturas llevan su unidad (V, A, °C, h, kWh, %, kW, kVA); los formatos por componente o tablero (INSP-25, 27, 28, 30, 33, 41) quedan con una sección por componente con su TAG; INSP-29 anota horómetro y operaciones de cada carro; la galería fotográfica del Word es un ítem de fotos; los grupos generadores de INSP-18, 24 y 40 y las patas de INSP-19 son **secciones repetibles** («Agregar grupo generador» / «Agregar pata»); el registro operacional de INSP-40 se responde con BN (Sí) / ML (No).
- **Archivos:** `supabase/seed_plantillas_insp_16_41.sql` (nuevo, repetible y seguro para un Supabase remoto), `supabase/config.toml` (lo registra en el seed local), `src/lib/formatos/catalogo.ts`, `src/lib/templates/plantillas-insp-16-41.test.ts` (nuevo), y ajustes en `catalogo.test.ts` y `plantillas-insp.test.ts`.
- **Verificación:** lint, tsc y 147 tests en verde (build en verde en el paso anterior; la corrección posterior solo cambió seed, tests y documentos); seed cargado en el Supabase local (40 plantillas `plan_matriz` y 60 combinaciones con formulario). Revisión en pantalla: no verificada.
- **Pendiente / riesgos:** (1) Revisar a ojo cada formato, sobre todo los de tablas complejas (INSP-25, 27, 28, 30, 31, 33, 40). (2) INSP-32 es un check list y no trae el código EST-ELEC en el Word: Manuel confirmó usar `EST-ELEC-INSP-MLP-Bbosch-32`. (3) ~~INSP-41~~ resuelto: Manuel corrigió el título del Word a «741-ER-5002 STATCOM» y la plantilla se regeneró (sus dos tableros, 740-LP-5001 y 741-JP-1303, se mantienen como en el Word). (3b) Manuel cambió en los Word de INSP-32 y 40 la galería fotográfica por «Consideraciones»: las plantillas ya no llevan ítem de fotos (14 y 56 ítems); los Word de INSP-16 a 41 se copiaron a `docs/formatos/inspecciones`. (4) INSP-39: la tabla «GIS / DIA / VALOR EN PSI» quedó como un solo campo numérico «GIS: presión (valor en PSI)». (5) No se copiaron: en INSP-32, los dos párrafos de normativa que encabezan cada bloque (tierra de protección; inspección y rotulado) y las filas «Observaciones:»; en INSP-40, «Descripción de la Actividad por parte del Ejecutor», «Versión 1» y el subtítulo «Finalización de pruebas». (6) INSP-17: la última tabla del Word no tiene título; se llamó «Indicadores del cargador». (7) En un Supabase remoto el seed no sobrescribe plantillas ya publicadas; si se corrige una, hace falta una versión 2. (8) Siguen transversales INSP-13, 20 y MANT-18 y 19 (aparecen en el Valle).

### 2026-10-31 · [WEB] Word de MANT-18 y MANT-19 unificados (logo Bbosch y bloque de firmantes)
- **Autor:** Manuel (con Claude) · rama `feat/plantillas-mantenciones`
- **Qué se hizo:** los dos Word ya traían el logo Bbosch junto al de Los Pelambres, sin «STN» ni marcas `##`. A MANT-18 se le dejó el bloque de firmantes igual a los demás (Participantes, Encargado de la actividad, Supervisor Bbosch, Planificador Bbosch). MANT-19 no tenía tabla: se reemplazaron sus líneas sueltas (transformador, TAG, horas, ejecutado por, fecha, supervisor) por la tabla estándar (TAG, N° OT, Transformador N°, Fecha, horas y firmantes, ajustada al ancho de su página A4) y se le agregó la leyenda de nomenclatura. Los `.doc` antiguos ya no están en la carpeta (los borró Manuel). MANT-18 y 19 quedan transversales (decisión de Manuel).
- **Archivos:** fuera del repo, en `Bases de datos generales/Formatos BBOSCH/MANTENCIONES` (`MANT-18 …docx`, `MANT-19 …docx`). Respaldo de los originales en la carpeta temporal de la sesión (no persiste).
- **Verificación:** ambos `.docx` abren como zip y su XML es válido; el texto extraído muestra el bloque unificado. Regenerar el seed desde los Word da un SQL idéntico (las plantillas no cambian). No verificado: cómo se ven al abrirlos en Word (la tabla de MANT-19 se armó por XML; conviene revisarla a ojo).
- **También:** se copiaron `MANT-18` y `MANT-19` a `docs/formatos/mantenciones` (antes no estaban en el repo) y se actualizó `MANT-10` con la versión revisada.
- **Pendiente / riesgos:** revisar en Word el aspecto de MANT-19. Los Word no están en git: quien los edite debe avisar.

### 2026-10-31 · [WEB] Plantillas MANT-18 (Celda de piso) y MANT-19 (Instrumentos del transformador principal)
- **Autor:** Manuel (con Claude) · rama `feat/plantillas-mantenciones`
- **Qué se hizo:** con los Word guardados como `.docx` se crearon las plantillas de MANT-18 (8 ítems, estados SI/NO/RL/NR/BN/ML/RMP/NT, cabecera con marca y serie) y MANT-19 (35 ítems en 6 secciones por instrumento: presión súbita, nivel de aceite, válvula de alivio, presión cambiador TAP, temperatura de aceite y de enrollado; los N° de señal del PLC son campos de texto y los enclaves/recepciones son verificaciones). Ambas pasan a «disponible» en el catálogo; ya no quedan mantenciones «próximamente».
- **Archivos:** `supabase/seed_plantillas_mant.sql` (20 plantillas), `src/lib/formatos/catalogo.ts`, `src/lib/templates/plantillas-mant.test.ts`
- **Verificación:** lint, tsc, 139 tests y build en verde; seed cargado en el Supabase local (ambos tipos existen). Revisión en pantalla: no verificada.
- **Pendiente / riesgos:** (1) los Word de MANT-18 y 19 aún tienen el formato antiguo (logo, «BBOSCH», bloque de firmantes, tabla de participantes); falta unificarlos como los otros 58. (2) MANT-19: a pedido de Manuel se agregó el «N° OT» (obligatorio, como en las demás) y la leyenda de estados de inspección (NT/BN/ML/NA/NR), que el Word no traía; en el Supabase local se actualizó la plantilla saltando el trigger de inmutabilidad. (3) MANT-18 queda tal cual el Word: la especificación del vendor es una recomendación, cada técnico debe tenerla. (4) Siguen los `.doc` antiguos en la carpeta (borrarlos requiere confirmación). (5) Áreas: MANT-18 y 19 quedan transversales (aparecen también en Valle), por confirmar.

### 2026-10-31 · [WEB] MANT-09 solo con la sala 1 (la sala 12 queda en MANT-07)
- **Autor:** Manuel (con Claude) · rama `feat/plantillas-mantenciones`
- **Qué se hizo:** de la plantilla de MANT-09 se sacó la sección «Interruptores Sala Eléctrica 12» (12 ítems de N° de operaciones): ahora son 101 ítems con 39 interruptores de la sala 1. Título del catálogo y de la plantilla: «Switchgear Sala 1». El código de tipo de equipo se mantiene (`mant_switchgear_sala_1_y_12`) para no tocar la base.
- **Archivos:** `supabase/seed_plantillas_mant.sql`, `src/lib/formatos/catalogo.ts`, `src/lib/templates/plantillas-mant.test.ts`
- **Verificación:** vitest de plantillas y catálogo 70/70; en el Supabase local se actualizó la plantilla (publicada, v1) saltando el trigger de inmutabilidad solo en local, y quedó con 3 secciones. Lint, tsc, 139 tests y build en verde.
- **Pendiente / riesgos:** (1) el Word `MANT-09 Switchgear Sala 1 y Sala 12.docx` aún contiene la sala 12: hay que quitarla y renombrarlo, o al regenerar el seed vuelve a salir la sala 12 (el generador la filtra por ahora). (2) El protocolo de torque conserva los ítems 1–14 y 30–41; hay que confirmar cuáles son de la sala 1 y cuáles de la sala 12. (3) En un Supabase remoto el seed no sobrescribe plantillas ya publicadas: si ya se cargó, hace falta una versión 2.

### 2026-10-31 · [WEB] MANT-20 con varias estructuras (sección repetible), MANT-12 por sintonías y temperatura mínima/máxima en MANT-16 y 17
- **Autor:** Manuel (con Claude) · rama `feat/plantillas-mantenciones`
- **Qué se hizo:** (1) **Secciones repetibles (nueva función):** una sección de la plantilla puede marcarse `repetible`; el técnico trabaja una copia por defecto y al final de la sección tiene «**+ Agregar estructura**» (y «Quitar estructura N», que descarta sus respuestas y hallazgos). Cada copia es independiente (ítems, observaciones, fotos y hallazgos propios; hasta 30). La copia 1 conserva los ids de la plantilla y las demás usan `<id>__2`, `<id>__3`…; la cantidad de copias se guarda en la respuesta `_repeticiones`. Una función pura (`src/lib/templates/repetir.ts`) despliega la plantilla y la usan la validación (cada copia se exige completa, con mensajes «Estructura 2 · …»), el envío, la corrección de inspecciones rechazadas, el detalle de supervisión y el informe PDF (un grupo «Estructura 1», «Estructura 2»… por copia). Sin cambios de esquema. **MANT-20** queda con una sección «Estructura» repetible: primero «N° de estructura» (obligatorio) y sus 17 ítems; se quitó el campo de cabecera «Estructura N°». (2) **MANT-12:** la tabla de componentes pasa a **sintonías 3a, 5a, 7a, 11a y 13a**; cada una (una sección) tiene unidades capacitivas, inductivas y resistivas y, de cada grupo, el estado del componente (Bueno/Malo) y si se realizó mantención (Sí/No): 6 ítems por sintonía, 56 en total con las 26 actividades. (3) **MANT-16 y 17:** «temperatura aceite mín / máx» se divide en **temperatura mínima y temperatura máxima de aceite**, cada una en °C (MANT-17 tenía el mismo ítem; se hizo igual). MANT-10 queda con la norma -10 y MANT-13 no se cambió.
- **Archivos:** `src/lib/templates/{repetir,schema}.ts` · `src/lib/tecnico/{draft,enviadas}.ts` · `src/components/tecnico/formulario.tsx` · `src/components/revision/detalle.tsx` · `src/lib/informe/modelo.ts` · `supabase/seed_plantillas_mant.sql` (regenerado) · tests `repetir.test.ts` (nuevo) y `plantillas-mant.test.ts`.
- **Verificación:** `pnpm lint` y `pnpm typecheck` sin errores · `pnpm test` 139/139 (13 nuevos: expansión de secciones, validación por copia, envío con hallazgo en la copia, corrección de rechazadas, informe con grupos por estructura, y las plantillas de MANT-12, 16, 17 y 20) · `pnpm build` correcto · `supabase test db` 30/30 · **recorrido contra la base local y `next dev`** (script temporal, no commiteado; no con clics): MANT-20 con 1 y con 3 estructuras (54 ítems, un ML en el poste de la estructura 3 → hallazgo `item_002__3`), MANT-12 y MANT-16 enviados, firmados por supervisor y programador; el detalle muestra «Estructura 1» y «Estructura 3», «13a sintonía» y «temperatura mínima de aceite», y el PDF se descarga (200, `%PDF`).
- **Pendiente / riesgos:** (1) **No se vio en pantalla** el botón «+ Agregar estructura» ni cómo se ve el paso con varias estructuras: probarlo con `TECNICO_A` (Mantención → MANT-20). (2) «Quitar estructura» solo quita la última copia. (3) Las fotos de una copia quitada quedan sin usar en el equipo del técnico hasta que se borre el borrador (no se envían). (4) Los Word de MANT-12, 16 y 17 no se modificaron: MANT-12 sigue listando «3a, 5ta, 7ma, 11ava, 11ava» (la plantilla usa 3a, 5a, 7a, 11a y 13a, como indicó Manuel) y habría que corregirlo en el Word. (5) MANT-13 queda para la próxima revisión. (6) MANT-18 y 19 siguen en `.doc`.

### 2026-10-31 · [WEB] Plantillas de las mantenciones (MANT-01 a 17 y 20) y estados de mantención RL, RMP, SI, NO
- **Autor:** Manuel (con Claude) · rama `feat/plantillas-mantenciones` (parte de `feat/firmas-sin-participantes`; unir antes las ramas anteriores)
- **Qué se hizo:** (1) **Estados de mantención:** las mantenciones usan una nomenclatura distinta (`SI / NO / RL realizado / NR / BN / ML / RMP reemplazado / NT`) y la app solo conocía BN/ML/NT/NA/NR. Cada plantilla (o cada ítem) puede ahora elegir los estados que ofrece (`estados`): MANT-01, 02, 03, 05, 16 y 17 usan SI/NO/RL/NR/BN/ML/RMP/NT; MANT-07 a 14 y 20, RL/NR/BN/ML/RMP/NT; MANT-04, 06 y 15 conservan los de inspección (así lo dice su Word). RMP exige motivo en observaciones, como ML y NR. «Marcar pendientes de la sección» usa RL en las mantenciones. El informe PDF cuenta **BN, RL y SI como conformes** («x de N ítems conformes») y tiene colores para RL, RMP, SI y NO. (2) **18 plantillas** (Mantenimiento programado) hechas a partir de los Word revisados con un script, con sus datos del equipo, unidades (°C, V, A) en las lecturas, la tabla de **interruptores** de MANT-07 a 10 (N° de operaciones por circuito), los **componentes de los filtros armónicos** MANT-12 a 14 (estado Bueno/Malo y «¿se realizó mantención?» Sí/No por componente) y el **protocolo de torque de pernos de barras 23 kV** de MANT-07 a 10 (una ficha por ítem con cubículo, revisión de torque, torque aplicado en Nm, fases F1/F2/F3, pernos por fase y observaciones). (3) Los 18 Word revisados se copiaron a `docs/formatos/mantenciones/`.
- **Archivos:** `supabase/seed_plantillas_mant.sql` (nuevo; repetible, seguro para un Supabase remoto) · `supabase/config.toml` · `src/lib/templates/{schema,validate}.ts` · `src/components/tecnico/{item-field,formulario}.tsx` · `src/lib/informe/modelo.ts` · `src/components/informe/informe-pdf.tsx` · `src/lib/formatos/catalogo.ts` · tests `estados-mantencion.test.ts` y `plantillas-mant.test.ts` (nuevos), `catalogo.test.ts`, `plantillas-insp.test.ts` · `docs/formatos/mantenciones/*.docx`. Sin migración (los estados viven en el JSON de las respuestas).
- **Verificación:** `pnpm lint` y `pnpm typecheck` sin errores · `pnpm test` 126/126 (cantidad de ítems de cada plantilla = la del Word, nomenclatura, torque, interruptores, filtros, unidades) · `pnpm build` correcto · `supabase db reset` carga las plantillas · `supabase test db` 30/30. **Recorrido contra la base local y `next dev`** (script temporal, no commiteado; no con clics en un navegador): como `TECNICO_A` se enviaron las 18 mantenciones completas con un TAG real del Maestro (folios `INS-2026-000001` a `000018`), más MANT-07 y MANT-01 con un ítem en ML y otro en RMP; `SUPERVISOR_A` y `PROGRAMADOR_A` firmaron los 20 y quedaron Aprobados; el detalle responde 200 y el PDF se descarga (164–181 KB) con sesión de supervisor, programador y administrador en los 20.
- **Pendiente / riesgos:** (1) **MANT-18 y 19 no están**: siguen en `.doc` (convertirlos y aplicarles logo, «Bbosch», bloque de firmantes y limpieza de `##`). (2) **Protocolo de torque (MANT-07 a 10): primera versión para revisar en pantalla.** El Word trae una imagen de una planilla; aquí es una ficha de 8 campos por ítem (12 en MANT-07, 14 en MANT-08 y 10, **26 en MANT-09: solo los ítems 1–14 y 30–41, porque la imagen de los ítems 15–29 ya no está en ese Word**). No incluye la tabla de firmas de la imagen (Nombre / Fecha / Empresa / Cargo / Firma; «Ejecutado, Revisado y Aprobado por») porque en el resto del formato solo firman el encargado, el supervisor y el planificador; sí incluye «Aprobado por» como texto y el torque aprobado (100 Nm en pernos de barra y 90 Nm en pernos TT/PP) en la nota. (3) **Aproximaciones a revisar:** MANT-20 registra una estructura por inspección (el Word repite el bloque 15 veces); en los filtros de MANT-12 el Word no trae nombres de componente, se usó «componente 1…n» según las filas en blanco; MANT-16 y 17 piden «temperatura mín/máx» en un solo valor; los ítems con varios valores quedan como un ítem de verificación. (4) El Word de MANT-10 dice la norma «…-34» (probable error): se usó «-10». (5) Los ítems de una mantención se marcan con estados de acción (RL, RMP) y se registran como «conformes»; ML sigue siendo el único que genera hallazgo. (6) No se vio en pantalla; MANT-13 tiene 149 ítems y MANT-09 113: conviene recorrerlos. (7) Sigue sin cargarse en el Supabase remoto: pegar `seed_plantillas_mant.sql` con «postgres (Superuser)» y desplegar (requiere confirmación). (8) Quedan en la base local las inspecciones de prueba `INS-2026-000001` a `000020` (`supabase db reset` las borra).

### 2026-10-31 · [WEB] Decisión: `Insp_Relés…doc` se descarta y se conserva INSP-34; Manuel revisa las mantenciones
- **Autor:** Manuel (con Claude) · rama `feat/firmas-sin-participantes`
- **Qué se decidió:** el archivo suelto `Bases de datos generales\Inspeciones\Insp_Relés de proteccion y controladores de reconectadores.doc` era una versión antigua y sin número de INSP-34; **se conserva solo `INSP-34 …docx`** y el `.doc` no se convierte ni se corrige. No se borró el archivo (borrar requiere confirmación). Quedan 2 `.doc` por convertir, ambos mantenciones: **MANT-18** (`Celda de Piso 23 kV`) y **MANT-19** (`Prueba de Instrumentos Transformador Principal`); cuando Manuel los revise hay que guardarlos como `.docx` y aplicarles logo de BBOSCH, «STN» → «Bbosch», el bloque de firmantes estándar y la limpieza de marcas `##`. Manuel empieza a revisar las mantenciones (MANT-01 a 20): no se modifican esos archivos mientras tanto.
- **Archivos:** ninguno del repositorio (solo esta bitácora).
- **Verificación:** no aplica (decisión).
- **Pendiente / riesgos:** el `.doc` descartado sigue en la carpeta.

### 2026-10-31 · [WEB] Word INSP-24 a 41: se quitan las marcas de relleno ##…##
- **Autor:** Manuel (con Claude) · rama `feat/firmas-sin-participantes`
- **Qué se hizo:** los 17 formatos INSP-24 a 41 (no existe el 36) traían las marcas de la plantilla de relleno automático (`##nombre_parque_de_generacion##`, `##fecha##`, `##foto_1##`…). Se quitaron **todas (1.407)**, junto con el espacio que las precedía («Fecha: ##fecha##» queda «Fecha:»; las celdas que solo tenían una marca quedan vacías), incluso las que Word había partido en varios trozos de texto. No se tocó ninguna otra cosa: ni textos, ni imágenes, ni filas ni tablas (las galerías y los títulos siguen como estaban hasta que Manuel los revise).
- **Archivos:** `Bases de datos generales\Formatos BBOSCH\Inspeciones\INSP-24 … INSP-41 *.docx` (fuera del repositorio). Respaldo previo en `Bases de datos generales\Formatos BBOSCH - respaldo antes de limpiar marcas`.
- **Verificación:** en los 17 archivos no queda `##` en ninguna parte del documento; comparado con el respaldo, el texto es idéntico salvo las marcas quitadas, sin cambios de imágenes ni de cantidad de filas, y el XML es válido. **No verificado:** el aspecto al abrirlos en Word.
- **Pendiente / riesgos:** quedan 2 marcas sueltas fuera de este rango, en INSP-03 e INSP-18 («Grupo generador tag##tag##»), que no se tocaron; INSP-16 a 23 y las mantenciones ya no tienen marcas. Los 3 `.doc` antiguos siguen sin convertir.

### 2026-10-31 · [WEB] INSP-21 unificado y INSP-03 sin bloque extra: los 58 Word con el mismo bloque de firmantes
- **Autor:** Manuel (con Claude) · rama `feat/firmas-sin-participantes`
- **Qué se hizo:** con INSP-21 ya cerrado en Word se le aplicó el bloque estándar (`Encargado de la actividad:` / `Supervisor Bbosch:` / `Planificador Bbosch:`, todos con `Firma:`). En INSP-03 se quitó el bloque extra «Supervisor Ejecutor o Responsable de Trabajo» (título, «Nombre | Fecha | Firma» y su fila en blanco) para que tenga la misma estructura que los demás. Con esto **los 58 `.docx` tienen exactamente las mismas 4 filas** en el mismo orden: Participantes (sin firma), Encargado de la actividad, Supervisor Bbosch y Planificador Bbosch. INSP-03 se copió de nuevo al repositorio.
- **Archivos:** `docs/formatos/inspecciones/INSP-03 Pruebas Grupos Generadores El Mauro.docx` (INSP-21 está fuera del repositorio, en `Bases de datos generales\Formatos BBOSCH`).
- **Verificación:** comparado con la versión anterior, INSP-03 solo pierde esas 2 líneas (3 filas) e INSP-21 solo cambia sus 3 etiquetas; los dos son XML válido; el recorrido de los 58 confirma un único patrón de bloque. **No verificado:** el aspecto al abrirlos en Word. La plantilla de INSP-03 en la app no cambia (nunca tuvo ese bloque).
- **Pendiente / riesgos:** los 3 `.doc` antiguos (MANT-18, MANT-19 y el `Insp_Relés…doc`) siguen sin convertir y, al convertirlos, habrá que aplicarles el mismo bloque.

### 2026-10-31 · [WEB] Mismo bloque de firmantes en todos los formatos Word
- **Autor:** Manuel (con Claude) · rama `feat/firmas-sin-participantes`
- **Qué se hizo:** los formatos tenían unas 25 variantes del bloque de firmantes («Encargado de Actividad», «Encargado actividad», «Encargado de actividad»; «Firma», «Firma Recepción», «Firma/Fecha Recepción», «Firma de encargado», «Firma encargado actividad», «Cargo»; «Participantes» y «Participantes de la tarea»; INSP-15, 16, 17 y MANT-20 sin fila de participantes; INSP-28 con ella después del planificador). Ahora los formatos quedan con **el mismo bloque, en este orden**: `Participantes:` (con su espacio, sin firma) · `Encargado de la actividad:` + `Firma:` · `Supervisor Bbosch:` + `Firma:` · `Planificador Bbosch:` + `Firma:`. Se agregó la fila en 4 formatos, se movió en 1, y en las mantenciones se quitaron las 84 filas en blanco que seguían al encabezado «Participantes» (en la app los participantes son un solo texto libre). INSP-01 a 15 se copiaron de nuevo al repositorio.
- **Archivos:** `docs/formatos/inspecciones/INSP-01 … INSP-15 *.docx` (el resto de los formatos está fuera del repositorio, en `Bases de datos generales\Formatos BBOSCH`). Respaldo previo en `Bases de datos generales\Formatos BBOSCH - respaldo antes de unificar firmas`.
- **Verificación:** en los 58 `.docx` el XML es válido, la comparación con el respaldo muestra que solo cambiaron filas del bloque de firmantes (y las filas en blanco de las mantenciones), y 56 tienen exactamente las 4 filas estándar en ese orden (INSP-03 además conserva su bloque «Supervisor Ejecutor o Responsable de Trabajo»). **No verificado:** el aspecto al abrirlos en Word.
- **Pendiente / riesgos:** (1) **INSP-21 no se modificó**: estaba abierto en Word; mantiene «Encargado de Actividad» y «Firma Recepción» y hay que unificarlo al cerrarlo. (2) Se perdió información de las celdas de recepción: «Firma Recepción» y «Firma/Fecha Recepción» de supervisor y planificador pasan a «Firma:» (la fecha de recepción de las mantenciones ya no tiene espacio propio; la app registra fecha y hora de cada firma), y la columna «Cargo» de los participantes se quitó. Todo está en el respaldo. (3) INSP-03 conserva su bloque extra de «Supervisor Ejecutor o Responsable de Trabajo»: confirmar si se quita. (4) Los 3 `.doc` antiguos siguen sin convertir.

### 2026-10-31 · [WEB] Se repone la fila «Participantes» en INSP-19 e INSP-20 (Word)
- **Autor:** Manuel (con Claude) · rama `feat/firmas-sin-participantes`
- **Qué se hizo:** INSP-19 e INSP-20 habían perdido la fila «Participantes» con el primer cambio de firmas (y se guardaron en Word después). Con ambos cerrados, se les agregó la fila antes de «Encargado…», con su espacio y **sin celda de firma** («Participantes de la tarea:» en INSP-19, «Participantes:» en INSP-20), tomada del respaldo con las mismas medidas de celda y sin las marcas `##…##`. Se conservan las ediciones de Manuel (la copia previa quedó en el scratchpad de la sesión, fuera del repositorio).
- **Archivos:** `Bases de datos generales\Formatos BBOSCH\Inspeciones\INSP-19 …docx` e `INSP-20 …docx` (fuera del repositorio; estos dos formatos aún no están en `docs/formatos/inspecciones`).
- **Verificación:** el XML es válido y las tablas quedan con 7 y 9 filas: Participantes, Encargado, Supervisor Bbosch y Planificador Bbosch. **No verificado:** el aspecto al abrirlos en Word.
- **Pendiente / riesgos:** INSP-18 se dejó como lo editó Manuel; los 3 `.doc` antiguos siguen sin convertir.

### 2026-10-31 · [WEB] Corrección: los participantes se siguen anotando, pero ya no firman
- **Autor:** Manuel (con Claude) · rama `feat/firmas-sin-participantes`
- **Qué se hizo:** la entrada anterior («Firman solo el encargado…») había **quitado por completo** «Participantes» (campo, firma y fila del Word), y lo pedido era conservar el espacio para anotarlos y solo quitar su firma. Se corrigió: **App:** el cierre del formulario vuelve a tener «Participantes (opcional)» (texto libre; no se exige y no lleva firma); se envía como respuesta `_lista_participantes` y se muestra en el detalle de supervisión y en los datos del informe PDF solo si se anotó; también se copia al corregir una inspección rechazada. La única firma del técnico sigue siendo la del encargado de la actividad. **Word:** en los formatos se restituyó la fila «Participantes» con su espacio y **sin la celda de firma** (la celda de «Firma» queda vacía; los «Cargo» se dejaron), y se mantienen los firmantes «Supervisor Bbosch:» y «Planificador Bbosch:». Se partió del respaldo (que aún tenía «Participantes») para no perder nada.
- **Archivos:** `src/lib/tecnico/{draft,enviadas}.ts` · `src/components/tecnico/formulario.tsx` · `src/components/revision/detalle.tsx` · `src/lib/informe/modelo.ts` · tests `draft.test.ts`, `enviadas.test.ts`, `modelo.test.ts` · `docs/formatos/inspecciones/INSP-01 … INSP-15 *.docx` · `docs/BITACORA.md`. Sin cambios de esquema.
- **Verificación:** `pnpm lint` y `pnpm typecheck` sin errores · `pnpm test` 110/110 · `pnpm build` correcto · `supabase test db` 30/30 · **recorrido contra la base local y `next dev`** (script temporal, no commiteado; no con clics en un navegador): INSP-01 e INSP-06 enviados con «Ana Pérez, Luis Soto» e INSP-12 sin participantes; el servidor guarda 1 sola firma por inspección (la del encargado); el detalle del supervisor muestra los participantes solo cuando se anotaron y siempre «Encargado de la actividad»; el PDF se descarga (200, `%PDF`). Word: comparado con el respaldo en los 53 `.docx` procesados (solo cambian la celda de firma de «Participantes» y las etiquetas de los firmantes).
- **Pendiente / riesgos:** (1) **INSP-18, 19 y 20 no se tocaron**: estaban abiertos o se guardaron en Word después de mi cambio. INSP-18 ya tiene su «Participantes:»; **INSP-19 e INSP-20 perdieron la fila «Participantes»** con el primer cambio y hay que volver a ponérsela cuando se cierren. (2) Los 3 `.doc` antiguos siguen sin convertir. (3) En las mantenciones la lista de participantes sigue con encabezado y filas en blanco; si el encabezado decía «Firma» quedó vacío. (4) No se vio en pantalla el cierre del formulario. (5) Las inspecciones ya enviadas con firma de participantes siguen abriendo: ahí el nombre que se muestra como encargado es el que se escribió como participantes.

### 2026-10-31 · [WEB] Firman solo el encargado, el supervisor y el planificador (sin participantes) y firmantes «Bbosch»
- **Autor:** Manuel (con Claude) · rama `feat/firmas-sin-participantes` (parte de `feat/plantillas-insp-11-15`; unir antes las ramas anteriores)
- **Qué se hizo:** (1) **App:** se eliminó «Participantes» del cierre del formulario. Ahora el técnico escribe el nombre de los firmantes (rol «Encargado de la actividad», más supervisor y planificador, opcionales) y **firma como encargado de la actividad**; el supervisor y el planificador firman después al revisar. Para enviar se exige el nombre y la firma del encargado. El detalle de supervisión y el informe PDF muestran «Encargado de la actividad» con su firma en lugar de «Participantes». (2) **Word:** en 54 formatos se quitó la fila o tabla «Participantes» (y las filas vacías que la acompañaban en las mantenciones) y todos los firmantes dicen ahora «Supervisor Bbosch:» y «Planificador Bbosch:» (antes había «BBOSCH» en mayúsculas, «Supervisor:» y «Planificador:» a secas, p. ej. INSP-13, 19, 23, 28, 34). Los INSP-01 a 15 se copiaron de nuevo al repositorio.
- **Archivos:** `src/lib/tecnico/{draft,enviadas}.ts` · `src/components/tecnico/formulario.tsx` · `src/components/revision/detalle.tsx` · `src/lib/informe/modelo.ts` · tests `draft.test.ts`, `enviadas.test.ts`, `modelo.test.ts` · `docs/formatos/inspecciones/INSP-01 … INSP-15 *.docx` · `docs/BITACORA.md` (Decisiones). Sin cambios de esquema ni de plantillas.
- **Compatibilidad:** la respuesta `_participantes` y el tipo de adjunto `participant_signature` se mantienen con el significado nuevo (encargado): no hay migración y las inspecciones ya enviadas siguen abriendo; en ellas, el nombre que se muestra bajo «Encargado de la actividad» es el que se escribió como participantes.
- **Verificación:** `pnpm lint` y `pnpm typecheck` sin errores · `pnpm test` 108/108 · `pnpm build` correcto · `supabase test db` 30/30 · **recorrido contra la base local y `next dev`** (script temporal, no commiteado; no con clics en un navegador): sin firma del encargado la validación impide enviar; INSP-01 a 15 se enviaron solo con el encargado (nombre y firma), el supervisor y el programador firmaron y quedaron los 15 Aprobados; el detalle responde 200, dice «Encargado de la actividad» y no contiene «Participantes», y el PDF se descarga con sesión de supervisor, programador y administrador. Word: verificado contra el respaldo en los 58 `.docx` (XML válido; solo cambiaron las filas «Participantes» y las etiquetas de supervisor y planificador). Respaldo previo en `Bases de datos generales\Formatos BBOSCH - respaldo antes de quitar participantes` (fuera del repositorio).
- **Pendiente / riesgos:** (1) **INSP-18 no se modificó** porque estaba abierto en Word: aún tiene «Participantes». (2) Los 3 `.doc` antiguos (MANT-18, MANT-19 y el `Insp_Relés…doc`) siguen sin convertir. (3) INSP-03 conserva su bloque «Supervisor Ejecutor o Responsable de Trabajo» del registro operacional; confirmar si también se quita. (4) No se vio en pantalla el cierre del formulario (nombre y firma del encargado) ni en teléfono. (5) Las muestras HTML de `docs/muestras/` siguen mostrando «Participantes» (son referencia visual antigua, no la app). (6) Las plantillas siguen pidiendo, como antes, el nombre del encargado como obligatorio; el del supervisor y el planificador es opcional porque ellos firman en la revisión.

### 2026-10-31 · [WEB] Formatos revisados INSP-11 a 15: Word al repositorio y plantillas de INSP-11, 13, 14 y 15
- **Autor:** Manuel (con Claude) · rama `feat/plantillas-insp-11-15` (parte de `feat/plantillas-insp-06-10`; unir antes las ramas anteriores)
- **Qué se hizo:** (1) Los 5 Word que Manuel revisó (INSP-11 a 15, con logo de BBOSCH, «Bbosch» en lugar de «STN» y galería sustituida por «Observaciones/Consideraciones») se copiaron a `docs/formatos/inspecciones/`. (2) Se cargaron como formulario **INSP-11** Línea aérea 23 kV (15 ítems), **INSP-13** Switchgear 23 kV (17), **INSP-14** Switchgear principal Tranque Mauro (18, **conserva la galería de fotos** porque en su Word no se quitó) e **INSP-15** Túnel de cables STMG (13). **INSP-12** ya tenía plantilla publicada (`seed_catalogo.sql`): su Word revisado solo cambió logo, firmantes y cierre, así que el formulario no cambia. (3) El seed de plantillas se renombró a `supabase/seed_plantillas_insp.sql` (nombre fijo: agrupa INSP-01 a 15 salvo INSP-12) para no renombrarlo en cada tanda.
- **Cómo se modeló:** INSP-11 tiene dos columnas en el Word (una sola estructura por inspección): el «Estructura N°» es un campo de la cabecera, el «Circuito» es el selector de tramo y «Tramo desde / Hasta / Ubicación-Sector» son campos opcionales; usa el tipo de equipo existente `inspeccion_lineas`. En INSP-13 y 14 el «Horómetro y operaciones carro interruptor» es una ficha de dos campos; en INSP-14 el «Cubículo» es un campo de la cabecera. En INSP-15 el «Tramo» es el selector de tramo, la «Correa» un campo aparte y la tabla de observaciones con «pata o distancia de referencia» un texto de varias líneas al final del recorrido. Tipos de equipo nuevos: `switchgear_23kv`, `switchgear_tranque_mauro`, `tunel_cables_stmg`.
- **Archivos:** `supabase/seed_plantillas_insp.sql` (renombrado desde `..._01_10`; repetible, seguro para un Supabase remoto) · `supabase/config.toml` · `src/lib/formatos/catalogo.ts` · `src/lib/formatos/catalogo.test.ts` · `src/lib/templates/plantillas-insp.test.ts` (renombrado) · `docs/formatos/inspecciones/INSP-11 … INSP-15 *.docx`.
- **Verificación:** `pnpm lint` y `pnpm typecheck` sin errores · `pnpm test` 107/107 · `pnpm build` correcto · `supabase db reset` carga las plantillas · `supabase test db` 30/30. **Recorrido contra la base local y `next dev`** (script temporal, no commiteado; no con clics en un navegador): como `TECNICO_A` se enviaron INSP-01 a 15 completos con un TAG real del Maestro (folios `INS-2026-000001` a `000015`; INSP-14 con una foto de prueba) más un segundo INSP-11 con un ítem en Malo; `SUPERVISOR_A` aprobó los 15 y rechazó el segundo; `PROGRAMADOR_A` aprobó los 15; detalle y PDF (163–177 KB) con sesión de supervisor, programador y administrador respondieron 200 en las 16.
- **Pendiente / riesgos:** (1) **No verificado en pantalla**: nadie vio estos formularios en un navegador ni en teléfono. (2) INSP-11 registra **una estructura por inspección** (como el Word); para una línea con muchas estructuras se envían varias inspecciones: confirmar si es lo esperado. (3) En el Word de INSP-13 los firmantes dicen «Supervisor» y «Planificador» (sin «Bbosch») y en el de INSP-14 «Participantes» va con «Cargo» en vez de «Firma»; no se tocaron, la plantilla usa los firmantes estándar. (4) INSP-11 y 15 son de tramo: el Maestro filtra por designador `LI` y `TU` y en la prueba no hay equipos `TU` en Mina; el TAG de la prueba salió de «todas las áreas». (5) Sigue sin cargarse en el Supabase remoto: pegar `seed_plantillas_insp.sql` con «postgres (Superuser)» y desplegar (requiere confirmación). (6) Quedan en la base local las inspecciones de prueba `INS-2026-000001` a `000016` (`supabase db reset` las borra).

### 2026-10-31 · [WEB] Formatos revisados INSP-01 a 10: Word al repositorio y plantillas de INSP-06 a 10
- **Autor:** Manuel (con Claude) · rama `feat/plantillas-insp-06-10` (parte de `feat/formatos-logo-bbosch`; unir antes las ramas anteriores)
- **Qué se hizo:** (1) Los 10 Word que Manuel revisó (`Bases de datos generales/Formatos BBOSCH/Inspeciones`) se copiaron a `docs/formatos/inspecciones/`, reemplazando los 5 que ya estaban (sin duplicados). (2) Se cargaron como formulario **INSP-06** S/E móvil (90 ítems), **INSP-07** Transformador aéreo (18), **INSP-08** Switchgear sala 12 (28: 16 ítems y 12 lecturas de horómetro y operaciones por carro), **INSP-09** Parrón de maniobra 23 kV (39) e **INSP-10** Sistema presurizado sala 12 (6). (3) INSP-04 y 05 se ajustaron a lo que Manuel cambió en el Word: se quitó la galería fotográfica (queda «Observaciones/Consideraciones» del cierre; las fotos siguen disponibles en cada ítem) y «Presión» con mayúscula; INSP-04 queda con 23 ítems e INSP-05 con 22. (4) El código de norma de las plantillas pasa a `EST-ELEC-MLP-Bbosch-NN`, como dicen los Word revisados.
- **Cómo se modeló:** en INSP-07 el «Nivel de criticidad» y el «Motivo» de cada ítem son la severidad y la observación que la app ya pide al marcar un ítem en Malo, así que no se repiten; el «Horómetro y operaciones» de cada carro de INSP-08 es una ficha de dos campos; INSP-10 mantiene «TAG Equipo» (el selector usa tramos, `campo: "tramo"`). Cada formato nuevo tiene su propio tipo de equipo (`subestacion_movil`, `switchgear_sala_12`, `parron_maniobra`, `sistema_presurizado_sala_12`; INSP-07 usa el existente `transformador_aereo`).
- **Archivos:** `supabase/seed_plantillas_insp_01_10.sql` (renombrado desde `..._01_05`; repetible, seguro para un Supabase remoto) · `supabase/config.toml` · `src/lib/formatos/catalogo.ts` · `src/lib/formatos/catalogo.test.ts` · `src/lib/templates/plantillas-insp-01-10.test.ts` (renombrado) · `docs/formatos/inspecciones/INSP-01 … INSP-10 *.docx`.
- **Verificación:** `pnpm lint` y `pnpm typecheck` sin errores · `pnpm test` 107/107 (cada plantilla pasa el validador, ítems y norma = los del Word, sin «STN» ni fotos) · `pnpm build` correcto · `supabase db reset` carga las 11 plantillas · `supabase test db` 30/30. **Recorrido contra la base local y `next dev`** (script temporal, no commiteado; no con clics en un navegador): como `TECNICO_A` se enviaron los 10 formularios completos con un TAG real del Maestro (folios `INS-2026-000001` a `000010`) más una segunda de INSP-01 con un ítem en Malo; `SUPERVISOR_A` aprobó los 10 y rechazó la segunda; `PROGRAMADOR_A` aprobó los 10 (quedaron Aprobados); detalle y PDF (163–177 KB) con sesión de supervisor, programador y administrador respondieron 200 en las 11.
- **Pendiente / riesgos:** (1) **No verificado en pantalla**: nadie vio los formularios 06 a 10 en un navegador ni en teléfono; INSP-06 tiene 90 ítems en 5 secciones, conviene recorrerlo. (2) El Word de INSP-10 pregunta «Sí / No» («¿Presurizador operativo?», «¿Es adecuado el ingreso a sala?») y el esquema solo tiene BN/ML/NT/NA/NR: BN = Sí y ML = No, con la observación (dicho en la nota de la plantilla). (3) Las fechas de extintores (INSP-06) y de batería (INSP-05) son texto libre. (4) INSP-09 en el Word repite el título «OBSERVACIONES» dos veces al final (probable error de «CONSIDERACIONES»): no se corrigió el Word. (5) INSP-01 y 08 en Mina: el Maestro no tiene seccionadores `SW` allí (INSP-01 usa «Ver todas las áreas»). (6) Sigue sin cargarse en el Supabase remoto: hay que pegar `seed_plantillas_insp_01_10.sql` con «postgres (Superuser)» y desplegar (requiere confirmación). (7) Quedan en la base local las inspecciones de prueba `INS-2026-000001` a `000011` (`supabase db reset` las borra). (8) INSP-10 de prueba tomó un TAG cualquiera de Mina: el catálogo no filtra por designador porque el formato es de tramo.

### 2026-10-31 · [WEB] Formatos Word: logo de BBOSCH en lugar del de STN y «STN» → «Bbosch»
- **Autor:** Manuel (con Claude) · rama `feat/formatos-logo-bbosch` (parte de `feat/bandeja-marca-actualizar`)
- **Qué se hizo:** de los 60 formatos, 58 `.docx` se revisaron y corrigieron. Los encabezados traían el logo de Los Pelambres (cliente, se conserva) y, en 37 formatos (INSP-04 a 41), el de **STN grupo saesa** (contratista anterior): se reemplazó por el logo de BBOSCH con el mismo formato de imagen y proporciones, sin cambiar el diseño. En el texto, «STN» pasó a «Bbosch» en «Supervisor STN», «Planificador STN» y el código de la norma (`EST-ELEC-MLP-STN-NN` → `EST-ELEC-MLP-Bbosch-NN`; 94 cambios), igual que se hizo a mano en INSP-04. INSP-01 a 03 y MANT-01 a 20 ya tenían el logo y el texto de BBOSCH. Las copias corregidas están **fuera del repositorio**, en `Bases de datos generales\Formatos BBOSCH\Inspeciones` y `\MANTENCIONES`; los originales no se tocaron. En el repositorio: INSP-05 se reemplazó por la versión corregida, y el demo (`demo/formatos/*.js`) y `docs/ARBOL_INSPECCIONES.md` ya no dicen STN.
- **Archivos:** `docs/formatos/inspecciones/INSP-05 Reconectadores.docx`, `demo/formatos/desconectador-23kv.js`, `demo/formatos/banco-condensadores-mauro.js`, `docs/ARBOL_INSPECCIONES.md`.
- **Verificación:** la conversión se hizo con un script (no se editó a mano) y se comprobó contra los originales en los 58 archivos: el XML es válido, la única diferencia de texto es «STN» por «Bbosch», las únicas imágenes cambiadas son los 4 logos de STN, y no queda «STN» ni logo STN en ningún archivo de salida. Búsqueda de «STN» y «saesa» en el repositorio (sin la bitácora): solo queda la frase explicativa de `ARBOL_INSPECCIONES.md`. `pnpm lint` sin errores y `pnpm test` 106/106 (no se tocó código de `src`; no se corrió el build). **No verificado:** el aspecto del logo dentro de Word (tamaño, nitidez, el logo de 189×63 px original ahora trae 3× más píxeles).
- **Pendiente / riesgos:** (1) **Faltan 3 archivos `.doc` antiguos** (MANT-18, MANT-19 y `Insp_Relés de proteccion y controladores de reconectadores.doc`, versión suelta de INSP-34): hay que guardarlos como `.docx` en Word antes de poder corregirlos; no se automatizó mientras había un Word abierto. (2) El Word de INSP-04 del repositorio (`docs/formatos/inspecciones`) quedó **sin tocar** porque se estaba editando a mano: conserva el logo de STN. Lo mismo pasa con las copias de INSP-01, 03 y 04 de la carpeta `Formatos BBOSCH`, que se guardaron desde Word después de la conversión. (3) Los números de norma siguen siendo los antiguos con otro prefijo; falta definir el número BBOSCH definitivo (ya estaba pendiente en `ARBOL_INSPECCIONES.md`). (4) La app web ya no menciona STN; su PDF usa el logo de BBOSCH, pero el formulario del técnico en pantalla no muestra logo.

### 2026-10-30 · [WEB] Bandeja: marca «Inspecciones BBOSCH», logo y botón Actualizar
- **Autor:** Manuel (con Claude) · rama `feat/bandeja-marca-actualizar` (parte de `feat/plantillas-insp-01-05`: unir antes esa rama)
- **Qué se hizo:** en el encabezado del personal (supervisor, programador y administrador) el texto «Inspecciones MLP» pasa a «Inspecciones BBOSCH» y se agrega el logo de BBOSCH en la esquina superior izquierda, sobre una pastilla blanca porque es gris y naranja y no se lee sobre el grafito; el logo enlaza al inicio. La bandeja tiene un botón **Actualizar** junto al título que vuelve a leer los datos del servidor y conserva los filtros y la búsqueda (muestra «Actualizando…» mientras trabaja).
- **Archivos:** `src/components/shared/staff-shell.tsx`, `src/components/revision/bandeja.tsx`, `src/components/revision/boton-actualizar.tsx` (nuevo).
- **Verificación:** `pnpm lint` y `pnpm typecheck` sin errores · `pnpm test` 106/106 · `pnpm build` correcto · con la sesión de `SUPERVISOR_A`, `PROGRAMADOR_A` y `ADMINISTRADOR`, `/supervisor`, `/planificador` y `/admin` responden 200 y su HTML incluye «Inspecciones BBOSCH», el logo y el botón «Actualizar». **No verificado:** el aspecto en pantalla (tamaño del logo, alineación en móvil) ni el clic en «Actualizar» en un navegador.
- **Pendiente / riesgos:** «Inspecciones MLP» sigue en el login, el manifiesto de la PWA, el área del técnico y los títulos de pestaña (fuera de lo pedido); decidir si se cambian también. El botón no actualiza solo: hay que pulsarlo.

### 2026-10-30 · [WEB] Plantillas de INSP-01 a INSP-05 y prueba técnico → supervisor → programador
- **Autor:** Manuel (con Claude) · rama `feat/plantillas-insp-01-05` (parte de `docs/formatos-subcarpetas`: unir antes los PR #3 y el de las subcarpetas)
- **Qué se hizo:** se cargaron como formulario las 5 primeras inspecciones, leídas de sus Word: **INSP-01** Desconectador/seccionador 23 kV (24 ítems), **INSP-02** Banco de condensadores Mauro (56), **INSP-03** Pruebas de grupos generadores El Mauro (45: 30 de mediciones y 15 del registro operacional), **INSP-04** Limpieza de salas eléctricas STMG (24, con lecturas SF6/temperatura GIS y galería de 6 fotos) e **INSP-05** Reconectador 23 kV (23, con marca, modelo y galería). Cada formato tiene su propio tipo de equipo (la plantilla se busca por tipo × modo); INSP-05 usa el existente `reconectador`. Los 5 Word se copiaron a `docs/formatos/inspecciones/`. Los firmantes quedan como en INSP-12 (Encargado, Supervisor Bbosch, Planificador Bbosch) y las normas con el prefijo `EST-ELEC-MLP-BBOSCH-NN` (los Word antiguos decían STN).
- **Archivos:** `supabase/seed_plantillas_insp_01_05.sql` (nuevo; repetible, seguro para un Supabase remoto) · `supabase/config.toml` (lo agrega a `sql_paths`) · `src/lib/formatos/catalogo.ts` (INSP-01 a 05 «disponible») · `src/lib/formatos/catalogo.test.ts` · `src/lib/templates/plantillas-insp-01-05.test.ts` (nuevo) · `docs/formatos/inspecciones/INSP-0{1..5}*.docx`.
- **Verificación:** `pnpm lint` y `pnpm typecheck` sin errores · `pnpm test` 106/106 (5 nuevos: las 5 plantillas pasan el validador, cantidad de ítems = la del Word, firmantes, coherencia con el catálogo y repetibilidad) · `pnpm build` correcto · `supabase db reset` carga las 6 plantillas (29, 23, 24, 56, 45, 24 ítems) · `supabase test db` 30/30. **Recorrido contra la base local y `next dev`** (script temporal, no commiteado; **no con clics en un navegador**): como `TECNICO_A`, con el mismo código de la app (`validateDraft` → `buildSubmission` → imágenes a Storage → RPC `submit_inspection`) se enviaron las 5 con un TAG real del Maestro, completas y con firma del participante (folios `INS-2026-000010` a `000014`), más una segunda de INSP-01 con un ítem en Malo (hallazgo) · `SUPERVISOR_A` firmó y aprobó las 5 y **rechazó** la segunda; `PROGRAMADOR_A` firmó y las 5 quedaron **Aprobadas** (la rechazada quedó Rechazada) · con la sesión de cada rol, la página de detalle del supervisor respondió 200 y el PDF se descargó (200, `%PDF`, 166–171 KB) como supervisor, programador y administrador, en las 6.
- **Pendiente / riesgos:** (1) **No verificado en pantalla**: nadie vio los 5 formularios en un navegador ni en teléfono (distribución de secciones, ítems con unidad, lecturas SF6); probarlos a mano con `TECNICO_A`. (2) **INSP-03**: el formato original tiene un bloque por grupo generador, pero la app guarda una sola tanda de mediciones por inspección (los «+ Equipo» solo agregan TAG a la cabecera). Se dejó **un grupo por inspección** y así lo dice la nota de la plantilla; falta decidir si se quiere un formulario con bloques repetidos. (3) En el registro operacional de INSP-03 el Word pide Sí/No y el esquema solo tiene BN/ML/NT/NA/NR: se usa BN = Sí y ML = No (con observación; un «No» queda como hallazgo). (4) Las fechas de vencimiento (extintor, batería) son texto libre: no hay ítem de tipo fecha. (5) INSP-01 es transversal pero el Maestro no tiene seccionadores `SW` en Mina: el técnico debe usar «Ver todas las áreas» (730-SW-001 está en otra área). (6) **No se cargó en el Supabase remoto**: para verlos en el sitio publicado hay que pegar `supabase/seed_plantillas_insp_01_05.sql` en el SQL Editor (elegir «postgres (Superuser)») y desplegar el código al unir el PR; requiere confirmación. (7) Quedan en la base local las inspecciones de prueba `INS-2026-000004` a `000015` (el script se corrió dos veces): `supabase db reset` las borra. (8) La norma de INSP-03 en el Word dice «Bboch» (error de tipeo); se registró como `BBOSCH`.

### 2026-10-30 · [WEB] Carpeta de formatos: subcarpetas inspecciones y mantenciones, sin los 4 Word antiguos
- **Autor:** Manuel (con Claude) · rama `docs/formatos-subcarpetas`
- **Qué se hizo:** en `docs/formatos` se eliminaron los 4 Word antiguos (`01_…TRANSFORMADORES DE PISO.doc`, `18_…CHACAY-MINA.docx`, `EST-ELEC-INSP-MLP-STN-01_…` y `-02_…`), que eran versiones previas de INSP-12, INSP-18, INSP-01 e INSP-02 de la colección vigente. Se crearon las subcarpetas `inspecciones/` y `mantenciones/` (con `.gitkeep`, porque Git no guarda carpetas vacías) y se reescribió el `LEEME.md` con la estructura y la regla de nombres `INSP-NN` / `MANT-NN`. La colección vigente (40 INSP + 20 MANT = 60, coincide con el catálogo; INSP-36 no existe) sigue fuera de Git, en «Bases de datos generales».
- **Archivos:** `docs/formatos/` (4 eliminados, `inspecciones/.gitkeep`, `mantenciones/.gitkeep`, `LEEME.md`).
- **Verificación:** nada del código lee `docs/formatos` (búsqueda en `src`, `scripts` y `supabase` sin resultados; solo la bitácora lo menciona). No se corrieron lint, tsc, tests ni build porque no se tocó código. Las entradas anteriores de esta bitácora que citan los nombres antiguos se conservan como historia.
- **Pendiente / riesgos:** las subcarpetas están vacías; cada Word se copia cuando se convierte en plantilla (empezando por INSP-13 o INSP-07). Los 4 originales siguen en el historial de Git por si hay que recuperarlos. Esta rama parte de `docs/sincronizar-al-iniciar-sesion` (PR #3, aún abierto): conviene unir el #3 primero.

### 2026-10-30 · [WEB] Equipo de Manuel preparado y regla de sincronizar con GitHub al iniciar sesión
- **Autor:** Manuel (con Claude) · rama `docs/sincronizar-al-iniciar-sesion`
- **Qué se hizo:** (1) Nueva sección «Al iniciar cada sesión (obligatorio)»: comparar GitHub con la copia local y bajar lo último antes de trabajar. (2) Se preparó un segundo equipo (Windows 11) desde cero: Node 26.13.0 LTS, corepack 0.36.0 con `npm i -g corepack` (desde Node 25 no viene incluido), pnpm 12.16.1, Python 3.13.16 + openpyxl 3.1.5, Git Credential Manager; Docker Desktop 29.9.2 y WSL2 ya estaban.
- **Archivos:** `docs/BITACORA.md`.
- **Verificación (en el equipo nuevo, `main` en `474db23`):** `pnpm install` sin `ERR_PNPM_IGNORED_BUILDS` · `supabase start` y `supabase db reset` aplican 0001–0011 y los dos seeds · `pnpm lint` sin errores · `pnpm test` 101/101 · `pnpm build` correcto · `pnpm typecheck` sin errores **después** del build · `supabase test db` 30/30 · `pnpm dev` responde HTTP 200 en `/login`. **No verificado:** `git pull` desde la terminal de Claude (bloquea el inicio de sesión de GitHub; hay que autenticarse una vez a mano) ni la prueba de extremo a extremo en el navegador en este equipo.
- **Pendiente / riesgos:** (a) En un clon nuevo, `pnpm typecheck` falla con `Cannot find name 'RouteContext'` en las 3 rutas `pdf/route.ts` hasta que se corre `pnpm build` o `pnpm dev`, porque ese tipo global lo genera Next en `.next/types`; conviene agregar `next typegen` al script `typecheck`. (b) Clonado con GitHub Desktop, `git status` mostraba ~150 archivos «modificados» que solo diferían en CRLF/LF; se resolvió con `git config core.autocrlf true` en el repo local. Falta un `.gitattributes` en el repo para que no le pase a nadie más.

### 2026-10-30 · [WEB] Despliegue de prueba: app en Vercel y base en Supabase remoto
- **Autor:** Cristóbal (con Claude) · rama `docs/bitacora-despliegue-supabase-vercel`
- **Qué se hizo:** (1) El PR #1 (`feat/flujo-4-pasos-tag`) se unió a `main` desde GitHub (commit `474db23`). (2) Se creó el proyecto de Vercel `inspecciones-bbosch` desde el repositorio (raíz, Next.js) y el de Supabase `inspecciones-bbosch` con la integración de Vercel (São Paulo, Free). El primer despliegue falló en la instalación (`ERR_PNPM_IGNORED_BUILDS`, arreglado con `allowBuilds` en `pnpm-workspace.yaml`); luego compiló. (3) Con el Chrome del usuario se pegó y ejecutó en el SQL Editor de Supabase un único SQL con las migraciones 0001–0011 y `seed_catalogo.sql`. (4) El usuario creó las 7 cuentas (`administrador`, `supervisor_a/b`, `programador_a/b`, `tecnico_a/b`, con correo interno `@mlp.local`) y se les asignó rol, turno y nombre con un `update` sobre `public.profiles`.
- **Verificación (consultas de solo lectura en el Supabase remoto):** 5 áreas, 5 tipos de equipo, 1 plantilla publicada (INSP-12), 12 tablas en `public`, buckets `inspection-photos`, `signatures` y `reports` **privados**; después 7 perfiles con el rol y turno esperados (admin sin turno; supervisor, planner y technician con A/B). Vercel: builds de la rama y de `main` en estado Ready; la página `/login` carga en https://inspecciones-bbosch.vercel.app.
- **Pendiente / riesgos:** **no se probó el ingreso ni ningún flujo en el sitio publicado** (las contraseñas las tiene el usuario). No se confirmó que «Allow new users to sign up» esté desactivado. Migraciones aplicadas a mano: no quedan registradas en Supabase (ver «Pendientes» 18). Trampa del SQL Editor: arrancó en «Run as: authenticated» (como `supervisor_a`) y falló con «permission denied for table users»; hay que elegir **postgres (Superuser)** en el selector junto a «Run». La clave `service_role` y las variables `POSTGRES_*` existen en Vercel pero no se usan.

### 2026-10-30 · [WEB] Arreglo del build en Vercel: scripts de instalación de pnpm
- **Autor:** Cristóbal (con Claude) · rama `feat/flujo-4-pasos-tag`
- **Qué se hizo:** el primer despliegue en Vercel falló en la instalación con `ERR_PNPM_IGNORED_BUILDS` (`@swc/core` y `esbuild` tienen scripts de compilación sin decidir y pnpm 12 devuelve error en CI; en local solo advertía). Se agregaron ambos como `false` en `allowBuilds` de `pnpm-workspace.yaml`: funcionan sin ejecutar sus scripts, igual que en local.
- **Archivos:** `pnpm-workspace.yaml`.
- **Verificación:** en una carpeta limpia, `CI=true pnpm install --frozen-lockfile` con la configuración anterior termina con código 1 y el mismo error de Vercel; con la nueva termina con código 0.
- **Pendiente / riesgos:** **no verificado** que el build completo de Vercel pase (el compilado de Next y la ruta del service worker usan `esbuild` nativo; se espera que funcione porque el binario viene de un paquete opcional, pero hay que ver el log del siguiente despliegue). El despliegue fallido compiló `main` (`e146a8f`), que también tiene este problema.

### 2026-10-30 · [WEB] Guía para probar en Vercel + Supabase, seed separado y pendiente de Excel
- **Autor:** Cristóbal (con Claude) · rama `feat/flujo-4-pasos-tag`
- **Qué se hizo:** (1) `supabase/seed.sql` se separó en `seed_catalogo.sql` (áreas, equipos, modos y plantilla; seguro para un Supabase remoto) y `seed_usuarios_dev.sql` (cuentas de prueba, solo local); `config.toml` los carga en ese orden, así que `db reset` local queda igual. (2) `docs/DEPLOY_VERCEL.md` reescrito: migraciones 0001–0011 (CLI o a mano), catálogo, registro de usuarios desactivado, creación de las 7 cuentas y SQL de roles/turnos, variables de Vercel y lista de pruebas. (3) Se dejó como pendiente la exportación a Excel (punto 13 de «Pendientes»).
- **Archivos:** `supabase/seed_catalogo.sql`, `supabase/seed_usuarios_dev.sql`, `supabase/config.toml`, `docs/DEPLOY_VERCEL.md`, `CLAUDE.md`, 4 tests que leen la plantilla del seed.
- **Verificación:** la unión de los dos archivos nuevos es byte a byte idéntica al `seed.sql` anterior (comprobado por script) · tests 101/101. **No verificado:** un `db reset` local con los dos archivos (borraría las inspecciones de prueba) ni nada contra un Supabase remoto.
- **Pendiente / riesgos:** nada se ejecutó en un Supabase remoto ni se desplegó. El SQL de roles asume que `profiles.role` acepta `planner` y `admin` (lo hace desde la migración 0007). La clave `service_role` no se usa.

### 2026-10-30 · [WEB] Cuentas genéricas con usuario (sin correo) y prueba de extremo a extremo
- **Autor:** Cristóbal (con Claude) · rama `feat/flujo-4-pasos-tag`
- **Qué se hizo:** el login pide **Usuario** en lugar de correo (`TECNICO_A`, `SUPERVISOR_B`, `PROGRAMADOR_A`, `ADMINISTRADOR`…); internamente se convierte en `usuario@mlp.local`. El seed y el test RLS usan las 7 cuentas nuevas (se quitaron los usuarios demo antiguos del seed). «Planificador» pasa a mostrarse «Programador» en la interfaz. Tras un error de login se conserva el usuario escrito. No hay script de alta de cuentas (decisión del usuario).
- **Archivos:** `src/lib/auth/usuario.ts` (+ test), `src/app/login/{actions.ts,login-form.tsx}`, `src/lib/auth/roles.ts`, `src/lib/revision/estado.ts`, `src/components/revision/{panel-revision,detalle}.tsx`, `src/app/planificador/page.tsx`, `supabase/seed.sql`, `supabase/tests/rls.test.sql`.
- **Base local:** las cuentas existentes se renombraron en el lugar con SQL (sin `db reset`, para no perder las inspecciones de prueba). Las cuentas demo antiguas (`supervisor@mlp.local`, `supervisor@bbosch.cl`, `tecnico@mlp.local`) siguen en esa base local pero ya no están en el seed.
- **Verificación:** lint y typecheck sin errores · tests 101/101 · pgTAP 30/30 · las 7 cuentas inician sesión contra el Auth local (HTTP 200). **Navegador (Chrome, `next dev`):** clave incorrecta muestra «Usuario o contraseña incorrectos» y conserva el usuario; `tecnico_a` (en minúsculas) entra a `/tecnico`; se envió INSP-12 en Mina con TAG provisional `160-XF-243` (29 ítems en Bueno, firma del participante) → `INS-2026-000031` con `tag_estado = propuesto`; `SUPERVISOR_A` ve «TAG provisional» en el detalle y descarga el PDF (175 KB), firma y confirma; `PROGRAMADOR_A` firma y la deja **Aprobada**; PDF final de 178 KB.
- **Pendiente / riesgos:** no se probó el login de `ADMINISTRADOR`, `SUPERVISOR_B`, `PROGRAMADOR_B` ni `TECNICO_B` en el navegador (sí contra la API de auth). Con cuentas compartidas, la trazabilidad depende de que el técnico escriba su nombre al inicio de la inspección. Las contraseñas del seed son de prueba y están en el repositorio: cambiarlas antes de producción. Quedan inspecciones y borradores de prueba en la base local (`INS-2026-000023`, `000024`, `000031`).

### 2026-10-30 · [WEB] El técnico puede eliminar una inspección en curso (deslizar a la derecha)
- **Autor:** Cristóbal (con Claude) · rama `feat/flujo-4-pasos-tag`
- **Qué se hizo:** en «Mis inspecciones», cada inspección en curso se desliza a la derecha para mostrar «Eliminar»; pide confirmación («Sí, eliminar» / «Cancelar») y borra el borrador con sus fotos y firmas del equipo. Además hay un botón «Eliminar» visible bajo la tarjeta para quien no deslice (mouse, teclado, guantes). Solo aplica a borradores: una inspección en cola o enviada no se puede eliminar desde aquí. Un deslizamiento no abre la inspección.
- **Archivos:** `src/lib/tecnico/eliminar.ts` (+ test), `src/components/tecnico/tarjeta-borrador.tsx`, `src/components/tecnico/inicio-tecnico.tsx`.
- **Verificación:** lint y typecheck sin errores · test nuevo de `eliminarBorrador` 3/3 · prueba en Chrome con el ratón: se creó un borrador de prueba, se deslizó, apareció «Eliminar», la confirmación lo borró de la lista y de Dexie sin tocar los demás borradores.
- **Pendiente / riesgos:** el deslizamiento se probó con el ratón, **no con el dedo en un teléfono** (usa eventos de puntero y `touch-action: pan-y`). Es una eliminación local: un borrador no existe en el servidor hasta enviarse. Al eliminar una corrección en curso, la rechazada vuelve a mostrar «Corregir y reenviar».

### 2026-10-30 · [WEB] TAG normalizados con guiones y nombres del Maestro más limpios
- **Autor:** Cristóbal (con Claude) · rama `feat/flujo-4-pasos-tag`
- **Qué se hizo:** el export normaliza los TAG con guiones (`740XF001` → `740-XF-001`; 889 de 1.073 con el formato `999-AA-999`, 732 reescritos) y quita de nombre e instalación los paréntesis que no son parte del nombre: aclaraciones como «SOLO MUESTRAS DE ACEITE» (41 equipos → campo `nota`) y datos de placa como kVA/MVA/N.° de serie (330 → campo `datos`, que el selector muestra como línea secundaria). El TAG del Maestro se conserva en `tagFuente` y la búsqueda encuentra ambas formas. El `.xlsx` no se modificó.
- **Archivos:** `scripts/export-maestro.py`, `src/data/maestro-tags.json`, `src/lib/formatos/tags.ts` (+ test), `src/components/tecnico/selector-tag.tsx`, `docs/EXPORT_MAESTRO.md`, `docs/MAPEO_ZONA_AREA.md`.
- **Verificación:** export sin TAG repetidos tras normalizar · lint y typecheck sin errores · tests 96/96 · no se volvió a probar en el navegador ni a correr el build.
- **Pendiente / riesgos:** 184 TAG quedan sin el formato estándar a propósito (celdas `380VCP-W32 52-n`, `52-101`, `52-E1`, `XF-6001`, `160PMAP`, y los compuestos «equipo / celda»); las inspecciones ya guardadas con el TAG anterior no se reescriben, así que el historial por TAG de esas pruebas no coincide con el nuevo texto. Quedan 220 paréntesis en nombres (p. ej. `(WHIPP & BOURNE)`, `(MAURO)`, `(PUERTAS, CHAPAS…)`) pendientes de decidir.

### 2026-10-30 · [WEB] Flujo de 4 pasos con catálogo de 60 formatos y selector de TAG desde el Maestro
- **Autor:** Cristóbal (con Claude) · rama `feat/flujo-4-pasos-tag`
- **Qué se hizo:** el flujo Área → Equipo → Modo pasa a Área → Trabajo (Inspección/Mantención) → Familia → Formato, con una fuente única de 60 formatos (`INSP`/`MANT`, 7 familias; solo INSP-12 «disponible»). Se agrega el área **Valle** (quinta, migración 0011). El campo TAG pasa a ser un selector con buscador alimentado por el Maestro de TAG (1.073 equipos): filtra por designador del formato y por área, con sectores (Planta, Tranque, GG…), «Ver todas las áreas», «Equipo sin TAG» y «+ Equipo» en formatos de generación. Los TAG **provisionales** (propuesto/reasignado) se pueden elegir con la insignia «TAG provisional» y quedan marcados en el registro; supervisión lo ve en el detalle.
- **Archivos:** `src/lib/formatos/{catalogo,tags}.ts` (+ tests), `src/components/tecnico/{nueva-inspeccion,selector-tag,formulario}.tsx`, `src/components/revision/detalle.tsx`, `scripts/export-maestro.py`, `src/data/maestro-tags.json`, `docs/EXPORT_MAESTRO.md`, `docs/MAPEO_ZONA_AREA.md`, `supabase/migrations/0011_area_valle.sql`, `supabase/seed.sql`.
- **Cómo se guarda:** en la cabecera del registro (ya viaja entera en `answers._header`): `tag` (texto, igual que antes), `tag_estado` (`oficial`, `por_validar`, `propuesto`, `reasignado`, `sin_tag`), `tag_original` (reasignados), `equipos_extra` (JSON, varios equipos) y `formato`. Sin cambios de esquema ni de registros anteriores (un registro sin `tag_estado` se lee como oficial).
- **Verificación:** `pnpm lint` y `pnpm typecheck` sin errores · `pnpm test` 95/95 (20 nuevos) · `pnpm build` correcto · export: 1.073 equipos, 793 oficial / 254 propuesto / 25 reasignado / 1 por validar, 0 discrepancias entre la hoja «Cambios y propuestas» y el color · migración 0011 aplicada en Supabase local · prueba en Chrome (`next dev`): 5 áreas y «Paso n de 4»; Mina → Inspección → Transformadores = INSP-06, 07 (Próximamente) e INSP-12; Mauro → Mantención = 5 familias y los 11 formatos pedidos; Puerto → Switchgear = INSP-13, 20, 29; Valle ve solo transversales; INSP-12 abre con el selector filtrado a XF de Mina; un TAG reasignado guarda estado y TAG original.
- **Pendiente / riesgos:** no se probó el envío completo ni el detalle de supervisión con un TAG provisional (solo el guardado en el borrador); el campo «sin TAG» y «+ Equipo» no se probaron en navegador (sí su lógica en tests); sin probar sin red (el JSON de TAG carga bajo demanda y entra al precaché). Sectores dudosos y 91+105 filas sin sector en `docs/MAPEO_ZONA_AREA.md`. XF aéreo/piso: el Maestro no alcanza (160 de 353 sin dato), solo se muestra la insignia cuando lo dice. MANT-02, 08 y 17: áreas por confirmar. No hay lectura de QR (sin librería). El selector no valida que el TAG pertenezca al formato más allá del filtro.

### 2026-10-30 · [WEB] El técnico ve sus inspecciones enviadas y corrige las rechazadas
- **Autor:** CNAVEA98 con Claude (rama `feat/pwa-offline`)
- **Qué se hizo:** en `/tecnico`, además de los borradores, aparece la sección «Enviadas» con las últimas 50 inspecciones del técnico: TAG, folio, fecha y estado (Enviada · en revisión, Revisada por supervisor, Aprobada, Rechazada). Las rechazadas muestran el motivo del supervisor o planificador y el botón «Corregir y reenviar»: crea un borrador nuevo con la cabecera, respuestas, observaciones y participantes copiados; la corrección sale como inspección nueva con otro folio (la rechazada es definitiva y no se toca). El formulario muestra un aviso con el folio rechazado y el motivo. Tras enviarla, la tarjeta dice «Ya envió su corrección (folio)». La lista se guarda en el equipo (Dexie) para verla sin red; corregir exige red porque lee las respuestas del servidor.
- **Qué NO se copia:** las fotos y la firma del participante (viven en el servidor, no en el equipo); hay que tomarlas de nuevo. Las respuestas ML quedan con su observación y un hallazgo nuevo de severidad «media» (la severidad original no se conserva).
- **Archivos:** `src/lib/tecnico/enviadas.ts` (+ `enviadas.test.ts`, 6 tests), `src/components/tecnico/inicio-tecnico.tsx`, `src/components/tecnico/formulario.tsx`, `src/lib/offline/db.ts` (campo opcional `correccion` del borrador; sin cambio de esquema de Dexie ni de Postgres).
- **Verificación:** `pnpm lint` y `pnpm typecheck` sin errores · `pnpm test` 75/75 · `pnpm build` correcto. **Navegador (Chrome, `next dev`, Supabase local):** con `tecnico.a@bbosch.cl` la sección muestra las inspecciones con su estado; en la rechazada `INS-2026-000023` aparece el motivo; «Corregir y reenviar» abre el formulario con el aviso y los datos copiados (TAG, OT, ejecutor, observaciones, consideraciones, participantes); al llegar al cierre la única falta era la firma; se firmó, se envió y entró como `INS-2026-000024` («Enviada · en revisión»); la tarjeta rechazada pasó a «Ya envió su corrección». Sin errores en la consola.
- **Datos de prueba que quedaron en la base local:** `INS-2026-000023` (rechazada, creada por SQL copiando respuestas de la 000006, TAG `PRUEBA-CORR-01`) y `INS-2026-000024` (su corrección). Se pueden borrar desde la bandeja del administrador.
- **No verificado:** corregir con fotos en los ítems (la copia las descarta; probado solo en tests), la lista de enviadas sin red real (probada en tests con la copia local), una inspección rechazada por el planificador (mismo flujo; el estado `rejected` es el mismo) y el uso en teléfono.
- **Pendiente / riesgos:** (1) la severidad del hallazgo no se conserva al corregir; (2) un técnico con cuenta compartida ve las enviadas de la cuenta, no solo las suyas (la cuenta puede ser compartida; el nombre de quien realizó va en cada inspección pero la lista no lo muestra); (3) no hay límite de correcciones por inspección rechazada, solo se ofrece una a la vez.

### 2026-10-30 · [WEB] PWA instalable y uso sin servidor (service worker con Serwist)
- **Autor:** CNAVEA98 con Claude (rama `feat/pwa-offline`, creada sobre `feat/roles-turnos-firma-doble`)
- **Qué se hizo:** la app se instala y el área del técnico abre sin red. Service worker (`src/app/sw.ts`) servido en `/serwist/sw.js`: precachea los 28 archivos del build (JS, CSS, fuentes, logo) y guarda las páginas `/tecnico`, `/tecnico/nueva` y el formulario (red primero, con espera máxima de 4 s y copia local si falla). Manifest e íconos (`src/app/manifest.ts`, `public/icons/`). Las páginas se guardan al abrir la app con red y al volver la conexión (`src/lib/offline/paginas.ts`); al cerrar sesión se borran, porque llevan el nombre del técnico. El formulario ahora toma el `id` de la URL (todas las inspecciones comparten una sola página guardada; los datos salen de Dexie), para poder abrir una inspección creada sin red. El service worker solo se registra en producción.
- **Decisión de herramienta:** se usó `@serwist/turbopack` en vez de `@serwist/next`. Este último obliga a compilar con webpack y, con webpack, el CSS de Tailwind sale sin estilos (se comprobó en el build: falta `bg-graf`), porque el loader está configurado solo para Turbopack. Dependencias nuevas (autorizadas por el usuario): `serwist`, `@serwist/turbopack`, `esbuild`, `esbuild-wasm` (este último es dependencia obligatoria de `@serwist/turbopack`). pnpm avisa que ignora los scripts de instalación de `esbuild` y `@swc/core`; no se aprobaron y `esbuild` funciona igual. El build sigue siendo el normal (`next build`, sin `--webpack`).
- **Archivos:** `src/app/sw.ts`, `src/app/serwist/[path]/route.ts`, `src/app/manifest.ts`, `src/app/layout.tsx`, `next.config.ts`, `src/proxy.ts`, `src/lib/offline/paginas.ts`, `src/components/tecnico/{formulario,nueva-inspeccion,tecnico-provider}.tsx`, `src/components/shared/sign-out-button.tsx`, `public/icons/*`, `tsconfig.json`, `tsconfig.sw.json`, `package.json`, `pnpm-lock.yaml`.
- **Verificación:** `pnpm lint` sin errores · `pnpm typecheck` sin errores (ahora revisa también el service worker con `tsconfig.sw.json`; el worker queda fuera del `tsconfig.json` porque su tipado de `webworker` rompe los tipos del DOM del resto) · `pnpm test` 69/69 · `pnpm build` correcto con 28 entradas precacheadas. **Prueba real en Chrome** con `next start` en el puerto 3100 y Supabase local: tras entrar como `tecnico.a@bbosch.cl` el service worker queda activo y controlando la página, con el precaché y las 3 páginas en `mlp-paginas`. Se apagó el servidor de la app y: `/tecnico` abre desde la copia local; «Nueva inspección» → Área → Equipo → Modo crea el borrador y abre el formulario con un `id` que el servidor nunca vio; recargar esa URL también abre el formulario con el borrador. Con el servidor de nuevo arriba, «Salir» borra `mlp-paginas`.
- **No verificado:** (1) **corte total de red**: en la prueba solo se apagó el servidor de la app; Supabase local seguía disponible, así que el envío y la sincronización con la red caída no se probaron de punta a punta (esa lógica sí tiene tests unitarios en `outbox.test.ts`). (2) Completar y enviar una inspección sin red, y verla después en la bandeja del supervisor (prueba de aceptación, pendiente 9). (3) La instalación en un teléfono real (Android e iOS) y el aspecto de los íconos; en iOS el manifest se usa de forma limitada. (4) Actualización del service worker cuando hay una versión nueva con la app abierta (`skipWaiting` y `clientsClaim` activados). (5) El funcionamiento en `next dev` (el worker está desactivado ahí).
- **Pendiente / riesgos:** (1) un técnico que nunca abrió la app con red no puede usarla sin red (hace falta una primera carga con conexión, que además baja el catálogo). (2) Los íconos son el logo sobre fondo claro, hechos a mano; conviene que diseño los revise. (3) Si cambia el contenido de las páginas del técnico, la copia local se actualiza sola al abrir la app con red. (4) Las áreas de supervisor, planificador y administrador siguen necesitando conexión (decisión de alcance).

### 2026-10-30 · [WEB] Test RLS en pgTAP (cierra el Checkpoint 1)
- **Autor:** CNAVEA98 con Claude (rama `feat/roles-turnos-firma-doble`)
- **Qué se hizo:** `supabase/tests/rls.test.sql` con 30 pruebas pgTAP sobre los usuarios del seed, dentro de una transacción que se revierte (no deja datos; solo consume números del folio). Cubre: (1) visibilidad: cada técnico ve solo lo suyo y supervisor, planificador y administrador ven ambos turnos; (2) perfiles: el técnico no se asciende ni cambia su turno, el supervisor no cambia el rol de otro, el administrador sí cambia el turno; (3) catálogo: solo el administrador escribe; (4) `audit_log` solo lo lee el administrador; (5) firma doble: técnico y administrador no firman, el planificador no firma antes del supervisor, comentario obligatorio, el supervisor no firma dos veces, flujo `submitted` → `supervisor_signed` → `approved`, una aprobada no la modifica el técnico, rechazo del supervisor deja la inspección en `rejected`; (6) eliminación: el supervisor no puede, el DELETE directo (también del administrador) no borra y la función `delete_inspections` sí, con auditoría. Se corre con `corepack pnpm supabase test db` (descarga la imagen `pg_prove` la primera vez; requiere Docker y el seed aplicado).
- **Archivos:** `supabase/tests/rls.test.sql` (nuevo), `docs/BITACORA.md`.
- **Verificación:** `supabase test db` → `All tests successful`, 30/30. La primera corrida mostró 2 fallos que eran de mi expectativa (un UPDATE o DELETE filtrado por RLS afecta 0 filas y no lanza error); se cambiaron para comprobar el efecto real. No se tocó código de la app, así que no se repitieron lint, tsc, tests ni build.
- **Pendiente / riesgos:** el test no cubre las políticas de Storage ni las tablas hijas (`answers`, `findings`, `attachments`: escritura solo del técnico dueño en borrador), ni la RPC `submit_inspection` ni la lectura por lado del cliente (PostgREST); depende de los correos y turnos del seed y falla si se cambian. Los turnos A/B no restringen nada (es una decisión), por eso no hay prueba de «no ver otro turno».

### 2026-10-30 · [WEB] Prueba en navegador del login por rol y del panel de firma del supervisor
- **Autor:** CNAVEA98 con Claude (rama `feat/roles-turnos-firma-doble`)
- **Qué se hizo:** prueba manual en Chrome contra la app y Supabase locales. Solo se probó, no se cambió código.
- **Verificación:** (1) el administrador ya tenía sesión y vio la bandeja con sus 4 inspecciones. (2) Se cerró sesión y se entró con `supervisor.b@bbosch.cl`: redirige a `/supervisor` y la bandeja muestra «Por firmar» con 3 inspecciones y el enlace «Revisar y firmar». (3) En el detalle de `INS-2026-000007`, «Firmar» sin datos muestra los 3 mensajes (elegir decisión, comentario obligatorio, falta la firma). (4) Elegir Aprobar, escribir el comentario y dibujar la firma con el mouse funciona. (5) Aparece el cuadro de confirmación propio («Va a APROBAR la inspección… es definitiva») y deja los campos bloqueados. (6) «Confirmar y firmar» guarda: en «Firmas de revisión» aparece «Supervisor · aprobó · Supervisor Turno B · 30-10-2026 16:10», con el comentario y la imagen de la firma. Sin errores en la consola del navegador. Esto cierra el «no verificado» de la entrada del panel de firma, salvo lo indicado abajo.
- **Segunda etapa (misma sesión):** con `planificador.a@bbosch.cl` la bandeja lista 2 inspecciones por firmar y el detalle muestra la firma del supervisor y el panel del planificador. Se aprobó `INS-2026-000007`: quedó con las dos firmas (supervisor 16:10, planificador 16:44), comentario e imagen de cada una. El rechazo se probó solo hasta el cuadro de confirmación («Va a RECHAZAR… es definitiva», decisión en rojo, comentario obligatorio) y se canceló con «Volver» sobre `INS-2026-000009`, que sigue por firmar; no se confirmó para no cerrar una inspección con firma manuscrita de pruebas anteriores. Sin errores en la consola.
- **Efecto sobre los datos:** `INS-2026-000007` quedó en «Aprobada» (dato de prueba local).
- **No verificado:** que «Confirmar y firmar» de un rechazo guarde el estado «Rechazada» desde la interfaz (sí se probó en SQL), la firma con lápiz táctil y el uso en teléfono.
- **Pendiente / riesgos:** el pull request no se abrió desde aquí porque la CLI `gh` no está instalada; se abre con el enlace `https://github.com/CNAVEA98/Inspecciones_BBOSCH/pull/new/feat/roles-turnos-firma-doble`.

### 2026-10-30 · [WEB] Buscador y consulta en la bandeja; eliminación por el administrador
- **Autor:** CNAVEA98 con Claude (rama `feat/roles-turnos-firma-doble`)
- **Qué se hizo:** la bandeja (admin, supervisor, planificador) tiene buscador de texto (folio, TAG, equipo, área, modo, quien realizó, cuenta; sin distinguir tildes) y consulta por TAG exacto, turno y rango de fechas de envío; viaja en la URL. Al hacer clic en el TAG de una fila se ve el historial de ese equipo. El administrador marca casillas y elimina con cuadro de confirmación (folios listados). Cada eliminación deja copia de la fila (y de sus firmas) en `audit_log` con quién la hizo, y borra los archivos de Storage.
- **Archivos:** `supabase/migrations/0009_admin_elimina_inspecciones.sql` y `0010_delete_inspections_firmas.sql` (RPC `delete_inspections`, guards que ceden solo a un administrador dentro del RPC, política de borrado en Storage), `src/lib/revision/consulta.ts` (+ test), `src/components/revision/{bandeja,tabla-bandeja}.tsx`, `src/app/admin/actions.ts`, páginas de bandeja de los 3 roles, `src/lib/fecha.ts` (`fechaIso`).
- **Verificación:** lint y tsc sin errores · tests 69/69 · build correcto · SQL con rollback: el supervisor no puede borrar, el DELETE directo del admin no borra, el RPC borra inspección con respuestas, adjuntos y firmas y registra la auditoría (la 0009 fallaba con inspecciones firmadas; corregido en la 0010) · navegador (Chrome, local): búsqueda y filtro por TAG, casillas, confirmación y borrado de una inspección de prueba, que desapareció de la lista y de la base. El navegador detectó un error que el build no (función pasada de servidor a cliente), ya corregido.
- **Pendiente / riesgos:** no verificado: borrado de archivos en Storage desde la app (la prueba usó una inspección sin adjuntos) ni el borrado de varias a la vez. La búsqueda de texto se hace sobre las últimas 1000 inspecciones del estado elegido. El folio eliminado no se reutiliza (queda un salto en la numeración). Base de datos de equipos con TAG (para elegir un TAG y consultar solo ese equipo): sigue pendiente, ver `docs/ARBOL_INSPECCIONES.md`; hoy el TAG es texto libre del técnico.

### 2026-10-30 · [WEB] Firma de revisión en las pestañas de supervisor y planificador
- **Autor:** CNAVEA98 (con Claude) · rama `feat/roles-turnos-firma-doble`
- **Qué se hizo:** el detalle de una inspección ahora tiene un panel «Revisión» para quien debe firmar: el supervisor ve el panel cuando la inspección está *Enviada*, y el planificador cuando está *Firmada por supervisor*. El administrador no firma. El panel pide decisión (Aprobar / Rechazar), comentario obligatorio y firma dibujada, valida antes de enviar, pide una confirmación («Va a APROBAR/RECHAZAR…, es definitivo») y luego sube la firma al bucket `signatures` (ruta única por intento) y llama a `review_inspection`. En la bandeja, las filas pendientes del rol muestran «Revisar y firmar» además de «PDF»; el detalle tiene el acceso «Ir a firmar ↓». `SignatureField` pasó a `components/shared` con texto de ayuda configurable (mouse o lápiz en escritorio).
- **Decisión de diseño:** la firma se dibuja cada vez (queda como evidencia propia de cada revisión); no hay firma guardada en el perfil. Un rechazo (de cualquiera de las dos etapas) cierra la inspección; el técnico debe crear una nueva. No se cambió el orden obligatorio supervisor → planificador, que ya garantiza la base de datos.
- **Archivos:** `src/components/revision/panel-revision.tsx` (nuevo), `src/components/revision/{detalle,bandeja}.tsx`, `src/components/shared/signature-field.tsx` (movido desde `tecnico`), `src/components/tecnico/formulario.tsx` (import), `src/app/{supervisor,planificador}/[id]/page.tsx`, `src/lib/revision/estado.ts` (+ tests).
- **Verificación:** `pnpm lint` sin errores · `pnpm tsc --noEmit` sin errores · `pnpm test` 59/59 · `pnpm build` correcto. **Flujo completo contra la app local** (inicio de sesión real de cada rol, páginas pedidas por HTTP, mismas llamadas de Storage y RPC que usa el panel), 20/20 comprobaciones: el supervisor ve el panel con la inspección *Enviada*, y ni el planificador ni el administrador lo ven; la bandeja del supervisor ofrece «Revisar y firmar»; sin comentario la base de datos rechaza («El comentario es obligatorio»); el planificador no puede firmar antes; el supervisor firma y la inspección pasa a *Firmada por supervisor*; entonces el panel pasa al planificador y su bandeja la lista; el supervisor no puede firmar dos veces; el planificador rechaza y el administrador ve el rechazo con su comentario; en estado final no hay panel. Las inspecciones de prueba se eliminaron (`audit_log` conserva su rastro porque es de solo inserción). Una primera corrida falló 2 de 22 comprobaciones del supervisor por compilación en caliente del servidor de desarrollo; repetida sobre una inspección nueva, pasaron todas.
- **No verificado:** **el uso en un navegador real**: dibujar la firma con el mouse, pulsar los botones, el mensaje de validación y el cuadro de confirmación. Lo comprobado es la lógica de servidor, los permisos y los datos, no la interacción del panel. Tampoco se probó la firma dibujada con lápiz táctil.
- **Pendiente / riesgos:** (1) probar el panel en el navegador con `supervisor.b@bbosch.cl` y `planificador.a@bbosch.cl`; (2) tras un rechazo el técnico no puede corregir la misma inspección (se evaluó y se dejó como mejora futura); (3) si falla la llamada `review_inspection` tras subir la firma, queda una imagen huérfana en `signatures` (inofensiva, no se muestra); (4) el PDF de una inspección firmada ya incluye ambas firmas, pero no se guarda congelado en el bucket `reports`.

### 2026-10-30 · [WEB] Descarga del informe en PDF (administrador, supervisor y planificador)
- **Autor:** CNAVEA98 (con Claude) · rama `feat/roles-turnos-firma-doble`
- **Qué se hizo:** cada inspección enviada se descarga como PDF desde la bandeja (columna «Informe») y desde el detalle (botón «Descargar PDF»). El PDF reproduce el diseño «Cobre» de `docs/muestras/informe-transformador-piso.html`: encabezado grafito con logo BBOSCH, norma y estado; TAG grande; cuadrícula de datos del equipo; resultado con barra por estado (BN/ML/NT/NA/NR) y alerta de críticos; lecturas con barra y marca del máximo contra el límite; ítems agrupados por sección con pastillas de estado y observaciones; diagnóstico; tarjetas de firma (participantes, encargado, supervisor, planificador, con imagen, nombre y fecha); registro fotográfico con foto por ítem. Se agregó «Realizado por» y «Cuenta de envío · Turno» para la trazabilidad. Se genera en el servidor al pedirlo (no se guarda en Storage), así siempre refleja las firmas vigentes. El técnico no puede descargarlo (se le redirige a `/tecnico`).
- **Archivos:** `src/lib/informe/{modelo,generar.tsx,responder.ts}`, `src/lib/informe/modelo.test.ts`, `src/components/informe/informe-pdf.tsx`, `src/app/{admin,supervisor,planificador}/[id]/pdf/route.ts`, `src/components/revision/{bandeja,detalle}.tsx`, `src/lib/revision/estado.ts`.
- **Verificación:** `pnpm lint` sin errores ni avisos · `pnpm tsc --noEmit` sin errores · `pnpm test` 56/56 (10 nuevos del modelo, con la plantilla real del seed) · `pnpm build` correcto (aparecen las 3 rutas `/pdf`). **Prueba real contra la app local** (inicio de sesión con la librería de la app, petición a la ruta, conversión a imagen): admin, supervisor.b y planificador.a reciben `200 application/pdf`; técnico.a recibe `307 → /tecnico` en las rutas de admin y supervisor. Se revisaron visualmente `INS-2026-000006` y una inspección de prueba con foto JPEG, foto PNG, firma del participante y firmas de supervisor y planificador (esa inspección de prueba se eliminó después; los registros de `audit_log` quedan porque ese log es de solo inserción). Se corrigieron dos fallos vistos en esa revisión: cajas de diagnóstico encima de las firmas y título de grupo huérfano al pie de página.
- **Diferencias con la muestra:** la muestra usa las fuentes Geist y Geist Mono; el PDF usa Helvetica y Courier (incluidas en el PDF, sin descargar nada). El contenido y la composición son los de la muestra, la tipografía no. Las páginas son fluidas (se cortan donde corresponde) en vez de las 3 hojas fijas de la muestra. Las fotos aceptan PNG y JPEG; otros formatos se omiten.
- **No verificado:** el PDF abierto desde un navegador real con el botón (se probó la ruta con peticiones HTTP); un informe con muchas fotos (más de una página de fotos); `INS-2026-000003` (la enviada por la PWA) no se revisó visualmente; no se comparó pixel a pixel con la muestra.
- **Pendiente / riesgos:** (1) el PDF depende del diseño de la plantilla vigente (`readings`, `meta`, secciones): los otros formatos heredan el mismo diseño pero cada uno necesitará revisar sus lecturas; (2) si más adelante se quiere un PDF inmutable por inspección aprobada, guardarlo en el bucket `reports` al firmar el planificador; (3) el técnico no puede descargar su propio informe (pedido solo para admin, supervisor y planificador).

### 2026-10-30 · [WEB] Propuesta de árbol de inspecciones (solo documento)
- **Autor:** CNAVEA98 (con Claude) · rama `feat/roles-turnos-firma-doble`
- **Qué se hizo:** se leyeron los 40 Word de `C:\Proyectos\INSPECCIONES KIZEO` (fuera del repo) y se propuso la estructura Área → Instalación → Sistema → Tipo de equipo → Variante → Modo → TAG. Ubicaciones confirmadas por el usuario: Chacay (Tranque, Planta, STATCOM, Piuquenes), Mina (Sala 12, SE Móviles, Parrones), El Mauro (Tranque general), Los Vilos (SE Los Vilos, Desalinizadora, PPCH). Chacay y Mina son sectores distintos (1600 m y 3200 m).
- **Archivos:** `docs/ARBOL_INSPECCIONES.md` (nuevo).
- **Verificación:** no aplica a código. La clasificación de formatos por sistema e instalación sale de los nombres de los documentos y de una comparación automática de texto; **es supuesto, no confirmado**. No se tocó código ni base de datos.
- **Pendiente / riesgos:** 5 decisiones abiertas listadas en el documento (formato 40, STMG, generadores sueltos, modo Plan Matriz vs Mantenimiento programado, agrupación en sistemas). Nada de esto está implementado: la app sigue con un solo formato (Transformador de piso × Plan Matriz).

### 2026-10-30 · [WEB] Trazabilidad: quién realizó la inspección + turno, y revisión de todos los perfiles
- **Autor:** CNAVEA98 (con Claude) · rama `feat/roles-turnos-firma-doble`
- **Qué se hizo:** (1) el formulario del técnico pide «Nombre de quien realiza la inspección» (obligatorio, paso «Datos del equipo»); se guarda en `inspections.performed_by`. (2) Se guarda `inspections.technician_shift`, el turno de la cuenta al enviar (foto fija, aunque el admin cambie el turno después). (3) Bandeja y detalle muestran «Técnico: nombre», «Cuenta: …» y Turno. (4) Visibilidad entre turnos: sin cambios de código, `is_staff()` no filtra por turno; se comprobó.
- **Migración nueva:** `supabase/migrations/0008_ejecutor_turno.sql` (columnas + `submit_inspection` actualizada). Aplicada en Supabase local con `supabase migration up` (sin reset, se conservaron los datos). Inspecciones previas se rellenaron con el nombre y turno de la cuenta.
- **Archivos:** `src/lib/tecnico/draft.ts`, `src/lib/offline/db.ts`, `src/components/tecnico/formulario.tsx`, `src/lib/revision/queries.ts`, `src/components/revision/{bandeja,detalle}.tsx`, tests `draft.test.ts` y `outbox.test.ts`.
- **Verificación:** `pnpm lint` sin errores · `pnpm tsc --noEmit` sin errores · `pnpm test` 45/45 · `pnpm build` correcto. **Prueba de perfiles contra la BD local** (SQL con el JWT de cada usuario del seed, transacción revertida, script no guardado en el repo): técnico A y técnico B envían por la RPC real; cada técnico ve solo lo suyo (1); supervisor A/B, planificador A/B y admin ven las 2 (trazabilidad entre turnos OK); el supervisor B ve «Pedro Soto · turno A · cuenta Técnico Turno A». Firma: planificador no firma antes del supervisor, técnico y admin no firman, supervisor B firma lo del turno A, planificador B aprueba, doble firma del mismo supervisor falla, técnico no puede modificar una aprobada (0 filas), rechazo sin comentario falla, un supervisor no puede ascenderse a admin.
- **No verificado:** el formulario nuevo en navegador (campo, validación, envío real desde la PWA) y las pantallas con cada rol; la prueba SQL no pasa por la capa Next/PostgREST.
- **Pendiente / riesgos:** (1) envíos viejos en la cola del navegador (sin `performed_by`) entran con nombre vacío (la BD es permisiva; el cliente lo exige solo en envíos nuevos); (2) la prueba de perfiles conviene convertirla en `supabase/tests/rls.test.sql` (pgTAP, pendiente 3); (3) aprobar/rechazar desde la pantalla sigue pendiente.

### 2026-10-30 · [WEB] Bandeja y detalle de solo lectura para supervisor y planificador
- **Autor:** CNAVEA98 (con Claude) · rama `feat/roles-turnos-firma-doble`
- **Qué se hizo:** la bandeja lista las inspecciones con filtro por estado (por firmar, todas, aprobadas, rechazadas). El detalle muestra datos generales, respuestas por sección según la plantilla, fotos (URL firmada de 1 hora), hallazgos, diagnóstico, participantes con su firma y las firmas de revisión. Componentes compartidos entre `/supervisor` y `/planificador`. **Aún no se puede aprobar ni rechazar desde la pantalla.**
- **Comprobación de que el envío del técnico llega a la BD:** en Supabase local hay 1 inspección `INS-2026-000003` (`submitted`, TAG `740-XF-001`) con 32 respuestas, 2 hallazgos, 1 adjunto y 1 archivo en Storage. El envío funciona; lo que faltaba era la pantalla del supervisor.
- **Archivos:** `src/lib/revision/{estado,queries}.ts`, `src/lib/revision/estado.test.ts`, `src/components/revision/{bandeja,detalle}.tsx`, `src/app/supervisor/{page.tsx,[id]/page.tsx}`, `src/app/planificador/{page.tsx,[id]/page.tsx}`.
- **Verificación:** `pnpm lint` sin errores · `pnpm tsc --noEmit` sin errores · `pnpm test` 43/43 · `pnpm build` correcto. **No verificado en navegador:** la bandeja y el detalle no se abrieron con un supervisor real, así que las consultas con relaciones de PostgREST (`profiles!technician_id`, `profiles!signer_id`) y las URL firmadas no se han probado.
- **Ampliación (mismo día):** el administrador entró y vio la bandeja vacía porque `/admin` seguía siendo una maqueta. Se conectó la misma bandeja y el detalle en `/admin` y `/admin/[id]` (solo lectura, por defecto «Todas»). Archivos: `src/app/admin/{page.tsx,[id]/page.tsx}`. Verificación: lint, tsc, tests 44/44 y build correctos; sigue sin probarse en navegador.
- **Pendiente / riesgos:** (1) probar en el navegador con `supervisor.a@bbosch.cl`; (2) solo hay 1 adjunto en la inspección enviada, por lo que las fotos de los ítems se ven poco o nada; conviene revisar si las fotos se están subiendo y asociando; (3) aprobar/rechazar con comentario y firma dibujada (RPC `review_inspection` ya existe); (4) filtros por área, equipo y fecha; (5) los folios 000001 y 000002 se consumieron sin inspección guardada, probablemente por envíos que fallaron y revirtieron.

### 2026-10-30 · [WEB] Roles (admin, supervisor, planificador, técnico), turnos A/B y firma doble
- **Autor:** CNAVEA98 con Claude · rama `feat/roles-turnos-firma-doble`
- **Qué se hizo:** cuatro roles con turno A/B. Técnico llena formularios; supervisor firma la 1.ª etapa (`submitted` → `supervisor_signed`); planificador firma la 2.ª (`supervisor_signed` → `approved`) y descargará el PDF; cualquiera de los dos puede rechazar (`rejected`, terminal). Solo el administrador cambia rol y turno, ve todo y escribe catálogo y plantillas (no firma ni llena formularios). Supervisores y planificadores solo leen y firman. El turno es solo una etiqueta (no limita la visibilidad). Se eliminó «Crear cuenta» del login y se agregó el logo BBOSCH. La gestión de usuarios pasó de `/supervisor/usuarios` a `/admin/usuarios` (rol + turno). Áreas nuevas: `/admin`, `/planificador`.
- **Archivos:** `supabase/migrations/0007_roles_turnos.sql`, `supabase/seed.sql`, `src/lib/auth/roles.ts` (+ test), `src/lib/auth/session.ts`, `src/proxy.ts`, `src/components/shared/staff-shell.tsx`, `src/app/{admin,planificador,supervisor}/`, `src/app/login/*`.
- **Verificación:** `pnpm lint` sin errores · `pnpm tsc --noEmit` sin errores · `pnpm test` 38/38 · `pnpm build` correcto · `supabase db reset` aplica 0001–0007 y el seed sin errores. Pruebas SQL con rollback en la base local (como cada rol): supervisor no cambia roles (RLS, 0 filas); técnico no se auto-asciende ni cambia su turno (trigger); admin cambia rol y turno; técnico B no ve inspecciones del A; supervisor, planificador y admin las ven; planificador no firma antes del supervisor; admin no firma; supervisor no firma dos veces; flujo completo `submitted` → `supervisor_signed` → `approved`; una inspección aprobada no se puede modificar. **No verificado:** login y navegación por rol desde el navegador, la pantalla `/admin/usuarios` con datos, el logo en pantalla, y el rechazo en etapa 2 (solo por lectura del código).
- **Pendiente / riesgos:** (1) no existe UI para crear cuentas: hoy solo se crean por seed o por Supabase; falta una pantalla de alta en `/admin/usuarios`. (2) Las bandejas, la firma dibujada y el PDF siguen pendientes (pendientes 6 y 7); `review_inspection` ya soporta ambas etapas. (3) El rechazo sigue siendo terminal (la inspección rechazada no vuelve al técnico), igual que antes; si se quiere que vuelva a corrección, es un cambio aparte. (4) Antes solo el supervisor escribía catálogo y plantillas; ahora solo el administrador. (5) El seed trae usuarios `@bbosch.cl` para cada rol/turno, más los anteriores, cada uno con una contraseña numérica de 8 dígitos distinta (ver `supabase/seed.sql`); la `1234` anterior ya no sirve y además el formulario exige mínimo 8 caracteres. Solo para desarrollo local; se probó el login de las 10 cuentas contra la API de auth. (6) Se hizo `supabase db reset`: se borraron los datos locales de prueba. (7) La prueba SQL fue manual (no está en `supabase/tests`); falta convertirla a pgTAP (pendiente 3). (8) El envío a SAP no está modelado.

### 2026-10-30 · [WEB] Una sola carpeta de trabajo: limpieza de copias duplicadas
- **Autor:** Claude Code (sesión de Cristóbal)
- **Qué se hizo:** la única carpeta de trabajo es `C:\Proyectos\mlp-inspecciones` (enlazada a `CNAVEA98/Inspecciones_BBOSCH`). Se eliminó el contenido de la copia antigua `E:\Proyectos\mlp-inspecciones` tras comprobar que no tenía nada que no estuviera en C: (los 6 archivos distintos eran los actualizados hoy en C:). La carpeta `entregas-vercel` (ZIP, SQL concatenados, demo) queda **obsoleta**: la demo vigente es `demo/` del repo (idéntica, comprobado archivo por archivo) y los ZIP y SQL ya no se mantienen. Las entradas antiguas de esta bitácora que citan `entregas-vercel/` o `vercel-demo.zip` se conservan como historia. `docs/DEPLOY_VERCEL.md` se reescribió: la demo se despliega desde GitHub con Root Directory `demo`, y los SQL salen de `supabase/migrations/` y `supabase/seed.sql`.
- **Archivos:** `docs/DEPLOY_VERCEL.md`, `docs/BITACORA.md`.
- **Verificación:** comparación por hash de la demo (E:, C: y `demo/`): sin diferencias. `C:\Proyectos\entregas-vercel` y `E:\Proyectos\entregas-vercel` se eliminaron por orden explícita del usuario (el primer intento fue bloqueado por el sistema de permisos; el segundo, con la orden directa, se ejecutó); se comprobó que ya no existen y que `C:\Proyectos` solo contiene `mlp-inspecciones`. **Pendiente de ejecutar por el usuario:** en `E:\Proyectos\mlp-inspecciones` queda solo la carpeta vacía `.claude` porque la sesión de Claude Code la tenía en uso; hay que borrar esa carpeta a mano tras cerrar la sesión.
- **Pendiente / riesgos:** nunca abrir Claude Code ni Visual Studio Code desde E:. El despliegue en Vercel descrito en `docs/DEPLOY_VERCEL.md` no se ha probado.

### 2026-10-30 · [WEB] Supabase local funcionando y usuario supervisor@bbosch.cl
- **Autor:** Claude Code (sesión de Cristóbal)
- **Qué se hizo:** con Docker Desktop y WSL2 operativos se levantó Supabase local (`supabase start`): **las migraciones 0001 a 0006 y el seed se aplicaron sin errores por primera vez en Postgres real**. Se agregó al seed el usuario `supervisor@bbosch.cl` (contraseña `1234`, rol `supervisor`). Se actualizó `.env.local` (no versionado) con la URL y la anon key locales. Se documentó en `CLAUDE.md` el flujo de equipo con GitHub (rama, bitácora en el mismo commit, PR).
- **Archivos:** `supabase/seed.sql`, `CLAUDE.md`, `docs/BITACORA.md`.
- **Verificación:** `supabase start` aplicó las 6 migraciones y el seed sin errores. Inicio de sesión de `supervisor@bbosch.cl` / `1234` contra la API de auth local: correcto. `/login` en `localhost:3000` responde 200. **No verificado:** inicio de sesión desde la interfaz en el navegador, redirección por rol, test RLS (sigue sin escribir) ni envío completo de una inspección.
- **Pendiente / riesgos:** la contraseña `1234` es solo para desarrollo local y está en el seed del repo (privado); no usarla en un Supabase remoto. El seed se aplica con `supabase db reset`, que borra los datos locales. Los usuarios de `mlp.local` siguen en el seed.

### 2026-10-30 · [WEB] Migración a C:\Proyectos y preparación del repositorio en GitHub
- **Autor:** Claude Code
- **Qué se hizo:** el proyecto se copió del disco E: (exFAT, sin symlinks, fallaba `pnpm install`) a `C:\Proyectos\mlp-inspecciones` (NTFS). La demo estática pasó a `demo/` dentro del repo (antes `entregas-vercel/vercel-demo`; las entradas antiguas de esta bitácora conservan la ruta vieja). Se creó `.env.local` con valores de relleno para poder abrir `localhost:3000` sin Supabase (no se versiona: `.gitignore` excluye `.env*`). Repositorio privado en GitHub: `CNAVEA98/Inspecciones_BBOSCH`. Usuario de Linux en WSL renombrado a `cnv`.
- **Archivos:** `demo/*`, `docs/formatos/LEEME.md`, `docs/BITACORA.md`.
- **Verificación:** copia comparada con el original (101 archivos cada uno, sin `node_modules` ni `.next`); revisión previa al commit sin secretos ni archivos de más de 500 KB. Ya en C: con `corepack pnpm install` normal (35 s, sin `hoisted`): `lint` sin errores, `tsc --noEmit` sin errores, `test` 33/33, `build` correcto. Con el linker `hoisted` (necesario solo en exFAT), `npm run dev` había arrancado y `/login` respondió 200 en E:. Primer commit `7fbf991` subido a `origin/main`. Esto cierra el pendiente «lint/tsc/tests/build sin verificar» de la entrada sobre la foto en ML.
- **Pendiente / riesgos:** en C: reinstalar con `corepack pnpm install` (sin `hoisted`). Supabase local sigue sin probarse (Docker/WSL2 recién instalados). Usuario `supervisor@bbosch.cl` aún no creado (hoy el seed trae `supervisor@mlp.local`). Trabajo en equipo: ramas y Pull Requests; la bitácora es el punto con más riesgo de conflicto, agregar la entrada propia arriba y resolver al unir.

### 2026-10-30 · [WEB] Formatos STN pasan a BBOSCH (firmantes)
- **Autor:** Claude Code
- **Qué se hizo:** el usuario indicó que STN era el contratista anterior y ahora es BBOSCH. En `formatos/desconectador-23kv.js` y `formatos/banco-condensadores-mauro.js` los firmantes pasan a «Supervisor BBOSCH» y «Planificador BBOSCH»; el logo BBOSCH del informe queda correcto. Se regeneró `vercel-demo.zip`.
- **Verificación:** cambio de texto en la configuración; no se volvió a probar en el navegador.
- **Pendiente / riesgos:** falta el número BBOSCH de cada estándar (hoy siguen como `EST-ELEC-INSP-MLP-STN-01` y `-02`). Los Word de `docs/formatos` no se modificaron.

### 2026-10-30 · [WEB] Demo: motor común de formularios + Desconectador 23 kV (STN-01) y Banco de Condensadores Mauro (STN-02)
- **Autor:** Claude Code
- **Qué se hizo:** nuevo `inspeccion.html` (motor común para inspecciones de un equipo) que carga la definición desde `formatos/<id>.js` según `?f=<id>`. Se crearon `formatos/desconectador-23kv.js` (24 ítems) y `formatos/banco-condensadores-mauro.js` (56 ítems), y se pasó Transformador de Piso a `formatos/transformador-piso.js` (conserva la clave de borrador `mlp-form-trafo-v1`). `formulario.html` quedó como redirección. El motor agrega lista de opciones por ítem (`opc`, usada en Abierto/Cerrado de los relés), lecturas y «Consideraciones» opcionales. Menú: se activaron los dos formatos nuevos y el formulario de grupos generadores pasó a la entrada «Insp. Prueba de Grupos Generadores… Chacay-Mina» que agregó el usuario; «Insp. Grupo Generador» queda «Próximamente».
- **Supuestos:** norma `EST-ELEC-INSP-MLP-STN-0X`, confirmada por el usuario (el texto dentro del .docx dice `EST-ELEC-MLP-STN-0X`, sin INSP). Corrientes de relé en A; termografía del desconectador con valor opcional en °C. Agrupación de ítems en secciones propias. Logo BBOSCH en el informe aunque los firmantes sean STN.
- **Archivos:** `entregas-vercel/vercel-demo/{inspeccion,formulario,inspecciones}.html`, `entregas-vercel/vercel-demo/formatos/*.js`, `entregas-vercel/vercel-demo.zip`, `docs/formatos/LEEME.md`.
- **Verificación:** Edge headless, prueba scriptada de los 3 formatos: grupos cubren todos los ítems, validación completa, ML sin observación bloquea y sin foto no, consideraciones según formato, lista Abierto/Cerrado guarda y se ve en el informe, lectura de corriente 12,5 A, firmantes STN, lecturas del transformador intactas; sin errores de JavaScript. `?f=` inexistente muestra «Formulario no encontrado». Sin prueba en teléfono ni redeploy.
- **Pendiente / riesgos:** confirmar códigos de norma, unidades y si el logo del informe debe cambiar para formatos STN.

### 2026-10-30 · [WEB] La foto deja de ser obligatoria en ML (todas las inspecciones)
- **Autor:** Claude Code
- **Qué se hizo:** a pedido del usuario, ML, NO y NR exigen solo observación; la opción de tomar foto sigue disponible en todos los ítems. Aplicado en la app Next (validador de plantillas, borrador del técnico, etiqueta «Foto (opcional)»), en los dos formularios de la demo y en la muestra de `docs/muestras`. Se actualizaron los tests y `docs/DESIGN.md`. Se regeneró `vercel-demo.zip`.
- **Archivos:** `src/lib/templates/{validate,schema,validate.test}.ts`, `src/lib/tecnico/{draft,draft.test}.ts`, `src/components/tecnico/item-field.tsx`, `docs/DESIGN.md`, `docs/muestras/formulario-transformador-piso.html`, `entregas-vercel/vercel-demo/{formulario,formulario-grupo-generador}.html`.
- **Verificación:** **lint, tsc y tests no verificados**: en este equipo Node.js no está instalado o no está en el PATH (`node`, `corepack`, `pnpm` no se reconocen). Demo verificada en Edge headless: en ambos formularios un ítem ML con observación y sin foto queda sin faltas, sin errores de JavaScript.
- **Pendiente / riesgos:** correr `corepack pnpm lint`, `tsc --noEmit`, `test` y `build` en un equipo con Node. Un hallazgo ML sin foto se envía con `photo_attachment_id = null` (la columna lo admite).

### 2026-10-30 · [WEB] Demo: formulario Pruebas Grupos Generadores Chacay-Mina (EST-ELEC-INSP-MLP-BBOSCH-18)
- **Autor:** Claude Code
- **Qué se hizo:** a partir de `docs/formatos/18_INSPECCION PRUEBAS DE GRUPOS GENERADORES…docx` se creó `formulario-grupo-generador.html` (mismo diseño y motor que el de transformador). Una inspección incluye **varios grupos generadores** (el formato pide «Cantidad de equipos»): selector de grupos con «＋ Agregar», TAG y 30 ítems por grupo. Ítems 22 y 26 usan SÍ/NO/NA/NR; ítem 27 es fecha. Reglas: ML exige observación y foto; NO y NR exigen observación. El informe muestra un resumen total y, por grupo, lecturas con horas de prueba y energía generada calculadas (horómetro y energía después − actual). Activado en el menú `inspecciones.html`.
- **Supuestos:** unidades no indicadas en el formato: Voltaje batería y Tensión cargador en V, Potencia en kW, Horómetro en h, Corrientes en A. Agrupación de ítems en 7 secciones (no está en el formato).
- **Archivos:** `entregas-vercel/vercel-demo/{formulario-grupo-generador,inspecciones}.html`, `entregas-vercel/vercel-demo.zip`.
- **Verificación:** Edge headless a 1300px y 600px sin errores de JavaScript. Prueba scriptada con 2 grupos: agregar/quitar grupo, SÍ/NO, validación (NO sin observación y ML sin foto bloquean), 58/60 conformes, horas de prueba 0,5 y energía 150 kWh correctas, fecha del extintor en dd-mm-aaaa. Sin prueba en teléfono ni redeploy.
- **Pendiente / riesgos:** confirmar unidades y si Potencia es kW; no existe aún plantilla de este formato en `supabase/seed.sql` para la app Next.

### 2026-10-30 · [WEB] Demo: menú de tipos de inspección
- **Autor:** Claude Code
- **Qué se hizo:** nueva página `inspecciones.html` con la lista de tipos (Transformador de Piso, Transformador Aéreo, Reconectador, Grupo Generador, Parrón de Maniobras). Solo Transformador de Piso abre formulario (`formulario.html`); los demás muestran «Próximamente». La lista es el arreglo `TIPOS` al inicio del script: para habilitar uno se agrega su formulario y su `href`. «Formularios Inspecciones» en la portada lleva ahora al menú, y el formulario tiene «← Volver» al menú y título «Insp. Transformador de Piso». Se regeneró `vercel-demo.zip`.
- **Archivos:** `entregas-vercel/vercel-demo/{inspecciones,index,formulario}.html`, `entregas-vercel/vercel-demo.zip`.
- **Verificación:** Edge headless a 600px: menú y barra del formulario se ven correctos. Sin redeploy ni prueba en teléfono.
- **Pendiente / riesgos:** listado final de tipos y sus formularios; en la app Next el equivalente es el catálogo de equipos y plantillas en Supabase.

### 2026-10-30 · [WEB] Demo: texto superpuesto del informe en iPhone
- **Autor:** Claude Code
- **Qué se hizo:** el informe reduce las hojas A4 con `zoom` y Safari iOS agrandaba el texto (autosizing), por lo que las filas se superponían. Se agregó `text-size-adjust: 100%` en `formulario.html` e `informe.html` de la demo. Se regeneró `vercel-demo.zip`.
- **Archivos:** `entregas-vercel/vercel-demo/{formulario,informe}.html`, `entregas-vercel/vercel-demo.zip`.
- **Verificación:** Edge a 1200px: el informe se ve igual que antes. **En iPhone no verificado** (el autosizing solo ocurre en Safari iOS; falta redeploy y prueba en el teléfono).
- **Pendiente / riesgos:** las muestras de `docs/muestras/` tienen el mismo problema; la app Next debe incluir la misma regla cuando tenga la vista de informe.

### 2026-10-30 · [WEB] Demo: se quitan botones Formulario, Informe y Cargar ejemplo
- **Autor:** Claude Code
- **Qué se hizo:** en `entregas-vercel/vercel-demo/formulario.html` se eliminaron los botones «Formulario», «Informe» (pestañas que solo se veían bajo 1000px) y «Cargar ejemplo», con su listener. En móvil queda siempre la vista del formulario; «Imprimir / PDF» pasa al informe y vuelve al formulario al cerrar la impresión (`afterprint`). Se regeneró `vercel-demo.zip`. La muestra original en `docs/muestras/` no se tocó.
- **Archivos:** `entregas-vercel/vercel-demo/formulario.html`, `entregas-vercel/vercel-demo.zip`.
- **Verificación:** Edge headless a 600px: carga sin errores de JavaScript y la barra muestra solo En línea, Borrar todo, Enviar inspección e Imprimir / PDF. La vuelta tras imprimir en un teléfono real no se probó. Sin redeploy.
- **Pendiente / riesgos:** en móvil el informe ya no se puede ver en pantalla, solo al imprimir. En la vista de informe en el teléfono el texto de los ítems se superpone (visto en captura del usuario).

### 2026-10-30 · [WEB] Portada de la demo: «Standard Job» con logo BBOSCH
- **Autor:** Claude Code
- **Qué se hizo:** en `entregas-vercel/vercel-demo/index.html` el título pasa de «Inspecciones MLP» a «Standard Job», se agrega el logo BBOSCH arriba (caja blanca redondeada, copia en `vercel-demo/brand/`) y las opciones pasan a «Formularios Inspecciones» (abre `formulario.html`) y «Formulario Mantenciones» (deshabilitada, «Próximamente», porque aún no hay plantilla de mantenimiento). Se quitó el acceso a `informe.html` desde la portada (el archivo sigue publicado). Se regeneró `vercel-demo.zip`.
- **Archivos:** `entregas-vercel/vercel-demo/index.html`, `entregas-vercel/vercel-demo/brand/bbosch-logo.png`, `entregas-vercel/vercel-demo.zip`.
- **Verificación:** captura con Edge headless a 600px: logo, título y botones correctos. No se volvió a desplegar en Vercel.
- **Pendiente / riesgos:** falta redeploy en Vercel para ver el cambio en el teléfono; definir a dónde lleva «Formulario Mantenciones».

### 2026-10-29 · [WEB] Entregables para probar en Vercel
- **Autor:** Claude Code
- **Qué se hizo:** carpeta `Proyectos/entregas-vercel/` con `mlp-inspecciones.zip` (proyecto sin `node_modules`, `.next`, `.git` ni `.env*`), `vercel-demo.zip` (HTML estáticos del formulario e informe, sin Supabase), `supabase-sql.zip` (migraciones concatenadas y catálogo con la plantilla, sin usuarios de desarrollo) y `LEEME_DEPLOY_VERCEL.md`. Guía en `docs/DEPLOY_VERCEL.md`. No se hizo ningún deploy ni se tocó ningún Supabase remoto.
- **Archivos:** `docs/DEPLOY_VERCEL.md`, `entregas-vercel/*`.
- **Verificación:** el ZIP del proyecto pesa 682 KB, sin `node_modules` y con `pnpm-lock.yaml`; los SQL no incluyen `mlp.local`. El deploy en Vercel y la ejecución de los SQL en un Supabase real **no se han probado**.
- **Pendiente / riesgos:** las migraciones nunca se han ejecutado en Postgres real; pueden fallar al primer intento. Sin service worker, la prueba con red apagada solo funciona si no se recarga la página.

### 2026-10-29 · [WEB] Flujo del técnico (UI)
- **Autor:** Claude Code
- **Qué se hizo:** inicio con lista de inspecciones e indicador de sincronización; selección Área → Equipo → Modo desde el catálogo (con copia local); formulario por secciones con estados BN/ML/NT/NA/NR, valores con unidad, fotos, severidad de hallazgo, firma dibujada, revisión y envío a la cola offline. La copia local del catálogo se muestra al instante y se actualiza en segundo plano.
- **Archivos:** `src/components/tecnico/*`, `src/app/tecnico/**`, `src/lib/tecnico/{catalog,draft,photos,hooks}.ts`, `src/lib/fecha.ts`; migración `0004` (adjunto `participant_signature`).
- **Verificación:** lint, tsc y build sin errores; `pnpm test` 33/33 (6 nuevos en `draft.test.ts`). Prueba manual a 375px con Supabase inalcanzable y catálogo simulado: selección, creación del borrador, guardado local y pantalla de revisión con 7 problemas.
- **Pendiente / riesgos:** envío completo (firma real, subida de fotos, RPC) sin probar contra Supabase; falta vista de solo lectura de enviadas; si se pulsan estado y valor en el mismo instante el valor puede pisar el estado (solo ocurre con eventos simultáneos, no con uso humano).

### 2026-10-29 · [WEB] Núcleo offline
- **Autor:** Claude Code
- **Qué se hizo:** base Dexie (borradores, cola, fotos, catálogo); cola de envío idempotente con reintentos de espera creciente (2 s hasta 5 min, 12 intentos), recuperación de entradas `sending`, distinción de errores reintentables; transporte Supabase (Storage + RPC `submit_inspection`); controlador de sincronización; compresión de fotos.
- **Archivos:** `src/lib/offline/{db,outbox,transport,sync,compress}.ts`, `outbox.test.ts`.
- **Verificación:** `pnpm test` 27/27 en ese momento (13 nuevos): encola sin red, envía al reconectar, sin duplicados (pasadas simultáneas, mismo id, respuesta perdida), fotos no se re-suben, rechazo permanente no se reintenta.
- **Pendiente / riesgos:** probado con servidor simulado, no con Supabase ni red real en el navegador; la compresión real de imagen no tiene test (solo el cálculo de tamaño).

### 2026-10-29 · [WEB] Logo BBOSCH en los formatos
- **Autor:** Claude Code
- **Qué se hizo:** logo en el encabezado de los dos formatos (Cobre y Clásico) dentro de una caja blanca redondeada; copia en `public/brand/`. Regla anotada en `docs/DESIGN.md`.
- **Archivos:** `public/brand/bbosch-logo.png`, `docs/muestras/*.html`, `docs/DESIGN.md`.
- **Verificación:** logo carga en pantalla; páginas del formato Cobre caben; Clásico quedó con 16 ítems en la página 1 y no se revisó visualmente tras el ajuste.
- **Pendiente / riesgos:** el PDF final debe usar el mismo PNG.

### 2026-10-29 · [WEB] Paso 3: autenticación y rutas por rol
- **Autor:** Claude Code
- **Qué se hizo:** clientes Supabase (navegador, servidor, proxy), `src/proxy.ts` con chequeo optimista por rol, `requireRole()` en los layouts, login y registro (solo técnico) con diseño propio, pantalla `/supervisor/usuarios` para asignar roles.
- **Archivos:** `src/proxy.ts`, `src/lib/supabase/*`, `src/lib/auth/*`, `src/app/login/*`, `src/app/{tecnico,supervisor}/**`, `src/app/globals.css`, `next.config.ts`.
- **Verificación:** lint, tsc, build sin errores; sin sesión `/tecnico` redirige a `/login?next=/tecnico`; login visto a 1440px y 375px.
- **Pendiente / riesgos:** login real, cambio de rol y RLS sin probar (sin base local). La fuente Geist no cargó en la prueba por falta de acceso a Google Fonts.

### 2026-10-29 · [WEB] Plantilla real y esquema de plantillas
- **Autor:** Claude Code
- **Qué se hizo:** el esquema Zod pasó a ítems de verificación del estándar EST-ELEC-INSP-MLP-BBOSCH-12 (estado BN/ML/NT/NA/NR, valor con unidad, observación, fotos) más cabecera, roles y lecturas. El seed reemplaza el ejemplo por la plantilla real de 29 ítems.
- **Archivos:** `src/lib/templates/{schema,validate,validate.test}.ts`, `supabase/seed.sql`.
- **Verificación:** `pnpm test` 14/14, lint y tsc sin errores.
- **Pendiente / riesgos:** plantillas de los demás equipos y del modo Mantenimiento programado.

### 2026-10-29 · [WEB] Diseño Cobre y formularios de muestra
- **Autor:** Claude Code
- **Qué se hizo:** a partir del PDF 740XF001 y el .doc del estándar se hicieron `informe-transformador-piso.html` y `formulario-transformador-piso.html` (formulario interactivo con informe en vivo, validación de reglas y envío simulado). Se eligió y luego se reemplazó SAP por el diseño Cobre; se retiró la geo-referencia a pedido del usuario. `docs/DESIGN.md` documenta el sistema.
- **Archivos:** `docs/muestras/*.html`, `docs/DESIGN.md`.
- **Verificación:** probado en el navegador a 1440px y 375px; flujo completo del formulario (errores, folio simulado, bloqueo).
- **Pendiente / riesgos:** es una maqueta; el PDF real aún no existe.

### 2026-10-29 · [WEB] Paso 2 (parcial): migraciones, seed y Zod
- **Autor:** Claude Code
- **Qué se hizo:** migraciones `0001` a `0006`: perfiles y guard de rol, catálogo, plantillas inmutables, inspecciones con triggers de transición e inmutabilidad, auditoría, RLS en todas las tablas, buckets privados y RPC `submit_inspection` / `review_inspection`. Seed con catálogo (4 áreas, 5 equipos, 2 modos) y usuarios de desarrollo.
- **Archivos:** `supabase/migrations/*.sql`, `supabase/seed.sql`, `supabase/config.toml`.
- **Verificación:** **no verificado contra Postgres**: Docker Desktop no arranca porque WSL2 no está instalado.
- **Pendiente / riesgos:** aplicar con `supabase db reset` y corregir lo que falle; escribir el test RLS.

### 2026-10-29 · [WEB] Paso 1: scaffold
- **Autor:** Claude Code
- **Qué se hizo:** proyecto Next 16.4.3 con React 19, Tailwind 4 y TypeScript estricto en `Proyectos/mlp-inspecciones`; dependencias aprobadas (dexie, zod, react-hook-form, signature_pad, @react-pdf/renderer, @supabase/supabase-js, @supabase/ssr, base de shadcn, vitest, fake-indexeddb, supabase CLI); `.env.example` solo con nombres de variables.
- **Archivos:** `package.json`, `vitest.config.ts`, `.env.example`, `.gitignore`.
- **Verificación:** `pnpm lint`, `pnpm tsc --noEmit`, `pnpm build` sin errores.
- **Pendiente / riesgos:** `signature_pad` y `react-hook-form` están instaladas pero aún sin uso (la firma se dibujó con canvas propio).
