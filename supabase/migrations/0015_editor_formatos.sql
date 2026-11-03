-- Editor de formatos: el supervisor y el administrador publican versiones nuevas de una plantilla.
-- El planificador solo consulta. Una versión publicada sigue siendo inmutable (trigger de 0003):
-- editar un formato = insertar la versión siguiente. Las inspecciones ya enviadas conservan la suya.

alter table public.form_templates
  add column created_by uuid references public.profiles (id) default auth.uid(),
  add column change_note text;

comment on column public.form_templates.created_by is 'Quién publicó esta versión (null en las cargadas por seed).';
comment on column public.form_templates.change_note is 'Qué cambió respecto de la versión anterior (obligatorio desde el editor).';

-- Escritura: supervisor o administrador (antes solo supervisor).
drop policy form_templates_write on public.form_templates;
create policy form_templates_write on public.form_templates for all to authenticated
  using (public.is_supervisor() or public.is_admin())
  with check (public.is_supervisor() or public.is_admin());

-- Lectura de borradores: la misma regla que la escritura. Publicadas: cualquier usuario autenticado (sin cambios).
drop policy form_templates_select on public.form_templates;
create policy form_templates_select on public.form_templates for select to authenticated
  using (status = 'published' or public.is_supervisor() or public.is_admin());

-- Al insertar una versión ya publicada, registrar la fecha de publicación (el trigger de 0003 solo cubre UPDATE).
create function public.form_templates_set_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

create trigger form_templates_set_published_at
  before insert on public.form_templates
  for each row execute function public.form_templates_set_published_at();
