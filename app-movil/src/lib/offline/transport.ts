// Port de src/lib/offline/transport.ts de la web (2026-11-07). Diferencia: la foto se lee desde su archivo local.
import type { SupabaseClient } from "@supabase/supabase-js";
import { File } from "expo-file-system";
import type { PhotoRecord, SubmitPayload } from "./db";
import { aTransportError } from "./errores";
import { TransportError, type SubmitResult, type Transport } from "./outbox";

const PHOTO_BUCKET = "inspection-photos";

/** Implementación real: Storage para fotos y la RPC transaccional submit_inspection. */
export function createSupabaseTransport(supabase: SupabaseClient): Transport {
  return {
    async uploadPhoto(photo: PhotoRecord) {
      try {
        const bytes = await new File(photo.uri).arrayBuffer();
        const { error } = await supabase.storage
          .from(PHOTO_BUCKET)
          .upload(photo.storagePath, bytes, { contentType: photo.mime, upsert: true });
        if (error) throw aTransportError(error);
      } catch (e) {
        if (e instanceof TransportError) throw e;
        throw aTransportError(e);
      }
    },

    async submit(payload: SubmitPayload): Promise<SubmitResult> {
      try {
        const { data, error } = await supabase.rpc("submit_inspection", { p: payload });
        if (error) throw aTransportError(error);
        return data as SubmitResult;
      } catch (e) {
        if (e instanceof TransportError) throw e;
        throw aTransportError(e);
      }
    },
  };
}
