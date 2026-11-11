import { deflateRawSync } from "node:zlib";
import { serieExcelChile } from "@/lib/fecha";

/**
 * Generador mínimo de archivos Excel (.xlsx), sin dependencias: un .xlsx es un ZIP con unos pocos XML.
 * Cubre lo que necesita la exportación (varias hojas, encabezado fijo con filtro, anchos de columna, números y fechas
 * reales) y nada más; por eso no se agregó una biblioteca como `exceljs`. Solo corre en el servidor (usa `node:zlib`).
 *
 * Los textos van como «inlineStr»: Excel nunca los interpreta como fórmula, aunque empiecen con «=», «+» o «@»
 * (una observación escrita por un técnico no puede ejecutar nada al abrir el archivo).
 */
export type Celda = string | number | Date | null | undefined;

export interface Columna {
  titulo: string;
  /** Ancho en caracteres (aprox.); por defecto 16. */
  ancho?: number;
}

export interface Hoja {
  nombre: string;
  columnas: Columna[];
  filas: Celda[][];
}

const MIME_XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
export { MIME_XLSX };

/** Escapa para XML y quita los caracteres de control que XML 1.0 no admite (Excel rechaza el archivo si quedan). */
export function escaparXml(s: string): string {
  return s
    .replace(/[^\x09\x0A\x0D\x20-퟿-�\u{10000}-\u{10FFFF}]/gu, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** A, B… Z, AA, AB… */
export function letraColumna(indice: number): string {
  let n = indice + 1;
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

/** Excel no admite más de 32.767 caracteres por celda. */
const MAX_TEXTO = 32_767;
/** Nombre de hoja válido: sin \ / ? * [ ] : y de 31 caracteres como máximo. */
export const nombreHoja = (s: string) => s.replace(/[\\/?*[\]:]/g, " ").trim().slice(0, 31) || "Hoja";

const ESTILO_ENCABEZADO = 1;
const ESTILO_FECHA = 2;

function celda(ref: string, v: Celda, estilo?: number): string {
  const s = estilo ? ` s="${estilo}"` : "";
  if (v === null || v === undefined || v === "") return estilo ? `<c r="${ref}"${s}/>` : "";
  if (v instanceof Date) {
    return Number.isNaN(v.getTime()) ? "" : `<c r="${ref}" s="${ESTILO_FECHA}"><v>${serieExcelChile(v)}</v></c>`;
  }
  if (typeof v === "number") return Number.isFinite(v) ? `<c r="${ref}"${s}><v>${v}</v></c>` : "";
  const texto = escaparXml(v.slice(0, MAX_TEXTO));
  return `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${texto}</t></is></c>`;
}

function xmlHoja(h: Hoja): string {
  const ultima = `${letraColumna(Math.max(0, h.columnas.length - 1))}${h.filas.length + 1}`;
  const cols = h.columnas
    .map((c, i) => `<col min="${i + 1}" max="${i + 1}" width="${c.ancho ?? 16}" customWidth="1"/>`)
    .join("");
  const encabezado = `<row r="1">${h.columnas.map((c, i) => celda(`${letraColumna(i)}1`, c.titulo, ESTILO_ENCABEZADO)).join("")}</row>`;
  const filas = h.filas
    .map((f, i) => `<row r="${i + 2}">${f.map((v, j) => celda(`${letraColumna(j)}${i + 2}`, v)).join("")}</row>`)
    .join("");
  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<dimension ref="A1:${ultima}"/>` +
    // Primera fila fija al desplazarse.
    `<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>` +
    `<cols>${cols}</cols>` +
    `<sheetData>${encabezado}${filas}</sheetData>` +
    `<autoFilter ref="A1:${ultima}"/>` +
    `</worksheet>`
  );
}

const ESTILOS =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
  `<numFmts count="1"><numFmt numFmtId="164" formatCode="dd-mm-yyyy hh:mm"/></numFmts>` +
  `<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font>` +
  `<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts>` +
  // Los dos primeros rellenos (ninguno y gris 12,5 %) son obligatorios; el tercero es el grafito del encabezado.
  `<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>` +
  `<fill><patternFill patternType="solid"><fgColor rgb="FF14181D"/><bgColor indexed="64"/></patternFill></fill></fills>` +
  `<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>` +
  `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
  `<cellXfs count="3">` +
  `<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>` +
  `<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>` +
  `<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>` +
  `</cellXfs>` +
  `<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>` +
  `</styleSheet>`;

/** Arma el libro. Los `Date` se escriben como fecha y hora de Chile. */
export function crearXlsx(hojas: Hoja[]): Uint8Array {
  if (hojas.length === 0) throw new Error("El libro necesita al menos una hoja");
  // Excel exige nombres de hoja distintos (sin distinguir mayúsculas).
  const usados = new Set<string>();
  const nombres = hojas.map((h) => {
    let nombre = nombreHoja(h.nombre);
    for (let i = 2; usados.has(nombre.toLowerCase()); i++) nombre = `${nombreHoja(h.nombre).slice(0, 27)} (${i})`;
    usados.add(nombre.toLowerCase());
    return nombre;
  });
  const cab = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`;
  const pkg = "http://schemas.openxmlformats.org/package/2006";
  const doc = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
  const ss = "application/vnd.openxmlformats-officedocument.spreadsheetml";
  const archivos: [string, string][] = [
    [
      "[Content_Types].xml",
      `${cab}<Types xmlns="${pkg}/content-types">` +
        `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
        `<Default Extension="xml" ContentType="application/xml"/>` +
        `<Override PartName="/xl/workbook.xml" ContentType="${ss}.sheet.main+xml"/>` +
        `<Override PartName="/xl/styles.xml" ContentType="${ss}.styles+xml"/>` +
        hojas.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="${ss}.worksheet+xml"/>`).join("") +
        `</Types>`,
    ],
    [
      "_rels/.rels",
      `${cab}<Relationships xmlns="${pkg}/relationships">` +
        `<Relationship Id="rId1" Type="${doc}/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    ],
    [
      "xl/workbook.xml",
      `${cab}<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="${doc}"><sheets>` +
        nombres.map((n, i) => `<sheet name="${escaparXml(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("") +
        `</sheets></workbook>`,
    ],
    [
      "xl/_rels/workbook.xml.rels",
      `${cab}<Relationships xmlns="${pkg}/relationships">` +
        hojas.map((_, i) => `<Relationship Id="rId${i + 1}" Type="${doc}/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("") +
        `<Relationship Id="rId${hojas.length + 1}" Type="${doc}/styles" Target="styles.xml"/></Relationships>`,
    ],
    ["xl/styles.xml", ESTILOS],
    ...hojas.map((h, i): [string, string] => [`xl/worksheets/sheet${i + 1}.xml`, xmlHoja(h)]),
  ];
  return crearZip(archivos.map(([nombre, xml]) => ({ nombre, datos: Buffer.from(xml, "utf8") })));
}

// ---------- ZIP ----------

const TABLA_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(datos: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < datos.length; i++) c = TABLA_CRC[(c ^ datos[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** ZIP con compresión «deflate». Fecha fija (1980-01-01): el mismo contenido produce siempre el mismo archivo. */
export function crearZip(entradas: { nombre: string; datos: Uint8Array }[]): Uint8Array {
  const locales: Buffer[] = [];
  const centrales: Buffer[] = [];
  let desplazamiento = 0;
  for (const e of entradas) {
    const nombre = Buffer.from(e.nombre, "utf8");
    const comprimido = deflateRawSync(e.datos);
    const crc = crc32(e.datos);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // versión necesaria
    local.writeUInt16LE(0x0800, 6); // nombres en UTF-8
    local.writeUInt16LE(8, 8); // deflate
    local.writeUInt16LE(0, 10); // hora
    local.writeUInt16LE(0x21, 12); // fecha 1980-01-01
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(comprimido.length, 18);
    local.writeUInt32LE(e.datos.length, 22);
    local.writeUInt16LE(nombre.length, 26);
    local.writeUInt16LE(0, 28);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4); // versión que lo creó
    local.copy(central, 6, 4, 30); // mismos campos que la cabecera local (versión… largo del extra)
    central.writeUInt32LE(desplazamiento, 42);
    locales.push(local, nombre, comprimido);
    centrales.push(central, nombre);
    desplazamiento += local.length + nombre.length + comprimido.length;
  }
  const directorio = Buffer.concat(centrales);
  const fin = Buffer.alloc(22);
  fin.writeUInt32LE(0x06054b50, 0);
  fin.writeUInt16LE(entradas.length, 8);
  fin.writeUInt16LE(entradas.length, 10);
  fin.writeUInt32LE(directorio.length, 12);
  fin.writeUInt32LE(desplazamiento, 16);
  return new Uint8Array(Buffer.concat([...locales, directorio, fin]));
}
