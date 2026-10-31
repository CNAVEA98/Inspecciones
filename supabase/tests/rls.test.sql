-- Pruebas de RLS y de las reglas de firma, con los usuarios del seed (pgTAP).
-- Ejecutar con la base local levantada y con el seed aplicado:  corepack pnpm supabase test db
-- Todo corre en una transacción que se revierte: no deja datos.
begin;
create extension if not exists pgtap with schema extensions;

select plan(32);

-- ---------- Ayuda: actuar como un usuario del seed ----------
-- tap_as('correo') cambia al rol "authenticated" con el JWT de ese usuario; tap_as(null) vuelve a postgres.
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
  -- pgTAP guarda sus resultados en tablas temporales del dueño de la sesión.
  grant all on all tables in schema pg_temp to authenticated;
  grant all on all sequences in schema pg_temp to authenticated;
  perform set_config('request.jwt.claims',
    json_build_object('sub', v_id, 'role', 'authenticated', 'email', p_email)::text, true);
  set local role authenticated;
end;
$$;

-- ---------- Datos de prueba (como postgres, sin RLS) ----------
-- A: técnico A, enviada. B: técnico B, enviada. C: técnico A, enviada (para rechazo).
create temp table ids as
select gen_random_uuid() as a, gen_random_uuid() as b, gen_random_uuid() as c,
       (select id from auth.users where email = 'tecnico_b@mlp.local') as tb;
grant all on ids to public;

insert into public.inspections (id, area_id, equipment_type_id, work_mode_id, template_id, template_version,
                                technician_id, equipment_tag, performed_by)
select x.id, ar.id, ft.equipment_type_id, ft.work_mode_id, ft.id, ft.version, u.id, x.tag, 'Prueba RLS'
from (
  select (select a from ids) as id, 'tecnico_a@mlp.local' as email, 'RLS-A' as tag
  union all select (select b from ids), 'tecnico_b@mlp.local', 'RLS-B'
  union all select (select c from ids), 'tecnico_a@mlp.local', 'RLS-C'
) x
join auth.users u on u.email = x.email
cross join (select id from public.areas order by sort limit 1) ar
cross join (select id, equipment_type_id, work_mode_id, version from public.form_templates
            where status = 'published' limit 1) ft;

update public.inspections set status = 'submitted'
 where id in (select a from ids union select b from ids union select c from ids);

-- ---------- 1. Visibilidad de inspecciones ----------
select tap_as('tecnico_a@mlp.local');
select is((select count(*) from public.inspections where id = (select a from ids)), 1::bigint,
          'técnico A ve su inspección');
select is((select count(*) from public.inspections where id = (select b from ids)), 0::bigint,
          'técnico A no ve la del técnico B');
select is((select count(*) from public.answers a join public.inspections i on i.id = a.inspection_id
           where i.technician_id <> auth.uid()), 0::bigint,
          'técnico A no ve respuestas ajenas');

select tap_as('tecnico_b@mlp.local');
select is((select count(*) from public.inspections where id = (select a from ids)), 0::bigint,
          'técnico B no ve la del técnico A');
select is((select count(*) from public.inspections where id = (select b from ids)), 1::bigint,
          'técnico B ve la suya');

select tap_as('supervisor_a@mlp.local');
select is((select count(*) from public.inspections where id in (select a from ids union select b from ids)),
          2::bigint, 'supervisor ve inspecciones de ambos turnos');
select tap_as('programador_b@mlp.local');
select is((select count(*) from public.inspections where id in (select a from ids union select b from ids)),
          2::bigint, 'planificador ve inspecciones de ambos turnos');
select tap_as('administrador@mlp.local');
select is((select count(*) from public.inspections where id in (select a from ids union select b from ids)),
          2::bigint, 'administrador ve todas');

-- ---------- 2. Perfiles: rol y turno ----------
select tap_as('tecnico_a@mlp.local');
select throws_ok(
  $$update public.profiles set role = 'admin' where id = auth.uid()$$,
  '42501', null, 'técnico no puede ascenderse');
select throws_ok(
  $$update public.profiles set shift = 'B' where id = auth.uid()$$,
  '42501', null, 'técnico no puede cambiar su turno');

select tap_as('supervisor_a@mlp.local');
update public.profiles set role = 'admin' where id = (select tb from ids);
select tap_as(null);
select is((select role from public.profiles where id = (select tb from ids)),
          'technician', 'supervisor no cambia el rol de otro (RLS filtra la fila)');

select tap_as('administrador@mlp.local');
update public.profiles set shift = 'A' where id = (select tb from ids);
select tap_as(null);
select is((select shift from public.profiles where id = (select tb from ids)),
          'A', 'administrador cambia el turno de otro');
-- Se restituye para no dejar rastro dentro de la transacción.
update public.profiles set shift = 'B' where id = (select tb from ids);

