# Instrucciones · App móvil (React Native / Expo)

App nativa del técnico de Inspecciones MLP. Valen también las reglas del `CLAUDE.md` de la raíz del repositorio
(rama nueva, confirmación antes de push/PR, dependencias nuevas solo con autorización, UI en español de Chile).

## Al iniciar cada sesión

1. Leer `../docs/bitacora/ESTADO.md` (sección «App móvil») y las 3 últimas entradas `[APP]` de `../docs/bitacora/REGISTRO.md`.
2. Revisar la skill `../.claude/skills/react-native-skills/` antes de crear o cambiar pantallas.

## Regla de la bitácora (obligatoria)

**Cada cambio en `app-movil/` se registra en `docs/bitacora/REGISTRO.md` (etiqueta `[APP]`) en el mismo commit, antes de darlo por cerrado**:
entrada nueva arriba con verificación real (o «no verificado» y por qué) y, si cambian, `docs/bitacora/ESTADO.md`.
Si el cambio toca también la web, la misma entrada lleva ambas etiquetas.

## Verificar antes de cerrar un cambio

```powershell
npm run typecheck
npx expo-doctor
npx expo export --platform android
```

Instalar paquetes con `npx expo install <paquete>` (y solo con autorización). En PowerShell 5.1 no usar `&&`.

@AGENTS.md
