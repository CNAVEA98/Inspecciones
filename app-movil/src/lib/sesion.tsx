import type { Session } from "@supabase/supabase-js";
import Storage from "expo-sqlite/kv-store";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAlmacen } from "@/lib/almacen-contexto";
import { usuarioAEmail } from "@/lib/auth/usuario";
import { redNativa } from "@/lib/offline/red";
import { borrarCopias } from "@/lib/revision/cache";
import { getSupabase, supabaseConfigurado } from "@/lib/supabase";

export type Rol = "admin" | "supervisor" | "planner" | "technician";
export type Turno = "A" | "B";

const ROL_TEXTO: Record<Rol, string> = {
  admin: "Administrador",
  supervisor: "Supervisor",
  planner: "Programador",
  technician: "Técnico",
};

export interface Perfil {
  userId: string;
  nombre: string;
  rol: Rol;
  turno: Turno | null;
}

/** «Técnico · Turno A» (igual que la web). */
export const rolConTurno = (p: Pick<Perfil, "rol" | "turno">) =>
  p.turno ? `${ROL_TEXTO[p.rol]} · Turno ${p.turno}` : ROL_TEXTO[p.rol];

type Estado = "cargando" | "sin_sesion" | "lista";

interface Ctx {
  estado: Estado;
  perfil: Perfil | null;
  /** Mensaje para la pantalla de ingreso (falta configuración, rol no permitido…). */
  aviso: string | null;
  ingresar: (usuario: string, clave: string) => Promise<string | null>;
  salir: () => Promise<void>;
}

const SesionContext = createContext<Ctx | null>(null);

export function useSesion(): Ctx {
  const ctx = useContext(SesionContext);
  if (!ctx) throw new Error("useSesion debe usarse dentro de SesionProvider");
  return ctx;
}

const claveCachePerfil = (userId: string) => `perfil:${userId}`;

/**
 * Espera una promesa como máximo `ms`; si no responde, devuelve null. Sin señal, `getSession()` con el token vencido intenta
 * renovarlo y reintenta ~40 s antes de rendirse (medido en el emulador el 2026-11-09): la app quedaba cargando todo ese rato.
 */
export const LIMITE_ARRANQUE_MS = 4000;
function conLimite<T>(promesa: Promise<T>, ms = LIMITE_ARRANQUE_MS): Promise<T | null> {
  return new Promise((resolver) => {
    const reloj = setTimeout(() => resolver(null), ms);
    promesa.then(
      (v) => {
        clearTimeout(reloj);
        resolver(v);
      },
      () => {
        clearTimeout(reloj);
        resolver(null);
      },
    );
  });
}

/**
 * Sin señal `getSession()` puede no devolver nada si el token de acceso venció (no puede renovarlo). La sesión sigue
 * guardada en el teléfono: se lee de ahí para que el técnico pueda trabajar; los envíos reintentan hasta renovarla.
 */
async function sesionGuardada(): Promise<string | null> {
  try {
    for (const k of await Storage.getAllKeysAsync()) {
      if (!k.includes("auth-token")) continue;
      const raw = await Storage.getItemAsync(k);
      const id = raw ? (JSON.parse(raw) as { user?: { id?: string } }).user?.id : undefined;
      if (id) return id;
    }
  } catch {
    // sin sesión guardada
  }
  return null;
}

