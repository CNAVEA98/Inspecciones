// Port de src/lib/tecnico/enviadas.ts de la web (2026-11-07), sobre `Almacen` en vez de Dexie. Ver app-movil/DISENO.md.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Almacen } from "@/lib/offline/almacen";
import type { DraftRecord } from "@/lib/offline/db";
import type { FormTemplateSchema, VerificationValue } from "@/lib/templates/schema";
import type { InspectionStatus } from "@/lib/estado";
import { CLAVE_REPETICIONES, expandirPlantilla, leerRepeticiones } from "@/lib/templates/repetir";
import { META, allItems, newDraft } from "./draft";
import { hoyIso } from "@/lib/fecha";
import { nuevoId } from "@/lib/id";

/** Inspección ya enviada, tal como la ve el técnico dueño (RLS: solo las suyas). */
export interface Enviada {
  id: string;
  folio: string | null;
  status: InspectionStatus;
  equipment_tag: string;
  area_id: string;
  equipment_type_id: string;
  work_mode_id: string;
  template_id: string;
  submitted_at: string | null;
  review_comment: string | null;
  reviewed_at: string | null;
  /** Nombre de quien realizó la inspección (la cuenta del turno la comparten varios técnicos). */
  performed_by?: string;
}

/** Texto y tono del estado desde el punto de vista del técnico (el tono lo traduce a colores la interfaz). */
export type Tono = "cobre" | "neutro" | "ok" | "malo";
export const ESTADO_ENVIADA: Record<InspectionStatus, { texto: string; tono: Tono }> = {
  draft: { texto: "Borrador", tono: "cobre" },
  submitted: { texto: "Enviada · en revisión", tono: "neutro" },
  supervisor_signed: { texto: "Revisada por supervisor", tono: "neutro" },
  approved: { texto: "Aprobada", tono: "ok" },
  rejected: { texto: "Rechazada", tono: "malo" },
};

/** Cuántas enviadas se guardan en el teléfono para buscar sin señal (la pantalla muestra solo las últimas y las filtra). */
export const LIMITE_ENVIADAS = 200;

const KEY = (userId: string) => `enviadas:${userId}`;
const COLUMNAS =
  "id, folio, status, equipment_tag, area_id, equipment_type_id, work_mode_id, template_id, submitted_at, review_comment, reviewed_at, performed_by";

export async function readEnviadasCache(almacen: Almacen, userId: string): Promise<Enviada[] | null> {
  const row = await almacen.leerCatalogo(KEY(userId));
  return (row?.value as Enviada[] | undefined) ?? null;
}

/** Cuándo se actualizó por última vez la copia local de las enviadas (ms); null si nunca. */
export async function fechaEnviadas(almacen: Almacen, userId: string): Promise<number | null> {
  return (await almacen.leerCatalogo(KEY(userId)))?.updatedAt ?? null;
}

/** Últimas inspecciones enviadas por el técnico. Con red actualiza la copia local; sin red usa la última. */
export async function cargarEnviadas(
  almacen: Almacen,
  supabase: SupabaseClient,
  userId: string,
  online: boolean,
): Promise<{ lista: Enviada[]; fromCache: boolean }> {
  if (online) {
    try {
      const { data, error } = await supabase
        .from("inspections")
        .select(COLUMNAS)
        .eq("technician_id", userId)
        .neq("status", "draft")
        .order("submitted_at", { ascending: false })
        .limit(LIMITE_ENVIADAS);
      if (error) throw error;
      const lista = (data ?? []) as Enviada[];
      await almacen.guardarCatalogo({ key: KEY(userId), value: lista, updatedAt: Date.now() });
      return { lista, fromCache: false };
    } catch {
      // cae a la copia local
    }
  }
  return { lista: (await readEnviadasCache(almacen, userId)) ?? [], fromCache: true };
}

