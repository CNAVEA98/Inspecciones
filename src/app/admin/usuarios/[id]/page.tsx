import Link from "next/link";
import { notFound } from "next/navigation";
import { FormBloqueo, FormClave, FormDatosCuenta } from "@/components/admin/formularios-cuenta";
import { ListaEventos } from "@/components/admin/lista-eventos";
import { leerActividadCuenta } from "@/lib/admin/auditoria-queries";
import { leerCuenta } from "@/lib/admin/cuentas-servicio";
import { roleWithShift } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { formatFechaHora } from "@/lib/fecha";

export const metadata = { title: "Cuenta · Usuarios · Inspección Eléctrica Bbosch-MLP" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const tarjeta = "rounded-2xl border border-hair bg-white";

function Seccion({ titulo, bajada, children }: { titulo: string; bajada: string; children: React.ReactNode }) {
  return (
    <section className={tarjeta}>
      <div className="border-b border-hair px-5 py-3.5">
        <h2 className="text-[15px] font-bold tracking-tight">{titulo}</h2>
        <p className="mt-0.5 text-xs text-sub">{bajada}</p>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default async function CuentaPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("admin");
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const [leida, actividad] = await Promise.all([leerCuenta(id), leerActividadCuenta(id)]);
  if (!leida) notFound();
  const { cuenta: c, conServicio } = leida;
  const propia = c.id === session.id;
  const nombreUsuario = c.usuario || c.fullName;

  return (
    <div className="space-y-5">
      <header>
        <Link href="/admin/usuarios" className="text-sm font-semibold text-cu underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-cu">
          ← Usuarios
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-2xl font-bold tracking-tight">{nombreUsuario}</h1>
          {c.bloqueada ? (
            <span className="rounded-full bg-[#fdecec] px-2.5 py-0.5 text-xs font-semibold text-[#7a0000]">Bloqueada</span>
          ) : (
            <span className="rounded-full bg-[#eaf5ee] px-2.5 py-0.5 text-xs font-semibold text-[#14532d]">Activa</span>
          )}
          {propia ? <span className="rounded-full bg-paper px-2.5 py-0.5 text-xs text-sub">Su propia cuenta</span> : null}
        </div>
        <p className="mt-1 text-sm text-sub">
          {c.fullName} · {roleWithShift(c.role, c.shift)}
          {c.createdAt ? ` · creada el ${formatFechaHora(c.createdAt)}` : ""}
          {conServicio ? ` · ${c.ultimoIngreso ? `último ingreso el ${formatFechaHora(c.ultimoIngreso)}` : "nunca ha ingresado"}` : ""}
        </p>
      </header>

      {!conServicio && (
        <p role="status" className="rounded-xl border border-cu/50 bg-cu-soft px-4 py-3 text-sm text-[#7a3d12]">
          El servidor no tiene la clave de servicio (<span className="font-mono">SUPABASE_SERVICE_ROLE_KEY</span>): aquí solo se pueden cambiar el nombre, el rol y el turno.
        </p>
      )}

      <Seccion titulo="Datos, rol y turno" bajada="El nombre es el que aparece como firmante en el PDF. El rol define a qué área entra la cuenta; el cambio vale desde su próxima página.">
        <FormDatosCuenta id={c.id} nombre={c.fullName} rol={c.role} turno={c.shift} propia={propia} />
      </Seccion>

      <div className="grid gap-5 lg:grid-cols-2">
        <Seccion
          titulo="Contraseña"
          bajada={propia ? "Cambia su propia contraseña; su sesión actual sigue abierta." : "Define una contraseña nueva y cierra las sesiones que la persona tenga abiertas."}
        >
          <FormClave id={c.id} habilitado={conServicio} />
        </Seccion>

        <Seccion
          titulo="Acceso"
          bajada={
            c.bloqueada
              ? "La cuenta está bloqueada: no puede ingresar. Sus inspecciones y firmas se conservan."
              : "Bloquear impide el ingreso sin borrar nada: las inspecciones y firmas de la cuenta se conservan. Úselo cuando alguien deja el contrato."
          }
        >
          {propia && !c.bloqueada ? (
            <p className="text-sm text-sub">No puede bloquear su propia cuenta. Si debe dejar de usarla, pídale a otro administrador que la bloquee.</p>
          ) : (
            <FormBloqueo id={c.id} usuario={nombreUsuario} bloqueada={c.bloqueada} habilitado={conServicio} propia={propia} />
          )}
        </Seccion>
      </div>

      <section className={tarjeta}>
        <div className="flex items-start justify-between gap-3 border-b border-hair px-5 py-3.5">
          <div>
            <h2 className="text-[15px] font-bold tracking-tight">Actividad reciente</h2>
            <p className="mt-0.5 text-xs text-sub">Lo último que hizo esta cuenta y los cambios que se le hicieron.</p>
          </div>
          <Link href="/admin/auditoria" className="shrink-0 text-xs font-semibold text-cu underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-cu">
            Ver auditoría
          </Link>
        </div>
        <ListaEventos eventos={actividad} vacio="Esta cuenta todavía no tiene movimientos registrados." />
      </section>
    </div>
  );
}
