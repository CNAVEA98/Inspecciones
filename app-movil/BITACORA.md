# Bitácora de la migración · App móvil (React Native / Expo)

Registro **propio de la app nativa del técnico** (`app-movil/`). Aquí se anota todo lo de la migración: qué se hizo,
qué se probó, qué falta y qué se decidió.

**Regla: cada cambio en `app-movil/` (código, dependencias, configuración, pruebas en teléfono o decisiones) se
registra aquí, en el mismo commit, antes de darlo por cerrado.** Vale para personas y para Claude (también desde VS Code).

- Los cambios de la web (`src/`, `supabase/`) siguen en `docs/BITACORA.md`. Si un cambio toca ambos (p. ej. separar la
  lógica compartida), se registra en las dos con una línea que apunte a la otra.
- Al iniciar una sesión de trabajo en la app: leer «Estado actual», «Pendientes» y las 3 últimas entradas del «Registro».
- No borrar entradas antiguas; si algo se revierte, agregar una entrada nueva.
- Si algo no se pudo probar, escribir «no verificado» y por qué. No marcar como hecho lo no probado.

## Cómo registrar un cambio

Entrada nueva **al inicio** de «Registro» (la más reciente arriba):

```
### AAAA-MM-DD · Título corto
- **Autor:** nombre · **Rama:** `tipo/descripcion`
- **Qué se hizo:** 1 a 3 líneas
- **Archivos:** rutas principales
- **Verificación:** comandos y resultado real (tsc, expo-doctor, export, prueba en Expo Go / teléfono) o «no verificado» y por qué
- **Pendiente / riesgos:** lo que quedó sin hacer o sin probar
```

Después actualice «Estado actual», «Pendientes» y «Decisiones» si cambian.

## Cómo correr la app (Windows, PowerShell o terminal de VS Code)

En PowerShell 5.1 **no se puede usar `&&`**: escriba los comandos en líneas separadas.

```powershell
cd C:\Proyectos\mlp-inspecciones\app-movil
npm install              # solo la primera vez o si cambió package.json
npx expo start           # muestra un QR: escanéelo con la cámara del iPhone (Expo Go instalado, misma Wi-Fi)
```

- Si el teléfono no conecta: permitir Node.js en el Firewall (redes privadas) o usar `npx expo start --tunnel`.
- Verificar antes de cerrar un cambio: `npm run typecheck` · `npx expo-doctor` · `npx expo export --platform android`
  (comprueba que empaqueta). Instalar paquetes siempre con `npx expo install <paquete>` (elige la versión compatible).
- Esta carpeta usa **npm** (lockfile propio), no pnpm como la web.

## Estado actual (2026-11-07)

| Área | Estado |
|---|---|
| Proyecto Expo SDK 58 (React Native 0.88, React 19.3, TypeScript estricto) | Creado en la rama `feat/app-movil`, **sin commit** |
| Navegación `expo-router` (stack nativo, rutas protegidas), rutas en `src/app/` | Hecho: `login`, `index` (inicio), `nueva`, `inspeccion/[id]` |
| Módulos: SQLite, archivos, cámara, compresión de fotos, red, firma, Supabase, Zod | Instalados (autorizados el 2026-11-07). En uso en el código: SQLite, archivos, red, Supabase, Zod, cámara/galería, compresión, firma, FlashList, expo-image (**todo sin probar en el teléfono salvo SQLite**) |
| Verificación técnica | `tsc` sin errores · `expo-doctor` 20/20 · Vitest 101 pruebas en verde · empaqueta para Android e iOS (4,6 MB) |
| Prueba en teléfono | **Fase 1 verificada en iPhone con Expo Go (2026-11-07)**: abre la base local y muestra los datos. **Android (emulador API 37, Expo Go, 2026-11-07): flujo completo verificado**, incluido modo avión, cierre y reapertura, envío único con folio y PDF local (ver Registro). iPhone: pantallas y arreglos de `await` sin reprobar. Dispositivo Android físico y APK: no probados |
| Lógica del técnico (esquemas, borradores, cola, catálogo, enviadas) | **Fase 1 hecha (2026-11-07):** copiada de la web y adaptada a SQLite (`src/lib/`); diseño en `DISENO.md`. La base abre en pantalla; **no probada en el teléfono** |
| Pantallas del técnico | **Escritas (2026-11-07), sin probar en el teléfono:** ingreso, inicio (resumen, en curso, enviadas, corregir rechazadas), nueva inspección (4 pasos), formulario completo (secciones, repetibles, fotos, firma, selector de TAG, revisión y envío). PDF local y oficial escritos, sin probar |
| Conexión a Supabase | Cliente listo (`src/lib/supabase.ts`); `app-movil/.env` creado el 2026-11-07 con la URL y la clave anon del proyecto `inspecciones-bbosch` (ref `etdeiyjzibgihqtvdrpt`); responde (HTTP 200). **Ingreso no probado** |
| Prueba de aceptación sin señal | Sin empezar (requiere app instalada; ver Decisiones) |

