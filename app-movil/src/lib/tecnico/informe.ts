import type { SupabaseClient } from "@supabase/supabase-js";
import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import type { Almacen } from "@/lib/offline/almacen";
import { redNativa } from "@/lib/offline/red";
import { nombreDeContentDisposition, nombreSeguro } from "@/lib/informe/archivo";
import { generarPdfLocal } from "@/lib/informe/local-nativo";
import { WEB_URL } from "@/lib/supabase";
import type { Catalog } from "@/lib/tecnico/catalog";

/** Mensaje para el técnico según lo que respondió el servidor. */
export function mensajeErrorInforme(detalle: string): string {
  if (/\b401\b/.test(detalle)) return "Su sesión venció. Cierre sesión e ingrese de nuevo.";
  if (/\b403\b/.test(detalle)) return "Su cuenta no tiene permiso para descargar informes.";
  if (/\b404\b/.test(detalle)) return "El servidor aún no tiene el informe de esta inspección.";
  if (/\b409\b/.test(detalle)) return "La inspección aún es un borrador.";
  return "No se pudo descargar el informe del servidor.";
}

/** Descarga el PDF oficial del servidor (con folio y firmas de revisión). Necesita señal. Lanza un Error con el motivo. */
async function descargarOficial(supabase: SupabaseClient, id: string): Promise<File> {
  if (!redNativa.enLinea()) throw new Error("Sin conexión a internet.");
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Su sesión venció. Cierre sesión e ingrese de nuevo con señal.");
  try {
    // `fetch` y no `File.downloadFileAsync`: así se lee el nombre que manda el servidor (Content-Disposition) en vez de usar el id de la URL.
    const r = await fetch(`${WEB_URL}/api/movil/informe/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const bytes = new Uint8Array(await r.arrayBuffer());
    if (bytes.length === 0) throw new Error("El servidor devolvió un PDF vacío.");
    const nombre = nombreDeContentDisposition(r.headers.get("content-disposition")) ?? `Informe ${id.slice(0, 8)}.pdf`;
    const carpeta = new Directory(Paths.document, "informes");
    if (!carpeta.exists) carpeta.create({ intermediates: true });
    const destino = new File(carpeta, nombreSeguro(nombre, `Informe ${id.slice(0, 8)}.pdf`));
    if (destino.exists) destino.delete();
    destino.create();
    await destino.write(bytes);
    return destino;
  } catch (e) {
    throw new Error(mensajeErrorInforme(e instanceof Error ? e.message : String(e)));
  }
}

export interface ContextoPdf {
  almacen: Almacen;
  supabase: SupabaseClient;
  catalog: Catalog | null;
  /** Cuenta con la que se trabaja («Técnico · Turno B») y su turno. */
  tecnico: string;
  turno: "A" | "B" | null;
}

export interface ResultadoPdf {
  error?: string;
  /** Aviso que no es un error (p. ej. «generado en el teléfono»). */
  info?: string;
}

const detalleDe = (e: unknown) => (e instanceof Error ? e.message : String(e)).replace(/\s+/g, " ").slice(0, 160);

/** Estado del archivo, para los avisos de error (así se ve si el PDF existe y cuánto pesa). */
function estadoArchivo(archivo: File): string {
  try {
    return `existe: ${archivo.exists ? "sí" : "no"}, tamaño: ${archivo.exists ? archivo.size : 0} bytes`;
  } catch {
    return "estado desconocido";
  }
}

/** Borra las copias de compartir anteriores (viven en la caché, pero no hay por qué acumularlas). */
function limpiarCopiasAnteriores(): void {
  try {
    for (const x of Paths.cache.list()) {
      if (x instanceof Directory && x.name.startsWith("compartir-")) x.delete();
    }
  } catch {
    // la caché la limpia el sistema
  }
}

/**
 * Abre la hoja de compartir del teléfono con el PDF (Guardar en Archivos, WhatsApp, correo, abrir con otra app).
 * No se comparte el archivo guardado sino una copia nueva en la caché: `expo-sharing` rechaza («You don't have access to the provided file»)
 * un archivo que no puede leer en ese momento, y así el PDF guardado queda intacto aunque la hoja de compartir lo mueva o lo bloquee.
 * Devuelve un mensaje de error con el motivo real, o null si se abrió.
 */
async function abrirArchivo(archivo: File): Promise<string | null> {
  try {
    if (!archivo.exists || archivo.size === 0) {
      return `El PDF no quedó guardado correctamente (${estadoArchivo(archivo)}). Intente de nuevo.`;
    }
    if (!(await Sharing.isAvailableAsync())) {
      return `Este teléfono no permite compartir archivos desde la app. El PDF quedó guardado en la carpeta de informes de la app: ${archivo.uri}`;
    }
    limpiarCopiasAnteriores();
    const carpeta = new Directory(Paths.cache, `compartir-${Date.now()}`);
    carpeta.create({ intermediates: true });
    const copia = new File(carpeta, archivo.name);
    await archivo.copy(copia);
    if (!copia.exists || copia.size === 0) {
      return `No se pudo preparar el PDF para compartir (original: ${estadoArchivo(archivo)}; copia: ${estadoArchivo(copia)}).`;
    }
    await Sharing.shareAsync(copia.uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf", dialogTitle: "Informe de inspección" });
    return null;
  } catch (e) {
    return `No se pudo abrir el PDF (${detalleDe(e)}). Archivo: ${estadoArchivo(archivo)}. Ruta: ${archivo.uri}`;
  }
}

/**
 * Obtiene el informe PDF de una inspección y abre la hoja de compartir del teléfono (WhatsApp, Archivos…).
 * - Inspección enviada con señal: PDF oficial del servidor (con folio y firmas de revisión).
 * - Sin señal, o inspección sin enviar o en cola: PDF generado en el teléfono con los datos guardados; queda en la carpeta
 *   de informes de la app, sin depender de internet.
 * - Inspección de otro teléfono del turno y sin señal: no hay datos locales, solo se puede pedir al servidor.
 */
export async function entregarPdf(ctx: ContextoPdf, id: string): Promise<ResultadoPdf> {
  const draft = await ctx.almacen.obtenerBorrador(id);
  const hayLocal = !!draft && !!ctx.catalog;
  const intentarServidor = !draft || draft.state === "sent";

  let archivo: File | null = null;
  let info: string | undefined;
  let falloServidor: string | undefined;

  if (intentarServidor) {
    try {
      archivo = await descargarOficial(ctx.supabase, id);
    } catch (e) {
      falloServidor = e instanceof Error ? e.message : "No se pudo descargar el informe.";
    }
  }

  if (!archivo) {
    if (!hayLocal || !draft || !ctx.catalog) {
      return { error: falloServidor ?? "No se encontró la inspección en este teléfono." };
    }
    try {
      archivo = await generarPdfLocal({ almacen: ctx.almacen, draft, catalog: ctx.catalog, tecnico: ctx.tecnico, turno: ctx.turno });
      info =
        draft.state === "sent"
          ? "PDF generado en el teléfono (sin las firmas de supervisión). El oficial se descarga cuando haya señal."
          : "PDF generado en el teléfono con los datos guardados.";
    } catch (e) {
      return { error: e instanceof Error ? e.message : "No se pudo generar el PDF." };
    }
  }

  const abierto = await abrirArchivo(archivo);
  if (abierto) return { error: abierto };
  return info ? { info } : {};
}
