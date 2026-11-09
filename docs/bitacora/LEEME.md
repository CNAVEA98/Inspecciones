# Bitácora oficial · cómo usarla

La bitácora es **una sola** y vive en esta carpeta. Reemplaza a `docs/bitacora/` y `docs/bitacora/REGISTRO.md` (fusionadas el 2026-11-09 sin perder entradas).

| Archivo | Contenido |
|---|---|
| [`REGISTRO.md`](REGISTRO.md) | Historial completo de cada cambio, de lo más reciente a lo más antiguo. Etiqueta `[WEB]` o `[APP]` en cada título. **No se borra nada.** |
| [`ESTADO.md`](ESTADO.md) | Estado actual, pendientes numerados y decisiones (web y app). Se reescribe. |
| `LEEME.md` | Este archivo: reglas, formato y versiones. |

## Cómo registrar una mejora

1. Agregue una entrada **al inicio** de `REGISTRO.md` (la más reciente arriba), con este formato:

   ```
   ### AAAA-MM-DD · [WEB] o [APP] Título corto
   - **Autor:** nombre
   - **Versión:** V1.1.x (la nueva, ver «Versiones» abajo; solo cambios de la web)
   - **Qué se hizo:** 1 a 3 líneas
   - **Archivos:** rutas principales
   - **Verificación:** comando y resultado real (lint, tsc, tests, build, prueba manual) o «no verificado» y por qué
   - **Pendiente / riesgos:** lo que quedó sin hacer o sin probar
   ```
2. Reescriba `ESTADO.md` si cambian el estado, un pendiente o una decisión, y **ponga en su primera línea la fecha de hoy**, la versión y el commit (no se agrega al final: se depura).
3. Si un cambio modifica una decisión, anótelo también en «Decisiones».
4. No borre entradas antiguas: si algo se revierte, agregue una entrada nueva que lo diga.

## Reglas comunes

- Cambios de la app móvil (`app-movil/`): misma regla, etiqueta `[APP]`, mismo commit. Si tocan web y app, una entrada con ambas etiquetas.
- Si algo no se pudo probar, escriba «no verificado» y por qué. No marque como hecho lo no probado.
- Conflicto al unir ramas: conserve **ambas** entradas (la más reciente arriba).
- La entrada viaja en el **mismo commit** que el cambio.

## Versiones

La versión se ve al pie de cada pantalla (p. ej. «V1.1.0») y sirve de referencia al reportar problemas. Se partió en
**V1.1.0** el 2026-11-03. **Cada mejora que se une a `main` sube el último número** (V1.1.1, V1.1.2…): cambie
`version` en `package.json` y `VERSION_APP` en `src/lib/version.ts` (un test exige que sean iguales) y anote la versión
en la entrada de la bitácora. Si dos ramas suben al mismo número, la que se une segunda sube uno más.

| Versión | Fecha | Qué incluye |
|---|---|---|
| V1.1.7 | 2026-11-09 | Una inspección rechazada admite una sola corrección (migración 0021, `corrects_id` único); la web y la app avisan si ya fue corregida, aunque sea desde otro teléfono de la misma cuenta |
| V1.1.6 | 2026-11-09 | PDF oficial de las inspecciones aprobadas archivado en el bucket privado `reports` (lo escribe solo el servidor con la clave de servicio) y entregado desde ahí en cada descarga |
| V1.1.5 | 2026-11-09 | Autoría de la aplicación (para Bbosch, no a su nombre), `LICENSE`, pie, Privacidad y Condiciones |
| V1.1.4 | 2026-11-07 | Endpoint `/api/movil/informe/[id]` para que la app móvil descargue el PDF con su token (sin tocar el PDF ni las rutas de la web) |
| V1.1.3 | 2026-11-06 | Contraseñas de las cuentas de prueba fuera del repositorio: plantilla del seed sin claves y `corepack pnpm seed:usuarios` |
| V1.1.2 | 2026-11-06 | Supabase CLI actualizado de 2.122.0 a 3.0.0 y `config.toml` sin avisos de claves obsoletas |
| V1.1.1 | 2026-11-06 | Informe PDF: severidad de hallazgos, TAG sin guionado, NA fuera del denominador, rótulo de mantención; plantillas con TAG y redacción corregidos |
| V1.1.0 | 2026-11-03 | Punto de partida: todo lo unido hasta el PR #10 más visor del PDF del técnico, pie de página con versión, Privacidad, Condiciones de uso, aviso de privacidad al primer ingreso, fotos sin metadatos y dependencias sin vulnerabilidades |

## Al iniciar cada sesión (obligatorio)

Cada vez que se abre una sesión nueva (persona o Claude), **antes de cualquier cambio**, compare el repositorio de
GitHub con la copia local y baje lo último:

1. `git fetch origin` y `git status`: diga en qué rama está y si hay cambios locales sin commit.
2. Compare con GitHub: `git log --oneline HEAD..origin/main` (lo que falta bajar) y `git log --oneline origin/main..HEAD`
   (lo local que GitHub no tiene). Revise también las ramas remotas nuevas (`git branch -r`) y los PR abiertos.
3. Si `main` está atrasado: `git switch main` y `git pull --ff-only origin main`. Si está en una rama de trabajo, traiga
   `main` a esa rama (`git merge origin/main`) y resuelva conflictos conservando ambas entradas de la bitácora.
4. Si hubo cambios, vuelva a leer esta bitácora (Registro, Estado actual y Pendientes) y, si cambiaron dependencias o
   migraciones, corra `corepack pnpm install` y `corepack pnpm supabase db reset`.
5. Si el `pull` falla (credenciales, conflicto, rama divergente), no lo fuerce: anote el error y avise antes de seguir.
