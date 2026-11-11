"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { pestanaActiva, type NavItem } from "@/lib/nav";

/** Pestañas del encabezado del personal; marca en cuál se está. */
export function NavPrincipal({ nav }: { nav: NavItem[] }) {
  const activa = pestanaActiva(usePathname(), nav);
  return (
    <nav aria-label="Principal" className="flex flex-wrap gap-1">
      {nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.href === activa ? "page" : undefined}
          className={`rounded-lg px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-cu ${
            item.href === activa ? "bg-graf-2 text-white shadow-[inset_0_-2px_0_var(--color-cu)]" : "text-[#c9d0d6] hover:bg-graf-2 hover:text-white"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
