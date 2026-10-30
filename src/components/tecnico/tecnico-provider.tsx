"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getDb, type MlpDB } from "@/lib/offline/db";
import { createSupabaseTransport } from "@/lib/offline/transport";
import { SyncController } from "@/lib/offline/sync";
import { calentarPaginas } from "@/lib/offline/paginas";
import { loadCatalog, readCatalogCache, type Catalog } from "@/lib/tecnico/catalog";

interface CatalogState {
  catalog: Catalog | null;
  status: "loading" | "ready" | "error";
  fromCache: boolean;
  error?: string;
}

interface Ctx {
  userId: string;
  db: MlpDB;
  supabase: SupabaseClient;
  sync: SyncController;
  catalog: CatalogState;
}

const TecnicoContext = createContext<Ctx | null>(null);

export function useTecnico(): Ctx {
  const ctx = useContext(TecnicoContext);
  if (!ctx) throw new Error("useTecnico debe usarse dentro de TecnicoProvider");
  return ctx;
}

export function TecnicoProvider({ userId, children }: { userId: string; children: React.ReactNode }) {
  const [core] = useState(() => {
    const db = getDb();
    const supabase = createClient();
    return { db, supabase, sync: new SyncController(db, createSupabaseTransport(supabase)) };
  });
  const [catalog, setCatalog] = useState<CatalogState>({ catalog: null, status: "loading", fromCache: false });

  useEffect(() => core.sync.start(), [core]);

  useEffect(() => {
    let vivo = true;
    const cargar = async () => {
      // La copia local se muestra al instante: una red lenta no debe bloquear el trabajo en terreno.
      const cache = await readCatalogCache(core.db);
      if (vivo && cache) setCatalog({ catalog: cache, status: "ready", fromCache: true });
      try {
        const r = await loadCatalog(core.db, core.supabase, navigator.onLine);
        if (vivo) setCatalog({ catalog: r.catalog, status: "ready", fromCache: r.fromCache });
      } catch (e) {
        if (vivo && !cache) {
          setCatalog({
            catalog: null,
            status: "error",
            fromCache: false,
            error: e instanceof Error ? e.message : "Error al cargar el catálogo",
          });
        }
      }
    };
    void cargar();
    // Al volver la red se refresca la copia local del catálogo.
    const onOnline = () => void cargar();
    window.addEventListener("online", onOnline);
    return () => {
      vivo = false;
      window.removeEventListener("online", onOnline);
    };
  }, [core]);

  // Guarda las páginas del técnico para abrir la app sin red (al abrir y al volver la conexión).
  useEffect(() => {
    void calentarPaginas();
    const onOnline = () => void calentarPaginas();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

  return <TecnicoContext.Provider value={{ userId, ...core, catalog }}>{children}</TecnicoContext.Provider>;
}
