import Link from "next/link";
import { FormNuevaCuenta } from "@/components/admin/formularios-cuenta";
import { listarCuentas } from "@/lib/admin/cuentas-servicio";
import { ROLES, ROLE_LABEL, roleWithShift } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { formatFechaHora } from "@/lib/fecha";

export const metadata = { title: "Usuarios · Inspección Eléctrica Bbosch-MLP" };

const tarjeta = "rounded-2xl border border-hair bg-white";
const th = "px-5 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-sub";

export default async function UsuariosPage() {
  const session = await requireRole("admin");
  const { cuentas, conServicio } = await listarCuentas();
  const bloqueadas = cuentas.filter((c) => c.bloqueada).length;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Usuarios, roles y turnos</h1>
        <p className="mt-1 max-w-3xl text-sm text-sub">
          Solo el administrador crea cuentas, asigna roles y turnos, cambia contraseñas y bloquea accesos. Cada cambio queda en la{" "}
          <Link href="/admin/auditoria?tipo=cuentas" className="font-semibold text-cu underline-offset-2 hover:underline">
            auditoría
          </Link>
          .
        </p>
      </header>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className={`${tarjeta} px-4 py-3`}>
          <dt className="text-xs text-sub">Cuentas</dt>
          <dd className="font-mono text-2xl font-semibold tabular-nums">{cuentas.length}</dd>
        </div>
        {ROLES.map((r) => (
          <div key={r} className={`${tarjeta} px-4 py-3`}>
            <dt className="text-xs text-sub">{ROLE_LABEL[r]}</dt>
            <dd className="font-mono text-2xl font-semibold tabular-nums">{cuentas.filter((c) => c.role === r).length}</dd>
          </div>
        ))}
        <div className={`${tarjeta} px-4 py-3`}>
          <dt className="text-xs text-sub">Bloqueadas</dt>
          <dd className={`font-mono text-2xl font-semibold tabular-nums ${bloqueadas > 0 ? "text-[#7a0000]" : ""}`}>{conServicio ? bloqueadas : "—"}</dd>
        </div>
      </dl>

      {!conServicio && (
        <p role="status" className="rounded-xl border border-cu/50 bg-cu-soft px-4 py-3 text-sm text-[#7a3d12]">
          El servidor no tiene la clave de servicio (<span className="font-mono">SUPABASE_SERVICE_ROLE_KEY</span>): se pueden cambiar nombres, roles y
          turnos, pero no crear cuentas, cambiar contraseñas, bloquear ni ver el usuario y el último ingreso.
        </p>
      )}

      <section className={`${tarjeta} overflow-x-auto`}>
        <table className="w-full min-w-[640px] text-sm">
          <caption className="sr-only">Cuentas de la plataforma</caption>
          <thead>
            <tr className="border-b border-hair bg-paper/70 text-left">
              <th scope="col" className={th}>Usuario</th>
              <th scope="col" className={th}>Nombre</th>
              <th scope="col" className={th}>Rol y turno</th>
              <th scope="col" className={th}>Último ingreso</th>
              <th scope="col" className={th}>Estado</th>
              <th scope="col" className={th}>
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hair">
            {cuentas.map((c) => (
              <tr key={c.id} className={c.bloqueada ? "bg-paper/60 text-sub" : undefined}>
                <th scope="row" className="px-5 py-3 text-left font-mono font-semibold">
                  {c.usuario || "—"}
                </th>
                <td className="px-5 py-3">
                  {c.fullName}
                  {c.id === session.id ? <span className="ml-2 rounded-full bg-paper px-2 py-0.5 text-xs text-sub">Usted</span> : null}
                </td>
                <td className="px-5 py-3">{roleWithShift(c.role, c.shift)}</td>
                <td className="px-5 py-3 text-sub">{!conServicio ? "—" : c.ultimoIngreso ? formatFechaHora(c.ultimoIngreso) : "Nunca ha ingresado"}</td>
                <td className="px-5 py-3">
                  {c.bloqueada ? (
                    <span className="rounded-full bg-[#fdecec] px-2.5 py-0.5 text-xs font-semibold text-[#7a0000]">Bloqueada</span>
                  ) : (
                    <span className="rounded-full bg-[#eaf5ee] px-2.5 py-0.5 text-xs font-semibold text-[#14532d]">Activa</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/admin/usuarios/${c.id}`}
                    className="inline-flex min-h-9 items-center rounded-lg border border-hair px-3 py-1.5 font-semibold text-graf hover:bg-paper focus-visible:outline-2 focus-visible:outline-cu"
                  >
                    Administrar<span className="sr-only"> la cuenta {c.usuario || c.fullName}</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={tarjeta}>
        <div className="border-b border-hair px-5 py-3.5">
          <h2 className="text-[15px] font-bold tracking-tight">Crear una cuenta</h2>
          <p className="mt-0.5 text-xs text-sub">
            La persona entra con el usuario y la contraseña que usted defina aquí. No se envía ningún correo: entréguele la contraseña en persona.
          </p>
        </div>
        <div className="p-5">
          <FormNuevaCuenta habilitado={conServicio} />
        </div>
      </section>
    </div>
  );
}
