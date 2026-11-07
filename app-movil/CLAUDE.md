# Instrucciones · App móvil (React Native / Expo)

App nativa del técnico de Inspecciones MLP. Valen también las reglas del `CLAUDE.md` de la raíz del repositorio
(rama nueva, confirmación antes de push/PR, dependencias nuevas solo con autorización, UI en español de Chile).

## Al iniciar cada sesión

1. Leer `BITACORA.md` de esta carpeta: «Estado actual», «Pendientes», «Decisiones» y las 3 últimas entradas del «Registro».
2. Revisar la skill `../.claude/skills/react-native-skills/` antes de crear o cambiar pantallas.

## Regla de la bitácora (obligatoria)

**Cada cambio en `app-movil/` se registra en `app-movil/BITACORA.md` en el mismo commit, antes de darlo por cerrado**:
entrada nueva arriba del «Registro» con verificación real (o «no verificado» y por qué) y, si cambian, «Estado actual»,
«Pendientes» y «Decisiones». Si el cambio toca también la web, agregar una línea en `docs/BITACORA.md`.

## Verificar antes de cerrar un cambio

```powershell
npm run typecheck
npx expo-doctor
npx expo export --platform android
```

Instalar paquetes con `npx expo install <paquete>` (y solo con autorización). En PowerShell 5.1 no usar `&&`.

@AGENTS.md