## Pendientes

1. ~~Abrir la app en el iPhone con Expo Go~~ — **hecho el 2026-11-07** (ver Registro).
2. **Hacer el commit** de la rama `feat/app-movil` (y luego PR, con confirmación de Cristóbal).
3. ~~Diseño de la lógica compartida~~ — **hecho** (`DISENO.md`; se duplica la lógica en la app, no se comparte). Fase 1 aplicada.
4. **Probar las pantallas del técnico** (escritas, sin probar; requieren `.env` y la cuenta de un técnico): ingreso → descarga del catálogo, plantillas y Maestro de TAG («Listo para trabajar sin
   señal» con fecha) → Área, Trabajo, Familia, Formato → formulario con fotos y firma → cola que envía al reconectar.
5. **Sesión sin señal:** el primer ingreso requiere señal; después la sesión queda guardada y se renueva al reconectar.
6. **Prueba sin señal completa** en Android con un APK (EAS Build, gratis) y después en iPhone con TestFlight.
7. **Decisiones de Cristóbal que afectan la app:** cuentas por persona o genéricas; si el técnico necesita un PDF
   preliminar sin folio en el teléfono (`expo-print`, dependencia nueva).
8. ~~Dependencias de la skill~~ — instaladas el 2026-11-07 (`@shopify/flash-list`, `expo-image`, `expo-crypto`), más `vitest`, `vite` y `react-dom` (ver Registro).
9. Confirmar que `react-native-signature-canvas` (no es del SDK de Expo) funciona en iPhone y Android.
10. ~~Crear `app-movil/.env`~~ — hecho el 2026-11-07. **Probar el ingreso** con la cuenta de un técnico (reiniciar con `npx expo start --clear`).
11. ~~Abrir en el iPhone la fase 1~~ — hecho. **Ahora abrir la versión con pantallas:** sin `.env` debe mostrar el ingreso con «Falta configurar la conexión».
12. ~~PDF de las enviadas~~ — escrito el 2026-11-07: PDF oficial del servidor (endpoint nuevo de la web, **falta desplegar V1.1.4**) y PDF generado en el teléfono sin señal con `expo-print` + `expo-sharing`. **Falta probar ambos en el teléfono.**
13. **Envío en segundo plano:** sin hacer (solo al abrir la app y al volver la señal con la app abierta).

## Decisiones

- **React Native con Expo para el técnico (2026-11-06):** la PWA no sirve para trabajar sin señal. Supervisor,
  programador y administrador siguen en la web Next. Mismo Supabase (Auth, RLS, Storage, RPC `submit_inspection`).
- **Carpeta `app-movil/` dentro del mismo repositorio (2026-11-07):** comparte lógica y documentación con la web. Está
  excluida del `tsc` y del lint de la web; tiene su propio `tsconfig.json`.
