import Link from "next/link";
import { ArrowUpRight, CircleCheck, ClipboardCheck, FileSpreadsheet, Inbox, TriangleAlert, type LucideIcon } from "lucide-react";
import { BloqueAdministracion } from "@/components/admin/bloque-administracion";
import { BotonActualizar } from "@/components/revision/boton-actualizar";
import { COLOR_INSPECCIONES, COLOR_MANTENCIONES, GraficoRecibidas } from "@/components/revision/grafico-recibidas";
import type { SessionProfile } from "@/lib/auth/session";
import { roleWithShift } from "@/lib/auth/roles";
import { formatFechaHora, hoyIso, sumarDias } from "@/lib/fecha";
import { ZONAS, nombreTurno, nombreZona } from "@/lib/revision/carpetas";
import { SEVERIDADES_ORDENADAS, SEVERIDAD_NOMBRE, type Severidad } from "@/lib/revision/fallas";
import {
  DIAS_ATRASO,
  FILTRO_PANEL_INICIAL,
  PERIODOS,
  calcularPanel,
  filtrarPorTurnoZona,
  queryFiltroPanel,
  textoDuracion,
  type FiltroPanel,
  type GrupoRecibidas,
  type RolPanel,
} from "@/lib/revision/panel";
import { leerDatosPanel } from "@/lib/revision/panel-queries";

type Base = "/supervisor" | "/planificador" | "/admin";

/** Colores de severidad de `docs/guias/DESIGN.md`; siempre van con su nombre al lado (nunca solo el color). */
const COLOR_SEVERIDAD: Record<Severidad, string> = { critica: "#bb0000", alta: "#c25400", media: "#8a6d00", baja: "#1d7a46" };
/** Estados de la revisión: cobre para lo que espera firma (más claro en la segunda etapa), verde y rojo para el resultado. */
const COLOR_ESTADO = { supervisor: "#c4602d", programador: "#e0a37f", aprobadas: "#1d7a46", rechazadas: "#bb0000" };

const tarjeta = "rounded-2xl border border-hair bg-white";
const etiqueta = "font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-sub";
const enlace = "font-semibold text-cu underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-cu";

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;
const porcentaje = (parte: number, total: number) => (total > 0 ? `${Math.round((parte / total) * 100)} %` : "—");

