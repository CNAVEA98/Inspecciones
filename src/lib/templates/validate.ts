import { z } from "zod";
import { ESTADOS, templateSchema, type FormTemplateSchema, type TemplateItem } from "./schema";

export type ValidationResult =
  | { ok: true; template: FormTemplateSchema }
  | { ok: false; errors: string[] };

/** Valida el JSON de una plantilla y devuelve errores legibles con su ruta. */
export function validateTemplate(input: unknown): ValidationResult {
  const parsed = templateSchema.safeParse(input);
  if (parsed.success) return { ok: true, template: parsed.data };
  return {
    ok: false,
    errors: parsed.error.issues.map((i) => `${i.path.join(".") || "(raíz)"}: ${i.message}`),
  };
}

const attachmentId = z.string().uuid();

const verificationAnswer = z.object({
  estado: z.enum(ESTADOS),
  valor: z.number().finite().optional(),
  obs: z.string().optional(),
  fotos: z.array(attachmentId).optional(),
});

/** Devuelve los problemas de una respuesta contra su ítem ([] = válida). */
export function answerIssues(item: TemplateItem, value: unknown): string[] {
  switch (item.type) {
    case "verificacion": {
      const p = verificationAnswer.safeParse(value);
      if (!p.success) return ["Respuesta con formato inválido"];
      const a = p.data, out: string[] = [];
      if (a.estado === "ML" && !(a.obs ?? "").trim()) out.push("ML exige observación");
      if (a.estado === "NR" && !(a.obs ?? "").trim()) out.push("NR exige el motivo en observaciones");
      if (a.estado === "RMP" && !(a.obs ?? "").trim()) out.push("RMP exige el motivo en observaciones");
      if (a.valor !== undefined) {
        if (item.unit === undefined) out.push("El ítem no admite valor numérico");
        if (item.min !== undefined && a.valor < item.min) out.push("Valor bajo el mínimo");
        if (item.max !== undefined && a.valor > item.max) out.push("Valor sobre el máximo");
      }
      return out;
    }
    case "number": {
      if (typeof value !== "number" || !Number.isFinite(value)) return ["Debe ser un número"];
      if (item.min !== undefined && value < item.min) return ["Valor bajo el mínimo"];
      if (item.max !== undefined && value > item.max) return ["Valor sobre el máximo"];
      return [];
    }
    case "text":
      return typeof value === "string" ? [] : ["Debe ser texto"];
    case "photo":
      return z.array(attachmentId).max(item.maxPhotos).safeParse(value).success ? [] : ["Fotos inválidas"];
    case "nameplate": {
      if (typeof value !== "object" || value === null || Array.isArray(value)) return ["Formato inválido"];
      const rec = value as Record<string, unknown>;
      return item.fields.every((f) => typeof rec[f.key] === "string") ? [] : ["Faltan datos de la placa"];
    }
  }
}

export function validateAnswer(item: TemplateItem, value: unknown): boolean {
  return answerIssues(item, value).length === 0;
}
