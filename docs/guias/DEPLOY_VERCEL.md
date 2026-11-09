# Probar en Vercel + Supabase

Guía para publicar la app (Next.js) en Vercel con un proyecto de Supabase. La demo estática antigua (`demo/`) se eliminó el 2026-11-09.

## La app completa (Next.js + Supabase)

Estado de esta guía: 2026-10-30. Las migraciones `0001` a `0011` y los seeds se aplicaron sin errores en Supabase **local**;
**no se han ejecutado en un proyecto Supabase remoto**. Si algún paso falla, copie el mensaje de error y repórtelo.

### 1. Proyecto de Supabase (use uno de PRUEBA, no el de producción)

1. Cree un proyecto en supabase.com. Región recomendada: **South America (São Paulo)**, la más cercana a la faena.
2. **Esquema.** Elija una de las dos formas:
   - **Con la CLI** (recomendada, aplica las 11 migraciones en orden):
     ```bash
     corepack pnpm supabase login
     corepack pnpm supabase link --project-ref <REF_DEL_PROYECTO>
     corepack pnpm supabase db push
     ```
   - **A mano:** en **SQL Editor** pegue y ejecute, en orden, cada archivo de `supabase/migrations/` del `0001` al `0011`.
3. **Catálogo y plantilla.** En **SQL Editor** ejecute **solo** `supabase/seed_catalogo.sql` (5 áreas, 5 equipos, 2 modos y la
   plantilla de 29 ítems). **No ejecute `seed_usuarios_dev.sql`**: crea cuentas con contraseñas conocidas y es solo para local.
4. **Authentication → Sign In / Providers → Email:**
   - Desactive **Confirm email**.
   - Desactive **Allow new users to sign up**: las cuentas las crea el equipo, nadie debe poder registrarse solo.
5. **Cuentas.** En **Authentication → Users → Add user → Create new user**, marque **Auto Confirm User** y cree las 7 cuentas
   con una contraseña que usted elija (no use las del seed local). El correo es interno; en la app se entra con el usuario:

   | Usuario en la app | Correo que se escribe en Supabase |
   |---|---|
   | `ADMINISTRADOR` | `administrador@mlp.local` |
   | `SUPERVISOR_A` / `SUPERVISOR_B` | `supervisor_a@mlp.local` / `supervisor_b@mlp.local` |
   | `PROGRAMADOR_A` / `PROGRAMADOR_B` | `programador_a@mlp.local` / `programador_b@mlp.local` |
   | `TECNICO_A` / `TECNICO_B` | `tecnico_a@mlp.local` / `tecnico_b@mlp.local` |

6. **Roles y turnos.** Todas parten como técnico. En **SQL Editor** ejecute (no contiene contraseñas):

   ```sql
   update public.profiles p
   set role = v.rol, shift = v.turno, full_name = v.nombre
   from auth.users u,
        (values
          ('administrador@mlp.local', 'admin',      null, 'Administrador'),
          ('supervisor_a@mlp.local',  'supervisor', 'A',  'Supervisor A'),
          ('supervisor_b@mlp.local',  'supervisor', 'B',  'Supervisor B'),
          ('programador_a@mlp.local', 'planner',    'A',  'Programador A'),
          ('programador_b@mlp.local', 'planner',    'B',  'Programador B'),
          ('tecnico_a@mlp.local',     'technician', 'A',  'Técnico A'),
          ('tecnico_b@mlp.local',     'technician', 'B',  'Técnico B')
        ) as v(email, rol, turno, nombre)
   where u.email = v.email and p.id = u.id;

   select u.email, p.role, p.shift from public.profiles p join auth.users u on u.id = p.id order by 1;
   ```
7. **Project Settings → API (o Data API):** copie `Project URL` y la clave `anon public`.
8. **Storage:** compruebe que existen los buckets privados creados por las migraciones (fotos y firmas). Ninguno debe ser público.

### 2. Vercel

