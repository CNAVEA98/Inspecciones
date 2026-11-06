# Auditoría de solo lectura · flujo del técnico (2026-10-31)

Hecha con las skills `react-best-practices` (rendimiento de React/Next, 70 reglas de Vercel) y `web-design-guidelines`
(reglas de interfaz de Vercel, bajadas de su repositorio el mismo día). **No se cambió código**: son hallazgos para
decidir, ordenados por utilidad real para un técnico en terreno (teléfono, guantes, sin red).

**Archivos revisados:** `formulario.tsx`, `selector-tag.tsx`, `item-field.tsx`, `photo-field.tsx`, `inicio-tecnico.tsx`
(en `src/components/tecnico/`).
**No revisados:** `tecnico-provider`, `nueva-inspeccion`, `tarjeta-borrador`, `sync-indicator`, `signature-field`, el área
del supervisor y `src/lib`.
**Método:** lectura del código; nada se ejecutó ni se midió en un teléfono. Los hallazgos de rendimiento son hipótesis
hasta medirlos.

## Ya cumple (no tocar)

- El Maestro de TAG (≈400 KB) se carga con `import()` dinámico al abrir el formulario (`selector-tag.tsx:33`): regla `bundle-dynamic-imports`.
- Condicionales con ternario, no con `&&` (`rendering-conditional-render`).
- Sin `transition: all`; el zoom no está bloqueado; existe `prefers-reduced-motion` en `globals.css:27`.
- Botones con `type="button"`, `aria-pressed`, `aria-label` en «Quitar foto», `role="alert"` en errores y `aria-live` en «Guardando».
- Campos con `autoComplete` y `inputMode="decimal"` en números; guardado automático (no hace falta avisar al salir).

## Interfaz (prioridad para terreno)

1. **Botón «Quitar foto» de 24 px** (`photo-field.tsx:22`, `size-6`). Con guantes o a pleno sol es fácil borrar una foto
   sin querer o no acertar. Subir el área táctil a 44 px (se puede mantener el ícono pequeño).
2. **Acciones destructivas sin confirmar ni deshacer:** «Quitar sección» borra respuestas y hallazgos (`formulario.tsx:330`,
   lógica en 156-163) y «Quitar foto» borra el archivo al instante (`photo-field.tsx:71-74`). Pedir confirmación o dar un
   «Deshacer» de unos segundos.
3. **Barra inferior fija sin margen de seguridad** (`formulario.tsx:457-459`): no usa `env(safe-area-inset-bottom)`; en
   iPhone con barra de inicio puede quedar pegada. Depende de si el `viewport` usa `viewport-fit=cover`: **no verificado**.
4. **El paso del formulario vive solo en `useState`** (`formulario.tsx:60`): al recargar o volver desde el navegador se
   regresa al paso 0. La regla pide reflejarlo en la URL. Ojo: con el service worker offline la URL del formulario es
   compartida (ver `useIdDeUrl`), así que habría que probarlo sin red antes de adoptarlo.
5. **Texto de 11 px** en la etiqueta de cada estado (`item-field.tsx:172`, «Bueno», «No aplica»…). Es el dato que más se
   toca; conviene 12–13 px aunque se acorten palabras.
6. **Estados de carga y placeholders sin «…»**: «Abriendo inspección» (`formulario.tsx:100`), «Cargando el formulario»
   (115), «Cargando equipos» (`selector-tag.tsx:262`), «Guardando» (226) y el placeholder de búsqueda (`selector-tag.tsx:117`).
   `inicio-tecnico.tsx` sí usa «Cargando…»: unificar. Revisar contra `docs/DESIGN.md` por si hay una norma distinta.
7. **Menores:** sin `touch-action: manipulation` (doble toque puede hacer zoom en botones); campos sin `name`;
   el `alt` de todas las miniaturas es «Foto adjunta» (podría ser «Foto 1 de 3»); `focus:` en lugar de `focus-visible:` en
   `campo`; varios botones del formulario (anterior/siguiente, agregar sección) no tienen estilo `focus-visible` propio
   (conservan el del navegador).

## Rendimiento de React (medir antes de cambiar)

1. **Cada tecla re-renderiza todo el formulario.** `setAnswer` cambia `draft` y `Formulario` recalcula en el render
   `expandirSecciones`, `validateDraft` y los `find` por ítem (`formulario.tsx:123-144, 310-312`); `ItemField` no está
   memoizado y recibe funciones nuevas (`onChange`, `onSeverity`) en cada render. Con plantillas de 29 ítems o secciones
   repetibles puede notarse en teléfonos modestos. Reglas: `rerender-memo`, `rerender-derived-state-no-effect`,
   `rerender-functional-setstate`. Opción de bajo riesgo: `useMemo` para `validateDraft` y `memo(ItemField)` con
   callbacks estables.
2. **Búsqueda de TAG sin diferir** (`selector-tag.tsx:81-84`): filtra hasta 1.073 equipos por tecla. La regla
   `rerender-use-deferred-value` (`useDeferredValue(texto)`) mantiene el teclado fluido. Prioridad baja.
3. **Búsquedas lineales repetidas** (`inicio-tecnico.tsx:55-56, 141-142, 188-189`): `find` por cada tarjeta para nombre
   de área y equipo. Regla `js-index-maps`. Irrelevante con pocas tarjetas; solo si la lista crece.
4. Reglas del skill que **no aplican** hoy: las de servidor (`server-*`) y `async-*` casi no tocan este flujo, porque el
   formulario es 100 % cliente con Dexie. Valdría revisarlas en el área del supervisor y en las rutas de PDF.

## Siguiente paso sugerido

Tomar 1, 2 y 5 de «Interfaz» (cambios chicos, de alto valor en terreno) en una rama aparte, con prueba en teléfono real,
y medir el punto 1 de rendimiento con el Profiler de React antes de memoizar.

## Estado de los hallazgos (actualizado 2026-10-31, rama `fix/ux-terreno-tecnico`)

- **Aplicados:** Interfaz 1 (botón de foto), 2 (confirmaciones), 5 (texto de 12 px), 6 (puntos suspensivos) y parte del 7 (`touch-action`, `alt` de fotos).
- **Descartado:** Interfaz 3 (zona segura): el `viewport` no usa `viewport-fit=cover`, el navegador ya la respeta.
- **Pendiente:** Interfaz 4 (paso en la URL) y el resto del 7; Rendimiento 1 a 3. Medido: `validateDraft` ≈7 µs por render con 29 ítems, así que el cálculo no es el problema; falta medir el render de los `ItemField` en el teléfono.
