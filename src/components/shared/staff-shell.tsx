import Link from "next/link";
import type { SessionProfile } from "@/lib/auth/session";
import { roleWithShift } from "@/lib/auth/roles";
import { SignOutButton } from "./sign-out-button";

interface NavItem {
  href: string;
  label: string;
}

/** Marco común del personal de escritorio (administrador, supervisor, planificador). */
export function StaffShell({
  session,
  nav,
  children,
}: {
  session: SessionProfile;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  const link =
    "rounded-lg px-3 py-2 text-sm font-semibold text-[#c9d0d6] hover:bg-graf-2 hover:text-white focus-visible:outline-2 focus-visible:outline-cu";
  return (
    <div className="min-h-[100dvh]">
      <header className="flex flex-wrap items-center gap-x-6 gap-y-2 bg-graf px-6 py-3 text-white">
        <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#9aa4ad]">Inspecciones MLP</span>
        <nav aria-label="Principal" className="flex gap-1">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={link}>
              {item.label}
            </Link>
          ))}
        </nav>
        <span className="ml-auto text-right text-sm text-[#c9d0d6]">
          {session.fullName}
          <span className="block font-mono text-xs uppercase tracking-[0.08em] text-[#9aa4ad]">
            {roleWithShift(session.role, session.shift)}
          </span>
        </span>
        <SignOutButton className="min-h-9 !px-3 text-sm text-white" />
      </header>
      <main className="mx-auto w-full max-w-[1400px] px-6 py-6">{children}</main>
    </div>
  );
}
