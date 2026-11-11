import { inflateRawSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { crc32, crearXlsx, escaparXml, letraColumna, nombreHoja } from "./xlsx";

/** Lee el ZIP por su directorio central y devuelve nombre → contenido (comprueba también el CRC). */
function abrirZip(zip: Uint8Array): Map<string, string> {
  const b = Buffer.from(zip);
  const fin = b.length - 22;
  expect(b.readUInt32LE(fin)).toBe(0x06054b50);
  const total = b.readUInt16LE(fin + 10);
  let p = b.readUInt32LE(fin + 16);
  const archivos = new Map<string, string>();
  for (let i = 0; i < total; i++) {
    expect(b.readUInt32LE(p)).toBe(0x02014b50);
    const crc = b.readUInt32LE(p + 16);
    const comprimido = b.readUInt32LE(p + 20);
    const largoNombre = b.readUInt16LE(p + 28);
    const local = b.readUInt32LE(p + 42);
    const nombre = b.subarray(p + 46, p + 46 + largoNombre).toString("utf8");
    expect(b.readUInt32LE(local)).toBe(0x04034b50);
    const inicio = local + 30 + b.readUInt16LE(local + 26) + b.readUInt16LE(local + 28);
    const datos = inflateRawSync(b.subarray(inicio, inicio + comprimido));
    expect(crc32(datos)).toBe(crc);
    archivos.set(nombre, datos.toString("utf8"));
    p += 46 + largoNombre;
  }
  return archivos;
}

describe("utilidades", () => {
  it("nombra las columnas como Excel", () => {
    expect([0, 25, 26, 27, 701, 702].map(letraColumna)).toEqual(["A", "Z", "AA", "AB", "ZZ", "AAA"]);
  });
  it("escapa XML y quita caracteres de control", () => {
    expect(escaparXml(`a<b & "c"\u0001\u000b>`)).toBe("a&lt;b &amp; &quot;c&quot;&gt;");
    expect(escaparXml("línea 1\nlínea 2 ñ 😀")).toBe("línea 1\nlínea 2 ñ 😀");
  });
  it("deja nombres de hoja válidos", () => {
    expect(nombreHoja("Inspecciones/Mantenciones: [2026]")).toBe("Inspecciones Mantenciones   202");
    expect(nombreHoja("")).toBe("Hoja");
  });
  it("calcula el CRC-32 estándar", () => {
    expect(crc32(Buffer.from("123456789"))).toBe(0xcbf43926);
  });
});

describe("crearXlsx", () => {
  const libro = crearXlsx([
    {
      nombre: "Inspecciones",
      columnas: [{ titulo: "Folio", ancho: 18 }, { titulo: "Hallazgos" }, { titulo: "Envío" }, { titulo: "Observación" }],
      filas: [
        ["INS-2026-000001", 2, new Date("2026-11-10T15:00:00Z"), "=HYPERLINK(\"http://x\")"],
        ["INS-2026-000002", 0, null, "Fuga <leve> & óxido"],
      ],
    },
    { nombre: "Hallazgos", columnas: [{ titulo: "Folio" }], filas: [] },
  ]);
  const zip = abrirZip(libro);

  it("contiene las partes de un .xlsx con una hoja por cada tabla", () => {
    expect([...zip.keys()]).toEqual([
      "[Content_Types].xml", "_rels/.rels", "xl/workbook.xml", "xl/_rels/workbook.xml.rels", "xl/styles.xml",
      "xl/worksheets/sheet1.xml", "xl/worksheets/sheet2.xml",
    ]);
    expect(zip.get("xl/workbook.xml")).toContain('<sheet name="Inspecciones" sheetId="1" r:id="rId1"/>');
    expect(zip.get("xl/workbook.xml")).toContain('<sheet name="Hallazgos" sheetId="2" r:id="rId2"/>');
  });

  it("escribe encabezado, números y fechas de Chile", () => {
    const h = zip.get("xl/worksheets/sheet1.xml") ?? "";
    expect(h).toContain('<c r="A1" s="1" t="inlineStr"><is><t xml:space="preserve">Folio</t></is></c>');
    expect(h).toContain('<c r="B2"><v>2</v></c>');
    expect(h).toContain('<c r="B3"><v>0</v></c>');
    // 2026-11-10 12:00 en Chile (UTC-3) = día 46336 y medio.
    expect(h).toContain('<c r="C2" s="2"><v>46336.5</v></c>');
    expect(h).not.toContain('r="C3"');
    expect(h).toContain('<autoFilter ref="A1:D3"/>');
    expect(h).toContain('<col min="1" max="1" width="18" customWidth="1"/>');
  });

  it("guarda los textos como texto: una observación que empieza con «=» no es una fórmula", () => {
    const h = zip.get("xl/worksheets/sheet1.xml") ?? "";
    expect(h).toContain('<c r="D2" t="inlineStr"><is><t xml:space="preserve">=HYPERLINK(&quot;http://x&quot;)</t></is></c>');
    expect(h).toContain("Fuga &lt;leve&gt; &amp; óxido");
    expect(h).not.toContain("<f>");
  });

  it("no repite nombres de hoja y exige al menos una", () => {
    const z = abrirZip(crearXlsx([{ nombre: "Datos", columnas: [], filas: [] }, { nombre: "DATOS", columnas: [], filas: [] }]));
    expect(z.get("xl/workbook.xml")).toContain('name="DATOS (2)"');
    expect(() => crearXlsx([])).toThrow();
  });

  it("es reproducible", () => {
    const hoja = { nombre: "A", columnas: [{ titulo: "x" }], filas: [["1"]] };
    expect(Buffer.from(crearXlsx([hoja])).equals(Buffer.from(crearXlsx([hoja])))).toBe(true);
  });
});
