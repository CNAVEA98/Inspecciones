import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { homeFor, roleOfPath, type Role } from "@/lib/auth/roles";

/**
 * Chequeo optimista de acceso por rol. La seguridad real está en RLS (Postgres) y en
 * `requireRole()` dentro de cada layout; esto solo evita renderizar áreas ajenas.
 */
export async function proxy(request: NextRequest) {
  const { supabase, user, getResponse } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const redirectTo = (path: string, search?: Record<string, string>) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = search ? new URLSearchParams(search).toString() : "";
    const res = NextResponse.redirect(url);
    // Conserva las cookies de sesión refrescadas.
    getResponse().cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  const areaDe = roleOfPath(pathname);
  const protegida = areaDe !== null;

  if (!user) {
    return protegida ? redirectTo("/login", { next: pathname }) : getResponse();
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = profile?.role as Role | undefined;
  if (!role) return protegida ? redirectTo("/login") : getResponse();

  if (pathname === "/login") return redirectTo(homeFor(role));
  if (areaDe && areaDe !== role) return redirectTo(homeFor(role));

  return getResponse();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