- **npm en `app-movil` (2026-11-07):** Expo y Metro funcionan mejor así; no se mezcla con el `pnpm-lock.yaml` de la raíz.
- **Identificador `cl.bbosch.inspecciones`, solo teléfono (sin tablet) (2026-11-07).**
- **Instalación en iPhone sin pagar mientras se desarrolla (2026-11-07):** se prueba con **Expo Go** (gratis); la cuenta
  Apple Developer (USD 99/año) y TestFlight quedan para cuando la app esté estable. La prueba sin señal completa se puede
  adelantar en Android con un APK gratuito. Desde Windows no hay forma práctica de instalar una app propia en iPhone sin
  la cuenta pagada.
- **PDF oficial después del envío:** lleva el folio del servidor y las firmas del supervisor y el programador; la
  inspección (con fotos y firma del encargado) sí se completa 100 % sin señal.
- **Envío automático:** al abrir la app y al volver la señal con la app abierta. Envío con la app cerrada (tarea en
  segundo plano) solo si hace falta; en iPhone es limitado.
- **Skill `react-native-skills` (Vercel) en `.claude/skills/` (2026-11-07):** revisarla antes de crear pantallas.
- **Cuenta compartida por turno, varias sesiones a la vez (2026-11-07, Cristóbal):** varios técnicos de un turno (p. ej. TECNICO_B) usan
  la misma cuenta en sus propios teléfonos, hasta unas 5 sesiones simultáneas, y escriben su nombre en cada inspección (`performed_by`,
  migración 0008). Borradores, fotos y cola son locales de cada teléfono (no se mezclan). El servidor limita por cuenta (RLS
  `technician_id = auth.uid()`): cada teléfono ve en «Enviadas» las de todo el turno, por eso la lista muestra «Realizada por».
- **Duplicar la lógica de la web en la app, no compartirla (2026-11-07):** se copia a `src/lib/` con la misma estructura de
  carpetas y el alias `@/`, y se adapta solo el almacenamiento (`Almacen`: SQLite en el teléfono, memoria en las pruebas).
  La web no se toca. Costo: una regla que cambie en la web hay que replicarla (cada copia lleva la ruta de origen en su cabecera).
  Esto reemplaza la idea del Maestro 5.7 de separar la lógica dentro de la web.
- **Supabase del sitio publicado (remoto) para la app (2026-11-07):** autorizado por Cristóbal; las claves van en `app-movil/.env` (ignorado por git).
- **Dependencias autorizadas el 2026-11-07:** `@shopify/flash-list`, `expo-image`, `expo-crypto`, Vitest (solo `src/lib`).
- **`--legacy-peer-deps` al instalar (2026-11-07):** `npm` fallaba (ERESOLVE) porque pedía `react-dom@19.3.1` con `react@19.3.0`. Se fijó `react-dom@19.3.0` y se instala con `--legacy-peer-deps`.

## Registro

### 2026-11-07 · PDF oficial verificado en Android, nombre legible, y APK: primer intento fallido por `npm ci`
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

### 2026-11-07 · Envío en segundo plano y primer APK de Android (EAS Build)
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

### 2026-11-07 · Recorrido automático de las plantillas reales y recuerdo del último nombre
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Qué se hizo:** (1) `src/lib/tecnico/plantillas-seeds.test.ts` lee las **59 plantillas reales** de `supabase/seed_plantillas_*.sql` y, con el código propio de la app, comprueba para cada una: que `validateTemplate` la acepta,
  que se puede llenar completa y `validateDraft` no devuelve pendientes, y que con un hallazgo forzado se arma el envío (`buildSubmission`, con la firma adjunta) y se genera el informe HTML. Es la versión automática de abrir cada formato.
  (2) «Realizada por» se precarga con el último nombre escrito en ese teléfono (`src/lib/tecnico/ejecutor.ts`, guardado en la tabla local de catálogo, por cuenta; se guarda al terminar de editar el campo y no viaja al servidor).
