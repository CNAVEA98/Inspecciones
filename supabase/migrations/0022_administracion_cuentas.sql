-- 0022 · Administración de cuentas por el administrador (V1.1.8).
--
-- Hasta aquí el administrador solo podía cambiar rol y turno. Desde esta versión también crea cuentas, cambia
-- contraseñas y bloquea accesos desde «Usuarios» (el servidor lo hace con la clave de servicio, después de comprobar
-- que quien lo pide es administrador). Esta migración agrega lo que eso necesita en la base:
--   1. Nunca queda el sistema sin administrador (ni por la app ni por SQL directo).
--   2. El nombre de una cuenta lo cambia solo el administrador: es el nombre que sale como firmante en el PDF.
--   3. Cada acción sobre una cuenta queda en `audit_log` (nunca la contraseña).
--   4. Al cambiar una contraseña o bloquear una cuenta se cierran sus sesiones abiertas.

-- ---------- 1 y 2 · Guard de perfiles ----------

create or replace function public.guard_profile_role()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  -- auth.uid() null = service role o SQL directo.
  if (new.role is distinct from old.role or new.shift is distinct from old.shift)
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Solo un administrador puede cambiar el rol o el turno' using errcode = '42501';
  end if;

  if new.full_name is distinct from old.full_name
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Solo un administrador puede cambiar el nombre de una cuenta' using errcode = '42501';
  end if;

  -- Vale para todos, también para SQL directo: siempre debe quedar al menos un administrador.
  if old.role = 'admin' and new.role <> 'admin'
     and not exists (select 1 from public.profiles where role = 'admin' and id <> old.id) then
    raise exception 'Debe quedar al menos un administrador' using errcode = '42501';
  end if;

  new.id := old.id;
  return new;
end;
$$;

-- ---------- 3 · Registro de acciones sobre cuentas ----------

-- La app la llama ANTES de ejecutar la acción con la clave de servicio: si no se puede registrar, la acción no se hace.
-- `p_detalle` lleva datos de contexto (usuario, rol, turno); nunca una contraseña.
create function public.registrar_accion_cuenta(p_user uuid, p_accion text, p_detalle jsonb default '{}'::jsonb)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede administrar cuentas' using errcode = '42501';
  end if;
  if p_accion is null or p_accion not in ('CREAR_CUENTA', 'CAMBIAR_CLAVE', 'BLOQUEAR', 'DESBLOQUEAR') then
    raise exception 'Acción de cuenta inválida' using errcode = '22023';
  end if;
  if p_accion = 'BLOQUEAR' and p_user = auth.uid() then
    raise exception 'No puede bloquear su propia cuenta' using errcode = '42501';
  end if;
  if coalesce(p_detalle, '{}'::jsonb) ?| array['password', 'clave', 'contrasena', 'contraseña'] then
    raise exception 'El detalle no puede llevar contraseñas' using errcode = '22023';
  end if;

  insert into public.audit_log (table_name, row_id, action, actor_id, diff)
  values ('cuentas', p_user, p_accion, auth.uid(), coalesce(p_detalle, '{}'::jsonb));
end;
$$;

revoke execute on function public.registrar_accion_cuenta(uuid, text, jsonb) from public, anon;
grant execute on function public.registrar_accion_cuenta(uuid, text, jsonb) to authenticated;

-- ---------- 4 · Cerrar las sesiones de una cuenta ----------

-- Borra las sesiones (y con ellas los tokens de renovación) de la cuenta: la persona debe volver a ingresar.
-- Devuelve cuántas sesiones cerró.
create function public.cerrar_sesiones_cuenta(p_user uuid)
returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  v_n integer;
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede cerrar sesiones' using errcode = '42501';
  end if;
  if p_user = auth.uid() then
    raise exception 'No puede cerrar su propia sesión desde aquí' using errcode = '42501';
  end if;
  delete from auth.sessions where user_id = p_user;
  get diagnostics v_n = row_count;
  return v_n;
end;
$$;

revoke execute on function public.cerrar_sesiones_cuenta(uuid) from public, anon;
grant execute on function public.cerrar_sesiones_cuenta(uuid) to authenticated;

-- Las consultas de la pestaña «Auditoría» filtran por tabla y ordenan por fecha.
create index audit_log_tabla_fecha_idx on public.audit_log (table_name, at desc);
create index audit_log_fecha_idx on public.audit_log (at desc);
