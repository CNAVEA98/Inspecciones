import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import { InformePdf, type ImagenPdf, type RecursosPdf } from "@/components/informe/informe-pdf";
import type { Informe } from "./modelo";
import { inicioDeTramos, type PaginasPorGrupo } from "./paginado";

const ALTO_LOGO = 24;

/** Descarga una URL firmada de Storage; null si falla o el formato no lo admite el PDF (solo PNG y JPEG). */
async function descargar(url: string): Promise<ImagenPdf | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return null;
    const tipo = res.headers.get("content-type") ?? "";
    const format = tipo.includes("png") ? "png" : tipo.includes("jpeg") || tipo.includes("jpg") ? "jpg" : null;
    if (!format) return null;
    return { data: Buffer.from(await res.arrayBuffer()), format };
  } catch {
    return null;
  }
}

async function cargarLogo(): Promise<RecursosPdf["logo"]> {
  try {
    const data = await readFile(path.join(process.cwd(), "public", "brand", "bbosch-logo.png"));
    // PNG: ancho y alto en la cabecera IHDR (bytes 16-23).
    const w = data.readUInt32BE(16);
    const h = data.readUInt32BE(20);
    return { img: { data, format: "png" }, alto: ALTO_LOGO, ancho: (ALTO_LOGO * w) / h };
  } catch {
    return null;
  }
}

/** URLs de imagen que el informe necesita incrustar (fotos y firmas). */
export function urlsDelInforme(r: Informe): string[] {
  const urls = [...r.fotos.map((f) => f.url), ...r.firmas.map((f) => f.imagenUrl)];
  return [...new Set(urls.filter((u): u is string => !!u))];
}

export async function generarPdf(informe: Informe): Promise<Buffer> {
  const [logo, descargas] = await Promise.all([
    cargarLogo(),
    Promise.all(urlsDelInforme(informe).map(async (u) => [u, await descargar(u)] as const)),
  ]);
  const imagenes = new Map<string, ImagenPdf>();
  for (const [url, img] of descargas) if (img) imagenes.set(url, img);
  const recursos = { logo, imagenes };

  // Primera pasada: en qué página cae cada fila de cada tabla. Segunda: un recuadro cerrado por página.
  const paginas: PaginasPorGrupo = informe.grupos.map(() => []);
  await renderToBuffer(
    <InformePdf informe={informe} recursos={recursos} paginado={{ medir: (g, i, p) => (paginas[g][i] = p) }} />,
  );
  const tramos = paginas.map((p) => inicioDeTramos(p));
  return renderToBuffer(<InformePdf informe={informe} recursos={recursos} paginado={{ tramos }} />);
}
