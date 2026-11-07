// Copia parcial de src/lib/revision/fallas.ts de la web (2026-11-07). Ver app-movil/DISENO.md.

/** «bbosch»: lo repara Bbosch 23 kV (lleva aviso subsecuente). «terceros»: requiere apoyo de otra empresa (se canaliza con MLP). */
export type Alcance = "bbosch" | "terceros";
export type Severidad = "baja" | "media" | "alta" | "critica";

/** Seguimiento que registra la Supervisión. Sin fila, el hallazgo es de Bbosch y está pendiente. */
export interface Seguimiento {
  scope: Alcance;
  sapNotice: string | null;
  channelNote: string | null;
}

/** Línea de trazabilidad para el informe; vacía mientras el hallazgo siga pendiente. */
export function textoTrazabilidad(s: Seguimiento | null | undefined): string {
  if (!s) return "";
  if (s.scope === "bbosch") return s.sapNotice ? `Aviso subsecuente N.º ${s.sapNotice}` : "";
  return `Requiere apoyo de terceros: canalizado con MLP${s.channelNote ? ` · ${s.channelNote}` : ""}`;
}
