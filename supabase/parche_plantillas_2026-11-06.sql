-- Parche de datos (2026-11-06) para bases que ya tienen las plantillas cargadas (el remoto y bases locales viejas).
-- Corrige errores de redacción y de TAG detectados en la revisión de los 120 PDF (fallas P01, P02, P04, P06, P11, P27, P28, otras).
-- NO edita versiones publicadas (son inmutables): inserta la versión siguiente de cada plantilla que lo necesite.
-- Es idempotente: si la última versión ya está corregida, no hace nada. Las inspecciones ya enviadas conservan su versión.
-- Las bases nuevas (db reset) ya traen todo corregido desde los seed_plantillas_*.sql.
-- En el SQL Editor remoto elegir «postgres (Superuser)» junto a «Run».

do $$
declare
  r record;
  txt text;
  nuevo jsonb;
  par text[];
  cambiadas int := 0;
  pares text[][] := array[
    array['Verificar presencia de oxido', 'Verificar ausencia de óxido'],
    array['libre de oxido', 'libre de óxido'],
    array['Condictiones Físicas y Mecanicas', 'Condiciones físicas y mecánicas'],
    array['Condictiones', 'Condiciones'],
    array['Mecanicas', 'mecánicas'],
    array['Perdidas', 'Pérdidas'],
    array['atmosferico', 'atmosférico'],
    array['intrumentos', 'instrumentos'],
    array['Parametros', 'Parámetros'],
    array['Señaletica', 'Señalética'],
    array['Procedimineto', 'Procedimiento'],
    array['obstruccion', 'obstrucción'],
    array['iluminacion', 'iluminación'],
    array['Potencia Kw', 'Potencia kW'],
    array['lubricacion', 'lubricación'],
    array['electricas', 'eléctricas'],
    array['Tablero electrico', 'Tablero eléctrico'],
    array['Ailadores', 'Aisladores'],
    array['presion SF6', 'presión SF6'],
    array['Aumbrado', 'Alumbrado'],
    array['chisporoteo', 'chisporroteo'],
    array['transformadora de piso', 'transformador de piso'],
    array['empotrado e tablero', 'empotrado del tablero'],
    array['señal de alarma GPRT en sala 1', 'señal de trip GPRT en sala 1'],
    array['trip OTIA', 'trip OTIT'],
    array['trip WTIA', 'trip WTIT']
  ];
begin
  for r in
    select distinct on (equipment_type_id, work_mode_id) id, equipment_type_id, work_mode_id, version, schema
    from public.form_templates
    where status = 'published'
    order by equipment_type_id, work_mode_id, version desc
  loop
    nuevo := r.schema;

    -- P01 (MANT-13): en la sección del filtro 740HF003 las unidades resistivas llevaban el TAG del 740HF001.
    if nuevo -> 'meta' ->> 'norma' = 'EST-ELEC-MANT-MLP-BBOSCH-13' then
      nuevo := jsonb_set(
        nuevo,
        '{sections}',
        (select jsonb_agg(
                  case when s ->> 'title' = 'Filtro de Armónicos 740HF003'
                       then replace(s::text, '740HF001', '740HF003')::jsonb
                       else s end
                  order by ord)
         from jsonb_array_elements(nuevo -> 'sections') with ordinality as t(s, ord))
      );
    end if;

    txt := nuevo::text;
    foreach par slice 1 in array pares loop
      txt := replace(txt, par[1], par[2]);
    end loop;
    -- P02: «5ta Sintonía», «7th Sintonía», «9na», «11th» -> «5.ª sintonía»…
    txt := regexp_replace(txt, '(\d+)(ta|na|th|va|ma|ra) Sintonía', '\1.ª sintonía', 'g');
    nuevo := txt::jsonb;

    if nuevo <> r.schema then
      insert into public.form_templates (equipment_type_id, work_mode_id, version, schema, status, change_note)
      values (r.equipment_type_id, r.work_mode_id, r.version + 1, nuevo, 'published',
              'Correcciones de redacción y de TAG (revisión de PDF 2026-11-06)');
      cambiadas := cambiadas + 1;
    end if;
  end loop;
  raise notice 'Plantillas con versión nueva: %', cambiadas;
end
$$;
