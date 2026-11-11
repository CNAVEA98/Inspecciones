export interface NavItem {
  href: string;
  label: string;
}

/**
 * Pestaña activa: la de ruta más larga que contiene a la actual. Así «/supervisor/fallas» marca «Fallas» y el detalle
 * «/supervisor/<id>» marca «Bandeja» (cuya ruta es «/supervisor»).
 */
export function pestanaActiva(pathname: string, nav: NavItem[]): string | null {
  let mejor: string | null = null;
  for (const { href } of nav) {
    if ((pathname === href || pathname.startsWith(`${href}/`)) && (!mejor || href.length > mejor.length)) mejor = href;
  }
  return mejor;
}