/**
 * Borrador nuevo a partir de una inspección rechazada. Una inspección rechazada es definitiva: la corrección
 * se envía como inspección nueva (otro folio). Se copian cabecera, respuestas, hallazgos y los nombres de los firmantes;
 * las fotos y la firma del encargado NO se copian (viven en el servidor, no en este equipo) y hay que volver a tomarlas.
 */
export function borradorDeCorreccion(input: {
  userId: string;
  rechazada: Enviada;
  respuestas: { item_key: string; value: unknown }[];
  template: FormTemplateSchema;
}): DraftRecord {
  const { userId, rechazada, respuestas, template } = input;
  const draft = newDraft({
    userId,
    areaId: rechazada.area_id,
    equipmentTypeId: rechazada.equipment_type_id,
    workModeId: rechazada.work_mode_id,
    templateId: rechazada.template_id,
  });
  const porClave = new Map(respuestas.map((r) => [r.item_key, r.value]));

  const header = porClave.get(META.header);
  draft.header = {
    ...(header && typeof header === "object" ? (header as Record<string, string>) : {}),
    tag: rechazada.equipment_tag,
    fecha: hoyIso(),
  };

  const repeticiones = leerRepeticiones(porClave.get(CLAVE_REPETICIONES));
  if (Object.keys(repeticiones).length) draft.answers[META.repeticiones] = repeticiones;
  for (const item of allItems(expandirPlantilla(template, repeticiones))) {
    const v = porClave.get(item.id);
    if (v === undefined) continue;
    if (item.type === "verificacion") {
      const sinFotos = { ...(v as VerificationValue) };
      delete sinFotos.fotos;
      draft.answers[item.id] = sinFotos;
      if (sinFotos.estado === "ML") {
        draft.findings.push({
          id: nuevoId(),
          item_key: item.id,
          severity: "media",
          description: "",
          photo_attachment_id: null,
        });
      }
    } else if (item.type === "photo") {
      draft.answers[item.id] = [];
    } else {
      draft.answers[item.id] = v;
    }
  }

  for (const key of [META.ejecutor, META.diagnostico, META.roles, META.participantes]) {
    const v = porClave.get(key);
    if (v !== undefined) draft.answers[key] = v;
  }

  draft.correccion = {
    de: rechazada.id,
    folio: rechazada.folio ?? "",
    motivo: rechazada.review_comment ?? "",
  };
  return draft;
}

/** Respuestas de una inspección propia, para armar la corrección. */
export async function cargarRespuestas(supabase: SupabaseClient, inspectionId: string) {
  const { data, error } = await supabase.from("answers").select("item_key, value").eq("inspection_id", inspectionId);
  if (error) throw error;
  return (data ?? []) as { item_key: string; value: unknown }[];
}

/**
 * Búsqueda en el servidor para lo que ya no está entre las últimas guardadas en el teléfono: por TAG, folio o nombre de quien
 * la realizó (sin distinguir mayúsculas). Necesita señal. Lanza el error de Supabase si falla.
 */
export async function buscarEnviadasServidor(supabase: SupabaseClient, userId: string, texto: string, limite = 50): Promise<Enviada[]> {
  const t = textoSeguro(texto);
  if (!t) return [];
  const { data, error } = await supabase
    .from("inspections")
    .select(COLUMNAS)
    .eq("technician_id", userId)
    .neq("status", "draft")
    .or(`equipment_tag.ilike.%${t}%,folio.ilike.%${t}%,performed_by.ilike.%${t}%`)
    .order("submitted_at", { ascending: false })
    .limit(limite);
  if (error) throw error;
  return (data ?? []) as Enviada[];
}

/** Texto seguro para `ilike` de PostgREST (sin comodines ni separadores del filtro); null si queda de menos de 2 caracteres. */
export function textoSeguro(texto: string): string | null {
  const limpio = texto
    .replace(/[%*_\\,()"'`;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
  return limpio.length >= 2 ? limpio : null;
}
