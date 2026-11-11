import Link from "next/link";
import { topeEje, type DiaSerie } from "@/lib/revision/panel";

/**
 * Dos series del gráfico. El azul y el cobre se distinguen también con daltonismo (comprobado con el validador de
 * paleta: ΔE 20 en protanopía); además la leyenda y la tabla los nombran, así que nunca dependen solo del color.
 */
export const COLOR_INSPECCIONES = "#2a78b8";
export const COLOR_MANTENCIONES = "#c4602d";

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;
const ddmm = (dia: string) => `${dia.slice(8, 10)}-${dia.slice(5, 7)}`;
/** El día ya viene en fecha de Chile, por eso se formatea como UTC al mediodía. */
const fechaDe = (dia: string) => new Date(`${dia}T12:00:00Z`);
const diaCorto = (dia: string) =>
  `${new Intl.DateTimeFormat("es-CL", { timeZone: "UTC", weekday: "short" }).format(fechaDe(dia)).replace(".", "")} ${ddmm(dia)}`;
const esFinDeSemana = (dia: string) => [0, 6].includes(fechaDe(dia).getUTCDay());
const esLunes = (dia: string) => fechaDe(dia).getUTCDay() === 1;

/** Cifra de resumen sobre el gráfico (total, promedio, día más alto). */
function Resumen({ titulo, valor, detalle }: { titulo: string; valor: string; detalle?: string }) {
  return (
    <div>
      <dt className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-sub">{titulo}</dt>
      <dd className="mt-0.5 font-mono text-xl font-semibold tabular-nums">
        {valor}
        {detalle ? <span className="ml-1.5 font-sans text-xs font-normal text-sub">{detalle}</span> : null}
      </dd>
    </div>
  );
}

/**
 * Columnas apiladas de lo recibido por día (inspecciones abajo, mantenciones arriba). Sin JavaScript: el detalle de cada
 * día aparece al pasar el cursor y la misma información está en «Ver como tabla». Con `hrefDia`, la columna de un día
 * con documentos es un enlace a la bandeja de ese día.
 */
