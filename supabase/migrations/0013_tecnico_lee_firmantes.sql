-- El técnico descarga el PDF de sus propias inspecciones. El informe muestra el nombre de quien firmó
-- (supervisor y planificador), pero `profiles_select` solo deja ver el perfil propio o, al personal, todos.
-- Esta política deja al técnico leer únicamente el perfil de quienes firmaron SUS inspecciones.
-- Se usa una función security definer para no encadenar RLS entre profiles, signatures e inspections.

create function public.firmo_inspeccion_mia(p_profile uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.signatures s
    join public.inspections i on i.id = s.inspection_id
    where s.signer_id = p_profile and i.technician_id = auth.uid()
  );
$$;

create policy profiles_select_firmantes on public.profiles for select to authenticated
  using (public.firmo_inspeccion_mia(id));
