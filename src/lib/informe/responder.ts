import type { SupabaseClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/auth/session";
import { obtenerDetalle, type DetalleInspeccion } from "@/lib/revision/queries";
import { almacenSupabase, clienteServicio, obtenerOArchivar, rutaInforme } from "./archivo";
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

  const pdf = await bytesDelInforme(detalle);
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

/**
 * Bytes del PDF. Una inspección aprobada entrega su copia archivada en `reports` (y la crea si aún no existe: así quedan
 * cubiertas también las aprobadas antes de este cambio); el resto se genera al vuelo. Sin clave de servicio (por ejemplo
 * en un equipo sin `SUPABASE_SERVICE_ROLE_KEY`) todo se genera al vuelo, como antes.
 */
async function bytesDelInforme(detalle: DetalleInspeccion): Promise<Uint8Array> {
  const generar = async () => new Uint8Array(await generarPdf(armarInforme(detalle)));
  const ruta = detalle.status === "approved" ? rutaInforme(detalle.id, detalle.folio) : null;
  const servicio = ruta ? clienteServicio() : null;
  if (!ruta || !servicio) return generar();
  const { bytes } = await obtenerOArchivar(ruta, generar, almacenSupabase(servicio));
  return bytes;
}

/**
 * Archiva el PDF oficial de una inspección aprobada (se llama justo después de la firma del programador, web o app).
 * Si ya estaba archivado no hace nada. La lectura de la inspección pasa por RLS con la sesión del usuario.
 */
export async function archivarInforme(id: string, cliente?: SupabaseClient): Promise<Response> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return texto("Inspección no encontrada", 404);
  const detalle = await obtenerDetalle(id, cliente);
  if (!detalle) return texto("Inspección no encontrada", 404);
  if (detalle.status !== "approved") return texto("Solo se archiva una inspección aprobada", 409);
  const ruta = rutaInforme(detalle.id, detalle.folio);
  if (!ruta) return texto("La inspección no tiene folio", 409);
  const servicio = clienteServicio();
  if (!servicio) return texto("Archivo de informes no configurado en el servidor", 503);
  const { origen } = await obtenerOArchivar(
    ruta,
    async () => new Uint8Array(await generarPdf(armarInforme(detalle))),
    almacenSupabase(servicio),
  );
  if (origen === "sin-archivar") return texto("No se pudo archivar el informe", 502);
  return new Response(null, { status: origen === "nuevo" ? 201 : 204 });
}
