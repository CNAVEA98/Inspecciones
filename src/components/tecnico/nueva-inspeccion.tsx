"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTecnico } from "./tecnico-provider";
import { templateFor, type CatalogEntry } from "@/lib/tecnico/catalog";
import { newDraft } from "@/lib/tecnico/draft";
import { hoyIso } from "@/lib/fecha";

type Paso = "area" | "equipo" | "modo";
const TITULO: Record<Paso, string> = {
  area: "¿En qué área está?",
  equipo: "¿Qué equipo va a inspeccionar?",
  modo: "¿Qué tipo de trabajo es?",
};

function Opcion({
  etiqueta,
  detalle,
  deshabilitada,
  onClick,
}: {
  etiqueta: string;
  detalle?: string;
  deshabilitada?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={deshabilitada}
      onClick={onClick}
      className="flex min-h-16 w-full flex-col items-start justify-center rounded-2xl border-[1.5px] border-[#8f897e] bg-white px-5 py-3 text-left transition-transform hover:border-graf focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cu active:scale-[0.99] disabled:cursor-not-allowed disabled:border-hair disabled:bg-[#f1f0ec] disabled:text-sub"
    >
      <span className="text-xl font-semibold">{etiqueta}</span>
      {detalle ? <span className="text-base">{detalle}</span> : null}
    </button>
  );
}

/** Flujo de selección: una pantalla por decisión (Área, Equipo, Modo), todo desde el catálogo. */
export function NuevaInspeccion() {
  const router = useRouter();
  const { catalog, db, userId } = useTecnico();
  const [paso, setPaso] = useState<Paso>("area");
  const [area, setArea] = useState<CatalogEntry | null>(null);
  const [equipo, setEquipo] = useState<CatalogEntry | null>(null);
  const [creando, setCreando] = useState(false);

  if (catalog.status === "loading") {
    return <p className="text-lg text-sub">Cargando catálogo</p>;
  }
  if (catalog.status === "error" || !catalog.catalog) {
    return (
      <p role="alert" className="rounded-2xl border border-[#bb0000] bg-[#fdecec] p-5 text-lg text-[#7a0000]">
        {catalog.error ?? "No se pudo cargar el catálogo."} Conéctese a internet una vez para descargarlo.
      </p>
    );
  }
  const cat = catalog.catalog;

  const tieneFormulario = (equipmentTypeId: string) => cat.workModes.some((m) => templateFor(cat, equipmentTypeId, m.id));

  const iniciar = async (modoId: string) => {
    if (!area || !equipo || creando) return;
    const tpl = templateFor(cat, equipo.id, modoId);
    if (!tpl) return;
    setCreando(true);
    const draft = newDraft({
      userId,
      areaId: area.id,
      equipmentTypeId: equipo.id,
      workModeId: modoId,
      templateId: tpl.id,
    });
    draft.header = { fecha: hoyIso() };
    await db.drafts.add(draft);
    // Sin red, Next hace una navegación completa y el service worker entrega la página guardada.
    router.push(`/tecnico/inspeccion/${draft.id}`);
  };

  const atras = () => {
    if (paso === "modo") setPaso("equipo");
    else if (paso === "equipo") setPaso("area");
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        {paso === "area" ? (
          <Link href="/tecnico" className="inline-flex min-h-12 items-center rounded-xl border-[1.5px] border-graf px-4 text-base font-semibold">
            Cancelar
          </Link>
        ) : (
          <button type="button" onClick={atras} className="min-h-12 rounded-xl border-[1.5px] border-graf px-4 text-base font-semibold">
            Atrás
          </button>
        )}
        <p className="font-mono text-sm text-sub">
          Paso {paso === "area" ? 1 : paso === "equipo" ? 2 : 3} de 3
        </p>
      </div>

      <h1 className="text-3xl font-bold leading-tight tracking-tight">{TITULO[paso]}</h1>
      {catalog.fromCache ? (
        <p className="rounded-xl bg-cu-soft px-4 py-2 text-sm font-medium text-[#7a3d12]">
          Usando el catálogo guardado en el equipo.
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        {paso === "area" &&
          cat.areas.map((a) => (
            <Opcion
              key={a.id}
              etiqueta={a.name}
              onClick={() => {
                setArea(a);
                setPaso("equipo");
              }}
            />
          ))}

        {paso === "equipo" &&
          cat.equipmentTypes.map((e) => {
            const ok = tieneFormulario(e.id);
            return (
              <Opcion
                key={e.id}
                etiqueta={e.name}
                detalle={ok ? undefined : "Sin formulario todavía"}
                deshabilitada={!ok}
                onClick={() => {
                  setEquipo(e);
                  setPaso("modo");
                }}
              />
            );
          })}

        {paso === "modo" &&
          equipo &&
          cat.workModes.map((m) => {
            const ok = Boolean(templateFor(cat, equipo.id, m.id));
            return (
              <Opcion
                key={m.id}
                etiqueta={m.name}
                detalle={ok ? undefined : "Sin formulario todavía"}
                deshabilitada={!ok || creando}
                onClick={() => void iniciar(m.id)}
              />
            );
          })}
      </div>
    </div>
  );
}
