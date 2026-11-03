import { templateSchema, type FormTemplateSchema, type TemplateItem, type TemplateSection } from "@/lib/templates/schema";
import { CLAVES_CABECERA_ESTANDAR } from "./estandar";

/**
 * Lógica pura del editor de formatos (sin React ni base de datos). Todas las operaciones devuelven una plantilla nueva.
 *
 * Reglas que protegen los datos:
 * - El `id` de un ítem o sección existente no se cambia nunca: las respuestas, hallazgos y reportes lo usan como clave.
 * - Los ids nuevos se generan aquí (a partir del texto), únicos en toda la plantilla y sin «__» (reservado para las copias
 *   de secciones repetibles).
 * - Una versión publicada no se modifica: se publica una versión nueva y las inspecciones ya enviadas conservan la suya.
 */

export type TipoItemNuevo = "verificacion" | "number" | "text" | "photo";

export const TIPO_ITEM_LABEL: Record<TemplateItem["type"], string> = {
  verificacion: "Verificación (BN/ML/…)",
  number: "Número",
  text: "Texto",
  photo: "Foto",
  nameplate: "Placa de datos",
};

/** Texto → id válido (snake_case, sin tildes, empieza con letra, máx. 40 caracteres, sin «__»). */
export function slugId(texto: string, usados: ReadonlySet<string>, prefijo = "item"): string {
  let base = texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40)
    .replace(/_+$/g, "");
  if (!base) base = prefijo;
  if (!/^[a-z]/.test(base)) base = `${prefijo}_${base}`;
  let id = base;
  for (let n = 2; usados.has(id); n++) id = `${base}_${n}`;
  return id;
}

/** Todos los ids en uso (secciones e ítems). */
export function idsEnUso(t: FormTemplateSchema): Set<string> {
  const ids = new Set<string>();
  for (const s of t.sections) {
    ids.add(s.id);
    for (const it of s.items) ids.add(it.id);
  }
  return ids;
}

export const totalItems = (t: FormTemplateSchema) => t.sections.reduce((n, s) => n + s.items.length, 0);

function itemNuevo(tipo: TipoItemNuevo, id: string, label: string): TemplateItem {
  switch (tipo) {
    case "verificacion":
      return { id, label, type: "verificacion" };
    case "number":
      return { id, label, type: "number", required: true, unit: "u" };
    case "text":
      return { id, label, type: "text", required: true, multiline: false };
    case "photo":
      return { id, label, type: "photo", required: true, maxPhotos: 1 };
  }
}

const mapSecciones = (t: FormTemplateSchema, f: (s: TemplateSection, i: number) => TemplateSection | null): FormTemplateSchema => ({
  ...t,
  sections: t.sections.flatMap((s, i) => {
    const r = f(s, i);
    return r ? [r] : [];
  }),
});

const mapItems = (t: FormTemplateSchema, seccionId: string, f: (items: TemplateItem[]) => TemplateItem[]) =>
  mapSecciones(t, (s) => (s.id === seccionId ? { ...s, items: f(s.items) } : s));

/** Mueve el elemento `i` una posición (−1 arriba, +1 abajo). Fuera de rango no hace nada. */
function mover<T>(lista: readonly T[], i: number, delta: -1 | 1): T[] {
  const j = i + delta;
  if (i < 0 || j < 0 || i >= lista.length || j >= lista.length) return [...lista];
  const copia = [...lista];
  [copia[i], copia[j]] = [copia[j], copia[i]];
  return copia;
}

export function renombrarSeccion(t: FormTemplateSchema, seccionId: string, title: string): FormTemplateSchema {
  return mapSecciones(t, (s) => (s.id === seccionId ? { ...s, title } : s));
}

export function moverSeccion(t: FormTemplateSchema, seccionId: string, delta: -1 | 1): FormTemplateSchema {
  const i = t.sections.findIndex((s) => s.id === seccionId);
  return { ...t, sections: mover(t.sections, i, delta) };
}

/** Agrega una sección con su primer ítem (una sección no puede quedar vacía). */
export function agregarSeccion(t: FormTemplateSchema, titulo: string, primerItem: string): FormTemplateSchema {
  const usados = idsEnUso(t);
  const sid = slugId(titulo, usados, "seccion");
  usados.add(sid);
  const iid = slugId(primerItem, usados);
  return { ...t, sections: [...t.sections, { id: sid, title: titulo, items: [itemNuevo("verificacion", iid, primerItem)] }] };
}

