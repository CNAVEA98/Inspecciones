import type { SupabaseClient } from "@supabase/supabase-js";
import { useFocusEffect } from "expo-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useAlmacen } from "@/lib/almacen-contexto";
import type { Almacen } from "@/lib/offline/almacen";
import { redNativa } from "@/lib/offline/red";
import { SyncController } from "@/lib/offline/sync";
import { createSupabaseTransport } from "@/lib/offline/transport";
import type { Perfil } from "@/lib/sesion";
import { getSupabase } from "@/lib/supabase";
import { catalogoIncluido, loadCatalog, readCatalogCache, type Catalog, type CatalogoIncluido } from "@/lib/tecnico/catalog";
import { limpiarFotosEnviadas } from "@/lib/tecnico/eliminar";

const REFRESCO_CATALOGO_MS = 10 * 60_000;

/** Copia del catálogo incluida en la app (se carga solo si hace falta: pesa ~0,5 MB). */
const deLaApp = (): Catalog | null =>
  catalogoIncluido(require("@/data/catalogo-incluido.json") as CatalogoIncluido, process.env.EXPO_PUBLIC_SUPABASE_URL);

export interface CatalogState {
  catalog: Catalog | null;
  status: "loading" | "ready" | "error";
  fromCache: boolean;
  /** Se muestra la copia local mientras se intenta descargar la nueva: no hay que avisar todavía. */
  actualizando?: boolean;
  /** Es la copia incluida en la app: el teléfono todavía no descargó el catálogo (primer uso sin señal). */
  incluido?: boolean;
  error?: string;
}

interface Ctx {
  perfil: Perfil;
  userId: string;
  almacen: Almacen;
  supabase: SupabaseClient;
  sync: SyncController;
  catalog: CatalogState;
  /** Fecha (ms) de la última descarga del catálogo; null si nunca se descargó. */
  catalogoEn: number | null;
}

const TecnicoContext = createContext<Ctx | null>(null);

export function useTecnico(): Ctx {
  const ctx = useContext(TecnicoContext);
  if (!ctx) throw new Error("useTecnico debe usarse dentro de TecnicoProvider");
  return ctx;
}

/** Núcleo del técnico con sesión iniciada: sincronización de la cola y catálogo local (equivale a `tecnico-provider` de la web). */
export function TecnicoProvider({ perfil, children }: { perfil: Perfil; children: ReactNode }) {
  const almacen = useAlmacen();
  const [core] = useState(() => {
    const supabase = getSupabase();
    return { supabase, sync: new SyncController(almacen, createSupabaseTransport(supabase), redNativa) };
  });
  const [catalog, setCatalog] = useState<CatalogState>({ catalog: null, status: "loading", fromCache: false });
  const [catalogoEn, setCatalogoEn] = useState<number | null>(null);

  useEffect(() => core.sync.start(), [core]);

  // Libera las fotos de inspecciones enviadas hace más de 14 días (se conservan antes para generar el PDF sin señal).
  useEffect(() => {
    void limpiarFotosEnviadas(almacen, perfil.userId).catch(() => undefined);
  }, [almacen, perfil.userId]);

  useEffect(() => {
    let vivo = true;
    let ultimaDescarga = 0;
    const cargar = async () => {
      // La copia local se muestra al instante: una red lenta no debe bloquear el trabajo en terreno.
      const cache = await readCatalogCache(almacen);
      if (vivo && cache) setCatalog({ catalog: cache, status: "ready", fromCache: true, actualizando: true });
      try {
        const r = await loadCatalog(almacen, core.supabase, redNativa.enLinea(), deLaApp);
        if (!vivo) return;
        if (!r.fromCache) ultimaDescarga = Date.now();
        setCatalog({ catalog: r.catalog, status: "ready", fromCache: r.fromCache, incluido: r.incluido });
        setCatalogoEn((await almacen.leerCatalogo("catalog"))?.updatedAt ?? null);
      } catch (e) {
        if (vivo && cache) setCatalog({ catalog: cache, status: "ready", fromCache: true });
        else if (vivo) {
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
    // Al volver la red (o la app a primer plano) se refresca la copia local del catálogo, a lo más cada 10 minutos:
    // son 60 plantillas y no conviene gastar datos móviles en cada vuelta a primer plano.
    const dejar = redNativa.escuchar(() => {
      if (redNativa.enLinea() && Date.now() - ultimaDescarga > REFRESCO_CATALOGO_MS) void cargar();
    });
    return () => {
      vivo = false;
      dejar();
    };
  }, [almacen, core]);

  return (
    <TecnicoContext.Provider value={{ perfil, userId: perfil.userId, almacen, catalog, catalogoEn, ...core }}>
      {children}
    </TecnicoContext.Provider>
  );
}

/**
 * Ejecuta una consulta al almacén cada vez que la pantalla toma el foco y cada vez que cambia la cola de envío
 * (reemplaza a `useLive` de Dexie en la web). `clave` fuerza una nueva consulta cuando cambia. `cargado` es false
 * hasta la primera respuesta (para mostrar un marcador de carga en vez de «sin inspecciones»).
 */
export function useConsulta<T>(consulta: () => Promise<T>, inicial: T, clave = ""): [valor: T, cargado: boolean] {
  const { sync } = useTecnico();
  const [valor, setValor] = useState<T>(inicial);
  const [cargado, setCargado] = useState(false);
  const consultaRef = useRef(consulta);
  useEffect(() => {
    consultaRef.current = consulta;
  });
  const snapshot = useSyncExternalStore(sync.subscribe, sync.getSnapshot);

  useFocusEffect(
    useCallback(() => {
      let vivo = true;
      void consultaRef.current().then((r) => {
        if (!vivo) return;
        setValor(r);
        setCargado(true);
      });
      return () => {
        vivo = false;
      };
      // `snapshot` y `clave` solo sirven para volver a consultar.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [snapshot, clave]),
  );
  return [valor, cargado];
}
