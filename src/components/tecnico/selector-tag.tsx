"use client";

import { useEffect, useMemo, useState } from "react";
import type { CodigoArea } from "@/lib/formatos/catalogo";
import {
  ETIQUETA_ESTADO,
  conExtras,
  conTag,
  equiposDelFormato,
  esProvisional,
  extrasDe,
  filtrarEquipos,
  seleccionDe,
  seleccionDeCabecera,
  sectoresDe,
  type Equipo,
  type SeleccionTag,
} from "@/lib/formatos/tags";

const MAX_FILAS = 30;
const campo =
  "min-h-14 w-full rounded-xl border-[1.5px] border-[#8f897e] bg-white px-4 text-lg text-graf focus:border-cu focus:outline-3 focus:outline-offset-1 focus:outline-cu/40";
const botonSecundario =
  "min-h-12 rounded-xl border-[1.5px] border-graf px-4 text-base font-semibold disabled:opacity-50";

/** El Maestro pesa unos 400 KB: se carga al abrir el formulario, no con la app. */
function useEquipos(): Equipo[] | "error" | null {
  const [equipos, setEquipos] = useState<Equipo[] | "error" | null>(null);
  useEffect(() => {
    let vivo = true;
    void (async () => {
      try {
        const m = await import("@/data/maestro-tags.json");
        if (vivo) setEquipos(m.default as unknown as Equipo[]);
      } catch {
        if (vivo) setEquipos("error");
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);
  return equipos;
}

function Insignia({ estado }: { estado: SeleccionTag["estado"] }) {
  const texto = ETIQUETA_ESTADO[estado];
  if (!texto) return null;
  const fuerte = esProvisional(estado) || estado === "sin_tag";
  return (
    <span
      className={`rounded-md px-2 py-0.5 text-xs font-semibold ${fuerte ? "bg-cu-soft text-[#7a3d12]" : "bg-[#f1f0ec] text-sub"}`}
    >
      {texto}
    </span>
  );
}

interface BuscadorProps {
  equipos: Equipo[];
  area: CodigoArea;
  designadores: string[];
  tramo: boolean;
  onElegir: (sel: SeleccionTag) => void;
  onCancelar?: () => void;
}

/** Lista filtrada por formato y área, con búsqueda, sectores y la opción de equipo sin TAG. */
function Buscador({ equipos, area, designadores, tramo, onElegir, onCancelar }: BuscadorProps) {
  const [texto, setTexto] = useState("");
  const [todasAreas, setTodasAreas] = useState(false);
  const [sector, setSector] = useState<string | null>(null);
  const [sinTag, setSinTag] = useState(false);
  const [nombre, setNombre] = useState("");

  const delFormato = useMemo(
    () => equiposDelFormato(equipos, { designadores, area, todasAreas }),
    [equipos, designadores, area, todasAreas],
  );
  const sectores = useMemo(() => sectoresDe(delFormato), [delFormato]);
  const lista = useMemo(
    () => filtrarEquipos(equipos, { designadores, area, todasAreas, sector, texto }),
    [equipos, designadores, area, todasAreas, sector, texto],
  );

  if (sinTag) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-hair bg-white p-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">{tramo ? "Nombre del tramo o ubicación" : "Nombre del equipo"}</span>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={campo} autoComplete="off" autoFocus />
        </label>
        <p className="text-sm text-sub">Queda marcado como pendiente de revisión para que supervisión lo identifique.</p>
        <div className="flex gap-3">
          <button
            type="button"
            disabled={!nombre.trim()}
            onClick={() => onElegir({ tag: nombre.trim(), estado: "sin_tag" })}
            className="min-h-12 flex-1 rounded-xl bg-graf px-4 text-base font-semibold text-white disabled:opacity-50"
          >
            Usar este nombre
          </button>
          <button type="button" onClick={() => setSinTag(false)} className={botonSecundario}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        type="search"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Buscar por TAG, nombre o instalación"
        aria-label="Buscar equipo"
        className={campo}
        autoComplete="off"
      />

      {sectores.length > 1 ? (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Sector">
          {[{ sector: null as string | null, cantidad: delFormato.length }, ...sectores].map((s) => (
            <button
              key={s.sector ?? "todos"}
              type="button"
              aria-pressed={sector === s.sector}
              onClick={() => setSector(s.sector)}
              className={`min-h-11 rounded-full border-[1.5px] px-4 text-base font-semibold ${
                sector === s.sector ? "border-graf bg-graf text-white" : "border-[#8f897e] bg-white"
              }`}
            >
              {s.sector ?? "Todos"} <span className="font-mono text-sm opacity-70">{s.cantidad}</span>
            </button>
          ))}
        </div>
      ) : null}

      <label className="flex min-h-12 items-center gap-3 text-base font-medium">
        <input
          type="checkbox"
          checked={todasAreas}
          onChange={(e) => {
            setTodasAreas(e.target.checked);
            setSector(null);
          }}
          className="size-6 accent-cu"
        />
        Ver todas las áreas
      </label>

      {lista.length === 0 ? (
        <p className="rounded-xl bg-[#f1f0ec] px-4 py-3 text-base text-sub">
          No hay equipos con ese filtro.{todasAreas ? "" : " Pruebe «Ver todas las áreas»."}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {lista.slice(0, MAX_FILAS).map((e) => (
            <li key={e.tag}>
              <button
                type="button"
                onClick={() => onElegir(seleccionDe(e))}
                className="flex min-h-16 w-full flex-col items-start gap-0.5 rounded-xl border-[1.5px] border-[#8f897e] bg-white px-4 py-2 text-left hover:border-graf focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cu"
              >
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-lg font-bold">{e.tag}</span>
                  <Insignia estado={e.estado} />
                  {e.tipoTrafo ? (
                    <span className="rounded-md bg-[#f1f0ec] px-2 py-0.5 text-xs font-semibold text-sub">
                      {e.tipoTrafo === "piso" ? "De piso" : "Aéreo"}
                    </span>
                  ) : null}
                </span>
                <span className="text-base">{e.nombre}</span>
                <span className="text-sm text-sub">
                  {e.instalacion}
                  {e.sector ? ` · ${e.sector}` : ""}
                </span>
                {e.datos ? <span className="text-sm text-sub">{e.datos}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      )}
      {lista.length > MAX_FILAS ? (
        <p className="text-sm text-sub">
          Mostrando {MAX_FILAS} de {lista.length}. Escriba más letras para acotar.
        </p>
      ) : null}

      <div className="flex gap-3">
        <button type="button" onClick={() => setSinTag(true)} className={botonSecundario}>
          {tramo ? "Otro tramo (escribir)" : "Equipo sin TAG"}
        </button>
        {onCancelar ? (
          <button type="button" onClick={onCancelar} className={botonSecundario}>
            Cancelar
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Elegido({ sel, onQuitar, etiquetaQuitar }: { sel: SeleccionTag; onQuitar?: () => void; etiquetaQuitar: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border-[1.5px] border-graf bg-white p-4">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="break-words font-mono text-xl font-bold">{sel.tag}</span>
        <span className="flex flex-wrap gap-2">
          <Insignia estado={sel.estado} />
          {sel.tagOriginal ? <span className="text-sm text-sub">TAG original: {sel.tagOriginal}</span> : null}
        </span>
      </div>
      {onQuitar ? (
        <button type="button" onClick={onQuitar} className={botonSecundario}>
          {etiquetaQuitar}
        </button>
      ) : null}
    </div>
  );
}

interface Props {
  etiqueta: string;
  area: CodigoArea;
  designadores: string[];
  /** «Tramo o ubicación» en lugar de TAG de equipo. */
  tramo: boolean;
  variosEquipos: boolean;
  header: Record<string, string>;
  onHeader: (cambio: (h: Record<string, string>) => Record<string, string>) => void;
  deshabilitado: boolean;
}

/** Campo «TAG del equipo» del formulario. Guarda en la cabecera: `tag` (texto), `tag_estado` y `tag_original`. */
export function SelectorTag({ etiqueta, area, designadores, tramo, variosEquipos, header, onHeader, deshabilitado }: Props) {
  const equipos = useEquipos();
  const [agregando, setAgregando] = useState(false);
  const elegido = seleccionDeCabecera(header);
  const extras = extrasDe(header);

  // Tramos sin lista en el Maestro (sin designador): texto simple.
  if (tramo && designadores.length === 0) {
    return (
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold">{etiqueta}</span>
        <input
          value={header.tag ?? ""}
          disabled={deshabilitado}
          onChange={(e) => onHeader((h) => ({ ...conTag(h, null), tag: e.target.value }))}
          className={campo}
          autoComplete="off"
        />
      </label>
    );
  }

  const cuerpo = (() => {
    if (equipos === null) return <p className="text-base text-sub">Cargando equipos</p>;
    if (equipos === "error") {
      return (
        <p role="alert" className="rounded-xl bg-[#fdecec] px-4 py-3 text-base text-[#7a0000]">
          No se pudo cargar la lista de equipos. Reabra la inspección con conexión.
        </p>
      );
    }
    if (elegido) return null;
    return (
      <Buscador
        equipos={equipos}
        area={area}
        designadores={designadores}
        tramo={tramo}
        onElegir={(sel) => onHeader((h) => conTag(h, sel))}
      />
    );
  })();

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold">{etiqueta}</span>
      {elegido ? (
        <Elegido
          sel={elegido}
          etiquetaQuitar="Cambiar"
          onQuitar={deshabilitado ? undefined : () => onHeader((h) => conTag(h, null))}
        />
      ) : null}
      {cuerpo}

      {variosEquipos && elegido ? (
        <div className="flex flex-col gap-2">
          {extras.map((x, i) => (
            <Elegido
              key={`${x.tag}-${i}`}
              sel={x}
              etiquetaQuitar="Quitar"
              onQuitar={
                deshabilitado ? undefined : () => onHeader((h) => conExtras(h, extrasDe(h).filter((_, j) => j !== i)))
              }
            />
          ))}
          {agregando && equipos && equipos !== "error" ? (
            <Buscador
              equipos={equipos}
              area={area}
              designadores={designadores}
              tramo={tramo}
              onCancelar={() => setAgregando(false)}
              onElegir={(sel) => {
                onHeader((h) => conExtras(h, [...extrasDe(h), sel]));
                setAgregando(false);
              }}
            />
          ) : deshabilitado ? null : (
            <button type="button" onClick={() => setAgregando(true)} className={`${botonSecundario} self-start`}>
              + Equipo
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
