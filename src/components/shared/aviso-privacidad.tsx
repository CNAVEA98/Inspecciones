"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { enReposo } from "@/lib/offline/reposo";
import { VERSION_AVISO_PRIVACIDAD } from "@/lib/version";

const CLAVE_LOCAL = "mlp-aviso-privacidad";

function leidoEnEsteEquipo(userId: string): boolean {
  try {
    return localStorage.getItem(CLAVE_LOCAL) === `${userId}:${VERSION_AVISO_PRIVACIDAD}`;
  } catch {
    return false;
  }
}

function marcarEnEsteEquipo(userId: string) {
  try {
    localStorage.setItem(CLAVE_LOCAL, `${userId}:${VERSION_AVISO_PRIVACIDAD}`);
  } catch {
    // sin almacenamiento local: se volverá a consultar al servidor
  }
}

/**
 * Aviso de privacidad al primer ingreso (y cuando cambia su versión). Informa, no pide consentimiento: el único botón es
 * «Entendido», que registra en el perfil la versión y la fecha (`registrar_aviso_privacidad`, migración 0020).
 * Nunca bloquea el trabajo: sin red, o si el servidor falla, no se muestra; se consulta cuando el teléfono queda ocioso.
 */
export function AvisoPrivacidad({ userId }: { userId: string }) {
  const [visible, setVisible] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const boton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (leidoEnEsteEquipo(userId)) return;
    let vivo = true;
    const cancelar = enReposo(async () => {
      if (!navigator.onLine) return;
      const { data, error: e } = await createClient()
        .from("profiles")
        .select("aviso_privacidad_version")
        .eq("id", userId)
        .maybeSingle();
      if (!vivo || e || !data) return; // p. ej. migración 0020 aún sin aplicar: no se molesta al usuario
      if (data.aviso_privacidad_version === VERSION_AVISO_PRIVACIDAD) marcarEnEsteEquipo(userId);
      else setVisible(true);
    });
    return () => {
      vivo = false;
      cancelar();
    };
  }, [userId]);

  useEffect(() => {
    if (visible) boton.current?.focus();
  }, [visible]);

  if (!visible) return null;

  const entendido = async () => {
    setGuardando(true);
    setError(null);
    const { error: e } = await createClient().rpc("registrar_aviso_privacidad", { p_version: VERSION_AVISO_PRIVACIDAD });
    setGuardando(false);
    if (e) {
      setError("No se pudo registrar. Revise la conexión e intente de nuevo.");
      return;
    }
    marcarEnEsteEquipo(userId);
    setVisible(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-graf/60 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="aviso-privacidad-titulo"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        <h2 id="aviso-privacidad-titulo" className="text-xl font-bold">
          Uso de sus datos en la aplicación
        </h2>
        <ul className="mt-3 ml-5 list-disc space-y-1 text-base">
          <li>Se guardan su nombre, rol y turno, lo que registre en las inspecciones, sus fotos y su firma.</li>
          <li>Se usan solo para el registro, la revisión y los informes de mantenimiento de Bbosch para MLP.</li>
          <li>Se guardan en Supabase y Vercel (servidores en Brasil). No hay publicidad ni seguimiento.</li>
          <li>A las fotos se les quita la ubicación GPS antes de subirlas.</li>
        </ul>
        <p className="mt-3 text-base">
          Detalle completo en{" "}
          <Link href="/privacidad" className="font-semibold text-cu underline underline-offset-2">
            Privacidad y uso de datos
          </Link>{" "}
          y{" "}
          <Link href="/condiciones" className="font-semibold text-cu underline underline-offset-2">
            Condiciones de uso
          </Link>
          .
        </p>
        {error ? (
          <p role="alert" className="mt-3 text-sm font-medium text-bad">
            {error}
          </p>
        ) : null}
        <button
          ref={boton}
          type="button"
          onClick={() => void entendido()}
          disabled={guardando}
          className="mt-5 inline-flex min-h-14 w-full items-center justify-center rounded-xl bg-graf px-6 text-lg font-semibold text-white hover:bg-graf-2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cu disabled:opacity-60"
        >
          {guardando ? "Guardando…" : "Entendido"}
        </button>
      </div>
    </div>
  );
}
