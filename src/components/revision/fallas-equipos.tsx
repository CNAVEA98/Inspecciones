import Link from "next/link";
import { BotonActualizar } from "@/components/revision/boton-actualizar";
import { SeguimientoHallazgo } from "@/components/revision/seguimiento-hallazgo";
import { formatFechaHora } from "@/lib/fecha";
import {
  SEVERIDADES_ORDENADAS,
  SEVERIDAD_NOMBRE,
  agruparPorEquipo,
  fichaSap,
  filtrarFallas,
  type FiltroFallas,
  type Severidad,
} from "@/lib/revision/fallas";
import { listarAreas, listarFallas } from "@/lib/revision/queries";

export const CHIP_SEVERIDAD: Record<Severidad, string> = {
  critica: "bg-bad text-white",
  alta: "bg-cu text-white",
  media: "bg-cu-soft text-[#7a3d12]",
  baja: "bg-[#f1f0ec] text-sub",
};

const campo = "rounded-lg border border-hair bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-cu";

function aQuery(f: FiltroFallas, cambio: Partial<FiltroFallas> = {}): string {
  const x = { ...f, ...cambio };
  const p = new URLSearchParams();
  if (x.gestion === "todos") p.set("gestion", "todos");
  if (x.severidad) p.set("severidad", x.severidad);
  if (x.area) p.set("area", x.area);
  return p.toString();
}

/** Pestaña «Equipos con fallas»: los hallazgos en «Malo» agrupados por equipo y ordenados por severidad. */
export async function FallasEquipos({
  base,
  filtro,
  puedeGestionar,
}: {
  base: "/supervisor" | "/planificador" | "/admin";
  filtro: FiltroFallas;
  puedeGestionar: boolean;
}) {
  const [todos, areasCatalogo] = await Promise.all([listarFallas(), listarAreas()]);
  const abiertosPorSeveridad = (s: Severidad) =>
    filtrarFallas(todos, { gestion: filtro.gestion, severidad: s, area: filtro.area }).length;
  const visibles = filtrarFallas(todos, filtro);
  const equipos = agruparPorEquipo(visibles);
  // Todas las áreas del catálogo, no solo las que hoy tienen hallazgos; se suma cualquier área con hallazgos que ya no esté.
  const areas = [...new Set([...areasCatalogo, ...todos.map((h) => h.area)])];
  const url = `${base}/fallas`;

  return (
    <section className="rounded-2xl border border-hair bg-white">
      <div className="border-b border-hair px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold tracking-tight">Equipos con fallas</h1>
          <BotonActualizar />
        </div>
        <p className="mt-1 max-w-3xl text-sm text-sub">
          Observaciones en «Malo» de inspecciones vigentes, de mayor a menor severidad. Las de alcance Bbosch 23 kV llevan
          aviso subsecuente en SAP; las que requieren apoyo de terceros se canalizan con MLP. Registrar el seguimiento no
          afecta las firmas.
        </p>

        <nav aria-label="Filtro por severidad" className="mt-3 flex flex-wrap gap-2">
          <Link
            href={`${url}?${aQuery(filtro, { severidad: "" })}`}
            aria-current={!filtro.severidad ? "page" : undefined}
            className={`rounded-lg border px-3 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-cu ${
              !filtro.severidad ? "border-graf bg-graf text-white" : "border-hair hover:bg-paper"
            }`}
          >
            Todas
          </Link>
          {SEVERIDADES_ORDENADAS.map((s) => (
            <Link
              key={s}
              href={`${url}?${aQuery(filtro, { severidad: s })}`}
              aria-current={filtro.severidad === s ? "page" : undefined}
              className={`rounded-lg border px-3 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-cu ${
                filtro.severidad === s ? "border-graf bg-graf text-white" : "border-hair hover:bg-paper"
              }`}
            >
              {SEVERIDAD_NOMBRE[s]} <span className="font-mono text-xs opacity-70">{abiertosPorSeveridad(s)}</span>
            </Link>
          ))}
        </nav>

        <form method="get" action={url} role="search" className="mt-3 flex flex-wrap items-end gap-3">
          {filtro.severidad ? <input type="hidden" name="severidad" value={filtro.severidad} /> : null}
          <label className="grid gap-1 text-xs font-semibold text-sub">
            Área
            <select name="area" defaultValue={filtro.area} className={campo}>
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
            <select name="gestion" defaultValue={filtro.gestion} className={campo}>
              <option value="abiertos">Pendientes</option>
              <option value="todos">Todos (incluye los ya gestionados)</option>
            </select>
          </label>
          <button
            type="submit"
            className="rounded-lg bg-graf px-4 py-2 text-sm font-semibold text-white hover:bg-graf-2 focus-visible:outline-2 focus-visible:outline-cu"
          >
            Filtrar
          </button>
          <span role="status" className="ml-auto text-sm text-sub">
            {equipos.length} {equipos.length === 1 ? "equipo" : "equipos"} · {visibles.length}{" "}
            {visibles.length === 1 ? "hallazgo" : "hallazgos"}
          </span>
        </form>
      </div>

      {equipos.length === 0 ? (
        <p className="px-5 py-8 text-sub">
          {filtro.gestion === "abiertos" && todos.length > 0
            ? "No hay hallazgos pendientes con este filtro. Use «Todos» para ver también los ya gestionados."
            : "No hay hallazgos registrados."}
        </p>
      ) : (
        <ul className="divide-y divide-hair">
          {equipos.map((e) => (
            <li key={`${e.tag}|${e.area}`} className="px-5 py-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className={`rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${CHIP_SEVERIDAD[e.severidadMax]}`}>
                  {SEVERIDAD_NOMBRE[e.severidadMax]}
                </span>
                <h2 className="font-mono text-lg font-bold">{e.tag || "Sin TAG"}</h2>
                <span className="text-sm text-sub">
                  {e.equipo} · {e.area} · {e.hallazgos.length} {e.hallazgos.length === 1 ? "hallazgo" : "hallazgos"}
                </span>
              </div>
              <ul className="mt-3 space-y-3">
                {e.hallazgos.map((h) => (
                  <li key={h.id} className="rounded-xl border border-hair p-3">
                    <p className="flex flex-wrap items-baseline gap-2">
                      <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${CHIP_SEVERIDAD[h.severidad]}`}>
                        {SEVERIDAD_NOMBRE[h.severidad]}
                      </span>
                      <span className="font-semibold">{h.itemTexto}</span>
                    </p>
                    {h.observacion ? <p className="mt-1 text-sm text-sub">{h.observacion}</p> : null}
                    <p className="mt-1 font-mono text-xs text-sub">
                      <Link href={`${base}/${h.inspeccionId}`} className="font-semibold text-cu hover:underline">
                        {h.folio ?? "Inspección"}
                      </Link>
                      {h.ot ? ` · OT ${h.ot}` : ""}
                      {h.enviadaEn ? ` · ${formatFechaHora(h.enviadaEn)}` : ""}
                    </p>
                    <SeguimientoHallazgo
                      findingId={h.id}
                      seguimiento={h.seguimiento}
                      ficha={fichaSap(h)}
                      puedeGestionar={puedeGestionar}
                    />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
