import Link from "next/link";
import { FILAS_VISTA_PREVIA, leerCatalogoExportar, previsualizarExportar } from "@/lib/exportar/consulta";
import { ESTADOS_EXPORTAR, MAX_FILAS_EXPORTAR, filtroInicial, nombreArchivo, queryExportar, valorZona, type FiltroExportar } from "@/lib/exportar/filtro";
import { formatFechaHora, hoyIso } from "@/lib/fecha";
import { SIN_TURNO, ZONAS, tipoDeModo } from "@/lib/revision/carpetas";
import { STATUS_SHORT } from "@/lib/revision/estado";

const campo =
  "w-full min-w-0 rounded-lg border border-hair bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-cu";
const rotulo = "grid w-full gap-1 text-xs font-semibold text-sub";

/**
 * Pestaña «Exportar»: se eligen los filtros, se ve cuántas inspecciones y mantenciones cumplen y se descarga el Excel.
 * El formulario es un GET sin JavaScript: los filtros quedan en la URL y la descarga usa exactamente la misma consulta.
 */
export async function Exportar({
  base,
  filtro,
  pagina: paginaPedida = 1,
}: {
  base: "/supervisor" | "/planificador" | "/admin";
  filtro: FiltroExportar;
  /** Página de la vista previa. */
  pagina?: number;
}) {
  const catalogo = await leerCatalogoExportar();
  const { total, filas, pagina, paginas } = await previsualizarExportar(filtro, catalogo, paginaPedida);
  const primera = (pagina - 1) * FILAS_VISTA_PREVIA + 1;
  const ultima = primera + filas.length - 1;
  const aPagina = (n: number) => `${base}/exportar?${queryExportar(filtro)}${n > 1 ? `&pagina=${n}` : ""}#vista-previa`;
  const flecha =
    "inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-hair px-3 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-cu";
  const url = `${base}/exportar`;
  const query = queryExportar(filtro);
  const excede = total > MAX_FILAS_EXPORTAR;
  const zonas = ZONAS.filter((z) => z.id !== "otras");

  return (
    <section className="rounded-2xl border border-hair bg-white">
      <div className="border-b border-hair px-5 py-4">
        <h1 className="text-xl font-bold tracking-tight">Exportar a Excel</h1>
        <p className="mt-1 max-w-3xl text-sm text-sub">
          Descarga las inspecciones y mantenciones enviadas en el período, con sus firmas y hallazgos. Los borradores no se
          incluyen. El archivo trae tres hojas: «Inspecciones» (una fila por documento), «Hallazgos» (una fila por ítem en
          «Malo») y «Criterios» (los filtros usados).
        </p>
      </div>

      <form method="get" action={url} className="grid gap-4 px-5 py-5 sm:grid-cols-2 lg:grid-cols-4">
        <label className={rotulo}>
          Enviadas desde
          <input type="date" name="desde" defaultValue={filtro.desde} required className={campo} />
        </label>
        <label className={rotulo}>
          Hasta
          <input type="date" name="hasta" defaultValue={filtro.hasta} required className={campo} />
        </label>
        <label className={rotulo}>
          Tipo de trabajo
          <select name="tipo" defaultValue={filtro.tipo} className={campo}>
            <option value="">Inspecciones y mantenciones</option>
            <option value="inspeccion">Solo inspecciones</option>
            <option value="mantencion">Solo mantenciones</option>
          </select>
        </label>
        <label className={rotulo}>
          Turno
          <select name="turno" defaultValue={filtro.turno} className={campo}>
            <option value="">Ambos</option>
            <option value="A">Turno A</option>
            <option value="B">Turno B</option>
            <option value={SIN_TURNO}>Sin turno</option>
          </select>
        </label>
        <label className={rotulo}>
          Área
          <select name="area" defaultValue={filtro.area} className={campo}>
            <option value="">Todas</option>
            <optgroup label="Por zona">
              {zonas.map((z) => (
                <option key={z.id} value={valorZona(z.id)}>
                  {z.nombre}
                </option>
              ))}
            </optgroup>
            <optgroup label="Por área">
              {catalogo.areas.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.name}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
        <label className={rotulo}>
          Tipo de equipo
          <select name="equipo" defaultValue={filtro.equipo} className={campo}>
            <option value="">Todos</option>
            {catalogo.equipos.map((e) => (
              <option key={e.code} value={e.code}>
                {e.name}
              </option>
            ))}
          </select>
        </label>
        <label className={rotulo}>
          TAG del equipo (completo o una parte)
          <input type="text" name="tag" defaultValue={filtro.tag} placeholder="Ej. 740-XF o 740-XF-001" maxLength={60} className={`${campo} font-mono`} />
        </label>
        <label className={rotulo}>
          Estado
          <select name="estado" defaultValue={filtro.estado} className={campo}>
            {ESTADOS_EXPORTAR.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-4">
          <button
            type="submit"
            className="rounded-lg border border-graf px-4 py-2 text-sm font-semibold hover:bg-paper focus-visible:outline-2 focus-visible:outline-cu"
          >
            Aplicar filtros
          </button>
          <Link href={`${url}?${queryExportar(filtroInicial(hoyIso()))}`} className="text-sm font-semibold text-cu underline-offset-2 hover:underline">
            Limpiar
          </Link>
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-hair bg-paper px-5 py-5">
        <p role="status" className="min-w-0 flex-1">
          <span className="font-mono text-3xl font-semibold tabular-nums">{total}</span>{" "}
          <span className="text-sm text-sub">
            {total === 1 ? "inspección o mantención cumple" : "inspecciones y mantenciones cumplen"} los filtros aplicados, entre el{" "}
            {filtro.desde.split("-").reverse().join("-")} y el {filtro.hasta.split("-").reverse().join("-")}.
          </span>
        </p>
        {total === 0 ? (
          <p className="text-sm font-semibold text-sub">No hay nada que descargar con estos filtros.</p>
        ) : excede ? (
          <p className="max-w-md text-sm font-semibold text-bad">
            Un archivo admite hasta {MAX_FILAS_EXPORTAR} documentos. Acote las fechas o agregue filtros.
          </p>
        ) : (
          // Enlace normal (no <Link>): es una descarga que responde una ruta, no una página que se pueda precargar.
          <a
            href={`${url}/descargar?${query}`}
            download={nombreArchivo(filtro)}
            className="rounded-lg bg-graf px-5 py-2.5 text-sm font-semibold text-white hover:bg-graf-2 focus-visible:outline-2 focus-visible:outline-cu"
          >
            Descargar Excel
          </a>
        )}
      </div>
      <p className="border-b border-hair px-5 py-3 text-xs text-sub">
        Si cambia un filtro, pulse «Aplicar filtros» antes de descargar: el archivo corresponde a la cifra que se muestra.
      </p>

      {filas.length > 0 && (
        <div id="vista-previa" className="scroll-mt-4 px-5 py-4">
          <h2 className="text-base font-bold tracking-tight">Vista previa</h2>
          <p className="mt-0.5 text-sm text-sub">
            {total > filas.length
              ? `Documentos ${primera} a ${ultima} de ${total}, en el orden del archivo (del más reciente al más antiguo).`
              : `${total === 1 ? "El documento" : `Los ${total} documentos`} que se ${total === 1 ? "exportará" : "exportarán"}, en el orden del archivo.`}{" "}
            El Excel trae además el formato, el N.º de OT, las firmas y los hallazgos.
          </p>
          <div className="mt-3 overflow-x-auto rounded-xl border border-hair">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="bg-paper text-left font-mono text-[11px] uppercase tracking-[0.08em] text-sub">
                  {["Folio", "Tipo", "TAG", "Tipo de equipo", "Área", "Turno", "Realizada por", "Estado", "Envío"].map((t) => (
                    <th key={t} scope="col" className="px-3 py-2 font-medium">
                      {t}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-hair">
                {filas.map((f) => (
                  <tr key={f.id}>
                    <td className="whitespace-nowrap px-3 py-2 font-mono">
                      <Link href={`${base}/${f.id}`} className="font-semibold text-cu underline-offset-2 hover:underline">
                        {f.folio ?? "Sin folio"}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{tipoDeModo(f.modo) === "mantencion" ? "Mantención" : "Inspección"}</td>
                    <td className="px-3 py-2 font-mono font-semibold">{f.equipmentTag || "—"}</td>
                    <td className="px-3 py-2">{f.equipo}</td>
                    <td className="px-3 py-2">{f.area}</td>
                    <td className="whitespace-nowrap px-3 py-2">{f.turno ? `Turno ${f.turno}` : "Sin turno"}</td>
                    <td className="px-3 py-2">{f.realizadoPor || "—"}</td>
                    <td className="px-3 py-2">{STATUS_SHORT[f.status]}</td>
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-sub">{f.submittedAt ? formatFechaHora(f.submittedAt) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {paginas > 1 && (
            <nav aria-label="Páginas de la vista previa" className="mt-3 flex flex-wrap items-center justify-between gap-3">
              {pagina > 1 ? (
                <Link href={aPagina(pagina - 1)} scroll={false} className={`${flecha} hover:bg-paper`}>
                  <span aria-hidden="true">←</span> Anteriores
                </Link>
              ) : (
                <span aria-disabled="true" className={`${flecha} text-sub opacity-50`}>
                  <span aria-hidden="true">←</span> Anteriores
                </span>
              )}
              <span role="status" className="text-sm text-sub">
                Página <span className="font-mono font-semibold text-graf">{pagina}</span> de{" "}
                <span className="font-mono font-semibold text-graf">{paginas}</span> · el archivo incluye los {total}
              </span>
              {pagina < paginas ? (
                <Link href={aPagina(pagina + 1)} scroll={false} className={`${flecha} hover:bg-paper`}>
                  Siguientes <span aria-hidden="true">→</span>
                </Link>
              ) : (
                <span aria-disabled="true" className={`${flecha} text-sub opacity-50`}>
                  Siguientes <span aria-hidden="true">→</span>
                </span>
              )}
            </nav>
          )}
        </div>
      )}
    </section>
  );
}
