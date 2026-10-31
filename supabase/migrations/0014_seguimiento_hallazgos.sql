-- Seguimiento de hallazgos (observaciones en «Malo»).
-- Los hallazgos son inmutables una vez enviada la inspección (guard_child_write), así que el seguimiento va en una tabla
-- aparte. La Supervisión de Bbosch registra, en cualquier momento (también con la inspección ya aprobada):
--   · alcance «bbosch»: el N.º de aviso subsecuente de SAP (que se crea en paralelo y no condiciona las firmas);
--   · alcance «terceros» (requiere apoyo de otra empresa: extintores, plagas, accesos…): que se canalizó con MLP.
-- Sin fila de seguimiento, el hallazgo es «bbosch» y está pendiente.

create table public.finding_followups (
  finding_id uuid primary key references public.findings (id) on delete cascade,
  inspection_id uuid not null references public.inspections (id) on delete cascade,
  scope text not null default 'bbosch' check (scope in ('bbosch', 'terceros')),
  sap_notice text check (sap_notice is null or char_length(sap_notice) between 1 and 20),
  channel_note text check (channel_note is null or char_length(channel_note) between 1 and 300),
  -- Cada alcance usa su propio campo.
  check (scope = 'bbosch' or sap_notice is null),
  check (scope = 'terceros' or channel_note is null),
  updated_by uuid references public.profiles (id),
  updated_at timestamptz not null default now()
);
create index finding_followups_inspection_idx on public.finding_followups (inspection_id);

alter table public.finding_followups enable row level security;

-- Lectura: el técnico dueño de la inspección y el personal. Sin policies de escritura: solo el RPC de abajo escribe.
create policy finding_followups_select on public.finding_followups for select to authenticated
  using (exists (select 1 from public.inspections i where i.id = finding_followups.inspection_id
                 and (i.technician_id = auth.uid() or public.is_staff())));

-- Registra el seguimiento de un hallazgo. Lo hacen el supervisor y el administrador; el planificador solo lee.
-- Con alcance «bbosch» y sin N.º de aviso el hallazgo vuelve a «pendiente» (se borra la fila); «terceros» queda marcado aunque aún no tenga nota.
create function public.set_finding_followup(
  p_finding uuid,
  p_scope text,
  p_sap_notice text,
  p_channel_note text
)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_insp uuid;
  v_status text;
  v_notice text := nullif(btrim(coalesce(p_sap_notice, '')), '');
  v_note text := nullif(btrim(coalesce(p_channel_note, '')), '');
  v_old jsonb;
begin
  if not (public.is_supervisor() or public.is_admin()) then
    raise exception 'Solo la Supervisión registra el seguimiento de hallazgos' using errcode = '42501';
  end if;
  if p_scope not in ('bbosch', 'terceros') then
    raise exception 'Alcance inválido';
  end if;

  select f.inspection_id, i.status into v_insp, v_status
  from public.findings f join public.inspections i on i.id = f.inspection_id
  where f.id = p_finding;
  if v_insp is null then
    raise exception 'Hallazgo no encontrado' using errcode = 'P0002';
  end if;
  if v_status not in ('submitted', 'supervisor_signed', 'approved') then
    raise exception 'La inspección no admite seguimiento (estado: %)', v_status using errcode = '22023';
  end if;

  -- Cada alcance conserva solo su campo.
  if p_scope = 'bbosch' then v_note := null; else v_notice := null; end if;

  select to_jsonb(ff) into v_old from public.finding_followups ff where ff.finding_id = p_finding;

  if p_scope = 'bbosch' and v_notice is null then
    delete from public.finding_followups where finding_id = p_finding;
  else
    insert into public.finding_followups (finding_id, inspection_id, scope, sap_notice, channel_note, updated_by)
    values (p_finding, v_insp, p_scope, v_notice, v_note, auth.uid())
    on conflict (finding_id) do update
      set scope = excluded.scope, sap_notice = excluded.sap_notice, channel_note = excluded.channel_note,
          updated_by = excluded.updated_by, updated_at = now();
  end if;

  insert into public.audit_log (table_name, row_id, action, actor_id, diff)
  values ('finding_followups', p_finding, 'SET', auth.uid(),
          jsonb_build_object('old', v_old,
                             'new', jsonb_build_object('scope', p_scope, 'sap_notice', v_notice, 'channel_note', v_note)));

  return jsonb_build_object('finding_id', p_finding, 'scope', p_scope, 'sap_notice', v_notice, 'channel_note', v_note);
end;
$$;
revoke all on function public.set_finding_followup(uuid, text, text, text) from public;
grant execute on function public.set_finding_followup(uuid, text, text, text) to authenticated;
