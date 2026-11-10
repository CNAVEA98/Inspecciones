# Estado del proyecto · pendientes y decisiones

> **Actualizado el 2026-11-09 · `main` = `4b7a729` (PR #21, que incluye el PR #20) con **V1.1.7 publicada** (verificado con `curl`, región `gru1`) y la app móvil 1.1.7; la migración 0021 está aplicada en el remoto. Las ramas `docs/reorganizar-documentacion`, `feat/app-movil-revision`, `feat/pdf-archivado-storage` y `feat/app-movil-revisores` ya están unidas.**
> **Regla:** este archivo se **reescribe** (no se le agrega al final) cada vez que una mejora cambia el estado, un pendiente o una decisión, y la
> línea de arriba se actualiza con la **fecha de ese día**, la versión y el commit. El historial inmutable está en [`REGISTRO.md`](REGISTRO.md);
> las reglas, en [`LEEME.md`](LEEME.md); el directorio del proyecto, en [`../MAESTRO.md`](../MAESTRO.md).
> Lo marcado «no verificado» no se ha probado. `(antes #N)` = número que tenía el pendiente en la bitácora anterior (las entradas antiguas lo citan así).

## 1. Estado actual

### Web (Next.js 16 + Supabase + Vercel)

| Área | Estado | Verificación |
|---|---|---|
| Base de datos | Migraciones 0001–0021 aplicadas y registradas en el Supabase remoto (la 0021 el 2026-11-09); plantillas con las correcciones de V1.1.1 (10 en v2); registro libre cerrado | Remoto por CLI el 2026-11-06; local: `supabase test db` 76/76 |
| Roles y firma doble | Técnico, supervisor, programador y administrador, turnos A/B, cuentas genéricas por usuario, firma en dos etapas | Local con clics; **sitio publicado sin recorrer** |
| Flujo del técnico | Área → Trabajo → Familia → Formato → formulario con selector de TAG (1.073 equipos), fotos sin GPS, firma, cola de envío, visor de PDF | Local; **iPhone y sitio publicado no probados** |
| 60 formatos | Catálogo en la tabla `formatos`; editor (crear, copiar, desactivar, publicar versiones nuevas) para supervisor y administrador | HTTP y tests; **editor sin clics en navegador** |
| Bandejas | Supervisor y programador con carpetas por turno y área, filtro de tipo, buscador, «Equipos con fallas» y seguimiento SAP (no bloquea firmas) | Local; sitio publicado sin probar |
| PDF del informe | Generado al pedirlo (diseño Cobre); 5 fallas altas corregidas en V1.1.1. **Desde V1.1.6 el de una aprobada se archiva en `reports` y se entrega desde ahí** (escribe solo el servidor con la clave de servicio) | 120/120 PDF locales el 2026-11-06; archivado probado por HTTP contra el Supabase local el 2026-11-09; **en Vercel falta `SUPABASE_SERVICE_ROLE_KEY`** |
| Privacidad y versión | Pie con versión, `/privacidad`, `/condiciones`, aviso al primer ingreso, fotos sin metadatos | Local; teléfono no probado |
| Rendimiento | Región `gru1` confirmada; carga local de 12 a 36 técnicos sin errores (PDF es lo más lento: 5 s con 12 a la vez) | No es prueba del sitio publicado |
| Seguridad del repositorio | Sin claves en el árbol ni en el historial reescrito (2026-11-07); repo **PUBLIC** | Contraseñas de las 7 cuentas remotas siguen siendo las antiguas |

### Uso de Supabase remoto (medido el 2026-11-09, solo lectura)

Base 13 MB · Storage 2,8 MB (`inspection-photos` 11 archivos, `signatures` 1, `reports` vacío) · 5 inspecciones (4 enviadas, 1 con firma del supervisor) · 141 respuestas · 7 cuentas · 60 formatos activos con 70 plantillas · migraciones 0001–0020. Proyecto casi vacío; proyección y plan de medición en el pendiente 25.

Última verificación completa: 2026-11-09 (V1.1.6) · `lint` 0 errores · `tsc` sin errores · `test` 262/262 · `build` correcto.

### App móvil (`app-movil/`, Expo SDK 58)

| Área | Estado | Verificación |
|---|---|---|
| Lógica del técnico | Copiada de la web sobre SQLite (`app-movil/DISENO.md`); se duplica, no se comparte | 292 pruebas en verde, incluido el recorrido de las 59 plantillas reales |
| Pantallas del técnico | Ingreso, inicio, nueva inspección (4 pasos), formulario completo, «Enviadas» con buscador y filtros | Emulador Android (API 37, Expo Go): flujo completo, modo avión, cierre y reapertura, envío único con folio |
| Revisión (supervisor, programador, administrador; app 1.1.0 y 1.1.2, 2026-11-09) | Ingreso por rol, bandeja con filtros y búsqueda, detalle completo con fotos, PDF oficial, firma en dos etapas (el administrador solo consulta), «Equipos con fallas» con seguimiento SAP (supervisor y administrador registran; el programador consulta). **Consulta sin señal** con la copia guardada (bandeja, detalles abiertos o precargados, fallas, último PDF); firmar y registrar seguimiento necesitan señal | APK release en el emulador Android contra Supabase **local**: firmas de supervisor y programador (aprobada y PDF archivado), aviso SAP guardado, modo avión con túneles cortados (copia, firma bloqueada, PDF guardado), administrador sin panel; 317 pruebas. **No probado:** teléfono físico, iPhone, Supabase remoto |
| PDF | Del teléfono (sin señal) y oficial del servidor (`/api/movil/informe/[id]`, V1.1.7 desplegada); «Compartir» o, en Android, «Guardar en el teléfono» en una carpeta elegida (no la raíz de Descargas: Android no lo permite); sin señal se entrega el último oficial descargado | Probados en el emulador; 4 PDF guardados en `Download/Inspecciones_MLP` (2026-11-09) |
| Envío en segundo plano | `expo-background-task` (WorkManager en Android), tarea definida en la entrada `app-movil/index.js` desde la app 1.1.3 (antes no existía con la app cerrada y nunca enviaba) | APK release en el emulador (2026-11-09): con la app cerrada envió la inspección 2 s después de volver la señal, una sola vez, con folio, foto y firma. **No probado:** teléfono físico (ahorro de batería) ni iPhone |
| APK | EAS: intento 1 falló por `npm ci` (corregido con `app-movil/.npmrc`); intento 2 (`140db843-1593-403f-bc78-d5daaf06ee3a`) quedó «en progreso». **Toda compilación release se cerraba al abrir por R8** (borraba el constructor de la base de WorkManager): desde la app 1.1.2 lo corrige el plugin `app-movil/plugins/con-regla-room-r8.js`. APK local de prueba (x86_64, apunta a `localhost`) compilada fuera del repo en `C:\Code\apk-build` (las rutas con espacios y tildes rompen Java, CMake y el enlazador) | APK local 1.1.2 abre y funciona en el emulador. **Resultado de EAS no verificado** |
| Primer uso en terreno (app 1.1.7) | Se ingresa **una vez con señal** (sin señal no se puede: la contraseña la valida el servidor; mensaje claro). Catálogo de formatos incluido en la APK como respaldo si nunca se descargó (`scripts/exportar-catalogo.mjs`, solo lectura; **reexportar y recompilar al cambiar formatos**); «Cerrar sesión» bloqueado sin señal; aviso único «Listo para trabajar sin señal» | APK 1.1.7 contra el remoto en el emulador (2026-11-09): mensaje sin señal, aviso, bloqueo y reapertura sin señal. Catálogo incluido solo con pruebas unitarias |
| iPhone | Fase 1 probada con Expo Go. **2026-11-10: primera compilación iOS local (Release, app 1.1.8) probada en el simulador contra el Supabase real:** ingreso, formulario, foto de galería (sale 1600 px sin GPS), firma y envío (`INS-2026-000008`). **iPhone físico por cable (Apple ID gratuito):** inspección en modo avión con cámara real → pendiente → al volver la señal con la app abierta se envió sola, una vez (`-000011` por los tiempos) | **Falta en el iPhone:** cerrar y reabrir sin señal, envío con la app cerrada, revisores |

### Comparativa con las inspecciones en papel (2026-11-07)

13 inspecciones manuales cargadas en la base local (19/19 PDF). Hallazgos y propuestas en
[`../referencia/COMPARATIVA_MANUALES_2026-11-07.md`](../referencia/COMPARATIVA_MANUALES_2026-11-07.md). No se cambió ningún formato ni filtro todavía.

## 2. Pendientes vigentes

Prioridad: **A** = antes de usar datos reales · **B** = próximo · **C** = cuando haya tiempo. «Cristóbal» = necesita su decisión o sus cuentas.

### A · Antes de datos reales

1. **Rotar las contraseñas de las 7 cuentas remotas** (incluye `ADMINISTRADOR`) y cerrar sesiones. *(Hoy son contraseñas temporales, de prueba, mientras se desarrolla la app; el cambio es obligatorio antes de usar datos reales.)* Definir dónde las guarda el equipo. Siguen siendo las que estuvieron publicadas. Pedir a GitHub Support la limpieza de las 17 referencias `refs/pull/*` con commits viejos. *(Cristóbal; antes #20)*
2. **Repositorio público por una limitación de Vercel Hobby** (decisión de Cristóbal): en un repositorio privado, el plan gratuito no despliega commits de otra persona (Manuel), así que se dejó público. Contiene los Word de Bbosch/MLP (los formatos originales; la app no los lee, las plantillas viven en Supabase) y el Maestro de TAG (1.073 equipos): información de los clientes. *Verificar en la documentación de Vercel las reglas vigentes.* Caminos: (a) **privado + Vercel Pro** (recomendado para producción; además Hobby es solo uso no comercial); (b) privado, y Cristóbal une los PR con «Create a merge commit» (probar si «Squash» también despliega); (c) privado con despliegue por GitHub Actions y token de Vercel; (d) dejar público y sacar Word y Maestro (queda en el historial). Aceptable mientras sean datos de prueba. *(Cristóbal)*
3. **Planes y respaldo:** Supabase Free (1 GB de Storage, se pausa, sin respaldos diarios) vs ~60 técnicos con fotos. **Se pasará a Pro (y Vercel Pro) cuando la empresa acepte la aplicación y la pague**; hasta entonces, medir el ritmo de llenado en la marcha en blanco (pendiente 25) y exportar respaldos manuales si hay datos que importen. *(Cristóbal; antes #17 y #37)*
4. **PDF final firmado en Storage (hecho en código, V1.1.6, rama `feat/pdf-archivado-storage`):** al aprobar se archiva en `reports/{inspection_id}/{folio}.pdf` y cada descarga de una aprobada entrega esa copia; las aprobadas antiguas se archivan en su primera descarga; rechazadas y en revisión no se archivan. **Falta:** cargar `SUPABASE_SERVICE_ROLE_KEY` en Vercel (solo Production, sin `NEXT_PUBLIC_`) antes de unir, probar con clics en el sitio publicado, y decidir si el borrado del administrador debe borrar también la copia (hoy queda). Suma ~170–200 KB por aprobada a Storage (ver 25). *(antes #7)*
24. **Autoría y titularidad (hecho en parte, V1.1.5):** la app es una propuesta propia de Cristóbal Navea y Manuel Aguilar, **desarrollada para Bbosch, no a nombre de Bbosch**. Se corrigieron el pie (web y app), Privacidad, Condiciones y el aviso de privacidad (se vuelve a mostrar a cada usuario), y se agregaron `LICENSE` («todos los derechos reservados»), `author` y `license: UNLICENSED`. **Falta:** acuerdo escrito con Bbosch (licencia o cesión, quién responde por los datos personales) y revisión legal de Privacidad y Condiciones antes de la marcha en blanco con técnicos reales. *(Cristóbal y Manuel)*

### B · Pruebas que faltan

25. **Marcha en blanco con técnicos de terreno** para medir el ritmo de llenado de Supabase y decidir el plan. Antes: cerrar el pendiente 24. Medir cada semana con las consultas de solo lectura de abajo y registrar en `REGISTRO.md`: tamaño de la base, archivos y MB por bucket, inspecciones, fotos por inspección y MB por inspección; con eso calcular **MB por inspección × inspecciones por día y técnico × técnicos = MB por semana**, y los días que tardaría en llenarse el 1 GB de Free. Línea base 2026-11-09: 13 MB de base, 2,8 MB de Storage (11 fotos de ~255 kB ≈ 4.000 fotos por GB), 5 inspecciones de prueba.
   ```bash
   corepack pnpm supabase db query --remote=etdeiyjzibgihqtvdrpt --read-only "select pg_size_pretty(pg_database_size(current_database()))"
   corepack pnpm supabase db query --remote=etdeiyjzibgihqtvdrpt --read-only "select bucket_id, count(*), pg_size_pretty(sum((metadata->>'size')::bigint)) from storage.objects group by 1"
   corepack pnpm supabase db query --remote=etdeiyjzibgihqtvdrpt --read-only "select status, count(*) from inspections group by 1"
   ```
   Los límites del plan (Storage, base, ancho de banda) se confirman en el panel de Supabase; el CLI no los entrega. *(Cristóbal y Manuel)*
26. **Revisión en la app móvil (hecho en parte, app 1.1.0 y 1.1.2, ramas `feat/app-movil-revision` y `feat/app-movil-revisores`):** ya están bandeja, detalle, PDF oficial, firma de supervisor y programador, consulta sin señal, «Equipos con fallas» y seguimiento SAP (ver estado). **Falta:** probar en un teléfono físico y en iPhone, contra el Supabase remoto, y distribuir un APK/TestFlight con esta versión. Siguen solo en la web: carpetas por zona y tipo, pestaña «Formatos» y exportar. *(Cristóbal)*
27. **Migración 0021 en el remoto: hecho (2026-11-09).** El sitio publicado (V1.1.7 desde el 2026-11-09) la usa. Quedan en el remoto las inspecciones de prueba `INS-2026-000006` (rechazada) y `-000007` (aprobada por `SUPERVISOR_B` y `PROGRAMADOR_B` desde la app), de `TECNICO_B` con nombre «PRUEBA REMOTO…»: borrarlas (administrador) antes de datos reales. Ciclo completo de la app contra el remoto probado en el emulador (técnico sin señal y con la app cerrada, supervisor, programador, PDF final). *(Cristóbal)*

5. **Prueba de aceptación sin señal en la app nativa** (decisión del 2026-11-06; **hecha en el emulador con la APK 1.1.3 el 2026-11-09**: inspección completa en modo avión, cerrar y reabrir, envío único con folio y envío con la app cerrada, ver `REGISTRO.md`; falta en teléfono físico y iPhone): instalar el APK (revisar el resultado del build `140db843…`; si se cerraba al abrir era el error de R8, corregido en la app 1.1.2: hay que volver a compilar), inspección con cámara real, modo avión, cerrar y reabrir, enviar al reconectar (una vez, con folio), y **verificar el envío en segundo plano con la app cerrada ~15 min**. Después iPhone con TestFlight (cuenta Apple Developer de USD 99/año). *(antes #9, #21 y pendientes 5, 6, 13 de la app)*
6. **Casos sin señal por diseñar/probar en la app:** sesión vencida sin señal (hecho en la app 1.1.3: abría en ~2 min, ahora en 4–6 s; probado en el emulador), aviso de borradores sin enviar, cerrar sesión con envíos pendientes, formato desactivado o con versión nueva sin señal. *(Maestro 5.4)*
7. **Probar la app en iPhone y en Android físico:** pantallas, `react-native-signature-canvas`, fotos reales de cámara sin GPS, PDF del teléfono y oficial.
8. **Recorrer el sitio publicado** con `SUPERVISOR_A`, `TECNICO_A` y `PROGRAMADOR_A`: aprobar sin comentario, enviar y ver el PDF con el nombre del firmante, segunda firma, rechazo, «Equipos con fallas», catálogo del técnico, pestaña «Formatos» con clics (crear en blanco, publicar, activar/desactivar), V1.1.0 (aviso al primer ingreso, fotos sin GPS en Storage). *(antes #15, #36, #40, #45, #48, #28)*
9. **PWA en teléfono** (solo si se sigue usando): instalar, abrir sin señal, eliminar una inspección en curso con el dedo, visor de PDF (Compartir, Guardar, atrás de Android). *(antes #21, #46)*

### B · Producto y decisiones de negocio

10. **Corregir lo hallado en la comparativa con el papel** (propuesta en el documento, secciones 3b y 4): filtros del menú (trafos por tipo piso/aéreo, áreas de INSP-09, switchgear por sala), TAG fuera del Maestro, alias GG/GE, INSP-16 a Rev. abril 2026 y trafo de piso a Rev. junio 2026 (plantilla nueva v3 + migración), unidad para «Presión de aceite» y «Nivel de estanque», notas informativas que hoy salen como observación roja, si NT debe salir del denominador, copiar cabecera entre cubículos, hora de inicio/término obligatorias. *(Cristóbal/MLP)*
11. **Cuentas por persona o genéricas** (trazabilidad, RLS, firmas): preferencia inicial por persona. **Prueba con dos teléfonos y la misma cuenta (2026-11-09):** envíos simultáneos y firmas simultáneas se resuelven bien (folios distintos; una sola firma, con aviso claro desde la app 1.1.4), y **las correcciones duplicadas quedaron resueltas en V1.1.7 / app 1.1.5** (migración 0021: una rechazada, una corrección; probado con dos emuladores). La 0021 ya está aplicada en el remoto (2026-11-09). Y **qué ve cada supervisor** (hoy sin filtro por área ni turno, ~24 revisores). *(Cristóbal; antes #23)*
12. **Reglas de SAP con MLP:** estados que generan hallazgo (hoy solo ML), canal para avisar a Supervisión, listado de ítems fuera de alcance por formato, supuestos de prioridad y texto breve de 40 caracteres, si la app genera el informe de mejora o solo registra el vínculo, y si un hallazgo se cierra cuando una inspección posterior del mismo TAG lo muestre reparado. Usar «Supervisión», nunca «Torre de Control». *(antes #26 y #27)*
13. **Revisar con Cristóbal** los sectores dudosos de [`../referencia/MAPEO_ZONA_AREA.md`](../referencia/MAPEO_ZONA_AREA.md), las áreas de MANT-02/08/17 y la regla piso/aéreo de transformadores. *(antes #12)*
14. **Exportar a Excel desde la bandeja** (supervisor, programador, administrador; respeta filtros y exige rango de fechas; hojas Inspecciones, Respuestas, Hallazgos y Mediciones por formato). Bloqueado: un `.xlsx` multihoja requiere una dependencia nueva (`exceljs`) y hay que preguntar; la alternativa es un CSV por hoja. *(antes #13)*
15. **PDF:** siguen abiertas las fallas medias y bajas de la revisión del 2026-11-03 (P03, P05, P07, P08, P14, P16, P19, P37, P38, P41, S04, S06, S07, S13, S19–S22, X01; el detalle está en un Excel fuera del repo). Corregir datos de plantilla exige parche/versión nueva. *(antes #41)*
16. **Decidir si se borran** el proyecto Supabase `inspecciones-mlp-prueba` (pausado) y el proyecto Vercel `inspecciones-mlp-demo-formatos` (servía la carpeta `demo/`, eliminada el 2026-11-09). *(antes #19)*

### C · Técnica y orden

17. **Auditoría React/UI con las skills de Vercel Labs** ([`../referencia/AUDITORIA_REACT_UI_TECNICO.md`](../referencia/AUDITORIA_REACT_UI_TECNICO.md)): quedan `tecnico-provider`, `nueva-inspeccion`, firma, tarjetas, indicador de sincronización, pestaña «Formatos», bandejas y rutas del PDF. Hoy es de baja prioridad: el técnico migra a la app nativa. *(antes #29)*
18. **Editor de formatos, siguientes pasos:** vista previa como la ve el técnico; editar firmas, leyenda de estados y lecturas destacadas; copiar entre inspección y mantención. *(antes #44)*
19. **Hacer repetible `seed_catalogo.sql`** (`on conflict do nothing`; hoy falla si se ejecuta dos veces en el remoto). *(antes #34)*
20. **`.gitattributes`** (`* text=auto eol=lf`, evita el ruido de CRLF en Windows) y `next typegen` en el script `typecheck`. *(antes #24)*
21. **Peso del JavaScript de la PWA** (~321 KB comprimidos): cargar Supabase bajo demanda o `zod/mini`. Solo si se sigue usando la PWA. *(antes #42)*
22. **Limpieza:** ramas ya unidas (`git branch --merged main`), datos de prueba en la base local (`corepack pnpm supabase db reset`) y, opcional, renombrar el repositorio de GitHub y borrar la carpeta `.fcc` del perfil de Windows. *(antes #22, #32, #43)*
23. **Ampliar las pruebas pgTAP** a Storage y tablas hijas (hoy 76/76 cubren las tablas principales). *(antes #3)*

Los pendientes anteriores ya resueltos (Docker, migraciones remotas, registro libre cerrado, región `gru1`, migración 0020, versión 2 de plantillas, camino a la app nativa, commit y PR de la app, etc.) se ven en [`REGISTRO.md`](REGISTRO.md).

## 3. Decisiones vigentes

### Arquitectura y producto
- **React Native/Expo (2026-11-06; ampliada el 2026-11-09):** la PWA no sirve para trabajar sin señal, así que el técnico trabaja en la app nativa. Desde el 2026-11-09 supervisor, programador y administrador también entran a la app para revisar (bandeja, detalle, PDF, firma, «Equipos con fallas» y seguimiento SAP); **desde la app 1.1.2 consultan sin señal con una copia guardada en el teléfono, que se borra al cerrar sesión; firmar y registrar seguimiento siguen exigiendo señal** (la firma es definitiva y la valida el servidor). Lo demás de esos roles (formatos, carpetas por zona, administración de usuarios) sigue en la web Next. Mismo Supabase (Auth, RLS, Storage, RPC `submit_inspection` y `review_inspection`).
- **Duplicar la lógica en la app, no compartirla (2026-11-07):** copia en `app-movil/src/lib/` con la ruta de origen en la cabecera, y solo se adapta el almacenamiento (`Almacen`: SQLite en el teléfono, memoria en pruebas). La web no se toca. Costo: una regla que cambie en la web hay que replicarla en la app.
- **`app-movil/` en el mismo repositorio (2026-11-07)**, con npm y lockfile propios (`.npmrc` con `legacy-peer-deps` para que EAS instale igual), excluida del `tsc` y el lint de la web. Identificador `cl.bbosch.inspecciones`, solo teléfono.
- **Cuenta compartida por turno (2026-11-07):** varios técnicos usan la misma cuenta en sus teléfonos (hasta ~5 sesiones) y escriben su nombre en cada inspección (`performed_by`); borradores, fotos y cola son locales; «Enviadas» muestra las de todo el turno con «Realizada por».
- **Instalación en iPhone (2026-11-07):** Expo Go mientras se desarrolla; cuenta Apple Developer y TestFlight cuando la app esté estable. La prueba sin señal se adelanta en Android con un APK gratuito de EAS.
- **PDF oficial archivado (2026-11-09, Cristóbal):** la copia oficial de una inspección aprobada vive en el bucket privado `reports` y la escribe **solo el servidor** con la clave de servicio (ningún usuario tiene política de escritura, update ni delete). Toda descarga de una aprobada entrega esa copia; si falta, se genera y se guarda en ese momento.
- **PDF oficial después del envío:** lleva el folio del servidor y las firmas de revisión; la inspección (fotos y firma del encargado) se completa 100 % sin señal. Envío automático al abrir la app, al volver la señal y, solo en un APK/TestFlight, en segundo plano.
- **Cuentas genéricas por usuario, sin correo (2026-10-30):** `ADMINISTRADOR`, `SUPERVISOR_A/B`, `PROGRAMADOR_A/B`, `TECNICO_A/B`, con correo interno `usuario@mlp.local`. Las crea el equipo; no hay autoregistro ni pantalla de alta. El rol «planificador» se muestra como «Programador». Trazabilidad por persona = «quién realizó la inspección».
- **Roles y firma doble (2026-10-30):** admin (sin turno), supervisor, planificador y técnico con turno A/B (solo etiqueta). Firma en dos etapas: supervisor y luego planificador. Solo el admin cambia rol y turno.
- **Firmas (2026-10-31):** firman el encargado (al enviar), el supervisor y el planificador; los participantes se anotan pero no firman. Firmantes: «Supervisor Bbosch» y «Planificador Bbosch».
- **Seguimiento de hallazgos (2026-10-31, pedido de MLP):** la inspección firmada es la evidencia en la OT padre; si hay hallazgo, el supervisor crea el aviso subsecuente en SAP fuera de la app (no se integra). No bloquea firmas. El criterio es el alcance (lo de Bbosch 23 kV lleva aviso; lo que requiere terceros se canaliza con MLP), no la severidad; solo cuentan los «Malo». Se guarda en `finding_followups` vía RPC `set_finding_followup` (supervisor y administrador escriben).
- **Catálogo de formatos en la base (2026-11-03):** fuente = tabla `formatos`; un formato con historial se desactiva, no se borra. Editar nunca modifica una versión publicada: inserta la siguiente (la inspección conserva su `template_id`). Supervisor y administrador gestionan; el programador consulta; un formato nuevo nace desactivado.
- **Plantillas versionadas e inmutables; folio `INS-AAAA-NNNNNN`** asignado por el servidor; IDs de inspección, fotos y hallazgos generados en el cliente (idempotencia offline). Fotos comprimidas (1600 px, JPEG 0,7) en bucket privado `{uid}/{inspection_id}/{foto}.jpg`.
- **ML exige observación; NR exige motivo; la foto es opcional en todos los estados.**
- **TAG desde el Maestro (2026-10-30):** `src/data/maestro-tags.json` (generado con `scripts/export-maestro.py`); los TAG provisionales se pueden elegir y quedan marcados para revisión.
- **El técnico descarga el PDF de sus inspecciones (2026-10-31)** reutilizando el generador, con lectura por RLS (migración 0013). **PDF sin tablas partidas:** cada grupo de ítems queda entero en una página salvo que supere una.
- **Diseño «Cobre»** (`../guias/DESIGN.md`). Sin geo-referencia, modo oscuro, analytics ni notificaciones push. Fuente Geist vía `next/font`.
- **Privacidad (2026-11-03):** aviso informativo con «Entendido», no consentimiento; sin banner de cookies mientras solo haya cookies necesarias; fotos siempre sin metadatos.
- **Versiones (2026-11-03):** parte en V1.1.0; cada mejora unida a `main` sube el último número (ver `LEEME.md`).

### Infraestructura y proceso
- **Next 16:** middleware = `src/proxy.ts`; `cacheComponents` desactivado (app autenticada y dinámica). PWA con `@serwist/turbopack` (no `@serwist/next`, que exige webpack), solo en producción.
- **Despliegue de prueba (2026-10-30):** Vercel `inspecciones-bbosch` (producción = `main`, región `gru1`) + Supabase `inspecciones-bbosch` (São Paulo, Free, ref `etdeiyjzibgihqtvdrpt`). Las variables `SUPABASE_SERVICE_ROLE_KEY` y `POSTGRES_*` de la integración no las usa la app y nunca llevan `NEXT_PUBLIC_`. Sin ramas de base para Preview.
- **Migraciones remotas antes de unir (2026-11-03):** un PR con migraciones nuevas se une a `main` solo después de aplicarlas y verificarlas en el remoto (Vercel despliega `main` de inmediato). **Nunca `supabase config push`.**
- **Contraseñas de prueba (2026-11-06/07):** fuera del árbol desde V1.1.3 y reemplazadas en el historial reescrito; las del remoto siguen vigentes por decisión de Cristóbal y deben rotarse antes de datos reales (pendiente 1).
- **Repositorio público (2026-11-06):** por decisión de Cristóbal, para trabajar con Manuel desde cuentas distintas (pendiente 2).
- **Autoría y titularidad (2026-11-09, Cristóbal):** la aplicación es una propuesta propia de Cristóbal Navea y Manuel Aguilar, **para** Bbosch y no a nombre de Bbosch. Derechos reservados a sus autores (`LICENSE`); los formatos y datos de Bbosch/MLP no son parte de la obra. Hasta que Bbosch la acepte, es un piloto.
- **Plan de pago (2026-11-09, Cristóbal):** Supabase Pro y Vercel Pro se contratan cuando la empresa acepte la aplicación y la pague; antes se mide el ritmo en una marcha en blanco.
- **Un solo registro de cambios (2026-11-09):** bitácora única en `docs/bitacora/` con etiquetas `[WEB]`/`[APP]`; `demo/` y `docs/archivo/` eliminados por obsoletos.
- **No instalar «Free Claude Code» (2026-10-31):** proxy de terceros que reenvía código y prompts; el repositorio es infraestructura de MLP. No se reintenta sin revisión de TI.
- **Skills del proyecto (`.claude/skills/`):** `react-best-practices`, `web-design-guidelines` y `react-native-skills`; no reemplazan a `DESIGN.md` ni a `AGENTS.md`.
- **Dependencias:** solo las autorizadas en `CLAUDE.md`; en la app, además `@shopify/flash-list`, `expo-image`, `expo-crypto`, `expo-background-task`, `expo-task-manager`, Vitest (solo `src/lib`).
