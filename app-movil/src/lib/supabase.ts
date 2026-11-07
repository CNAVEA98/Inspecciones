import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import Storage from "expo-sqlite/kv-store";
import { AppState } from "react-native";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const CLAVE_ANON = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/** Sitio publicado por defecto: se usa si `EXPO_PUBLIC_WEB_URL` no está en `.env` (Expo solo lee el `.env` al arrancar). */
const WEB_URL_POR_DEFECTO = "https://inspecciones-bbosch.vercel.app";

/** Dirección del sitio web que genera los PDF oficiales y publica Privacidad y Condiciones (sin barra final). */
export const WEB_URL = (process.env.EXPO_PUBLIC_WEB_URL || WEB_URL_POR_DEFECTO).replace(/\/+$/, "");

/** False si falta `app-movil/.env` (lo crea Cristóbal; no se versiona). La app debe avisarlo en pantalla. */
export const supabaseConfigurado = Boolean(SUPABASE_URL && CLAVE_ANON);

let cliente: SupabaseClient | null = null;

/**
 * Cliente único. La sesión se guarda en el teléfono (kv-store de SQLite) para que el técnico siga ingresado
 * sin señal; se renueva sola al reconectar.
 */
export function getSupabase(): SupabaseClient {
  if (!SUPABASE_URL || !CLAVE_ANON) {
    throw new Error("Falta configurar EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY en app-movil/.env");
  }
  if (cliente) return cliente;
  cliente = createClient(SUPABASE_URL, CLAVE_ANON, {
    auth: {
      storage: Storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  // Recomendación de Supabase para React Native: renovar el token solo con la app en primer plano (en segundo plano el
  // temporizador no es fiable y genera errores de red al volver).
  const auth = cliente.auth;
  AppState.addEventListener("change", (estado) => {
    if (estado === "active") void auth.startAutoRefresh();
    else void auth.stopAutoRefresh();
  });
  return cliente;
}
