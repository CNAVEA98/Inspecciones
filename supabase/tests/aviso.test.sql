-- Aviso de privacidad (migración 0020), con los usuarios del seed (pgTAP).
-- Ejecutar con la base local levantada:  corepack pnpm supabase test db
-- Todo corre en una transacción que se revierte: no deja datos.
begin;
create extension if not exists pgtap with schema extensions;

select plan(6);

create function public.tap_aviso_as(p_email text)
returns void
language plpgsql
as $$
declare
  v_id uuid;
begin
  reset role;
  if p_email is null then
    perform set_config('request.jwt.claims', '', true);
    set local role anon;
    return;
  end if;
  select id into v_id from auth.users where email = p_email;
  perform set_config('request.jwt.claims',
    json_build_object('sub', v_id, 'role', 'authenticated', 'email', p_email)::text, true);
  set local role authenticated;
end;
$$;

-- El técnico registra su lectura y queda guardada en su perfil.
select public.tap_aviso_as('tecnico_a@mlp.local');
select lives_ok($$ select public.registrar_aviso_privacidad('2026-11-03') $$, 'el técnico registra que leyó el aviso');
select is(
  (select aviso_privacidad_version from public.profiles where id = auth.uid()),
  '2026-11-03',
  'queda guardada la versión leída'
);
select isnt((select aviso_privacidad_at from public.profiles where id = auth.uid()), null, 'queda guardada la fecha');

-- No afecta a otras personas.
reset role;
select is(
  (select aviso_privacidad_version from public.profiles p join auth.users u on u.id = p.id where u.email = 'tecnico_b@mlp.local'),
  null,
  'el perfil de otro técnico no cambia'
);

-- Versión con formato inválido.
select public.tap_aviso_as('tecnico_a@mlp.local');
select throws_ok($$ select public.registrar_aviso_privacidad('cualquier cosa') $$, '22023', null, 'rechaza una versión inválida');

-- Sin sesión no se puede llamar.
select public.tap_aviso_as(null);
select throws_ok($$ select public.registrar_aviso_privacidad('2026-11-03') $$, '42501', null, 'sin sesión no se puede registrar');

reset role;
select * from finish();
rollback;
