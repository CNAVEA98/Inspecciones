-- Administración de cuentas (migración 0022), con los usuarios del seed (pgTAP).
-- Ejecutar con la base local levantada:  corepack pnpm supabase test db
-- Todo corre en una transacción que se revierte: no deja datos.
begin;
create extension if not exists pgtap with schema extensions;

select plan(17);

create function public.tap_cuentas_as(p_email text)
returns void
language plpgsql
as $$
declare
  v_id uuid;
begin
  reset role;
  if p_email is null then
    -- Sin sesión (SQL directo): auth.uid() vuelve a ser null.
    perform set_config('request.jwt.claims', '', true);
    return;
  end if;
  select id into v_id from auth.users where email = p_email;
  if v_id is null then
    raise exception 'El usuario % no existe en el seed', p_email;
  end if;
  grant all on all tables in schema pg_temp to authenticated;
  grant all on all sequences in schema pg_temp to authenticated;
  perform set_config('request.jwt.claims',
    json_build_object('sub', v_id, 'role', 'authenticated', 'email', p_email)::text, true);
  set local role authenticated;
end;
$$;

create temp table ids as
select (select id from auth.users where email = 'administrador@mlp.local') as adm,
       (select id from auth.users where email = 'tecnico_b@mlp.local') as tb,
       (select id from auth.users where email = 'supervisor_a@mlp.local') as sa;
grant all on ids to public;

-- ---------- 1. Siempre queda un administrador ----------
-- Vale también para SQL directo (sin sesión).
select throws_ok(
  $$update public.profiles set role = 'supervisor', shift = 'A' where id = (select adm from ids)$$,
  '42501', 'Debe quedar al menos un administrador', 'no se puede degradar al único administrador (SQL directo)');

select public.tap_cuentas_as('administrador@mlp.local');
select throws_ok(
  $$update public.profiles set role = 'supervisor', shift = 'A' where id = auth.uid()$$,
  '42501', 'Debe quedar al menos un administrador', 'el único administrador no puede quitarse el rol');

-- Con un segundo administrador, el primero sí puede dejar de serlo.
update public.profiles set role = 'admin', shift = null where id = (select tb from ids);
select lives_ok(
  $$update public.profiles set role = 'supervisor', shift = 'A' where id = (select adm from ids)$$,
  'con otro administrador, el cambio de rol se permite');
select public.tap_cuentas_as(null);
update public.profiles set role = 'admin', shift = null where id = (select adm from ids);
update public.profiles set role = 'technician', shift = 'B' where id = (select tb from ids);

-- ---------- 2. El nombre de la cuenta lo cambia solo el administrador ----------
select public.tap_cuentas_as('supervisor_a@mlp.local');
select throws_ok(
  $$update public.profiles set full_name = 'Otro Nombre' where id = auth.uid()$$,
  '42501', 'Solo un administrador puede cambiar el nombre de una cuenta', 'el supervisor no puede cambiar su propio nombre (firma en el PDF)');

select public.tap_cuentas_as('administrador@mlp.local');
select lives_ok(
  $$update public.profiles set full_name = 'Supervisor A (prueba)' where id = (select sa from ids)$$,
  'el administrador cambia el nombre de otra cuenta');
select public.tap_cuentas_as(null);
select is((select full_name from public.profiles where id = (select sa from ids)), 'Supervisor A (prueba)', 'el nombre quedó guardado');

-- El aviso de privacidad (que cada persona registra en su perfil) sigue funcionando.
select public.tap_cuentas_as('supervisor_a@mlp.local');
select lives_ok($$ select public.registrar_aviso_privacidad('2026-11-03') $$, 'registrar el aviso de privacidad no choca con el guard');

-- ---------- 3. Registro de acciones sobre cuentas ----------
select throws_ok(
  $$ select public.registrar_accion_cuenta((select tb from ids), 'CAMBIAR_CLAVE', '{"usuario":"TECNICO_B"}') $$,
  '42501', null, 'el supervisor no puede registrar acciones de cuentas');

select public.tap_cuentas_as('tecnico_a@mlp.local');
select throws_ok(
  $$ select public.registrar_accion_cuenta((select tb from ids), 'BLOQUEAR', '{}') $$,
  '42501', null, 'el técnico tampoco');

select public.tap_cuentas_as('administrador@mlp.local');
select lives_ok(
  $$ select public.registrar_accion_cuenta((select tb from ids), 'CAMBIAR_CLAVE', '{"usuario":"TECNICO_B"}') $$,
  'el administrador registra un cambio de contraseña');
select is(
  (select diff ->> 'usuario' from public.audit_log
    where table_name = 'cuentas' and action = 'CAMBIAR_CLAVE' and row_id = (select tb from ids) and actor_id = auth.uid()),
  'TECNICO_B', 'queda en audit_log con quién lo hizo y sobre qué cuenta');
select throws_ok(
  $$ select public.registrar_accion_cuenta((select tb from ids), 'BORRAR_TODO', '{}') $$,
  '22023', null, 'rechaza una acción desconocida');
select throws_ok(
  $$ select public.registrar_accion_cuenta((select tb from ids), 'CAMBIAR_CLAVE', '{"clave":"Secreta12345"}') $$,
  '22023', null, 'rechaza un detalle que traiga una contraseña');
select throws_ok(
  $$ select public.registrar_accion_cuenta(auth.uid(), 'BLOQUEAR', '{}') $$,
  '42501', null, 'el administrador no puede bloquearse a sí mismo');

-- ---------- 4. Cerrar sesiones ----------
select public.tap_cuentas_as('supervisor_a@mlp.local');
select throws_ok(
  $$ select public.cerrar_sesiones_cuenta((select tb from ids)) $$,
  '42501', null, 'el supervisor no puede cerrar sesiones de otra cuenta');

select public.tap_cuentas_as(null);
insert into auth.sessions (id, user_id, created_at, updated_at)
values (gen_random_uuid(), (select tb from ids), now(), now());
select public.tap_cuentas_as('administrador@mlp.local');
select ok((select public.cerrar_sesiones_cuenta((select tb from ids))) >= 1, 'el administrador cierra las sesiones de una cuenta');
select throws_ok(
  $$ select public.cerrar_sesiones_cuenta(auth.uid()) $$,
  '42501', null, 'no cierra su propia sesión desde aquí');

reset role;
select * from finish();
rollback;
