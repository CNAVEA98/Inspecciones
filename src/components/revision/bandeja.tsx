import Link from "next/link";
import { TablaBandeja } from "@/components/revision/tabla-bandeja";
import { CONSULTA_VACIA, consultaAQuery, filtrarFilas, hayConsulta, tagsDe, type Consulta } from "@/lib/revision/consulta";
import { FILTROS, estadosDelFiltro, type Filtro } from "@/lib/revision/estado";
import { listarBandeja } from "@/lib/revision/queries";

const campo =
  "rounded-lg border border-hair bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-cu";

/** Bandeja compartida por supervisor, planificador y administrador; solo el administrador elimina. */
export async function Bandeja({
  base,
  rol,
  filtro,
  consulta,
  titulo,
}: {
  base: "/supervisor" | "/planificador" | "/admin";
  rol: "supervisor" | "planner" | "admin";
  filtro: Filtro;
  consulta: Consulta;
  titulo: string;
}) {
  const todas = await listarBandeja(estadosDelFiltro(filtro, rol));
  const filas = filtrarFilas(todas, consulta);
  const conConsulta = hayConsulta(consulta);

  return (
    <section className="rounded-2xl border border-hair bg-white">
      <div className="border-b border-hair px-5 py-4">
        <h1 className="text-xl font-bold tracking-tight">{titulo}</h1>
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
          <label className="grid gap-1 text-xs font-semibold text-sub">
            Turno
            <select name="turno" defaultValue={consulta.turno} className={campo}>
              <option value="">Ambos</option>
              <option value="A">Turno A</option>
              <option value="B">Turno B</option>
            </select>
          </label>
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
                href={`${base}?${consultaAQuery(filtro, CONSULTA_VACIA)}`}
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
