import Link from "next/link";
import { BotonActualizar } from "@/components/revision/boton-actualizar";
import { MigasCarpeta, TarjetaCarpeta } from "@/components/revision/carpetas-bandeja";
import { FiltrosFallas } from "@/components/revision/filtros-fallas";
import { SeguimientoHallazgo } from "@/components/revision/seguimiento-hallazgo";
import { formatFechaHora } from "@/lib/fecha";
import { SIN_TURNO, ZONAS, coincideTurno, nombreTurno, nombreZona, zonaDeArea } from "@/lib/revision/carpetas";
import {
  FILTRO_FALLAS_INICIAL,
  SEVERIDADES_ORDENADAS,
  SEVERIDAD_NOMBRE,
  agruparPorEquipo,
  estadoGestion,
  fichaSap,
  filtrarFallas,
  queryFallas,
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

/**
 * Pestaña «Equipos con fallas»: los hallazgos en «Malo» agrupados por equipo y ordenados por severidad.
 * Con `carpetas` (supervisor y planificador) se entra por Turno A / Turno B y, dentro, Chacay-Mina y Puerto-Mauro,
 * igual que en la bandeja; «Ver todos en una lista» los muestra juntos.
 */
export async function FallasEquipos({
  base,
  filtro,
  puedeGestionar,
  carpetas = false,
}: {
  base: "/supervisor" | "/planificador" | "/admin";
  filtro: FiltroFallas;
  puedeGestionar: boolean;
  carpetas?: boolean;
}) {
  const [todos, areasCatalogo] = await Promise.all([listarFallas(), listarAreas()]);
  const usaCarpetas = carpetas && filtro.vista !== "lista";
  const nivel = !usaCarpetas ? "lista" : !filtro.turno ? "turnos" : !filtro.zona ? "zonas" : "lista";
  const dentroDeCarpeta = usaCarpetas && !!filtro.turno && !!filtro.zona;
  const urlFallas = `${base}/fallas`;
  const aCarpeta = (c: Partial<FiltroFallas>) => {
    const q = queryFallas({ ...FILTRO_FALLAS_INICIAL, ...c });
    return q ? `${urlFallas}?${q}` : urlFallas;
  };

  if (nivel !== "lista") {
    const turnos = (["A", "B", SIN_TURNO] as const).filter((t) => t !== SIN_TURNO || todos.some((h) => h.turno === null));
    const resumenDe = (hs: typeof todos) => ({
      equipos: agruparPorEquipo(hs).length,
      hallazgos: hs.length,
      pendientes: hs.filter((h) => estadoGestion(h.seguimiento) === "pendiente").length,
    });
    const tarjeta = (href: string, nombre: string, hs: typeof todos) => {
      const r = resumenDe(hs);
      return (
        <TarjetaCarpeta
          href={href}
          nombre={nombre}
          detalle={`${r.equipos} ${r.equipos === 1 ? "equipo" : "equipos"} · ${r.hallazgos} ${r.hallazgos === 1 ? "hallazgo" : "hallazgos"}`}
          pendiente={r.pendientes > 0 ? `${r.pendientes} pendientes` : undefined}
        />
      );
    };
    return (
      <section className="rounded-2xl border border-hair bg-white">
        <div className="border-b border-hair px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl font-bold tracking-tight">Equipos con fallas</h1>
            <BotonActualizar />
          </div>
        </div>
        <div className="px-5 py-5">
          {nivel === "zonas" ? (
            <MigasCarpeta migas={[{ texto: "Equipos con fallas", href: aCarpeta({}) }, { texto: nombreTurno(filtro.turno) }]} />
          ) : (
            <MigasCarpeta migas={[{ texto: "Equipos con fallas" }]} />
          )}
          <ul className="grid gap-3 sm:grid-cols-2">
            {nivel === "turnos"
              ? turnos.map((t) => (
                  <li key={t}>{tarjeta(aCarpeta({ turno: t }), nombreTurno(t), todos.filter((h) => coincideTurno(h, t)))}</li>
                ))
              : ZONAS.map((z) => {
                  const dentro = todos.filter((h) => coincideTurno(h, filtro.turno) && zonaDeArea(h.area) === z.id);
                  if (z.id === "otras" && dentro.length === 0) return null; // solo aparece si hay algo (p. ej. Valle)
                  return <li key={z.id}>{tarjeta(aCarpeta({ turno: filtro.turno, zona: z.id }), z.nombre, dentro)}</li>;
                })}
          </ul>
          <p className="mt-5 text-sm text-sub">
            Cada hallazgo queda en la carpeta del turno del técnico que envió la inspección y de su área.{" "}
            <Link href={aCarpeta({ vista: "lista" })} className="font-semibold text-cu underline-offset-2 hover:underline">
              Ver todos en una lista
            </Link>
          </p>
        </div>
      </section>
    );
  }

  const abiertosPorSeveridad = (s: Severidad) =>
    filtrarFallas(todos, { ...filtro, severidad: s }).length;
  const visibles = filtrarFallas(todos, filtro);
  const equipos = agruparPorEquipo(visibles);
  // Todas las áreas del catálogo, no solo las que hoy tienen hallazgos; se suma cualquier área con hallazgos que ya no esté.
  const areasTodas = [...new Set([...areasCatalogo, ...todos.map((h) => h.area)])];
  const areas = filtro.zona ? areasTodas.filter((a) => zonaDeArea(a) === filtro.zona) : areasTodas;
  const url = urlFallas;

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

        {dentroDeCarpeta && (
          <div className="mt-3">
            <MigasCarpeta
              migas={[
                { texto: "Equipos con fallas", href: aCarpeta({}) },
                { texto: nombreTurno(filtro.turno), href: aCarpeta({ turno: filtro.turno }) },
                { texto: nombreZona(filtro.zona || "otras") },
              ]}
            />
          </div>
        )}
        <nav aria-label="Filtro por severidad" className="mt-3 flex flex-wrap gap-2">
          <Link
            href={`${url}?${queryFallas(filtro, { severidad: "" })}`}
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
              href={`${url}?${queryFallas(filtro, { severidad: s })}`}
              aria-current={filtro.severidad === s ? "page" : undefined}
              className={`rounded-lg border px-3 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-cu ${
                filtro.severidad === s ? "border-graf bg-graf text-white" : "border-hair hover:bg-paper"
              }`}
            >
              {SEVERIDAD_NOMBRE[s]} <span className="font-mono text-xs opacity-70">{abiertosPorSeveridad(s)}</span>
            </Link>
          ))}
        </nav>

        <FiltrosFallas
          url={url}
          filtro={filtro}
          areas={areas}
          resumen={`${equipos.length} ${equipos.length === 1 ? "equipo" : "equipos"} · ${visibles.length} ${visibles.length === 1 ? "hallazgo" : "hallazgos"}`}
        />
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
