import type { SupabaseClient } from "@supabase/supabase-js";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { RolRevisor } from "@/lib/revision/estado";
import type { Perfil } from "@/lib/sesion";
import { getSupabase } from "@/lib/supabase";

interface Ctx {
  perfil: Perfil;
  /** Rol con el que se revisa (el técnico no entra a la revisión). */
  rol: RolRevisor;
  supabase: SupabaseClient;
}

const RevisionContext = createContext<Ctx | null>(null);

export function useRevision(): Ctx {
  const ctx = useContext(RevisionContext);
  if (!ctx) throw new Error("useRevision debe usarse dentro de RevisionProvider");
  return ctx;
}

/**
 * Contexto de quien revisa (supervisor, programador, administrador). A diferencia del técnico no tiene base local, cola ni
 * catálogo: solo lee y firma con señal, con las mismas reglas de acceso (RLS) que la web.
 */
export function RevisionProvider({ perfil, children }: { perfil: Perfil; children: ReactNode }) {
  const valor = useMemo<Ctx>(
    () => ({ perfil, rol: perfil.rol === "technician" ? "supervisor" : perfil.rol, supabase: getSupabase() }),
    [perfil],
  );
  return <RevisionContext.Provider value={valor}>{children}</RevisionContext.Provider>;
}