- **Archivos:** `app-movil/src/lib/tecnico/{plantillas-seeds.test,ejecutor,ejecutor.test}.ts`, `src/app/nueva.tsx`, `src/app/inspeccion/[id].tsx`.
- **Verificación:** `tsc` sin errores · Vitest 15 archivos, **283 pruebas en verde** (177 del recorrido de plantillas, 4 del nombre) · en el emulador Android: se escribió «Nombre Recordado», se salió, y el borrador nuevo de otro formato lo trajo precargado.
- **Pendiente / riesgos:** los seeds traen 59 plantillas para 60 formatos (14 + 25 + 20, igual que en la web); no se averiguó a cuál formato le falta (no verificado). El recorrido valida lógica y HTML, no el aspecto en pantalla ni el PDF real de cada formato
  (eso sigue necesitando abrirlos en el teléfono o un APK). El nombre precargado también se copia a quien use otro técnico el mismo teléfono: se puede editar.

### 2026-11-07 · Arreglos de diseño tras la prueba en Android y pruebas sin señal de «Enviadas» y borradores
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Qué se hizo:** (1) el aviso de sincronización pasó a su propia fila bajo el saludo: antes el saludo se cortaba («Técnico · Tur…») con «Sin conexión, 1 guardada en el teléfono»; (2) en las fotos, «Agregar otra foto» ahora es «Otra foto» y los botones tienen menos relleno, para que «Galería» no baje de línea; (3) «Eliminar» sube a 48 px de alto y 96 de ancho (antes 44 y solo el texto).
- **Verificación (emulador Android API 37, sin señal):** encabezado correcto con «Sin conexión» en su fila; «Actualizar» avisa «Sin conexión: se muestra la última copia guardada en el teléfono.»; el buscador filtra en local («444sg001» → 1 de 4, contadores correctos); un borrador queda «En curso» al salir con «Salir», y «Eliminar» pide confirmación («Sí, eliminar») y lo borra. `tsc` sin errores.
- **No verificado:** el aspecto de «Galería» con miniatura (no se volvió a abrir el formulario tras el cambio); «Cerrar sesión» con envíos pendientes; «Ver más»; búsqueda en el servidor.
- **Pendiente / riesgos:** el margen derecho del PDF local no se pudo medir (Expo Go no deja leer el archivo; el diálogo de impresión lo reescala a Letter): revisar con un PDF real cuando haya APK. En desarrollo el engranaje flotante de Expo Go tapa «Inicio» del formulario; desaparece en un build propio.

### 2026-11-07 · Prueba completa en Android (emulador): flujo del técnico, sin señal y PDF; 2 fallos corregidos
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

### 2026-11-07 · Primera prueba en Android (emulador, Expo Go): ingreso
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Qué se hizo:** se levantó el emulador de Android Studio (AVD `Medium_Phone_API_37.0`, Android 37, 1080×2400; el arranque desde la terminal se colgaba en WHPX, funcionó al abrirlo desde Android Studio), se instaló Expo Go con `expo start --android` y se abrió la app (SDK 58.0.0).
  Si Expo Go muestra «Failed to download remote update», el emulador no alcanza Metro por `10.0.2.2`: ejecutar `adb reverse tcp:8081 tcp:8081` y abrir `exp://localhost:8081`.
- **Verificación (capturas y `uiautomator`):** la pantalla de ingreso se ve correcta (logo, campos, pie con Privacidad, Condiciones y V1.0.0). Usuario vacío → «Ingrese su usuario». Contraseña de 5 caracteres → «La contraseña debe tener al menos 8 caracteres».
  Usuario y contraseña inventados con señal → «Usuario o contraseña incorrectos» (respuesta real del servidor: la app llega a Supabase). Modo avión → «Para ingresar por primera vez necesita señal.»
- **No verificado:** ingreso con una cuenta real (la contraseña la escribe Cristóbal; no está en el repositorio), catálogo, formulario, fotos con la cámara del emulador, firma, envío, modo sin señal con sesión iniciada, PDF.
- **Pendiente / riesgos:** el botón Atrás en la pantalla de ingreso sale de la app (comportamiento normal de Android). El `.env` se leyó bien en Android.

