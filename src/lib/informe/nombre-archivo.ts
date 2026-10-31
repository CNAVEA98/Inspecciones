import { fechaIso } from "@/lib/fecha";

/** Quita lo que los sistemas de archivos no aceptan y deja espacios simples. */
const limpiar = (s: string) =>
  s
    .replace(/[\/:*?"<>|\x00-\x1f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

interface Datos {
  titulo: string;
  equipmentTag: string;
  fecha: string | Date | null;
}

/** «Inspección Banco de condensadores Mauro - 320-XC-001 - 2026-10-31.pdf» (la fecha es la del envío, en Chile). */
export function nombrePdf({ titulo, equipmentTag, fecha }: Datos): string {
  const partes = [limpiar(titulo), limpiar(equipmentTag), fecha ? fechaIso(fecha) : ""].filter(Boolean);
  const base = partes.join(" - ").slice(0, 150).trim();
  return `${base || "Informe"}.pdf`;
}

/** Valor de Content-Disposition: nombre sin tildes para clientes viejos y el nombre completo en UTF-8. */
export function contentDisposition(nombre: string): string {
  const ascii = nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "'");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(nombre)}`;
}
