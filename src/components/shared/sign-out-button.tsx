"use client";

import { cerrarSesion } from "@/app/login/actions";
import { borrarPaginas } from "@/lib/offline/paginas";

export function SignOutButton({ className = "" }: { className?: string }) {
  return (
    // Las páginas guardadas para uso sin red llevan el nombre del técnico: se borran al salir.
    <form action={cerrarSesion} onSubmit={() => void borrarPaginas()}>
      <button
        type="submit"
        className={
          "min-h-12 rounded-xl border-[1.5px] border-current px-4 text-base font-semibold transition-transform active:scale-[0.98] " +
          className
        }
      >
        Salir
      </button>
    </form>
  );
}