### 2026-11-07 · Revisión de ingeniería: cola, sesión, fotos, catálogo y errores
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

### 2026-11-07 · «You don't have access to the provided file» persiste (captura p4): se comparte una copia
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Qué se encontró (captura `p4.jpeg`):** con el botón único, «PDF · Guardar o compartir» seguía fallando con «Calling the 'shareAsync' function has failed → You don't have access to the provided file», ya con el nombre sin tildes
  (`.../informes/Inspeccion%20Switchgear%2023%20kV%20-%20444-SG-001%20-%202026-11-07.pdf`). La hipótesis anterior (tilde descompuesta y descarga sobre el mismo archivo) **no era la causa de fondo**.
- **Qué se sabe:** en `expo-sharing` (iOS) ese mensaje sale solo si `FileSystemUtilities.isReadableFile` es falso: el permiso por carpeta (la ruta está dentro de la carpeta de la app) y que `FileManager.isReadableFile` sea verdadero, o sea que el archivo exista y se pueda leer en ese momento. La causa exacta de que no se pueda leer **no se determinó**.
  Además, esa inspección probablemente salió del PDF local (el servidor responde 404 hasta desplegar V1.1.4).
- **Qué se hizo:** `abrirArchivo` ya no comparte el archivo guardado: comprueba que existe y pesa más de 0, crea una **copia nueva** en `cache/compartir-<hora>/` (borrando las anteriores) y comparte esa copia. Si algo falla, el aviso incluye si el archivo existe, su tamaño y la ruta.
- **Archivos:** `app-movil/src/lib/tecnico/informe.ts`.
- **Verificación:** `tsc`, Vitest, `expo-doctor` y `expo export` (ver sesión). **No verificado en el teléfono;** no se reprodujo el error.
- **Pendiente / riesgos:** si vuelve a fallar, el nuevo aviso dirá si el problema es el archivo (no existe / pesa 0) o la hoja de compartir; con eso se corrige la causa real. Alternativa de respaldo: guardar con `expo-file-system` en una carpeta elegida por el usuario (selector de carpeta).

### 2026-11-07 · Un solo botón de PDF
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Pregunta de Cristóbal:** qué diferencia había entre «Ver PDF» y «Compartir PDF»: en su teléfono hacían lo mismo.
- **Respuesta:** en Expo Go `File.canPreview` es falso (sin visor de PDF para la app), así que «Ver PDF» caía a la hoja de compartir. Eran dos botones para una sola acción.
- **Qué se hizo:** un solo botón, «PDF · Guardar o compartir», que abre la hoja de compartir del teléfono (Archivos, WhatsApp, correo, abrir con otra app). Se quitó la ruta del visor (`File.preview` / `canPreview`) y el parámetro de acción de `entregarPdf`.
  Se mantiene la lógica de origen: PDF oficial del servidor si está enviada y hay señal; si no, el generado en el teléfono.
- **Archivos:** `app-movil/src/components/boton-pdf.tsx`, `app-movil/src/lib/tecnico/informe.ts`.
- **Verificación:** `tsc`, Vitest, `expo-doctor` y `expo export` (ver resultado en la sesión). **No verificado en el teléfono.**
- **Pendiente / riesgos:** si más adelante se instala la app como build propio, se puede evaluar un visor integrado (en Android requeriría un componente nuevo, con autorización).

### 2026-11-07 · «Enviadas»: últimas 5, botón Actualizar, buscador y filtros por estado
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

### 2026-11-07 · Segunda pulsación de «Ver PDF» fallaba («You don't have access to the provided file»)
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

