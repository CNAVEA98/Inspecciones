import { z } from "zod";
import type { Formato, TipoTrabajo } from "./catalogo";
import { plantillaEnBlanco } from "./estandar";

/** «INSP» + 42 → «INSP-42» (dos dígitos como mínimo, igual que los existentes). */
export const idFormato = (tipo: TipoTrabajo, numero: number) => `${tipo}-${String(numero).padStart(2, "0")}`;

/** Siguiente número libre del tipo (el mayor + 1; no rellena huecos como INSP-36, que no existe a propósito). */
export function siguienteNumero(formatos: readonly Formato[], tipo: TipoTrabajo): number {
  const nums = formatos.filter((f) => f.tipo === tipo).map((f) => Number(f.id.split("-")[1]));
  return Math.max(0, ...nums.filter(Number.isFinite)) + 1;
}

/** «xf, Sw ; GG» → ["XF", "SW", "GG"] (sin repetidos). */
export const leerDesignadores = (texto: string) => [
  ...new Set(
    texto
      .split(/[\s,;]+/)
      .map((d) => d.trim().toUpperCase())
      .filter(Boolean),
  ),
];

/** Datos del formulario «Nuevo formato» (la base vuelve a validar todo en `crear_formato`). */
export const nuevoFormatoSchema = z
  .object({
    tipo: z.enum(["INSP", "MANT"]),
    numero: z.number().int().min(1, "El número debe ser 1 o mayor").max(999, "El número debe ser menor que 1000"),
    titulo: z.string().trim().min(3, "Escriba el título (mínimo 3 caracteres)").max(120),
    familia: z.enum(["F1", "F2", "F3", "F4", "F5", "F6", "F7"]),
    areas: z.array(z.enum(["chacay", "mina", "mauro", "puerto", "valle"])),
    designadores: z.array(z.string().regex(/^[A-Z]{2,3}$/, "Cada designador son 2 o 3 letras (p. ej. XF)")),
    campo: z.enum(["tag", "tramo"]),
    variosEquipos: z.boolean(),
    norma: z.string().trim().min(3, "Escriba el código de la norma (p. ej. EST-ELEC-MLP-Bbosch-42)").max(80),
    revision: z.string().trim().min(3, "Escriba la revisión (p. ej. Noviembre 2026)").max(60),
    /** «blanco»: estructura estándar y se arma pregunta por pregunta; «copia»: contenido de otro formato. */
    origen: z.enum(["blanco", "copia"]),
    copiarDe: z.string().optional(),
  })
  .refine((v) => v.origen === "blanco" || /^(INSP|MANT)-\d{2,3}$/.test(v.copiarDe ?? ""), {
    message: "Elija el formato que se copia",
    path: ["copiarDe"],
  })
  .refine((v) => v.origen === "blanco" || (v.copiarDe ?? "").startsWith(`${v.tipo}-`), {
    message: "Copie un formato del mismo tipo (inspección o mantención)",
    path: ["copiarDe"],
  });

export type NuevoFormato = z.infer<typeof nuevoFormatoSchema>;

/** Cuerpo que recibe la función `crear_formato` de la base. */
export const aPayloadBD = (v: NuevoFormato) => ({
  id: idFormato(v.tipo, v.numero),
  tipo: v.tipo,
  titulo: v.titulo,
  familia: v.familia,
  areas: v.areas,
  designadores: v.designadores,
  campo: v.campo,
  varios_equipos: v.variosEquipos,
  norma: v.norma,
  revision: v.revision,
  // En blanco: la plantilla estándar se arma aquí (servidor) y la base la recibe ya validada.
  ...(v.origen === "copia"
    ? { copiar_de: v.copiarDe }
    : { copiar_de: null, schema: plantillaEnBlanco(v.tipo, v.titulo, v.norma, v.revision) }),
});
