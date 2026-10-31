"use client";

import { useRef, useState } from "react";
import { useTecnico } from "./tecnico-provider";
import { useLive, useObjectUrl } from "@/lib/tecnico/hooks";
import { deletePhoto, savePhoto } from "@/lib/tecnico/photos";

function Miniatura({ id, numero, onRemove }: { id: string; numero: number; onRemove: () => void }) {
  const { db } = useTecnico();
  const rec = useLive(() => db.photos.get(id), id, undefined);
  const url = useObjectUrl(rec?.blob);
  const [confirmando, setConfirmando] = useState(false);

  if (confirmando) {
    return (
      <div role="alertdialog" aria-label={`Quitar foto ${numero}`} className="w-full rounded-xl border-[1.5px] border-bad bg-white p-3">
        <p className="text-base font-semibold">¿Quitar la foto {numero}?</p>
        <p className="mt-0.5 text-sm text-sub">Se borra de este equipo. No se puede deshacer.</p>
        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={onRemove}
            className="min-h-12 flex-1 rounded-xl bg-bad px-4 text-base font-semibold text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cu"
          >
            Sí, quitar
          </button>
          <button
            type="button"
            onClick={() => setConfirmando(false)}
            className="min-h-12 rounded-xl border-[1.5px] border-graf px-4 text-base font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cu"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <span className="relative h-20 w-20">
      <span className="block h-full w-full overflow-hidden rounded-xl border border-hair bg-[#f1f0ec]">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={`Foto ${numero}`} width={80} height={80} className="h-full w-full object-cover" />
        ) : null}
      </span>
      {/* Área táctil de 44 px (guantes); el círculo visible es más pequeño. */}
      <button
        type="button"
        aria-label={`Quitar foto ${numero}`}
        onClick={() => setConfirmando(true)}
        className="absolute -right-3 -top-3 grid size-11 place-items-center focus-visible:outline-3 focus-visible:outline-cu"
      >
        <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-graf text-base leading-none text-white">
          ×
        </span>
      </button>
    </span>
  );
}

/** Adjunta fotos (cámara del teléfono): se comprimen y quedan guardadas en el equipo. */
export function PhotoField({
  inspectionId,
  ids,
  max,
  onChange,
}: {
  inspectionId: string;
  ids: string[];
  max: number;
  onChange: (ids: string[]) => void;
}) {
  const { db, userId } = useTecnico();
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();
  const [ocupado, setOcupado] = useState(false);

  const agregar = async (files: FileList | null) => {
    if (!files?.length) return;
    setOcupado(true);
    setError(undefined);
    try {
      const nuevos: string[] = [];
      for (const f of Array.from(files).slice(0, max - ids.length)) {
        nuevos.push(await savePhoto(db, userId, inspectionId, f));
      }
      onChange([...ids, ...nuevos]);
    } catch {
      setError("No se pudo guardar la foto. Intente de nuevo.");
    } finally {
      setOcupado(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {ids.map((id, i) => (
        <Miniatura
          key={id}
          numero={i + 1}
          id={id}
          onRemove={() => {
            void deletePhoto(db, id);
            onChange(ids.filter((x) => x !== id));
          }}
        />
      ))}
      {ids.length < max ? (
        <>
          <button
            type="button"
            disabled={ocupado}
            onClick={() => input.current?.click()}
            className="min-h-14 rounded-xl border-[1.5px] border-dashed border-[#6f695f] bg-[#faf8f4] px-5 text-base font-semibold hover:border-cu hover:bg-cu-soft disabled:opacity-60"
          >
            {ocupado ? "Guardando" : ids.length ? "Agregar otra foto" : "Tomar foto"}
          </button>
          <input
            ref={input}
            type="file"
            accept="image/*"
            capture="environment"
            multiple={max > 1}
            hidden
            onChange={(e) => void agregar(e.target.files)}
          />
        </>
      ) : null}
      {error ? (
        <p role="alert" className="w-full text-sm font-medium text-[#7a0000]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
