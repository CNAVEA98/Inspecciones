# Cómo correr el proyecto

## Web

```bash
corepack pnpm install
corepack pnpm lint
corepack pnpm tsc --noEmit
corepack pnpm test
corepack pnpm build
corepack pnpm dev            # necesita .env.local (copiar de .env.example)
```

Con Docker funcionando: `corepack pnpm supabase start` y `corepack pnpm supabase db reset` (`db reset` **borra** los datos locales y recarga `seed_catalogo.sql` y `seed_usuarios_dev.sql`).
Pruebas de la base: `corepack pnpm supabase test db`. Para el `.env.local` local, los valores salen de `corepack pnpm supabase status`.
Para regenerar la lista de TAG: `python scripts/export-maestro.py` (ver `docs/guias/EXPORT_MAESTRO.md`). Para probar en línea: `docs/guias/DEPLOY_VERCEL.md`.
Referencia visual interactiva (sin servidor): `docs/muestras/formulario-transformador-piso.html`.

## App móvil (Windows, PowerShell o terminal de VS Code)

En PowerShell 5.1 **no se puede usar `&&`**: escriba los comandos en líneas separadas.

```powershell
cd C:\Proyectos\mlp-inspecciones\app-movil
npm install              # solo la primera vez o si cambió package.json
npx expo start           # muestra un QR: escanéelo con la cámara del iPhone (Expo Go instalado, misma Wi-Fi)
```

- Si el teléfono no conecta: permitir Node.js en el Firewall (redes privadas) o usar `npx expo start --tunnel`.
- Verificar antes de cerrar un cambio: `npm run typecheck` · `npx expo-doctor` · `npx expo export --platform android`
  (comprueba que empaqueta). Instalar paquetes siempre con `npx expo install <paquete>` (elige la versión compatible).
- Esta carpeta usa **npm** (lockfile propio), no pnpm como la web.
