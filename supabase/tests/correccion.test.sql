-- Una rechazada admite una sola corrección (migración 0021), con los usuarios del seed (pgTAP).
-- Caso real (2026-11-09): dos teléfonos con la misma cuenta TECNICO_A corrigieron la misma rechazada.
-- Ejecutar con la base local levantada:  corepack pnpm supabase test db
-- Todo corre en una transacción que se revierte: no deja datos.
begin;
create extension if not exists pgtap with schema extensions;

select plan(9);

create function public.tap_corr_as(p_email text)
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
  grant all on all tables in schema pg_temp to authenticated;
  perform set_config('request.jwt.claims',
    json_build_object('sub', v_id, 'role', 'authenticated', 'email', p_email)::text, true);
  set local role authenticated;
end;
$$;

-- Datos (como postgres): R = rechazada de técnico A; S = enviada (no rechazada) de técnico A.
create temp table c as
select gen_random_uuid() as r, gen_random_uuid() as s, gen_random_uuid() as corr1, gen_random_uuid() as corr2,
       gen_random_uuid() as corr3, gen_random_uuid() as corr4;
grant all on c to public;

insert into public.inspections (id, area_id, equipment_type_id, work_mode_id, template_id, template_version,
                                technician_id, equipment_tag, performed_by, status, folio)
select x.id, ar.id, ft.equipment_type_id, ft.work_mode_id, ft.id, ft.version, u.id, 'CORR-T', 'Prueba', x.status, x.folio
from (select (select r from c) as id, 'rejected' as status, 'INS-TEST-000001' as folio
      union all select (select s from c), 'submitted', 'INS-TEST-000002') x
join auth.users u on u.email = 'tecnico_a@mlp.local'
cross join (select id from public.areas order by sort limit 1) ar
cross join (select id, equipment_type_id, work_mode_id, version from public.form_templates where status = 'published' limit 1) ft;

-- Payload mínimo de submit_inspection para una corrección.
create function pg_temp.payload(p_id uuid, p_corrige uuid)
returns jsonb
language sql
as $$
  select jsonb_build_object('inspection', jsonb_build_object(
    'id', p_id, 'area_id', i.area_id, 'equipment_type_id', i.equipment_type_id, 'work_mode_id', i.work_mode_id,
    'template_id', i.template_id, 'equipment_tag', 'CORR-T', 'performed_by', 'Prueba', 'corrects_id', p_corrige),
    'answers', '[]'::jsonb, 'findings', '[]'::jsonb, 'attachments', '[]'::jsonb)
  from public.inspections i where i.id = (select r from c);
$$;
grant execute on function pg_temp.payload(uuid, uuid) to authenticated;

select has_column('public', 'inspections', 'corrects_id', 'inspections tiene corrects_id');

select public.tap_corr_as('tecnico_a@mlp.local');

select lives_ok(
  format('select public.submit_inspection(pg_temp.payload(%L, %L))', (select corr1 from c), (select r from c)),
  'el técnico corrige su rechazada');

select is(
  (select corrects_id from public.inspections where id = (select corr1 from c)), (select r from c),
  'la corrección queda vinculada a la rechazada');

select lives_ok(
  format('select public.submit_inspection(pg_temp.payload(%L, %L))', (select corr1 from c), (select r from c)),
  'reenviar la misma corrección (reintento de la cola) no falla');

-- Otro teléfono con la misma cuenta corrige la misma rechazada.
select throws_like(
  format('select public.submit_inspection(pg_temp.payload(%L, %L))', (select corr2 from c), (select r from c)),
  '%CORRECCION_DUPLICADA%INS-TEST-000001%',
  'una segunda corrección de la misma rechazada se rechaza');

select throws_like(
  format('select public.submit_inspection(pg_temp.payload(%L, %L))', (select corr3 from c), (select s from c)),
  '%CORRECCION_INVALIDA%no está rechazada%',
  'no se puede «corregir» una inspección que no está rechazada');

-- El payload se arma como postgres: técnico B no puede leer la rechazada de A (RLS).
select public.tap_corr_as(null);
create temp table p_b as select pg_temp.payload((select corr4 from c), (select r from c)) as p;
grant all on p_b to public;
select public.tap_corr_as('tecnico_b@mlp.local');
select throws_like(
  'select public.submit_inspection((select p from p_b))',
  '%CORRECCION_INVALIDA%',
  'otra cuenta no puede corregir la rechazada de técnico A');

select public.tap_corr_as(null);
select is((select count(*)::int from public.inspections where corrects_id = (select r from c)), 1,
  'la rechazada tiene exactamente una corrección');

-- Aunque dos envíos pasen la validación a la vez, el índice único impide la segunda fila.
select throws_ok(
  format('insert into public.inspections (id, area_id, equipment_type_id, work_mode_id, template_id, template_version,
          technician_id, equipment_tag, corrects_id)
          select %L, area_id, equipment_type_id, work_mode_id, template_id, template_version, technician_id, ''X'', %L
          from public.inspections where id = %L', (select corr2 from c), (select r from c), (select r from c)),
  '23505', null, 'el índice único bloquea una segunda corrección aunque se salte la validación');

select * from finish();
rollback;
