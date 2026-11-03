import Link from "next/link";
import { PiePagina } from "./pie-pagina";

/** Marco de las páginas legales (públicas: se pueden leer sin iniciar sesión). */
export function PaginaLegal({
  titulo,
  actualizado,
  children,
}: {
  titulo: string;
  actualizado: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-paper">
      <header className="bg-graf px-5 py-4 text-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#9aa4ad]">Inspección Eléctrica Bbosch-MLP</p>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-xl border-[1.5px] border-white/70 px-4 text-sm font-semibold hover:bg-graf-2 focus-visible:outline-2 focus-visible:outline-cu"
          >
            Volver a la app
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8">
        <h1 className="text-3xl font-bold tracking-tight">{titulo}</h1>
        <p className="mt-2 text-sm text-sub">Última actualización: {actualizado}</p>
        <div className="legal mt-6 flex flex-col gap-4 text-base leading-relaxed">{children}</div>
      </main>
      <PiePagina />
    </div>
  );
}
