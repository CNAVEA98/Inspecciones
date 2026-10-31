import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "./login-form";
import { safeNext } from "@/lib/auth/roles";

export const metadata: Metadata = { title: "Ingresar · Inspección Eléctrica Bbosch-MLP" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="grid min-h-[100dvh] bg-paper lg:grid-cols-[1.1fr_1fr]">
      <section className="relative flex flex-col justify-between gap-12 bg-graf px-6 py-8 text-white sm:px-10 lg:px-16 lg:py-14">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-[#9aa4ad]">Inspección Eléctrica Bbosch-MLP</p>

        <div className="max-w-xl">
          <h1 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Cada inspección, firmada y trazable.
          </h1>
          <p className="mt-5 max-w-[48ch] text-lg leading-relaxed text-[#c9d0d6]">
            Complete el formulario en terreno, incluso sin señal, y envíelo cuando vuelva la conexión.
          </p>
        </div>

        {/* Regla de medición decorativa: referencia al instrumento del informe */}
        <div aria-hidden className="hidden lg:block">
          <div className="h-3 w-full max-w-xl bg-[repeating-linear-gradient(90deg,#4a545e_0_1px,transparent_1px_16px)]" />
          <div className="mt-1 h-[3px] w-40 rounded-full bg-cu" />
        </div>
        <div aria-hidden className="h-[3px] w-24 rounded-full bg-cu lg:hidden" />
      </section>

      <section className="flex flex-col items-center justify-center gap-10 px-6 py-12 sm:px-10">
        <Image
          src="/brand/bbosch-logo-solo.png"
          alt="BBOSCH"
          width={1304}
          height={319}
          priority
          className="h-auto w-56 sm:w-64"
        />
        <LoginForm next={safeNext(next) ?? undefined} />
      </section>
    </main>
  );
}
