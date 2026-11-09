// Entrada de la app. La tarea de envío en segundo plano se define AQUÍ, antes del router: cuando Android despierta la app cerrada
// (WorkManager) solo se ejecuta este archivo, sin dibujar pantallas, así que una tarea definida en `_layout.tsx` no existiría
// («No task registered for key expo-task-manager») y la inspección se quedaría en cola. Detectado en la prueba del 2026-11-09.
import "./src/lib/offline/segundo-plano";
import "expo-router/entry";
