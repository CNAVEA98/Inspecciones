-- El administrador puede eliminar inspecciones (con sus respuestas, hallazgos, adjuntos y firmas).
-- Las inspecciones siguen siendo inmutables para todos los demás: los guards de DELETE solo ceden
-- dentro de delete_inspections(), que exige ser administrador y activa un indicador local a la transacción.
-- Cada eliminación deja una copia de la fila en audit_log (solo inserción), con quién la borró.

-- ---------- Guards: el DELETE solo pasa con el indicador y el rol administrador ----------

create or replace function public.borrado_admin_activo()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(current_setting('app.borrado_admin', true), '') = 'on' and public.is_admin();
$$;

create or replace function public.guard_inspection()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_stage text;
begin
  if tg_op = 'DELETE' then
    if public.borrado_admin_activo() then
      return old;
    end if;
    raise exception 'Las inspecciones no se pueden eliminar' using errcode = '42501';
  end if;

  if old.status in ('approved', 'rejected') then
    raise exception 'La inspección firmada es inmutable' using errcode = '42501';
  end if;

  if new.id <> old.id or new.technician_id <> old.technician_id then
    raise exception 'No se puede cambiar el identificador ni el técnico' using errcode = '42501';
  end if;

  if new.status = old.status then
    -- Sin transición: folio y datos de revisión no son editables.
    new.folio := old.folio;
    new.submitted_at := old.submitted_at;
    new.review_comment := old.review_comment;
    new.reviewed_by := old.reviewed_by;
    new.reviewed_at := old.reviewed_at;
    return new;
  end if;

  if old.status = 'draft' and new.status = 'submitted' then
    if auth.uid() is not null and auth.uid() <> old.technician_id then
      raise exception 'Solo el técnico dueño puede enviar la inspección' using errcode = '42501';
    end if;
    new.folio := 'INS-' || to_char(now() at time zone 'America/Santiago', 'YYYY')
                 || '-' || lpad(nextval('public.folio_seq')::text, 6, '0');
    new.submitted_at := now();
    new.review_comment := null;
    new.reviewed_by := null;
    new.reviewed_at := null;
    return new;
  end if;

  -- Firma del supervisor (submitted) o del planificador (supervisor_signed).
  if (old.status = 'submitted' and new.status in ('supervisor_signed', 'rejected'))
     or (old.status = 'supervisor_signed' and new.status in ('approved', 'rejected')) then
    v_stage := case old.status when 'submitted' then 'supervisor' else 'planner' end;
    if auth.uid() is not null and not (
         (v_stage = 'supervisor' and public.is_supervisor())
         or (v_stage = 'planner' and public.is_planner())) then
      raise exception 'Esta etapa la firma un %', case v_stage when 'supervisor' then 'supervisor' else 'planificador' end
        using errcode = '42501';
    end if;
    if not exists (
      select 1 from public.signatures s
      where s.inspection_id = old.id and s.stage = v_stage
        and s.decision = case when new.status = 'rejected' then 'rejected' else 'approved' end
    ) then
      raise exception 'La revisión requiere la firma de la etapa %', v_stage using errcode = '42501';
    end if;
    new.folio := old.folio;
    new.submitted_at := old.submitted_at;
    new.reviewed_at := now();
    new.reviewed_by := coalesce(auth.uid(), new.reviewed_by);
    return new;
  end if;

  raise exception 'Transición de estado no permitida: % -> %', old.status, new.status using errcode = '42501';
end;
$$;

create or replace function public.guard_child_write()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid;
  v_status text;
begin
  if tg_op = 'DELETE' then
    if public.borrado_admin_activo() then
      return old;
    end if;
    v_id := old.inspection_id;
  else
    v_id := new.inspection_id;
  end if;
  select status into v_status from public.inspections where id = v_id;
  if v_status is distinct from 'draft' then
    raise exception 'La inspección no admite cambios (estado: %)', coalesce(v_status, 'inexistente')
      using errcode = '42501';
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create or replace function public.guard_signature()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_status text;
begin
  if tg_op = 'DELETE' and public.borrado_admin_activo() then
    return old;
  end if;
  if tg_op in ('UPDATE', 'DELETE') then
    raise exception 'Las firmas son inmutables' using errcode = '42501';
  end if;
  select status into v_status from public.inspections where id = new.inspection_id;
  if new.stage = 'supervisor' and v_status is distinct from 'submitted' then
    raise exception 'El supervisor firma una inspección enviada' using errcode = '42501';
  end if;
  if new.stage = 'planner' and v_status is distinct from 'supervisor_signed' then
    raise exception 'El planificador firma una inspección ya firmada por el supervisor' using errcode = '42501';
  end if;
  if auth.uid() is not null and not (
       (new.stage = 'supervisor' and public.is_supervisor())
       or (new.stage = 'planner' and public.is_planner())) then
    raise exception 'El rol no corresponde a la etapa de firma' using errcode = '42501';
  end if;
  new.signer_id := coalesce(auth.uid(), new.signer_id);
  new.signed_at := now();
  return new;
end;
$$;

-- ---------- RPC: elimina y devuelve las rutas de Storage para que la app borre los archivos ----------

create function public.delete_inspections(p_ids uuid[])
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_fotos text[];
  v_firmas text[];
  v_n integer;
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede eliminar inspecciones' using errcode = '42501';
  end if;
  if p_ids is null or cardinality(p_ids) = 0 or cardinality(p_ids) > 200 then
    raise exception 'Indique entre 1 y 200 inspecciones';
  end if;

  select coalesce(array_agg(storage_path), '{}') into v_fotos
    from public.attachments where inspection_id = any (p_ids);
  select coalesce(array_agg(image_path), '{}') into v_firmas
    from public.signatures where inspection_id = any (p_ids);

  -- Copia completa en la auditoría antes de borrar (audit_log no se puede modificar ni borrar).
  insert into public.audit_log (table_name, row_id, action, actor_id, diff)
  select 'inspections', i.id, 'DELETE', auth.uid(), to_jsonb(i)
    from public.inspections i where i.id = any (p_ids);

  perform set_config('app.borrado_admin', 'on', true);
  delete from public.inspections where id = any (p_ids);
  get diagnostics v_n = row_count;
  perform set_config('app.borrado_admin', 'off', true);

  return jsonb_build_object('eliminadas', v_n, 'fotos', to_jsonb(v_fotos), 'firmas', to_jsonb(v_firmas));
end;
$$;

revoke execute on function public.delete_inspections(uuid[]) from public, anon;
grant execute on function public.delete_inspections(uuid[]) to authenticated;

-- ---------- Storage: el administrador borra los archivos de las inspecciones eliminadas ----------

create policy admin_obj_delete on storage.objects for delete to authenticated
  using (bucket_id in ('inspection-photos', 'signatures') and public.is_admin());
