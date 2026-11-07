/** Sistema «Cobre» (mismos valores que `src/app/globals.css` de la web). */
export const color = {
  graf: "#14181d",
  graf2: "#232a31",
  cu: "#c4602d",
  cuSuave: "#f6e6dc",
  cuTexto: "#7a3d12",
  papel: "#f6f4f0",
  linea: "#e1ddd5",
  borde: "#8f897e",
  sub: "#5b646d",
  ok: "#1d7a46",
  okSuave: "#e1f2e8",
  okTexto: "#0b4a28",
  malo: "#bb0000",
  maloSuave: "#fdecec",
  maloTexto: "#7a0000",
  neutroSuave: "#f1f0ec",
  blanco: "#ffffff",
} as const;

export const radio = { chico: 12, medio: 16, pill: 999 } as const;

/** Mínimo táctil de la web (guantes): 48 a 64 px según el control. */
export const alto = { boton: 56, campo: 56, opcion: 64 } as const;

export type Tono = "cobre" | "neutro" | "ok" | "malo";

export const tono: Record<Tono, { fondo: string; texto: string }> = {
  cobre: { fondo: color.cuSuave, texto: color.cuTexto },
  neutro: { fondo: color.neutroSuave, texto: color.graf },
  ok: { fondo: color.okSuave, texto: color.okTexto },
  malo: { fondo: "#fbe4e4", texto: "#8a0000" },
};
