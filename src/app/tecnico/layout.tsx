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
        <header className="rounded-b-3xl bg-graf px-5 py-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">{roleWithShift("technician", session.shift)}</p>
            </div>
            <SignOutButton className="text-white" />
          </div>
          <div className="mt-3">
            <SyncIndicator />
          </div>
        </header>
        <main className="flex-1 px-5 py-6">{children}</main>
      </div>
    </TecnicoProvider>
  );
}
