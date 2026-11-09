import type { SupabaseClient } from "@supabase/supabase-js";
import Storage from "expo-sqlite/kv-store";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Kv } from "@/lib/revision/cache";
import type { RolRevisor } from "@/lib/revision/estado";
import type { Perfil } from "@/lib/sesion";
import { getSupabase } from "@/lib/supabase";

interface Ctx {
  perfil: Perfil;
  /** Rol con el que se revisa (el técnico no entra a la revisión). */
  rol: RolRevisor;
  supabase: SupabaseClient;
  /** Copia local de bandeja, detalles y fallas para consultar sin señal (ver `lib/revision/cache.ts`). */
  kv: Kv;
}

const RevisionContext = createContext<Ctx | null>(null);

export function useRevision(): Ctx {
  const ctx = useContext(RevisionContext);
  if (!ctx) throw new Error("useRevision debe usarse dentro de RevisionProvider");
  return ctx;
}

/**
 * Contexto de quien revisa (supervisor, programador, administrador). No tiene borradores ni cola: lee con las mismas reglas de
 * acceso (RLS) que la web y guarda una copia de lo último que vio para consultarlo sin señal. Firmar y registrar seguimiento
 * necesitan señal.
 */
export function RevisionProvider({ perfil, children }: { perfil: Perfil; children: ReactNode }) {
  const valor = useMemo<Ctx>(
    () => ({ perfil, rol: perfil.rol === "technician" ? "supervisor" : perfil.rol, supabase: getSupabase(), kv: Storage }),
    [perfil],
  );
  return <RevisionContext.Provider value={valor}>{children}</RevisionContext.Provider>;
}
