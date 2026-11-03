-- Aviso de privacidad al primer ingreso (V1.1.0, 2026-11-03). No es un consentimiento: la base del tratamiento es la
-- relación laboral/contractual; el aviso informa y se registra que la persona lo leyó («Entendido»), con la versión del
-- texto y la fecha. Si cambia el texto de /privacidad, la app sube la versión y el aviso se vuelve a mostrar.

alter table public.profiles
  add column aviso_privacidad_version text,
  add column aviso_privacidad_at timestamptz;

comment on column public.profiles.aviso_privacidad_version is 'Versión del aviso de privacidad que la persona marcó como leído.';
comment on column public.profiles.aviso_privacidad_at is 'Cuándo marcó como leído el aviso de privacidad.';

-- Solo la propia persona registra su lectura (security definer: no depende de la política de UPDATE de profiles).
create function public.registrar_aviso_privacidad(p_version text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Sesión no iniciada' using errcode = '42501';
  end if;
  if p_version is null or p_version !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
    raise exception 'Versión del aviso inválida' using errcode = '22023';
  end if;
  update public.profiles
     set aviso_privacidad_version = p_version,
         aviso_privacidad_at = now()
   where id = auth.uid();
end;
$$;

revoke execute on function public.registrar_aviso_privacidad(text) from public, anon;
grant execute on function public.registrar_aviso_privacidad(text) to authenticated;
