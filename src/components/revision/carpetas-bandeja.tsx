import Link from "next/link";
/** Tarjeta de una carpeta: nombre, qué hay dentro y, si corresponde, una etiqueta de lo que está pendiente. */
export function TarjetaCarpeta({
  href,
  nombre,
  detalle,
  pendiente,
}: {
  href: string;
  nombre: string;
  detalle: string;
  pendiente?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-hair bg-white p-5 transition-colors hover:bg-paper focus-visible:outline-2 focus-visible:outline-cu"
    >
      <span aria-hidden="true" className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-graf text-white">
        <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
        </svg>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xl font-bold tracking-tight">{nombre}</span>
        <span className="mt-1 block font-mono text-xs uppercase tracking-[0.08em] text-sub">
          {detalle}
        </span>
      </span>
      {pendiente ? (
        <span className="shrink-0 rounded-full bg-cu-soft px-3 py-1 text-sm font-semibold text-[#7a3d12]">{pendiente}</span>
      ) : null}
    </Link>
  );
}

export interface Miga {
  texto: string;
  href?: string;
}

/** «Bandeja › Turno A › Chacay-Mina»: el último elemento es la carpeta actual. */
export function MigasCarpeta({ migas }: { migas: Miga[] }) {
  return (
    <nav aria-label="Carpeta actual" className="mb-3 flex flex-wrap items-center gap-2 text-sm">
      {migas.map((m, i) => (
        <span key={m.texto} className="flex items-center gap-2">
          {i > 0 ? <span aria-hidden="true" className="text-sub">›</span> : null}
          {m.href ? (
            <Link href={m.href} className="font-semibold text-cu underline-offset-2 hover:underline">
              {m.texto}
            </Link>
          ) : (
            <span aria-current="page" className="font-semibold">
              {m.texto}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
