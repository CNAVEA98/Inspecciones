"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { queryFallas, type FiltroFallas } from "@/lib/revision/fallas";

const campo = "rounded-lg border border-hair bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-cu";

/**
 * Filtros de área y gestión: se aplican al elegir una opción. El filtro vive en la URL (se puede compartir y el botón
 * «atrás» funciona); sin JavaScript queda el botón «Filtrar» como respaldo.
 */
export function FiltrosFallas({
  url,
  filtro,
  areas,
  resumen,
}: {
  /** Ruta de la pestaña, p. ej. «/supervisor/fallas». */
  url: string;
  filtro: FiltroFallas;
  areas: string[];
  resumen: string;
}) {
  const router = useRouter();
  const [cargando, empezar] = useTransition();

  const aplicar = (cambio: Partial<FiltroFallas>) =>
    empezar(() => {
      const q = queryFallas(filtro, cambio);
      router.replace(q ? `${url}?${q}` : url);
    });

  return (
    <form method="get" action={url} role="search" className="mt-3 flex flex-wrap items-end gap-3" aria-busy={cargando}>
      {filtro.severidad ? <input type="hidden" name="severidad" value={filtro.severidad} /> : null}
      {filtro.turno ? <input type="hidden" name="turno" value={filtro.turno} /> : null}
      {filtro.zona ? <input type="hidden" name="zona" value={filtro.zona} /> : null}
      {filtro.vista ? <input type="hidden" name="vista" value={filtro.vista} /> : null}
      <label className="grid gap-1 text-xs font-semibold text-sub">
        Área
        <select name="area" value={filtro.area} onChange={(e) => aplicar({ area: e.target.value })} className={campo}>
          <option value="">Todas</option>
          {areas.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-xs font-semibold text-sub">
        Gestión
        <select
          name="gestion"
          value={filtro.gestion}
          onChange={(e) => aplicar({ gestion: e.target.value === "todos" ? "todos" : "abiertos" })}
          className={campo}
        >
          <option value="abiertos">Pendientes</option>
          <option value="todos">Todos (incluye los ya gestionados)</option>
        </select>
      </label>
      <noscript>
        <button type="submit" className="rounded-lg bg-graf px-4 py-2 text-sm font-semibold text-white">
          Filtrar
        </button>
      </noscript>
      <span role="status" className="ml-auto text-sm text-sub">
        {cargando ? "Actualizando…" : resumen}
      </span>
    </form>
  );
}