-- ---------- 3. Catálogo y plantillas: solo el administrador escribe ----------
select tap_as('supervisor_a@mlp.local');
select throws_ok($$insert into public.areas (code, name, sort) values ('rls_x', 'RLS X', 99)$$,
                 '42501', null, 'supervisor no escribe el catálogo');
select tap_as('tecnico_a@mlp.local');
select throws_ok($$insert into public.areas (code, name, sort) values ('rls_x', 'RLS X', 99)$$,
                 '42501', null, 'técnico no escribe el catálogo');
select tap_as('administrador@mlp.local');
select lives_ok($$insert into public.areas (code, name, sort) values ('rls_x', 'RLS X', 99)$$,
                'administrador escribe el catálogo');

-- ---------- 4. Auditoría ----------
select tap_as('tecnico_a@mlp.local');
select is((select count(*) from public.audit_log), 0::bigint, 'técnico no lee audit_log');
select tap_as('supervisor_a@mlp.local');
select is((select count(*) from public.audit_log), 0::bigint, 'supervisor no lee audit_log');
select tap_as('administrador@mlp.local');
select ok((select count(*) from public.audit_log) > 0, 'administrador lee audit_log');

-- ---------- 5. Firma doble ----------
select tap_as('tecnico_a@mlp.local');
select throws_ok(
  format($$select public.review_inspection(%L, 'approved', 'ok', 'x/firma.png')$$, (select a from ids)),
  '42501', null, 'técnico no puede firmar');
select tap_as('administrador@mlp.local');
select throws_ok(
  format($$select public.review_inspection(%L, 'approved', 'ok', 'x/firma.png')$$, (select a from ids)),
  '42501', null, 'administrador no puede firmar');
select tap_as('programador_a@mlp.local');
select throws_ok(
  format($$select public.review_inspection(%L, 'approved', 'ok', 'x/firma.png')$$, (select a from ids)),
  '42501', null, 'planificador no firma antes que el supervisor');

select tap_as('supervisor_a@mlp.local');
select throws_ok(
  format($$select public.review_inspection(%L, 'rejected', '   ', 'x/firma.png')$$, (select a from ids)),
  'P0001', 'El comentario es obligatorio al rechazar', 'rechazar exige comentario');
select is((select public.review_inspection((select a from ids), 'approved', '', 'x/sup.png') ->> 'status'),
          'supervisor_signed', 'aprobar no exige comentario: supervisor firma la 1.ª etapa');
select throws_ok(
  format($$select public.review_inspection(%L, 'approved', 'otra vez', 'x/sup2.png')$$, (select a from ids)),
  '42501', null, 'supervisor no firma dos veces');

select tap_as('programador_a@mlp.local');
select is((select public.review_inspection((select a from ids), 'approved', 'Aprobado', 'x/pl.png') ->> 'status'),
          'approved', 'planificador firma la 2.ª etapa y aprueba');

select tap_as('tecnico_a@mlp.local');
update public.inspections set equipment_tag = 'HACK' where id = (select a from ids);
select tap_as(null);
select is((select equipment_tag from public.inspections where id = (select a from ids)), 'RLS-A',
          'una inspección aprobada es inmutable (el técnico no la modifica)');

-- El técnico lee el perfil de quienes firmaron SUS inspecciones (para el PDF), y nada más.
select tap_as('tecnico_a@mlp.local');
select is((select count(*) from public.profiles where id <> auth.uid()), 2::bigint,
          'técnico A lee solo el perfil de quienes firmaron su inspección');
select tap_as('tecnico_b@mlp.local');
select is((select count(*) from public.profiles where id <> auth.uid()), 0::bigint,
          'técnico B no lee perfiles ajenos (nadie firmó lo suyo)');

-- Rechazo en la 1.ª etapa: cierra la inspección.
select tap_as('supervisor_b@mlp.local');
select is((select public.review_inspection((select c from ids), 'rejected', 'Falta evidencia', 'x/rej.png') ->> 'status'),
          'rejected', 'supervisor rechaza y la inspección queda cerrada');

-- ---------- 6. Eliminación ----------
select tap_as('supervisor_a@mlp.local');
select throws_ok(format($$select public.delete_inspections(array[%L]::uuid[])$$, (select b from ids)),
                 '42501', null, 'supervisor no elimina inspecciones');
select tap_as('administrador@mlp.local');
delete from public.inspections where id = (select b from ids);
select tap_as(null);
select is((select count(*) from public.inspections where id = (select b from ids)), 1::bigint,
          'el DELETE directo, incluso del administrador, no borra');
select tap_as('administrador@mlp.local');
select is((select (public.delete_inspections(array[(select b from ids)]) ->> 'eliminadas')::int), 1,
          'el administrador elimina por la función con auditoría');

select * from finish();
rollback;
