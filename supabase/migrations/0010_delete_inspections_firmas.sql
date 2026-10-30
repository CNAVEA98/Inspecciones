-- signatures.inspection_id no tiene ON DELETE CASCADE, así que delete_inspections (0009) fallaba con las
-- inspecciones ya firmadas. Se borran las firmas explícitamente, dentro del mismo indicador de borrado de administrador.

create or replace function public.delete_inspections(p_ids uuid[])
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
  insert into public.audit_log (table_name, row_id, action, actor_id, diff)
  select 'signatures', s.id, 'DELETE', auth.uid(), to_jsonb(s)
    from public.signatures s where s.inspection_id = any (p_ids);

  perform set_config('app.borrado_admin', 'on', true);
  delete from public.signatures where inspection_id = any (p_ids);
  delete from public.inspections where id = any (p_ids);
  get diagnostics v_n = row_count;
  perform set_config('app.borrado_admin', 'off', true);

  return jsonb_build_object('eliminadas', v_n, 'fotos', to_jsonb(v_fotos), 'firmas', to_jsonb(v_firmas));
end;
$$;
