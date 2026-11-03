import { templateSchema, type FormTemplateSchema } from "@/lib/templates/schema";
import type { TipoTrabajo } from "./catalogo";

/**
 * Estructura estándar de los formatos (tomada de la base el 2026-11-03): la cabecera que comparten los formatos,
 * las tres firmas que tienen los 60 y la leyenda de estados según el tipo de trabajo. El nombre del técnico, la firma
 * del encargado y los participantes no van aquí: los agrega la app en todos los formatos.
 */

/** Cabecera estándar. En el informe estos campos van en el encabezado (TAG, OT, lugar, fecha y horario). */
export const CABECERA_ESTANDAR: FormTemplateSchema["header"] = [
  { key: "tag", label: "TAG Equipo", input: "text", required: true },
  { key: "ot", label: "N° OT", input: "text", required: true },
  { key: "ubicacion", label: "Ubicación", input: "text", required: true },
  { key: "fecha", label: "Fecha", input: "date", required: true },
  { key: "h_inicio", label: "Hora inicio", input: "time", required: true },
  { key: "h_fin", label: "Hora término", input: "time", required: true },
];

/** Claves de la cabecera estándar: no se editan ni se quitan desde el editor. */
export const CLAVES_CABECERA_ESTANDAR: ReadonlySet<string> = new Set(CABECERA_ESTANDAR.map((h) => h.key));

/** Las firmas de los 60 formatos. */
export const ROLES_ESTANDAR = ["Encargado de la actividad", "Supervisor Bbosch", "Planificador Bbosch"];

/** Leyenda y estados por tipo de trabajo (los más usados en los formatos actuales). */
export const ESTADOS_POR_TIPO: Record<TipoTrabajo, { estados?: FormTemplateSchema["estados"]; nomenclatura: string }> = {
  INSP: {
    nomenclatura:
      "NT: No tiene / BN: Bueno / ML: Malo / NA: No aplica / NR: No realizada (indicar motivos en observaciones). En caso de observaciones críticas, se adjunta registro fotográfico con la referencia.",
  },
  MANT: {
    estados: ["RL", "NR", "BN", "ML", "RMP", "NT"],
    nomenclatura:
      "RL: REALIZADO / NR: NO REALIZADO / ML: MALO / BN: BUENO / RMP: REEMPLAZADO (Indicar motivos en observaciones) / NT: NO TIENE",
  },
};

/** Plantilla en blanco con la estructura estándar y una sección con su primera pregunta (el esquema exige una). */
export function plantillaEnBlanco(tipo: TipoTrabajo, titulo: string, norma: string, revision: string): FormTemplateSchema {
  const { estados, nomenclatura } = ESTADOS_POR_TIPO[tipo];
  return templateSchema.parse({
    title: titulo,
    meta: { norma, revision, titulo },
    nomenclature: nomenclatura,
    ...(estados ? { estados } : {}),
    header: CABECERA_ESTANDAR,
    roles: ROLES_ESTANDAR,
    readings: [],
    sections: [
      {
        id: "seccion_1",
        title: "Sección 1",
        items: [{ id: "pregunta_1", type: "verificacion", label: "Primera pregunta (cambie este texto)" }],
      },
    ],
  });
}
