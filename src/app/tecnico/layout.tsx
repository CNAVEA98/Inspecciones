import Image from "next/image";
import { requireRole } from "@/lib/auth/session";
import { roleWithShift } from "@/lib/auth/roles";
import { SignOutButton } from "@/components/shared/sign-out-button";
import { TecnicoProvider } from "@/components/tecnico/tecnico-provider";
import { SyncIndicator } from "@/components/tecnico/sync-indicator";

/** Área del técnico: mobile-first, objetivos táctiles grandes, funciona con y sin red. */
export default async function TecnicoLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("technician");
  return (
    <TecnicoProvider userId={session.id}>
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-xl flex-col">
        <header className="rounded-b-3xl border-b-[3px] border-cu bg-graf px-5 pb-5 pt-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <Image src="/brand/bbosch-logo-solo.png" alt="BBOSCH" width={1304} height={319} priority className="h-7 w-auto" />
            <SignOutButton className="text-white" />
          </div>
          <div className="mt-5 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase tracking-[0.1em] text-[#9aa4ad]">Bienvenido</p>
              <p className="truncate text-2xl font-bold tracking-tight">{roleWithShift("technician", session.shift)}</p>
            </div>
            <div className="shrink-0">
              <SyncIndicator />
            </div>
          </div>
        </header>
        <main className="flex-1 px-5 py-6">{children}</main>
      </div>
    </TecnicoProvider>
  );
}
