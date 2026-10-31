import { requireRole } from "@/lib/auth/session";
import { StaffShell } from "@/components/shared/staff-shell";

/** Área del administrador: gestiona usuarios (rol y turno) y ve todo. No firma ni llena formularios. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("admin");
  return (
    <StaffShell
      session={session}
      nav={[
        { href: "/admin", label: "Inspecciones" },
        { href: "/admin/fallas", label: "Equipos con fallas" },
        { href: "/admin/usuarios", label: "Usuarios" },
      ]}
    >
      {children}
    </StaffShell>
  );
}
