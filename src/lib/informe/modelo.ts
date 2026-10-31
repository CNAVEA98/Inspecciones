import { formatFechaHora } from "@/lib/fecha";
import type { DetalleInspeccion } from "@/lib/revision/queries";
import { STATUS_LABEL_INFORME } from "@/lib/revision/estado";
import { ESTADOS, ESTADOS_CONFORMES, type Estado, type TemplateItem, type VerificationValue } from "@/lib/templates/schema";

export type EstadoVer = Estado;
export const ESTADOS_VER: readonly EstadoVer[] = ESTADOS;

export interface FilaInforme {
  n: number;
  texto: string;
  /** Valor medido con su unidad, o vacío. */
  valor: string;
  /** null en ítems que no son de verificación (número, texto, placa, foto). */
  estado: EstadoVer | null;
  obs: string;
}

export interface GrupoInforme {
  titulo: string;
  filas: FilaInforme[];
  /** Ítems de verificación conformes (BN, RL o SI) / total de ítems de verificación del grupo. */
  conformes: number;
  total: number;
}

export interface LecturaAncha {
  tipo: "ancha";
  titulo: string;
  actual: number | null;
  max: number | null;
  limite: number;
  unidad: string;
}
export interface LecturaChica {
  tipo: "chica";
  titulo: string;
  valor: number | null;
  unidad: string;
}

export interface TarjetaFirma {
  rol: string;
  nombre: string;
  fecha: string | null;
  imagenUrl: string | null;
  detalle: string | null;
}

export interface FotoInforme {
  n: number;
  texto: string;
  url: string;
}

export interface Informe {
  folio: string;
  titulo: string;
  norma: string;
  revision: string;
  estadoRegistro: string;
  tag: string;
  lugar: string;
  ot: string;
  fecha: string;
  horario: string;
  specs: { label: string; valor: string }[];
  resumen: {
    cuenta: Record<EstadoVer, number>;
    /** Ítems conformes (BN, RL o SI). */
    conformes: number;
    total: number;
    criticos: { n: number; texto: string; obs: string }[];
  };
  lecturas: (LecturaAncha | LecturaChica)[];
  grupos: GrupoInforme[];
  nomenclatura: string;
  observaciones: string;
  consideraciones: string;
  firmas: TarjetaFirma[];
  fotos: FotoInforme[];
  generado: string;
}

/** Campos de cabecera que ya salen en el encabezado oscuro; el resto va en la cuadrícula de datos. */
const CABECERA_EN_HERO = new Set(["tag", "ot", "ubicacion", "fecha", "h_inicio", "h_fin"]);

const NOMENCLATURA_POR_DEFECTO =
  "NT: No tiene / BN: Bueno / ML: Malo / NA: No aplica / NR: No realizada (indicar motivos en observaciones). " +
  "En caso de observaciones críticas, se adjunta registro fotográfico con la referencia.";

const num = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

/** 12,5 en vez de 12.5 (formato de Chile). */
export const fmtNumero = (n: number) => String(n).replace(".", ",");

/** «2026-10-17» -> «17-10-2026»; cualquier otro texto queda igual. */
export function fmtFecha(v: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : v;
}

const conUnidad = (valor: number, unit?: string) => `${fmtNumero(valor)}${unit ? ` ${unit}` : ""}`.trim();

function filaDe(item: TemplateItem, n: number, valor: unknown): FilaInforme {
  const base = { n, texto: item.label };
  if (valor === undefined) return { ...base, valor: "", estado: null, obs: "" };

  if (item.type === "verificacion") {
    const v = valor as Partial<VerificationValue>;
    const estado = ESTADOS_VER.includes(v.estado as EstadoVer) ? (v.estado as EstadoVer) : null;
    const medido = num(v.valor);
    return { ...base, valor: medido === null ? "" : conUnidad(medido, item.unit), estado, obs: v.obs ?? "" };
  }
  if (item.type === "number") {
    const medido = num(valor);
    return { ...base, valor: medido === null ? "" : conUnidad(medido, item.unit), estado: null, obs: "" };
  }
  if (item.type === "photo") {
    const cant = Array.isArray(valor) ? valor.length : 0;
    return { ...base, valor: cant ? `${cant} foto${cant > 1 ? "s" : ""}` : "", estado: null, obs: "" };
  }
  if (item.type === "nameplate") {
    const campos = valor as Record<string, string | number>;
    const texto = item.fields
      .filter((f) => campos[f.key] !== undefined && campos[f.key] !== "")
      .map((f) => `${f.label}: ${campos[f.key]}${f.unit ? ` ${f.unit}` : ""}`)
      .join(" · ");
    return { ...base, valor: "", estado: null, obs: texto };
  }
  return { ...base, valor: "", estado: null, obs: String(valor) };
}

