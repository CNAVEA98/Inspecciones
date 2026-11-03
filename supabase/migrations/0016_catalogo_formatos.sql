-- Catálogo de formatos en la base (antes vivía en src/lib/formatos/catalogo.ts).
-- Paso 1 de 3: mismos 60 formatos, sin cambios visibles. Los pasos siguientes permiten desactivar y crear formatos
-- desde la pestaña «Formatos»; por eso existe `activo` (un formato desactivado no se ofrece al técnico, pero sus
-- inspecciones siguen intactas: nunca se borra un formato con historial).
-- La plantilla de cada formato se identifica por los códigos de tipo de equipo y modo (no por id), igual que antes,
-- para que esta migración no dependa de que el seed del catálogo ya esté cargado.

create table public.formatos (
  id text primary key check (id ~ '^(INSP|MANT)-[0-9]{2,3}$'),
  tipo text not null check (tipo in ('INSP', 'MANT')),
  titulo text not null check (btrim(titulo) <> ''),
  familia text not null check (familia in ('F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7')),
  -- Códigos de área (chacay, mina…). Vacío = transversal (todas las áreas).
  areas text[] not null default '{}',
  -- Designadores de TAG (segundo bloque, p. ej. XF en 320-XF-012) que filtran el selector.
  designadores text[] not null default '{}',
  campo text not null default 'tag' check (campo in ('tag', 'tramo')),
  varios_equipos boolean not null default false,
  areas_por_confirmar boolean not null default false,
  -- Plantilla que abre: códigos de equipment_types y work_modes. Null = «próximamente».
  tipo_equipo_code text,
  modo_code text,
  check ((tipo_equipo_code is null) = (modo_code is null)),
  activo boolean not null default true,
  orden int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index formatos_orden_idx on public.formatos (tipo, orden);

alter table public.formatos enable row level security;

-- Lectura: cualquier usuario autenticado (el técnico necesita el catálogo, también sin red tras descargarlo).
create policy formatos_select on public.formatos for select to authenticated using (true);
-- Escritura: solo el administrador (paso 2 y 3: desactivar y crear formatos).
create policy formatos_write on public.formatos for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create function public.formatos_touch()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger formatos_touch before update on public.formatos
  for each row execute function public.formatos_touch();

-- Los 60 formatos actuales, generados desde catalogo.ts el 2026-11-03 (los tests leen este bloque).
insert into public.formatos (id, tipo, titulo, familia, areas, designadores, campo, varios_equipos, areas_por_confirmar,
                             tipo_equipo_code, modo_code, orden)
select x.id, x.tipo, x.titulo, x.familia,
       array(select jsonb_array_elements_text(x.areas)), array(select jsonb_array_elements_text(x.designadores)),
       x.campo, x.varios_equipos, x.areas_por_confirmar, x.tipo_equipo_code, x.modo_code, x.orden
from jsonb_to_recordset($formatos$
[
{"id": "INSP-01", "tipo": "INSP", "titulo": "Desconectador Seccionador Maniobra 23 kV", "familia": "F4", "areas": [], "designadores": ["SW"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "desconectador_seccionador", "modo_code": "plan_matriz", "orden": 1},
{"id": "INSP-02", "tipo": "INSP", "titulo": "Banco de Condensadores Mauro", "familia": "F6", "areas": ["mauro"], "designadores": ["XC"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "banco_condensadores_mauro", "modo_code": "plan_matriz", "orden": 2},
{"id": "INSP-03", "tipo": "INSP", "titulo": "Pruebas Grupos Generadores El Mauro", "familia": "F5", "areas": ["mauro"], "designadores": ["GG", "GE", "DG"], "campo": "tag", "varios_equipos": true, "areas_por_confirmar": false, "tipo_equipo_code": "grupo_generador_mauro", "modo_code": "plan_matriz", "orden": 3},
{"id": "INSP-04", "tipo": "INSP", "titulo": "Limpieza Salas Eléctricas STMG 23 kV", "familia": "F2", "areas": ["mina"], "designadores": ["ER"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "sala_electrica_stmg", "modo_code": "plan_matriz", "orden": 4},
{"id": "INSP-05", "tipo": "INSP", "titulo": "Reconectadores", "familia": "F4", "areas": [], "designadores": ["GV", "NJ"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "reconectador", "modo_code": "plan_matriz", "orden": 5},
{"id": "INSP-06", "tipo": "INSP", "titulo": "Subestaciones Móviles", "familia": "F3", "areas": ["mina"], "designadores": ["SE", "US"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "subestacion_movil", "modo_code": "plan_matriz", "orden": 6},
{"id": "INSP-07", "tipo": "INSP", "titulo": "Transformadores Aéreos", "familia": "F3", "areas": [], "designadores": ["XF"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "transformador_aereo", "modo_code": "plan_matriz", "orden": 7},
{"id": "INSP-08", "tipo": "INSP", "titulo": "Switchgear Sala Eléctrica 12", "familia": "F1", "areas": ["mina"], "designadores": ["SG"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "switchgear_sala_12", "modo_code": "plan_matriz", "orden": 8},
{"id": "INSP-09", "tipo": "INSP", "titulo": "Parrones de Maniobra 23 kV", "familia": "F4", "areas": ["mina"], "designadores": ["PM"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "parron_maniobra", "modo_code": "plan_matriz", "orden": 9},
{"id": "INSP-10", "tipo": "INSP", "titulo": "Sistema Presurizado Sala 12", "familia": "F2", "areas": ["mina"], "designadores": [], "campo": "tramo", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "sistema_presurizado_sala_12", "modo_code": "plan_matriz", "orden": 10},
{"id": "INSP-11", "tipo": "INSP", "titulo": "Líneas Aéreas 23 kV", "familia": "F4", "areas": [], "designadores": ["LI"], "campo": "tramo", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "inspeccion_lineas", "modo_code": "plan_matriz", "orden": 11},
{"id": "INSP-12", "tipo": "INSP", "titulo": "Transformadores de Piso", "familia": "F3", "areas": [], "designadores": ["XF"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "transformador_piso", "modo_code": "plan_matriz", "orden": 12},
{"id": "INSP-13", "tipo": "INSP", "titulo": "Switchgears 23 kV", "familia": "F1", "areas": [], "designadores": ["SG"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "switchgear_23kv", "modo_code": "plan_matriz", "orden": 13},
{"id": "INSP-14", "tipo": "INSP", "titulo": "Switchgear Principal Tranque Mauro 23 kV", "familia": "F1", "areas": ["mauro"], "designadores": ["SG"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "switchgear_tranque_mauro", "modo_code": "plan_matriz", "orden": 14},
{"id": "INSP-15", "tipo": "INSP", "titulo": "Túnel de Cables STMG", "familia": "F2", "areas": ["mina"], "designadores": ["TU"], "campo": "tramo", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "tunel_cables_stmg", "modo_code": "plan_matriz", "orden": 15},
{"id": "INSP-16", "tipo": "INSP", "titulo": "Grupos Generadores ", "familia": "F5", "areas": [], "designadores": ["GG", "GE", "DG"], "campo": "tag", "varios_equipos": true, "areas_por_confirmar": false, "tipo_equipo_code": "grupo_generador", "modo_code": "plan_matriz", "orden": 16},
{"id": "INSP-17", "tipo": "INSP", "titulo": "Cargador y Banco de Baterías", "familia": "F7", "areas": [], "designadores": ["BC", "BA"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "cargador_banco_baterias", "modo_code": "plan_matriz", "orden": 17},
{"id": "INSP-18", "tipo": "INSP", "titulo": "Pruebas Grupos Generadores Chacay-Mina", "familia": "F5", "areas": ["chacay", "mina"], "designadores": ["GG", "GE", "DG"], "campo": "tag", "varios_equipos": true, "areas_por_confirmar": false, "tipo_equipo_code": "pruebas_generadores_chacay_mina", "modo_code": "plan_matriz", "orden": 18},
{"id": "INSP-19", "tipo": "INSP", "titulo": "Cables y Tierras de Escalerillas", "familia": "F2", "areas": [], "designadores": [], "campo": "tramo", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "cables_tierras_escalerillas", "modo_code": "plan_matriz", "orden": 19},
{"id": "INSP-20", "tipo": "INSP", "titulo": "Celda 23 kV", "familia": "F1", "areas": [], "designadores": ["SW"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "celda_alimentador_23kv", "modo_code": "plan_matriz", "orden": 20},
{"id": "INSP-21", "tipo": "INSP", "titulo": "Cruce de Caminos Mina", "familia": "F4", "areas": ["mina"], "designadores": ["CC"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "cruce_camino_mina", "modo_code": "plan_matriz", "orden": 21},
{"id": "INSP-22", "tipo": "INSP", "titulo": "Luminarias", "familia": "F7", "areas": [], "designadores": ["LP", "LT", "LX"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "luminarias", "modo_code": "plan_matriz", "orden": 22},
{"id": "INSP-23", "tipo": "INSP", "titulo": "Tablero Eléctrico", "familia": "F7", "areas": [], "designadores": ["DP", "CO", "JP"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "tablero_electrico_bt", "modo_code": "plan_matriz", "orden": 23},
{"id": "INSP-24", "tipo": "INSP", "titulo": "Parque Generador", "familia": "F5", "areas": [], "designadores": ["GG", "GE", "DG"], "campo": "tag", "varios_equipos": true, "areas_por_confirmar": false, "tipo_equipo_code": "parque_generador", "modo_code": "plan_matriz", "orden": 24},
{"id": "INSP-25", "tipo": "INSP", "titulo": "Filtro Armónico STATCOM", "familia": "F6", "areas": ["chacay"], "designadores": ["HF"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "filtro_armonico_statcom", "modo_code": "plan_matriz", "orden": 25},
{"id": "INSP-26", "tipo": "INSP", "titulo": "Tablero de Respaldo UPS", "familia": "F7", "areas": [], "designadores": ["UP"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "tablero_respaldo_ups", "modo_code": "plan_matriz", "orden": 26},
{"id": "INSP-27", "tipo": "INSP", "titulo": "Filtro Armónico 740-HF-5002 ", "familia": "F6", "areas": ["chacay"], "designadores": ["HF"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "filtro_molino_bolas_5002", "modo_code": "plan_matriz", "orden": 27},
{"id": "INSP-28", "tipo": "INSP", "titulo": "Filtro Armónico 740-HF-5001 ", "familia": "F6", "areas": ["chacay"], "designadores": ["HF"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "filtro_molino_sag_5001", "modo_code": "plan_matriz", "orden": 28},
{"id": "INSP-29", "tipo": "INSP", "titulo": "Switchgear PPCH", "familia": "F1", "areas": ["puerto"], "designadores": ["SG"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "switchgear_ppch", "modo_code": "plan_matriz", "orden": 29},
{"id": "INSP-30", "tipo": "INSP", "titulo": "Sala Eléctrica 740-ER-5002", "familia": "F2", "areas": ["chacay"], "designadores": ["ER"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "sala_electrica_740_er_5002", "modo_code": "plan_matriz", "orden": 30},
{"id": "INSP-31", "tipo": "INSP", "titulo": "Ficha Generadores ", "familia": "F5", "areas": [], "designadores": ["GG", "GE", "DG"], "campo": "tag", "varios_equipos": true, "areas_por_confirmar": false, "tipo_equipo_code": "ficha_generadores_agk", "modo_code": "plan_matriz", "orden": 31},
{"id": "INSP-32", "tipo": "INSP", "titulo": "Check List Grupo Generador", "familia": "F5", "areas": [], "designadores": ["GG", "GE", "DG"], "campo": "tag", "varios_equipos": true, "areas_por_confirmar": false, "tipo_equipo_code": "checklist_grupo_generador", "modo_code": "plan_matriz", "orden": 32},
{"id": "INSP-33", "tipo": "INSP", "titulo": "Sala Eléctrica 741-ER-5001 (STATCOM)", "familia": "F2", "areas": ["chacay"], "designadores": ["ER"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "sala_electrica_741_er_5001", "modo_code": "plan_matriz", "orden": 33},
{"id": "INSP-34", "tipo": "INSP", "titulo": "Relés de Protección y Controladores de Reconectadores", "familia": "F4", "areas": [], "designadores": ["GV", "NJ"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "reles_proteccion", "modo_code": "plan_matriz", "orden": 34},
{"id": "INSP-35", "tipo": "INSP", "titulo": "Banco de Condensadores PPCH", "familia": "F6", "areas": ["puerto"], "designadores": ["XC"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "banco_condensadores_ppch", "modo_code": "plan_matriz", "orden": 35},
{"id": "INSP-37", "tipo": "INSP", "titulo": "Cerco Perimetral STATCOM", "familia": "F7", "areas": ["chacay"], "designadores": [], "campo": "tramo", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "cerco_perimetral_statcom", "modo_code": "plan_matriz", "orden": 36},
{"id": "INSP-38", "tipo": "INSP", "titulo": "Carga de Combustible PG Piuquenes", "familia": "F5", "areas": ["chacay"], "designadores": [], "campo": "tramo", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "carga_combustible_piuquenes", "modo_code": "plan_matriz", "orden": 37},
{"id": "INSP-39", "tipo": "INSP", "titulo": "Limpieza Sala Eléctrica 740-ER-5002 ", "familia": "F2", "areas": ["chacay"], "designadores": ["ER"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "limpieza_sala_740_er_5002_l4", "modo_code": "plan_matriz", "orden": 38},
{"id": "INSP-40", "tipo": "INSP", "titulo": "Pruebas Grupos Generadores Puerto-Mauro", "familia": "F5", "areas": ["puerto", "mauro"], "designadores": ["GG", "GE", "DG"], "campo": "tag", "varios_equipos": true, "areas_por_confirmar": false, "tipo_equipo_code": "pruebas_generadores_puerto_mauro", "modo_code": "plan_matriz", "orden": 39},
{"id": "INSP-41", "tipo": "INSP", "titulo": "Sala Eléctrica 741-ER-5002 STATCOM", "familia": "F2", "areas": ["chacay"], "designadores": ["ER"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "sala_electrica_741_er_5002", "modo_code": "plan_matriz", "orden": 40},
{"id": "MANT-01", "tipo": "MANT", "titulo": "Generadores Locales", "familia": "F5", "areas": [], "designadores": ["GG", "GE", "DG"], "campo": "tag", "varios_equipos": true, "areas_por_confirmar": false, "tipo_equipo_code": "mant_generadores_locales", "modo_code": "mantenimiento_programado", "orden": 41},
{"id": "MANT-02", "tipo": "MANT", "titulo": "Parques de Generación", "familia": "F5", "areas": [], "designadores": ["GG", "GE", "DG"], "campo": "tag", "varios_equipos": true, "areas_por_confirmar": true, "tipo_equipo_code": "mant_parques_generacion", "modo_code": "mantenimiento_programado", "orden": 42},
{"id": "MANT-03", "tipo": "MANT", "titulo": "Subestación Móvil", "familia": "F3", "areas": ["mina"], "designadores": ["SE", "US"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "mant_subestacion_movil", "modo_code": "mantenimiento_programado", "orden": 43},
{"id": "MANT-04", "tipo": "MANT", "titulo": "Cargadores y Banco de Baterías", "familia": "F7", "areas": [], "designadores": ["BC", "BA"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "mant_cargadores_baterias", "modo_code": "mantenimiento_programado", "orden": 44},
{"id": "MANT-05", "tipo": "MANT", "titulo": "Tablero BT", "familia": "F7", "areas": [], "designadores": ["DP", "CO"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "mant_tablero_bt", "modo_code": "mantenimiento_programado", "orden": 45},
{"id": "MANT-06", "tipo": "MANT", "titulo": "Reconectador", "familia": "F4", "areas": [], "designadores": ["GV", "NJ"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "mant_reconectador", "modo_code": "mantenimiento_programado", "orden": 46},
{"id": "MANT-07", "tipo": "MANT", "titulo": "Switchgear Sala 12 23 kV", "familia": "F1", "areas": ["mina"], "designadores": ["SG"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "mant_switchgear_sala_12", "modo_code": "mantenimiento_programado", "orden": 47},
{"id": "MANT-08", "tipo": "MANT", "titulo": "Switchgear Estaciones Móviles 23 kV", "familia": "F1", "areas": ["mina"], "designadores": ["SG"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": true, "tipo_equipo_code": "mant_switchgear_estaciones", "modo_code": "mantenimiento_programado", "orden": 48},
{"id": "MANT-09", "tipo": "MANT", "titulo": "Switchgear Sala 1", "familia": "F1", "areas": ["mina"], "designadores": ["SG"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "mant_switchgear_sala_1_y_12", "modo_code": "mantenimiento_programado", "orden": 49},
{"id": "MANT-10", "tipo": "MANT", "titulo": "Switchgear SE El Mauro 23 kV", "familia": "F1", "areas": ["mauro"], "designadores": ["SG"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "mant_switchgear_mauro", "modo_code": "mantenimiento_programado", "orden": 50},
{"id": "MANT-11", "tipo": "MANT", "titulo": "Transformador Aéreo", "familia": "F3", "areas": [], "designadores": ["XF"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "mant_transformador_aereo", "modo_code": "mantenimiento_programado", "orden": 51},
{"id": "MANT-12", "tipo": "MANT", "titulo": "Filtro Armónico Chancado", "familia": "F6", "areas": ["mina"], "designadores": ["HF"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "mant_filtro_chancado", "modo_code": "mantenimiento_programado", "orden": 52},
{"id": "MANT-13", "tipo": "MANT", "titulo": "Filtro Armónico Planta", "familia": "F6", "areas": ["chacay"], "designadores": ["HF"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "mant_filtro_planta", "modo_code": "mantenimiento_programado", "orden": 53},
{"id": "MANT-14", "tipo": "MANT", "titulo": "Filtro Armónico PPCH", "familia": "F6", "areas": ["puerto"], "designadores": ["HF"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "mant_filtro_ppch", "modo_code": "mantenimiento_programado", "orden": 54},
{"id": "MANT-15", "tipo": "MANT", "titulo": "Parrones 23 kV", "familia": "F4", "areas": ["mina"], "designadores": ["PM"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "mant_parrones", "modo_code": "mantenimiento_programado", "orden": 55},
{"id": "MANT-16", "tipo": "MANT", "titulo": "Transformador de Piso", "familia": "F3", "areas": [], "designadores": ["XF"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "mant_transformador_piso", "modo_code": "mantenimiento_programado", "orden": 56},
{"id": "MANT-17", "tipo": "MANT", "titulo": "Transformador de Poder Correas", "familia": "F3", "areas": ["mina"], "designadores": ["XF"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": true, "tipo_equipo_code": "mant_transformador_poder_correas", "modo_code": "mantenimiento_programado", "orden": 57},
{"id": "MANT-18", "tipo": "MANT", "titulo": "Celda de Piso 23 kV", "familia": "F1", "areas": [], "designadores": ["SW"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "mant_celda_piso", "modo_code": "mantenimiento_programado", "orden": 58},
{"id": "MANT-19", "tipo": "MANT", "titulo": "Prueba de Instrumentos Transformador Principal", "familia": "F3", "areas": [], "designadores": ["CT", "PT"], "campo": "tag", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "mant_instrumentos_transformador", "modo_code": "mantenimiento_programado", "orden": 59},
{"id": "MANT-20", "tipo": "MANT", "titulo": "Línea Aérea 23 kV", "familia": "F4", "areas": [], "designadores": ["LI"], "campo": "tramo", "varios_equipos": false, "areas_por_confirmar": false, "tipo_equipo_code": "mant_linea_aerea", "modo_code": "mantenimiento_programado", "orden": 60}
]
$formatos$::jsonb) as x(id text, tipo text, titulo text, familia text, areas jsonb, designadores jsonb, campo text,
                       varios_equipos boolean, areas_por_confirmar boolean, tipo_equipo_code text, modo_code text, orden int);
