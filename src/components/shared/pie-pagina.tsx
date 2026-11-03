"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { VERSION_ETIQUETA } from "@/lib/version";

/**
 * Pie de página común: titular, uso autorizado, enlaces a Privacidad y Condiciones de uso, y la versión de la app
 * (referencia para reportar problemas). En el formulario del técnico deja espacio para la barra fija inferior.
 */
export function PiePagina({ oscuro = false }: { oscuro?: boolean }) {
  const pathname = usePathname();
  const conBarraFija = /^\/tecnico\/inspeccion\//.test(pathname ?? "");
  const color = oscuro ? "text-[#9aa4ad]" : "text-sub";
  const enlace = `underline underline-offset-2 hover:text-cu focus-visible:outline-2 focus-visible:outline-cu ${oscuro ? "text-[#c9d0d6]" : "text-graf"}`;
  return (
    <footer className={`px-5 pt-4 text-xs ${color} ${conBarraFija ? "pb-28" : "pb-5"}`}>
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
        <span>© 2026 Bbosch · Uso exclusivo del personal autorizado de Bbosch y MLP</span>
        <span aria-hidden>·</span>
        <Link href="/privacidad" className={enlace}>
          Privacidad
        </Link>
        <span aria-hidden>·</span>
        <Link href="/condiciones" className={enlace}>
          Condiciones de uso
        </Link>
        <span aria-hidden>·</span>
        <span className="font-mono" title="Versión de la aplicación">
          {VERSION_ETIQUETA}
        </span>
      </div>
    </footer>
  );
}
