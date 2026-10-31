-- Plantillas INSP-16 a INSP-41 (salvo INSP-36, que no existe) × Plan Matriz (Word revisados de «Bases de datos generales/Formatos BBOSCH/Inspeciones»).
-- Es seguro ejecutarlo más de una vez y también en un Supabase remoto: no crea usuarios y no repite lo ya cargado.
-- En el SQL Editor remoto elegir «postgres (Superuser)» junto a «Run».
-- Cada formato tiene su propio tipo de equipo (la plantilla se busca por tipo de equipo × modo de trabajo).

insert into public.equipment_types (code, name, sort)
values ('grupo_generador', 'Grupo generador', 56)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('cargador_banco_baterias', 'Cargador y banco de baterías', 57)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('pruebas_generadores_chacay_mina', 'Pruebas de grupos generadores Chacay-Mina', 58)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('cables_tierras_escalerillas', 'Cables y tierras de escalerillas', 59)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('celda_alimentador_23kv', 'Celda 23 kV', 60)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('cruce_camino_mina', 'Cruce de caminos Mina', 61)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('luminarias', 'Luminarias', 62)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('tablero_electrico_bt', 'Tablero eléctrico BT', 63)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('parque_generador', 'Parque generador', 64)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('filtro_armonico_statcom', 'Filtro armónico STATCOM', 65)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('tablero_respaldo_ups', 'Tablero de respaldo UPS', 66)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('filtro_molino_bolas_5002', 'Filtro armónico 740-HF-5002 (SAG4)', 67)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('filtro_molino_sag_5001', 'Filtro armónico 740-HF-5001 (SAG4)', 68)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('switchgear_ppch', 'Switchgear PPCH', 69)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('sala_electrica_740_er_5002', 'Sala eléctrica 740-ER-5002', 70)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('ficha_generadores_agk', 'Ficha generadores (AGK)', 71)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('checklist_grupo_generador', 'Check list grupo generador', 72)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('sala_electrica_741_er_5001', 'Sala eléctrica 741-ER-5001 (STATCOM)', 73)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('reles_proteccion', 'Relés de protección y controladores de reconectadores', 74)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('banco_condensadores_ppch', 'Banco de condensadores PPCH', 75)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('cerco_perimetral_statcom', 'Cerco perimetral STATCOM', 77)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('carga_combustible_piuquenes', 'Carga de combustible PG Piuquenes', 78)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('limpieza_sala_740_er_5002_l4', 'Limpieza sala eléctrica 740-ER-5002 Línea 4', 79)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('pruebas_generadores_puerto_mauro', 'Pruebas de grupos generadores Puerto-Mauro', 80)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('sala_electrica_741_er_5002', 'Sala eléctrica 741-ER-5002 STATCOM', 81)
on conflict (code) do nothing;

