import { requireRole } from "@/lib/auth/session";
import { StaffShell } from "@/components/shared/staff-shell";

/** Área del supervisor: ve las inspecciones y firma la primera etapa. Desktop-first. */
export default async function SupervisorLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("supervisor");
  return (
    <StaffShell session={session} nav={[
        { href: "/supervisor", label: "Bandeja" },
        { href: "/supervisor/fallas", label: "Equipos con fallas" },
      ]}>
      {children}
    </StaffShell>
  );
}