1. Importe el repositorio de GitHub `CNAVEA98/Inspecciones_BBOSCH` (Root Directory: la raíz del repo).
   Rama: mientras no se una a `main`, elija `feat/flujo-4-pasos-tag` como rama de producción de la prueba, o use el despliegue de *Preview* de esa rama.
2. Framework: **Next.js** (se detecta solo). Gestor: pnpm (se toma de `packageManager` en `package.json`).
3. **Environment Variables** (Production y Preview):

   | Nombre | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL de Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clave `anon public` |
   | `SUPABASE_SERVICE_ROLE_KEY` | clave `service_role` (**solo Production**; desde la V1.1.6) |

   Desde la V1.1.6 el servidor usa la clave `service_role` **solo** para guardar y leer el PDF oficial de las inspecciones
   aprobadas en el bucket privado `reports` (`src/lib/informe/archivo.ts`). Va **sin** `NEXT_PUBLIC_` (nunca llega al
   navegador) y no se carga en Preview. Si falta, la app sigue funcionando y el PDF se genera al vuelo, pero no se archiva.
4. Deploy. Abra la URL y entre a `/login` con un usuario (p. ej. `TECNICO_A`).

### 3. Qué probar

1. **Ingreso por rol:** cada usuario cae en su área (`/tecnico`, `/supervisor`, `/planificador`, `/admin`).
2. **Flujo del técnico:** Área → Trabajo → Familia → Formato. Hoy solo **INSP-12 (Transformadores de Piso)** abre formulario; el resto dice «Próximamente».
3. **Selector de TAG:** buscar, filtrar por sector, elegir uno oficial y uno provisional. Revisar en la base (`answers`, ítem `_header`) que quede `tag_estado`.
4. **Envío y revisión:** enviar → `SUPERVISOR_*` firma → `PROGRAMADOR_*` aprueba → descargar el PDF.
5. **Eliminar un borrador** desde `/tecnico` (deslizar a la derecha o botón «Eliminar»).
6. **Sin señal:** con el formulario abierto, DevTools → Network → **Offline**, complete y envíe; debe decir «Sin conexión, 1 guardada en el equipo» y enviarse al reconectar.
7. **En el teléfono (HTTPS de Vercel):** Android/Chrome → «Instalar aplicación»; iPhone/Safari → Compartir → «Agregar a pantalla de inicio».
   Pruebe también abrir la app instalada sin señal y deslizar una inspección en curso con el dedo (esto último no se ha probado en un teléfono).

Aún **no probado en remoto**: corte total de red con envío al reconectar, instalación en teléfono y actualización del service worker.

### 4. Seguridad

- Use un proyecto de Supabase de prueba, distinto del de producción.
- `supabase/seed_usuarios_dev.sql` (cuentas con contraseñas de prueba) **no** debe ejecutarse en un Supabase remoto.
- No suba `.env*` a ningún repositorio ni pegue claves en el chat.
- Las cuentas compartidas se identifican por usuario; la trazabilidad por persona depende del campo «quién realiza la inspección».

## Región de las funciones (rendimiento)

Las funciones de Vercel deben correr en **São Paulo (`gru1`)**, junto a la base de Supabase. `vercel.json` lo fija con
`"regions": ["gru1"]`. Medido el 2026-11-03: el sitio respondía desde `iad1` (Washington) y cada consulta a Supabase
cruzaba el continente; la raíz `/` tardaba 2,2 s.

- Después de desplegar, compruébelo: `curl -sI https://inspecciones-bbosch.vercel.app/login | grep -i x-vercel-id` debe
  mostrar `gru1::gru1` (antes mostraba `gru1::iad1`).
- Si sigue en `iad1`, cámbielo en Vercel → Project Settings → Functions → **Function Region** → São Paulo (gru1) y vuelva a desplegar.
- Si el plan no lo permite, lo indica el propio panel; en ese caso se pierde la mejora de región, pero se mantienen las demás.
