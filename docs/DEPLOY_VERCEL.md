# Probar en Vercel + Supabase

Hay dos maneras de probar. La **A** no necesita nada más; la **B** es la app completa y necesita un proyecto de Supabase.

## A. Demo de los formatos (sin Supabase, 2 minutos)

Carpeta `demo/` del repositorio: HTML estáticos con los formularios interactivos y el informe en el diseño Cobre.

1. En Vercel: **Add New → Project → Import** del repositorio de GitHub `CNAVEA98/Inspecciones_BBOSCH`.
2. Framework Preset: **Other**. Sin comando de build. **Root Directory: `demo`**.
3. Abra la URL: `/` (portada), `/inspecciones.html` (menú de formularios), `/informe.html`.

Todo corre en el navegador; el borrador se guarda en `localStorage` y el envío es simulado.

## B. La app completa (Next.js + Supabase)

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

   **No** cargue la clave `service_role`: la app no la usa y nunca debe ir en variables `NEXT_PUBLIC_`.
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