### 2026-11-07 · «No se pudo abrir el PDF»: alternativa de compartir y motivo real
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Qué se encontró (prueba de Cristóbal):** al pulsar el botón del PDF salía «No se pudo abrir el PDF». Ese texto solo aparece en el último paso (el PDF ya estaba generado o descargado) y escondía el motivo.
- **Causa:** **no determinada**: el error del visor (`File.preview`) no se mostraba. Sospecha: el visor nativo del teléfono no abrió el archivo (en Expo Go o por el nombre del archivo, que lleva espacios y tildes).
- **Qué se hizo:** `abrirArchivo` en `lib/tecnico/informe.ts`: «Ver PDF» comprueba `File.canPreview` y, si no hay visor o falla, abre la hoja de compartir (Archivos, WhatsApp, otras apps) en lugar de rendirse. «Compartir PDF» va directo a esa hoja.
  Si también falla, el aviso incluye el motivo real (visor y compartir) y la ruta del archivo guardado.
- **Archivos:** `app-movil/src/lib/tecnico/informe.ts`.
- **Verificación:** `tsc` sin errores · Vitest 75 en verde · `expo-doctor` 20/20 · `expo export` Android e iOS empaquetan. **No verificado en el teléfono:** no se reprodujo el error; el cambio no puede probarse sin el dispositivo.
- **Pendiente / riesgos:** si vuelve a salir el aviso, anotar el motivo que muestra para corregir la causa de fondo.

### 2026-11-07 · PDF del teléfono: el contenido ocupaba solo el 75 % del ancho
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Qué se encontró (prueba de Cristóbal, muestras `p1.pdf` y `p2.pdf` en su escritorio):** el nuevo PDF salía «cargado a la izquierda»: el contenido llegaba a ~75 % del ancho y quedaba un margen blanco enorme a la derecha.
- **Causa:** el HTML estaba dibujado a 595 px de ancho (los puntos de React-PDF), pero `expo-print` imprime la hoja A4 con 793 px de ancho CSS (96 px por pulgada): 595 / 793 = 75 %. En el navegador de escritorio no se veía
  porque la prueba usaba `@page { size: 595px 842px }`, un tamaño de página propio que el teléfono no usa.
- **Qué se hizo:** la hoja se sigue dibujando a 595 px (así las medidas son las mismas del PDF de la web) y se amplía con `zoom: 4/3` (`table.hoja`); `@page` pasó a `size: A4; margin: 0`; el cuerpo usa el ancho completo.
- **Archivos:** `app-movil/src/lib/informe/html.ts`.
- **Verificación:** `tsc` sin errores · Vitest 75 en verde · `expo-doctor` 20/20 · `expo export` Android e iOS empaquetan. Se imprimió un informe de ejemplo a PDF con Chrome usando `@page { size: A4 }` (la hoja que usa el teléfono):
  página de 595 × 842 pt y contenido hasta x = 564 (595 − 31 de margen), o sea márgenes iguales a ambos lados; 3 páginas, filas sin partir y pie en cada página. **No verificado en el teléfono** tras este cambio.
- **Pendiente / riesgos:** probar de nuevo en el iPhone. El WebView de Android también debería aplicar el `zoom` (Blink), pero no se probó en Android.

### 2026-11-07 · El PDF del teléfono reproduce el diseño del PDF de la web
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

### 2026-11-07 · PDF generado en el teléfono (sin internet), guardar y compartir
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

### 2026-11-07 · Pulido visual: animaciones, pie de página y menos banners
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

### 2026-11-07 · Ver PDF de las inspecciones enviadas
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

### 2026-11-07 · Cuenta compartida por turno: «Realizada por» en Enviadas
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

### 2026-11-07 · Botón «Cerrar sesión» y acceso «Inicio» en el formulario
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

### 2026-11-07 · Selector de hora y fecha, y botones de la firma
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

