import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { leerBearer } from "@/lib/auth/bearer";
import { supabaseEnv } from "@/lib/env";
import { ROLES_CON_PDF, archivarInforme, pdfDeInspeccion, texto } from "./responder";

/**
 * PDF para la app móvil. La app no tiene las cookies del navegador: envía su token de acceso de Supabase en
 * `Authorization: Bearer`. Aquí se verifica el token con Supabase, se comprueba el rol y la lectura de la inspección pasa
 * por RLS con ese mismo token (un técnico solo ve las de su cuenta; una ajena responde 404).
 */
export async function responderPdfMovil(id: string, request: Request): Promise<Response> {
  const acceso = await accesoMovil(request);
  return acceso instanceof Response ? acceso : pdfDeInspeccion(id, acceso);
}

/** `POST`: la app lo llama después de la firma del programador para archivar el PDF oficial (ver `archivo.ts`). */
export async function archivarPdfMovil(id: string, request: Request): Promise<Response> {
  const acceso = await accesoMovil(request);
  return acceso instanceof Response ? acceso : archivarInforme(id, acceso);
}

/** Cliente de Supabase con el token de la app, o la respuesta de error si el token o el rol no sirven. */
async function accesoMovil(request: Request): Promise<SupabaseClient | Response> {
  const token = leerBearer(request.headers.get("authorization"));
  if (!token) return texto("Sesión no iniciada", 401);

  const { url, anonKey } = supabaseEnv();
  const supabase = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) return texto("Sesión no válida o vencida", 401);

  const { data: perfil } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!perfil || !ROLES_CON_PDF.has(perfil.role as string)) return texto("Sin permiso para descargar informes", 403);

  return supabase;
}
