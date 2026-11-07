import { Directory, File, Paths } from "expo-file-system";
import * as Print from "expo-print";
import type { Almacen } from "@/lib/offline/almacen";
import type { DraftRecord } from "@/lib/offline/db";
import type { Catalog } from "@/lib/tecnico/catalog";
import { informeAHtml } from "./html";
import { PREFIJO_LOCAL, detalleLocal, rotulosLocal } from "./local";
import { LOGO_BASE64 } from "./logo";
import { nombreSeguro } from "./archivo";
import { armarInforme } from "./modelo";
import { nombrePdf } from "./nombre-archivo";

/** Convierte bytes a base64 por trozos (btoa no admite cadenas enormes de una vez). */
export function aBase64(bytes: Uint8Array): string {
  let binario = "";
  const TROZO = 0x8000;
  for (let i = 0; i < bytes.length; i += TROZO) {
    binario += String.fromCharCode(...bytes.subarray(i, i + TROZO));
  }
  return btoa(binario);
}

/** Carpeta de la app donde quedan los informes generados (persiste; se puede compartir o guardar desde ahí). */
function carpetaInformes(): Directory {
  const dir = new Directory(Paths.document, "informes");
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

export interface EntradaPdfLocal {
  almacen: Almacen;
  draft: DraftRecord;
  catalog: Catalog;
  /** Texto de la cuenta («Técnico · Turno B») y su turno. */
  tecnico: string;
  turno: "A" | "B" | null;
}

/**
 * Genera el informe PDF en el teléfono, sin conexión, con los datos locales (mismo contenido que el PDF de la web, sin las
 * firmas de revisión) y lo deja en la carpeta de informes de la app. Devuelve el archivo.
 */
export async function generarPdfLocal(e: EntradaPdfLocal): Promise<File> {
  const { almacen, draft, catalog } = e;
  const template = catalog.templates.find((t) => t.id === draft.templateId)?.schema;
  if (!template) throw new Error("No se encontró el formulario de esta inspección en el teléfono.");

  const fotos = await almacen.fotosDeInspeccion(draft.id);
  const nombre = (lista: { id: string; name: string }[], id: string) => lista.find((x) => x.id === id)?.name ?? "—";
  const detalle = detalleLocal({
    draft,
    template,
    fotos,
    area: nombre(catalog.areas, draft.areaId),
    equipo: nombre(catalog.equipmentTypes, draft.equipmentTypeId),
    modo: nombre(catalog.workModes, draft.workModeId),
    tecnico: e.tecnico,
    turno: e.turno,
  });
  const rotulos = rotulosLocal(draft);
  const informe = { ...armarInforme(detalle), estadoRegistro: rotulos.estado };

  // Las imágenes se incrustan como datos: así el PDF no depende de rutas de archivos del teléfono.
  const imagenes: Record<string, string> = {};
  for (const foto of fotos) {
    try {
      const bytes = new Uint8Array(await new File(foto.uri).arrayBuffer());
      imagenes[`${PREFIJO_LOCAL}${foto.id}`] = `data:${foto.mime};base64,${aBase64(bytes)}`;
    } catch {
      // una foto que ya no está en el teléfono no impide generar el informe
    }
  }

  const html = informeAHtml(informe, { logoBase64: LOGO_BASE64, imagenes, aviso: rotulos.aviso });
  const { uri } = await Print.printToFileAsync({ html, width: 595, height: 842 });

  const base = nombrePdf({ titulo: informe.titulo, equipmentTag: informe.tag, fecha: draft.startedAt });
  const nombreFinal = draft.state === "sent" ? base : base.replace(/\.pdf$/, " (sin enviar).pdf");
  const destino = new File(carpetaInformes(), nombreSeguro(nombreFinal));
  if (destino.exists) destino.delete();
  new File(uri).move(destino);
  return destino;
}
