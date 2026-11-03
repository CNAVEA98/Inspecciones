import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { escribirCabeceras, limpiarCabeceras } from "@/lib/auth/cabeceras";
import { homeFor, roleOfPath, type Role, type Shift } from "@/lib/auth/roles";

/**
 * Chequeo optimista de acceso por rol. La seguridad real está en RLS (Postgres) y en
 * `requireRole()` dentro de cada layout; esto solo evita renderizar áreas ajenas.
 *
 * Rendimiento: aquí se valida la sesión y se lee el perfil UNA vez por petición, y la identidad verificada se pasa
 * al servidor en cabeceras internas (`lib/auth/cabeceras`), así `getSession()` no repite esas consultas.
 */
export async function proxy(request: NextRequest) {
  const { supabase, user, seguir, conCookies } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Nunca se confía en cabeceras de sesión que traiga el cliente.
  const cabeceras = new Headers(request.headers);
  limpiarCabeceras(cabeceras);

  const redirectTo = (path: string, search?: Record<string, string>) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = search ? new URLSearchParams(search).toString() : "";
    // Conserva las cookies de sesión refrescadas.
    return conCookies(NextResponse.redirect(url));
  };

  const areaDe = roleOfPath(pathname);
  const protegida = areaDe !== null;

  if (!user) {
    if (pathname === "/") return redirectTo("/login");
    return protegida ? redirectTo("/login", { next: pathname }) : seguir(cabeceras);
  }

  const { data: profile } = await supabase.from("profiles").select("role, shift, full_name").eq("id", user.id).single();
  const role = profile?.role as Role | undefined;
  if (!role) return protegida || pathname === "/" ? redirectTo("/login") : seguir(cabeceras);

  // El icono de la pantalla de inicio abre «/»: se redirige aquí mismo, sin renderizar una página solo para eso.
  if (pathname === "/" || pathname === "/login") return redirectTo(homeFor(role));
  if (areaDe && areaDe !== role) return redirectTo(homeFor(role));

  escribirCabeceras(cabeceras, {
    id: user.id,
    email: user.email,
    fullName: (profile?.full_name as string | null) || user.email || "Usuario",
    role,
    shift: (profile?.shift as Shift | null) ?? null,
  });
  return seguir(cabeceras);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|serwist/|manifest.webmanifest|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
