import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { ROLES, ROLE_LABEL, SHIFTS, roleWithShift, type Role, type Shift } from "@/lib/auth/roles";
import { actualizarUsuario } from "./actions";

export const metadata = { title: "Usuarios · Inspecciones MLP" };

const campo =
  "rounded-lg border border-hair bg-white px-2 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-cu";

export default async function UsuariosPage() {
  const session = await getSession();
  const supabase = await createClient();
  const { data: perfiles } = await supabase
    .from("profiles")
    .select("id, full_name, role, shift, created_at")
    .order("created_at", { ascending: true });

  return (
    <section className="rounded-2xl border border-hair bg-white">
      <div className="border-b border-hair px-5 py-4">
        <h1 className="text-xl font-bold tracking-tight">Usuarios, roles y turnos</h1>
        <p className="text-sm text-sub">
          Solo un administrador puede asignar roles y turnos. Las cuentas nuevas parten como técnico sin turno.
        </p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left font-mono text-xs uppercase tracking-[0.06em] text-sub">
            <th className="px-5 py-2 font-medium">Nombre</th>
            <th className="px-5 py-2 font-medium">Actual</th>
            <th className="px-5 py-2 font-medium">Asignar</th>
          </tr>
        </thead>
        <tbody>
          {(perfiles ?? []).map((p) => {
            const role = p.role as Role;
            const shift = (p.shift as Shift | null) ?? null;
            const propio = p.id === session?.id;
            return (
              <tr key={p.id} className="border-t border-hair">
                <td className="px-5 py-3 font-medium">{p.full_name || "Sin nombre"}</td>
                <td className="px-5 py-3">{roleWithShift(role, shift)}</td>
                <td className="px-5 py-3">
                  {propio ? (
                    <span className="text-sub">Su propia cuenta</span>
                  ) : (
                    <form action={actualizarUsuario} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="userId" value={p.id} />
                      <select name="role" defaultValue={role} aria-label="Rol" className={campo}>
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABEL[r]}
                          </option>
                        ))}
                      </select>
                      <select name="shift" defaultValue={shift ?? ""} aria-label="Turno" className={campo}>
                        <option value="">Sin turno</option>
                        {SHIFTS.map((s) => (
                          <option key={s} value={s}>
                            Turno {s}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded-lg border border-graf px-3 py-1.5 font-semibold hover:bg-paper focus-visible:outline-2 focus-visible:outline-cu"
                      >
                        Guardar
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