-- INSP-16 · EST-ELEC-INSP-MLP-Bbosch-16 · Inspección Grupo Generador (30 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Inspección Grupo Generador",
  "meta": {
    "norma": "EST-ELEC-INSP-MLP-Bbosch-16",
    "revision": "Abril 2024",
    "titulo": "Inspección Grupo Generador"
  },
  "header": [
    {
      "key": "tag",
      "label": "TAG Equipo",
      "input": "text"
    },
    {
      "key": "ot",
      "label": "N° OT",
      "input": "text"
    },
    {
      "key": "ubicacion",
      "label": "Ubicación",
      "input": "text"
    },
    {
      "key": "fecha",
      "label": "Fecha",
      "input": "date"
    },
    {
      "key": "h_inicio",
      "label": "Hora inicio",
      "input": "time"
    },
    {
      "key": "h_fin",
      "label": "Hora término",
      "input": "time"
    },
    {
      "key": "potencia",
      "label": "Potencia",
      "input": "text",
      "required": false
    }
  ],
  "roles": [
    "Encargado de la actividad",
    "Supervisor Bbosch",
    "Planificador Bbosch"
  ],
  "sections": [
    {
      "id": "actividades",
      "title": "Actividades",
      "items": [
        {
          "id": "item_001",
          "type": "verificacion",
          "label": "Filtro de aire de sala."
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Filtro aire."
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Tensión de cargador de baterías.",
          "unit": "V"
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Corriente cargador de baterías.",
          "unit": "A"
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Horómetro.",
          "unit": "h"
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Nivel Estanque petróleo."
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Energía.",
          "unit": "kWh"
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Interruptores de control cerrados."
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Verificar presencia de tensión de control."
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Estado de luces pilotos."
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Filtraciones de petróleo."
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Filtraciones de agua."
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Nivel de Agua."
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Verificar Tº de aceite",
          "unit": "°C"
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Verificar Interruptor de calefactores cerrados"
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Verificación de puesta a tierra de GG."
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Verificar limpieza de Pisos."
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Aseo general"
        },
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "Sistema de iluminación normal."
        },
        {
          "id": "item_020",
          "type": "verificacion",
          "label": "Sistema de iluminación de emergencia."
        },
        {
          "id": "item_021",
          "type": "verificacion",
          "label": "Sistema de detección de incendia."
        },
        {
          "id": "item_022",
          "type": "verificacion",
          "label": "Extintores señalizados"
        },
        {
          "id": "item_023",
          "type": "verificacion",
          "label": "Tableros señalizados."
        },
        {
          "id": "item_024",
          "type": "verificacion",
          "label": "Estanques en buenas condiciones"
        },
        {
          "id": "item_025",
          "type": "verificacion",
          "label": "Equipos adecuados para emergencia."
        },
        {
          "id": "item_026",
          "type": "verificacion",
          "label": "Procedimientos para impacto ambiental"
        },
        {
          "id": "item_027",
          "type": "verificacion",
          "label": "Accesos a sala libres se obstrucción"
        },
        {
          "id": "item_028",
          "type": "verificacion",
          "label": "Puertas de sala en buenas condiciones (cerradas)"
        },
        {
          "id": "item_029",
          "type": "verificacion",
          "label": "Planos de equipo en terreno."
        },
        {
          "id": "item_030",
          "type": "verificacion",
          "label": "Estado de tablero de transferencia"
        }
      ]
    }
  ],
  "nomenclature": "NT: NO TIENE / BN: BUENO / ML: MALO / NA: NO APLICA / NR: No Realizada (Indicar motivos en observaciones)",
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'grupo_generador' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- INSP-17 · EST-ELEC-INSP-MLP-Bbosch-17 · Inspección de Cargador y Banco de Baterías (24 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Inspección de Cargador y Banco de Baterías",
  "meta": {
    "norma": "EST-ELEC-INSP-MLP-Bbosch-17",
    "revision": "Abril 2024",
    "titulo": "Inspección de Cargador y Banco de Baterías"
  },
  "header": [
    {
      "key": "tag",
      "label": "TAG Equipo",
      "input": "text"
    },
    {
      "key": "ot",
      "label": "N° OT",
      "input": "text"
    },
    {
      "key": "ubicacion",
      "label": "Ubicación",
      "input": "text"
    },
    {
      "key": "fecha",
      "label": "Fecha",
      "input": "date"
    },
    {
      "key": "h_inicio",
      "label": "Hora inicio",
      "input": "time"
    },
    {
      "key": "h_fin",
      "label": "Hora término",
      "input": "time"
    },
    {
      "key": "serie",
      "label": "N° Serie",
      "input": "text",
      "required": false
    }
  ],
  "roles": [
    "Encargado de la actividad",
    "Supervisor Bbosch",
    "Planificador Bbosch"
  ],
  "sections": [
    {
      "id": "mediciones_instantaneas",
      "title": "Mediciones Instantáneas",
      "items": [
        {
          "id": "item_001",
          "type": "verificacion",
          "label": "Voltaje de Cargador de Baterías",
          "unit": "V"
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Voltaje en Banco de Baterías",
          "unit": "V"
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Voltaje en Tablero Distribución Corriente Continua",
          "unit": "V"
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Corriente en Tablero Distribución Corriente Continua",
          "unit": "A"
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Corriente salida del cargador",
          "unit": "A"
        }
      ]
    },
    {
      "id": "cargador_de_baterias",
      "title": "Cargador de Baterías",
      "items": [
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Operativo / Funcionando"
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Estado General"
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Suciedad o Polvo"
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Conexión de puesta a tierra"
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Estado General de Pintura"
        }
      ]
    },
    {
      "id": "banco_de_baterias",
      "title": "Banco de baterías",
      "items": [
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Estado General de cada Batería"
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Conexiones Borne Positivo"
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Conexiones Borne Negativo"
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Estado de Cables de conexión"
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Suciedad o Polvo"
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Signos de sulfatación"
        }
      ]
    },
    {
      "id": "indicadores_del_cargador",
      "title": "Indicadores del cargador",
      "items": [
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Entrada C.A."
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Salida C.C"
        },
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "Ec. Automática"
        },
        {
          "id": "item_020",
          "type": "verificacion",
          "label": "Ec. Manual"
        },
        {
          "id": "item_021",
          "type": "verificacion",
          "label": "Flotación"
        },
        {
          "id": "item_022",
          "type": "verificacion",
          "label": "Sobretensión"
        },
        {
          "id": "item_023",
          "type": "verificacion",
          "label": "Sobrecarga"
        },
        {
          "id": "item_024",
          "type": "verificacion",
          "label": "Cargador fuera de servicio"
        }
      ]
    }
  ],
  "nomenclature": "NT: No tiene / BN: Bueno / ML: Malo / NA: No aplica / NR: No realizada (indicar motivos en observaciones). En caso de observaciones críticas, se adjunta registro fotográfico con la referencia."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'cargador_banco_baterias' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- INSP-18 · EST-ELEC-INSP-MLP-Bbosch-18 · Inspección Semanal Grupo Generadores Chacay-Mina (31 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Inspección Semanal Grupo Generadores Chacay-Mina",
  "meta": {
    "norma": "EST-ELEC-INSP-MLP-Bbosch-18",
    "revision": "Octubre 2024",
    "titulo": "Inspección Semanal Grupo Generadores Chacay-Mina"
  },
  "header": [
    {
      "key": "tag",
      "label": "TAG Equipo",
      "input": "text"
    },
    {
      "key": "ot",
      "label": "N° OT",
      "input": "text"
    },
    {
      "key": "fecha",
      "label": "Fecha",
      "input": "date"
    },
    {
      "key": "h_inicio",
      "label": "Hora inicio",
      "input": "time"
    },
    {
      "key": "h_fin",
      "label": "Hora término",
      "input": "time"
    },
    {
      "key": "cantidad_equipos",
      "label": "Cantidad de equipos",
      "input": "text",
      "required": false
    },
    {
      "key": "horario_prueba",
      "label": "Horario de prueba",
      "input": "text",
      "required": false
    }
  ],
  "roles": [
    "Encargado de la actividad",
    "Supervisor Bbosch",
    "Planificador Bbosch"
  ],
  "sections": [
    {
      "id": "grupo_generador",
      "title": "Grupo generador",
      "items": [
        {
          "id": "item_001",
          "type": "text",
          "label": "TAG del grupo generador",
          "required": true,
          "multiline": false
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Voltaje batería",
          "unit": "V"
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Nivel de Diesel (%)",
          "unit": "%"
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Temperatura de aceite (C°)",
          "unit": "°C"
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Temperatura de Refrigerante (C°)",
          "unit": "°C"
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Revisar fugas de aceite"
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Revisar fugas de refrigerante"
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Revisar fugas de Diesel"
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Voltaje",
          "unit": "V"
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Potencia",
          "unit": "kW"
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Horómetro actual",
          "unit": "h"
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Horómetro después de la prueba",
          "unit": "h"
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Energía actual (KWH)",
          "unit": "kWh"
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Energía después de la prueba (KWH)",
          "unit": "kWh"
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Arranques",
          "unit": ""
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Nivel de agua"
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Aseo General"
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Luces piloto"
        },
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "Puertas de sala"
        },
        {
          "id": "item_020",
          "type": "verificacion",
          "label": "Acceso a equipo"
        },
        {
          "id": "item_021",
          "type": "verificacion",
          "label": "Sistema de iluminación"
        },
        {
          "id": "item_022",
          "type": "verificacion",
          "label": "Iluminación de emergencia"
        },
        {
          "id": "item_023",
          "type": "verificacion",
          "label": "Presencia de tensión de control"
        },
        {
          "id": "item_024",
          "type": "verificacion",
          "label": "Verificar interruptores de calefactores"
        },
        {
          "id": "item_025",
          "type": "verificacion",
          "label": "Tensión de cargador o mantenedor de batería",
          "unit": "V"
        },
        {
          "id": "item_026",
          "type": "verificacion",
          "label": "Corriente de cargador de batería",
          "unit": "A"
        },
        {
          "id": "item_027",
          "type": "verificacion",
          "label": "Extintores señalados"
        },
        {
          "id": "item_028",
          "type": "text",
          "label": "Fecha vencimiento extintor",
          "required": false,
          "multiline": false
        },
        {
          "id": "item_029",
          "type": "verificacion",
          "label": "Corriente fase A",
          "unit": "A"
        },
        {
          "id": "item_030",
          "type": "verificacion",
          "label": "Corriente fase B",
          "unit": "A"
        },
        {
          "id": "item_031",
          "type": "verificacion",
          "label": "Corriente fase C",
          "unit": "A"
        }
      ],
      "repetible": true
    }
  ],
  "nomenclature": "NT: NO TIENE / BN: BUENO / ML: MALO / NA: NO APLICA / NR: No Realizada / SI / NO (Indicar motivos en observaciones)",
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia. Un bloque «Grupo generador» por cada grupo probado: use «Agregar grupo generador» (sección repetible)."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'pruebas_generadores_chacay_mina' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- INSP-19 · EST-ELEC-INSP-MLP-Bbosch-19 · Inspección de Cables y Tierras de Escalerillas (4 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Inspección de Cables y Tierras de Escalerillas",
  "meta": {
    "norma": "EST-ELEC-INSP-MLP-Bbosch-19",
    "revision": "Abril 2024",
    "titulo": "Inspección de Cables y Tierras de Escalerillas"
  },
  "header": [
    {
      "key": "tag",
      "label": "TAG Equipo",
      "input": "text"
    },
    {
      "key": "ot",
      "label": "N° OT",
      "input": "text"
    },
    {
      "key": "fecha",
      "label": "Fecha",
      "input": "date"
    },
    {
      "key": "h_inicio",
      "label": "Hora inicio",
      "input": "time"
    },
    {
      "key": "h_fin",
      "label": "Hora término",
      "input": "time"
    },
    {
      "key": "correa",
      "label": "Correa",
      "input": "text",
      "required": false
    },
    {
      "key": "tramo",
      "label": "Tramo",
      "input": "text",
      "required": false
    }
  ],
  "roles": [
    "Encargado de la actividad",
    "Supervisor Bbosch",
    "Planificador Bbosch"
  ],
  "sections": [
    {
      "id": "actividades",
      "title": "Pata",
      "items": [
        {
          "id": "item_001",
          "type": "text",
          "label": "Referencia pata N°",
          "required": true,
          "multiline": false
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "¿Hay chisporoteo?"
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Voltaje tierra triada / tierra escalerilla",
          "unit": "V"
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Corriente tierra escalerrilla conectada",
          "unit": "A"
        }
      ],
      "repetible": true
    }
  ],
  "nomenclature": "NT: No tiene / BN: Bueno / ML: Malo / NA: No aplica / NR: No realizada (indicar motivos en observaciones). En caso de observaciones críticas, se adjunta registro fotográfico con la referencia.",
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico o video con la referencia. Una sección «Pata» por cada pata revisada: use «Agregar pata»."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'cables_tierras_escalerillas' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- INSP-20 · EST-ELEC-INSP-MLP-Bbosch-20 · Inspección Celda Alimentador (25 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Inspección Celda Alimentador",
  "meta": {
    "norma": "EST-ELEC-INSP-MLP-Bbosch-20",
    "revision": "Abril 2024",
    "titulo": "Inspección Celda Alimentador"
  },
  "header": [
    {
      "key": "tag",
      "label": "TAG Equipo",
      "input": "text"
    },
    {
      "key": "ot",
      "label": "N° OT",
      "input": "text"
    },
    {
      "key": "ubicacion",
      "label": "Ubicación",
      "input": "text"
    },
    {
      "key": "fecha",
      "label": "Fecha",
      "input": "date"
    },
    {
      "key": "h_inicio",
      "label": "Hora inicio",
      "input": "time"
    },
    {
      "key": "h_fin",
      "label": "Hora término",
      "input": "time"
    },
    {
      "key": "tension",
      "label": "Tensión",
      "input": "text",
      "required": false
    },
    {
      "key": "corriente",
      "label": "Corriente",
      "input": "text",
      "required": false
    },
    {
      "key": "modelo",
      "label": "Modelo",
      "input": "text",
      "required": false
    },
    {
      "key": "marca",
      "label": "Marca",
      "input": "text",
      "required": false
    }
  ],
  "roles": [
    "Encargado de la actividad",
    "Supervisor Bbosch",
    "Planificador Bbosch"
  ],
  "sections": [
    {
      "id": "actividades",
      "title": "Actividades",
      "items": [
        {
          "id": "item_001",
          "type": "verificacion",
          "label": "Celda de alimentador se encuentra cerrado."
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Verificar resorte cargado."
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Verificar estado de bloqueo mecánico de puerta acceso"
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Verificación estado de cuchillo de cierre."
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Verificar estado de mecanismo de cierre."
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Verificar estado de palanca de apertura y cierre."
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Contaminación de la celda interior."
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Contaminación de la celda exterior."
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Verificar estado de hermeticidad."
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Verificar anomalías en pernos de conexiones."
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Verificar fusibles en buen estado."
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Verificar estado de pintura de equipo y señales de corrosión."
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Verificar funcionamiento alumbrado emergencia."
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Verificar limpieza en general del equipo."
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Cerco perimetral está en buenas condiciones."
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Cerco perimetral está señalizado."
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Existe sistema de amago incendio y vigente."
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Breacker de control cerrados"
        },
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "Verificar estado de conexiones de control"
        },
        {
          "id": "item_020",
          "type": "verificacion",
          "label": "Luz interior en buen estado"
        },
        {
          "id": "item_021",
          "type": "verificacion",
          "label": "Estado del indicador de Tensión"
        },
        {
          "id": "item_022",
          "type": "verificacion",
          "label": "Verificación de cambio de color de barras por temperatura"
        },
        {
          "id": "item_023",
          "type": "verificacion",
          "label": "Verificar los Shield y tierras de Celda"
        },
        {
          "id": "item_024",
          "type": "verificacion",
          "label": "Estado de los aisladores internos"
        },
        {
          "id": "item_025",
          "type": "verificacion",
          "label": "Existen planos del equipo en terreno"
        }
      ]
    }
  ],
  "nomenclature": "NT: NO TIENE / BN: BUENO / ML: MALO / NA: NO APLICA / NR: No Realizada (Indicar motivos en observaciones)",
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'celda_alimentador_23kv' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- INSP-21 · EST-ELEC-MLP-Bbosch-21 · Inspección Cruce de Camino (8 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Inspección Cruce de Camino",
  "meta": {
    "norma": "EST-ELEC-MLP-Bbosch-21",
    "revision": "Abril 2024",
    "titulo": "Inspección Cruce de Camino"
  },
  "header": [
    {
      "key": "tag",
      "label": "TAG Equipo",
      "input": "text"
    },
    {
      "key": "ot",
      "label": "N° OT",
      "input": "text"
    },
    {
      "key": "ubicacion",
      "label": "Ubicación",
      "input": "text"
    },
    {
      "key": "fecha",
      "label": "Fecha",
      "input": "date"
    },
    {
      "key": "h_inicio",
      "label": "Hora inicio",
      "input": "time"
    },
    {
      "key": "h_fin",
      "label": "Hora término",
      "input": "time"
    }
  ],
  "roles": [
    "Encargado de la actividad",
    "Supervisor Bbosch",
    "Planificador Bbosch"
  ],
  "sections": [
    {
      "id": "actividades",
      "title": "Actividades",
      "items": [
        {
          "id": "item_001",
          "type": "verificacion",
          "label": "Verificar los accesos (accesos en buenas condiciones)"
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "El cruce camino es tipo subterráneo (Si / No)"
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Existe señaléticapara identificar cruce de camino."
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Señalética se encuentra bien afianzada y posicionada."
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Se observa cable o tuberías en cruce de camino subterráneo por reparación o nivelación del camino"
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Existen tuberías PVC en ambos entremos para la identificación del cruce."
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "En cable de MT próximo al cruce camino, existen coligues según distancia establecida en procedimiento “instalación de coligues área mina”."
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Cruce camino se encuentra en un camino principal, secundario o periférico"
        }
      ]
    }
  ],
  "nomenclature": "NT: NO TIENE / BN: BUENO / ML: MALO / NA: NO APLICA / NR: No Realizada (Indicar motivos en observaciones)",
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'cruce_camino_mina' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- INSP-22 · EST-ELEC-MLP-Bbosch-22 · Inspección de Luminaria (18 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Inspección de Luminaria",
  "meta": {
    "norma": "EST-ELEC-MLP-Bbosch-22",
    "revision": "Abril 2024",
    "titulo": "Inspección de Luminaria"
  },
  "header": [
    {
      "key": "tag",
      "label": "TAG Equipo",
      "input": "text"
    },
    {
      "key": "ot",
      "label": "N° OT",
      "input": "text"
    },
    {
      "key": "ubicacion",
      "label": "Ubicación",
      "input": "text"
    },
    {
      "key": "fecha",
      "label": "Fecha",
      "input": "date"
    },
    {
      "key": "h_inicio",
      "label": "Hora inicio",
      "input": "time"
    },
    {
      "key": "h_fin",
      "label": "Hora término",
      "input": "time"
    }
  ],
  "roles": [
    "Encargado de la actividad",
    "Supervisor Bbosch",
    "Planificador Bbosch"
  ],
  "sections": [
    {
      "id": "actividades",
      "title": "Actividades",
      "items": [
        {
          "id": "item_001",
          "type": "text",
          "label": "Tipo de luminaria.",
          "required": false,
          "multiline": false
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Estado de chasis o carcasa."
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Estado de reflector."
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Estado de refractor o difusor."
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Estado portalámparas."
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Estado soporte portalámparas (Poste u otro)"
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Punto de conexión."
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Hermeticidad."
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Aterrizado."
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Fijación"
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Eficiencia luminosa"
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Brazo"
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Base foto control"
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Tipo bombilla o lámpara."
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Emite ruido."
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Fusible"
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Cámara de registro"
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Registro de tensión"
        }
      ]
    }
  ],
  "nomenclature": "NT: NO TIENE / BN: BUENO / ML: MALO / NA: NO APLICA / NR: No Realizada (Indicar motivos en observaciones)",
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'luminarias' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- INSP-23 · EST-ELEC-MLP-Bbosch-23 · Inspección Tablero Eléctrico BT (20 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Inspección Tablero Eléctrico BT",
  "meta": {
    "norma": "EST-ELEC-MLP-Bbosch-23",
    "revision": "Abril 2024",
    "titulo": "Inspección Tablero Eléctrico BT"
  },
  "header": [
    {
      "key": "tag",
      "label": "TAG Equipo",
      "input": "text"
    },
    {
      "key": "ot",
      "label": "N° OT",
      "input": "text"
    },
    {
      "key": "ubicacion",
      "label": "Ubicación",
      "input": "text"
    },
    {
      "key": "fecha",
      "label": "Fecha",
      "input": "date"
    },
    {
      "key": "h_inicio",
      "label": "Hora inicio",
      "input": "time"
    },
    {
      "key": "h_fin",
      "label": "Hora término",
      "input": "time"
    },
    {
      "key": "potencia",
      "label": "Potencia",
      "input": "text",
      "required": false
    }
  ],
  "roles": [
    "Encargado de la actividad",
    "Supervisor Bbosch",
    "Planificador Bbosch"
  ],
  "sections": [
    {
      "id": "actividades",
      "title": "Actividades",
      "items": [
        {
          "id": "item_001",
          "type": "verificacion",
          "label": "Estado exterior de tablero"
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Estado de puerta"
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Estado de puerta interior."
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Estado de acrílico."
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Verificar presencia de tensión."
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Capacidad Interruptor General (A)",
          "unit": "A"
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Estado de luces pilotos"
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Estado de bornera."
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Estado barra tierra."
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Verificación de puesta a tierra en tablero y puerta"
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Aseo general"
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Tableros señalizados."
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Accesos a tablero libres de obstrucción"
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Diagrama unilineal en tablero"
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Estado de cables."
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Estado de terminales"
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Circuitos identificados."
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Sistema de bloqueo existente."
        },
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "Existe tarjeta de bloqueo operacional"
        },
        {
          "id": "item_020",
          "type": "verificacion",
          "label": "Sellado de tablero"
        }
      ]
    }
  ],
  "nomenclature": "NT: NO TIENE / BN: BUENO / ML: MALO / NA: NO APLICA / NR: No Realizada (Indicar motivos en observaciones)",
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'tablero_electrico_bt' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- INSP-24 · EST-ELEC-MLP-Bbosch-24 · Inspección Semanal Grupo Generadores (25 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Inspección Semanal Grupo Generadores",
  "meta": {
    "norma": "EST-ELEC-MLP-Bbosch-24",
    "revision": "Abril 2024",
    "titulo": "Inspección Semanal Grupo Generadores"
  },
  "header": [
    {
      "key": "tag",
      "label": "TAG Equipo",
      "input": "text"
    },
    {
      "key": "ot",
      "label": "N° OT",
      "input": "text"
    },
    {
      "key": "fecha",
      "label": "Fecha",
      "input": "date"
    },
    {
      "key": "h_inicio",
      "label": "Hora inicio",
      "input": "time"
    },
    {
      "key": "h_fin",
      "label": "Hora término",
      "input": "time"
    },
    {
      "key": "parque",
      "label": "Nombre parque de generación",
      "input": "text",
      "required": false
    },
    {
      "key": "cantidad_equipos",
      "label": "Cantidad de equipos",
      "input": "text",
      "required": false
    },
    {
      "key": "horario_prueba",
      "label": "Horario de prueba",
      "input": "text",
      "required": false
    },
    {
      "key": "horario_termino",
      "label": "Horario de término de pruebas",
      "input": "text",
      "required": false
    },
    {
      "key": "potencia_total_del_parqu",
      "label": "Potencia total del Parque",
      "input": "text",
      "required": false
    }
  ],
  "roles": [
    "Encargado de la actividad",
    "Supervisor Bbosch",
    "Planificador Bbosch"
  ],
  "sections": [
    {
      "id": "grupo_generador",
      "title": "Grupo generador",
      "items": [
        {
          "id": "item_001",
          "type": "text",
          "label": "TAG del grupo generador",
          "required": true,
          "multiline": false
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Estado de Filtro de aire de sala."
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Estado de Filtro de aire de equipo."
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Tensión cargador de baterías.",
          "unit": "V"
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Nivel Estanque petróleo."
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Estado de luces pilotos."
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Filtraciones de petróleo."
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Filtraciones de agua."
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Nivel de Agua."
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Verificar Tº de aceite",
          "unit": "°C"
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Verificación de puesta a tierra de GG."
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Verificar limpieza y estado de Pisos."
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Aseo general"
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Sistema de iluminación interior."
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Sistema de iluminación de emergencia."
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Sistema de detección de incendio."
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Extintores vigentes"
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Tableros señalizados."
        },
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "Equipos básico contención de derrames (Pala de bronce, absorbente, balde plástico, arena)"
        },
        {
          "id": "item_020",
          "type": "verificacion",
          "label": "Accesos a sala libres de obstrucción"
        },
        {
          "id": "item_021",
          "type": "verificacion",
          "label": "Puertas de sala en buenas condiciones (permiten el ingreso seguro)"
        },
        {
          "id": "item_022",
          "type": "verificacion",
          "label": "Verificar presencia de alarmas en equipos antes de prueba"
        },
        {
          "id": "item_023",
          "type": "verificacion",
          "label": "Verificar tensión de GG 400/231 V, (Durante operación)"
        },
        {
          "id": "item_024",
          "type": "verificacion",
          "label": "Verificar presencia de alarmas en equipos después de prueba"
        }
      ],
      "repetible": true
    },
    {
      "id": "galeria_fotografica",
      "title": "Galería fotográfica",
      "items": [
        {
          "id": "item_025",
          "type": "photo",
          "label": "Galería fotográfica",
          "required": false,
          "maxPhotos": 6
        }
      ]
    }
  ],
  "nomenclature": "NT: NO TIENE / BN: BUENO / ML: MALO / NA: NO APLICA / NR: No Realizada / SI / NO (Indicar motivos en observaciones)",
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia. Un bloque «Grupo generador» por cada grupo probado: use «Agregar grupo generador» (sección repetible)."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'parque_generador' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- INSP-25 · EST-ELEC-MLP-Bbosch-25 · Inspección Filtro Armónico STATCOM (94 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Inspección Filtro Armónico STATCOM",
  "meta": {
    "norma": "EST-ELEC-MLP-Bbosch-25",
    "revision": "1 julio 2024",
    "titulo": "Inspección Filtro Armónico STATCOM"
  },
  "header": [
    {
      "key": "tag",
      "label": "TAG Equipo",
      "input": "text"
    },
    {
      "key": "ot",
      "label": "N° OT",
      "input": "text"
    },
    {
      "key": "ubicacion",
      "label": "Ubicación",
      "input": "text"
    },
    {
      "key": "fecha",
      "label": "Fecha",
      "input": "date"
    },
    {
      "key": "h_inicio",
      "label": "Hora inicio",
      "input": "time"
    },
    {
      "key": "h_fin",
      "label": "Hora término",
      "input": "time"
    }
  ],
  "roles": [
    "Encargado de la actividad",
    "Supervisor Bbosch",
    "Planificador Bbosch"
  ],
  "sections": [
    {
      "id": "interruptor_qs2_740_cb_5015",
      "title": "Interruptor -QS2 (-740-CB-5015)",
      "items": [
        {
          "id": "item_001",
          "type": "verificacion",
          "label": "Aisladores"
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Puesta a tierra"
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Registrar presión SF6",
          "unit": ""
        }
      ]
    },
    {
      "id": "resistor_ra1_l1_740_rd_5017_l1",
      "title": "Resistor -RA1.L1 (-740-RD-5017-L1)",
      "items": [
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Aislador pedestal (4 und)"
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Aislador unión a tierra (3 und)"
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "resistor_ra1_l2_740_rd_5017_l2",
      "title": "Resistor -RA1.L2 (-740-RD-5017-L2)",
      "items": [
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Aislador pedestal (4 und)"
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Aislador unión a tierra (3 und)"
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "resistor_ra1_l3_740_rd_5017_l3",
      "title": "Resistor -RA1.L3 (740-RD-5017-L3)",
      "items": [
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Aislador pedestal (4 und)"
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Aislador unión a tierra (3 und)"
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "condensador_l1_740_xc_5019_l1",
      "title": "Condensador L1 (-740-XC-5019-L1)",
      "items": [
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "Aisladores de conexión"
        },
        {
          "id": "item_020",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_021",
          "type": "verificacion",
          "label": "Mancha de aceite"
        },
        {
          "id": "item_022",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_023",
          "type": "verificacion",
          "label": "Deformación de condensador (Hinchado)"
        },
        {
          "id": "item_024",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "condensador_l2_740_xc_5019_l2",
      "title": "Condensador L2 (-740-XC-5019-L2)",
      "items": [
        {
          "id": "item_025",
          "type": "verificacion",
          "label": "Aisladores de conexión"
        },
        {
          "id": "item_026",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_027",
          "type": "verificacion",
          "label": "Mancha de aceite"
        },
        {
          "id": "item_028",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_029",
          "type": "verificacion",
          "label": "Deformación de condensador (Hinchado)"
        },
        {
          "id": "item_030",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "condensador_l3_740_xc_5019_l3",
      "title": "Condensador L3 (-740-XC-5019-L3)",
      "items": [
        {
          "id": "item_031",
          "type": "verificacion",
          "label": "Aisladores de conexión"
        },
        {
          "id": "item_032",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_033",
          "type": "verificacion",
          "label": "Mancha de aceite"
        },
        {
          "id": "item_034",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_035",
          "type": "verificacion",
          "label": "Deformación de condensador (Hinchado)"
        },
        {
          "id": "item_036",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "resistor_ra2_l1_741_rd_5018_l1",
      "title": "Resistor RA2,L1 (-741-RD-5018-L1)",
      "items": [
        {
          "id": "item_037",
          "type": "verificacion",
          "label": "Aislador pedestal (4 und)"
        },
        {
          "id": "item_038",
          "type": "verificacion",
          "label": "Aislador entrada"
        },
        {
          "id": "item_039",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_040",
          "type": "verificacion",
          "label": "Decoloración barra unión de conexión por exceso T°"
        },
        {
          "id": "item_041",
          "type": "verificacion",
          "label": "Aislador de salida"
        },
        {
          "id": "item_042",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_043",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "resistor_ra2_l2_741_rd_5018_l2",
      "title": "Resistor RA2,L2 (-741-RD-5018-L2)",
      "items": [
        {
          "id": "item_044",
          "type": "verificacion",
          "label": "Aislador pedestal (4 und)"
        },
        {
          "id": "item_045",
          "type": "verificacion",
          "label": "Aislador entrada"
        },
        {
          "id": "item_046",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_047",
          "type": "verificacion",
          "label": "Decoloración barra unión de conexión por exceso T°"
        },
        {
          "id": "item_048",
          "type": "verificacion",
          "label": "Aislador de salida"
        },
        {
          "id": "item_049",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_050",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "resistor_ra2_l3_741_rd_5018_l3",
      "title": "Resistor RA2,L3 (-741-RD-5018-L3)",
      "items": [
        {
          "id": "item_051",
          "type": "verificacion",
          "label": "Aislador pedestal (4 und)"
        },
        {
          "id": "item_052",
          "type": "verificacion",
          "label": "Aislador entrada"
        },
        {
          "id": "item_053",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_054",
          "type": "verificacion",
          "label": "Decoloración barra unión de conexión por exceso T°"
        },
        {
          "id": "item_055",
          "type": "verificacion",
          "label": "Aislador de salida"
        },
        {
          "id": "item_056",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_057",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "inductor_l1_741_xl_5001_l1l2",
      "title": "Inductor L1 (-741-XL-5001-L1L2)",
      "items": [
        {
          "id": "item_058",
          "type": "verificacion",
          "label": "Aislador pedestal (4 und)"
        },
        {
          "id": "item_059",
          "type": "verificacion",
          "label": "Aislador entrada"
        },
        {
          "id": "item_060",
          "type": "verificacion",
          "label": "Aislador de salida"
        },
        {
          "id": "item_061",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_062",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "inductor_l2_741_xl_5001_l2l3",
      "title": "Inductor L2 (-741-XL-5001-L2L3)",
      "items": [
        {
          "id": "item_063",
          "type": "verificacion",
          "label": "Aislador pedestal (4 und)"
        },
        {
          "id": "item_064",
          "type": "verificacion",
          "label": "Aislador entrada"
        },
        {
          "id": "item_065",
          "type": "verificacion",
          "label": "Aislador de salida"
        },
        {
          "id": "item_066",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_067",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "inductor_l3_741_xl_5001_l3l1",
      "title": "Inductor L3 (-741-XL-5001-L3L1)",
      "items": [
        {
          "id": "item_068",
          "type": "verificacion",
          "label": "Aislador pedestal (4 und)"
        },
        {
          "id": "item_069",
          "type": "verificacion",
          "label": "Aislador entrada"
        },
        {
          "id": "item_070",
          "type": "verificacion",
          "label": "Aislador de salida"
        },
        {
          "id": "item_071",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_072",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "barra_linea_1",
      "title": "Barra Línea 1",
      "items": [
        {
          "id": "item_073",
          "type": "verificacion",
          "label": "Decoloración por exceso T° en terminales"
        },
        {
          "id": "item_074",
          "type": "verificacion",
          "label": "Aisladores"
        },
        {
          "id": "item_075",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "barra_linea_2",
      "title": "Barra Línea 2",
      "items": [
        {
          "id": "item_076",
          "type": "verificacion",
          "label": "Decoloración por exceso T° en terminales"
        },
        {
          "id": "item_077",
          "type": "verificacion",
          "label": "Aisladores"
        },
        {
          "id": "item_078",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "barra_linea_3",
      "title": "Barra Línea 3",
      "items": [
        {
          "id": "item_079",
          "type": "verificacion",
          "label": "Decoloración por exceso T° en terminales"
        },
        {
          "id": "item_080",
          "type": "verificacion",
          "label": "Aisladores"
        },
        {
          "id": "item_081",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "tc_l1",
      "title": "TC L1",
      "items": [
        {
          "id": "item_082",
          "type": "verificacion",
          "label": "Decoloración por exceso T° en terminales"
        },
        {
          "id": "item_083",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "tc_l2",
      "title": "TC L2",
      "items": [
        {
          "id": "item_084",
          "type": "verificacion",
          "label": "Decoloración por exceso T° en terminales"
        },
        {
          "id": "item_085",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "tc_l3",
      "title": "TC L3",
      "items": [
        {
          "id": "item_086",
          "type": "verificacion",
          "label": "Decoloración por exceso T° en terminales"
        },
        {
          "id": "item_087",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "puerta_acceso_k2h",
      "title": "Puerta acceso K2H",
      "items": [
        {
          "id": "item_088",
          "type": "verificacion",
          "label": "Chapa de acceso con llave"
        },
        {
          "id": "item_089",
          "type": "verificacion",
          "label": "Señalética"
        },
        {
          "id": "item_090",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "puerta_acceso_k3h",
      "title": "Puerta acceso K3H",
      "items": [
        {
          "id": "item_091",
          "type": "verificacion",
          "label": "Chapa de acceso con llave"
        },
        {
          "id": "item_092",
          "type": "verificacion",
          "label": "Señalética"
        },
        {
          "id": "item_093",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "galeria_fotografica",
      "title": "Galería fotográfica",
      "items": [
        {
          "id": "item_094",
          "type": "photo",
          "label": "Galería fotográfica",
          "required": false,
          "maxPhotos": 6
        }
      ]
    }
  ],
  "nomenclature": "NT: NO TIENE / BN: BUENO / ML: MALO / NA: NO APLICA / NR: No Realizada (Indicar motivos en observaciones)",
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia"
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'filtro_armonico_statcom' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- INSP-26 · EST-ELEC-INSP-MLP-Bbosch-26 · Inspección de Tablero de Respaldo UPS (29 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Inspección de Tablero de Respaldo UPS",
  "meta": {
    "norma": "EST-ELEC-INSP-MLP-Bbosch-26",
    "revision": "Enero 2024",
    "titulo": "Inspección de Tablero de Respaldo UPS"
  },
  "header": [
    {
      "key": "tag",
      "label": "TAG Equipo",
      "input": "text"
    },
    {
      "key": "ot",
      "label": "N° OT",
      "input": "text"
    },
    {
      "key": "ubicacion",
      "label": "Ubicación",
      "input": "text"
    },
    {
      "key": "fecha",
      "label": "Fecha",
      "input": "date"
    },
    {
      "key": "h_inicio",
      "label": "Hora inicio",
      "input": "time"
    },
    {
      "key": "h_fin",
      "label": "Hora término",
      "input": "time"
    },
    {
      "key": "capacidad",
      "label": "Capacidad",
      "input": "text",
      "required": false
    },
    {
      "key": "marca",
      "label": "Marca",
      "input": "text",
      "required": false
    }
  ],
  "roles": [
    "Encargado de la actividad",
    "Supervisor Bbosch",
    "Planificador Bbosch"
  ],
  "sections": [
    {
      "id": "mediciones_instantaneas",
      "title": "Mediciones Instantáneas",
      "items": [
        {
          "id": "item_001",
          "type": "verificacion",
          "label": "Voltaje a la entrada de UPS",
          "unit": "V"
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Voltaje a la salida de UPS",
          "unit": "V"
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Registro de corriente de consumo",
          "unit": "A"
        }
      ]
    },
    {
      "id": "cargador_de_baterias",
      "title": "Cargador de Baterías",
      "items": [
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Operativo / Funcionando"
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Estado General"
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Suciedad o Polvo"
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Conexión de puesta a tierra"
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Estado General de Pintura"
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Verificar Amperaje de Protecciones"
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Verificar estado de UPS"
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Verificar si Equipo cuenta con Comunicación"
        },
        {
          "id": "item_012",
          "type": "text",
          "label": "Verificar Marca Equipo de Comunicación",
          "required": false,
          "multiline": false
        },
        {
          "id": "item_013",
          "type": "text",
          "label": "Verificar Modelo de Equipo de Comunicación",
          "required": false,
          "multiline": false
        },
        {
          "id": "item_014",
          "type": "text",
          "label": "Verificar N° de Serie de Equipo",
          "required": false,
          "multiline": false
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Verificar Grado de Protección IP Equipo"
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Verificar Estado de los Convertidores de Señal"
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Verificar Tipo de Conversores"
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Verificar Hermeticidad Tablero"
        },
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "Estado de Acometida de Tablero de Control"
        },
        {
          "id": "item_020",
          "type": "verificacion",
          "label": "Equipo cuenta con su Planos"
        },
        {
          "id": "item_021",
          "type": "verificacion",
          "label": "Estado de Cerradura de Tablero"
        },
        {
          "id": "item_022",
          "type": "verificacion",
          "label": "Equipo cuenta con TAG"
        },
        {
          "id": "item_023",
          "type": "verificacion",
          "label": "Estado de Limpieza de Equipo"
        }
      ]
    },
    {
      "id": "banco_de_baterias",
      "title": "Banco de baterías",
      "items": [
        {
          "id": "item_024",
          "type": "verificacion",
          "label": "Estado General de cada Batería"
        },
        {
          "id": "item_025",
          "type": "verificacion",
          "label": "Conexiones Borne Positivo"
        },
        {
          "id": "item_026",
          "type": "verificacion",
          "label": "Conexiones Borne Negativo"
        },
        {
          "id": "item_027",
          "type": "verificacion",
          "label": "Estado de Cables de conexión"
        },
        {
          "id": "item_028",
          "type": "verificacion",
          "label": "Suciedad o Polvo"
        }
      ]
    },
    {
      "id": "galeria_fotografica",
      "title": "Galería fotográfica",
      "items": [
        {
          "id": "item_029",
          "type": "photo",
          "label": "Galería fotográfica",
          "required": false,
          "maxPhotos": 6
        }
      ]
    }
  ],
  "nomenclature": "NT: No tiene / BN: Bueno / ML: Malo / NA: No aplica / NR: No realizada (indicar motivos en observaciones). En caso de observaciones críticas, se adjunta registro fotográfico con la referencia."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'tablero_respaldo_ups' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- INSP-27 · EST-ELEC-MLP-Bbosch-27 · Inspección Filtro Molino Bolas 0740-HF-5002 (142 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Inspección Filtro Molino Bolas 0740-HF-5002",
  "meta": {
    "norma": "EST-ELEC-MLP-Bbosch-27",
    "revision": "16 agosto 2024",
    "titulo": "Inspección Filtro Molino Bolas 0740-HF-5002"
  },
  "header": [
    {
      "key": "tag",
      "label": "TAG Equipo",
      "input": "text"
    },
    {
      "key": "ot",
      "label": "N° OT",
      "input": "text"
    },
    {
      "key": "ubicacion",
      "label": "Ubicación",
      "input": "text"
    },
    {
      "key": "fecha",
      "label": "Fecha",
      "input": "date"
    },
    {
      "key": "h_inicio",
      "label": "Hora inicio",
      "input": "time"
    },
    {
      "key": "h_fin",
      "label": "Hora término",
      "input": "time"
    }
  ],
  "roles": [
    "Encargado de la actividad",
    "Supervisor Bbosch",
    "Planificador Bbosch"
  ],
  "sections": [
    {
      "id": "componente",
      "title": "Desconectador línea (740-HF-5002-SW1)",
      "items": [
        {
          "id": "item_001",
          "type": "verificacion",
          "label": "Condictiones Físicas y Mecanicas"
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Estados de contactos y lubricacion"
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Conexiones electricas; cables, mufas."
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Aisladores"
        }
      ]
    },
    {
      "id": "interruptor_cb1_740_hf_5002_cb",
      "title": "Interruptor CB1 (740-HF-5002-CB1)",
      "items": [
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Ailadores"
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Registrar presion SF6",
          "unit": ""
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_2",
      "title": "Resistor (740-HF-5002-01-RDA)",
      "items": [
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Aislador pedestal (3 und)"
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Aislador unión a tierra (1 und)"
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Aislador conexión línea (1 und)"
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_3",
      "title": "Resistor (740-HF-5002-01-RDB)",
      "items": [
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Aislador pedestal (3 und)"
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Aislador unión a tierra (1 und)"
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Aislador conexión línea (1 und)"
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_4",
      "title": "Resistor (740-HF-5002-01-RDC)",
      "items": [
        {
          "id": "item_020",
          "type": "verificacion",
          "label": "Aislador pedestal (3 und)"
        },
        {
          "id": "item_021",
          "type": "verificacion",
          "label": "Aislador unión a tierra (1 und)"
        },
        {
          "id": "item_022",
          "type": "verificacion",
          "label": "Aislador conexión línea (1 und)"
        },
        {
          "id": "item_023",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_024",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_025",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_5",
      "title": "Inductor (0740-HF-5002-01-XLA)",
      "items": [
        {
          "id": "item_026",
          "type": "verificacion",
          "label": "Aislador pedestal (3 und)"
        },
        {
          "id": "item_027",
          "type": "verificacion",
          "label": "Conexión entrada"
        },
        {
          "id": "item_028",
          "type": "verificacion",
          "label": "Conexión salida"
        },
        {
          "id": "item_029",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_030",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_6",
      "title": "Inductor (0740-HF-5002-01-XLB)",
      "items": [
        {
          "id": "item_031",
          "type": "verificacion",
          "label": "Aislador pedestal (3 und)"
        },
        {
          "id": "item_032",
          "type": "verificacion",
          "label": "Conexión entrada"
        },
        {
          "id": "item_033",
          "type": "verificacion",
          "label": "Conexión salida"
        },
        {
          "id": "item_034",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_035",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_7",
      "title": "Inductor (0740-HF-5002-01-XLC)",
      "items": [
        {
          "id": "item_036",
          "type": "verificacion",
          "label": "Aislador pedestal (3 und)"
        },
        {
          "id": "item_037",
          "type": "verificacion",
          "label": "Conexión entrada"
        },
        {
          "id": "item_038",
          "type": "verificacion",
          "label": "Conexión salida"
        },
        {
          "id": "item_039",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_040",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_8",
      "title": "Capacitor (0740-HF-5002-01-XCA)",
      "items": [
        {
          "id": "item_041",
          "type": "verificacion",
          "label": "Aislador pedestal (3 und)"
        },
        {
          "id": "item_042",
          "type": "verificacion",
          "label": "Aislador conexión"
        },
        {
          "id": "item_043",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_044",
          "type": "verificacion",
          "label": "Bushing condensadores"
        },
        {
          "id": "item_045",
          "type": "verificacion",
          "label": "Deformación condensador"
        },
        {
          "id": "item_046",
          "type": "verificacion",
          "label": "Filtración de aceite"
        },
        {
          "id": "item_047",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_048",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_9",
      "title": "Capacitor (0740-HF-5002-01-XCB)",
      "items": [
        {
          "id": "item_049",
          "type": "verificacion",
          "label": "Aislador pedestal (3 und)"
        },
        {
          "id": "item_050",
          "type": "verificacion",
          "label": "Aislador conexión"
        },
        {
          "id": "item_051",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_052",
          "type": "verificacion",
          "label": "Bushing condensadores"
        },
        {
          "id": "item_053",
          "type": "verificacion",
          "label": "Deformación condensador"
        },
        {
          "id": "item_054",
          "type": "verificacion",
          "label": "Filtración de aceite"
        },
        {
          "id": "item_055",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_056",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_10",
      "title": "Capacitor (0740-HF-5002-01-XCC)",
      "items": [
        {
          "id": "item_057",
          "type": "verificacion",
          "label": "Aislador pedestal (3 und)"
        },
        {
          "id": "item_058",
          "type": "verificacion",
          "label": "Aislador conexión"
        },
        {
          "id": "item_059",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_060",
          "type": "verificacion",
          "label": "Bushing condensadores"
        },
        {
          "id": "item_061",
          "type": "verificacion",
          "label": "Deformación condensador"
        },
        {
          "id": "item_062",
          "type": "verificacion",
          "label": "Filtración de aceite"
        },
        {
          "id": "item_063",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_064",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_11",
      "title": "Desconectador tierra (0740-HF-5002-01-SWT01)",
      "items": [
        {
          "id": "item_065",
          "type": "verificacion",
          "label": "Condictiones Físicas y Mecanicas"
        },
        {
          "id": "item_066",
          "type": "verificacion",
          "label": "Estados de contactos y lubricacion"
        },
        {
          "id": "item_067",
          "type": "verificacion",
          "label": "Aisladores"
        },
        {
          "id": "item_068",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_12",
      "title": "Resistor (740-HF-5002-02-RDA)",
      "items": [
        {
          "id": "item_069",
          "type": "verificacion",
          "label": "Aislador pedestal (3 und)"
        },
        {
          "id": "item_070",
          "type": "verificacion",
          "label": "Aislador unión a tierra (1 und)"
        },
        {
          "id": "item_071",
          "type": "verificacion",
          "label": "Aislador conexión línea (1 und)"
        },
        {
          "id": "item_072",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_073",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_074",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_13",
      "title": "Resistor (740-HF-5002-02-RDB)",
      "items": [
        {
          "id": "item_075",
          "type": "verificacion",
          "label": "Aislador pedestal (3 und)"
        },
        {
          "id": "item_076",
          "type": "verificacion",
          "label": "Aislador unión a tierra (1 und)"
        },
        {
          "id": "item_077",
          "type": "verificacion",
          "label": "Aislador conexión línea (1 und)"
        },
        {
          "id": "item_078",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_079",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_080",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_14",
      "title": "Resistor (740-HF-5002-02-RDC)",
      "items": [
        {
          "id": "item_081",
          "type": "verificacion",
          "label": "Aislador pedestal (3 und)"
        },
        {
          "id": "item_082",
          "type": "verificacion",
          "label": "Aislador unión a tierra (1 und)"
        },
        {
          "id": "item_083",
          "type": "verificacion",
          "label": "Aislador conexión línea (1 und)"
        },
        {
          "id": "item_084",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_085",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_086",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_15",
      "title": "Inductor (0740-HF-5002-02-XLA)",
      "items": [
        {
          "id": "item_087",
          "type": "verificacion",
          "label": "Aislador pedestal (3 und)"
        },
        {
          "id": "item_088",
          "type": "verificacion",
          "label": "Conexión entrada"
        },
        {
          "id": "item_089",
          "type": "verificacion",
          "label": "Conexión salida"
        },
        {
          "id": "item_090",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_091",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_16",
      "title": "Inductor (0740-HF-5001-02-XLB)",
      "items": [
        {
          "id": "item_092",
          "type": "verificacion",
          "label": "Aislador pedestal (3 und)"
        },
        {
          "id": "item_093",
          "type": "verificacion",
          "label": "Conexión entrada"
        },
        {
          "id": "item_094",
          "type": "verificacion",
          "label": "Conexión salida"
        },
        {
          "id": "item_095",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_096",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_17",
      "title": "Inductor (0740-HF-5002-02-XLC)",
      "items": [
        {
          "id": "item_097",
          "type": "verificacion",
          "label": "Aislador pedestal (3 und)"
        },
        {
          "id": "item_098",
          "type": "verificacion",
          "label": "Conexión entrada"
        },
        {
          "id": "item_099",
          "type": "verificacion",
          "label": "Conexión salida"
        },
        {
          "id": "item_100",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_101",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_18",
      "title": "Capacitor (0740-HF-5002-02-XCA)",
      "items": [
        {
          "id": "item_102",
          "type": "verificacion",
          "label": "Aislador pedestal (3 und)"
        },
        {
          "id": "item_103",
          "type": "verificacion",
          "label": "Aislador conexión"
        },
        {
          "id": "item_104",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_105",
          "type": "verificacion",
          "label": "Bushing condensadores"
        },
        {
          "id": "item_106",
          "type": "verificacion",
          "label": "Deformación condensador"
        },
        {
          "id": "item_107",
          "type": "verificacion",
          "label": "Filtración de aceite"
        },
        {
          "id": "item_108",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_109",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_19",
      "title": "Capacitor (0740-HF-5002-02-XCB)",
      "items": [
        {
          "id": "item_110",
          "type": "verificacion",
          "label": "Aislador pedestal (3 und)"
        },
        {
          "id": "item_111",
          "type": "verificacion",
          "label": "Aislador conexión"
        },
        {
          "id": "item_112",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_113",
          "type": "verificacion",
          "label": "Bushing condensadores"
        },
        {
          "id": "item_114",
          "type": "verificacion",
          "label": "Deformación condensador"
        },
        {
          "id": "item_115",
          "type": "verificacion",
          "label": "Filtración de aceite"
        },
        {
          "id": "item_116",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_117",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_20",
      "title": "Capacitor (740-HF-5002-02-XCC)",
      "items": [
        {
          "id": "item_118",
          "type": "verificacion",
          "label": "Aislador pedestal (3 und)"
        },
        {
          "id": "item_119",
          "type": "verificacion",
          "label": "Aislador conexión"
        },
        {
          "id": "item_120",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_121",
          "type": "verificacion",
          "label": "Bushing condensadores"
        },
        {
          "id": "item_122",
          "type": "verificacion",
          "label": "Deformación condensador"
        },
        {
          "id": "item_123",
          "type": "verificacion",
          "label": "Filtración de aceite"
        },
        {
          "id": "item_124",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_125",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_21",
      "title": "Desconectador tierra (0740-HF-5002-02-SWT02)",
      "items": [
        {
          "id": "item_126",
          "type": "verificacion",
          "label": "Condictiones Físicas y Mecanicas"
        },
        {
          "id": "item_127",
          "type": "verificacion",
          "label": "Estados de contactos y lubricacion"
        },
        {
          "id": "item_128",
          "type": "verificacion",
          "label": "Aisladores"
        },
        {
          "id": "item_129",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_22",
      "title": "Tablero electrico (0740-HF-5001-C01)",
      "items": [
        {
          "id": "item_130",
          "type": "verificacion",
          "label": "Estado tablero"
        },
        {
          "id": "item_131",
          "type": "verificacion",
          "label": "Indicador piloto"
        },
        {
          "id": "item_132",
          "type": "verificacion",
          "label": "Señaletica"
        }
      ]
    },
    {
      "id": "componente_23",
      "title": "Puerta acceso (0740-HF-5002)",
      "items": [
        {
          "id": "item_133",
          "type": "verificacion",
          "label": "Existe llave maestra de acceso"
        },
        {
          "id": "item_134",
          "type": "verificacion",
          "label": "Switch de posición"
        }
      ]
    },
    {
      "id": "componente_24",
      "title": "Pararrayos (0740-HF-5002)",
      "items": [
        {
          "id": "item_135",
          "type": "verificacion",
          "label": "Puesta a tierra"
        },
        {
          "id": "item_136",
          "type": "verificacion",
          "label": "Contador de eventos"
        }
      ]
    },
    {
      "id": "componente_25",
      "title": "Luminaria (0740-HF-5002)",
      "items": [
        {
          "id": "item_137",
          "type": "verificacion",
          "label": "Alumbrado exterior"
        }
      ]
    },
    {
      "id": "componente_26",
      "title": "Cerco perimetral (0740-HF-5002)",
      "items": [
        {
          "id": "item_138",
          "type": "verificacion",
          "label": "Estado cerco perimetral"
        },
        {
          "id": "item_139",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_27",
      "title": "Extintor (0740-HF-5002)",
      "items": [
        {
          "id": "item_140",
          "type": "verificacion",
          "label": "Estado de Extintor"
        },
        {
          "id": "item_141",
          "type": "text",
          "label": "Fecha vencimiento extintor",
          "required": false,
          "multiline": false
        }
      ]
    },
    {
      "id": "galeria_fotografica",
      "title": "Galería fotográfica",
      "items": [
        {
          "id": "item_142",
          "type": "photo",
          "label": "Galería fotográfica",
          "required": false,
          "maxPhotos": 6
        }
      ]
    }
  ],
  "nomenclature": "NT: NO TIENE / BN: BUENO / ML: MALO / NA: NO APLICA / NR: No Realizada (Indicar motivos en observaciones) / SI / NO",
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'filtro_molino_bolas_5002' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- INSP-28 · EST-ELEC-MLP-Bbosch-28 · Inspección Filtro Armónico Molino SAG 0740-HF-5001 (206 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Inspección Filtro Armónico Molino SAG 0740-HF-5001",
  "meta": {
    "norma": "EST-ELEC-MLP-Bbosch-28",
    "revision": "16 agosto 2024",
    "titulo": "Inspección Filtro Armónico Molino SAG 0740-HF-5001"
  },
  "header": [
    {
      "key": "tag",
      "label": "TAG Equipo",
      "input": "text"
    },
    {
      "key": "ot",
      "label": "N° OT",
      "input": "text"
    },
    {
      "key": "ubicacion",
      "label": "Ubicación",
      "input": "text"
    },
    {
      "key": "fecha",
      "label": "Fecha",
      "input": "date"
    },
    {
      "key": "h_inicio",
      "label": "Hora inicio",
      "input": "time"
    },
    {
      "key": "h_fin",
      "label": "Hora término",
      "input": "time"
    }
  ],
  "roles": [
    "Encargado de la actividad",
    "Supervisor Bbosch",
    "Planificador Bbosch"
  ],
  "sections": [
    {
      "id": "componente",
      "title": "Desconectador línea (740-HF-5001-SW1)",
      "items": [
        {
          "id": "item_001",
          "type": "verificacion",
          "label": "Condiciones Físicas y Mecanicas"
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Estados de contactos y lubricacion"
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Conexiones electricas; cables, mufas."
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Aisladores"
        }
      ]
    },
    {
      "id": "interruptor_cb1_740_hf_5001_cb",
      "title": "Interruptor CB1 (740-HF-5001-CB1)",
      "items": [
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Ailadores"
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Registrar presion SF6",
          "unit": ""
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "interruptor_cb2_740_hf_5001_cb",
      "title": "Interruptor CB2 (740-HF-5001-CB2)",
      "items": [
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Aisladores"
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Registrar presion SF6",
          "unit": ""
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_2",
      "title": "Resistor (740-HF-5001-01-RDA)",
      "items": [
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Aislador pedestal (4 und)"
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Aislador unión a tierra (1 und)"
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Aislador conexión línea (1 und)"
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_3",
      "title": "Resistor (740-HF-5001-01-RDB)",
      "items": [
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Aislador pedestal (4 und)"
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Aislador unión a tierra (1 und)"
        },
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "Aislador conexión línea (1 und)"
        },
        {
          "id": "item_020",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_021",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_022",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_4",
      "title": "Resistor (740-HF-5001-01-RDC)",
      "items": [
        {
          "id": "item_023",
          "type": "verificacion",
          "label": "Aislador pedestal (4 und)"
        },
        {
          "id": "item_024",
          "type": "verificacion",
          "label": "Aislador unión a tierra (1 und)"
        },
        {
          "id": "item_025",
          "type": "verificacion",
          "label": "Aislador conexión línea (1 und)"
        },
        {
          "id": "item_026",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_027",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_028",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_5",
      "title": "Inductor (0740-HF-5001-01-XLA)",
      "items": [
        {
          "id": "item_029",
          "type": "verificacion",
          "label": "Aislador pedestal (3 und)"
        },
        {
          "id": "item_030",
          "type": "verificacion",
          "label": "Conexión entrada"
        },
        {
          "id": "item_031",
          "type": "verificacion",
          "label": "Conexión salida"
        },
        {
          "id": "item_032",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_033",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_6",
      "title": "Inductor (0740-HF-5001-01-XLB)",
      "items": [
        {
          "id": "item_034",
          "type": "verificacion",
          "label": "Aislador pedestal (3 und)"
        },
        {
          "id": "item_035",
          "type": "verificacion",
          "label": "Conexión entrada"
        },
        {
          "id": "item_036",
          "type": "verificacion",
          "label": "Conexión salida"
        },
        {
          "id": "item_037",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_038",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_7",
      "title": "Inductor (0740-HF-5001-01-XLC)",
      "items": [
        {
          "id": "item_039",
          "type": "verificacion",
          "label": "Aislador pedestal (3 und)"
        },
        {
          "id": "item_040",
          "type": "verificacion",
          "label": "Conexión entrada"
        },
        {
          "id": "item_041",
          "type": "verificacion",
          "label": "Conexión salida"
        },
        {
          "id": "item_042",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_043",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_8",
      "title": "Capacitor (0740-HF-5001-01-XCA)",
      "items": [
        {
          "id": "item_044",
          "type": "verificacion",
          "label": "Aislador pedestal (4 und)"
        },
        {
          "id": "item_045",
          "type": "verificacion",
          "label": "Aislador conexión"
        },
        {
          "id": "item_046",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_047",
          "type": "verificacion",
          "label": "Bushing condensadores"
        },
        {
          "id": "item_048",
          "type": "verificacion",
          "label": "Deformación condensador"
        },
        {
          "id": "item_049",
          "type": "verificacion",
          "label": "Filtración de aceite"
        },
        {
          "id": "item_050",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_051",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_9",
      "title": "Capacitor (0740-HF-5001-01-XCB)",
      "items": [
        {
          "id": "item_052",
          "type": "verificacion",
          "label": "Aislador pedestal (4 und)"
        },
        {
          "id": "item_053",
          "type": "verificacion",
          "label": "Aislador conexión"
        },
        {
          "id": "item_054",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_055",
          "type": "verificacion",
          "label": "Bushing condensadores"
        },
        {
          "id": "item_056",
          "type": "verificacion",
          "label": "Deformación condensador"
        },
        {
          "id": "item_057",
          "type": "verificacion",
          "label": "Filtración de aceite"
        },
        {
          "id": "item_058",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_059",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_10",
      "title": "Capacitor (0740-HF-5001-01-XCC)",
      "items": [
        {
          "id": "item_060",
          "type": "verificacion",
          "label": "Aislador pedestal (4 und)"
        },
        {
          "id": "item_061",
          "type": "verificacion",
          "label": "Aislador conexión"
        },
        {
          "id": "item_062",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_063",
          "type": "verificacion",
          "label": "Bushing condensadores"
        },
        {
          "id": "item_064",
          "type": "verificacion",
          "label": "Deformación condensador"
        },
        {
          "id": "item_065",
          "type": "verificacion",
          "label": "Filtración de aceite"
        },
        {
          "id": "item_066",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_067",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_11",
      "title": "Desconectador tierra (0740-HF-5001-01-SWT01)",
      "items": [
        {
          "id": "item_068",
          "type": "verificacion",
          "label": "Condictiones Físicas y Mecanicas"
        },
        {
          "id": "item_069",
          "type": "verificacion",
          "label": "Estados de contactos y lubricacion"
        },
        {
          "id": "item_070",
          "type": "verificacion",
          "label": "Aisladores"
        },
        {
          "id": "item_071",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_12",
      "title": "Resistor (740-HF-5001-02-RDA)",
      "items": [
        {
          "id": "item_072",
          "type": "verificacion",
          "label": "Aislador pedestal (4 und)"
        },
        {
          "id": "item_073",
          "type": "verificacion",
          "label": "Aislador unión a tierra (1 und)"
        },
        {
          "id": "item_074",
          "type": "verificacion",
          "label": "Aislador conexión línea (1 und)"
        },
        {
          "id": "item_075",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_076",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_077",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_13",
      "title": "Resistor (740-HF-5001-02-RDB)",
      "items": [
        {
          "id": "item_078",
          "type": "verificacion",
          "label": "Aislador pedestal (4 und)"
        },
        {
          "id": "item_079",
          "type": "verificacion",
          "label": "Aislador unión a tierra (1 und)"
        },
        {
          "id": "item_080",
          "type": "verificacion",
          "label": "Aislador conexión línea (1 und)"
        },
        {
          "id": "item_081",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_082",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_083",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_14",
      "title": "Resistor (740-HF-5001-02-RDC)",
      "items": [
        {
          "id": "item_084",
          "type": "verificacion",
          "label": "Aislador pedestal (4 und)"
        },
        {
          "id": "item_085",
          "type": "verificacion",
          "label": "Aislador unión a tierra (1 und)"
        },
        {
          "id": "item_086",
          "type": "verificacion",
          "label": "Aislador conexión línea (1 und)"
        },
        {
          "id": "item_087",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_088",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_089",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_15",
      "title": "Inductor (0740-HF-5001-02-XLA)",
      "items": [
        {
          "id": "item_090",
          "type": "verificacion",
          "label": "Aislador pedestal (3 und)"
        },
        {
          "id": "item_091",
          "type": "verificacion",
          "label": "Conexión entrada"
        },
        {
          "id": "item_092",
          "type": "verificacion",
          "label": "Conexión salida"
        },
        {
          "id": "item_093",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_094",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_16",
      "title": "Inductor (0740-HF-5001-02-XLB)",
      "items": [
        {
          "id": "item_095",
          "type": "verificacion",
          "label": "Aislador pedestal (3 und)"
        },
        {
          "id": "item_096",
          "type": "verificacion",
          "label": "Conexión entrada"
        },
        {
          "id": "item_097",
          "type": "verificacion",
          "label": "Conexión salida"
        },
        {
          "id": "item_098",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_099",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_17",
      "title": "Inductor (0740-HF-5001-02-XLC)",
      "items": [
        {
          "id": "item_100",
          "type": "verificacion",
          "label": "Aislador pedestal (3 und)"
        },
        {
          "id": "item_101",
          "type": "verificacion",
          "label": "Conexión entrada"
        },
        {
          "id": "item_102",
          "type": "verificacion",
          "label": "Conexión salida"
        },
        {
          "id": "item_103",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_104",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_18",
      "title": "Capacitor (0740-HF-5001-02-XCA)",
      "items": [
        {
          "id": "item_105",
          "type": "verificacion",
          "label": "Aislador pedestal (4 und)"
        },
        {
          "id": "item_106",
          "type": "verificacion",
          "label": "Aislador conexión"
        },
        {
          "id": "item_107",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        }
      ]
    },
    {
      "id": "capacitor_0740_hf_5001_02_xca",
      "title": "Capacitor (0740-HF-5001-02-XCA)",
      "items": [
        {
          "id": "item_108",
          "type": "verificacion",
          "label": "Bushing condensadores"
        },
        {
          "id": "item_109",
          "type": "verificacion",
          "label": "Deformación condensador"
        },
        {
          "id": "item_110",
          "type": "verificacion",
          "label": "Filtración de aceite"
        },
        {
          "id": "item_111",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_112",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_19",
      "title": "Capacitor (0740-HF-5001-02-XCB)",
      "items": [
        {
          "id": "item_113",
          "type": "verificacion",
          "label": "Aislador pedestal (4 und)"
        },
        {
          "id": "item_114",
          "type": "verificacion",
          "label": "Aislador conexión"
        },
        {
          "id": "item_115",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_116",
          "type": "verificacion",
          "label": "Bushing condensadores"
        },
        {
          "id": "item_117",
          "type": "verificacion",
          "label": "Deformación condensador"
        },
        {
          "id": "item_118",
          "type": "verificacion",
          "label": "Filtración de aceite"
        },
        {
          "id": "item_119",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_120",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_20",
      "title": "Capacitor (740-HF-5001-02-XCC)",
      "items": [
        {
          "id": "item_121",
          "type": "verificacion",
          "label": "Aislador pedestal (4 und)"
        },
        {
          "id": "item_122",
          "type": "verificacion",
          "label": "Aislador conexión"
        },
        {
          "id": "item_123",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_124",
          "type": "verificacion",
          "label": "Bushing condensadores"
        },
        {
          "id": "item_125",
          "type": "verificacion",
          "label": "Deformación condensador"
        },
        {
          "id": "item_126",
          "type": "verificacion",
          "label": "Filtración de aceite"
        },
        {
          "id": "item_127",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_128",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_21",
      "title": "Desconectador tierra (0740-HF-5001-02-SWT02)",
      "items": [
        {
          "id": "item_129",
          "type": "verificacion",
          "label": "Condictiones Físicas y Mecanicas"
        },
        {
          "id": "item_130",
          "type": "verificacion",
          "label": "Estados de contactos y lubricacion"
        },
        {
          "id": "item_131",
          "type": "verificacion",
          "label": "Aisladores"
        },
        {
          "id": "item_132",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_22",
      "title": "Resistor (740-HF-5001-03-RDA)",
      "items": [
        {
          "id": "item_133",
          "type": "verificacion",
          "label": "Aislador pedestal (4 und)"
        },
        {
          "id": "item_134",
          "type": "verificacion",
          "label": "Aislador unión a tierra (1 und)"
        },
        {
          "id": "item_135",
          "type": "verificacion",
          "label": "Aislador conexión línea (1 und)"
        },
        {
          "id": "item_136",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_137",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_138",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_23",
      "title": "Resistor (740-HF-5001-03-RDB)",
      "items": [
        {
          "id": "item_139",
          "type": "verificacion",
          "label": "Aislador pedestal (4 und)"
        },
        {
          "id": "item_140",
          "type": "verificacion",
          "label": "Aislador unión a tierra (1 und)"
        },
        {
          "id": "item_141",
          "type": "verificacion",
          "label": "Aislador conexión línea (1 und)"
        },
        {
          "id": "item_142",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_143",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_144",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_24",
      "title": "Resistor (740-HF-5001-03-RDC)",
      "items": [
        {
          "id": "item_145",
          "type": "verificacion",
          "label": "Aislador pedestal (4 und)"
        },
        {
          "id": "item_146",
          "type": "verificacion",
          "label": "Aislador unión a tierra (1 und)"
        },
        {
          "id": "item_147",
          "type": "verificacion",
          "label": "Aislador conexión línea (1 und)"
        },
        {
          "id": "item_148",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_149",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_150",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_25",
      "title": "Inductor (0740-HF-5001-03-XLA)",
      "items": [
        {
          "id": "item_151",
          "type": "verificacion",
          "label": "Aislador pedestal (3 und)"
        },
        {
          "id": "item_152",
          "type": "verificacion",
          "label": "Conexión entrada"
        },
        {
          "id": "item_153",
          "type": "verificacion",
          "label": "Conexión salida"
        },
        {
          "id": "item_154",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_155",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_26",
      "title": "Inductor (0740-HF-5001-03-XLB)",
      "items": [
        {
          "id": "item_156",
          "type": "verificacion",
          "label": "Aislador pedestal (3 und)"
        },
        {
          "id": "item_157",
          "type": "verificacion",
          "label": "Conexión entrada"
        },
        {
          "id": "item_158",
          "type": "verificacion",
          "label": "Conexión salida"
        },
        {
          "id": "item_159",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_160",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_27",
      "title": "Inductor (0740-HF-5001-03-XLC)",
      "items": [
        {
          "id": "item_161",
          "type": "verificacion",
          "label": "Aislador pedestal (3 und)"
        },
        {
          "id": "item_162",
          "type": "verificacion",
          "label": "Conexión entrada"
        },
        {
          "id": "item_163",
          "type": "verificacion",
          "label": "Conexión salida"
        },
        {
          "id": "item_164",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_165",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_28",
      "title": "Capacitor (0740-HF-5001-03-XCA)",
      "items": [
        {
          "id": "item_166",
          "type": "verificacion",
          "label": "Aislador pedestal (4 und)"
        },
        {
          "id": "item_167",
          "type": "verificacion",
          "label": "Aislador conexión"
        },
        {
          "id": "item_168",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        }
      ]
    },
    {
      "id": "capacitor_0740_hf_5001_03_xca",
      "title": "Capacitor (0740-HF-5001-03-XCA)",
      "items": [
        {
          "id": "item_169",
          "type": "verificacion",
          "label": "Bushing condensadores"
        },
        {
          "id": "item_170",
          "type": "verificacion",
          "label": "Deformación condensador"
        },
        {
          "id": "item_171",
          "type": "verificacion",
          "label": "Filtración de aceite"
        },
        {
          "id": "item_172",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_173",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_29",
      "title": "Capacitor (0740-HF-5001-03-XCB)",
      "items": [
        {
          "id": "item_174",
          "type": "verificacion",
          "label": "Aislador pedestal (4 und)"
        },
        {
          "id": "item_175",
          "type": "verificacion",
          "label": "Aislador conexión"
        },
        {
          "id": "item_176",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_177",
          "type": "verificacion",
          "label": "Bushing condensadores"
        },
        {
          "id": "item_178",
          "type": "verificacion",
          "label": "Deformación condensador"
        },
        {
          "id": "item_179",
          "type": "verificacion",
          "label": "Filtración de aceite"
        },
        {
          "id": "item_180",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_181",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_30",
      "title": "Capacitor (740-HF-5001-03-XCC)",
      "items": [
        {
          "id": "item_182",
          "type": "verificacion",
          "label": "Aislador pedestal (4 und)"
        },
        {
          "id": "item_183",
          "type": "verificacion",
          "label": "Aislador conexión"
        },
        {
          "id": "item_184",
          "type": "verificacion",
          "label": "Decoloración por Exceso de T° en conductor"
        },
        {
          "id": "item_185",
          "type": "verificacion",
          "label": "Bushing condensadores"
        },
        {
          "id": "item_186",
          "type": "verificacion",
          "label": "Deformación condensador"
        },
        {
          "id": "item_187",
          "type": "verificacion",
          "label": "Filtración de aceite"
        },
        {
          "id": "item_188",
          "type": "verificacion",
          "label": "Limpieza"
        },
        {
          "id": "item_189",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_31",
      "title": "Desconectador tierra (0740-HF-5001-03-SWT03)",
      "items": [
        {
          "id": "item_190",
          "type": "verificacion",
          "label": "Condictiones Físicas y Mecanicas"
        },
        {
          "id": "item_191",
          "type": "verificacion",
          "label": "Estados de contactos y lubricacion"
        },
        {
          "id": "item_192",
          "type": "verificacion",
          "label": "Aisladores"
        },
        {
          "id": "item_193",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_32",
      "title": "Tablero electrico (0740-HF-5001-C01)",
      "items": [
        {
          "id": "item_194",
          "type": "verificacion",
          "label": "Estado tablero"
        },
        {
          "id": "item_195",
          "type": "verificacion",
          "label": "Indicador piloto"
        },
        {
          "id": "item_196",
          "type": "verificacion",
          "label": "Señaletica"
        }
      ]
    },
    {
      "id": "componente_33",
      "title": "Puerta acceso (0740-HF-5001)",
      "items": [
        {
          "id": "item_197",
          "type": "verificacion",
          "label": "Existe llave maestra de acceso"
        },
        {
          "id": "item_198",
          "type": "verificacion",
          "label": "Switch de posición"
        }
      ]
    },
    {
      "id": "componente_34",
      "title": "Pararrayos (0740-HF-5001)",
      "items": [
        {
          "id": "item_199",
          "type": "verificacion",
          "label": "Puesta a tierra"
        },
        {
          "id": "item_200",
          "type": "verificacion",
          "label": "Contador de eventos"
        }
      ]
    },
    {
      "id": "componente_35",
      "title": "Luminaria (0740-HF-5001)",
      "items": [
        {
          "id": "item_201",
          "type": "verificacion",
          "label": "Aumbrado exterior"
        }
      ]
    },
    {
      "id": "componente_36",
      "title": "Cerco perimetral (0740-HF-5001)",
      "items": [
        {
          "id": "item_202",
          "type": "verificacion",
          "label": "Estado cerco perimetral"
        },
        {
          "id": "item_203",
          "type": "verificacion",
          "label": "Puesta a tierra"
        }
      ]
    },
    {
      "id": "componente_37",
      "title": "Extintor (0740-HF-5001)",
      "items": [
        {
          "id": "item_204",
          "type": "verificacion",
          "label": "Estado de Extintor"
        },
        {
          "id": "item_205",
          "type": "text",
          "label": "Fecha vencimiento extintor",
          "required": false,
          "multiline": false
        }
      ]
    },
    {
      "id": "galeria_fotografica",
      "title": "Galería fotográfica",
      "items": [
        {
          "id": "item_206",
          "type": "photo",
          "label": "Galería fotográfica",
          "required": false,
          "maxPhotos": 6
        }
      ]
    }
  ],
  "nomenclature": "NT: NO TIENE / BN: BUENO / ML: MALO / NA: NO APLICA / NR: No Realizada (Indicar motivos en observaciones) / SI / NO",
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'filtro_molino_sag_5001' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- INSP-29 · EST-ELEC-MLP-Bbosch-29 · Inspección Switchgear 23 kV PPCH (22 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Inspección Switchgear 23 kV PPCH",
  "meta": {
    "norma": "EST-ELEC-MLP-Bbosch-29",
    "revision": "Abril 2024",
    "titulo": "Inspección Switchgear 23 kV PPCH"
  },
  "header": [
    {
      "key": "tag",
      "label": "TAG Equipo",
      "input": "text"
    },
    {
      "key": "ot",
      "label": "N° OT",
      "input": "text"
    },
    {
      "key": "ubicacion",
      "label": "Ubicación",
      "input": "text"
    },
    {
      "key": "fecha",
      "label": "Fecha",
      "input": "date"
    },
    {
      "key": "h_inicio",
      "label": "Hora inicio",
      "input": "time"
    },
    {
      "key": "h_fin",
      "label": "Hora término",
      "input": "time"
    },
    {
      "key": "serie",
      "label": "N° Serie",
      "input": "text",
      "required": false
    },
    {
      "key": "marca",
      "label": "Marca",
      "input": "text",
      "required": false
    },
    {
      "key": "tension",
      "label": "Tensión",
      "input": "text",
      "required": false
    }
  ],
  "roles": [
    "Encargado de la actividad",
    "Supervisor Bbosch",
    "Planificador Bbosch"
  ],
  "sections": [
    {
      "id": "actividades",
      "title": "Actividades",
      "items": [
        {
          "id": "item_001",
          "type": "verificacion",
          "label": "Luces pilotos encendidas"
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Amperímetros análogos funcionando"
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Funcionamiento de selector de amperímetros."
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Funcionamiento de voltímetros."
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Funcionamiento de selector de voltímetros."
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Relé de bloqueo 86 (bandera negra)"
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Selector Local Remoto (Local)"
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Carga de resortes (amarillo)"
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Descargar ajustes y eventos de Multilin’s."
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Panel de alarmas funcionando, poner en Test."
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Interruptores de control (cerrados)."
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Limpieza de los equipos"
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Estado de los conductores de control"
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Esta operativa manivela extracción de carros"
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Barra para cierre manual carros."
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Existencia de planos de cubículos."
        },
        {
          "id": "item_017",
          "type": "nameplate",
          "label": "Horómetro y operaciones carro 52 / 01",
          "required": false,
          "fields": [
            {
              "key": "horometro",
              "label": "Horómetro",
              "unit": "h"
            },
            {
              "key": "operaciones",
              "label": "Operaciones"
            }
          ]
        },
        {
          "id": "item_018",
          "type": "nameplate",
          "label": "Horómetro y operaciones carro 52 / 02",
          "required": false,
          "fields": [
            {
              "key": "horometro",
              "label": "Horómetro",
              "unit": "h"
            },
            {
              "key": "operaciones",
              "label": "Operaciones"
            }
          ]
        },
        {
          "id": "item_019",
          "type": "nameplate",
          "label": "Horómetro y operaciones carro 52 / 03",
          "required": false,
          "fields": [
            {
              "key": "horometro",
              "label": "Horómetro",
              "unit": "h"
            },
            {
              "key": "operaciones",
              "label": "Operaciones"
            }
          ]
        },
        {
          "id": "item_020",
          "type": "nameplate",
          "label": "Horómetro y operaciones carro 52 / 04",
          "required": false,
          "fields": [
            {
              "key": "horometro",
              "label": "Horómetro",
              "unit": "h"
            },
            {
              "key": "operaciones",
              "label": "Operaciones"
            }
          ]
        },
        {
          "id": "item_021",
          "type": "nameplate",
          "label": "Horómetro y operaciones carro 52 / 05",
          "required": false,
          "fields": [
            {
              "key": "horometro",
              "label": "Horómetro",
              "unit": "h"
            },
            {
              "key": "operaciones",
              "label": "Operaciones"
            }
          ]
        }
      ]
    },
    {
      "id": "galeria_fotografica",
      "title": "Galería fotográfica",
      "items": [
        {
          "id": "item_022",
          "type": "photo",
          "label": "Galería fotográfica",
          "required": false,
          "maxPhotos": 6
        }
      ]
    }
  ],
  "nomenclature": "NT: NO TIENE / BN: BUENO / ML: MALO / NA: NO APLICA / NR: No Realizada (Indicar motivos en observaciones)"
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'switchgear_ppch' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- INSP-30 · EST-ELEC-INSP-MLP-Bbosch-30 · Inspección Sala Eléctrica 740-ER-5002 (163 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Inspección Sala Eléctrica 740-ER-5002",
  "meta": {
    "norma": "EST-ELEC-INSP-MLP-Bbosch-30",
    "revision": "Octubre 2024",
    "titulo": "Inspección Sala Eléctrica 740-ER-5002"
  },
  "header": [
    {
      "key": "tag",
      "label": "TAG Equipo",
      "input": "text"
    },
    {
      "key": "ot",
      "label": "N° OT",
      "input": "text"
    },
    {
      "key": "ubicacion",
      "label": "Ubicación",
      "input": "text"
    },
    {
      "key": "fecha",
      "label": "Fecha",
      "input": "date"
    },
    {
      "key": "h_inicio",
      "label": "Hora inicio",
      "input": "time"
    },
    {
      "key": "h_fin",
      "label": "Hora término",
      "input": "time"
    }
  ],
  "roles": [
    "Encargado de la actividad",
    "Supervisor Bbosch",
    "Planificador Bbosch"
  ],
  "sections": [
    {
      "id": "componente",
      "title": "Tablero Alumbrado (740-LP-5001)",
      "items": [
        {
          "id": "item_001",
          "type": "verificacion",
          "label": "Estado exterior de tablero"
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Tensión",
          "unit": "V"
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Estado de puerta"
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Estado de puerta interior"
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Verificar presencia de tensión"
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Capacidad Interruptor General (A)",
          "unit": "A"
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Estado de luces pilotos"
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Estado de bornera"
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Estado barra tierra"
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Verificación de puesta a tierra en tablero y puerta"
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Aseo general"
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Tableros señalizados"
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Accesos a tablero libres de obstrucción"
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Diagrama unilineal en tablero"
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Estado de cables"
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Estado de terminales"
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Circuitos identificados."
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Sistema de bloqueo existente"
        }
      ]
    },
    {
      "id": "componente_2",
      "title": "Tablero Distribución BT (740-DP-5001)",
      "items": [
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "Estado exterior de tablero"
        },
        {
          "id": "item_020",
          "type": "verificacion",
          "label": "Tensión",
          "unit": "V"
        },
        {
          "id": "item_021",
          "type": "verificacion",
          "label": "Estado de puerta"
        },
        {
          "id": "item_022",
          "type": "verificacion",
          "label": "Estado de puerta interior"
        },
        {
          "id": "item_023",
          "type": "verificacion",
          "label": "Verificar presencia de tensión"
        },
        {
          "id": "item_024",
          "type": "verificacion",
          "label": "Capacidad Interruptor General (A)",
          "unit": "A"
        },
        {
          "id": "item_025",
          "type": "verificacion",
          "label": "Estado de luces pilotos"
        },
        {
          "id": "item_026",
          "type": "verificacion",
          "label": "Estado de bornera"
        },
        {
          "id": "item_027",
          "type": "verificacion",
          "label": "Estado barra tierra"
        },
        {
          "id": "item_028",
          "type": "verificacion",
          "label": "Verificación de puesta a tierra en tablero y puerta"
        },
        {
          "id": "item_029",
          "type": "verificacion",
          "label": "Aseo general"
        },
        {
          "id": "item_030",
          "type": "verificacion",
          "label": "Tableros señalizados"
        },
        {
          "id": "item_031",
          "type": "verificacion",
          "label": "Accesos a tablero libres de obstrucción"
        },
        {
          "id": "item_032",
          "type": "verificacion",
          "label": "Diagrama unilineal en tablero"
        },
        {
          "id": "item_033",
          "type": "verificacion",
          "label": "Estado de cables"
        },
        {
          "id": "item_034",
          "type": "verificacion",
          "label": "Estado de terminales"
        },
        {
          "id": "item_035",
          "type": "verificacion",
          "label": "Circuitos identificados."
        },
        {
          "id": "item_036",
          "type": "verificacion",
          "label": "Sistema de bloqueo existente"
        }
      ]
    },
    {
      "id": "componente_3",
      "title": "Tablero Distribución BT (740-DP-5301)",
      "items": [
        {
          "id": "item_037",
          "type": "verificacion",
          "label": "Estado exterior de tablero"
        },
        {
          "id": "item_038",
          "type": "verificacion",
          "label": "Tensión",
          "unit": "V"
        },
        {
          "id": "item_039",
          "type": "verificacion",
          "label": "Estado de puerta"
        },
        {
          "id": "item_040",
          "type": "verificacion",
          "label": "Estado de puerta interior"
        },
        {
          "id": "item_041",
          "type": "verificacion",
          "label": "Verificar presencia de tensión"
        },
        {
          "id": "item_042",
          "type": "verificacion",
          "label": "Capacidad Interruptor General (A)",
          "unit": "A"
        },
        {
          "id": "item_043",
          "type": "verificacion",
          "label": "Estado de luces pilotos"
        },
        {
          "id": "item_044",
          "type": "verificacion",
          "label": "Estado de bornera"
        },
        {
          "id": "item_045",
          "type": "verificacion",
          "label": "Estado barra tierra"
        },
        {
          "id": "item_046",
          "type": "verificacion",
          "label": "Verificación de puesta a tierra en tablero y puerta"
        },
        {
          "id": "item_047",
          "type": "verificacion",
          "label": "Aseo general"
        },
        {
          "id": "item_048",
          "type": "verificacion",
          "label": "Tableros señalizados"
        },
        {
          "id": "item_049",
          "type": "verificacion",
          "label": "Accesos a tablero libres de obstrucción"
        },
        {
          "id": "item_050",
          "type": "verificacion",
          "label": "Diagrama unilineal en tablero"
        },
        {
          "id": "item_051",
          "type": "verificacion",
          "label": "Estado de cables"
        },
        {
          "id": "item_052",
          "type": "verificacion",
          "label": "Estado de terminales"
        },
        {
          "id": "item_053",
          "type": "verificacion",
          "label": "Circuitos identificados."
        },
        {
          "id": "item_054",
          "type": "verificacion",
          "label": "Sistema de bloqueo existente"
        }
      ]
    },
    {
      "id": "componente_4",
      "title": "Tablero Distribución BT (740-DP-5101)",
      "items": [
        {
          "id": "item_055",
          "type": "verificacion",
          "label": "Estado exterior de tablero"
        },
        {
          "id": "item_056",
          "type": "verificacion",
          "label": "Tensión",
          "unit": "V"
        },
        {
          "id": "item_057",
          "type": "verificacion",
          "label": "Estado de puerta"
        },
        {
          "id": "item_058",
          "type": "verificacion",
          "label": "Estado de puerta interior"
        },
        {
          "id": "item_059",
          "type": "verificacion",
          "label": "Verificar presencia de tensión"
        },
        {
          "id": "item_060",
          "type": "verificacion",
          "label": "Capacidad Interruptor General (A)",
          "unit": "A"
        },
        {
          "id": "item_061",
          "type": "verificacion",
          "label": "Estado de luces pilotos"
        },
        {
          "id": "item_062",
          "type": "verificacion",
          "label": "Estado de bornera"
        },
        {
          "id": "item_063",
          "type": "verificacion",
          "label": "Estado barra tierra"
        },
        {
          "id": "item_064",
          "type": "verificacion",
          "label": "Verificación de puesta a tierra en tablero y puerta"
        },
        {
          "id": "item_065",
          "type": "verificacion",
          "label": "Aseo general"
        },
        {
          "id": "item_066",
          "type": "verificacion",
          "label": "Tableros señalizados"
        },
        {
          "id": "item_067",
          "type": "verificacion",
          "label": "Accesos a tablero libres de obstrucción"
        },
        {
          "id": "item_068",
          "type": "verificacion",
          "label": "Diagrama unilineal en tablero"
        },
        {
          "id": "item_069",
          "type": "verificacion",
          "label": "Estado de cables"
        },
        {
          "id": "item_070",
          "type": "verificacion",
          "label": "Estado de terminales"
        },
        {
          "id": "item_071",
          "type": "verificacion",
          "label": "Circuitos identificados."
        },
        {
          "id": "item_072",
          "type": "verificacion",
          "label": "Sistema de bloqueo existente"
        }
      ]
    },
    {
      "id": "componente_5",
      "title": "Tablero Distribución BT (740-DP-5202)",
      "items": [
        {
          "id": "item_073",
          "type": "verificacion",
          "label": "Estado exterior de tablero"
        },
        {
          "id": "item_074",
          "type": "verificacion",
          "label": "Tensión",
          "unit": "V"
        },
        {
          "id": "item_075",
          "type": "verificacion",
          "label": "Estado de puerta"
        },
        {
          "id": "item_076",
          "type": "verificacion",
          "label": "Estado de puerta interior"
        },
        {
          "id": "item_077",
          "type": "verificacion",
          "label": "Verificar presencia de tensión"
        },
        {
          "id": "item_078",
          "type": "verificacion",
          "label": "Capacidad Interruptor General (A)",
          "unit": "A"
        },
        {
          "id": "item_079",
          "type": "verificacion",
          "label": "Estado de luces pilotos"
        },
        {
          "id": "item_080",
          "type": "verificacion",
          "label": "Estado de bornera"
        },
        {
          "id": "item_081",
          "type": "verificacion",
          "label": "Estado barra tierra"
        },
        {
          "id": "item_082",
          "type": "verificacion",
          "label": "Verificación de puesta a tierra en tablero y puerta"
        },
        {
          "id": "item_083",
          "type": "verificacion",
          "label": "Aseo general"
        },
        {
          "id": "item_084",
          "type": "verificacion",
          "label": "Tableros señalizados"
        },
        {
          "id": "item_085",
          "type": "verificacion",
          "label": "Accesos a tablero libres de obstrucción"
        },
        {
          "id": "item_086",
          "type": "verificacion",
          "label": "Diagrama unilineal en tablero"
        },
        {
          "id": "item_087",
          "type": "verificacion",
          "label": "Estado de cables"
        },
        {
          "id": "item_088",
          "type": "verificacion",
          "label": "Estado de terminales"
        },
        {
          "id": "item_089",
          "type": "verificacion",
          "label": "Circuitos identificados."
        },
        {
          "id": "item_090",
          "type": "verificacion",
          "label": "Sistema de bloqueo existente"
        }
      ]
    },
    {
      "id": "componente_6",
      "title": "Tablero Distribución sin respaldo UPS (740-JP-1302)",
      "items": [
        {
          "id": "item_091",
          "type": "verificacion",
          "label": "Estado exterior de tablero"
        },
        {
          "id": "item_092",
          "type": "verificacion",
          "label": "Tensión",
          "unit": "V"
        },
        {
          "id": "item_093",
          "type": "verificacion",
          "label": "Estado de puerta"
        },
        {
          "id": "item_094",
          "type": "verificacion",
          "label": "Estado de puerta interior"
        },
        {
          "id": "item_095",
          "type": "verificacion",
          "label": "Verificar presencia de tensión"
        },
        {
          "id": "item_096",
          "type": "verificacion",
          "label": "Capacidad Interruptor General (A)",
          "unit": "A"
        },
        {
          "id": "item_097",
          "type": "verificacion",
          "label": "Estado de luces pilotos"
        },
        {
          "id": "item_098",
          "type": "verificacion",
          "label": "Estado de bornera"
        },
        {
          "id": "item_099",
          "type": "verificacion",
          "label": "Estado barra tierra"
        },
        {
          "id": "item_100",
          "type": "verificacion",
          "label": "Verificación de puesta a tierra en tablero y puerta"
        },
        {
          "id": "item_101",
          "type": "verificacion",
          "label": "Aseo general"
        },
        {
          "id": "item_102",
          "type": "verificacion",
          "label": "Tableros señalizados"
        },
        {
          "id": "item_103",
          "type": "verificacion",
          "label": "Accesos a tablero libres de obstrucción"
        },
        {
          "id": "item_104",
          "type": "verificacion",
          "label": "Diagrama unilineal en tablero"
        },
        {
          "id": "item_105",
          "type": "verificacion",
          "label": "Estado de cables"
        },
        {
          "id": "item_106",
          "type": "verificacion",
          "label": "Estado de terminales"
        },
        {
          "id": "item_107",
          "type": "verificacion",
          "label": "Circuitos identificados."
        },
        {
          "id": "item_108",
          "type": "verificacion",
          "label": "Sistema de bloqueo existente"
        }
      ]
    },
    {
      "id": "componente_7",
      "title": "Tablero control alumbrado (740-LP-5001-C01)",
      "items": [
        {
          "id": "item_109",
          "type": "verificacion",
          "label": "Estado exterior de tablero"
        },
        {
          "id": "item_110",
          "type": "verificacion",
          "label": "Tensión",
          "unit": "V"
        },
        {
          "id": "item_111",
          "type": "verificacion",
          "label": "Estado de puerta"
        },
        {
          "id": "item_112",
          "type": "verificacion",
          "label": "Estado de puerta interior"
        },
        {
          "id": "item_113",
          "type": "verificacion",
          "label": "Verificar presencia de tensión"
        },
        {
          "id": "item_114",
          "type": "verificacion",
          "label": "Capacidad Interruptor General (A)",
          "unit": "A"
        },
        {
          "id": "item_115",
          "type": "verificacion",
          "label": "Estado de luces pilotos"
        },
        {
          "id": "item_116",
          "type": "verificacion",
          "label": "Estado de bornera"
        },
        {
          "id": "item_117",
          "type": "verificacion",
          "label": "Estado barra tierra"
        },
        {
          "id": "item_118",
          "type": "verificacion",
          "label": "Verificación de puesta a tierra en tablero y puerta"
        },
        {
          "id": "item_119",
          "type": "verificacion",
          "label": "Aseo general"
        },
        {
          "id": "item_120",
          "type": "verificacion",
          "label": "Tableros señalizados"
        },
        {
          "id": "item_121",
          "type": "verificacion",
          "label": "Accesos a tablero libres de obstrucción"
        },
        {
          "id": "item_122",
          "type": "verificacion",
          "label": "Diagrama unilineal en tablero"
        },
        {
          "id": "item_123",
          "type": "verificacion",
          "label": "Estado de cables"
        },
        {
          "id": "item_124",
          "type": "verificacion",
          "label": "Estado de terminales"
        },
        {
          "id": "item_125",
          "type": "verificacion",
          "label": "Circuitos identificados."
        },
        {
          "id": "item_126",
          "type": "verificacion",
          "label": "Sistema de bloqueo existente"
        }
      ]
    },
    {
      "id": "componente_8",
      "title": "Tablero UPS instrumentación (740-UP-1300)",
      "items": [
        {
          "id": "item_127",
          "type": "verificacion",
          "label": "Estado exterior de tablero"
        },
        {
          "id": "item_128",
          "type": "verificacion",
          "label": "Tensión",
          "unit": "V"
        },
        {
          "id": "item_129",
          "type": "verificacion",
          "label": "Estado de puerta"
        },
        {
          "id": "item_130",
          "type": "verificacion",
          "label": "Estado de puerta interior"
        },
        {
          "id": "item_131",
          "type": "verificacion",
          "label": "Verificar presencia de tensión"
        },
        {
          "id": "item_132",
          "type": "verificacion",
          "label": "Capacidad Interruptor General (A)",
          "unit": "A"
        },
        {
          "id": "item_133",
          "type": "verificacion",
          "label": "Estado de luces pilotos"
        },
        {
          "id": "item_134",
          "type": "verificacion",
          "label": "Estado de bornera"
        },
        {
          "id": "item_135",
          "type": "verificacion",
          "label": "Estado barra tierra"
        },
        {
          "id": "item_136",
          "type": "verificacion",
          "label": "Verificación de puesta a tierra en tablero y puerta"
        },
        {
          "id": "item_137",
          "type": "verificacion",
          "label": "Aseo general"
        },
        {
          "id": "item_138",
          "type": "verificacion",
          "label": "Tableros señalizados"
        },
        {
          "id": "item_139",
          "type": "verificacion",
          "label": "Accesos a tablero libres de obstrucción"
        },
        {
          "id": "item_140",
          "type": "verificacion",
          "label": "Diagrama unilineal en tablero"
        },
        {
          "id": "item_141",
          "type": "verificacion",
          "label": "Estado de cables"
        },
        {
          "id": "item_142",
          "type": "verificacion",
          "label": "Estado de terminales"
        },
        {
          "id": "item_143",
          "type": "verificacion",
          "label": "Circuitos identificados."
        },
        {
          "id": "item_144",
          "type": "verificacion",
          "label": "Sistema de bloqueo existente"
        }
      ]
    },
    {
      "id": "componente_9",
      "title": "Tablero Distribución BT (740-JP-1301)",
      "items": [
        {
          "id": "item_145",
          "type": "verificacion",
          "label": "Estado exterior de tablero"
        },
        {
          "id": "item_146",
          "type": "verificacion",
          "label": "Tensión",
          "unit": "V"
        },
        {
          "id": "item_147",
          "type": "verificacion",
          "label": "Estado de puerta"
        },
        {
          "id": "item_148",
          "type": "verificacion",
          "label": "Estado de puerta interior"
        },
        {
          "id": "item_149",
          "type": "verificacion",
          "label": "Verificar presencia de tensión"
        },
        {
          "id": "item_150",
          "type": "verificacion",
          "label": "Capacidad Interruptor General (A)",
          "unit": "A"
        },
        {
          "id": "item_151",
          "type": "verificacion",
          "label": "Estado de luces pilotos"
        },
        {
          "id": "item_152",
          "type": "verificacion",
          "label": "Estado de bornera"
        },
        {
          "id": "item_153",
          "type": "verificacion",
          "label": "Estado barra tierra"
        },
        {
          "id": "item_154",
          "type": "verificacion",
          "label": "Verificación de puesta a tierra en tablero y puerta"
        },
        {
          "id": "item_155",
          "type": "verificacion",
          "label": "Aseo general"
        },
        {
          "id": "item_156",
          "type": "verificacion",
          "label": "Tableros señalizados"
        },
        {
          "id": "item_157",
          "type": "verificacion",
          "label": "Accesos a tablero libres de obstrucción"
        },
        {
          "id": "item_158",
          "type": "verificacion",
          "label": "Diagrama unilineal en tablero"
        },
        {
          "id": "item_159",
          "type": "verificacion",
          "label": "Estado de cables"
        },
        {
          "id": "item_160",
          "type": "verificacion",
          "label": "Estado de terminales"
        },
        {
          "id": "item_161",
          "type": "verificacion",
          "label": "Circuitos identificados."
        },
        {
          "id": "item_162",
          "type": "verificacion",
          "label": "Sistema de bloqueo existente"
        }
      ]
    },
    {
      "id": "galeria_fotografica",
      "title": "Galería fotográfica",
      "items": [
        {
          "id": "item_163",
          "type": "photo",
          "label": "Galería fotográfica",
          "required": false,
          "maxPhotos": 6
        }
      ]
    }
  ],
  "nomenclature": "NT: NO TIENE / BN: BUENO / ML: MALO / NA: NO APLICA / NR: No Realizada (Indicar motivos en observaciones)",
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'sala_electrica_740_er_5002' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- INSP-31 · EST-ELEC-INSP-MLP-Bbosch-31 · Ficha Inspección de Generadores (67 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Ficha Inspección de Generadores",
  "meta": {
    "norma": "EST-ELEC-INSP-MLP-Bbosch-31",
    "revision": "Octubre 2024",
    "titulo": "Ficha Inspección de Generadores"
  },
  "header": [
    {
      "key": "tag",
      "label": "TAG Equipo",
      "input": "text"
    },
    {
      "key": "ot",
      "label": "N° OT",
      "input": "text"
    },
    {
      "key": "ubicacion",
      "label": "Ubicación",
      "input": "text"
    },
    {
      "key": "fecha",
      "label": "Fecha",
      "input": "date"
    },
    {
      "key": "h_inicio",
      "label": "Hora inicio",
      "input": "time"
    },
    {
      "key": "h_fin",
      "label": "Hora término",
      "input": "time"
    },
    {
      "key": "potencia",
      "label": "Potencia",
      "input": "text",
      "required": false
    },
    {
      "key": "horometro_inicial",
      "label": "Horómetro inicial",
      "input": "text",
      "required": false
    },
    {
      "key": "marca",
      "label": "Marca",
      "input": "text",
      "required": false
    },
    {
      "key": "horometro_final",
      "label": "Horómetro final",
      "input": "text",
      "required": false
    },
    {
      "key": "modelo",
      "label": "Modelo",
      "input": "text",
      "required": false
    },
    {
      "key": "kw_inicial",
      "label": "KW inicial",
      "input": "text",
      "required": false
    },
    {
      "key": "nivel_de_combustible",
      "label": "Nivel de combustible",
      "input": "text",
      "required": false
    },
    {
      "key": "kw_final",
      "label": "KW final",
      "input": "text",
      "required": false
    },
    {
      "key": "fecha_ultimo_mtto_electr",
      "label": "Fecha ultimo mtto eléctrico",
      "input": "text",
      "required": false
    },
    {
      "key": "fecha_ultimo_mtto_mecani",
      "label": "Fecha ultimo mtto mecánico",
      "input": "text",
      "required": false
    }
  ],
  "roles": [
    "Encargado de la actividad",
    "Supervisor Bbosch",
    "Planificador Bbosch"
  ],
  "sections": [
    {
      "id": "motor",
      "title": "Motor",
      "items": [
        {
          "id": "item_001",
          "type": "verificacion",
          "label": "Filtros de aire"
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Filtros de combustible"
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Filtros de aceite"
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Filtros de refrigerante"
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Filtros de racor"
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Filtros de sala"
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Panel y aspa"
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Nivel de aceite del motor"
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Fugas de aceite"
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Perdidas de combustible"
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Turbo"
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Ductos de admisión y escape"
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Correas-poleas-tensores"
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Nivel de refrigerante"
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Fugas de refrigerante"
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Bomba de refrigerante"
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Bomba de combustible"
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Nivel de combustible"
        },
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "Alternador de motor"
        },
        {
          "id": "item_020",
          "type": "verificacion",
          "label": "Conexión a tierra del motor"
        }
      ]
    },
    {
      "id": "tta",
      "title": "TTA",
      "items": [
        {
          "id": "item_021",
          "type": "verificacion",
          "label": "Daños físicos"
        },
        {
          "id": "item_022",
          "type": "verificacion",
          "label": "Conductores y conexiones"
        },
        {
          "id": "item_023",
          "type": "verificacion",
          "label": "Funcionamiento de interruptores"
        },
        {
          "id": "item_024",
          "type": "verificacion",
          "label": "Verificación de protecciones"
        },
        {
          "id": "item_025",
          "type": "verificacion",
          "label": "Filtraciones en gabinete"
        },
        {
          "id": "item_026",
          "type": "verificacion",
          "label": "Pruebas de funcionamiento"
        },
        {
          "id": "item_027",
          "type": "verificacion",
          "label": "TTA queda en automático"
        }
      ]
    },
    {
      "id": "sist_electrico",
      "title": "Sist. eléctrico",
      "items": [
        {
          "id": "item_028",
          "type": "verificacion",
          "label": "Baterías"
        },
        {
          "id": "item_029",
          "type": "verificacion",
          "label": "Mantenedor de baterías"
        },
        {
          "id": "item_030",
          "type": "verificacion",
          "label": "Sensor de aceite"
        },
        {
          "id": "item_031",
          "type": "verificacion",
          "label": "Sensor de refrigerante"
        },
        {
          "id": "item_032",
          "type": "verificacion",
          "label": "Sensor atmosferico"
        },
        {
          "id": "item_033",
          "type": "verificacion",
          "label": "Sensor de temperatura"
        },
        {
          "id": "item_034",
          "type": "verificacion",
          "label": "Sistema de arranque"
        },
        {
          "id": "item_035",
          "type": "verificacion",
          "label": "Corta corriente"
        },
        {
          "id": "item_036",
          "type": "verificacion",
          "label": "Parada de emergencia"
        },
        {
          "id": "item_037",
          "type": "verificacion",
          "label": "Canalización de cables"
        },
        {
          "id": "item_038",
          "type": "verificacion",
          "label": "Conexión a tierra"
        },
        {
          "id": "item_039",
          "type": "verificacion",
          "label": "Breaker principal"
        },
        {
          "id": "item_040",
          "type": "verificacion",
          "label": "Breaker servicios aux"
        },
        {
          "id": "item_041",
          "type": "verificacion",
          "label": "Conexión a tierra"
        },
        {
          "id": "item_042",
          "type": "verificacion",
          "label": "Panel de intrumentos"
        }
      ]
    },
    {
      "id": "parametros_de_funcionamiento",
      "title": "Parametros de funcionamiento",
      "items": [
        {
          "id": "item_043",
          "type": "verificacion",
          "label": "Tensión L-L(V)",
          "unit": "V"
        },
        {
          "id": "item_044",
          "type": "verificacion",
          "label": "Tensión L-N (v)",
          "unit": "V"
        },
        {
          "id": "item_045",
          "type": "verificacion",
          "label": "Frecuencia (Hz)",
          "unit": "Hz"
        },
        {
          "id": "item_046",
          "type": "verificacion",
          "label": "RPM",
          "unit": ""
        },
        {
          "id": "item_047",
          "type": "verificacion",
          "label": "P. aceite",
          "unit": ""
        },
        {
          "id": "item_048",
          "type": "verificacion",
          "label": "T° aceite",
          "unit": "°C"
        },
        {
          "id": "item_049",
          "type": "verificacion",
          "label": "T° refrigerante",
          "unit": "°C"
        },
        {
          "id": "item_050",
          "type": "verificacion",
          "label": "T° gases",
          "unit": "°C"
        },
        {
          "id": "item_051",
          "type": "verificacion",
          "label": "Voltaje DC (v)",
          "unit": "V"
        },
        {
          "id": "item_052",
          "type": "verificacion",
          "label": "Potencia Kw",
          "unit": "kW"
        },
        {
          "id": "item_053",
          "type": "verificacion",
          "label": "Corriente L1-L2-L3 (a)",
          "unit": "A"
        }
      ]
    },
    {
      "id": "seguridad",
      "title": "Seguridad",
      "items": [
        {
          "id": "item_054",
          "type": "verificacion",
          "label": "Sistema de detección de incendios"
        },
        {
          "id": "item_055",
          "type": "verificacion",
          "label": "Estación de primeros auxilios"
        },
        {
          "id": "item_056",
          "type": "verificacion",
          "label": "Vencimiento extintor"
        },
        {
          "id": "item_057",
          "type": "verificacion",
          "label": "Señaletica seguridad"
        },
        {
          "id": "item_058",
          "type": "verificacion",
          "label": "Procedimineto impacto ambiental"
        },
        {
          "id": "item_059",
          "type": "verificacion",
          "label": "Planos de equipo en terreno"
        }
      ]
    },
    {
      "id": "estructura",
      "title": "Estructura",
      "items": [
        {
          "id": "item_060",
          "type": "verificacion",
          "label": "Estado de puertas"
        },
        {
          "id": "item_061",
          "type": "verificacion",
          "label": "Tubo de escape"
        },
        {
          "id": "item_062",
          "type": "verificacion",
          "label": "ESTADO DE CHASIS (fisuras y anclaje)"
        },
        {
          "id": "item_063",
          "type": "verificacion",
          "label": "Accesos a sala libre de obstruccion"
        },
        {
          "id": "item_064",
          "type": "verificacion",
          "label": "Sistema de iluminacion interior"
        },
        {
          "id": "item_065",
          "type": "verificacion",
          "label": "Sistema de iluminacion emergencia"
        },
        {
          "id": "item_066",
          "type": "verificacion",
          "label": "Aseo general"
        }
      ]
    },
    {
      "id": "galeria_fotografica",
      "title": "Galería fotográfica",
      "items": [
        {
          "id": "item_067",
          "type": "photo",
          "label": "Galería fotográfica",
          "required": false,
          "maxPhotos": 6
        }
      ]
    }
  ],
  "nomenclature": "NT: NO TIENE / BN: BUENO / ML: MALO / NA: NO APLICA / NR: No Realizada / SI / NO (Indicar motivos en observaciones)\"."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'ficha_generadores_agk' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- INSP-32 · EST-ELEC-INSP-MLP-Bbosch-32 · Check List de Verificación de Grupo Generador (15 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Check List de Verificación de Grupo Generador",
  "meta": {
    "norma": "EST-ELEC-INSP-MLP-Bbosch-32",
    "revision": "Febrero 2025",
    "titulo": "Check List de Verificación de Grupo Generador"
  },
  "header": [
    {
      "key": "tag",
      "label": "TAG Equipo",
      "input": "text"
    },
    {
      "key": "ot",
      "label": "N° OT",
      "input": "text"
    },
    {
      "key": "ubicacion",
      "label": "Ubicación",
      "input": "text"
    },
    {
      "key": "fecha",
      "label": "Fecha",
      "input": "date"
    },
    {
      "key": "h_inicio",
      "label": "Hora inicio",
      "input": "time"
    },
    {
      "key": "h_fin",
      "label": "Hora término",
      "input": "time"
    }
  ],
  "roles": [
    "Encargado de la actividad",
    "Supervisor Bbosch",
    "Planificador Bbosch"
  ],
  "sections": [
    {
      "id": "tierra_de_proteccion_de_grupos",
      "title": "Tierra de proteccion de grupos electrogenos",
      "items": [
        {
          "id": "item_001",
          "type": "verificacion",
          "label": "Es visible y se mantiene en buen estado"
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Esta correctamente instalada"
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Es de las dimensiones adecuadas para el grupo electrógeno"
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Esta fija sin riesgos de ser removida"
        }
      ]
    },
    {
      "id": "inspeccion_y_rotulado_de_grupo",
      "title": "Inspeccion y rotulado de grupos electrogenos",
      "items": [
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Cuenta con botón de emergencia para apertura del interruptor principal y detención de generador"
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Dispone contención para retener sus fluidos en caso de derrame"
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Cuenta con una placa de identificación con las características del equipo"
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Cuenta con un adecuado cableado tanto en control y fuerza"
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Cuenta con sus mantenimientos al día tanto en horas de uso o por años"
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Cuenta con algún tipo de protección eléctrica"
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Cuenta con AVR para la regulación de tensiones en caso de ser usado con máquinas de variación de cargas (ej. Maquinas soldadoras)"
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Equipo Tiene Letrero OSPA (Operación solo personal autorizado)"
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "El equipo tiene tablero de transferencia que permita identificar las sobre corrientes en caso de alguna falla"
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Equipo tiene instructivo de uso en terreno"
        }
      ]
    },
    {
      "id": "galeria_fotografica",
      "title": "Galería fotográfica",
      "items": [
        {
          "id": "item_015",
          "type": "photo",
          "label": "Galería fotográfica",
          "required": false,
          "maxPhotos": 6
        }
      ]
    }
  ],
  "nomenclature": "NT: No tiene / BN: Bueno / ML: Malo / NA: No aplica / NR: No realizada (indicar motivos en observaciones). En caso de observaciones críticas, se adjunta registro fotográfico con la referencia."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'checklist_grupo_generador' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- INSP-33 · EST-ELEC-INSP-MLP-Bbosch-33 · Inspección Sala Eléctrica 741-ER-5001 (STATCOM) (169 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Inspección Sala Eléctrica 741-ER-5001 (STATCOM)",
  "meta": {
    "norma": "EST-ELEC-INSP-MLP-Bbosch-33",
    "revision": "Marzo 2025",
    "titulo": "Inspección Sala Eléctrica 741-ER-5001 (STATCOM)"
  },
  "header": [
    {
      "key": "tag",
      "label": "TAG Equipo",
      "input": "text"
    },
    {
      "key": "ot",
      "label": "N° OT",
      "input": "text"
    },
    {
      "key": "ubicacion",
      "label": "Ubicación",
      "input": "text"
    },
    {
      "key": "fecha",
      "label": "Fecha",
      "input": "date"
    },
    {
      "key": "h_inicio",
      "label": "Hora inicio",
      "input": "time"
    },
    {
      "key": "h_fin",
      "label": "Hora término",
      "input": "time"
    }
  ],
  "roles": [
    "Encargado de la actividad",
    "Supervisor Bbosch",
    "Planificador Bbosch"
  ],
  "sections": [
    {
      "id": "componente",
      "title": "Control alumbrado exterior (741-LP-5040)",
      "items": [
        {
          "id": "item_001",
          "type": "verificacion",
          "label": "Estado exterior de tablero"
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Tensión",
          "unit": "V"
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Estado de puerta"
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Estado de puerta interior"
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Verificar presencia de tensión"
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Capacidad Interruptor General (A)",
          "unit": "A"
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Estado de luces pilotos"
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Estado de bornera"
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Estado barra tierra"
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Verificación de puesta a tierra en tablero y puerta"
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Aseo general"
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Tableros señalizados"
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Accesos a tablero libres de obstrucción"
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Diagrama unilineal en tablero"
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Estado de cables"
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Estado de terminales"
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Circuitos identificados."
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Sistema de bloqueo existente"
        },
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "Posición de selector"
        },
        {
          "id": "item_020",
          "type": "verificacion",
          "label": "Verificar estado relés horarios"
        },
        {
          "id": "item_021",
          "type": "verificacion",
          "label": "Verificar estado de conectores"
        }
      ]
    },
    {
      "id": "componente_2",
      "title": "Tablero baja tension 120 vac (741-JP-1301-UPS)",
      "items": [
        {
          "id": "item_022",
          "type": "verificacion",
          "label": "Estado exterior de tablero"
        },
        {
          "id": "item_023",
          "type": "verificacion",
          "label": "Tensión",
          "unit": "V"
        },
        {
          "id": "item_024",
          "type": "verificacion",
          "label": "Estado de puerta"
        },
        {
          "id": "item_025",
          "type": "verificacion",
          "label": "Estado de puerta interior"
        },
        {
          "id": "item_026",
          "type": "verificacion",
          "label": "Verificar presencia de tensión"
        },
        {
          "id": "item_027",
          "type": "verificacion",
          "label": "Capacidad Interruptor General (A)",
          "unit": "A"
        },
        {
          "id": "item_028",
          "type": "verificacion",
          "label": "Estado de luces pilotos"
        },
        {
          "id": "item_029",
          "type": "verificacion",
          "label": "Estado de bornera"
        },
        {
          "id": "item_030",
          "type": "verificacion",
          "label": "Estado barra tierra"
        },
        {
          "id": "item_031",
          "type": "verificacion",
          "label": "Verificación de puesta a tierra en tablero y puerta"
        },
        {
          "id": "item_032",
          "type": "verificacion",
          "label": "Aseo general"
        },
        {
          "id": "item_033",
          "type": "verificacion",
          "label": "Tableros señalizados"
        },
        {
          "id": "item_034",
          "type": "verificacion",
          "label": "Accesos a tablero libres de obstrucción"
        },
        {
          "id": "item_035",
          "type": "verificacion",
          "label": "Diagrama unilineal en tablero"
        },
        {
          "id": "item_036",
          "type": "verificacion",
          "label": "Estado de cables"
        },
        {
          "id": "item_037",
          "type": "verificacion",
          "label": "Estado de terminales"
        },
        {
          "id": "item_038",
          "type": "verificacion",
          "label": "Circuitos identificados."
        },
        {
          "id": "item_039",
          "type": "verificacion",
          "label": "Sistema de bloqueo existente"
        },
        {
          "id": "item_040",
          "type": "verificacion",
          "label": "Posición de selector"
        },
        {
          "id": "item_041",
          "type": "verificacion",
          "label": "Verificar estado relés horarios"
        },
        {
          "id": "item_042",
          "type": "verificacion",
          "label": "Verificar estado de conectores"
        }
      ]
    },
    {
      "id": "componente_3",
      "title": "+NLB.1 panel b cargador (741-RC-5032)",
      "items": [
        {
          "id": "item_043",
          "type": "verificacion",
          "label": "Estado exterior de tablero"
        },
        {
          "id": "item_044",
          "type": "verificacion",
          "label": "Tensión",
          "unit": "V"
        },
        {
          "id": "item_045",
          "type": "verificacion",
          "label": "Estado de puerta"
        },
        {
          "id": "item_046",
          "type": "verificacion",
          "label": "Estado de puerta interior"
        },
        {
          "id": "item_047",
          "type": "verificacion",
          "label": "Verificar presencia de tensión"
        },
        {
          "id": "item_048",
          "type": "verificacion",
          "label": "Capacidad Interruptor General (A)",
          "unit": "A"
        },
        {
          "id": "item_049",
          "type": "verificacion",
          "label": "Estado de luces pilotos"
        },
        {
          "id": "item_050",
          "type": "verificacion",
          "label": "Estado de bornera"
        },
        {
          "id": "item_051",
          "type": "verificacion",
          "label": "Estado barra tierra"
        },
        {
          "id": "item_052",
          "type": "verificacion",
          "label": "Verificación de puesta a tierra en tablero y puerta"
        },
        {
          "id": "item_053",
          "type": "verificacion",
          "label": "Aseo general"
        },
        {
          "id": "item_054",
          "type": "verificacion",
          "label": "Tableros señalizados"
        },
        {
          "id": "item_055",
          "type": "verificacion",
          "label": "Accesos a tablero libres de obstrucción"
        },
        {
          "id": "item_056",
          "type": "verificacion",
          "label": "Diagrama unilineal en tablero"
        },
        {
          "id": "item_057",
          "type": "verificacion",
          "label": "Estado de cables"
        },
        {
          "id": "item_058",
          "type": "verificacion",
          "label": "Estado de terminales"
        },
        {
          "id": "item_059",
          "type": "verificacion",
          "label": "Circuitos identificados."
        },
        {
          "id": "item_060",
          "type": "verificacion",
          "label": "Sistema de bloqueo existente"
        },
        {
          "id": "item_061",
          "type": "verificacion",
          "label": "Posición de selector"
        },
        {
          "id": "item_062",
          "type": "verificacion",
          "label": "Verificar estado relés horarios"
        },
        {
          "id": "item_063",
          "type": "verificacion",
          "label": "Verificar estado de conectores"
        }
      ]
    },
    {
      "id": "componente_4",
      "title": "+NLB.2 panel b distribucion (741-DP-5036)",
      "items": [
        {
          "id": "item_064",
          "type": "verificacion",
          "label": "Estado exterior de tablero"
        },
        {
          "id": "item_065",
          "type": "verificacion",
          "label": "Tensión",
          "unit": "V"
        },
        {
          "id": "item_066",
          "type": "verificacion",
          "label": "Estado de puerta"
        },
        {
          "id": "item_067",
          "type": "verificacion",
          "label": "Estado de puerta interior"
        },
        {
          "id": "item_068",
          "type": "verificacion",
          "label": "Verificar presencia de tensión"
        },
        {
          "id": "item_069",
          "type": "verificacion",
          "label": "Capacidad Interruptor General (A)",
          "unit": "A"
        },
        {
          "id": "item_070",
          "type": "verificacion",
          "label": "Estado de luces pilotos"
        },
        {
          "id": "item_071",
          "type": "verificacion",
          "label": "Estado de bornera"
        },
        {
          "id": "item_072",
          "type": "verificacion",
          "label": "Estado barra tierra"
        },
        {
          "id": "item_073",
          "type": "verificacion",
          "label": "Verificación de puesta a tierra en tablero y puerta"
        },
        {
          "id": "item_074",
          "type": "verificacion",
          "label": "Aseo general"
        },
        {
          "id": "item_075",
          "type": "verificacion",
          "label": "Tableros señalizados"
        },
        {
          "id": "item_076",
          "type": "verificacion",
          "label": "Accesos a tablero libres de obstrucción"
        },
        {
          "id": "item_077",
          "type": "verificacion",
          "label": "Diagrama unilineal en tablero"
        },
        {
          "id": "item_078",
          "type": "verificacion",
          "label": "Estado de cables"
        },
        {
          "id": "item_079",
          "type": "verificacion",
          "label": "Estado de terminales"
        },
        {
          "id": "item_080",
          "type": "verificacion",
          "label": "Circuitos identificados."
        },
        {
          "id": "item_081",
          "type": "verificacion",
          "label": "Sistema de bloqueo existente"
        },
        {
          "id": "item_082",
          "type": "verificacion",
          "label": "Posición de selector"
        },
        {
          "id": "item_083",
          "type": "verificacion",
          "label": "Verificar estado relés horarios"
        },
        {
          "id": "item_084",
          "type": "verificacion",
          "label": "Verificar estado de conectores"
        }
      ]
    },
    {
      "id": "componente_5",
      "title": "+NLA.1 cargador (741-RC-5031)",
      "items": [
        {
          "id": "item_085",
          "type": "verificacion",
          "label": "Estado exterior de tablero"
        },
        {
          "id": "item_086",
          "type": "verificacion",
          "label": "Tensión",
          "unit": "V"
        },
        {
          "id": "item_087",
          "type": "verificacion",
          "label": "Estado de puerta"
        },
        {
          "id": "item_088",
          "type": "verificacion",
          "label": "Estado de puerta interior"
        },
        {
          "id": "item_089",
          "type": "verificacion",
          "label": "Verificar presencia de tensión"
        },
        {
          "id": "item_090",
          "type": "verificacion",
          "label": "Capacidad Interruptor General (A)",
          "unit": "A"
        },
        {
          "id": "item_091",
          "type": "verificacion",
          "label": "Estado de luces pilotos"
        },
        {
          "id": "item_092",
          "type": "verificacion",
          "label": "Estado de bornera"
        },
        {
          "id": "item_093",
          "type": "verificacion",
          "label": "Estado barra tierra"
        },
        {
          "id": "item_094",
          "type": "verificacion",
          "label": "Verificación de puesta a tierra en tablero y puerta"
        },
        {
          "id": "item_095",
          "type": "verificacion",
          "label": "Aseo general"
        },
        {
          "id": "item_096",
          "type": "verificacion",
          "label": "Tableros señalizados"
        },
        {
          "id": "item_097",
          "type": "verificacion",
          "label": "Accesos a tablero libres de obstrucción"
        },
        {
          "id": "item_098",
          "type": "verificacion",
          "label": "Diagrama unilineal en tablero"
        },
        {
          "id": "item_099",
          "type": "verificacion",
          "label": "Estado de cables"
        },
        {
          "id": "item_100",
          "type": "verificacion",
          "label": "Estado de terminales"
        },
        {
          "id": "item_101",
          "type": "verificacion",
          "label": "Circuitos identificados."
        },
        {
          "id": "item_102",
          "type": "verificacion",
          "label": "Sistema de bloqueo existente"
        },
        {
          "id": "item_103",
          "type": "verificacion",
          "label": "Posición de selector"
        },
        {
          "id": "item_104",
          "type": "verificacion",
          "label": "Verificar estado relés horarios"
        },
        {
          "id": "item_105",
          "type": "verificacion",
          "label": "Verificar estado de conectores"
        }
      ]
    },
    {
      "id": "componente_6",
      "title": "+NLA.2 panel adistribucion (741-DP-5035)",
      "items": [
        {
          "id": "item_106",
          "type": "verificacion",
          "label": "Estado exterior de tablero"
        },
        {
          "id": "item_107",
          "type": "verificacion",
          "label": "Tensión",
          "unit": "V"
        },
        {
          "id": "item_108",
          "type": "verificacion",
          "label": "Estado de puerta"
        },
        {
          "id": "item_109",
          "type": "verificacion",
          "label": "Estado de puerta interior"
        },
        {
          "id": "item_110",
          "type": "verificacion",
          "label": "Verificar presencia de tensión"
        },
        {
          "id": "item_111",
          "type": "verificacion",
          "label": "Capacidad Interruptor General (A)",
          "unit": "A"
        },
        {
          "id": "item_112",
          "type": "verificacion",
          "label": "Estado de luces pilotos"
        },
        {
          "id": "item_113",
          "type": "verificacion",
          "label": "Estado de bornera"
        },
        {
          "id": "item_114",
          "type": "verificacion",
          "label": "Estado barra tierra"
        },
        {
          "id": "item_115",
          "type": "verificacion",
          "label": "Verificación de puesta a tierra en tablero y puerta"
        },
        {
          "id": "item_116",
          "type": "verificacion",
          "label": "Aseo general"
        },
        {
          "id": "item_117",
          "type": "verificacion",
          "label": "Tableros señalizados"
        },
        {
          "id": "item_118",
          "type": "verificacion",
          "label": "Accesos a tablero libres de obstrucción"
        },
        {
          "id": "item_119",
          "type": "verificacion",
          "label": "Diagrama unilineal en tablero"
        },
        {
          "id": "item_120",
          "type": "verificacion",
          "label": "Estado de cables"
        },
        {
          "id": "item_121",
          "type": "verificacion",
          "label": "Estado de terminales"
        },
        {
          "id": "item_122",
          "type": "verificacion",
          "label": "Circuitos identificados."
        },
        {
          "id": "item_123",
          "type": "verificacion",
          "label": "Sistema de bloqueo existente"
        },
        {
          "id": "item_124",
          "type": "verificacion",
          "label": "Posición de selector"
        },
        {
          "id": "item_125",
          "type": "verificacion",
          "label": "Verificar estado relés horarios"
        },
        {
          "id": "item_126",
          "type": "verificacion",
          "label": "Verificar estado de conectores"
        }
      ]
    },
    {
      "id": "componente_7",
      "title": "Sistema UPS RIELLO-53M (741-UPS-1301)",
      "items": [
        {
          "id": "item_127",
          "type": "verificacion",
          "label": "Estado exterior de tablero"
        },
        {
          "id": "item_128",
          "type": "verificacion",
          "label": "Tensión",
          "unit": "V"
        },
        {
          "id": "item_129",
          "type": "verificacion",
          "label": "Estado de puerta"
        },
        {
          "id": "item_130",
          "type": "verificacion",
          "label": "Estado de puerta interior"
        },
        {
          "id": "item_131",
          "type": "verificacion",
          "label": "Verificar presencia de tensión"
        },
        {
          "id": "item_132",
          "type": "verificacion",
          "label": "Capacidad Interruptor General (A)",
          "unit": "A"
        },
        {
          "id": "item_133",
          "type": "verificacion",
          "label": "Estado de luces pilotos"
        },
        {
          "id": "item_134",
          "type": "verificacion",
          "label": "Estado de bornera"
        },
        {
          "id": "item_135",
          "type": "verificacion",
          "label": "Estado barra tierra"
        },
        {
          "id": "item_136",
          "type": "verificacion",
          "label": "Verificación de puesta a tierra en tablero y puerta"
        },
        {
          "id": "item_137",
          "type": "verificacion",
          "label": "Aseo general"
        },
        {
          "id": "item_138",
          "type": "verificacion",
          "label": "Tableros señalizados"
        },
        {
          "id": "item_139",
          "type": "verificacion",
          "label": "Accesos a tablero libres de obstrucción"
        },
        {
          "id": "item_140",
          "type": "verificacion",
          "label": "Diagrama unilineal en tablero"
        },
        {
          "id": "item_141",
          "type": "verificacion",
          "label": "Estado de cables"
        },
        {
          "id": "item_142",
          "type": "verificacion",
          "label": "Estado de terminales"
        },
        {
          "id": "item_143",
          "type": "verificacion",
          "label": "Circuitos identificados."
        },
        {
          "id": "item_144",
          "type": "verificacion",
          "label": "Sistema de bloqueo existente"
        },
        {
          "id": "item_145",
          "type": "verificacion",
          "label": "Posición de selector"
        },
        {
          "id": "item_146",
          "type": "verificacion",
          "label": "Verificar estado relés horarios"
        },
        {
          "id": "item_147",
          "type": "verificacion",
          "label": "Verificar estado de conectores"
        }
      ]
    },
    {
      "id": "componente_8",
      "title": "Tablero baja tensión 120 VAC (741-JP-1302)",
      "items": [
        {
          "id": "item_148",
          "type": "verificacion",
          "label": "Estado exterior de tablero"
        },
        {
          "id": "item_149",
          "type": "verificacion",
          "label": "Tensión",
          "unit": "V"
        },
        {
          "id": "item_150",
          "type": "verificacion",
          "label": "Estado de puerta"
        },
        {
          "id": "item_151",
          "type": "verificacion",
          "label": "Estado de puerta interior"
        },
        {
          "id": "item_152",
          "type": "verificacion",
          "label": "Verificar presencia de tensión"
        },
        {
          "id": "item_153",
          "type": "verificacion",
          "label": "Capacidad Interruptor General (A)",
          "unit": "A"
        },
        {
          "id": "item_154",
          "type": "verificacion",
          "label": "Estado de luces pilotos"
        },
        {
          "id": "item_155",
          "type": "verificacion",
          "label": "Estado de bornera"
        },
        {
          "id": "item_156",
          "type": "verificacion",
          "label": "Estado barra tierra"
        },
        {
          "id": "item_157",
          "type": "verificacion",
          "label": "Verificación de puesta a tierra en tablero y puerta"
        },
        {
          "id": "item_158",
          "type": "verificacion",
          "label": "Aseo general"
        },
        {
          "id": "item_159",
          "type": "verificacion",
          "label": "Tableros señalizados"
        },
        {
          "id": "item_160",
          "type": "verificacion",
          "label": "Accesos a tablero libres de obstrucción"
        },
        {
          "id": "item_161",
          "type": "verificacion",
          "label": "Diagrama unilineal en tablero"
        },
        {
          "id": "item_162",
          "type": "verificacion",
          "label": "Estado de cables"
        },
        {
          "id": "item_163",
          "type": "verificacion",
          "label": "Estado de terminales"
        },
        {
          "id": "item_164",
          "type": "verificacion",
          "label": "Circuitos identificados."
        },
        {
          "id": "item_165",
          "type": "verificacion",
          "label": "Sistema de bloqueo existente"
        },
        {
          "id": "item_166",
          "type": "verificacion",
          "label": "Posición de selector"
        },
        {
          "id": "item_167",
          "type": "verificacion",
          "label": "Verificar estado relés horarios"
        },
        {
          "id": "item_168",
          "type": "verificacion",
          "label": "Verificar estado de conectores"
        }
      ]
    },
    {
      "id": "galeria_fotografica",
      "title": "Galería fotográfica",
      "items": [
        {
          "id": "item_169",
          "type": "photo",
          "label": "Galería fotográfica",
          "required": false,
          "maxPhotos": 6
        }
      ]
    }
  ],
  "nomenclature": "NT: NO TIENE / BN: BUENO / ML: MALO / NA: NO APLICA / NR: No Realizada (Indicar motivos en observaciones)",
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'sala_electrica_741_er_5001' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- INSP-34 · EST-ELEC-INSP-MLP-Bbosch-34 · Inspección de Relés de Protección (31 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Inspección de Relés de Protección",
  "meta": {
    "norma": "EST-ELEC-INSP-MLP-Bbosch-34",
    "revision": "0/abril-2025.",
    "titulo": "Inspección de Relés de Protección"
  },
  "header": [
    {
      "key": "tag",
      "label": "TAG Equipo",
      "input": "text"
    },
    {
      "key": "ot",
      "label": "N° OT",
      "input": "text"
    },
    {
      "key": "ubicacion",
      "label": "Ubicación",
      "input": "text"
    },
    {
      "key": "fecha",
      "label": "Fecha",
      "input": "date"
    },
    {
      "key": "h_inicio",
      "label": "Hora inicio",
      "input": "time"
    },
    {
      "key": "h_fin",
      "label": "Hora término",
      "input": "time"
    },
    {
      "key": "marca",
      "label": "Marca",
      "input": "text",
      "required": false
    },
    {
      "key": "modelo",
      "label": "Modelo",
      "input": "text",
      "required": false
    },
    {
      "key": "serie",
      "label": "N° Serie",
      "input": "text",
      "required": false
    }
  ],
  "roles": [
    "Encargado de la actividad",
    "Supervisor Bbosch",
    "Planificador Bbosch"
  ],
  "sections": [
    {
      "id": "a_registro_de_rele_de_protecci",
      "title": "A - Registro de relé de protección",
      "items": [
        {
          "id": "item_001",
          "type": "verificacion",
          "label": "Tensión registrada",
          "unit": "V"
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Corriente registrada.",
          "unit": "A"
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Energía registrada",
          "unit": "kWh"
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Se encuentra encendido indicador de relé en servicio"
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Lector o pantalla se encuentra legible o en buen estado"
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Botones de navegación se encuentran en buen estado"
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Fecha y hora de relé se encuentra actualizada"
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Se realiza descarga de eventos relé"
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Se realiza descarga de ajustes en Nativo y PDF"
        }
      ]
    },
    {
      "id": "b_revision_general",
      "title": "B - Revisión General",
      "items": [
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Estado de cubículo de control"
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "cubículo cuenta con señaléticas"
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "cubículo se encuentra aterrizado"
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "cubículo cuenta con iluminación interna"
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Estado de borneras del relé o controlador"
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Estado de puntos de conexión de relé"
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Estado de interruptores de control"
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Estado de luces indicadoras."
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Estados de Selectores de control"
        },
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "Estado de Bandejas o canaletas de cables"
        },
        {
          "id": "item_020",
          "type": "verificacion",
          "label": "Estado de manillas o perillas de cierre de cubículo"
        },
        {
          "id": "item_021",
          "type": "verificacion",
          "label": "Cubículo cuenta con relojes de medición"
        },
        {
          "id": "item_022",
          "type": "verificacion",
          "label": "Estado de relojes de medición"
        },
        {
          "id": "item_023",
          "type": "verificacion",
          "label": "Estado de selectores de relojes de medición"
        },
        {
          "id": "item_024",
          "type": "verificacion",
          "label": "Planos de control y alambrado disponibles en cubículo"
        }
      ]
    },
    {
      "id": "c_comunicaciones_de_rele",
      "title": "C - Comunicaciones de relé",
      "items": [
        {
          "id": "item_025",
          "type": "verificacion",
          "label": "Cuenta con equipo de comunicación"
        },
        {
          "id": "item_026",
          "type": "text",
          "label": "Qué tipo de comunicación se encuentra presente",
          "required": false,
          "multiline": false
        },
        {
          "id": "item_027",
          "type": "verificacion",
          "label": "Equipo de comunicación se encuentra encendido"
        },
        {
          "id": "item_028",
          "type": "verificacion",
          "label": "Realiza prueba de comunicación con sala 1"
        },
        {
          "id": "item_029",
          "type": "verificacion",
          "label": "Relé o controlador es visualizado en sala 1"
        }
      ]
    },
    {
      "id": "d_registro_de_alarmas_presente",
      "title": "D - Registro de alarmas presentes",
      "items": [
        {
          "id": "item_030",
          "type": "text",
          "label": "Listado de hallazgos de alarmas",
          "required": false,
          "multiline": true
        }
      ]
    },
    {
      "id": "galeria_fotografica",
      "title": "Galería fotográfica",
      "items": [
        {
          "id": "item_031",
          "type": "photo",
          "label": "Galería fotográfica",
          "required": false,
          "maxPhotos": 6
        }
      ]
    }
  ],
  "nomenclature": "NT: No tiene / BN: Bueno / ML: Malo / NA: No aplica / NR: No realizada (indicar motivos en observaciones). En caso de observaciones críticas, se adjunta registro fotográfico con la referencia.",
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'reles_proteccion' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- INSP-35 · EST-ELEC-INSP-MLP-Bbosch-35 · Inspección Banco de Condensadores Puerto Punta Chungo (19 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Inspección Banco de Condensadores Puerto Punta Chungo",
  "meta": {
    "norma": "EST-ELEC-INSP-MLP-Bbosch-35",
    "revision": "1 enero 2023",
    "titulo": "Inspección Banco de Condensadores Puerto Punta Chungo"
  },
  "header": [
    {
      "key": "tag",
      "label": "TAG Equipo",
      "input": "text"
    },
    {
      "key": "ot",
      "label": "N° OT",
      "input": "text"
    },
    {
      "key": "ubicacion",
      "label": "Ubicación",
      "input": "text"
    },
    {
      "key": "fecha",
      "label": "Fecha",
      "input": "date"
    },
    {
      "key": "h_inicio",
      "label": "Hora inicio",
      "input": "time"
    },
    {
      "key": "h_fin",
      "label": "Hora término",
      "input": "time"
    },
    {
      "key": "tension",
      "label": "Tensión",
      "input": "text",
      "required": false
    },
    {
      "key": "frecuencia",
      "label": "Frecuencia",
      "input": "text",
      "required": false
    },
    {
      "key": "corriente_max",
      "label": "Corriente Max",
      "input": "text",
      "required": false
    },
    {
      "key": "clase",
      "label": "Clase",
      "input": "text",
      "required": false
    },
    {
      "key": "serie",
      "label": "N° Serie",
      "input": "text",
      "required": false
    },
    {
      "key": "ano_de_instalacion",
      "label": "Año de Instalación",
      "input": "text",
      "required": false
    }
  ],
  "roles": [
    "Encargado de la actividad",
    "Supervisor Bbosch",
    "Planificador Bbosch"
  ],
  "sections": [
    {
      "id": "actividades",
      "title": "Actividades",
      "items": [
        {
          "id": "item_001",
          "type": "verificacion",
          "label": "Manual de operación de banco, se encuentra en la sala"
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Limpieza al interior de Banco"
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Estatus iluminación interior sala control"
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Estatus iluminación exterior de sala control"
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Limpieza de gabinete de control"
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Sistema de refrigeración se encuentra en buen estado"
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Estado de controlador de factor de potencia"
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Registrar la cantidad de etapas en funcionamiento",
          "unit": ""
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Estado de fusibles"
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Estado de protecciones"
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Registre Tensión Fase-Neutro",
          "unit": "V"
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Registre Tensión entre Fases",
          "unit": "V"
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Registre corriente de línea",
          "unit": "A"
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Registre Potencia Aparente",
          "unit": "kVA"
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Registre Potencia Activa",
          "unit": "kW"
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Registre Factor de Potencia",
          "unit": ""
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Evidencias de calentamiento en conductores o conexiones"
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Señaléticas en gabinetes"
        }
      ]
    },
    {
      "id": "galeria_fotografica",
      "title": "Galería fotográfica",
      "items": [
        {
          "id": "item_019",
          "type": "photo",
          "label": "Galería fotográfica",
          "required": false,
          "maxPhotos": 6
        }
      ]
    }
  ],
  "nomenclature": "NT: NO TIENE / BN: BUENO / ML: MALO / NA: NO APLICA / NR: No Realizada (Indicar motivos en observaciones)",
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'banco_condensadores_ppch' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- INSP-37 · EST-ELEC-MLP-Bbosch-37 · Inspección Cerco Perimetral STATCOM (12 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Inspección Cerco Perimetral STATCOM",
  "meta": {
    "norma": "EST-ELEC-MLP-Bbosch-37",
    "revision": "Mayo 2025",
    "titulo": "Inspección Cerco Perimetral STATCOM"
  },
  "header": [
    {
      "key": "tag",
      "label": "TAG Equipo",
      "input": "text"
    },
    {
      "key": "ot",
      "label": "N° OT",
      "input": "text"
    },
    {
      "key": "ubicacion",
      "label": "Ubicación",
      "input": "text"
    },
    {
      "key": "fecha",
      "label": "Fecha",
      "input": "date"
    },
    {
      "key": "h_inicio",
      "label": "Hora inicio",
      "input": "time"
    },
    {
      "key": "h_fin",
      "label": "Hora término",
      "input": "time"
    }
  ],
  "roles": [
    "Encargado de la actividad",
    "Supervisor Bbosch",
    "Planificador Bbosch"
  ],
  "sections": [
    {
      "id": "actividades",
      "title": "Actividades",
      "items": [
        {
          "id": "item_001",
          "type": "verificacion",
          "label": "Cerco perimetral se encuentra en buenas condiciones"
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Cerco perimetral se encuentra señalizado"
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Realizar desmalezado al interior del cerco y contorno"
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Cerco perimetral se encuentra aterrizado"
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Portones de cerco perimetral se encuentran cerrados con candado"
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Cerco perimetral se encuentra libre de oxido"
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Cerco perimetral se encuentra con alumbrado en su perímetro"
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Verificar estado de protección superior de cerco perimetral (alambres de púas)"
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Verificar bisagras de portones"
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Verificar estado de aldaba de portones"
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Verificar fijación de malla de cerco perimetral"
        }
      ]
    },
    {
      "id": "galeria_fotografica",
      "title": "Galería fotográfica",
      "items": [
        {
          "id": "item_012",
          "type": "photo",
          "label": "Galería fotográfica",
          "required": false,
          "maxPhotos": 6
        }
      ]
    }
  ],
  "nomenclature": "NT: NO TIENE / BN: BUENO / ML: MALO / NA: NO APLICA / NR: No Realizada (Indicar motivos en observaciones)",
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'cerco_perimetral_statcom' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- INSP-38 · EST-ELEC-MLP-Bbosch-38 · Inspección Proceso de Carguío de Combustible y Equipos PPGG Piuquenes (32 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Inspección Proceso de Carguío de Combustible y Equipos PPGG Piuquenes",
  "meta": {
    "norma": "EST-ELEC-MLP-Bbosch-38",
    "revision": "Mayo 2025",
    "titulo": "Inspección Proceso de Carguío de Combustible y Equipos PPGG Piuquenes"
  },
  "header": [
    {
      "key": "tag",
      "label": "TAG Equipo",
      "input": "text"
    },
    {
      "key": "ot",
      "label": "N° OT",
      "input": "text"
    },
    {
      "key": "ubicacion",
      "label": "Ubicación",
      "input": "text"
    },
    {
      "key": "fecha",
      "label": "Fecha",
      "input": "date"
    },
    {
      "key": "h_inicio",
      "label": "Hora inicio",
      "input": "time"
    },
    {
      "key": "h_fin",
      "label": "Hora término",
      "input": "time"
    }
  ],
  "roles": [
    "Encargado de la actividad",
    "Supervisor Bbosch",
    "Planificador Bbosch"
  ],
  "sections": [
    {
      "id": "niveles_de_petroleo_en_los_est",
      "title": "Niveles de Petróleo en los Estanques del parque de generación.",
      "items": [
        {
          "id": "item_001",
          "type": "verificacion",
          "label": "Nivel de Petróleo Estanque principal N°1. (%)",
          "unit": "%"
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Nivel de Petróleo Estanque principal N°2. (%)",
          "unit": "%"
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Nivel de Petróleo Estanque Diarios Grupo Generador N°1. (%)",
          "unit": "%"
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Nivel de Petróleo Estanque Diarios Grupo Generador N°2. (%)",
          "unit": "%"
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Nivel de Petróleo Estanque Diarios Grupo Generador N°3. (%)",
          "unit": "%"
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Estanques se encuentran en buenas condiciones."
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Tuberías se encuentran en buenas condiciones."
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Válvulas exteriores presentan fuga (sin Fuga)."
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Estructuras Exteriores de los TK presentan corrosión."
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Escaleras y pasarelas en buen estado."
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Sistema antiderrame se encuentra en buenas condiciones."
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Señalización visible y adecuada."
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "No existen Materiales Inflamables en sector sin control."
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Extintores disponibles y con mantención al día."
        },
        {
          "id": "item_015",
          "type": "text",
          "label": "Fecha de vencimiento extintor",
          "required": false,
          "multiline": false
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Presencia de señales de fugas de petróleos en el piso o manchas en las bases tuberías."
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Verificar funcionamiento de bombas tk1 principal, tk2 Principal. (si aplica) y líneas de distribución."
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Verificar indicadores de nivel, presión y temperatura si existen."
        },
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "Verificar limpieza del entorno y ausencia de derrames."
        },
        {
          "id": "item_020",
          "type": "verificacion",
          "label": "Existe un kit Antiderrame En el sector."
        },
        {
          "id": "item_021",
          "type": "verificacion",
          "label": "Accesos Libres de Obstrucción: Patio, Sala de Bombeo."
        },
        {
          "id": "item_022",
          "type": "verificacion",
          "label": "Estado tableros eléctricos de llenado y vaciado de combustible."
        },
        {
          "id": "item_023",
          "type": "verificacion",
          "label": "Plano de Equipos en terreno."
        },
        {
          "id": "item_024",
          "type": "verificacion",
          "label": "Procedimiento Para Impacto Ambiental."
        },
        {
          "id": "item_025",
          "type": "verificacion",
          "label": "Sistema Detección de Incendio"
        },
        {
          "id": "item_026",
          "type": "verificacion",
          "label": "Sistema de Iluminación de Emergencia."
        },
        {
          "id": "item_027",
          "type": "verificacion",
          "label": "Sistema de Iluminación Normal."
        },
        {
          "id": "item_028",
          "type": "verificacion",
          "label": "Estado General del parque Generación Piuquenes."
        },
        {
          "id": "item_029",
          "type": "verificacion",
          "label": "Estado de Luces Piloto o Indicadoras de Nivel Combustible."
        },
        {
          "id": "item_030",
          "type": "verificacion",
          "label": "Estado de kit de Emergencia en el sector."
        },
        {
          "id": "item_031",
          "type": "verificacion",
          "label": "Señalización de seguridad visible y clara"
        }
      ]
    },
    {
      "id": "galeria_fotografica",
      "title": "Galería fotográfica",
      "items": [
        {
          "id": "item_032",
          "type": "photo",
          "label": "Galería fotográfica",
          "required": false,
          "maxPhotos": 6
        }
      ]
    }
  ],
  "nomenclature": "NT: No tiene / BN: Bueno / ML: Malo / NA: No aplica / NR: No realizada (indicar motivos en observaciones). En caso de observaciones críticas, se adjunta registro fotográfico con la referencia.",
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'carga_combustible_piuquenes' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- INSP-39 · EST-ELEC-MLP-Bbosch-39 · Inspección y Limpieza Sala Eléctrica 740-ER-5002 Línea 4 (22 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Inspección y Limpieza Sala Eléctrica 740-ER-5002 Línea 4",
  "meta": {
    "norma": "EST-ELEC-MLP-Bbosch-39",
    "revision": "Octubre 2025",
    "titulo": "Inspección y Limpieza Sala Eléctrica 740-ER-5002 Línea 4"
  },
  "header": [
    {
      "key": "tag",
      "label": "TAG sala eléctrica",
      "input": "text"
    },
    {
      "key": "ot",
      "label": "N° OT",
      "input": "text"
    },
    {
      "key": "ubicacion",
      "label": "Ubicación",
      "input": "text"
    },
    {
      "key": "fecha",
      "label": "Fecha",
      "input": "date"
    },
    {
      "key": "h_inicio",
      "label": "Hora inicio",
      "input": "time"
    },
    {
      "key": "h_fin",
      "label": "Hora término",
      "input": "time"
    }
  ],
  "roles": [
    "Encargado de la actividad",
    "Supervisor Bbosch",
    "Planificador Bbosch"
  ],
  "sections": [
    {
      "id": "actividades",
      "title": "Actividades",
      "items": [
        {
          "id": "item_001",
          "type": "verificacion",
          "label": "Verificar Limpieza exterior de Cubículo de Interruptor"
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Verificar Limpieza exterior de equipos de control y medición"
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Revisar estado de luces piloto (switchgear, TT/PP)"
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Verificar limpieza de sala (Presencia de Polvo, Basura etc.)"
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Verificar estado de accesos Sala Eléctrica, puertas, escotillas, portones."
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Verificar presencia de componentes en desuso o que no correspondan"
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Verificar estado de Aire acondicionado, ¿Está operativo?"
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Verificar estado de chapas de puertas de ingreso y estado de estas (abiertas o cerradas)"
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Verificar iluminación interior de la sala"
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Verificar componente de kit de emergencia-rescate"
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Verificar presencia traje ignifugo para maniobras"
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Verificar estado de extintores o sistema de amago de incendios"
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Verificar estados de luces de emergencia."
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Presencia de puesta a tierra."
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Verificar estado de teléfono fijo. ¿está operativo?"
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Estado enchufes BT"
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Estado de dispositivos de bloqueo (candado y tarjetas operacionales vigentes, juego de pinzas"
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Verificar entorno de salas y cercos perimetrales indicar cualquier anormalidad"
        },
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "Se realizó limpieza de sala eléctrica."
        },
        {
          "id": "item_020",
          "type": "number",
          "label": "GIS: presión (valor en PSI)",
          "required": false,
          "unit": "psi"
        },
        {
          "id": "item_021",
          "type": "verificacion",
          "label": "T° al interior de la sala eléctrica al momento de la lectura(°C)",
          "unit": "°C"
        }
      ]
    },
    {
      "id": "galeria_fotografica",
      "title": "Galería fotográfica",
      "items": [
        {
          "id": "item_022",
          "type": "photo",
          "label": "Galería fotográfica",
          "required": false,
          "maxPhotos": 6
        }
      ]
    }
  ],
  "nomenclature": "NT: No tiene / BN: Bueno / ML: Malo / NA: No aplica / NR: No realizada (indicar motivos en observaciones). En caso de observaciones críticas, se adjunta registro fotográfico con la referencia."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'limpieza_sala_740_er_5002_l4' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- INSP-40 · EST-ELEC-INSP-MLP-Bbosch-40 · Inspección Semanal Grupo Generadores Puerto - Mauro (57 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Inspección Semanal Grupo Generadores Puerto - Mauro",
  "meta": {
    "norma": "EST-ELEC-INSP-MLP-Bbosch-40",
    "revision": "Octubre 2024",
    "titulo": "Inspección Semanal Grupo Generadores Puerto - Mauro"
  },
  "header": [
    {
      "key": "tag",
      "label": "TAG Equipo",
      "input": "text"
    },
    {
      "key": "ot",
      "label": "N° OT",
      "input": "text"
    },
    {
      "key": "ubicacion",
      "label": "Ubicación",
      "input": "text"
    },
    {
      "key": "fecha",
      "label": "Fecha",
      "input": "date"
    },
    {
      "key": "h_inicio",
      "label": "Hora inicio",
      "input": "time"
    },
    {
      "key": "h_fin",
      "label": "Hora término",
      "input": "time"
    },
    {
      "key": "cantidad_equipos",
      "label": "Cantidad de equipos",
      "input": "text",
      "required": false
    },
    {
      "key": "horario_prueba",
      "label": "Horario de prueba",
      "input": "text",
      "required": false
    }
  ],
  "roles": [
    "Encargado de la actividad",
    "Supervisor Bbosch",
    "Planificador Bbosch"
  ],
  "sections": [
    {
      "id": "actividades",
      "title": "Actividades",
      "items": [
        {
          "id": "item_001",
          "type": "verificacion",
          "label": "Filtro de aire de sala."
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Filtro aire."
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Interruptores de control cerrados."
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Verificación de puesta a tierra de GG."
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Sistema de detección de incendio"
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Tableros señalizados."
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Estanques en buenas condiciones"
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Equipos adecuados para emergencia."
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Procedimientos para impacto ambiental"
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Planos de equipo en terreno."
        }
      ]
    },
    {
      "id": "grupo_generador",
      "title": "Grupo generador",
      "items": [
        {
          "id": "item_011",
          "type": "text",
          "label": "TAG del grupo generador",
          "required": true,
          "multiline": false
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Voltaje batería",
          "unit": "V"
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Nivel de Diesel (%)",
          "unit": "%"
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Temperatura de aceite (C°)",
          "unit": "°C"
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Temperatura de Refrigerante (C°)",
          "unit": "°C"
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Revisar fugas de aceite"
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Revisar fugas de refrigerante"
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Revisar fugas de Diesel"
        },
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "Voltaje",
          "unit": "V"
        },
        {
          "id": "item_020",
          "type": "verificacion",
          "label": "Potencia",
          "unit": "kW"
        },
        {
          "id": "item_021",
          "type": "verificacion",
          "label": "Horómetro actual",
          "unit": "h"
        },
        {
          "id": "item_022",
          "type": "verificacion",
          "label": "Horómetro después de la prueba",
          "unit": "h"
        },
        {
          "id": "item_023",
          "type": "verificacion",
          "label": "Energía actual (KWH)",
          "unit": "kWh"
        },
        {
          "id": "item_024",
          "type": "verificacion",
          "label": "Energía después de la prueba (KWH)",
          "unit": "kWh"
        },
        {
          "id": "item_025",
          "type": "verificacion",
          "label": "Arranques",
          "unit": ""
        },
        {
          "id": "item_026",
          "type": "verificacion",
          "label": "Nivel de agua"
        },
        {
          "id": "item_027",
          "type": "verificacion",
          "label": "Aseo General"
        },
        {
          "id": "item_028",
          "type": "verificacion",
          "label": "Luces piloto"
        },
        {
          "id": "item_029",
          "type": "verificacion",
          "label": "Puertas de sala"
        },
        {
          "id": "item_030",
          "type": "verificacion",
          "label": "Acceso a equipo"
        },
        {
          "id": "item_031",
          "type": "verificacion",
          "label": "Sistema de iluminación"
        },
        {
          "id": "item_032",
          "type": "verificacion",
          "label": "Iluminación de emergencia"
        },
        {
          "id": "item_033",
          "type": "verificacion",
          "label": "Presencia de tensión de control"
        },
        {
          "id": "item_034",
          "type": "verificacion",
          "label": "Verificar interruptores de calefactores"
        },
        {
          "id": "item_035",
          "type": "verificacion",
          "label": "Tensión de cargador o mantenedor de batería",
          "unit": "V"
        },
        {
          "id": "item_036",
          "type": "verificacion",
          "label": "Corriente de cargador de batería",
          "unit": "A"
        },
        {
          "id": "item_037",
          "type": "verificacion",
          "label": "Extintores señalados"
        },
        {
          "id": "item_038",
          "type": "text",
          "label": "Fecha vencimiento extintor",
          "required": false,
          "multiline": false
        },
        {
          "id": "item_039",
          "type": "verificacion",
          "label": "Corriente fase A",
          "unit": "A"
        },
        {
          "id": "item_040",
          "type": "verificacion",
          "label": "Corriente fase B",
          "unit": "A"
        },
        {
          "id": "item_041",
          "type": "verificacion",
          "label": "Corriente fase C",
          "unit": "A"
        }
      ],
      "repetible": true
    },
    {
      "id": "registro_operacional_en_terren_2",
      "title": "Registro operacional en terreno (Sí / No)",
      "items": [
        {
          "id": "item_042",
          "type": "verificacion",
          "label": "Se realiza documentación para realizar prueba de generadores"
        },
        {
          "id": "item_043",
          "type": "verificacion",
          "label": "Verificar la presencia de alarmas en equipo antes de prueba"
        },
        {
          "id": "item_044",
          "type": "verificacion",
          "label": "Verificar nivel de estanque de petróleo y filtraciones"
        },
        {
          "id": "item_045",
          "type": "verificacion",
          "label": "Verificar nivel de agua y filtraciones"
        },
        {
          "id": "item_046",
          "type": "verificacion",
          "label": "Toma de datos antes de realizar las pruebas"
        },
        {
          "id": "item_047",
          "type": "verificacion",
          "label": "Dar aviso de inicio de pruebas con sala N°1 (solo en estación drenes y S/E principal)"
        },
        {
          "id": "item_048",
          "type": "verificacion",
          "label": "Verificar inicio de partida de generadores"
        },
        {
          "id": "item_049",
          "type": "verificacion",
          "label": "Tomar datos con generadores en servicio"
        },
        {
          "id": "item_050",
          "type": "verificacion",
          "label": "Tomar datos al finalizar la prueba"
        },
        {
          "id": "item_051",
          "type": "verificacion",
          "label": "Verificar si hay fugas de Diesel al término de la prueba"
        },
        {
          "id": "item_052",
          "type": "verificacion",
          "label": "Verificar si hay fugas de aceite al término de la prueba"
        },
        {
          "id": "item_053",
          "type": "verificacion",
          "label": "Verificar si hay fugas de refrigerante al término de la prueba"
        },
        {
          "id": "item_054",
          "type": "verificacion",
          "label": "Verificar en paneles de control si queda alarmas en el equipo"
        },
        {
          "id": "item_055",
          "type": "verificacion",
          "label": "Verificar en sala eléctrica si queda alguna alarma en la TTA"
        },
        {
          "id": "item_056",
          "type": "verificacion",
          "label": "Dar aviso a sala eléctrica N°1 las Novedades de las pruebas y el retiro del área"
        }
      ]
    },
    {
      "id": "galeria_fotografica",
      "title": "Galería fotográfica",
      "items": [
        {
          "id": "item_057",
          "type": "photo",
          "label": "Galería fotográfica",
          "required": false,
          "maxPhotos": 6
        }
      ]
    }
  ],
  "nomenclature": "NT: NO TIENE / BN: BUENO / ML: MALO / NA: NO APLICA / NR: No Realizada / SI / NO (Indicar motivos en observaciones)",
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia. Un bloque «Grupo generador» por cada grupo probado: use «Agregar grupo generador» (sección repetible). En el registro operacional en terreno, marque BN para «Sí» y ML para «No» (con la observación)."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'pruebas_generadores_puerto_mauro' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- INSP-41 · EST-ELEC-INSP-MLP-Bbosch-41 · Inspección Sala Eléctrica 740-ER-5002 (35 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Inspección Sala Eléctrica 740-ER-5002",
  "meta": {
    "norma": "EST-ELEC-INSP-MLP-Bbosch-41",
    "revision": "Diciembre 2025",
    "titulo": "Inspección Sala Eléctrica 740-ER-5002"
  },
  "header": [
    {
      "key": "tag",
      "label": "TAG Equipo",
      "input": "text"
    },
    {
      "key": "ot",
      "label": "N° OT",
      "input": "text"
    },
    {
      "key": "ubicacion",
      "label": "Ubicación",
      "input": "text"
    },
    {
      "key": "fecha",
      "label": "Fecha",
      "input": "date"
    },
    {
      "key": "h_inicio",
      "label": "Hora inicio",
      "input": "time"
    },
    {
      "key": "h_fin",
      "label": "Hora término",
      "input": "time"
    }
  ],
  "roles": [
    "Encargado de la actividad",
    "Supervisor Bbosch",
    "Planificador Bbosch"
  ],
  "sections": [
    {
      "id": "componente",
      "title": "Tablero Alumbrado (740-LP-5001)",
      "items": [
        {
          "id": "item_001",
          "type": "verificacion",
          "label": "Estado exterior de tablero"
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Tensión",
          "unit": "V"
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Estado de puerta"
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Estado de puerta interior"
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Verificar Selector posición Manual/Automático"
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Verificar estados de Relés Horarios"
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Verificar estados de Contactores"
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Estado de bornera"
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Estado barra tierra"
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Verificación de puesta a tierra en tablero y puerta"
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Aseo general"
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Tableros señalizados"
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Estado Luces pilotos"
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Diagrama unilineal en tablero"
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Estado de cables"
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Estado de terminales"
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Sistema de bloqueo existente"
        }
      ]
    },
    {
      "id": "componente_2",
      "title": "Tablero Instrumentación 120 VAC (741-JP-1303)",
      "items": [
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Estado exterior de tablero"
        },
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "Tensión",
          "unit": "V"
        },
        {
          "id": "item_020",
          "type": "verificacion",
          "label": "Estado de puerta"
        },
        {
          "id": "item_021",
          "type": "verificacion",
          "label": "Estado de puerta interior"
        },
        {
          "id": "item_022",
          "type": "verificacion",
          "label": "Verificar presencia de tensión"
        },
        {
          "id": "item_023",
          "type": "verificacion",
          "label": "Capacidad Interruptor General (A)",
          "unit": "A"
        },
        {
          "id": "item_024",
          "type": "verificacion",
          "label": "Estado de luces pilotos"
        },
        {
          "id": "item_025",
          "type": "verificacion",
          "label": "Estado de bornera"
        },
        {
          "id": "item_026",
          "type": "verificacion",
          "label": "Estado barra tierra"
        },
        {
          "id": "item_027",
          "type": "verificacion",
          "label": "Verificación de puesta a tierra en tablero y puerta"
        },
        {
          "id": "item_028",
          "type": "verificacion",
          "label": "Aseo general"
        },
        {
          "id": "item_029",
          "type": "verificacion",
          "label": "Tableros señalizados"
        },
        {
          "id": "item_030",
          "type": "verificacion",
          "label": "Accesos a tablero libres de obstrucción"
        },
        {
          "id": "item_031",
          "type": "verificacion",
          "label": "Diagrama unilineal en tablero"
        },
        {
          "id": "item_032",
          "type": "verificacion",
          "label": "Estado de cables"
        },
        {
          "id": "item_033",
          "type": "verificacion",
          "label": "Estado de terminales"
        },
        {
          "id": "item_034",
          "type": "verificacion",
          "label": "Sistema de bloqueo existente"
        }
      ]
    },
    {
      "id": "galeria_fotografica",
      "title": "Galería fotográfica",
      "items": [
        {
          "id": "item_035",
          "type": "photo",
          "label": "Galería fotográfica",
          "required": false,
          "maxPhotos": 6
        }
      ]
    }
  ],
  "nomenclature": "NT: NO TIENE / BN: BUENO / ML: MALO / NA: NO APLICA / NR: No Realizada (Indicar motivos en observaciones)",
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'sala_electrica_741_er_5002' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

