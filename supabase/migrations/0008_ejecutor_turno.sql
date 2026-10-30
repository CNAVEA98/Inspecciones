-- Trazabilidad: quién realizó la inspección (nombre escrito en el formulario, porque la cuenta de técnico
-- puede ser compartida) y el turno de la cuenta al momento de enviar (foto fija; el admin puede cambiar
-- el turno del perfil después). La visibilidad entre turnos no cambia: todo el personal ve todo (is_staff).

alter table public.inspections
  add column performed_by text not null default '',
  add column technician_shift text check (technician_shift in ('A', 'B'));

-- Inspecciones anteriores: se toma el turno actual de la cuenta y el nombre de la cuenta como mejor dato disponible.
update public.inspections i
   set technician_shift = p.shift,
       performed_by = case when i.performed_by = '' then p.full_name else i.performed_by end
  from public.profiles p
 where p.id = i.technician_id;

create or replace function public.submit_inspection(p jsonb)
returns jsonb
language plpgsql
as $$
declare
  v_id uuid := (p -> 'inspection' ->> 'id')::uuid;
  v_tpl uuid := (p -> 'inspection' ->> 'template_id')::uuid;
  v_row public.inspections;
begin
  -- Reintento de un envío que ya se completó: devolver lo existente, sin duplicar.
  select * into v_row from public.inspections where id = v_id;
  if found and v_row.status <> 'draft' then
    return jsonb_build_object('id', v_row.id, 'folio', v_row.folio, 'status', v_row.status, 'duplicate', true);
  end if;

  if exists (
    select 1 from jsonb_to_recordset(coalesce(p -> 'attachments', '[]'::jsonb)) as a(storage_path text)
    where a.storage_path not like auth.uid()::text || '/%'
  ) then
    raise exception 'Ruta de adjunto inválida' using errcode = '42501';
  end if;

  insert into public.inspections (id, area_id, equipment_type_id, work_mode_id, template_id,
                                  template_version, equipment_tag, started_at, performed_by, technician_shift)
  select v_id,
         (p -> 'inspection' ->> 'area_id')::uuid,
         (p -> 'inspection' ->> 'equipment_type_id')::uuid,
         (p -> 'inspection' ->> 'work_mode_id')::uuid,
         v_tpl, ft.version,
         coalesce(p -> 'inspection' ->> 'equipment_tag', ''),
         coalesce((p -> 'inspection' ->> 'started_at')::timestamptz, now()),
         btrim(coalesce(p -> 'inspection' ->> 'performed_by', '')),
         (select pr.shift from public.profiles pr where pr.id = auth.uid())
  from public.form_templates ft where ft.id = v_tpl
  on conflict (id) do update
    set equipment_tag = excluded.equipment_tag,
        performed_by = excluded.performed_by,
        technician_shift = excluded.technician_shift;

  delete from public.findings where inspection_id = v_id;
  delete from public.answers where inspection_id = v_id;

  insert into public.attachments (id, inspection_id, storage_path, kind, mime, size_bytes)
  select a.id, v_id, a.storage_path, coalesce(a.kind, 'photo'), coalesce(a.mime, 'image/jpeg'), a.size_bytes
  from jsonb_to_recordset(coalesce(p -> 'attachments', '[]'::jsonb))
    as a(id uuid, storage_path text, kind text, mime text, size_bytes int)
  on conflict (id) do nothing;

  insert into public.answers (inspection_id, item_key, value)
  select v_id, a.item_key, a.value
  from jsonb_to_recordset(coalesce(p -> 'answers', '[]'::jsonb)) as a(item_key text, value jsonb);

  insert into public.findings (id, inspection_id, item_key, severity, description, photo_attachment_id)
  select f.id, v_id, f.item_key, f.severity, coalesce(f.description, ''), f.photo_attachment_id
  from jsonb_to_recordset(coalesce(p -> 'findings', '[]'::jsonb))
    as f(id uuid, item_key text, severity text, description text, photo_attachment_id uuid);

  update public.inspections set status = 'submitted' where id = v_id returning * into v_row;

  return jsonb_build_object('id', v_row.id, 'folio', v_row.folio, 'status', v_row.status, 'duplicate', false);
end;
$$;
