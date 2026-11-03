-- Permisos del editor de formatos (migración 0015), con los usuarios del seed (pgTAP).
-- Ejecutar con la base local levantada:  corepack pnpm supabase test db
-- Todo corre en una transacción que se revierte: no deja datos.
begin;
create extension if not exists pgtap with schema extensions;

select plan(10);

create function public.tap_as(p_email text)
returns void
language plpgsql
as $$
declare
  v_id uuid;
begin
  reset role;
  if p_email is null then
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

create temp table tpl as
select equipment_type_id as et, work_mode_id as wm, schema, max(version) over () as v
from public.form_templates where status = 'published' limit 1;
grant all on tpl to public;

-- Insertar la versión siguiente con un usuario dado; devuelve true si lo logró.
create function public.tap_publica(p_email text, p_extra int)
returns boolean
language plpgsql
as $$
begin
  perform public.tap_as(p_email);
  insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema, change_note)
  select et, wm, (select max(version) from public.form_templates f where f.equipment_type_id = tpl.et and f.work_mode_id = tpl.wm) + p_extra,
         'published', schema, 'prueba'
  from tpl;
  return true;
exception when others then
  return false;
end;
$$;

select is(public.tap_publica('tecnico_a@mlp.local', 1), false, 'el técnico no puede publicar una versión');
select is(public.tap_publica('programador_a@mlp.local', 1), false, 'el planificador no puede publicar una versión');
select is(public.tap_publica('supervisor_a@mlp.local', 1), true, 'el supervisor publica la versión siguiente');
select is(public.tap_publica('administrador@mlp.local', 2), true, 'el administrador publica la versión siguiente');

select public.tap_as(null);
select is((select count(*)::int from public.form_templates f, tpl where f.equipment_type_id = tpl.et and f.work_mode_id = tpl.wm and f.change_note = 'prueba' and f.published_at is not null),
          2, 'las versiones nuevas quedan con fecha de publicación');
select isnt((select created_by from public.form_templates f, tpl where f.equipment_type_id = tpl.et and f.work_mode_id = tpl.wm and f.change_note = 'prueba' order by f.version limit 1),
            null, 'la versión queda con su autor');

-- Una versión publicada sigue siendo inmutable, también para quien puede publicar.
select public.tap_as('administrador@mlp.local');
select throws_ok(
  $$ update public.form_templates set schema = '{"title":"x","sections":[]}'::jsonb where change_note = 'prueba' $$,
  '42501', null, 'una versión publicada no se puede modificar');
select throws_ok($$ delete from public.form_templates where change_note = 'prueba' $$, '42501', null, 'una versión publicada no se puede borrar');

-- Lectura: todos ven las publicadas.
select public.tap_as('programador_a@mlp.local');
select cmp_ok((select count(*)::int from public.form_templates where status = 'published'), '>', 0, 'el planificador ve las plantillas publicadas');
select public.tap_as('tecnico_a@mlp.local');
select cmp_ok((select count(*)::int from public.form_templates where status = 'published'), '>', 0, 'el técnico ve las plantillas publicadas');

select * from finish();
rollback;
