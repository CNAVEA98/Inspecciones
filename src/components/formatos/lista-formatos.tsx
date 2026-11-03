import Link from "next/link";
import { formatFechaHora } from "@/lib/fecha";
import { listarFormatos } from "@/lib/formatos/plantillas";
import { BotonActivo } from "./boton-activo";

/**
 * Listado de los formatos con su versión vigente. `base` es la ruta del panel («/supervisor»…).
 * `puedeActivar` (solo administrador) muestra el botón Desactivar / Reactivar.
 */
export async function ListaFormatos({ base, puedeEditar, puedeActivar = false }: { base: string; puedeEditar: boolean; puedeActivar?: boolean }) {
  const filas = await listarFormatos();
  const inactivos = filas.filter((f) => !f.formato.activo).length;
  const grupos = (["INSP", "MANT"] as const).map((tipo) => ({ tipo, filas: filas.filter((f) => f.formato.tipo === tipo) }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight">Formatos</h1>
        <p className="text-sm text-sub">
          {puedeEditar
            ? "Entre a un formato para cambiar los textos de sus preguntas o agregar secciones e ítems. Cada cambio se publica como una versión nueva; las inspecciones ya enviadas conservan la suya."
            : "Consulta de los formatos vigentes y su historial de versiones. Solo un supervisor o un administrador puede modificarlos."}
          {puedeActivar
            ? " Un formato desactivado deja de ofrecerse a los técnicos, pero no se borra: sus inspecciones y versiones se conservan."
            : ""}
        </p>
        {inactivos > 0 ? (
          <p className="mt-1 text-sm font-semibold text-sub">
            {inactivos} formato{inactivos === 1 ? "" : "s"} desactivado{inactivos === 1 ? "" : "s"}: no aparece{inactivos === 1 ? "" : "n"} al técnico.
          </p>
        ) : null}
      </header>

      {grupos.map((g) => (
        <section key={g.tipo} className="overflow-hidden rounded-2xl border border-hair bg-white">
          <h2 className="border-b border-hair px-5 py-3 text-base font-bold">
            {g.tipo === "INSP" ? "Inspecciones" : "Mantenciones"} <span className="font-mono text-xs font-normal text-sub">({g.filas.length})</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left font-mono text-xs uppercase tracking-[0.06em] text-sub">
                  <th className="px-5 py-2 font-medium">Formato</th>
                  <th className="px-5 py-2 font-medium">Título</th>
                  <th className="px-5 py-2 font-medium">Familia</th>
                  <th className="px-5 py-2 font-medium">Versión</th>
                  <th className="px-5 py-2 font-medium">Última publicación</th>
                  <th className="px-5 py-2 font-medium">
                    <span className="sr-only">Acción</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {g.filas.map(({ formato, familia, actual, versiones }) => (
                  <tr key={formato.id} className={`border-t border-hair align-top ${formato.activo ? "" : "bg-paper text-sub"}`}>
                    <td className="px-5 py-3 font-mono font-semibold">{formato.id}</td>
                    <td className="px-5 py-3 font-medium">
                      {formato.titulo.trim()}
                      {formato.activo ? null : (
                        <span className="ml-2 rounded-full border border-hair bg-white px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.06em] text-sub">
                          Desactivado
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sub">{familia}</td>
                    <td className="px-5 py-3 font-mono">{actual ? `v${actual.version}` : "—"}{versiones > 1 ? <span className="text-sub"> · {versiones} versiones</span> : null}</td>
                    <td className="px-5 py-3 text-sub">
                      {actual?.publicadaEn ? formatFechaHora(actual.publicadaEn) : "—"}
                      {actual?.autor ? <span className="block">{actual.autor}</span> : null}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="inline-flex flex-wrap items-start justify-end gap-2">
                      {actual ? (
                        <Link
                          href={`${base}/formatos/${formato.id}`}
                          className="rounded-lg border border-graf px-3 py-1.5 font-semibold hover:bg-paper focus-visible:outline-2 focus-visible:outline-cu"
                        >
                          {puedeEditar ? "Editar" : "Ver"}
                        </Link>
                      ) : (
                        <span className="text-sub">Sin plantilla</span>
                      )}
                      {puedeActivar ? <BotonActivo formatoId={formato.id} titulo={formato.titulo.trim()} activo={formato.activo} /> : null}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
