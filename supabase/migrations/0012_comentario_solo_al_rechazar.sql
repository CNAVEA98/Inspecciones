-- El comentario de la revisión pasa a ser obligatorio solo al rechazar; al aprobar es opcional.
-- Se redefine review_inspection (la versión de 0007 exigía comentario siempre). Sin comentario se guarda null.
create or replace function public.review_inspection(
  p_id uuid, p_decision text, p_comment text, p_signature_path text
)
returns jsonb
language plpgsql
as $$
declare
  v_stage text;
  v_status text;
  v_comment text := nullif(btrim(coalesce(p_comment, '')), '');
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
  if p_decision = 'rejected' and v_comment is null then
    raise exception 'El comentario es obligatorio al rechazar';
  end if;

  v_status := case
    when p_decision = 'rejected' then 'rejected'
    when v_stage = 'supervisor' then 'supervisor_signed'
    else 'approved'
  end;

  insert into public.signatures (inspection_id, stage, decision, comment, image_path)
  values (p_id, v_stage, p_decision, v_comment, p_signature_path);

  update public.inspections
     set status = v_status, review_comment = v_comment
   where id = p_id
   returning * into v_row;

  return jsonb_build_object('id', v_row.id, 'folio', v_row.folio, 'status', v_row.status);
end;
$$;
