# Diseño · App del técnico (réplica del modelo de la web)

Propuesta del 2026-11-07 (pendiente 3 de la bitácora). Objetivo: **que la app haga lo mismo que el área `/tecnico` de la web**,
con el mismo modelo de datos, las mismas reglas y las mismas pantallas, pero con almacenamiento nativo. Se construye con las
reglas de `.claude/skills/react-native-skills/`.

## 1. Decisión de fondo: duplicar, no compartir

La lógica de la web está atada a `@/` (alias de Next), `crypto.randomUUID`, Dexie y `window`. Compartir archivos entre la
web (pnpm, Next) y la app (npm, Metro) obligaría a tocar la web y a configurar Metro con carpetas externas y symlinks de pnpm.
**Se copia** la lógica pura a `app-movil/src/lib/` y se adapta solo la capa de almacenamiento. La web no se toca.

- Ventaja: la web y sus tests quedan intactos; la app se prueba sola.
- Costo: si cambia una regla en la web, hay que replicarla. Mitigación: cada archivo copiado lleva en su cabecera
  `Copia de src/lib/...` y la bitácora lista cuáles son (tabla «Copias» abajo).

## 2. Qué se copia tal cual y qué se adapta

| Web (`src/…`) | App (`app-movil/src/…`) | Cambio |
|---|---|---|
| `lib/templates/{schema,validate,repetir}.ts` | `lib/templates/` | Ninguno (Zod puro) |
| `lib/formatos/{catalogo,tags}.ts` | `lib/formatos/` | Ninguno |
| `lib/tecnico/draft.ts` | `lib/tecnico/draft.ts` | `crypto.randomUUID` → `nuevoId()` |
| `lib/offline/outbox.ts` (reintentos, backoff, `TransportError`) | `lib/offline/outbox.ts` | Misma lógica sobre `Almacen` (SQLite) |
| `lib/offline/transport.ts` | `lib/offline/transport.ts` | La foto se sube desde un archivo, no desde un `Blob` |
| `lib/tecnico/{catalog,enviadas}.ts` | `lib/tecnico/` | Lee y guarda en `Almacen` |
| `lib/fecha.ts` | `lib/fecha.ts` | Ninguno |
| `data/maestro-tags.json` (435 KB) | `data/maestro-tags.json` | Se copia con `scripts/export-maestro.py`; no se edita a mano |
| `components/tecnico/*` (HTML + Tailwind) | `components/` y `src/app/` (RN + `StyleSheet`) | Se reescriben, mismo comportamiento |

## 3. Almacenamiento (reemplaza a Dexie)

Una interfaz `Almacen` con la misma forma que usa hoy la web (`drafts`, `outbox`, `photos`, `catalog`), implementada con
**`expo-sqlite`** (ya instalado):

- `drafts`, `outbox`, `catalog`: columnas de índice (`id`, `technician_id`, `state`, `updated_at`, `status`, `next_attempt_at`)
  más una columna `json` con el registro completo. Mismo contenido que los `DraftRecord` / `OutboxRecord` de la web.
- `photos`: metadatos en SQLite y **la imagen como archivo** en el directorio de documentos de la app
  (`expo-file-system`), no como `Blob`. Ruta del bucket idéntica: `{technician_uid}/{inspection_id}/{photo_id}.jpg`.
- Guardado automático del borrador con el mismo debounce de 350 ms de la web.
- La sesión de Supabase se guarda con `expo-sqlite/kv-store` (viene con `expo-sqlite`, sin dependencia nueva) para que el
  técnico siga ingresado sin señal.

## 4. Red y sincronización

- Estado de red: `@react-native-community/netinfo` (ya instalado) en lugar de `navigator.onLine` / eventos `online`.
- `SyncController` igual que el de la web: envía al abrir, al volver la señal, al encolar y cada 30 s con la app abierta.
  Envío con la app cerrada: fuera de alcance por ahora (en iPhone es limitado).
- Subida de fotos y RPC `submit_inspection` idénticas; reintentos con backoff de 2 s a 5 min y 12 intentos máximo.

## 5. Pantallas (expo-router, stack nativo)

Réplica 1:1 de la web, en este orden de construcción:

