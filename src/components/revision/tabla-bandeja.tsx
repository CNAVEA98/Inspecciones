"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { eliminarInspecciones } from "@/app/admin/actions";
import { formatFechaHora } from "@/lib/fecha";
import { STATUS_SHORT, etapaPendiente } from "@/lib/revision/estado";
import type { FilaBandeja } from "@/lib/revision/queries";

type Rol = "supervisor" | "planner" | "admin";

/** Tabla de la bandeja. Con `puedeEliminar` (solo administrador) agrega casillas y borrado con confirmación. */
export function TablaBandeja({
  filas,
  base,
  rol,
  puedeEliminar,
  hrefTagBase,
}: {
  filas: FilaBandeja[];
  base: "/supervisor" | "/planificador" | "/admin";
  rol: Rol;
  puedeEliminar: boolean;
  /** Prefijo del enlace que filtra la bandeja por el TAG de una fila (se le agrega el TAG codificado). */
  hrefTagBase: string;
}) {
  const [marcadas, setMarcadas] = useState<Set<string>>(new Set());
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  // Solo cuentan las marcadas que siguen visibles (la consulta puede haber cambiado).
  const visibles = new Set(filas.map((f) => f.id));
  const seleccion = [...marcadas].filter((id) => visibles.has(id));
  const todas = filas.length > 0 && seleccion.length === filas.length;

  const alternar = (id: string) =>
    setMarcadas((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const eliminar = () => {
    setError(null);
    startTransition(async () => {
      const r = await eliminarInspecciones(seleccion);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setMarcadas(new Set());
      setConfirmando(false);
      setAviso(
        `${r.eliminadas} ${r.eliminadas === 1 ? "inspección eliminada" : "inspecciones eliminadas"}.${r.avisoArchivos ? ` ${r.avisoArchivos}` : ""}`,
      );
    });
  };

  const folios = filas.filter((f) => seleccion.includes(f.id)).map((f) => f.folio ?? "Sin folio");

  return (
    <>
      {aviso && (
        <p role="status" className="border-b border-hair bg-cu-soft px-5 py-3 text-sm font-semibold">
          {aviso}
        </p>
      )}

      {puedeEliminar && seleccion.length > 0 && !confirmando && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hair bg-paper px-5 py-3 text-sm">
          <span className="font-semibold">
            {seleccion.length} {seleccion.length === 1 ? "seleccionada" : "seleccionadas"}
          </span>
          <button
            type="button"
            onClick={() => {
              setAviso(null);
              setConfirmando(true);
            }}
            className="rounded-lg border border-bad px-4 py-2 font-semibold text-bad hover:bg-bad hover:text-white focus-visible:outline-2 focus-visible:outline-cu"
          >
            Eliminar seleccionadas
          </button>
        </div>
      )}

      {puedeEliminar && confirmando && (
        <div role="alertdialog" aria-labelledby="eliminar-titulo" className="space-y-3 border-b border-bad bg-white px-5 py-4 text-sm">
          <p id="eliminar-titulo" className="font-bold text-bad">
            ¿Eliminar {seleccion.length} {seleccion.length === 1 ? "inspección" : "inspecciones"} de forma definitiva?
          </p>
          <p className="font-mono text-xs">{folios.join(", ")}</p>
          <p className="text-sub">
            Se borran también las respuestas, hallazgos, fotos y firmas. No se puede deshacer; queda un registro de quién la eliminó en la auditoría.
          </p>
          {error && (
            <p role="alert" className="font-semibold text-bad">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={eliminar}
              disabled={pendiente}
              className="rounded-lg bg-bad px-4 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-cu"
            >
              {pendiente ? "Eliminando…" : "Sí, eliminar"}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmando(false);
                setError(null);
              }}
              disabled={pendiente}
              className="rounded-lg border border-hair px-4 py-2 font-semibold hover:bg-paper focus-visible:outline-2 focus-visible:outline-cu"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left font-mono text-xs uppercase tracking-[0.06em] text-sub">
              {puedeEliminar && (
                <th className="w-10 px-5 py-2">
                  <input
                    type="checkbox"
                    checked={todas}
                    onChange={() => setMarcadas(todas ? new Set() : new Set(filas.map((f) => f.id)))}
                    aria-label="Seleccionar todas las inspecciones visibles"
                    className="h-4 w-4 accent-[var(--color-cu)]"
                  />
                </th>
              )}
              <th className="px-5 py-2 font-medium">Folio</th>
              <th className="px-5 py-2 font-medium">Equipo</th>
              <th className="px-5 py-2 font-medium">Área</th>
              <th className="px-5 py-2 font-medium">Realizado por</th>
              <th className="px-5 py-2 font-medium">Turno</th>
              <th className="px-5 py-2 font-medium">Enviada</th>
              <th className="px-5 py-2 font-medium">Estado</th>
              <th className="px-5 py-2 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.id} className={`border-t border-hair hover:bg-paper ${seleccion.includes(f.id) ? "bg-cu-soft" : ""}`}>
                {puedeEliminar && (
                  <td className="px-5 py-3">
                    <input
                      type="checkbox"
                      checked={marcadas.has(f.id)}
                      onChange={() => alternar(f.id)}
                      aria-label={`Seleccionar ${f.folio ?? "inspección sin folio"}`}
                      className="h-4 w-4 accent-[var(--color-cu)]"
                    />
                  </td>
                )}
                <td className="px-5 py-3 font-mono">
                  <Link href={`${base}/${f.id}`} className="font-semibold text-cu underline-offset-2 hover:underline">
                    {f.folio ?? "Sin folio"}
                  </Link>
                </td>
                <td className="px-5 py-3">
                  {f.equipo} · {f.modo}
                  {f.equipmentTag && (
                    <Link
                      href={`${hrefTagBase}${encodeURIComponent(f.equipmentTag)}`}
                      title="Ver solo las inspecciones de este TAG"
                      className="block font-mono text-xs text-cu underline-offset-2 hover:underline"
                    >
                      {f.equipmentTag}
                    </Link>
                  )}
                </td>
                <td className="px-5 py-3">{f.area}</td>
                <td className="px-5 py-3">
                  <span className="block font-semibold">Técnico: {f.realizadoPor}</span>
                  <span className="block text-xs text-sub">Cuenta: {f.tecnico}</span>
                </td>
                <td className="px-5 py-3 font-mono">{f.turno ?? "—"}</td>
                <td className="px-5 py-3 font-mono text-xs">{f.submittedAt ? formatFechaHora(f.submittedAt) : "—"}</td>
                <td className="px-5 py-3">{STATUS_SHORT[f.status]}</td>
                <td className="px-5 py-3">
                  <span className="flex gap-4">
                    {etapaPendiente(f.status, rol) && (
                      <Link href={`${base}/${f.id}#revision`} className="font-semibold text-cu underline-offset-2 hover:underline">
                        Revisar y firmar
                      </Link>
                    )}
                    <a href={`${base}/${f.id}/pdf`} download className="font-semibold text-cu underline-offset-2 hover:underline">
                      PDF
                    </a>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