/** Quita una sección. No se puede quitar la última. */
export function quitarSeccion(t: FormTemplateSchema, seccionId: string): FormTemplateSchema {
  if (t.sections.length <= 1) return t;
  return mapSecciones(t, (s) => (s.id === seccionId ? null : s));
}

export function agregarItem(
  t: FormTemplateSchema,
  seccionId: string,
  tipo: TipoItemNuevo,
  label: string,
): FormTemplateSchema {
  const id = slugId(label, idsEnUso(t));
  return mapItems(t, seccionId, (items) => [...items, itemNuevo(tipo, id, label)]);
}

/** Cambia campos editables de un ítem (texto, ayuda, unidad, rango, obligatoriedad…). El `id` y el `type` no se tocan. */
export function editarItem(
  t: FormTemplateSchema,
  itemId: string,
  cambios: Partial<{
    label: string;
    help: string;
    unit: string | undefined;
    min: number | undefined;
    max: number | undefined;
    required: boolean;
    multiline: boolean;
    maxPhotos: number;
  }>,
): FormTemplateSchema {
  return mapSecciones(t, (s) => ({
    ...s,
    items: s.items.map((it) => (it.id === itemId ? ({ ...it, ...cambios, id: it.id, type: it.type } as TemplateItem) : it)),
  }));
}

export function moverItem(t: FormTemplateSchema, seccionId: string, itemId: string, delta: -1 | 1): FormTemplateSchema {
  return mapItems(t, seccionId, (items) => mover(items, items.findIndex((it) => it.id === itemId), delta));
}

/** Quita un ítem. No se puede dejar una sección sin ítems (quite la sección). */
export function quitarItem(t: FormTemplateSchema, seccionId: string, itemId: string): FormTemplateSchema {
  const sec = t.sections.find((s) => s.id === seccionId);
  if (!sec || sec.items.length <= 1) return t;
  return mapItems(t, seccionId, (items) => items.filter((it) => it.id !== itemId));
}

// ---------- Cabecera: los campos estándar (TAG, OT, ubicación, fecha, horario) son fijos; los extra se editan ----------

export type TipoCampoCabecera = "text" | "number" | "date";

export const TIPO_CAMPO_LABEL: Record<FormTemplateSchema["header"][number]["input"], string> = {
  text: "Texto",
  number: "Número",
  date: "Fecha",
  time: "Hora",
};

export const esCampoEstandar = (key: string) => CLAVES_CABECERA_ESTANDAR.has(key);

/** Agrega un campo extra a la cabecera (p. ej. «Marca»), al final. */
export function agregarCampoCabecera(t: FormTemplateSchema, label: string, input: TipoCampoCabecera): FormTemplateSchema {
  const usados = new Set([...t.header.map((h) => h.key), ...CLAVES_CABECERA_ESTANDAR]);
  const key = slugId(label, usados, "dato");
  return { ...t, header: [...t.header, { key, label, input, required: false }] };
}

/** Cambia el nombre o la obligatoriedad de un campo extra. Los estándar no se tocan. */
export function editarCampoCabecera(t: FormTemplateSchema, key: string, cambios: Partial<{ label: string; required: boolean }>): FormTemplateSchema {
  if (esCampoEstandar(key)) return t;
  return { ...t, header: t.header.map((h) => (h.key === key ? { ...h, ...cambios, key: h.key, input: h.input } : h)) };
}

/** Quita un campo extra. Los estándar no se quitan. */
export function quitarCampoCabecera(t: FormTemplateSchema, key: string): FormTemplateSchema {
  if (esCampoEstandar(key)) return t;
  return { ...t, header: t.header.filter((h) => h.key !== key) };
}

/** Ítems que usan las lecturas destacadas del informe: no se pueden quitar sin antes cambiar la lectura. */
export function itemsEnLecturas(t: FormTemplateSchema): Set<string> {
  const s = new Set<string>();
  for (const r of t.readings) {
    s.add(r.item);
    if (r.maxItem) s.add(r.maxItem);
  }
  return s;
}

