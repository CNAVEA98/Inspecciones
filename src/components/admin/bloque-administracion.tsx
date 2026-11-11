import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ListaEventos } from "@/components/admin/lista-eventos";
import { leerResumenAdmin } from "@/lib/admin/auditoria-queries";
import { ROLES, ROLE_LABEL, type Role } from "@/lib/auth/roles";
import { hoyIso, inicioDiaChile, sumarDias } from "@/lib/fecha";
import { createClient } from "@/lib/supabase/server";

const tarjeta = "rounded-2xl border border-hair bg-white";
const enlace = "inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-cu underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-cu";
const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

/**
 * Bloque de la pantalla «Inicio» que solo ve el administrador: cuántas cuentas hay por rol y los últimos movimientos
 * delicados de la auditoría (eliminaciones de inspecciones y acciones sobre cuentas).
 */
export async function BloqueAdministracion() {
  const supabase = await createClient();
  const desde = inicioDiaChile(sumarDias(hoyIso(), -6)).toISOString();
  const [perfiles, resumen] = await Promise.all([supabase.from("profiles").select("role").limit(1000), leerResumenAdmin(desde)]);
  if (perfiles.error) throw new Error(`No se pudieron leer las cuentas: ${perfiles.error.message}`);
  const porRol = new Map<Role, number>();
  for (const p of perfiles.data ?? []) porRol.set(p.role as Role, (porRol.get(p.role as Role) ?? 0) + 1);
  const total = perfiles.data?.length ?? 0;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <section className={tarjeta}>
        <div className="flex items-start justify-between gap-3 border-b border-hair px-5 py-3.5">
          <div>
            <h2 className="text-[15px] font-bold tracking-tight">Cuentas</h2>
            <p className="mt-0.5 text-xs text-sub">{plural(total, "cuenta", "cuentas")} en la plataforma</p>
          </div>
          <Link href="/admin/usuarios" className={enlace}>
            Administrar
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
        <dl className="divide-y divide-hair px-5 text-sm">
          {ROLES.map((r) => (
            <div key={r} className="flex items-center justify-between py-2.5">
              <dt>{ROLE_LABEL[r]}</dt>
              <dd className="font-mono font-semibold tabular-nums">{porRol.get(r) ?? 0}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`${tarjeta} lg:col-span-2`}>
        <div className="flex items-start justify-between gap-3 border-b border-hair px-5 py-3.5">
          <div>
            <h2 className="text-[15px] font-bold tracking-tight">Movimientos delicados</h2>
            <p className="mt-0.5 text-xs text-sub">
              Últimos 7 días: {plural(resumen.eliminaciones7, "inspección eliminada", "inspecciones eliminadas")} ·{" "}
              {plural(resumen.cambiosCuentas7, "acción sobre cuentas", "acciones sobre cuentas")}
            </p>
          </div>
          <Link href="/admin/auditoria" className={enlace}>
            Ver auditoría
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
        <ListaEventos eventos={resumen.ultimos} vacio="Sin eliminaciones ni acciones sobre cuentas registradas." />
      </section>
    </div>
  );
}
