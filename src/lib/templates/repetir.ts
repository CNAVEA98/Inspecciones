import type { FormTemplateSchema, TemplateSection } from "./schema";

/** Clave de respuesta que guarda cuántas copias tiene cada sección repetible. */
export const CLAVE_REPETICIONES = "_repeticiones";

/** Tope de copias de una sección repetible (evita formularios sin fin por un error de toque). */
export const MAX_REPETICIONES = 30;

/** Sección → cantidad de copias (1 = solo la original). */
export type Repeticiones = Record<string, number>;

/** Lee lo guardado en las respuestas ignorando lo inválido: solo enteros entre 2 y MAX_REPETICIONES. */
export function leerRepeticiones(valor: unknown): Repeticiones {
  const out: Repeticiones = {};
  if (typeof valor !== "object" || valor === null || Array.isArray(valor)) return out;
  for (const [id, n] of Object.entries(valor as Record<string, unknown>)) {
    if (typeof n === "number" && Number.isInteger(n) && n >= 2) out[id] = Math.min(n, MAX_REPETICIONES);
  }
  return out;
}

export interface SeccionExpandida extends TemplateSection {
  /** Índice de la sección original en la plantilla (para volver al paso del formulario). */
  origen: number;
  /** Número de copia (1 = la original). */
  copia: number;
}

/** Id de un ítem en la copia `copia` (la copia 1 conserva el id original). */
export const idEnCopia = (id: string, copia: number) => (copia <= 1 ? id : `${id}__${copia}`);

/**
 * Despliega las secciones repetibles: la copia 1 conserva los ids de la plantilla; la copia k tiene los ids
 * «<id>__k». El título de una sección repetible lleva su número («Estructura 1», «Estructura 2»…).
 */
export function expandirSecciones(template: FormTemplateSchema, repeticiones: Repeticiones = {}): SeccionExpandida[] {
  return template.sections.flatMap((s, origen): SeccionExpandida[] => {
    if (!s.repetible) return [{ ...s, origen, copia: 1 }];
    const copias = repeticiones[s.id] ?? 1;
    return Array.from({ length: copias }, (_, i) => {
      const k = i + 1;
      return {
        ...s,
        id: idEnCopia(s.id, k),
        title: `${s.title} ${k}`,
        items: s.items.map((it) => ({ ...it, id: idEnCopia(it.id, k) })),
        origen,
        copia: k,
      };
    });
  });
}

/** La plantilla con sus secciones repetibles ya desplegadas (para validar, enviar, mostrar y armar el informe). */
export function expandirPlantilla(template: FormTemplateSchema, repeticiones: unknown = {}): FormTemplateSchema {
  const reps = leerRepeticiones(repeticiones);
  if (!template.sections.some((s) => s.repetible)) return template;
  return { ...template, sections: expandirSecciones(template, reps).map(({ origen: _o, copia: _c, ...s }) => (void _o, void _c, s)) };
}
