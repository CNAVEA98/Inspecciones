"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { templateSchema } from "@/lib/templates/schema";
import { formatoPorIdBD } from "./plantillas";
import { prepararParaPublicar, problemasDeEdicion, resumenCambios } from "./editor";

export type ResultadoPublicar = { ok: true; version: number } | { ok: false; error: string };

const entrada = z.object({
  formatoId: z.string().min(1),
  /** Versión sobre la que se editó: si otra persona publicó antes, se rechaza para no pisar su trabajo. */
  versionBase: z.number().int().positive(),
  nota: z.string().trim().min(5, "Describa el cambio (mínimo 5 caracteres)").max(1000),
  schema: z.unknown(),
});

/**
 * Publica una versión nueva de un formato. Solo supervisor y administrador (también lo exigen la policy de RLS de
 * `form_templates` y la inmutabilidad de lo publicado). No modifica la versión anterior: las inspecciones ya enviadas
 * conservan la suya.
 */
export async function publicarVersion(input: z.input<typeof entrada>): Promise<ResultadoPublicar> {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "supervisor")) {
    return { ok: false, error: "Solo un supervisor o un administrador puede publicar formatos" };
  }
  const parsed = entrada.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const { formatoId, versionBase, nota } = parsed.data;

  const formato = await formatoPorIdBD(formatoId);
  if (!formato?.plantilla || formato.estado !== "disponible") return { ok: false, error: "Formato no encontrado" };

  const nueva = templateSchema.safeParse(parsed.data.schema);
  if (!nueva.success) return { ok: false, error: "La estructura del formato no es válida" };
  const limpia = prepararParaPublicar(nueva.data);
  if (!limpia.ok) return { ok: false, error: limpia.errors[0] };

  const supabase = await createClient();
  const [tipo, modo] = await Promise.all([
    supabase.from("equipment_types").select("id").eq("code", formato.plantilla.tipoEquipo).single(),
    supabase.from("work_modes").select("id").eq("code", formato.plantilla.modo).single(),
  ]);
  if (!tipo.data || !modo.data) return { ok: false, error: "El formato no existe en la base" };

  const { data: ultima, error: eUltima } = await supabase
    .from("form_templates")
    .select("version, schema")
    .eq("equipment_type_id", tipo.data.id)
    .eq("work_mode_id", modo.data.id)
    .eq("status", "published")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (eUltima || !ultima) return { ok: false, error: "No se pudo leer la versión vigente" };
  if (ultima.version !== versionBase) {
    return { ok: false, error: `Otra persona publicó la versión ${ultima.version} mientras usted editaba. Recargue la página y vuelva a aplicar sus cambios.` };
  }

  const vigente = templateSchema.safeParse(ultima.schema);
  if (!vigente.success) return { ok: false, error: "La versión vigente del formato no es válida" };
  const problemas = problemasDeEdicion(vigente.data, limpia.template);
  if (problemas.length) return { ok: false, error: problemas[0] };
  if (resumenCambios(vigente.data, limpia.template).length === 0) return { ok: false, error: "No hay cambios que publicar" };

  const version = ultima.version + 1;
  const { error } = await supabase.from("form_templates").insert({
    equipment_type_id: tipo.data.id,
    work_mode_id: modo.data.id,
    version,
    status: "published",
    schema: limpia.template,
    change_note: nota,
  });
  if (error) return { ok: false, error: `No se pudo publicar: ${error.message}` };

  for (const base of ["/admin", "/supervisor", "/planificador"]) {
    revalidatePath(`${base}/formatos`);
    revalidatePath(`${base}/formatos/${formatoId}`);
  }
  return { ok: true, version };
}
