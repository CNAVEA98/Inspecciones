// Envío de la cola con la app cerrada (Android: WorkManager; iOS: BGTaskScheduler). Solo funciona en un build propio (APK / TestFlight):
// Expo Go no lo permite, y ahí el registro falla en silencio (la app sigue enviando al abrirse y al volver la señal).
// `defineTask` tiene que ejecutarse en el ámbito global al cargar la app: por eso este archivo se importa en `index.js` (la entrada), no solo en `_layout.tsx`.
import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { getSupabase, supabaseConfigurado } from "@/lib/supabase";
import { AlmacenSqlite } from "./almacen-sqlite";
import { ejecutarEnvio } from "./envio-segundo-plano";
import { createSupabaseTransport } from "./transport";

export const TAREA_ENVIO = "envio-inspecciones-pendientes";

TaskManager.defineTask(TAREA_ENVIO, async () => {
  if (!supabaseConfigurado) return BackgroundTask.BackgroundTaskResult.Failed;
  try {
    const almacen = await AlmacenSqlite.abrir();
    const resultado = await ejecutarEnvio(almacen, createSupabaseTransport(getSupabase()));
    return resultado === "exito" ? BackgroundTask.BackgroundTaskResult.Success : BackgroundTask.BackgroundTaskResult.Failed;
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

/** Pide al sistema que despierte la app cada ~15 min (el sistema decide el momento real) para enviar lo pendiente. Idempotente. */
export async function registrarEnvioSegundoPlano(): Promise<void> {
  try {
    if ((await BackgroundTask.getStatusAsync()) !== BackgroundTask.BackgroundTaskStatus.Available) return;
    if (await TaskManager.isTaskRegisteredAsync(TAREA_ENVIO)) return;
    await BackgroundTask.registerTaskAsync(TAREA_ENVIO, { minimumInterval: 15 });
  } catch {
    // Expo Go u otro entorno sin soporte: se ignora; el envío sigue ocurriendo con la app abierta.
  }
}
