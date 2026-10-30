"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTecnico } from "./tecnico-provider";
import { templateFor, type CatalogEntry } from "@/lib/tecnico/catalog";
import { newDraft } from "@/lib/tecnico/draft";
import { hoyIso } from "@/lib/fecha";
import {
  FAMILIAS,
  TRABAJOS,
  familiasVisibles,
  formatosVisibles,
  type CodigoArea,
  type CodigoFamilia,
  type Formato,
  type TipoTrabajo,
} from "@/lib/formatos/catalogo";

type Paso = "area" | "trabajo" | "familia" | "formato";
const PASOS: Paso[] = ["area", "trabajo", "familia", "formato"];
const TITULO: Record<Paso, string> = {
  area: "¿En qué área está?",
  trabajo: "¿Qué tipo de trabajo es?",
  familia: "¿Qué familia de equipo?",
  formato: "¿Qué formato va a llenar?",
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

/** Flujo de selección en 4 pasos: Área → Trabajo → Familia → Formato. Los formatos salen de `lib/formatos/catalogo`. */
export function NuevaInspeccion() {
  const router = useRouter();
  const { catalog, db, userId } = useTecnico();
  const [paso, setPaso] = useState<Paso>("area");
  const [area, setArea] = useState<CatalogEntry | null>(null);
  const [trabajo, setTrabajo] = useState<TipoTrabajo | null>(null);
  const [familia, setFamilia] = useState<CodigoFamilia | null>(null);
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

  /** Plantilla de la base que abre un formato "disponible"; sin ella el formato se muestra como próximamente. */
  const plantillaDe = (formato: Formato) => {
    if (formato.estado !== "disponible" || !formato.plantilla) return null;
    const tipo = cat.equipmentTypes.find((e) => e.code === formato.plantilla!.tipoEquipo);
    const modo = cat.workModes.find((m) => m.code === formato.plantilla!.modo);
    if (!tipo || !modo) return null;
    const template = templateFor(cat, tipo.id, modo.id);
    return template ? { template, tipo, modo } : null;
  };

  const iniciar = async (formato: Formato) => {
    const plantilla = plantillaDe(formato);
    if (!area || !plantilla || creando) return;
    setCreando(true);
    const draft = newDraft({
      userId,
      areaId: area.id,
      equipmentTypeId: plantilla.tipo.id,
      workModeId: plantilla.modo.id,
      templateId: plantilla.template.id,
    });
    draft.header = { fecha: hoyIso(), formato: formato.id };
    await db.drafts.add(draft);
    // Sin red, Next hace una navegación completa y el service worker entrega la página guardada.
    router.push(`/tecnico/inspeccion/${draft.id}`);
  };

  const atras = () => {
    const i = PASOS.indexOf(paso);
    if (i > 0) setPaso(PASOS[i - 1]);
  };

  const codigoArea = area?.code as CodigoArea | undefined;
  const familias = codigoArea && trabajo ? familiasVisibles(codigoArea, trabajo) : [];
  const formatos = codigoArea && trabajo && familia ? formatosVisibles(codigoArea, trabajo, familia) : [];

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
        <p className="font-mono text-sm text-sub">Paso {PASOS.indexOf(paso) + 1} de 4</p>
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
                setPaso("trabajo");
              }}
            />
          ))}

        {paso === "trabajo" &&
          (Object.keys(TRABAJOS) as TipoTrabajo[]).map((t) => (
            <Opcion
              key={t}
              etiqueta={TRABAJOS[t]}
              onClick={() => {
                setTrabajo(t);
                setPaso("familia");
              }}
            />
          ))}

        {paso === "familia" &&
          (familias.length === 0 ? (
            <p className="text-lg text-sub">No hay formatos para esta área y este tipo de trabajo.</p>
          ) : (
            familias.map((fam) => (
              <Opcion
                key={fam}
                etiqueta={FAMILIAS[fam]}
                onClick={() => {
                  setFamilia(fam);
                  setPaso("formato");
                }}
              />
            ))
          ))}

        {paso === "formato" &&
          formatos.map((x) => {
            const ok = plantillaDe(x) !== null;
            return (
              <Opcion
                key={x.id}
                etiqueta={x.titulo}
                detalle={ok ? x.id : `${x.id} · Próximamente`}
                deshabilitada={!ok || creando}
                onClick={() => void iniciar(x)}
              />
            );
          })}
      </div>
    </div>
  );
}