/** Convierte una inspección leída de la base en el contenido del PDF. Función pura (sin red). */
export function armarInforme(d: DetalleInspeccion, ahora: Date = new Date()): Informe {
  const tpl = d.plantilla;
  const header = (d.respuestas._header ?? {}) as Record<string, string>;
  // La clave `_participantes` es heredada: hoy guarda la firma del encargado de la actividad.
  const encargado = d.respuestas._participantes as { nombres?: string; firmaId?: string } | undefined;
  const diag = (d.respuestas._diagnostico ?? {}) as { observaciones?: string; consideraciones?: string };
  const roles = (d.respuestas._roles ?? {}) as Record<string, string>;
  const urlDe = new Map(d.adjuntos.map((a) => [a.id, a.url]));

  const items = (tpl?.sections ?? []).flatMap((s) => s.items);
  const indice = new Map(items.map((it, i) => [it.id, i + 1]));

  let n = 0;
  const grupos: GrupoInforme[] = (tpl?.sections ?? []).map((s) => {
    const filas = s.items.map((it) => filaDe(it, ++n, d.respuestas[it.id]));
    const ver = s.items.filter((it) => it.type === "verificacion");
    return {
      titulo: s.title,
      filas,
      conformes: filas.filter((f) => f.estado !== null && ESTADOS_CONFORMES.includes(f.estado)).length,
      total: ver.length,
    };
  });

  const cuenta = Object.fromEntries(ESTADOS.map((e) => [e, 0])) as Record<EstadoVer, number>;
  const filas = grupos.flatMap((g) => g.filas);
  for (const f of filas) if (f.estado) cuenta[f.estado]++;
  const total = items.filter((it) => it.type === "verificacion").length;
  const conformes = ESTADOS_CONFORMES.reduce((s, e) => s + cuenta[e], 0);
  const criticos = filas.filter((f) => f.estado === "ML").map((f) => ({ n: f.n, texto: f.texto, obs: f.obs }));

  const lecturas = (tpl?.readings ?? []).map((r): LecturaAncha | LecturaChica => {
    const item = items.find((it) => it.id === r.item);
    const unidad = item && "unit" in item && item.unit ? item.unit : "";
    const valorDe = (id: string) => num((d.respuestas[id] as Partial<VerificationValue> | undefined)?.valor);
    if (r.maxItem && r.limit !== undefined) {
      return { tipo: "ancha", titulo: r.label, actual: valorDe(r.item), max: valorDe(r.maxItem), limite: r.limit, unidad };
    }
    return { tipo: "chica", titulo: r.label, valor: valorDe(r.item), unidad };
  });

  const specs = [
    ...(tpl?.header ?? [])
      .filter((h) => !CABECERA_EN_HERO.has(h.key) && header[h.key])
      .map((h) => ({ label: h.label, valor: h.input === "date" ? fmtFecha(header[h.key]) : header[h.key] })),
    ...(typeof d.respuestas._lista_participantes === "string" && d.respuestas._lista_participantes.trim()
      ? [{ label: "Participantes", valor: d.respuestas._lista_participantes.trim() }]
      : []),
    { label: "Realizado por", valor: d.realizadoPor },
    { label: "Cuenta de envío", valor: `${d.tecnico}${d.turno ? ` · Turno ${d.turno}` : ""}` },
  ];

  const etapa = (stage: "supervisor" | "planner") => d.firmas.find((f) => f.stage === stage);
  const tarjetaDeEtapa = (rol: string, stage: "supervisor" | "planner"): TarjetaFirma => {
    const f = etapa(stage);
    if (!f) return { rol, nombre: "", fecha: null, imagenUrl: null, detalle: null };
    const detalle = f.comment ? `${f.decision === "rejected" ? "Rechazó: " : ""}${f.comment}` : f.decision === "rejected" ? "Rechazó" : null;
    return { rol, nombre: f.firmante, fecha: formatFechaHora(f.signedAt), imagenUrl: f.url, detalle };
  };

  // Firman el encargado de la actividad (al enviar), el supervisor y el planificador (al revisar).
  const tarjetaEncargado = (rol: string): TarjetaFirma => ({
    rol,
    nombre: roles[rol]?.trim() || encargado?.nombres?.trim() || d.realizadoPor,
    fecha: null,
    imagenUrl: encargado?.firmaId ? (urlDe.get(encargado.firmaId) ?? null) : null,
    detalle: null,
  });
  const rolesPlantilla = tpl?.roles ?? [];
  const firmas: TarjetaFirma[] = [
    ...(rolesPlantilla.some((r) => /encargado/i.test(r)) ? [] : [tarjetaEncargado("Encargado de la actividad")]),
    ...rolesPlantilla.map((rol): TarjetaFirma => {
      if (/supervisor/i.test(rol)) return tarjetaDeEtapa(rol, "supervisor");
      if (/planificador/i.test(rol)) return tarjetaDeEtapa(rol, "planner");
      return tarjetaEncargado(rol);
    }),
  ];

  const fotos: FotoInforme[] = [];
  for (const it of items) {
    const valor = d.respuestas[it.id];
    const ids =
      it.type === "verificacion" ? ((valor as Partial<VerificationValue> | undefined)?.fotos ?? []) : it.type === "photo" && Array.isArray(valor) ? (valor as string[]) : [];
    for (const id of ids) {
      const url = urlDe.get(id);
      if (url) fotos.push({ n: indice.get(it.id)!, texto: it.label, url });
    }
  }

  return {
    folio: d.folio ?? "Sin folio",
    titulo: tpl?.meta?.titulo ?? `${d.equipo} · ${d.modo}`,
    norma: tpl?.meta?.norma ?? "",
    revision: tpl?.meta?.revision ?? "",
    estadoRegistro: STATUS_LABEL_INFORME[d.status],
    tag: header.tag || d.equipmentTag || "—",
    lugar: [header.ubicacion, d.area].filter(Boolean).join(" · "),
    ot: header.ot || "—",
    fecha: header.fecha ? fmtFecha(header.fecha) : "—",
    horario: header.h_inicio && header.h_fin ? `${header.h_inicio} – ${header.h_fin}` : "—",
    specs,
    resumen: { cuenta, conformes, total, criticos },
    lecturas,
    grupos,
    nomenclatura: tpl?.nomenclature ?? NOMENCLATURA_POR_DEFECTO,
    observaciones: diag.observaciones?.trim() ?? "",
    consideraciones: diag.consideraciones?.trim() ?? "",
    firmas,
    fotos,
    generado: formatFechaHora(ahora),
  };
}
