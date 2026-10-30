-- Roles (administrador, supervisor, planificador, técnico), turnos A/B y firma doble.
-- Flujo: técnico envía (submitted) -> supervisor firma (supervisor_signed) -> planificador firma (approved).
-- Cualquiera de los dos firmantes puede rechazar (rejected, terminal). Solo el administrador cambia rol y turno.

-- ---------- Perfiles: rol ampliado y turno ----------

alter table public.profiles drop constraint profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('admin', 'supervisor', 'planner', 'technician'));
alter table public.profiles
  add column shift text check (shift in ('A', 'B'));
-- Los perfiles existentes parten en turno A (el administrador puede corregirlo).
update public.profiles set shift = 'A' where shift is null;

create or replace function public.is_supervisor()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'supervisor');
$$;

create function public.is_planner()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'planner');
$$;

create function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Personal con acceso de lectura a todas las inspecciones (no incluye al técnico).
create function public.is_staff()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role in ('admin', 'supervisor', 'planner')
  );
$$;

-- Quienes pueden firmar.
create function public.is_signer()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role in ('supervisor', 'planner')
  );
$$;

-- Solo el administrador cambia rol o turno (null = service role o SQL directo).
create or replace function public.guard_profile_role()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if (new.role is distinct from old.role or new.shift is distinct from old.shift)
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Solo un administrador puede cambiar el rol o el turno' using errcode = '42501';
  end if;
  new.id := old.id;
  return new;
end;
$$;

drop policy profiles_select on public.profiles;
drop policy profiles_update on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_staff());
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- ---------- Catálogo y plantillas: solo el administrador escribe ----------

do $$
declare t text;
begin
  foreach t in array array['areas', 'equipment_types', 'work_modes'] loop
    execute format('drop policy %I on public.%I', t || '_write', t);
    execute format('create policy %I on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t || '_write', t);
  end loop;
end $$;

drop policy form_templates_select on public.form_templates;
drop policy form_templates_write on public.form_templates;
create policy form_templates_select on public.form_templates for select to authenticated
  using (status = 'published' or public.is_admin());
create policy form_templates_write on public.form_templates for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- Firma doble ----------

alter table public.inspections drop constraint inspections_status_check;
alter table public.inspections
  add constraint inspections_status_check
  check (status in ('draft', 'submitted', 'supervisor_signed', 'approved', 'rejected'));

alter table public.signatures
  add column stage text not null default 'supervisor' check (stage in ('supervisor', 'planner'));
alter table public.signatures drop constraint signatures_inspection_id_key;
alter table public.signatures add constraint signatures_inspection_stage_key unique (inspection_id, stage);

create or replace function public.guard_inspection()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_stage text;
begin
  if tg_op = 'DELETE' then
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

create or replace function public.guard_signature()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_status text;
begin
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

-- ---------- RLS: lectura para todo el personal, firma por etapa ----------

drop policy inspections_select on public.inspections;
drop policy inspections_update on public.inspections;
create policy inspections_select on public.inspections for select to authenticated
  using (technician_id = auth.uid() or public.is_staff());
create policy inspections_update on public.inspections for update to authenticated
  using ((technician_id = auth.uid() and status = 'draft')
         or (public.is_supervisor() and status = 'submitted')
         or (public.is_planner() and status = 'supervisor_signed'))
  with check ((technician_id = auth.uid() and status in ('draft', 'submitted'))
              or (public.is_supervisor() and status in ('submitted', 'supervisor_signed', 'rejected'))
              or (public.is_planner() and status in ('supervisor_signed', 'approved', 'rejected')));

drop policy attachments_select on public.attachments;
create policy attachments_select on public.attachments for select to authenticated
  using (exists (select 1 from public.inspections i where i.id = attachments.inspection_id
                 and (i.technician_id = auth.uid() or public.is_staff())));

drop policy answers_select on public.answers;
create policy answers_select on public.answers for select to authenticated
  using (exists (select 1 from public.inspections i where i.id = answers.inspection_id
                 and (i.technician_id = auth.uid() or public.is_staff())));

drop policy findings_select on public.findings;
create policy findings_select on public.findings for select to authenticated
  using (exists (select 1 from public.inspections i where i.id = findings.inspection_id
                 and (i.technician_id = auth.uid() or public.is_staff())));

drop policy signatures_select on public.signatures;
drop policy signatures_insert on public.signatures;
create policy signatures_select on public.signatures for select to authenticated
  using (exists (select 1 from public.inspections i where i.id = signatures.inspection_id
                 and (i.technician_id = auth.uid() or public.is_staff())));
create policy signatures_insert on public.signatures for insert to authenticated
  with check (signer_id = auth.uid()
              and ((stage = 'supervisor' and public.is_supervisor())
                   or (stage = 'planner' and public.is_planner())));

drop policy audit_log_select on public.audit_log;
create policy audit_log_select on public.audit_log for select to authenticated
  using (public.is_admin());

-- ---------- Storage ----------

drop policy photos_select on storage.objects;
create policy photos_select on storage.objects for select to authenticated
  using (bucket_id = 'inspection-photos'
         and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff()));

drop policy signatures_obj_insert on storage.objects;
drop policy signatures_obj_select on storage.objects;
create policy signatures_obj_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'signatures' and public.is_signer());
create policy signatures_obj_select on storage.objects for select to authenticated
  using (bucket_id = 'signatures' and (
    public.is_staff() or exists (
      select 1 from public.inspections i
      where i.id::text = (storage.foldername(name))[1] and i.technician_id = auth.uid())));

drop policy reports_select on storage.objects;
create policy reports_select on storage.objects for select to authenticated
  using (bucket_id = 'reports' and (
    public.is_staff() or exists (
      select 1 from public.inspections i
      where i.id::text = (storage.foldername(name))[1] and i.technician_id = auth.uid())));

-- ---------- RPC de revisión: la etapa depende del rol del firmante ----------

create or replace function public.review_inspection(
  p_id uuid, p_decision text, p_comment text, p_signature_path text
)
returns jsonb
language plpgsql
as $$
declare
  v_stage text;
  v_status text;
  v_row public.inspections;
begin
  if public.is_supervisor() then
    v_stage := 'supervisor';
  elsif public.is_planner() then
    v_stage := 'planner';
  else
    raise exception 'Solo un supervisor o un planificador puede firmar' using errcode = '42501';
  end if;
  if p_decision not in ('approved', 'rejected') then
    raise exception 'Decisión inválida';
  end if;
  if coalesce(btrim(p_comment), '') = '' then
    raise exception 'El comentario es obligatorio';
  end if;

  v_status := case
    when p_decision = 'rejected' then 'rejected'
    when v_stage = 'supervisor' then 'supervisor_signed'
    else 'approved'
  end;

  insert into public.signatures (inspection_id, stage, decision, comment, image_path)
  values (p_id, v_stage, p_decision, p_comment, p_signature_path);

  update public.inspections
     set status = v_status, review_comment = p_comment
   where id = p_id
   returning * into v_row;

  return jsonb_build_object('id', v_row.id, 'folio', v_row.folio, 'status', v_row.status);
end;
$$;