export function GraficoRecibidas({
  serie,
  inspecciones,
  mantenciones,
  hrefDia,
}: {
  serie: DiaSerie[];
  inspecciones: number;
  mantenciones: number;
  hrefDia?: (dia: string) => string;
}) {
  const totales = serie.map((d) => d.inspecciones + d.mantenciones);
  const maximo = Math.max(0, ...totales);
  const tope = topeEje(maximo);
  const n = serie.length;
  const total = inspecciones + mantenciones;
  const conDatos = serie.filter((d) => d.inspecciones + d.mantenciones > 0);
  const diaMaximo = maximo > 0 ? serie[totales.indexOf(maximo)] : null;
  const alto = (v: number) => `${(v / tope) * 100}%`;
  const marcas = [tope, (tope * 3) / 4, tope / 2, tope / 4, 0];

  return (
    <figure className="mt-4">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <dl className="flex flex-wrap gap-x-8 gap-y-2">
          <Resumen titulo="Total" valor={String(total)} />
          <Resumen titulo="Promedio diario" valor={(total / Math.max(1, n)).toLocaleString("es-CL", { maximumFractionDigits: 1 })} />
          <Resumen titulo="Día más alto" valor={String(maximo)} detalle={diaMaximo ? diaCorto(diaMaximo.dia) : undefined} />
        </dl>
        <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm" aria-label="Series">
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="size-2.5 rounded-[3px]" style={{ background: COLOR_INSPECCIONES }} />
            Inspecciones <span className="font-mono font-semibold tabular-nums">{inspecciones}</span>
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="size-2.5 rounded-[3px]" style={{ background: COLOR_MANTENCIONES }} />
            Mantenciones <span className="font-mono font-semibold tabular-nums">{mantenciones}</span>
          </li>
        </ul>
      </div>

      <div
        role="group"
        aria-label={`Documentos recibidos por día en los últimos ${n} días: ${plural(inspecciones, "inspección", "inspecciones")} y ${plural(mantenciones, "mantención", "mantenciones")}. El detalle está en la tabla que sigue.`}
        className="mt-5 grid grid-cols-[1.75rem_1fr] gap-x-2"
      >
        <div aria-hidden="true" className="relative h-52 font-mono text-[11px] leading-none text-sub">
          {marcas.map((m, i) => (
            <span key={m} className="absolute right-0 -translate-y-1/2" style={{ top: `${(i / (marcas.length - 1)) * 100}%` }}>
              {Number.isInteger(m) ? m : ""}
            </span>
          ))}
        </div>
        <div className="relative h-52">
          {/* Líneas de referencia: finas y claras, detrás de las columnas; la base va un poco más marcada. */}
          <div aria-hidden="true" className="absolute inset-0">
            {marcas.map((m, i) => (
              <span
                key={m}
                className={`absolute inset-x-0 border-t ${m === 0 ? "border-graf/35" : "border-hair/70"}`}
                style={{ top: `${(i / (marcas.length - 1)) * 100}%` }}
              />
            ))}
          </div>
          <div className="relative flex h-full items-stretch">
            {serie.map((d, i) => {
              const t = d.inspecciones + d.mantenciones;
              const borde = Math.max(4, Math.round(n * 0.15));
              const lado = i < borde ? "left-0" : i >= n - borde ? "right-0" : "left-1/2 -translate-x-1/2";
              const href = t > 0 && hrefDia ? hrefDia(d.dia) : null;
              const clase = `group relative flex min-w-0 flex-1 flex-col items-center justify-end hover:bg-graf/[0.06] focus-visible:bg-graf/[0.06] focus-visible:outline-2 focus-visible:outline-cu ${
                esFinDeSemana(d.dia) ? "bg-graf/[0.025]" : ""
              }`;
              const contenido = (
                <>
                  <div
                    className={`pointer-events-none absolute bottom-full z-10 mb-2 hidden min-w-36 whitespace-nowrap rounded-xl bg-graf px-3 py-2 text-xs text-white shadow-lg group-hover:block group-focus-visible:block ${lado}`}
                  >
                    <span className="block font-semibold capitalize">{diaCorto(d.dia)}</span>
                    {t === 0 ? (
                      <span className="text-[#c9d0d6]">Sin documentos</span>
                    ) : (
                      <>
                        <span className="mt-1 flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5">
                            <span className="size-2 rounded-[2px]" style={{ background: COLOR_INSPECCIONES }} />
                            Inspecciones
                          </span>
                          <span className="font-mono font-semibold tabular-nums">{d.inspecciones}</span>
                        </span>
                        <span className="mt-0.5 flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5">
                            <span className="size-2 rounded-[2px]" style={{ background: COLOR_MANTENCIONES }} />
                            Mantenciones
                          </span>
                          <span className="font-mono font-semibold tabular-nums">{d.mantenciones}</span>
                        </span>
                        <span className="mt-1 flex items-center justify-between gap-4 border-t border-white/20 pt-1">
                          Total <span className="font-mono font-semibold tabular-nums">{t}</span>
                        </span>
                        {href ? <span className="mt-1 block text-[11px] text-[#c9d0d6]">Clic para ver la lista</span> : null}
                      </>
                    )}
                  </div>
                                    {/* Columna de 20 px como máximo. Solo se rotula el día más alto: el resto se lee en el eje, al pasar el cursor o en la tabla. */}
                  <div className="relative flex w-[62%] max-w-5 shrink-0 flex-col justify-end gap-[2px]" style={{ height: alto(t) }}>
                    {diaMaximo?.dia === d.dia && (
                      <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 font-mono text-[11px] font-semibold leading-none tabular-nums">
                        {t}
                      </span>
                    )}
                    {d.mantenciones > 0 && (
                      <span className="block min-h-[3px] rounded-t-[4px]" style={{ flexGrow: d.mantenciones, background: COLOR_MANTENCIONES }} />
                    )}
                    {d.inspecciones > 0 && (
                      <span
                        className={`block min-h-[3px] ${d.mantenciones > 0 ? "" : "rounded-t-[4px]"}`}
                        style={{ flexGrow: d.inspecciones, background: COLOR_INSPECCIONES }}
                      />
                    )}
                  </div>
                </>
              );
              return href ? (
                <Link key={d.dia} href={href} aria-label={`${diaCorto(d.dia)}: ${plural(t, "documento", "documentos")}. Abrir en la bandeja`} className={clase}>
                  {contenido}
                </Link>
              ) : (
                <div key={d.dia} className={clase}>
                  {contenido}
                </div>
              );
            })}
          </div>
        </div>
        <span />
        {/* Eje de fechas: se rotulan los lunes (inicio de semana) y hoy. */}
        <div aria-hidden="true" className="mt-2 flex font-mono text-[11px] text-sub">
          {serie.map((d, i) => {
            const hoy = i === n - 1;
            // Un lunes pegado a «Hoy» no se rotula para que no se monten.
            const rotular = hoy || (esLunes(d.dia) && i < n - (n > 45 ? 6 : 2) && (n <= 45 || Math.floor((n - 1 - i) / 7) % 2 === 1));
            return (
              <span key={d.dia} className="relative h-4 min-w-0 flex-1">
                {rotular && (
                  <span className={`absolute whitespace-nowrap ${hoy ? "right-0 font-semibold text-graf" : i === 0 ? "left-0" : "left-1/2 -translate-x-1/2"}`}>
                    {hoy ? "Hoy" : ddmm(d.dia)}
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer font-semibold text-cu underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-cu">
          Ver como tabla
        </summary>
        {conDatos.length === 0 ? (
          <p className="mt-2 text-sub">No se recibieron documentos en el período.</p>
        ) : (
          <table className="mt-2 w-full max-w-md text-sm">
            <caption className="sr-only">Documentos recibidos por día (solo los días con envíos)</caption>
            <thead>
              <tr className="border-b border-hair text-left font-mono text-[11px] uppercase tracking-[0.08em] text-sub">
                <th scope="col" className="py-1.5 font-medium">Día</th>
                <th scope="col" className="py-1.5 text-right font-medium">Inspecciones</th>
                <th scope="col" className="py-1.5 text-right font-medium">Mantenciones</th>
                <th scope="col" className="py-1.5 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hair font-mono tabular-nums">
              {[...conDatos].reverse().map((d) => (
                <tr key={d.dia}>
                  <th scope="row" className="py-1.5 text-left font-normal capitalize">{diaCorto(d.dia)}</th>
                  <td className="py-1.5 text-right">{d.inspecciones}</td>
                  <td className="py-1.5 text-right">{d.mantenciones}</td>
                  <td className="py-1.5 text-right font-semibold">{d.inspecciones + d.mantenciones}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </details>
    </figure>
  );
}
