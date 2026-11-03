import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseEnv } from "@/lib/env";

type CookieRefrescada = { name: string; value: string; options: Parameters<NextResponse["cookies"]["set"]>[2] };

/**
 * Refresca la sesión de Supabase y devuelve el usuario verificado.
 * `getClaims()` valida la firma del JWT: con claves asimétricas lo hace en el servidor, sin ir a Supabase Auth;
 * con clave simétrica consulta Auth igual que `getUser()`. Si el token está por vencer, primero lo renueva.
 */
export async function updateSession(request: NextRequest) {
  const refrescadas: CookieRefrescada[] = [];
  const { url, anonKey } = supabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        // La petición sigue con las cookies nuevas (el servidor las lee) y la respuesta se las entrega al navegador.
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        refrescadas.push(...toSet);
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const user = claims?.sub ? { id: claims.sub, email: typeof claims.email === "string" ? claims.email : "" } : null;

  /** Copia las cookies renovadas a una respuesta (también a las redirecciones). */
  const conCookies = <T extends NextResponse>(res: T): T => {
    refrescadas.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
    return res;
  };

  /** Deja pasar la petición con las cabeceras dadas (las de la petición, ya con las cookies renovadas). */
  const seguir = (headers: Headers) => conCookies(NextResponse.next({ request: { headers } }));

  return { supabase, user, seguir, conCookies };
}
