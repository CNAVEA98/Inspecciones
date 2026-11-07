// Port de src/lib/offline/transport.ts de la web (2026-11-07). Diferencia: la foto se lee desde su archivo local.
import type { SupabaseClient } from "@supabase/supabase-js";
import { File } from "expo-file-system";
import type { PhotoRecord, SubmitPayload } from "./db";
import { TransportError, type SubmitResult, type Transport } from "./outbox";

const PHOTO_BUCKET = "inspection-photos";

interface PostgrestLike {
  code?: string;
  message: string;
  status?: number;
}

/** Errores que no mejoran reintentando: datos inválidos o sin permiso. El resto se reintenta. */
function toTransportError(e: PostgrestLike): TransportError {
  const code = e.code ?? "";
  const permanent =
    code === "42501" || // sin permiso / transición no permitida
    code.startsWith("22") || // datos inválidos
    code.startsWith("23") || // violación de restricción
    code === "P0001"; // RAISE EXCEPTION de las reglas del servidor
  return new TransportError(e.message, !permanent);
}

/** Implementación real: Storage para fotos y la RPC transaccional submit_inspection. */
export function createSupabaseTransport(supabase: SupabaseClient): Transport {
  return {
    async uploadPhoto(photo: PhotoRecord) {
      try {
        const bytes = await new File(photo.uri).arrayBuffer();
        const { error } = await supabase.storage
          .from(PHOTO_BUCKET)
          .upload(photo.storagePath, bytes, { contentType: photo.mime, upsert: true });
        if (error) throw toTransportError(error as PostgrestLike);
      } catch (e) {
        if (e instanceof TransportError) throw e;
        throw new TransportError(e instanceof Error ? e.message : "Sin conexión", true);
      }
    },

    async submit(payload: SubmitPayload): Promise<SubmitResult> {
      try {
        const { data, error } = await supabase.rpc("submit_inspection", { p: payload });
        if (error) throw toTransportError(error as PostgrestLike);
        return data as SubmitResult;
      } catch (e) {
        if (e instanceof TransportError) throw e;
        throw new TransportError(e instanceof Error ? e.message : "Sin conexión", true);
      }
    },
  };
}