1. **Ingreso** (`login`): usuario + contraseña → `usuarioAEmail` → `signInWithPassword`; lee `profiles.role`.
   Solo ingresa el rol técnico.
2. **Inicio** (`/`): botón «Nuevo Standard», resumen (Enviadas / Aceptadas / Rechazadas), «Mis inspecciones» con borradores
   y cola, «Enviadas» con estado, motivo de rechazo y «Corregir y reenviar». Indicador de sincronización en el encabezado.
3. **Nueva inspección**: 4 pasos Área → Trabajo → Familia → Formato, usando `formatosVisibles` / `familiasVisibles`.
4. **Formulario**: pasos «Datos del equipo» → una pantalla por sección → «Cierre y firma» → «Revisar y enviar»; ítems
   `verificacion`, `number`, `text`, `photo`, `nameplate`; secciones repetibles; severidad en ML; validación `validateDraft`
   con lista de faltantes navegable.
5. **Selector de TAG** sobre el Maestro, con búsqueda, sectores, «Ver todas las áreas», «Equipo sin TAG» y «+ Equipo».
6. **Fotos** (`expo-image-picker` + `expo-image-manipulator`) y **firma** (`react-native-signature-canvas`).
7. **PDF** de enviadas: fase posterior (decisión pendiente, ver bitácora).

## 6. Reglas de la skill que se aplican

- Listas virtualizadas con ítems memoizados y callbacks estables (`list-performance-*`): selector de TAG (≈ miles de equipos),
  inicio y formatos.
- Stack nativo de `expo-router` (`navigation-native-navigators`); modales nativos (`ui-native-modals`).
- `Pressable` y `StyleSheet.create` (`ui-pressable`, `ui-styling`); áreas seguras y `contentInsetAdjustmentBehavior`
  (`ui-safe-area-scroll`, `ui-scrollview-content-inset`).
- Estado mínimo y derivado (`react-state-minimize`, `state-ground-truth`); `&&` con booleanos, no con valores falsy
  (`rendering-no-falsy-and`); todo texto dentro de `<Text>`.
- Imágenes con `expo-image` (`ui-expo-image`, `list-performance-images`).

## 7. Dependencias nuevas (requieren autorización)

| Paquete | Para qué | Por qué hace falta |
|---|---|---|
| `@shopify/flash-list` | Lista virtualizada (TAG, inicio) | Regla CRÍTICA de la skill |
| `expo-image` | Fotos | Regla de la skill |
| `expo-crypto` | `randomUUID` | Hermes no trae `crypto.randomUUID`; los id deben ser UUID reales (la RPC y el Storage los usan) |

Sin ellas se puede avanzar con `FlatList` e `Image` de React Native, pero la skill lo desaconseja.

## 8. Conexión a Supabase

La app necesita `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY` en `app-movil/.env` (el archivo lo crea
Cristóbal; no se versiona ni lo toca Claude). Un teléfono no alcanza el Supabase local (`127.0.0.1`): para ingresar de verdad
hay que usar el Supabase del sitio publicado (remoto) o exponer el local por la IP de la Wi-Fi. **Conectar a un Supabase remoto
requiere confirmación explícita.** Mientras tanto, todo se construye y se verifica con `tsc` y `expo export`.

## 9. Fases (cada una con verificación y entrada en la bitácora)

1. **Base:** copias de la lógica, `Almacen` SQLite, cliente Supabase, sesión, `nuevoId`. Sin pantallas nuevas.
2. **Ingreso, catálogo e inicio:** login, descarga del catálogo («Listo para trabajar sin señal» con fecha), inicio.
3. **Nueva inspección y formulario:** 4 pasos, secciones, ítems, selector de TAG.
4. **Fotos, firma, cola de envío y sincronización.**
5. **Corrección de rechazadas, pruebas sin señal (Android APK / iPhone) y pulido.**

## 10. Pruebas

La web tiene tests (Vitest) para `draft`, `outbox`, `catalog`, `enviadas`, plantillas y formatos. En la app no hay ejecutor de
pruebas todavía; propuesta: Vitest solo para `src/lib/` (lógica pura, sin React Native), copiando los tests de la web que
correspondan. Requiere autorización (dependencia de desarrollo nueva).
