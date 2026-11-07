import type { SupabaseClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/auth/session";
import { obtenerDetalle } from "@/lib/revision/queries";
import { generarPdf } from "./generar";
import { armarInforme } from "./modelo";
import { contentDisposition, nombrePdf } from "./nombre-archivo";

/**
 * Roles que pueden descargar informes. El personal descarga cualquiera; el técnico solo las suyas,
 * porque la lectura pasa por RLS con su sesión (una inspección ajena no se ve y responde 404).
 */
export const ROLES_CON_PDF = new Set(["admin", "supervisor", "planner", "technician"]);

export const texto = (mensaje: string, status: number) =>
  new Response(mensaje, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });

/**
 * Respuesta PDF de una inspección. Segunda línea de defensa tras el proxy: valida la sesión y el rol,
 * y la lectura pasa por RLS con la sesión del usuario (si no puede ver la inspección, no hay PDF).
 */
export async function responderPdf(id: string): Promise<Response> {
  const session = await getSession();
  if (!session) return texto("Sesión no iniciada", 401);
  if (!ROLES_CON_PDF.has(session.role)) return texto("Sin permiso para descargar informes", 403);
  return pdfDeInspeccion(id);
}

/**
 * Genera el PDF de una inspección ya validada la sesión. `cliente` permite leer con otra sesión de Supabase (la app móvil
 * envía su token en lugar de las cookies del navegador); sin él se usa la sesión por cookies. La lectura siempre pasa por RLS.
 */
export async function pdfDeInspeccion(id: string, cliente?: SupabaseClient): Promise<Response> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return texto("Inspección no encontrada", 404);

  const detalle = await obtenerDetalle(id, cliente);
  if (!detalle) return texto("Inspección no encontrada", 404);
  if (detalle.status === "draft") return texto("La inspección aún es un borrador", 409);

  const pdf = await generarPdf(armarInforme(detalle));
  const nombre = nombrePdf({
    titulo: detalle.plantilla?.meta?.titulo ?? detalle.plantilla?.title ?? detalle.equipo,
    equipmentTag: detalle.equipmentTag,
    fecha: detalle.submittedAt ?? detalle.startedAt,
  });
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": contentDisposition(nombre),
      "Cache-Control": "private, no-store",
    },
  });
}