/** Limpia espacios, elimina ayudas vacías y valida contra el esquema. Es lo que se guarda al publicar. */
export function prepararParaPublicar(t: FormTemplateSchema): { ok: true; template: FormTemplateSchema } | { ok: false; errors: string[] } {
  const errores: string[] = [];
  const limpio: FormTemplateSchema = mapSecciones(t, (s) => ({
    ...s,
    title: s.title.trim(),
    items: s.items.map((it) => {
      const { help, ...resto } = it;
      const h = help?.trim();
      return { ...resto, label: it.label.trim(), ...(h ? { help: h } : {}) } as TemplateItem;
    }),
  }));
  limpio.header = limpio.header.map((h) => ({ ...h, label: h.label.trim() }));
  for (const h of limpio.header) if (!h.label) errores.push("Hay un campo de la cabecera sin nombre");
  for (const s of limpio.sections) {
    if (!s.title) errores.push("Hay una sección sin título");
    for (const it of s.items) if (!it.label) errores.push(`Hay un ítem sin texto en «${s.title || s.id}»`);
  }
  if (errores.length) return { ok: false, errors: errores };
  const r = templateSchema.safeParse(limpio);
  if (!r.success) return { ok: false, errors: r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) };
  return { ok: true, template: r.data };
}

/**
 * Segunda barrera (la usa el servidor): la plantilla nueva solo puede diferir de la vigente en las secciones y sus ítems,
 * y sin cambiar el tipo ni la condición «repetible» de lo que ya existía. Devuelve los problemas ([] = permitido).
 */
export function problemasDeEdicion(base: FormTemplateSchema, nueva: FormTemplateSchema): string[] {
  const out: string[] = [];
  const { sections: _a, header: hBase, ...restoBase } = base;
  const { sections: _b, header: hNueva, ...restoNueva } = nueva;
  void _a; void _b;
  if (JSON.stringify(restoBase) !== JSON.stringify(restoNueva)) {
    out.push("Solo se pueden editar las secciones, sus ítems y los campos extra de la cabecera (roles, lecturas y estados no se modifican aquí)");
  }
  const cabNueva = new Map(hNueva.map((h) => [h.key, h]));
  for (const h of hBase) {
    const n = cabNueva.get(h.key);
    if (esCampoEstandar(h.key)) {
      if (!n || JSON.stringify(n) !== JSON.stringify(h)) out.push(`El campo estándar «${h.label}» de la cabecera no se puede cambiar ni quitar`);
    } else if (n && n.input !== h.input) {
      out.push(`No se puede cambiar el tipo del campo «${h.label}» de la cabecera`);
    }
  }
  const clavesBase = new Set(hBase.map((h) => h.key));
  for (const h of hNueva) {
    if (!clavesBase.has(h.key) && esCampoEstandar(h.key)) out.push(`El campo «${h.label}» usa una clave reservada`);
  }
  const secBase = new Map(base.sections.map((s) => [s.id, s]));
  for (const s of nueva.sections) {
    const a = secBase.get(s.id);
    if (a && Boolean(a.repetible) !== Boolean(s.repetible)) out.push(`No se puede cambiar si «${a.title}» es repetible`);
  }
  const itemsBase = new Map(base.sections.flatMap((s) => s.items.map((it) => [it.id, it] as const)));
  for (const it of nueva.sections.flatMap((s) => s.items)) {
    const a = itemsBase.get(it.id);
    if (a && a.type !== it.type) out.push(`No se puede cambiar el tipo del ítem «${a.label}»`);
    if (a?.type === "nameplate" && it.type === "nameplate" && JSON.stringify(a.fields) !== JSON.stringify(it.fields)) {
      out.push(`No se pueden cambiar los campos de la placa «${a.label}»`);
    }
  }
  for (const [id, it] of itemsBase) {
    if (itemsEnLecturas(base).has(id) && !nueva.sections.some((s) => s.items.some((x) => x.id === id))) {
      out.push(`El ítem «${it.label}» alimenta una lectura del informe y no se puede quitar`);
    }
  }
  return out;
}

export interface Cambio {
  tipo: "campo-nuevo" | "campo-quitado" | "campo-editado" | "seccion-nueva" | "seccion-quitada" | "seccion-renombrada" | "seccion-movida" | "item-nuevo" | "item-quitado" | "item-editado" | "item-movido";
  texto: string;
}