### 2026-11-07 · `app-movil/.env` creado con el CLI de Supabase
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Qué se hizo:** Cristóbal autorizó expresamente crear `app-movil/.env` (excepción a «No tocar archivos .env*» del `CLAUDE.md`) y
  elegir el proyecto `inspecciones-bbosch` (activo, sa-east-1). Con el CLI del repositorio (`corepack pnpm supabase`, solo lectura:
  `projects list` y `projects api-keys`) se escribieron únicamente `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
  La clave `service_role` no se leyó ni se guardó. El otro proyecto (`inspecciones-mlp-prueba`) está inactivo.
- **Archivos:** `app-movil/.env` (ignorado por git, confirmado con `git check-ignore`).
- **Verificación:** `GET /auth/v1/settings` y `GET /rest/v1/areas` con la clave anon responden HTTP 200. El ingreso desde la app no se probó.
- **Pendiente / riesgos:** las cuentas de técnico del proyecto remoto y sus contraseñas no están en el repositorio (no se versionan);
  hay que usar una que ya exista. Si el proyecto remoto no tiene aplicadas las migraciones 0016 en adelante, el catálogo de formatos fallará.

### 2026-11-07 · Pantallas del técnico (ingreso, inicio, nueva inspección, formulario)
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

### 2026-11-07 · Diseño y fase 1: lógica del técnico en la app (SQLite)
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

### 2026-11-07 · Primera prueba en iPhone con Expo Go
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

### 2026-11-07 · Bitácora propia de la migración y rutas en `src/app/`
- **Autor:** Cristóbal (con Claude) · **Rama:** `feat/app-movil`
- **Qué se hizo:** se creó esta bitácora con la regla de actualizarla en cada cambio (también en `app-movil/CLAUDE.md` y el
  `CLAUDE.md` de la raíz). Las pantallas se movieron de `app/` a `src/app/`, la convención del `AGENTS.md` de Expo.
- **Archivos:** `app-movil/BITACORA.md`, `app-movil/CLAUDE.md`, `app-movil/src/app/`, `app-movil/README.md`, `CLAUDE.md`, `docs/MAESTRO.md`, `docs/BITACORA.md`.
- **Verificación:** `tsc --noEmit` sin errores; `expo export --platform android` empaqueta e incluye las rutas.
- **Pendiente / riesgos:** abrir en el iPhone con Expo Go (pendiente 1).

### 2026-11-07 · Comando para PowerShell 5.1
- **Autor:** Cristóbal (con Claude)
- **Qué se hizo:** el primer intento de `npx expo start` falló porque PowerShell 5.1 no acepta `&&`. Se documentó correr
  `cd` y `npx expo start` en líneas separadas, y qué hacer si el iPhone no conecta (Firewall, `--tunnel`).
- **Verificación:** no verificado en el teléfono; Cristóbal seguirá desde VS Code.

### 2026-11-07 · Skill `react-native-skills` (Vercel Labs)
- **Autor:** Cristóbal (con Claude)
- **Qué se hizo:** copiada a `.claude/skills/react-native-skills/` (38 reglas). Las pantallas actuales ya cumplen sus reglas
  (stack nativo, `gap`, `StyleSheet.create`); no hubo cambios de código.
- **Verificación:** archivos copiados completos.

### 2026-11-07 · Proyecto Expo SDK 58 y módulos
- **Autor:** Cristóbal (con Claude)
- **Qué se hizo:** plantilla `blank-typescript`; módulos `expo-sqlite`, `expo-file-system`, `expo-image-picker`,
  `expo-image-manipulator`, `@react-native-community/netinfo`, `react-native-signature-canvas` + `react-native-webview`,
  `expo-router` (y dependencias), `@supabase/supabase-js`, `zod`. `overrides` de `glob`/`minimatch` por vulnerabilidades
  moderadas del CLI de Expo. `app.json`: «Inspecciones MLP», `cl.bbosch.inspecciones`, esquema `inspeccionesmlp`. Se
  borró el `LICENSE` MIT de la plantilla (el repo contiene información del cliente).
- **Verificación:** `tsc` sin errores; `expo-doctor` 20/20; `expo install --check` al día; `npm audit` 0; `expo export
  --platform android` 2,5 MB. No probado en teléfono.

### 2026-11-07 · Carpeta `app-movil/`
- **Autor:** Cristóbal (con Claude)
- **Qué se hizo:** carpeta y `README.md`; `app-movil` excluida de `tsconfig.json` y `eslint.config.mjs` de la raíz.
- **Verificación:** lint y tsc de la raíz sin errores.
