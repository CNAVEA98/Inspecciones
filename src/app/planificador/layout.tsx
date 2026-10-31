import { requireRole } from "@/lib/auth/session";
import { StaffShell } from "@/components/shared/staff-shell";

/** Área del planificador: firma la segunda etapa y descarga los formatos firmados. */
export default async function PlanificadorLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("planner");
  return (
    <StaffShell session={session} nav={[
        { href: "/planificador", label: "Bandeja" },
        { href: "/planificador/fallas", label: "Equipos con fallas" },
      ]}>
      {children}
    </StaffShell>
  );
}
