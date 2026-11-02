import Link from "next/link";
import { BotonActualizar } from "@/components/revision/boton-actualizar";
import { TablaBandeja } from "@/components/revision/tabla-bandeja";
import { MigasCarpeta, TarjetaCarpeta } from "@/components/revision/carpetas-bandeja";
import { SIN_TURNO, ZONAS, coincideTurno, contarCarpeta, nombreTurno, nombreZona, zonaDeArea, type ConteoCarpeta } from "@/lib/revision/carpetas";
import { CONSULTA_VACIA, consultaAQuery, filtrarFilas, hayBusqueda, tagsDe, type Consulta } from "@/lib/revision/consulta";
import { FILTROS, estadosDelFiltro, etapaPendiente, type Filtro } from "@/lib/revision/estado";
import { listarBandeja } from "@/lib/revision/queries";

const campo =
  "rounded-lg border border-hair bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-cu";

/**
 * Bandeja compartida por supervisor, planificador y administrador; solo el administrador elimina.
 * Con `carpetas` (supervisor y planificador) se entra por Turno A / Turno B y, dentro, Chacay-Mina y
 * Puerto-Mauro; la búsqueda y «Ver todas en una lista» muestran las inspecciones sin pasar por las carpetas.
 */
export async function Bandeja({
  base,
  rol,
  filtro,
  consulta,
  titulo,
  carpetas = false,
}: {
  base: "/supervisor" | "/planificador" | "/admin";
  rol: "supervisor" | "planner" | "admin";
  filtro: Filtro;
  consulta: Consulta;
  titulo: string;
  carpetas?: boolean;
}) {
  const usaCarpetas = carpetas && consulta.vista !== "lista";
  const nivel = !usaCarpetas || hayBusqueda(consulta) ? "lista" : !consulta.turno ? "turnos" : !consulta.zona ? "zonas" : "lista";
  const dentroDeCarpeta = usaCarpetas && !!consulta.turno && !!consulta.zona;
  const url = (c: Partial<Consulta>) => `${base}?${consultaAQuery(filtro, { ...CONSULTA_VACIA, ...c })}`;

  if (nivel !== "lista") {
    // Los conteos de las carpetas cuentan todo, sin importar el filtro de estado.
    const todas = await listarBandeja(estadosDelFiltro("todas", rol));
    const leTocaFirmar = (f: (typeof todas)[number]) => etapaPendiente(f.status, rol) !== null;
    const detalle = (c: ConteoCarpeta) => `${c.total} ${c.total === 1 ? "inspección" : "inspecciones"}`;
    const pendiente = (c: ConteoCarpeta) => (c.porFirmar > 0 ? `${c.porFirmar} por firmar` : undefined);
    const turnos = (["A", "B", SIN_TURNO] as const).filter((t) => t !== SIN_TURNO || todas.some((f) => f.turno === null));
    return (
      <section className="rounded-2xl border border-hair bg-white">
        <div className="border-b border-hair px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl font-bold tracking-tight">{titulo}</h1>
            <BotonActualizar />
          </div>
        </div>
        <div className="px-5 py-5">
          {nivel === "zonas" ? (
            <MigasCarpeta migas={[{ texto: "Bandeja", href: url({}) }, { texto: nombreTurno(consulta.turno) }]} />
          ) : (
            <MigasCarpeta migas={[{ texto: "Bandeja" }]} />
          )}
          <ul className="grid gap-3 sm:grid-cols-2">
            {nivel === "turnos"
              ? turnos.map((t) => {
                  const c = contarCarpeta(todas.filter((f) => coincideTurno(f, t)), leTocaFirmar);
                  return (
                    <li key={t}>
                      <TarjetaCarpeta href={url({ turno: t })} nombre={nombreTurno(t)} detalle={detalle(c)} pendiente={pendiente(c)} />
                    </li>
                  );
                })
              : ZONAS.map((z) => {
                  const dentro = todas.filter((f) => coincideTurno(f, consulta.turno) && zonaDeArea(f.area) === z.id);
                  if (z.id === "otras" && dentro.length === 0) return null; // solo aparece si hay algo (p. ej. Valle)
                  const c = contarCarpeta(dentro, leTocaFirmar);
                  return (
                    <li key={z.id}>
                      <TarjetaCarpeta
                        href={url({ turno: consulta.turno, zona: z.id })}
                        nombre={z.nombre}
                        detalle={detalle(c)}
                        pendiente={pendiente(c)}
                      />
                    </li>
                  );
                })}
          </ul>
          <p className="mt-5 text-sm text-sub">
            Cada inspección queda sola en su carpeta, según el turno del técnico que la envió y el área.{" "}
            <Link href={url({ vista: "lista" })} className="font-semibold text-cu underline-offset-2 hover:underline">
              Buscar o ver todas en una lista
            </Link>
          </p>
        </div>
      </section>
    );
  }

  const todas = await listarBandeja(estadosDelFiltro(filtro, rol));
  const filas = filtrarFilas(todas, consulta);
  const conConsulta = hayBusqueda(consulta) || (!dentroDeCarpeta && !!(consulta.turno || consulta.zona));

  return (
    <section className="rounded-2xl border border-hair bg-white">
      <div className="border-b border-hair px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold tracking-tight">{titulo}</h1>
          <BotonActualizar />
        </div>
        {dentroDeCarpeta && (
          <div className="mt-3">
            <MigasCarpeta
              migas={[
                { texto: "Bandeja", href: url({}) },
                { texto: nombreTurno(consulta.turno), href: url({ turno: consulta.turno }) },
                { texto: nombreZona(consulta.zona || "otras") },
              ]}
            />
          </div>
        )}
        <nav aria-label="Filtro por estado" className="mt-3 flex flex-wrap gap-2">
          {FILTROS.map((f) => (
            <Link
              key={f.value}
              href={`${base}?${consultaAQuery(f.value, consulta)}`}
              aria-current={f.value === filtro ? "page" : undefined}
              className={`rounded-lg border px-3 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-cu ${
                f.value === filtro ? "border-graf bg-graf text-white" : "border-hair hover:bg-paper"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </nav>

        {/* GET sin JavaScript: la consulta queda en la URL y se puede compartir. */}
        <form method="get" action={base} role="search" className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <input type="hidden" name="estado" value={filtro} />
          {consulta.vista && <input type="hidden" name="vista" value={consulta.vista} />}
          {dentroDeCarpeta && <input type="hidden" name="zona" value={consulta.zona} />}
          {dentroDeCarpeta && <input type="hidden" name="turno" value={consulta.turno} />}
          <label className="grid gap-1 text-xs font-semibold text-sub lg:col-span-2">
            Buscar
            <input
              type="search"
              name="q"
              defaultValue={consulta.q}
              placeholder="Folio, TAG, equipo, área o nombre"
              className={campo}
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-sub">
            TAG del equipo
            <input
              type="text"
              name="tag"
              list="tags-bandeja"
              defaultValue={consulta.tag}
              placeholder="Ej. 740-XF-001"
              className={`${campo} font-mono`}
            />
            <datalist id="tags-bandeja">
              {tagsDe(todas).map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </label>
          {!dentroDeCarpeta && (
            <label className="grid gap-1 text-xs font-semibold text-sub">
              Turno
              <select name="turno" defaultValue={consulta.turno} className={campo}>
                <option value="">Ambos</option>
                <option value="A">Turno A</option>
                <option value="B">Turno B</option>
                <option value={SIN_TURNO}>Sin turno</option>
              </select>
            </label>
          )}
          <label className="grid gap-1 text-xs font-semibold text-sub">
            Enviada desde
            <input type="date" name="desde" defaultValue={consulta.desde} className={campo} />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-sub">
            Hasta
            <input type="date" name="hasta" defaultValue={consulta.hasta} className={campo} />
          </label>
          <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-6">
            <button
              type="submit"
              className="rounded-lg bg-graf px-4 py-2 text-sm font-semibold text-white hover:bg-graf-2 focus-visible:outline-2 focus-visible:outline-cu"
            >
              Buscar
            </button>
            {conConsulta && (
              <Link
                href={url(dentroDeCarpeta ? { turno: consulta.turno, zona: consulta.zona } : { vista: consulta.vista })}
                className="text-sm font-semibold text-cu underline-offset-2 hover:underline"
              >
                Limpiar búsqueda
              </Link>
            )}
            <span role="status" className="ml-auto text-sm text-sub">
              {filas.length} {filas.length === 1 ? "resultado" : "resultados"}
              {conConsulta && ` de ${todas.length}`}
            </span>
          </div>
        </form>

        {consulta.tag && (
          <p className="mt-3 rounded-lg bg-cu-soft px-3 py-2 text-sm">
            Mostrando solo el equipo <span className="font-mono font-semibold">{consulta.tag}</span>
            {filtro !== "todas" && " en este estado; use «Todas» para ver su historial completo"}.
          </p>
        )}
      </div>

      {filas.length === 0 ? (
        <p className="px-5 py-8 text-sub">
          {conConsulta ? "Ninguna inspección coincide con la búsqueda." : "No hay inspecciones en este estado."}
        </p>
      ) : (
        <TablaBandeja
          filas={filas}
          base={base}
          rol={rol}
          puedeEliminar={rol === "admin"}
          hrefTagBase={`${base}?estado=todas&tag=`}
        />
      )}
    </section>
  );
}
