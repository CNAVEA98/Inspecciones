-- El supervisor gestiona los formatos igual que el administrador (decisión del usuario, 2026-11-03):
-- crea formatos nuevos (crear_formato) y los activa o desactiva (escritura de la tabla formatos).
-- El planificador y el técnico siguen solo leyendo. Un formato nunca se borra si tiene historial.

drop policy formatos_write on public.formatos;
create policy formatos_write on public.formatos for all to authenticated
  using (public.is_admin() or public.is_supervisor())
  with check (public.is_admin() or public.is_supervisor());

-- Misma función que en 0017; solo cambia quién puede usarla.
create or replace function public.crear_formato(p jsonb)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id text := btrim(p ->> 'id');
  v_tipo text := p ->> 'tipo';
  v_titulo text := btrim(coalesce(p ->> 'titulo', ''));
  v_norma text := btrim(coalesce(p ->> 'norma', ''));
  v_revision text := btrim(coalesce(p ->> 'revision', ''));
  v_areas text[] := array(select jsonb_array_elements_text(coalesce(p -> 'areas', '[]'::jsonb)));
  v_designadores text[] := array(select upper(btrim(x)) from jsonb_array_elements_text(coalesce(p -> 'designadores', '[]'::jsonb)) as x);
  v_modo_code text;
  v_src public.formatos;
  v_tpl public.form_templates;
  v_et uuid;
  v_wm uuid;
  v_code text;
  v_schema jsonb;
begin
  if not (public.is_admin() or public.is_supervisor()) then
    raise exception 'Solo un supervisor o un administrador puede crear formatos' using errcode = '42501';
  end if;
  if v_tipo not in ('INSP', 'MANT') or v_id !~ ('^' || v_tipo || '-[0-9]{2,3}$') then
    raise exception 'Identificador inválido: %', v_id using errcode = '22023';
  end if;
  if v_titulo = '' or v_norma = '' or v_revision = '' then
    raise exception 'Faltan el título, la norma o la revisión' using errcode = '22023';
  end if;
  if exists (select 1 from public.formatos where id = v_id) then
    raise exception 'Ya existe el formato %', v_id using errcode = '23505';
  end if;
  if exists (select 1 from unnest(v_areas) a where a not in (select code from public.areas)) then
    raise exception 'Área inválida' using errcode = '22023';
  end if;
  if exists (select 1 from unnest(v_designadores) d where d !~ '^[A-Z]{2,3}$') then
    raise exception 'Designador inválido (2 o 3 letras, p. ej. XF)' using errcode = '22023';
  end if;

  select * into v_src from public.formatos where id = p ->> 'copiar_de';
  if not found or v_src.tipo_equipo_code is null then
    raise exception 'Formato de origen inválido' using errcode = '22023';
  end if;
  if v_src.tipo <> v_tipo then
    raise exception 'Solo se puede copiar un formato del mismo tipo (inspección o mantención)' using errcode = '22023';
  end if;

  select ft.* into v_tpl
  from public.form_templates ft
  join public.equipment_types et on et.id = ft.equipment_type_id
  join public.work_modes wm on wm.id = ft.work_mode_id
  where et.code = v_src.tipo_equipo_code and wm.code = v_src.modo_code and ft.status = 'published'
  order by ft.version desc
  limit 1;
  if not found then
    raise exception 'El formato de origen no tiene plantilla publicada' using errcode = '22023';
  end if;

  v_modo_code := v_src.modo_code;
  v_wm := v_tpl.work_mode_id;
  v_code := 'fmt_' || lower(replace(v_id, '-', '_'));
  if exists (select 1 from public.equipment_types where code = v_code) then
    raise exception 'Ya existe el tipo de equipo %', v_code using errcode = '23505';
  end if;

  insert into public.equipment_types (code, name, sort)
  values (v_code, v_titulo, (select coalesce(max(sort), 0) + 1 from public.equipment_types))
  returning id into v_et;

  v_schema := jsonb_set(v_tpl.schema, '{title}', to_jsonb(v_titulo));
  v_schema := jsonb_set(v_schema, '{meta}', jsonb_build_object('norma', v_norma, 'revision', v_revision, 'titulo', v_titulo));

  insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema, change_note, created_by)
  values (v_et, v_wm, 1, 'published', v_schema, 'Formato creado a partir de ' || v_src.id || ' (' || btrim(v_src.titulo) || ')', auth.uid());

  insert into public.formatos (id, tipo, titulo, familia, areas, designadores, campo, varios_equipos,
                               tipo_equipo_code, modo_code, activo, orden)
  values (v_id, v_tipo, v_titulo, p ->> 'familia', v_areas, v_designadores,
          coalesce(p ->> 'campo', 'tag'), coalesce((p ->> 'varios_equipos')::boolean, false),
          v_code, v_modo_code, false, (select coalesce(max(orden), 0) + 1 from public.formatos));

  return v_id;
end;
$$;