/** Resumen legible de lo que cambió entre dos versiones (para confirmar antes de publicar y para la nota de cambios). */
export function resumenCambios(antes: FormTemplateSchema, despues: FormTemplateSchema): Cambio[] {
  const out: Cambio[] = [];
  const cabA = new Map(antes.header.map((h) => [h.key, h]));
  const cabD = new Map(despues.header.map((h) => [h.key, h]));
  for (const h of despues.header) {
    const a = cabA.get(h.key);
    if (!a) out.push({ tipo: "campo-nuevo", texto: `Campo nuevo en la cabecera «${h.label}»` });
    else if (a.label !== h.label || a.required !== h.required) {
      out.push({ tipo: "campo-editado", texto: a.label !== h.label ? `Campo de cabecera «${a.label}» → «${h.label}»` : `Campo de cabecera «${h.label}»: obligatorio` });
    }
  }
  for (const h of antes.header) if (!cabD.has(h.key)) out.push({ tipo: "campo-quitado", texto: `Campo quitado de la cabecera «${h.label}»` });
  const secA = new Map(antes.sections.map((s) => [s.id, s]));
  const secD = new Map(despues.sections.map((s) => [s.id, s]));
  const itemsA = new Map(antes.sections.flatMap((s) => s.items.map((it) => [it.id, { it, sec: s.id }] as const)));
  const itemsD = new Map(despues.sections.flatMap((s) => s.items.map((it) => [it.id, { it, sec: s.id }] as const)));

  for (const s of despues.sections) {
    const a = secA.get(s.id);
    if (!a) out.push({ tipo: "seccion-nueva", texto: `Sección nueva «${s.title}» (${s.items.length} ítem${s.items.length === 1 ? "" : "s"})` });
    else if (a.title !== s.title) out.push({ tipo: "seccion-renombrada", texto: `Sección «${a.title}» → «${s.title}»` });
  }
  for (const s of antes.sections) if (!secD.has(s.id)) out.push({ tipo: "seccion-quitada", texto: `Sección quitada «${s.title}» (${s.items.length} ítems)` });

  const ordenSecciones = (t: FormTemplateSchema) => t.sections.map((s) => s.id).filter((id) => secA.has(id) && secD.has(id));
  if (ordenSecciones(antes).join() !== ordenSecciones(despues).join()) out.push({ tipo: "seccion-movida", texto: "Cambió el orden de las secciones" });

  for (const [id, { it, sec }] of itemsD) {
    const a = itemsA.get(id);
    const donde = despues.sections.find((s) => s.id === sec)?.title ?? sec;
    if (!a) {
      out.push({ tipo: "item-nuevo", texto: `Ítem nuevo «${it.label}» en «${donde}»` });
      continue;
    }
    const partes: string[] = [];
    if (a.it.label !== it.label) partes.push(`texto «${a.it.label}» → «${it.label}»`);
    if ((a.it.help ?? "") !== (it.help ?? "")) partes.push("ayuda");
    const va = a.it as Record<string, unknown>, vd = it as Record<string, unknown>;
    for (const k of ["unit", "min", "max", "required", "multiline", "maxPhotos"] as const) if (va[k] !== vd[k]) partes.push(`${k === "unit" ? "unidad" : k === "min" ? "mínimo" : k === "max" ? "máximo" : k === "required" ? "obligatorio" : k === "multiline" ? "varias líneas" : "máx. de fotos"}`);
    if (partes.length) out.push({ tipo: "item-editado", texto: `Ítem «${it.label}»: ${partes.join(", ")}` });
  }
  for (const [id, { it, sec }] of itemsA) {
    if (!itemsD.has(id)) out.push({ tipo: "item-quitado", texto: `Ítem quitado «${it.label}» de «${secA.get(sec)?.title ?? sec}»` });
  }

  for (const s of despues.sections) {
    const a = secA.get(s.id);
    if (!a) continue;
    const comunes = (items: TemplateItem[]) => items.map((it) => it.id).filter((id) => a.items.some((x) => x.id === id) && s.items.some((x) => x.id === id));
    if (comunes(a.items).join() !== comunes(s.items).join()) out.push({ tipo: "item-movido", texto: `Cambió el orden de los ítems en «${s.title}»` });
  }
  return out;
}

/** Nota de cambios por defecto a partir del resumen (el usuario puede completarla). */
export const notaSugerida = (cambios: readonly Cambio[]) =>
  cambios.length === 0 ? "" : cambios.slice(0, 6).map((c) => c.texto).join("; ") + (cambios.length > 6 ? `; y ${cambios.length - 6} cambios más` : "");