function fechaLarga(d: Date): string {
  const t = new Intl.DateTimeFormat("es-CL", { timeZone: "America/Santiago", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(d);
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Encabezado de una tarjeta: título, bajada y, a la derecha, un enlace a la lista completa. */
function Cabecera({ titulo, bajada, href, accion }: { titulo: string; bajada?: string; href?: string; accion?: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-hair px-5 py-3.5">
      <div className="min-w-0">
        <h2 className="text-[15px] font-bold tracking-tight">{titulo}</h2>
        {bajada ? <p className="mt-0.5 text-xs text-sub">{bajada}</p> : null}
      </div>
      {href && accion ? (
        <Link href={href} className={`${enlace} inline-flex shrink-0 items-center gap-1 text-xs`}>
          {accion}
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </Link>
      ) : null}
    </div>
  );
}

/**
 * Indicador principal: icono, etiqueta, cifra grande y una línea de contexto. Toda la tarjeta enlaza a su detalle.
 * Las cuatro tarjetas se ven iguales; lo que pide atención se dice con la etiqueta en cobre (`aviso`), no con el marco.
 */
function Indicador({
  href,
  icono: Icono,
  titulo,
  valor,
  detalle,
  aviso,
  children,
}: {
  href: string;
  icono: LucideIcon;
  titulo: string;
  valor: string;
  detalle: string;
  /** Texto destacado en cobre (algo que pide atención). */
  aviso?: string;
  /** Mini gráfico a la derecha de la cifra. */
  children?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`${tarjeta} group relative flex flex-col overflow-hidden p-5 transition-colors hover:border-graf/30 hover:bg-paper/60 focus-visible:outline-2 focus-visible:outline-cu`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className={etiqueta}>{titulo}</p>
        <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-paper text-sub">
          <Icono className="size-4" strokeWidth={2} />
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="font-mono text-[2.5rem] font-semibold leading-none tracking-tight tabular-nums">{valor}</p>
        {children}
      </div>
      <p className="mt-3 text-sm leading-snug text-sub">{detalle}</p>
      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
        {aviso ? (
          <span className="rounded-full bg-cu-soft px-2.5 py-0.5 text-xs font-semibold text-[#7a3d12]">{aviso}</span>
        ) : (
          <span />
        )}
        <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-sub group-hover:text-cu">
          Ver
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}

/** Mini columnas de los últimos 14 días: los 7 más recientes en grafito y los 7 previos en gris, para ver la comparación. */
function MiniSerie({ valores }: { valores: number[] }) {
  const max = Math.max(1, ...valores);
  return (
    <span aria-hidden="true" className="flex h-10 items-end gap-[3px]">
      {valores.map((v, i) => (
        <span
          key={i}
          className={`w-[5px] rounded-t-[2px] ${i >= valores.length - 7 ? "bg-graf" : "bg-[#c9c4ba]"}`}
          style={{ height: `${Math.max(v > 0 ? 12 : 4, (v / max) * 100)}%` }}
        />
      ))}
    </span>
  );
}

interface Segmento {
  nombre: string;
  valor: number;
  color: string;
}

/** Barra única repartida en partes de un total, con su leyenda (nombre, cifra y porcentaje). */
function BarraPartes({ segmentos, descripcion }: { segmentos: Segmento[]; descripcion: string }) {
  const total = segmentos.reduce((s, x) => s + x.valor, 0);
  return (
    <div>
      <div role="img" aria-label={descripcion} className="flex h-3 gap-[2px] overflow-hidden rounded-full bg-paper">
        {segmentos
          .filter((s) => s.valor > 0)
          .map((s) => (
            <span key={s.nombre} title={`${s.nombre}: ${s.valor}`} style={{ flexGrow: s.valor, background: s.color }} className="min-w-[6px]" />
          ))}
      </div>
      <ul className="mt-4 space-y-2.5 text-sm">
        {segmentos.map((s) => (
          <li key={s.nombre} className="flex items-center gap-2.5">
            <span aria-hidden="true" className="size-2.5 shrink-0 rounded-[3px]" style={{ background: s.color }} />
            <span className="min-w-0 flex-1 truncate">{s.nombre}</span>
            <span className="font-mono text-xs tabular-nums text-sub">{porcentaje(s.valor, total)}</span>
            <span className="w-8 text-right font-mono font-semibold tabular-nums">{s.valor}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Barras horizontales apiladas (inspecciones + mantenciones) por grupo: área o tipo de equipo. */
function BarrasGrupo({ grupos, vacio, href }: { grupos: GrupoRecibidas[]; vacio: string; href: (nombre: string) => string }) {
  if (grupos.length === 0) return <p className="text-sm text-sub">{vacio}</p>;
  const max = Math.max(...grupos.map((g) => g.total));
  return (
    <ul className="space-y-3.5">
      {grupos.map((g) => (
        <li key={g.nombre} title={`${g.nombre}: ${plural(g.inspecciones, "inspección", "inspecciones")} y ${plural(g.mantenciones, "mantención", "mantenciones")}`}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <Link href={href(g.nombre)} className="min-w-0 truncate underline-offset-2 hover:text-cu hover:underline focus-visible:outline-2 focus-visible:outline-cu">
              {g.nombre}
            </Link>
            <span className="font-mono font-semibold tabular-nums">{g.total}</span>
          </div>
          <div aria-hidden="true" className="mt-1.5 h-2 rounded-full bg-paper">
            <div className="flex h-2 gap-[2px] overflow-hidden rounded-full" style={{ width: `${(g.total / max) * 100}%`, minWidth: 8 }}>
              {g.inspecciones > 0 && <span style={{ flexGrow: g.inspecciones, background: COLOR_INSPECCIONES }} />}
              {g.mantenciones > 0 && <span style={{ flexGrow: g.mantenciones, background: COLOR_MANTENCIONES }} />}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Leyenda de las dos series, para las tarjetas de barras por grupo. */
function LeyendaSeries() {
  return (
    <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1 border-t border-hair pt-3 text-xs text-sub" aria-label="Series">
      <li className="flex items-center gap-1.5">
        <span aria-hidden="true" className="size-2.5 rounded-[3px]" style={{ background: COLOR_INSPECCIONES }} />
        Inspecciones
      </li>
      <li className="flex items-center gap-1.5">
        <span aria-hidden="true" className="size-2.5 rounded-[3px]" style={{ background: COLOR_MANTENCIONES }} />
        Mantenciones
      </li>
    </ul>
  );
}

/** Grupo de opciones excluyentes (período, turno o área): son enlaces, así el filtro queda en la URL y funciona sin JavaScript. */
function Selector<T extends string | number>({
  nombre,
  opciones,
  actual,
  href,
}: {
  nombre: string;
  opciones: { valor: T; texto: string }[];
  actual: T;
  href: (valor: T) => string;
}) {
  return (
    <nav aria-label={nombre} className="flex items-center gap-2">
      <span className={etiqueta}>{nombre}</span>
      <span className="inline-flex rounded-lg border border-hair bg-white p-0.5">
        {opciones.map((o) => (
          <Link
            key={String(o.valor)}
            href={href(o.valor)}
            scroll={false}
            aria-current={o.valor === actual ? "true" : undefined}
            className={`rounded-md px-2.5 py-1 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-cu ${
              o.valor === actual ? "bg-graf text-white" : "text-sub hover:bg-paper hover:text-graf"
            }`}
          >
            {o.texto}
          </Link>
        ))}
      </span>
    </nav>
  );
}

/**
 * Pantalla de inicio de supervisor, programador y administrador: qué hay por firmar, cuánto se recibió, cómo va la
 * revisión y qué hallazgos siguen sin seguimiento. Cada cifra enlaza a la lista donde se trabaja.
 */
export async function PanelInicio({
  base,
  rol,
  session,
  filtro = FILTRO_PANEL_INICIAL,
}: {
  base: Base;
  rol: RolPanel;
  session: SessionProfile;
  /** Período, turno y área elegidos arriba del panel (vienen de la URL). */
  filtro?: FiltroPanel;
}) {
  const ahora = new Date();
  const datos = await leerDatosPanel(filtro.dias);
  const dias = filtro.dias;
  const filtrado = filtro.turno !== "" || filtro.zona !== "";
  const p = calcularPanel({
    abiertas: filtrarPorTurnoZona(datos.abiertas, filtro),
    recientes: filtrarPorTurnoZona(datos.recientes, filtro),
    hallazgos: filtrarPorTurnoZona(datos.hallazgos, filtro),
    rol,
    ahora,
    dias,
  });

  const panelCon = (cambio: Partial<FiltroPanel>) => {
    const q = queryFiltroPanel({ ...filtro, ...cambio });
    return `${base}/panel${q ? `?${q}` : ""}`;
  };
  // Los enlaces a la bandeja llevan el turno y el área elegidos, para llegar a la misma selección.
  const ubicacion = `${filtro.turno ? `&turno=${filtro.turno}` : ""}${filtro.zona ? `&zona=${filtro.zona}` : ""}`;
  // Supervisor y programador entran a la bandeja por carpetas; «vista=lista» muestra la lista directa.
  const bandeja = (q: string) => `${base}?${q}${ubicacion}${rol === "admin" ? "" : "&vista=lista"}`;
  const desdePeriodo = sumarDias(hoyIso(), -(dias - 1));
  const enPeriodo = (q: string) => bandeja(`estado=todas&desde=${desdePeriodo}&${q}`);
  const fallas = `${base}/fallas${rol === "admin" ? "" : "?vista=lista"}`;
  const diferencia = p.recibidas7 - p.recibidas7Previas;
  const criticosYAltos = p.pendientesPorSeveridad.critica + p.pendientesPorSeveridad.alta;
  const tituloPorFirmar = rol === "admin" ? "En revisión" : "Por firmar";
  const detallePorFirmar =
    rol === "supervisor"
      ? `${plural(p.enOtraEtapa, "espera", "esperan")} al programador`
      : rol === "planner"
        ? `${plural(p.enOtraEtapa, "espera", "esperan")} al supervisor`
        : `${p.enSupervisor} con el supervisor · ${p.enProgramador} con el programador`;
  const resueltas = p.aprobadas + p.rechazadas;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className={etiqueta}>Panel de control</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Inicio</h1>
          <p className="mt-1 text-sm text-sub">
            {fechaLarga(ahora)} · {roleWithShift(session.role, session.shift)}
            {filtrado ? ` · viendo ${[filtro.turno ? `Turno ${filtro.turno}` : "", filtro.zona ? nombreZona(filtro.zona) : ""].filter(Boolean).join(" · ")}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`${base}/exportar`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-hair bg-white px-3 py-1.5 text-sm font-semibold hover:bg-paper focus-visible:outline-2 focus-visible:outline-cu"
          >
            <FileSpreadsheet aria-hidden="true" className="size-4" />
            Exportar a Excel
          </Link>
          <BotonActualizar />
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-hair bg-white px-4 py-2.5">
        <Selector nombre="Período" actual={dias} href={(d) => panelCon({ dias: d })} opciones={PERIODOS.map((d) => ({ valor: d, texto: `${d} días` }))} />
        <Selector
          nombre="Turno"
          actual={filtro.turno}
          href={(t) => panelCon({ turno: t })}
          opciones={[
            { valor: "", texto: "Todos" },
            { valor: "A", texto: "A" },
            { valor: "B", texto: "B" },
          ]}
        />
        <Selector
          nombre="Área"
          actual={filtro.zona}
          href={(z) => panelCon({ zona: z })}
          opciones={[{ valor: "" as FiltroPanel["zona"], texto: "Todas" }, ...ZONAS.filter((z) => z.id !== "otras").map((z) => ({ valor: z.id as FiltroPanel["zona"], texto: z.nombre }))]}
        />
        {filtrado || dias !== FILTRO_PANEL_INICIAL.dias ? (
          <Link href={`${base}/panel`} scroll={false} className={`${enlace} ml-auto text-sm`}>
            Quitar filtros
          </Link>
        ) : null}
      </div>

      <section aria-label="Indicadores principales" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Indicador
          href={bandeja("estado=pendientes")}
          icono={ClipboardCheck}
          titulo={tituloPorFirmar}
          valor={String(p.porFirmar)}
          detalle={detallePorFirmar}
          aviso={p.atrasadas > 0 ? `${p.atrasadas} con más de ${DIAS_ATRASO} días` : undefined}
        />
        <Indicador
          href={bandeja("estado=todas")}
          icono={Inbox}
          titulo="Recibidas · 7 días"
          valor={String(p.recibidas7)}
          detalle={
            diferencia === 0
              ? `Igual que los 7 días previos (${p.recibidas7Previas})`
              : `${diferencia > 0 ? "▲" : "▼"} ${Math.abs(diferencia)} ${diferencia > 0 ? "más" : "menos"} que los 7 días previos (${p.recibidas7Previas})`
          }
        >
          <MiniSerie valores={p.ultimos14} />
        </Indicador>
        <Indicador
          href={fallas}
          icono={TriangleAlert}
          titulo="Hallazgos sin seguimiento"
          valor={String(p.hallazgosPendientes)}
          detalle={`${plural(p.hallazgosGestionados, "ya gestionado", "ya gestionados")} (aviso SAP o canalizado)`}
          aviso={criticosYAltos > 0 ? plural(criticosYAltos, "crítico o alto", "críticos o altos") : undefined}
        />
        <Indicador
          href={bandeja("estado=aprobadas")}
          icono={CircleCheck}
          titulo={`Aprobadas · ${dias} días`}
          valor={String(p.aprobadas)}
          detalle={
            p.horasHastaAprobar === null
              ? "Sin aprobaciones en el período"
              : `${textoDuracion(p.horasHastaAprobar)} en promedio desde el envío hasta la aprobación`
          }
          aviso={p.rechazadas > 0 ? plural(p.rechazadas, "rechazada", "rechazadas") : undefined}
        />
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className={`${tarjeta} xl:col-span-2`}>
          <Cabecera titulo="Documentos recibidos por día" bajada={`Por fecha de envío · últimos ${dias} días`} href={bandeja("estado=todas")} accion="Ver bandeja" />
          <div className="px-5 pb-5">
            <GraficoRecibidas
              serie={p.serie}
              inspecciones={p.inspecciones}
              mantenciones={p.mantenciones}
              hrefDia={(dia) => bandeja(`estado=todas&desde=${dia}&hasta=${dia}`)}
            />
          </div>
        </section>

        <section className={`${tarjeta} flex flex-col`}>
          <Cabecera titulo="Estado de lo recibido" bajada={`${plural(p.recibidas, "documento", "documentos")} · últimos ${dias} días`} />
          <div className="flex flex-1 flex-col p-5">
            {p.recibidas === 0 ? (
              <p className="text-sm text-sub">No se recibieron documentos en el período.</p>
            ) : (
              <BarraPartes
                descripcion={`De ${p.recibidas} documentos: ${p.esperanSupervisor} por firmar supervisor, ${p.esperanProgramador} por firmar programador, ${p.aprobadas} aprobados y ${p.rechazadas} rechazados.`}
                segmentos={[
                  { nombre: "Por firmar supervisor", valor: p.esperanSupervisor, color: COLOR_ESTADO.supervisor },
                  { nombre: "Por firmar programador", valor: p.esperanProgramador, color: COLOR_ESTADO.programador },
                  { nombre: "Aprobadas", valor: p.aprobadas, color: COLOR_ESTADO.aprobadas },
                  { nombre: "Rechazadas", valor: p.rechazadas, color: COLOR_ESTADO.rechazadas },
                ]}
              />
            )}
            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-hair pt-4">
              <div>
                <dt className={etiqueta}>Tasa de aprobación</dt>
                <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums">{porcentaje(p.aprobadas, resueltas)}</dd>
                <dd className="text-xs text-sub">de las {resueltas} ya resueltas</dd>
              </div>
              <div>
                <dt className={etiqueta}>Histórico</dt>
                <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums">{datos.totalHistorico}</dd>
                <dd className="text-xs text-sub">recibidas · {datos.aprobadasHistorico} aprobadas{filtrado ? " (todos los turnos y áreas)" : ""}</dd>
              </div>
            </dl>
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <section className={tarjeta}>
          <Cabecera titulo="Recibidas por área" bajada={`Últimos ${dias} días`} />
          <div className="p-5">
            <BarrasGrupo grupos={p.porArea} vacio="Sin documentos en el período." href={(n) => enPeriodo(`q=${encodeURIComponent(n)}`)} />
            {p.porArea.length > 0 && <LeyendaSeries />}
          </div>
        </section>

        <section className={tarjeta}>
          <Cabecera titulo="Tipos de equipo más revisados" bajada={`Los ${Math.max(p.porEquipo.length, 1)} con más documentos · últimos ${dias} días`} />
          <div className="p-5">
            <BarrasGrupo grupos={p.porEquipo} vacio="Sin documentos en el período." href={(n) => enPeriodo(`q=${encodeURIComponent(n)}`)} />
            {p.porEquipo.length > 0 && <LeyendaSeries />}
          </div>
        </section>

        <section className={`${tarjeta} lg:col-span-2 xl:col-span-1`}>
          <Cabecera titulo="Hallazgos sin seguimiento" bajada="Ítems en «Malo» de inspecciones vigentes" href={fallas} accion="Ver fallas" />
          <div className="p-5">
            {p.hallazgosPendientes === 0 ? (
              <p className="text-sm text-sub">No hay hallazgos pendientes de seguimiento.</p>
            ) : (
              <BarraPartes
                descripcion={`Hallazgos sin seguimiento por severidad: ${SEVERIDADES_ORDENADAS.map((s) => `${p.pendientesPorSeveridad[s]} ${SEVERIDAD_NOMBRE[s].toLowerCase()}`).join(", ")}.`}
                segmentos={SEVERIDADES_ORDENADAS.map((s) => ({ nombre: SEVERIDAD_NOMBRE[s], valor: p.pendientesPorSeveridad[s], color: COLOR_SEVERIDAD[s] }))}
              />
            )}
            {p.equiposPendientes.length > 0 && (
              <>
                <h3 className={`${etiqueta} mt-5 border-t border-hair pt-4`}>Equipos con más pendientes</h3>
                <ul className="mt-2 divide-y divide-hair text-sm">
                  {p.equiposPendientes.map((e) => (
                    <li key={`${e.tag}|${e.area}`} className="flex items-center gap-2.5 py-1.5">
                      <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ background: COLOR_SEVERIDAD[e.severidadMax] }} />
                      <Link href={`${base}?estado=todas&tag=${encodeURIComponent(e.tag)}`} className={`${enlace} min-w-0 truncate font-mono`}>
                        {e.tag || "Sin TAG"}
                      </Link>
                      <span className="min-w-0 flex-1 truncate text-xs text-sub">
                        {e.area} · máx. {SEVERIDAD_NOMBRE[e.severidadMax].toLowerCase()}
                      </span>
                      <span className="font-mono font-semibold tabular-nums">{e.hallazgos}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={tarjeta}>
          <Cabecera titulo={`${tituloPorFirmar} por turno y área`} bajada="Cada cifra abre su carpeta de la bandeja" />
          {p.porFirmar === 0 ? (
            <p className="p-5 text-sm text-sub">Nada pendiente. Todo lo recibido ya tiene su firma en esta etapa.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-paper/70 text-left">
                  <th scope="col" className={`${etiqueta} px-5 py-2`}>Turno</th>
                  <th scope="col" className={`${etiqueta} px-5 py-2`}>Área</th>
                  <th scope="col" className={`${etiqueta} px-5 py-2 text-right`}>{tituloPorFirmar}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hair border-t border-hair">
                {p.turnoZona.map((c) => (
                  <tr key={`${c.turno}|${c.zona}`}>
                    <td className="px-5 py-2.5">{nombreTurno(c.turno)}</td>
                    <td className="px-5 py-2.5">{nombreZona(c.zona)}</td>
                    <td className="px-5 py-2.5 text-right font-mono font-semibold tabular-nums">
                      {c.porFirmar > 0 ? (
                        <Link href={`${base}?estado=pendientes&turno=${encodeURIComponent(c.turno)}&zona=${c.zona}`} className={enlace}>
                          {c.porFirmar}
                        </Link>
                      ) : (
                        <span className="font-normal text-sub">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className={tarjeta}>
          <Cabecera
            titulo="Las que más llevan esperando"
            bajada={`En cobre, las de ${DIAS_ATRASO} días o más`}
            href={bandeja("estado=pendientes")}
            accion="Ver todas"
          />
          {p.antiguas.length === 0 ? (
            <p className="p-5 text-sm text-sub">No hay inspecciones esperando firma.</p>
          ) : (
            <ul className="divide-y divide-hair">
              {p.antiguas.map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                  <span className="min-w-0 flex-1">
                    <Link href={`${base}/${a.id}`} className={`${enlace} font-mono`}>
                      {a.folio ?? "Sin folio"}
                    </Link>
                    <span className="block truncate text-xs text-sub">
                      <span className="font-mono text-graf">{a.equipmentTag || "Sin TAG"}</span> · {a.equipo} · {a.area}
                      {a.turno ? ` · Turno ${a.turno}` : ""}
                    </span>
                  </span>
                  <span
                    title={a.submittedAt ? `Enviada el ${formatFechaHora(a.submittedAt)}` : undefined}
                    className={`shrink-0 rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold ${
                      a.dias >= DIAS_ATRASO ? "bg-cu-soft text-[#7a3d12]" : "bg-paper text-sub"
                    }`}
                  >
                    {a.dias === 0 ? "Hoy" : plural(a.dias, "día", "días")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {rol === "admin" && (
        <section aria-label="Administración" className="space-y-3">
          <h2 className={etiqueta}>Administración</h2>
          <BloqueAdministracion />
        </section>
      )}
    </div>
  );
}
