import Link from "next/link";
import { CATEGORIA_NOMBRE, type EventoAuditoria } from "@/lib/admin/auditoria";
import { formatFechaHora } from "@/lib/fecha";

/** Movimientos de la auditoría, uno por fila: cuándo, qué, sobre qué y quién. Los delicados llevan la marca en cobre. */
export function ListaEventos({ eventos, vacio }: { eventos: EventoAuditoria[]; vacio: string }) {
  if (eventos.length === 0) return <p className="p-5 text-sm text-sub">{vacio}</p>;
  return (
    <ul className="divide-y divide-hair">
      {eventos.map((e) => (
        <li key={e.id} className="grid gap-x-4 gap-y-0.5 px-5 py-2.5 text-sm sm:grid-cols-[9.5rem_7rem_1fr_auto] sm:items-baseline">
          <time dateTime={e.at} className="font-mono text-xs tabular-nums text-sub">
            {formatFechaHora(e.at)}
          </time>
          <span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${e.sensible ? "bg-cu-soft text-[#7a3d12]" : "bg-paper text-sub"}`}>
              {CATEGORIA_NOMBRE[e.categoria]}
            </span>
          </span>
          <span className="min-w-0">
            {e.href ? (
              <Link href={e.href} className="font-semibold text-graf underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-cu">
                {e.titulo}
              </Link>
            ) : (
              <span className="font-semibold">{e.titulo}</span>
            )}
            {e.detalle ? <span className="text-sub"> · {e.detalle}</span> : null}
          </span>
          <span className="text-xs text-sub sm:text-right">{e.actor}</span>
        </li>
      ))}
    </ul>
  );
}