export function SesionProvider({ children }: { children: ReactNode }) {
  const almacen = useAlmacen();
  const [estado, setEstado] = useState<Estado>("cargando");
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [aviso, setAviso] = useState<string | null>(
    supabaseConfigurado ? null : "Falta configurar la conexión (app-movil/.env). Avise a quien instala la app.",
  );

  /** Perfil del usuario: con señal se actualiza la copia local; sin señal se usa la última. */
  const cargarPerfil = useCallback(
    async (userId: string, intentarRed = true): Promise<Perfil | null> => {
      const cache = (await almacen.leerCatalogo(claveCachePerfil(userId)))?.value as Perfil | undefined;
      if (intentarRed && redNativa.enLinea()) {
        try {
          const r = await conLimite(
            Promise.resolve(getSupabase().from("profiles").select("full_name, role, shift").eq("id", userId).single()),
          );
          const data = r?.data;
          if (r && !r.error && data) {
            const p: Perfil = {
              userId,
              nombre: (data.full_name as string | null) ?? "",
              rol: (data.role as Rol | null) ?? "technician",
              turno: (data.shift as Turno | null) ?? null,
            };
            await almacen.guardarCatalogo({ key: claveCachePerfil(userId), value: p, updatedAt: Date.now() });
            return p;
          }
        } catch {
          // se usa la copia local
        }
      }
      return cache ?? null;
    },
    [almacen],
  );

  const aplicar = useCallback(
    async (userId: string | null, intentarRed = true) => {
      if (!userId) {
        setPerfil(null);
        setEstado("sin_sesion");
        return;
      }
      // Sin copia ni red se asume técnico (el servidor valida cada envío y cada lectura con RLS). Técnico, supervisor, programador
      // y administrador entran a la app: el técnico a su inspección y los demás a la revisión (ver `app/revision`).
      const p = (await cargarPerfil(userId, intentarRed)) ?? { userId, nombre: "", rol: "technician" as Rol, turno: null };
      setAviso(null);
      setPerfil(p);
      setEstado("lista");
    },
    [cargarPerfil],
  );

  useEffect(() => {
    if (!supabaseConfigurado) {
      setEstado("sin_sesion");
      return;
    }
    let vivo = true;
    const supabase = getSupabase();
    void (async () => {
      // Con límite de tiempo: sin señal y con el token vencido, se sigue con la sesión guardada en el teléfono.
      const r = await conLimite(supabase.auth.getSession());
      const sesion: Session | null = r?.data.session ?? null;
      const userId = sesion?.user.id ?? (await sesionGuardada());
      // Si la sesión no respondió a tiempo no hay red útil: el perfil sale de la copia local, sin otra espera.
      if (vivo) await aplicar(userId, r !== null);
    })();
    const { data } = supabase.auth.onAuthStateChange((evento, s) => {
      if (evento === "SIGNED_OUT") void aplicar(null);
      else if (evento === "SIGNED_IN" && s) void aplicar(s.user.id);
    });
    return () => {
      vivo = false;
      data.subscription.unsubscribe();
    };
  }, [aplicar]);

  const ingresar = useCallback(async (usuario: string, clave: string): Promise<string | null> => {
    if (!supabaseConfigurado) return "Falta configurar la conexión (app-movil/.env).";
    if (!usuario.trim()) return "Ingrese su usuario";
    if (clave.length < 8) return "La contraseña debe tener al menos 8 caracteres";
    const email = usuarioAEmail(usuario);
    if (!email) return "Usuario o contraseña incorrectos";
    if (!redNativa.enLinea()) return "Para ingresar por primera vez necesita señal.";
    try {
      const { error } = await getSupabase().auth.signInWithPassword({ email, password: clave });
      return error ? "Usuario o contraseña incorrectos" : null;
    } catch {
      return "No se pudo conectar. Revise su señal e intente de nuevo.";
    }
  }, []);

  const salir = useCallback(async () => {
    // `local`: cierra la sesión del teléfono sin necesitar señal. Los borradores y la cola se conservan.
    await getSupabase().auth.signOut({ scope: "local" });
    // Las copias de revisión (bandeja, detalles, fallas) no deben quedar a la vista de la próxima cuenta.
    await borrarCopias(Storage);
    setPerfil(null);
    setEstado("sin_sesion");
  }, []);

  const valor = useMemo(() => ({ estado, perfil, aviso, ingresar, salir }), [estado, perfil, aviso, ingresar, salir]);
  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
}
