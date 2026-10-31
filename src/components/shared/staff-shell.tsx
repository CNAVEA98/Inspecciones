import Image from "next/image";
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
        <Link href="/" aria-label="Inspecciones BBOSCH, inicio" className="flex items-center gap-3">
          {/* Pastilla blanca: el logo es gris y naranja y no se lee sobre el grafito. */}
          <span className="rounded-md bg-white px-2 py-1">
            <Image src="/brand/bbosch-logo.png" alt="BBOSCH" width={1115} height={391} priority className="h-7 w-auto" />
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#9aa4ad]">Inspecciones BBOSCH</span>
        </Link>
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
