"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FAMILIAS, ORDEN_FAMILIAS, type CodigoArea, type CodigoFamilia, type TipoTrabajo } from "@/lib/formatos/catalogo";
import { crearFormato } from "@/lib/formatos/crear-actions";
import { idFormato, leerDesignadores } from "@/lib/formatos/nuevo";

const campo =
  "w-full rounded-lg border border-hair bg-white px-2.5 py-1.5 text-sm font-normal text-graf focus-visible:outline-2 focus-visible:outline-cu";
const etiqueta = "block text-sm font-semibold";

export interface OrigenFormato {
  id: string;
  tipo: TipoTrabajo;
  titulo: string;
  familia: CodigoFamilia;
  areas: CodigoArea[];
  designadores: string[];
  campo: "tag" | "tramo";
  variosEquipos: boolean;
}

interface Props {
  /** Ruta del panel («/admin», «/supervisor»). */
  base: string;
  origenes: OrigenFormato[];
  areas: { code: CodigoArea; name: string }[];
  siguiente: Record<TipoTrabajo, number>;
  existentes: string[];
}

/** Formulario del supervisor y del administrador: crea un formato copiando el contenido de otro del mismo tipo. */
export function NuevoFormato({ base, origenes, areas, siguiente, existentes }: Props) {
  const router = useRouter();
  const [tipo, setTipo] = useState<TipoTrabajo>("INSP");
  const [numero, setNumero] = useState(siguiente.INSP);
  const [copiarDe, setCopiarDe] = useState("");
  const [titulo, setTitulo] = useState("");
  const [familia, setFamilia] = useState<CodigoFamilia>("F1");
  const [areasSel, setAreasSel] = useState<CodigoArea[]>([]);
  const [designadores, setDesignadores] = useState("");
  const [tipoCampo, setTipoCampo] = useState<"tag" | "tramo">("tag");
  const [varios, setVarios] = useState(false);
  const [norma, setNorma] = useState("");
  const [revision, setRevision] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();

  const delTipo = useMemo(() => origenes.filter((o) => o.tipo === tipo), [origenes, tipo]);
  const id = idFormato(tipo, numero || 0);
  const repetido = existentes.includes(id);

  const cambiarTipo = (t: TipoTrabajo) => {
    setTipo(t);
    setNumero(siguiente[t]);
    setCopiarDe("");
  };

  /** Al elegir el origen se proponen su familia, áreas, designadores y campo (se pueden cambiar). */
  const elegirOrigen = (oid: string) => {
    setCopiarDe(oid);
    const o = origenes.find((x) => x.id === oid);
    if (!o) return;
    setFamilia(o.familia);
    setAreasSel(o.areas);
    setDesignadores(o.designadores.join(", "));
    setTipoCampo(o.campo);
    setVarios(o.variosEquipos);
  };

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    iniciar(async () => {
      const r = await crearFormato({
        tipo,
        numero,
        titulo,
        familia,
        areas: areasSel,
        designadores: leerDesignadores(designadores),
        campo: tipoCampo,
        variosEquipos: varios,
        norma,
        revision,
        copiarDe,
      });
      if (r.ok) router.push(`${base}/formatos/${r.id}`);
      else setError(r.error);
    });
  };

  return (
    <form onSubmit={enviar} className="max-w-3xl space-y-5 rounded-2xl border border-hair bg-white p-5">
      <fieldset className="space-y-2">
        <legend className={etiqueta}>Tipo de trabajo</legend>
        <div className="flex gap-4 text-sm">
          {(["INSP", "MANT"] as const).map((t) => (
            <label key={t} className="flex items-center gap-2">
              <input type="radio" name="tipo" checked={tipo === t} onChange={() => cambiarTipo(t)} />
              {t === "INSP" ? "Inspección" : "Mantención"}
            </label>
          ))}
        </div>
      </fieldset>

      <label className={etiqueta}>
        Copiar el contenido de
        <select required value={copiarDe} onChange={(e) => elegirOrigen(e.target.value)} className={`${campo} mt-1`}>
          <option value="">Elija un formato…</option>
          {delTipo.map((o) => (
            <option key={o.id} value={o.id}>
              {o.id} · {o.titulo.trim()}
            </option>
          ))}
        </select>
        <span className="mt-1 block text-xs font-normal text-sub">
          Se copian sus secciones, ítems, cabecera, roles y lecturas. Después puede ajustarlos en el editor.
        </span>
      </label>

      <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
        <label className={etiqueta}>
          Número
          <input type="number" min={1} max={999} required value={numero || ""} onChange={(e) => setNumero(Number(e.target.value))} className={`${campo} mt-1 font-mono`} />
          <span className={`mt-1 block font-mono text-xs ${repetido ? "font-semibold text-bad" : "font-normal text-sub"}`}>
            {repetido ? `${id} ya existe` : id}
          </span>
        </label>
        <label className={etiqueta}>
          Título del formato
          <input required value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="p. ej. Transformadores Secos" className={`${campo} mt-1`} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={etiqueta}>
          Norma (código del documento)
          <input required value={norma} onChange={(e) => setNorma(e.target.value)} placeholder="EST-ELEC-MLP-Bbosch-42" className={`${campo} mt-1 font-mono`} />
        </label>
        <label className={etiqueta}>
          Revisión
          <input required value={revision} onChange={(e) => setRevision(e.target.value)} placeholder="Noviembre 2026" className={`${campo} mt-1`} />
        </label>
      </div>

      <label className={etiqueta}>
        Familia
        <select value={familia} onChange={(e) => setFamilia(e.target.value as CodigoFamilia)} className={`${campo} mt-1`}>
          {ORDEN_FAMILIAS.map((f) => (
            <option key={f} value={f}>
              {f} · {FAMILIAS[f]}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="space-y-2">
        <legend className={etiqueta}>Áreas donde aparece</legend>
        <div className="flex flex-wrap gap-4 text-sm">
          {areas.map((a) => (
            <label key={a.code} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={areasSel.includes(a.code)}
                onChange={(e) => setAreasSel(e.target.checked ? [...areasSel, a.code] : areasSel.filter((x) => x !== a.code))}
              />
              {a.name}
            </label>
          ))}
        </div>
        <p className="text-xs text-sub">Sin ninguna marcada, el formato es transversal (aparece en todas las áreas).</p>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={etiqueta}>
          Designadores de TAG
          <input value={designadores} onChange={(e) => setDesignadores(e.target.value)} placeholder="XF, SW" className={`${campo} mt-1 font-mono`} />
          <span className="mt-1 block text-xs font-normal text-sub">Filtran el selector de TAG (p. ej. XF en 320-XF-012). Separe con comas.</span>
        </label>
        <fieldset className="space-y-2">
          <legend className={etiqueta}>Qué identifica el técnico</legend>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="campo" checked={tipoCampo === "tag"} onChange={() => setTipoCampo("tag")} /> Un equipo con TAG
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="campo" checked={tipoCampo === "tramo"} onChange={() => setTipoCampo("tramo")} /> Un tramo o ubicación
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={varios} onChange={(e) => setVarios(e.target.checked)} /> Permite varios equipos
          </label>
        </fieldset>
      </div>

      {error ? (
        <p role="alert" className="rounded-xl border border-bad px-4 py-3 text-sm font-semibold text-bad">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pendiente || repetido || !copiarDe}
          className="rounded-lg bg-graf px-4 py-2 text-sm font-semibold text-white hover:bg-graf-2 focus-visible:outline-2 focus-visible:outline-cu disabled:opacity-50"
        >
          {pendiente ? "Creando…" : `Crear ${id}`}
        </button>
        <p className="text-xs text-sub">
          Se crea <strong>desactivado</strong>, con la versión 1: ajuste su contenido en el editor y actívelo desde la lista cuando esté listo.
        </p>
      </div>
    </form>
  );
}
