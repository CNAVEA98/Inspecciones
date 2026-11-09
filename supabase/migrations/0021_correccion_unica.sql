-- 0021 · Una inspección rechazada admite UNA sola corrección.
--
-- Problema (prueba con dos teléfonos y la misma cuenta genérica, 2026-11-09): «Corregir y reenviar» guardaba el vínculo
-- «esta inspección corrige a X» solo en el teléfono. El servidor no lo conocía, así que dos teléfonos con TECNICO_A
-- corrigieron la misma rechazada y quedaron dos correcciones del mismo trabajo para revisar.
--
-- Solución: columna `corrects_id` (la rechazada que corrige) con índice único, y `submit_inspection` que la recibe y valida.
-- Sin clave foránea a propósito: si el administrador elimina la rechazada (0009), una FK con `set null` intentaría modificar
-- la corrección (quizá ya aprobada, inmutable) y bloquearía el borrado. El índice único impide dos correcciones aunque
-- lleguen en el mismo instante.

alter table public.inspections add column corrects_id uuid;

comment on column public.inspections.corrects_id is
  'Inspección rechazada que esta corrige (Corregir y reenviar). Única: una rechazada admite una sola corrección.';

create unique index inspections_corrects_id_key on public.inspections (corrects_id) where corrects_id is not null;

create or replace function public.submit_inspection(p jsonb)
returns jsonb
language plpgsql
as $$
declare
  v_id uuid := (p -> 'inspection' ->> 'id')::uuid;
  v_tpl uuid := (p -> 'inspection' ->> 'template_id')::uuid;
  v_corrige uuid := nullif(p -> 'inspection' ->> 'corrects_id', '')::uuid;
  v_row public.inspections;
  v_orig public.inspections;
  v_otra public.inspections;
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

  -- Corrección: la original debe ser una rechazada de esta cuenta y no tener ya otra corrección.
  if v_corrige is not null then
    select * into v_orig from public.inspections where id = v_corrige;
    if not found or v_orig.technician_id <> auth.uid() then
      raise exception 'CORRECCION_INVALIDA: la inspección que corrige no existe o no es de esta cuenta' using errcode = '22023';
    end if;
    if v_orig.status <> 'rejected' then
      raise exception 'CORRECCION_INVALIDA: % no está rechazada', coalesce(v_orig.folio, 'la inspección') using errcode = '22023';
    end if;
    select * into v_otra from public.inspections where corrects_id = v_corrige and id <> v_id;
    if found then
      raise exception 'CORRECCION_DUPLICADA: % ya fue corregida con el folio %', coalesce(v_orig.folio, 'la inspección'),
        coalesce(v_otra.folio, '(sin folio)') using errcode = '23505';
    end if;
  end if;

  insert into public.inspections (id, area_id, equipment_type_id, work_mode_id, template_id,
                                  template_version, equipment_tag, started_at, performed_by, technician_shift, corrects_id)
  select v_id,
         (p -> 'inspection' ->> 'area_id')::uuid,
         (p -> 'inspection' ->> 'equipment_type_id')::uuid,
         (p -> 'inspection' ->> 'work_mode_id')::uuid,
         v_tpl, ft.version,
         coalesce(p -> 'inspection' ->> 'equipment_tag', ''),
         coalesce((p -> 'inspection' ->> 'started_at')::timestamptz, now()),
         btrim(coalesce(p -> 'inspection' ->> 'performed_by', '')),
         (select pr.shift from public.profiles pr where pr.id = auth.uid()),
         v_corrige
  from public.form_templates ft where ft.id = v_tpl
  on conflict (id) do update
    set equipment_tag = excluded.equipment_tag,
        performed_by = excluded.performed_by,
        technician_shift = excluded.technician_shift,
        corrects_id = excluded.corrects_id;

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
