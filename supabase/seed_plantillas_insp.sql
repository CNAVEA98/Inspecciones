-- Plantillas INSP-01 a INSP-15 (salvo INSP-12, que está en seed_catalogo.sql) × Plan Matriz (Word revisados de «Bases de datos generales/Formatos BBOSCH/Inspeciones»).
-- Es seguro ejecutarlo más de una vez y también en un Supabase remoto: no crea usuarios y no repite lo ya cargado.
-- En el SQL Editor remoto elegir «postgres (Superuser)» junto a «Run».
-- Cada formato tiene su propio tipo de equipo (la plantilla se busca por tipo de equipo × modo de trabajo).

insert into public.equipment_types (code, name, sort)
values ('desconectador_seccionador', 'Desconectador/seccionador de maniobra 23 kV', 6)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('banco_condensadores_mauro', 'Banco de condensadores Mauro', 7)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('grupo_generador_mauro', 'Pruebas de grupos generadores Mauro', 8)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('sala_electrica_stmg', 'Sala eléctrica STMG 23 kV', 9)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('reconectador', 'Reconectador', 3)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('subestacion_movil', 'Subestación móvil', 10)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('transformador_aereo', 'Transformador aéreo', 2)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('switchgear_sala_12', 'Switchgear sala eléctrica 12', 11)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('parron_maniobra', 'Parrón de maniobra 23 kV', 12)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('sistema_presurizado_sala_12', 'Sistema presurizado sala 12', 13)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('inspeccion_lineas', 'Inspección de líneas', 4)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('switchgear_23kv', 'Switchgear 23 kV', 14)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('switchgear_tranque_mauro', 'Switchgear principal Tranque Mauro', 15)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('tunel_cables_stmg', 'Túnel de cables STMG', 16)
on conflict (code) do nothing;

-- EST-ELEC-MLP-Bbosch-01 · Desconectador/seccionador de maniobra 23 kV - Inspección según Plan Matriz (24 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Desconectador/seccionador de maniobra 23 kV - Inspección según Plan Matriz",
  "meta": {
    "norma": "EST-ELEC-MLP-Bbosch-01",
    "revision": "Abril 2024",
    "titulo": "Inspección Desconectador/seccionador de maniobra 23 kV"
  },
  "nomenclature": "NT: No tiene / BN: Bueno / ML: Malo / NA: No aplica / NR: No realizada (indicar motivos en observaciones). En caso de observaciones críticas, se adjunta registro fotográfico con la referencia.",
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
      "id": "estructura",
      "title": "Estructura y aislación",
      "items": [
        {
          "id": "item_01",
          "type": "verificacion",
          "label": "El acceso a la estructura es el adecuado."
        },
        {
          "id": "item_02",
          "type": "verificacion",
          "label": "Vigas y crucetas se aprecian normal."
        },
        {
          "id": "item_03",
          "type": "verificacion",
          "label": "Verificar estado de los postes."
        },
        {
          "id": "item_04",
          "type": "verificacion",
          "label": "Verificar estado aisladores disco."
        },
        {
          "id": "item_05",
          "type": "verificacion",
          "label": "Verificar estado aisladores pedestal o espiga."
        },
        {
          "id": "item_06",
          "type": "verificacion",
          "label": "Verificar estado enmalle."
        },
        {
          "id": "item_07",
          "type": "verificacion",
          "label": "Verificar cable de guarda."
        }
      ]
    },
    {
      "id": "equipos",
      "title": "Equipos de maniobra y protección",
      "items": [
        {
          "id": "item_08",
          "type": "verificacion",
          "label": "Estado visual pararrayos."
        },
        {
          "id": "item_09",
          "type": "verificacion",
          "label": "Estado visual de las mufas."
        },
        {
          "id": "item_10",
          "type": "verificacion",
          "label": "Estado visual conductores."
        },
        {
          "id": "item_11",
          "type": "verificacion",
          "label": "Iluminación de estructura."
        },
        {
          "id": "item_12",
          "type": "verificacion",
          "label": "Conexión a tierra de la estructura y equipos."
        },
        {
          "id": "item_13",
          "type": "verificacion",
          "label": "Desconectadores fusibles se aprecian normal."
        },
        {
          "id": "item_14",
          "type": "verificacion",
          "label": "Desconectador cuchilla se aprecian normal."
        },
        {
          "id": "item_15",
          "type": "verificacion",
          "label": "Seccionador tipo cuchilla se aprecian normal."
        },
        {
          "id": "item_16",
          "type": "verificacion",
          "label": "Estado de las canalizaciones."
        },
        {
          "id": "item_17",
          "type": "verificacion",
          "label": "Identificación de la estructura."
        }
      ]
    },
    {
      "id": "entorno",
      "title": "Termografía, entorno y seguridad",
      "items": [
        {
          "id": "item_18",
          "type": "verificacion",
          "label": "Realizar termografías puntos de conexión y techo."
        },
        {
          "id": "item_19",
          "type": "verificacion",
          "label": "Estructura cuenta con cerco perimetral."
        },
        {
          "id": "item_20",
          "type": "verificacion",
          "label": "Estructura cuenta con señalética."
        },
        {
          "id": "item_21",
          "type": "verificacion",
          "label": "¿Área cuenta con sistema de amago de incendios?"
        },
        {
          "id": "item_22",
          "type": "verificacion",
          "label": "Verificar estado de cables conectados."
        },
        {
          "id": "item_23",
          "type": "verificacion",
          "label": "Verificar visualmente estado de mufas."
        },
        {
          "id": "item_24",
          "type": "verificacion",
          "label": "Verificar condición de malezas en el sector (de lo contrario desmalezar)."
        }
      ]
    }
  ]
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'desconectador_seccionador' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- EST-ELEC-MLP-Bbosch-02 · Banco de condensadores Mauro - Inspección según Plan Matriz (56 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Banco de condensadores Mauro - Inspección según Plan Matriz",
  "meta": {
    "norma": "EST-ELEC-MLP-Bbosch-02",
    "revision": "Agosto 2025",
    "titulo": "Inspección Banco de condensadores Mauro"
  },
  "nomenclature": "NT: No tiene / BN: Bueno / ML: Malo / NA: No aplica / NR: No realizada (indicar motivos en observaciones). En caso de observaciones críticas, se adjunta registro fotográfico con la referencia.",
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
      "id": "sala_control",
      "title": "Sala de control banco de condensadores",
      "items": [
        {
          "id": "item_01",
          "type": "verificacion",
          "label": "Instructivo de operación de banco, se encuentra en la sala."
        },
        {
          "id": "item_02",
          "type": "verificacion",
          "label": "Limpieza al interior de sala."
        },
        {
          "id": "item_03",
          "type": "verificacion",
          "label": "Estatus iluminación interior sala control."
        },
        {
          "id": "item_04",
          "type": "verificacion",
          "label": "Estatus iluminación exterior de sala control."
        },
        {
          "id": "item_05",
          "type": "verificacion",
          "label": "Estatus iluminación de emergencia interior sala control."
        },
        {
          "id": "item_06",
          "type": "verificacion",
          "label": "Limpieza de gabinete de control."
        },
        {
          "id": "item_07",
          "type": "verificacion",
          "label": "Sistema de refrigeración se encuentra en buen estado."
        },
        {
          "id": "item_08",
          "type": "verificacion",
          "label": "Estado de controlador de factor de potencia."
        },
        {
          "id": "item_09",
          "type": "verificacion",
          "label": "Registrar la cantidad de etapas en funcionamiento.",
          "unit": ""
        },
        {
          "id": "item_10",
          "type": "verificacion",
          "label": "Estatus relé sobre corriente banco 1 (abierto / cerrado)."
        },
        {
          "id": "item_11",
          "type": "verificacion",
          "label": "Estatus relé sobre corriente banco 2 (abierto / cerrado)."
        },
        {
          "id": "item_12",
          "type": "verificacion",
          "label": "Estatus relé sobre corriente banco 3 (abierto / cerrado)."
        },
        {
          "id": "item_13",
          "type": "verificacion",
          "label": "Estatus relé sobre corriente banco 4 (abierto / cerrado)."
        },
        {
          "id": "item_14",
          "type": "verificacion",
          "label": "Estatus relé sobre corriente banco 5 (abierto / cerrado)."
        },
        {
          "id": "item_15",
          "type": "verificacion",
          "label": "Registre corriente de operación relé sobre corriente banco 1.",
          "unit": "A"
        },
        {
          "id": "item_16",
          "type": "verificacion",
          "label": "Registre corriente de operación relé sobre corriente banco 2.",
          "unit": "A"
        },
        {
          "id": "item_17",
          "type": "verificacion",
          "label": "Registre corriente de operación relé sobre corriente banco 3.",
          "unit": "A"
        },
        {
          "id": "item_18",
          "type": "verificacion",
          "label": "Registre corriente de operación relé sobre corriente banco 4.",
          "unit": "A"
        },
        {
          "id": "item_19",
          "type": "verificacion",
          "label": "Registre corriente de operación relé sobre corriente banco 5.",
          "unit": "A"
        },
        {
          "id": "item_20",
          "type": "verificacion",
          "label": "Estatus de UPS sala control."
        },
        {
          "id": "item_21",
          "type": "verificacion",
          "label": "Estatus de tablero de distribución de corriente alterna de sala."
        }
      ]
    },
    {
      "id": "banco",
      "title": "Banco de condensadores",
      "items": [
        {
          "id": "banco_01",
          "type": "verificacion",
          "label": "El cerco perimetral cuenta con extintor."
        },
        {
          "id": "banco_02",
          "type": "verificacion",
          "label": "Estatus de limpieza al interior del cerco perimetral."
        },
        {
          "id": "banco_03",
          "type": "verificacion",
          "label": "Estatus de limpieza de aisladores y componentes."
        },
        {
          "id": "banco_04",
          "type": "verificacion",
          "label": "Estatus de condensadores banco etapa 1."
        },
        {
          "id": "banco_05",
          "type": "verificacion",
          "label": "Estatus de condensadores banco etapa 2."
        },
        {
          "id": "banco_06",
          "type": "verificacion",
          "label": "Estatus de condensadores banco etapa 3."
        },
        {
          "id": "banco_07",
          "type": "verificacion",
          "label": "Estatus de condensadores banco etapa 4."
        },
        {
          "id": "banco_08",
          "type": "verificacion",
          "label": "Estatus de condensadores banco etapa 5."
        },
        {
          "id": "banco_09",
          "type": "verificacion",
          "label": "Estatus de transformadores de corriente banco etapa 1."
        },
        {
          "id": "banco_10",
          "type": "verificacion",
          "label": "Estatus de transformadores de corriente banco etapa 2."
        },
        {
          "id": "banco_11",
          "type": "verificacion",
          "label": "Estatus de transformadores de corriente banco etapa 3."
        },
        {
          "id": "banco_12",
          "type": "verificacion",
          "label": "Estatus de transformadores de corriente banco etapa 4."
        },
        {
          "id": "banco_13",
          "type": "verificacion",
          "label": "Estatus de transformadores de corriente banco etapa 5."
        },
        {
          "id": "banco_14",
          "type": "verificacion",
          "label": "Estatus de transformadores de potencial banco etapa 1."
        },
        {
          "id": "banco_15",
          "type": "verificacion",
          "label": "Estatus de transformadores de potencial banco etapa 2."
        },
        {
          "id": "banco_16",
          "type": "verificacion",
          "label": "Estatus de transformadores de potencial banco etapa 3."
        },
        {
          "id": "banco_17",
          "type": "verificacion",
          "label": "Estatus de transformadores de potencial banco etapa 4."
        },
        {
          "id": "banco_18",
          "type": "verificacion",
          "label": "Estatus de transformadores de potencial banco etapa 5."
        },
        {
          "id": "banco_19",
          "type": "verificacion",
          "label": "Estado de los interruptores Power-Cooper etapa 1."
        },
        {
          "id": "banco_20",
          "type": "verificacion",
          "label": "Estado de los interruptores Power-Cooper etapa 2."
        },
        {
          "id": "banco_21",
          "type": "verificacion",
          "label": "Estado de los interruptores Power-Cooper etapa 3."
        },
        {
          "id": "banco_22",
          "type": "verificacion",
          "label": "Estado de los interruptores Power-Cooper etapa 4."
        },
        {
          "id": "banco_23",
          "type": "verificacion",
          "label": "Estado de los interruptores Power-Cooper etapa 5."
        },
        {
          "id": "banco_24",
          "type": "verificacion",
          "label": "Estado visual de los capacitores."
        },
        {
          "id": "banco_25",
          "type": "verificacion",
          "label": "Signos de hinchazón o deformación de los capacitores."
        },
        {
          "id": "banco_26",
          "type": "verificacion",
          "label": "Signos de filtración de aceite de los capacitores."
        },
        {
          "id": "banco_27",
          "type": "verificacion",
          "label": "Estado de aisladores."
        },
        {
          "id": "banco_28",
          "type": "verificacion",
          "label": "Estado de los inductores."
        },
        {
          "id": "banco_29",
          "type": "verificacion",
          "label": "Estado de la puesta a tierra."
        },
        {
          "id": "banco_30",
          "type": "verificacion",
          "label": "Estado de los conductores."
        },
        {
          "id": "banco_31",
          "type": "verificacion",
          "label": "Signos de oxidación en la estructura."
        },
        {
          "id": "banco_32",
          "type": "verificacion",
          "label": "Estado de seccionadora palanca 23 kV."
        },
        {
          "id": "banco_33",
          "type": "verificacion",
          "label": "Estado de cerco perimetral."
        },
        {
          "id": "banco_34",
          "type": "verificacion",
          "label": "Estado de acceso al patio de condensadores."
        },
        {
          "id": "banco_35",
          "type": "verificacion",
          "label": "Necesita desmalezado."
        }
      ]
    }
  ]
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'banco_condensadores_mauro' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- EST-ELEC-INSP-MLP-Bbosch-03 · Pruebas de grupos generadores principales y auxiliares Tranque El Mauro - Inspección según Plan Matriz (45 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Pruebas de grupos generadores principales y auxiliares Tranque El Mauro - Inspección según Plan Matriz",
  "meta": {
    "norma": "EST-ELEC-INSP-MLP-Bbosch-03",
    "revision": "Septiembre 2025",
    "titulo": "Inspección Pruebas de grupos generadores principales y auxiliares Tranque El Mauro"
  },
  "nomenclature": "NT: No tiene / BN: Bueno / ML: Malo / NA: No aplica / NR: No realizada (indicar motivos en observaciones). En caso de observaciones críticas, se adjunta registro fotográfico con la referencia.",
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
      "key": "parque",
      "label": "Nombre parque generación",
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
      "id": "mediciones",
      "title": "Mediciones y fugas",
      "items": [
        {
          "id": "item_01",
          "type": "verificacion",
          "label": "Voltaje batería.",
          "unit": "V"
        },
        {
          "id": "item_02",
          "type": "verificacion",
          "label": "Nivel de diesel.",
          "unit": "%"
        },
        {
          "id": "item_03",
          "type": "verificacion",
          "label": "Temperatura de aceite.",
          "unit": "°C"
        },
        {
          "id": "item_04",
          "type": "verificacion",
          "label": "Temperatura de refrigerante.",
          "unit": "°C"
        },
        {
          "id": "item_05",
          "type": "verificacion",
          "label": "Revisar fugas de aceite."
        },
        {
          "id": "item_06",
          "type": "verificacion",
          "label": "Revisar fugas de refrigerante."
        },
        {
          "id": "item_07",
          "type": "verificacion",
          "label": "Revisar fugas de diesel."
        },
        {
          "id": "item_08",
          "type": "verificacion",
          "label": "Voltaje.",
          "unit": "V"
        },
        {
          "id": "item_09",
          "type": "verificacion",
          "label": "Potencia.",
          "unit": ""
        },
        {
          "id": "item_10",
          "type": "verificacion",
          "label": "Horómetro actual.",
          "unit": "h"
        },
        {
          "id": "item_11",
          "type": "verificacion",
          "label": "Horómetro después de la prueba.",
          "unit": "h"
        },
        {
          "id": "item_12",
          "type": "verificacion",
          "label": "Energía actual.",
          "unit": "kWh"
        },
        {
          "id": "item_13",
          "type": "verificacion",
          "label": "Energía después de la prueba.",
          "unit": "kWh"
        },
        {
          "id": "item_14",
          "type": "verificacion",
          "label": "Arranques.",
          "unit": ""
        },
        {
          "id": "item_15",
          "type": "verificacion",
          "label": "Nivel de agua."
        }
      ]
    },
    {
      "id": "sala",
      "title": "Sala y servicios auxiliares",
      "items": [
        {
          "id": "item_16",
          "type": "verificacion",
          "label": "Aseo general."
        },
        {
          "id": "item_17",
          "type": "verificacion",
          "label": "Luces piloto."
        },
        {
          "id": "item_18",
          "type": "verificacion",
          "label": "Puertas de sala."
        },
        {
          "id": "item_19",
          "type": "verificacion",
          "label": "Acceso a equipo."
        },
        {
          "id": "item_20",
          "type": "verificacion",
          "label": "Sistema de iluminación."
        },
        {
          "id": "item_21",
          "type": "verificacion",
          "label": "Iluminación de emergencia."
        },
        {
          "id": "item_22",
          "type": "verificacion",
          "label": "Presencia de tensión de control."
        },
        {
          "id": "item_23",
          "type": "verificacion",
          "label": "Verificar interruptores de calefactores."
        },
        {
          "id": "item_24",
          "type": "verificacion",
          "label": "Tensión de cargador o mantenedor de batería.",
          "unit": "V"
        },
        {
          "id": "item_25",
          "type": "verificacion",
          "label": "Corriente de cargador de batería.",
          "unit": "A"
        },
        {
          "id": "item_26",
          "type": "verificacion",
          "label": "Extintores señalados."
        },
        {
          "id": "item_27",
          "type": "text",
          "label": "Fecha de vencimiento del extintor (dd-mm-aaaa).",
          "required": false,
          "multiline": false
        }
      ]
    },
    {
      "id": "corrientes",
      "title": "Corrientes",
      "items": [
        {
          "id": "item_28",
          "type": "verificacion",
          "label": "Corriente fase A.",
          "unit": "A"
        },
        {
          "id": "item_29",
          "type": "verificacion",
          "label": "Corriente fase B.",
          "unit": "A"
        },
        {
          "id": "item_30",
          "type": "verificacion",
          "label": "Corriente fase C.",
          "unit": "A"
        }
      ]
    },
    {
      "id": "registro_operacional",
      "title": "Registro operacional en terreno (Sí / No)",
      "items": [
        {
          "id": "item_31",
          "type": "verificacion",
          "label": "Se realiza documentación para realizar prueba de generadores."
        },
        {
          "id": "item_32",
          "type": "verificacion",
          "label": "Verificar la presencia de alarmas en equipo antes de prueba."
        },
        {
          "id": "item_33",
          "type": "verificacion",
          "label": "Verificar nivel de estanque de petróleo y filtraciones."
        },
        {
          "id": "item_34",
          "type": "verificacion",
          "label": "Verificar nivel de agua y filtraciones."
        },
        {
          "id": "item_35",
          "type": "verificacion",
          "label": "Toma de datos antes de realizar las pruebas."
        },
        {
          "id": "item_36",
          "type": "verificacion",
          "label": "Dar aviso de inicio de pruebas con sala N°1 (solo en estación drenes y S/E principal)."
        },
        {
          "id": "item_37",
          "type": "verificacion",
          "label": "Verificar inicio de partida de generadores."
        },
        {
          "id": "item_38",
          "type": "verificacion",
          "label": "Tomar datos con generadores en servicio."
        },
        {
          "id": "item_39",
          "type": "verificacion",
          "label": "Finalización de pruebas: tomar datos al finalizar la prueba."
        },
        {
          "id": "item_40",
          "type": "verificacion",
          "label": "Verificar si hay fugas de diesel al término de la prueba."
        },
        {
          "id": "item_41",
          "type": "verificacion",
          "label": "Verificar si hay fugas de aceite al término de la prueba."
        },
        {
          "id": "item_42",
          "type": "verificacion",
          "label": "Verificar si hay fugas de refrigerante al término de la prueba."
        },
        {
          "id": "item_43",
          "type": "verificacion",
          "label": "Verificar en paneles de control si queda alarmas en el equipo."
        },
        {
          "id": "item_44",
          "type": "verificacion",
          "label": "Verificar en sala eléctrica si queda alguna alarma en la TTA."
        },
        {
          "id": "item_45",
          "type": "verificacion",
          "label": "Dar aviso a sala eléctrica N°1 las novedades de las pruebas y el retiro del área."
        }
      ]
    }
  ],
  "note": "Una inspección registra un solo grupo generador (el TAG elegido): para probar otro grupo se envía otra inspección. En el registro operacional en terreno, marque BN para «Sí» y ML para «No» (con la observación)."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'grupo_generador_mauro' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- EST-ELEC-MLP-Bbosch-04 · Limpieza de salas eléctricas STMG 23 kV - Inspección según Plan Matriz (23 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Limpieza de salas eléctricas STMG 23 kV - Inspección según Plan Matriz",
  "meta": {
    "norma": "EST-ELEC-MLP-Bbosch-04",
    "revision": "Abril 2024",
    "titulo": "Inspección Limpieza de salas eléctricas STMG 23 kV"
  },
  "nomenclature": "NT: No tiene / BN: Bueno / ML: Malo / NA: No aplica / NR: No realizada (indicar motivos en observaciones). En caso de observaciones críticas, se adjunta registro fotográfico con la referencia.",
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
      "label": "Ubicación sala eléctrica",
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
      "id": "limpieza",
      "title": "Limpieza e inspección de la sala",
      "items": [
        {
          "id": "item_01",
          "type": "verificacion",
          "label": "Verificar limpieza exterior de cubículo de interruptor."
        },
        {
          "id": "item_02",
          "type": "verificacion",
          "label": "Verificar limpieza exterior de equipos de control y medición."
        },
        {
          "id": "item_03",
          "type": "verificacion",
          "label": "Revisar estado de luces piloto (switchgear, TT/PP)."
        },
        {
          "id": "item_04",
          "type": "verificacion",
          "label": "Verificar limpieza de sala (presencia de polvo, basura, etc.)."
        },
        {
          "id": "item_05",
          "type": "verificacion",
          "label": "Verificar estado de accesos sala eléctrica, puertas, escotillas, portones."
        },
        {
          "id": "item_06",
          "type": "verificacion",
          "label": "Verificar presencia de componentes en desuso o que no correspondan."
        },
        {
          "id": "item_07",
          "type": "verificacion",
          "label": "Verificar estado de aire acondicionado, ¿está operativo?"
        },
        {
          "id": "item_08",
          "type": "verificacion",
          "label": "Verificar estado de chapas de puertas de ingreso y estado de estas (abiertas o cerradas)."
        },
        {
          "id": "item_09",
          "type": "verificacion",
          "label": "Verificar iluminación interior de la sala."
        },
        {
          "id": "item_10",
          "type": "verificacion",
          "label": "Verificar componente de kit de emergencia-rescate."
        },
        {
          "id": "item_11",
          "type": "verificacion",
          "label": "Verificar presencia traje ignífugo para maniobras."
        },
        {
          "id": "item_12",
          "type": "verificacion",
          "label": "Verificar estado de extintores o sistema de amago de incendios."
        },
        {
          "id": "item_13",
          "type": "text",
          "label": "Fecha de caducidad del extintor (dd-mm-aaaa).",
          "required": false,
          "multiline": false
        },
        {
          "id": "item_14",
          "type": "verificacion",
          "label": "Verificar estados de luces de emergencia."
        },
        {
          "id": "item_15",
          "type": "verificacion",
          "label": "Presencia de puesta a tierra."
        },
        {
          "id": "item_16",
          "type": "verificacion",
          "label": "Verificar estado de teléfono fijo, ¿está operativo?"
        },
        {
          "id": "item_17",
          "type": "verificacion",
          "label": "Estado enchufes BT."
        },
        {
          "id": "item_18",
          "type": "verificacion",
          "label": "Estado de dispositivos de bloqueo (candado y tarjetas operacionales vigentes, juego de pinzas)."
        },
        {
          "id": "item_19",
          "type": "verificacion",
          "label": "Verificar entorno de salas y cercos perimetrales, indicar cualquier anormalidad."
        },
        {
          "id": "item_20",
          "type": "verificacion",
          "label": "Se realizó limpieza de sala eléctrica."
        },
        {
          "id": "item_21",
          "type": "verificacion",
          "label": "Verificar funcionamiento y nivel de contaminación de sistema de presurización (solo sala 12)."
        }
      ]
    },
    {
      "id": "gis",
      "title": "Lecturas de SF6 y temperatura (sala GIS)",
      "items": [
        {
          "id": "item_22",
          "type": "nameplate",
          "label": "Toma de nivel SF6",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo"
            },
            {
              "key": "dia_lectura",
              "label": "Día de lectura"
            },
            {
              "key": "valor_psi",
              "label": "Valor",
              "unit": "PSI"
            }
          ]
        },
        {
          "id": "item_23",
          "type": "nameplate",
          "label": "Temperatura de sala GIS",
          "required": false,
          "fields": [
            {
              "key": "toma",
              "label": "Toma de T° y Presión"
            },
            {
              "key": "dia_lectura",
              "label": "Día de lectura"
            },
            {
              "key": "valor",
              "label": "Valor"
            }
          ]
        }
      ]
    }
  ]
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'sala_electrica_stmg' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- EST-ELEC-MLP-Bbosch-05 · Reconectador 23 kV - Inspección según Plan Matriz (22 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Reconectador 23 kV - Inspección según Plan Matriz",
  "meta": {
    "norma": "EST-ELEC-MLP-Bbosch-05",
    "revision": "Abril 2024",
    "titulo": "Inspección Reconectador 23 kV"
  },
  "nomenclature": "NT: No tiene / BN: Bueno / ML: Malo / NA: No aplica / NR: No realizada (indicar motivos en observaciones). En caso de observaciones críticas, se adjunta registro fotográfico con la referencia.",
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
    }
  ],
  "roles": [
    "Encargado de la actividad",
    "Supervisor Bbosch",
    "Planificador Bbosch"
  ],
  "sections": [
    {
      "id": "equipo",
      "title": "Reconectador y estructura",
      "items": [
        {
          "id": "item_01",
          "type": "verificacion",
          "label": "Acceso a reconectador."
        },
        {
          "id": "item_02",
          "type": "verificacion",
          "label": "Presencia de tensión 220 volts."
        },
        {
          "id": "item_03",
          "type": "verificacion",
          "label": "Verificar estado de postes."
        },
        {
          "id": "item_04",
          "type": "verificacion",
          "label": "Verificar estado de pintura de equipo y señales de corrosión."
        },
        {
          "id": "item_05",
          "type": "verificacion",
          "label": "Verificar limpieza en general de equipo."
        },
        {
          "id": "item_06",
          "type": "verificacion",
          "label": "Estado de tablero BT."
        },
        {
          "id": "item_07",
          "type": "verificacion",
          "label": "Estado de aisladores."
        },
        {
          "id": "item_08",
          "type": "verificacion",
          "label": "Estado visual de pararrayos."
        },
        {
          "id": "item_09",
          "type": "verificacion",
          "label": "Estado de desconectadores fusible."
        },
        {
          "id": "item_10",
          "type": "verificacion",
          "label": "Estado visual de las mufas."
        },
        {
          "id": "item_11",
          "type": "verificacion",
          "label": "Estado de crucetas y ferretería."
        },
        {
          "id": "item_12",
          "type": "verificacion",
          "label": "Estado de señalética de S/E y reconectador."
        },
        {
          "id": "item_13",
          "type": "verificacion",
          "label": "Número de operaciones.",
          "unit": ""
        },
        {
          "id": "item_14",
          "type": "verificacion",
          "label": "Estado visual de conductores."
        },
        {
          "id": "item_15",
          "type": "verificacion",
          "label": "Realizar desmalezamiento."
        },
        {
          "id": "item_16",
          "type": "verificacion",
          "label": "Verificar el aterrizado de transformador."
        },
        {
          "id": "item_17",
          "type": "verificacion",
          "label": "Verificar el aterrizado de pararrayos."
        }
      ]
    },
    {
      "id": "tablero",
      "title": "Tablero del reconectador y batería",
      "items": [
        {
          "id": "item_18",
          "type": "verificacion",
          "label": "Tablero de reconectador."
        },
        {
          "id": "item_19",
          "type": "verificacion",
          "label": "Bajar ajustes y eventos."
        },
        {
          "id": "item_20",
          "type": "text",
          "label": "Fecha de instalación de la batería (dd-mm-aaaa).",
          "required": false,
          "multiline": false
        },
        {
          "id": "item_21",
          "type": "verificacion",
          "label": "Tensión batería.",
          "unit": "V"
        },
        {
          "id": "item_22",
          "type": "verificacion",
          "label": "Estado de canalizaciones."
        }
      ]
    }
  ]
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'reconectador' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- EST-ELEC-MLP-Bbosch-06 · S/E móvil - Inspección según Plan Matriz (90 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "S/E móvil - Inspección según Plan Matriz",
  "meta": {
    "norma": "EST-ELEC-MLP-Bbosch-06",
    "revision": "Abril 2024",
    "titulo": "Inspección S/E móvil"
  },
  "nomenclature": "NT: No tiene / BN: Bueno / ML: Malo / NA: No aplica / NR: No realizada (indicar motivos en observaciones). En caso de observaciones críticas, se adjunta registro fotográfico con la referencia.",
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
      "key": "marca",
      "label": "Marca (transformador)",
      "input": "text",
      "required": false
    },
    {
      "key": "serie",
      "label": "Serie",
      "input": "text",
      "required": false
    },
    {
      "key": "aceite_tipo",
      "label": "Aceite",
      "input": "text",
      "required": false
    },
    {
      "key": "aceite_vol",
      "label": "Volumen de aceite (L)",
      "input": "number",
      "required": false
    },
    {
      "key": "v_primario",
      "label": "Voltaje primario",
      "input": "text",
      "required": false
    },
    {
      "key": "v_secundario",
      "label": "Voltaje secundario",
      "input": "text",
      "required": false
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
      "id": "transformador",
      "title": "Transformador 23/6,9 kV",
      "items": [
        {
          "id": "item_01",
          "type": "verificacion",
          "label": "Temperatura actual de enrollado.",
          "unit": "°C"
        },
        {
          "id": "item_02",
          "type": "verificacion",
          "label": "Temperatura máxima de enrollado.",
          "unit": "°C"
        },
        {
          "id": "item_03",
          "type": "verificacion",
          "label": "Reposición aguja arrastre T° enrollado."
        },
        {
          "id": "item_04",
          "type": "verificacion",
          "label": "Temperatura actual de aceite.",
          "unit": "°C"
        },
        {
          "id": "item_05",
          "type": "verificacion",
          "label": "Temperatura máxima de aceite.",
          "unit": "°C"
        },
        {
          "id": "item_06",
          "type": "verificacion",
          "label": "Reposición aguja arrastre T° aceite."
        },
        {
          "id": "item_07",
          "type": "verificacion",
          "label": "Nivel de aceite de conservador."
        },
        {
          "id": "item_08",
          "type": "verificacion",
          "label": "Taps de transformador.",
          "unit": ""
        },
        {
          "id": "item_09",
          "type": "verificacion",
          "label": "Verificar estado de flanges, filtraciones."
        },
        {
          "id": "item_10",
          "type": "verificacion",
          "label": "Verificar estado de uniones estancas y costuras, filtraciones."
        },
        {
          "id": "item_11",
          "type": "verificacion",
          "label": "Verificar apriete de conexión de puesta a tierra."
        },
        {
          "id": "item_12",
          "type": "verificacion",
          "label": "Verificar estado de válvulas."
        },
        {
          "id": "item_13",
          "type": "verificacion",
          "label": "Poner en servicio ventilador y verificar funcionamiento."
        },
        {
          "id": "item_14",
          "type": "verificacion",
          "label": "Verificar estado de pintura de equipo y señales de corrosión."
        },
        {
          "id": "item_15",
          "type": "verificacion",
          "label": "Verificar estado de tablero de control, pintura, cierre."
        },
        {
          "id": "item_16",
          "type": "verificacion",
          "label": "Verificar ventilación de tablero de control."
        },
        {
          "id": "item_17",
          "type": "verificacion",
          "label": "Verificar calefacción de tablero de control."
        },
        {
          "id": "item_18",
          "type": "verificacion",
          "label": "Verificar iluminación de tablero de control."
        },
        {
          "id": "item_19",
          "type": "verificacion",
          "label": "Verificar apriete de conexiones en tablero de control."
        },
        {
          "id": "item_20",
          "type": "verificacion",
          "label": "Verificar funcionamiento de iluminación exterior."
        },
        {
          "id": "item_21",
          "type": "verificacion",
          "label": "Verificar limpieza en general de equipo."
        }
      ]
    },
    {
      "id": "sw_23",
      "title": "Switchgear 23 kV",
      "items": [
        {
          "id": "item_22",
          "type": "verificacion",
          "label": "Nivel de carga de transformador.",
          "unit": "%"
        },
        {
          "id": "item_23",
          "type": "verificacion",
          "label": "Luces pilotos."
        },
        {
          "id": "item_24",
          "type": "verificacion",
          "label": "Registros variables PQM."
        },
        {
          "id": "item_25",
          "type": "verificacion",
          "label": "Selector Local Remoto (Local)."
        },
        {
          "id": "item_26",
          "type": "verificacion",
          "label": "Relé de protección (27 o 59)."
        },
        {
          "id": "item_27",
          "type": "verificacion",
          "label": "Carga de resortes de interruptores (amarillo)."
        },
        {
          "id": "item_28",
          "type": "verificacion",
          "label": "Todos automáticos controles cerrados."
        },
        {
          "id": "item_29",
          "type": "verificacion",
          "label": "Iluminación interior celdas."
        },
        {
          "id": "item_30",
          "type": "verificacion",
          "label": "N° de operaciones Int. 52-0.",
          "unit": ""
        },
        {
          "id": "item_31",
          "type": "verificacion",
          "label": "Limpieza en general equipo."
        },
        {
          "id": "item_32",
          "type": "verificacion",
          "label": "Manivela de extracción de carros."
        },
        {
          "id": "item_33",
          "type": "verificacion",
          "label": "Verificar estado tablero auxiliar."
        },
        {
          "id": "item_34",
          "type": "verificacion",
          "label": "Existencia de planos de equipo en terreno."
        }
      ]
    },
    {
      "id": "sw_69",
      "title": "Switchgear 6,9 kV",
      "items": [
        {
          "id": "item_35",
          "type": "verificacion",
          "label": "Luces pilotos."
        },
        {
          "id": "item_36",
          "type": "verificacion",
          "label": "Medir en block de prueba."
        },
        {
          "id": "item_37",
          "type": "verificacion",
          "label": "Descargar eventos y ajustes de multilins."
        },
        {
          "id": "item_38",
          "type": "verificacion",
          "label": "Selectores Local Remoto (Local)."
        },
        {
          "id": "item_39",
          "type": "verificacion",
          "label": "Carga de resortes de interruptores (amarillo)."
        },
        {
          "id": "item_40",
          "type": "verificacion",
          "label": "Funcionamiento de voltímetros."
        },
        {
          "id": "item_41",
          "type": "verificacion",
          "label": "Funcionamiento de selector de voltímetros."
        },
        {
          "id": "item_42",
          "type": "verificacion",
          "label": "Funcionamiento de amperímetros."
        },
        {
          "id": "item_43",
          "type": "verificacion",
          "label": "Funcionamiento de selector de amperímetros."
        },
        {
          "id": "item_44",
          "type": "verificacion",
          "label": "Interruptores de control cerrados."
        },
        {
          "id": "item_45",
          "type": "verificacion",
          "label": "Panel de alarma, poner en Test y chequear bocina."
        },
        {
          "id": "item_46",
          "type": "verificacion",
          "label": "Calefacción interior celdas."
        },
        {
          "id": "item_47",
          "type": "verificacion",
          "label": "Iluminación interior celdas."
        },
        {
          "id": "item_48",
          "type": "verificacion",
          "label": "Manivela de extracción de carros."
        },
        {
          "id": "item_49",
          "type": "verificacion",
          "label": "Mecanismo para retirar carro."
        },
        {
          "id": "item_50",
          "type": "verificacion",
          "label": "Existencia de planos de equipo en terreno."
        },
        {
          "id": "item_51",
          "type": "verificacion",
          "label": "Limpieza de equipo."
        },
        {
          "id": "item_52",
          "type": "verificacion",
          "label": "N° de operaciones Int. 52-1.",
          "unit": ""
        },
        {
          "id": "item_53",
          "type": "verificacion",
          "label": "N° de operaciones Int. 52-2.",
          "unit": ""
        },
        {
          "id": "item_54",
          "type": "verificacion",
          "label": "N° de operaciones Int. 52-3.",
          "unit": ""
        },
        {
          "id": "item_55",
          "type": "verificacion",
          "label": "N° de operaciones Int. 52-4.",
          "unit": ""
        },
        {
          "id": "item_56",
          "type": "verificacion",
          "label": "N° de operaciones Int. 52-5.",
          "unit": ""
        }
      ]
    },
    {
      "id": "contenedor",
      "title": "Contenedor S/E móvil",
      "items": [
        {
          "id": "item_57",
          "type": "verificacion",
          "label": "Balizas operativas."
        },
        {
          "id": "item_58",
          "type": "verificacion",
          "label": "Identificación de balizas."
        },
        {
          "id": "item_59",
          "type": "verificacion",
          "label": "Conexión a tierra de estructura."
        },
        {
          "id": "item_60",
          "type": "verificacion",
          "label": "Enchufes de 6,9 kV a consumos (4)."
        },
        {
          "id": "item_61",
          "type": "verificacion",
          "label": "Instalación de tapas superiores enchufes."
        },
        {
          "id": "item_62",
          "type": "verificacion",
          "label": "Estado de ruedas."
        },
        {
          "id": "item_63",
          "type": "verificacion",
          "label": "Existen ruedas de repuesto."
        },
        {
          "id": "item_64",
          "type": "verificacion",
          "label": "Gatas independientes de apoyo en buen estado."
        },
        {
          "id": "item_65",
          "type": "verificacion",
          "label": "Fuga de aceite hidráulico en las gatas."
        },
        {
          "id": "item_66",
          "type": "verificacion",
          "label": "Estado de lanzas de tránsito o arrastre."
        },
        {
          "id": "item_67",
          "type": "verificacion",
          "label": "Estado de la pintura."
        },
        {
          "id": "item_68",
          "type": "verificacion",
          "label": "Escala de acceso en buenas condiciones."
        },
        {
          "id": "item_69",
          "type": "verificacion",
          "label": "Pasarelas y barandas en buen estado."
        },
        {
          "id": "item_70",
          "type": "verificacion",
          "label": "Estado de los focos de iluminación exterior."
        },
        {
          "id": "item_71",
          "type": "verificacion",
          "label": "Lámparas de emergencia operativas."
        },
        {
          "id": "item_72",
          "type": "verificacion",
          "label": "Iluminación interior operativa."
        },
        {
          "id": "item_73",
          "type": "verificacion",
          "label": "Existe sistema detección de incendio."
        },
        {
          "id": "item_74",
          "type": "verificacion",
          "label": "¿Existen extintores con inspección y mantención al día?"
        },
        {
          "id": "item_75",
          "type": "text",
          "label": "Indicar últimas fechas de inspección y mantención de extintores.",
          "required": false,
          "multiline": false
        },
        {
          "id": "item_76",
          "type": "verificacion",
          "label": "Limpieza general, ordenar y limpiar en lo posible."
        },
        {
          "id": "item_77",
          "type": "verificacion",
          "label": "Existe mesa, indicar estado."
        },
        {
          "id": "item_78",
          "type": "verificacion",
          "label": "Existe silla, indicar estado."
        },
        {
          "id": "item_79",
          "type": "verificacion",
          "label": "Existe caja para bloqueos."
        },
        {
          "id": "item_80",
          "type": "verificacion",
          "label": "Están enchufes 220 V operativos."
        },
        {
          "id": "item_81",
          "type": "verificacion",
          "label": "Funcionan los mecanismos de cierre de las puertas."
        },
        {
          "id": "item_82",
          "type": "verificacion",
          "label": "Estado traje ignífugo."
        },
        {
          "id": "item_83",
          "type": "verificacion",
          "label": "¿Existe radio base?"
        },
        {
          "id": "item_84",
          "type": "verificacion",
          "label": "¿Cuenta con carteles de identificación móvil?"
        },
        {
          "id": "item_85",
          "type": "verificacion",
          "label": "¿Los carteles se encuentran en buen estado?"
        },
        {
          "id": "item_86",
          "type": "verificacion",
          "label": "¿Posee sus 4 cuñas de seguridad?"
        }
      ]
    },
    {
      "id": "estructura_se",
      "title": "Estructura de S/E",
      "items": [
        {
          "id": "item_87",
          "type": "verificacion",
          "label": "Barandas en buen estado y fijas."
        },
        {
          "id": "item_88",
          "type": "verificacion",
          "label": "Plataforma cuenta con rodapiés."
        },
        {
          "id": "item_89",
          "type": "verificacion",
          "label": "Escalera de acceso en buen estado."
        },
        {
          "id": "item_90",
          "type": "verificacion",
          "label": "Grating y estructura del suelo en buen estado."
        }
      ]
    }
  ]
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'subestacion_movil' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- EST-ELEC-MLP-Bbosch-07 · Transformador aéreo - Inspección según Plan Matriz (18 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Transformador aéreo - Inspección según Plan Matriz",
  "meta": {
    "norma": "EST-ELEC-MLP-Bbosch-07",
    "revision": "Abril 2024",
    "titulo": "Inspección Transformador aéreo"
  },
  "nomenclature": "NT: No tiene / BN: Bueno / ML: Malo / NA: No aplica / NR: No realizada (indicar motivos en observaciones). En caso de observaciones críticas, se adjunta registro fotográfico con la referencia.",
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
      "label": "Ubicación SE",
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
      "label": "Tensión AT y BT",
      "input": "text",
      "required": false
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
      "id": "transformador",
      "title": "Transformador y tablero",
      "items": [
        {
          "id": "item_01",
          "type": "verificacion",
          "label": "Temperatura actual de aceite.",
          "unit": "°C"
        },
        {
          "id": "item_02",
          "type": "verificacion",
          "label": "Temperatura máxima de aceite.",
          "unit": "°C"
        },
        {
          "id": "item_03",
          "type": "verificacion",
          "label": "Verificar visualmente fugas de aceite."
        },
        {
          "id": "item_04",
          "type": "verificacion",
          "label": "Verificar estado de pintura de equipo y señales de corrosión."
        },
        {
          "id": "item_05",
          "type": "verificacion",
          "label": "Verificar limpieza en general de equipo."
        },
        {
          "id": "item_06",
          "type": "verificacion",
          "label": "Estado de tablero distribución BT."
        }
      ]
    },
    {
      "id": "estructura",
      "title": "Estructura y protecciones",
      "items": [
        {
          "id": "item_07",
          "type": "verificacion",
          "label": "Estado de poste(s)."
        },
        {
          "id": "item_08",
          "type": "verificacion",
          "label": "Estado visual de pararrayos."
        },
        {
          "id": "item_09",
          "type": "verificacion",
          "label": "Estado de desconectadores fusible."
        },
        {
          "id": "item_10",
          "type": "verificacion",
          "label": "Realizar termografía a los puntos de conexión 23 kV (resultados termográficos se anexan junto a este estándar)."
        },
        {
          "id": "item_11",
          "type": "verificacion",
          "label": "Estado de crucetas y ferretería."
        },
        {
          "id": "item_12",
          "type": "verificacion",
          "label": "Estado de señalética de S/E."
        },
        {
          "id": "item_13",
          "type": "verificacion",
          "label": "Registrar capacidad de Int. General de BT.",
          "unit": "A"
        }
      ]
    },
    {
      "id": "entorno",
      "title": "Cerco, puesta a tierra y aisladores",
      "items": [
        {
          "id": "item_14",
          "type": "verificacion",
          "label": "Estado cerco perimetral."
        },
        {
          "id": "item_15",
          "type": "verificacion",
          "label": "Realizar desmalezado interior cerco perimetral o entorno."
        },
        {
          "id": "item_16",
          "type": "verificacion",
          "label": "Verificar el aterrizado de transformador."
        },
        {
          "id": "item_17",
          "type": "verificacion",
          "label": "Verificar el aterrizado de pararrayos."
        },
        {
          "id": "item_18",
          "type": "verificacion",
          "label": "Verificar estado de aisladores."
        }
      ]
    }
  ],
  "note": "Alcances: en caso de observaciones críticas, adjuntar registro fotográfico con la referencia. En estructuras como desconectadores, seccionadores y S/E aéreas se debe considerar el desmalezado de un radio de 2 m. El nivel de criticidad y el motivo de cada ítem se registran al marcarlo en Malo (severidad y observación)."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'transformador_aereo' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- EST-ELEC-MLP-Bbosch-08 · Switchgear 23 kV sala 12 - Inspección según Plan Matriz (28 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Switchgear 23 kV sala 12 - Inspección según Plan Matriz",
  "meta": {
    "norma": "EST-ELEC-MLP-Bbosch-08",
    "revision": "Abril 2024",
    "titulo": "Inspección Switchgear 23 kV sala 12"
  },
  "nomenclature": "NT: No tiene / BN: Bueno / ML: Malo / NA: No aplica / NR: No realizada (indicar motivos en observaciones). En caso de observaciones críticas, se adjunta registro fotográfico con la referencia.",
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
      "id": "celdas",
      "title": "Celdas y equipos de control",
      "items": [
        {
          "id": "item_01",
          "type": "verificacion",
          "label": "Luces pilotos encendidas."
        },
        {
          "id": "item_02",
          "type": "verificacion",
          "label": "Amperímetros análogos funcionando."
        },
        {
          "id": "item_03",
          "type": "verificacion",
          "label": "Funcionamiento de selector de amperímetros."
        },
        {
          "id": "item_04",
          "type": "verificacion",
          "label": "Funcionamiento de voltímetros."
        },
        {
          "id": "item_05",
          "type": "verificacion",
          "label": "Funcionamiento de selector de voltímetros."
        },
        {
          "id": "item_06",
          "type": "verificacion",
          "label": "Relé de bloqueo 86 (bandera negra)."
        },
        {
          "id": "item_07",
          "type": "verificacion",
          "label": "Selector Local Remoto (Local)."
        },
        {
          "id": "item_08",
          "type": "verificacion",
          "label": "Carga de resortes (amarillo)."
        },
        {
          "id": "item_09",
          "type": "verificacion",
          "label": "Descargar ajustes y eventos de Multilins."
        },
        {
          "id": "item_10",
          "type": "verificacion",
          "label": "Panel de alarmas funcionando, poner en Test."
        },
        {
          "id": "item_11",
          "type": "verificacion",
          "label": "Interruptores de control (cerrados)."
        },
        {
          "id": "item_12",
          "type": "verificacion",
          "label": "Limpieza de los equipos."
        },
        {
          "id": "item_13",
          "type": "verificacion",
          "label": "Estado de los conductores de control."
        },
        {
          "id": "item_14",
          "type": "verificacion",
          "label": "Está operativa manivela extracción de carros."
        },
        {
          "id": "item_15",
          "type": "verificacion",
          "label": "Barra para cierre manual carros."
        },
        {
          "id": "item_16",
          "type": "verificacion",
          "label": "Existencia de planos de cubículos."
        }
      ]
    },
    {
      "id": "carros",
      "title": "Horómetro y operaciones por carro",
      "items": [
        {
          "id": "item_17",
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
          "id": "item_18",
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
          "id": "item_19",
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
          "id": "item_20",
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
          "id": "item_21",
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
        },
        {
          "id": "item_22",
          "type": "nameplate",
          "label": "Horómetro y operaciones carro 52 / 06",
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
          "id": "item_23",
          "type": "nameplate",
          "label": "Horómetro y operaciones carro 52 / 07",
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
          "id": "item_24",
          "type": "nameplate",
          "label": "Horómetro y operaciones carro 52 / 08",
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
          "id": "item_25",
          "type": "nameplate",
          "label": "Horómetro y operaciones carro 52 / 09",
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
          "id": "item_26",
          "type": "nameplate",
          "label": "Horómetro y operaciones carro 52 / 10",
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
          "id": "item_27",
          "type": "nameplate",
          "label": "Horómetro y operaciones carro 52 / 11",
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
          "id": "item_28",
          "type": "nameplate",
          "label": "Horómetro y operaciones carro 52 / 12",
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
    }
  ]
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'switchgear_sala_12' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- EST-ELEC-MLP-Bbosch-09 · Parrón de maniobra 23 kV - Inspección según Plan Matriz (39 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Parrón de maniobra 23 kV - Inspección según Plan Matriz",
  "meta": {
    "norma": "EST-ELEC-MLP-Bbosch-09",
    "revision": "Abril 2024",
    "titulo": "Inspección Parrón de maniobra 23 kV"
  },
  "nomenclature": "NT: No tiene / BN: Bueno / ML: Malo / NA: No aplica / NR: No realizada (indicar motivos en observaciones). En caso de observaciones críticas, se adjunta registro fotográfico con la referencia.",
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
      "id": "estructura",
      "title": "Estructura y aislación",
      "items": [
        {
          "id": "item_01",
          "type": "verificacion",
          "label": "El acceso al parrón es el adecuado."
        },
        {
          "id": "item_02",
          "type": "verificacion",
          "label": "Vigas y crucetas se aprecian normal."
        },
        {
          "id": "item_03",
          "type": "verificacion",
          "label": "Verificar estado de los postes."
        },
        {
          "id": "item_04",
          "type": "verificacion",
          "label": "Verificar estado aisladores disco."
        },
        {
          "id": "item_05",
          "type": "verificacion",
          "label": "Verificar estado aisladores pedestal o espiga."
        },
        {
          "id": "item_06",
          "type": "verificacion",
          "label": "Verificar estado enmalle."
        },
        {
          "id": "item_07",
          "type": "verificacion",
          "label": "Presencia de tensión."
        },
        {
          "id": "item_08",
          "type": "verificacion",
          "label": "Verificar cable de guarda."
        },
        {
          "id": "item_09",
          "type": "verificacion",
          "label": "Estado visual pararrayos."
        },
        {
          "id": "item_10",
          "type": "verificacion",
          "label": "Estado visual de las mufas."
        },
        {
          "id": "item_11",
          "type": "verificacion",
          "label": "Estado visual conductores."
        },
        {
          "id": "item_12",
          "type": "verificacion",
          "label": "Iluminación parrón."
        },
        {
          "id": "item_13",
          "type": "verificacion",
          "label": "Conexión a tierra de la estructura y equipos."
        }
      ]
    },
    {
      "id": "maniobra",
      "title": "Equipos de maniobra y reconectador",
      "items": [
        {
          "id": "item_14",
          "type": "verificacion",
          "label": "Desconectadores fusibles se aprecian normal."
        },
        {
          "id": "item_15",
          "type": "verificacion",
          "label": "Desconectador cuchilla se aprecian normal."
        },
        {
          "id": "item_16",
          "type": "verificacion",
          "label": "Seccionador cuchilla se aprecian normal."
        },
        {
          "id": "item_17",
          "type": "verificacion",
          "label": "Reconectador GVR se aprecia normal."
        },
        {
          "id": "item_18",
          "type": "verificacion",
          "label": "Número de operaciones de GVR 1.",
          "unit": ""
        },
        {
          "id": "item_19",
          "type": "verificacion",
          "label": "Número de operaciones de GVR 2.",
          "unit": ""
        },
        {
          "id": "item_20",
          "type": "verificacion",
          "label": "Número de operaciones de GVR 3.",
          "unit": ""
        },
        {
          "id": "item_21",
          "type": "verificacion",
          "label": "Tablero reconectador."
        },
        {
          "id": "item_22",
          "type": "verificacion",
          "label": "Verificar funcionamiento de relé panacea."
        },
        {
          "id": "item_23",
          "type": "verificacion",
          "label": "Bajar ajuste y eventos de panacea."
        }
      ]
    },
    {
      "id": "transformadores",
      "title": "Transformadores de potencial y de control",
      "items": [
        {
          "id": "item_24",
          "type": "verificacion",
          "label": "Transformador potencial."
        },
        {
          "id": "item_25",
          "type": "verificacion",
          "label": "Tensión línea neutro de TP.",
          "unit": "V"
        },
        {
          "id": "item_26",
          "type": "verificacion",
          "label": "Tensión línea tierra de TP.",
          "unit": "V"
        },
        {
          "id": "item_27",
          "type": "verificacion",
          "label": "Tensión neutro tierra de TP.",
          "unit": "V"
        },
        {
          "id": "item_28",
          "type": "verificacion",
          "label": "Medir secuencia de fases de TP."
        },
        {
          "id": "item_29",
          "type": "verificacion",
          "label": "Transformador de control."
        },
        {
          "id": "item_30",
          "type": "verificacion",
          "label": "Tensión línea neutro de trafo control.",
          "unit": "V"
        },
        {
          "id": "item_31",
          "type": "verificacion",
          "label": "Tensión línea tierra de trafo control.",
          "unit": "V"
        },
        {
          "id": "item_32",
          "type": "verificacion",
          "label": "Tensión neutro tierra de trafo control.",
          "unit": "V"
        },
        {
          "id": "item_33",
          "type": "verificacion",
          "label": "Medir secuencia de fases de trafo control."
        }
      ]
    },
    {
      "id": "entorno",
      "title": "Balizas, canalizaciones y plataforma",
      "items": [
        {
          "id": "item_34",
          "type": "verificacion",
          "label": "Verificar estado de las balizas (energizado / operando)."
        },
        {
          "id": "item_35",
          "type": "verificacion",
          "label": "Estado de las canalizaciones."
        },
        {
          "id": "item_36",
          "type": "verificacion",
          "label": "Identificación de parrón."
        },
        {
          "id": "item_37",
          "type": "verificacion",
          "label": "Realizar termografías puntos de conexión y techo."
        },
        {
          "id": "item_38",
          "type": "verificacion",
          "label": "Estado estructural de plataforma de operación."
        },
        {
          "id": "item_39",
          "type": "verificacion",
          "label": "Plataforma de operación se encuentra fija y afianzada."
        }
      ]
    }
  ]
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'parron_maniobra' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- EST-ELEC-MLP-Bbosch-10 · Sistema presurizado sala 12 - Inspección según Plan Matriz (6 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Sistema presurizado sala 12 - Inspección según Plan Matriz",
  "meta": {
    "norma": "EST-ELEC-MLP-Bbosch-10",
    "revision": "06 de diciembre de 2024",
    "titulo": "Inspección Sistema presurizado sala 12"
  },
  "nomenclature": "NT: No tiene / BN: Bueno / ML: Malo / NA: No aplica / NR: No realizada (indicar motivos en observaciones). En caso de observaciones críticas, se adjunta registro fotográfico con la referencia.",
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
      "id": "sistema",
      "title": "Sistema presurizado",
      "items": [
        {
          "id": "item_01",
          "type": "verificacion",
          "label": "Estado presurizador."
        },
        {
          "id": "item_02",
          "type": "verificacion",
          "label": "¿Presurizador se encuentra operativo?"
        },
        {
          "id": "item_03",
          "type": "verificacion",
          "label": "¿Es adecuado el ingreso a sala?"
        },
        {
          "id": "item_04",
          "type": "verificacion",
          "label": "Estado de señalética de identificación."
        },
        {
          "id": "item_05",
          "type": "verificacion",
          "label": "Estado del tablero."
        },
        {
          "id": "item_06",
          "type": "verificacion",
          "label": "Estado señalético de tablero."
        }
      ]
    }
  ],
  "note": "En las preguntas con signos de interrogación marque BN para «Sí» y ML para «No» (con la observación). En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'sistema_presurizado_sala_12' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- EST-ELEC-INSP-MLP-Bbosch-11 · Línea aérea 23 kV - Inspección según Plan Matriz (15 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Línea aérea 23 kV - Inspección según Plan Matriz",
  "meta": {
    "norma": "EST-ELEC-INSP-MLP-Bbosch-11",
    "revision": "Agosto 2024",
    "titulo": "Inspección Línea aérea 23 kV"
  },
  "nomenclature": "NT: No tiene / BN: Bueno / ML: Malo / NA: No aplica / NR: No realizada (indicar motivos en observaciones). En caso de observaciones críticas, se adjunta registro fotográfico con la referencia.",
  "header": [
    {
      "key": "tag",
      "label": "Circuito",
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
      "key": "tramo_desde",
      "label": "Tramo desde",
      "input": "text",
      "required": false
    },
    {
      "key": "tramo_hasta",
      "label": "Hasta",
      "input": "text",
      "required": false
    },
    {
      "key": "ubicacion",
      "label": "Ubicación / Sector",
      "input": "text",
      "required": false
    },
    {
      "key": "estructura",
      "label": "Estructura N°",
      "input": "text"
    }
  ],
  "roles": [
    "Encargado de la actividad",
    "Supervisor Bbosch",
    "Planificador Bbosch"
  ],
  "sections": [
    {
      "id": "estructura",
      "title": "Estructura",
      "items": [
        {
          "id": "item_01",
          "type": "verificacion",
          "label": "Identificación."
        },
        {
          "id": "item_02",
          "type": "verificacion",
          "label": "Equipo de maniobra (GVR/NOVA)."
        },
        {
          "id": "item_03",
          "type": "verificacion",
          "label": "Desconectador (cuchillo/fusible)."
        },
        {
          "id": "item_04",
          "type": "verificacion",
          "label": "Cable guardia."
        },
        {
          "id": "item_05",
          "type": "verificacion",
          "label": "Poste."
        },
        {
          "id": "item_06",
          "type": "verificacion",
          "label": "Tirantes."
        },
        {
          "id": "item_07",
          "type": "verificacion",
          "label": "Puentes."
        },
        {
          "id": "item_08",
          "type": "verificacion",
          "label": "Puesta a tierra."
        },
        {
          "id": "item_09",
          "type": "verificacion",
          "label": "Acceso."
        },
        {
          "id": "item_10",
          "type": "verificacion",
          "label": "Aisladores."
        },
        {
          "id": "item_11",
          "type": "verificacion",
          "label": "Crucetas."
        },
        {
          "id": "item_12",
          "type": "verificacion",
          "label": "Templado."
        },
        {
          "id": "item_13",
          "type": "verificacion",
          "label": "Contaminación."
        },
        {
          "id": "item_14",
          "type": "verificacion",
          "label": "Necesita desmalezado cercano a equipo de maniobra."
        },
        {
          "id": "item_15",
          "type": "verificacion",
          "label": "Necesita poda o roce de árbol cercano a la línea."
        }
      ]
    }
  ],
  "note": "Una inspección registra una estructura (su número va en «Estructura N°»): para revisar otra se envía otra inspección. Completar con valor, N° o sigla según corresponda. En caso de observaciones críticas, adjuntar registro fotográfico con la referencia. En estructuras como desconectadores, seccionadores y S/E aéreas se debe realizar el desmalezado de un radio de 2 m."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'inspeccion_lineas' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- EST-ELEC-MLP-Bbosch-13 · Switchgear 23 kV - Inspección según Plan Matriz (17 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Switchgear 23 kV - Inspección según Plan Matriz",
  "meta": {
    "norma": "EST-ELEC-MLP-Bbosch-13",
    "revision": "Abril 2024",
    "titulo": "Inspección Switchgear 23 kV"
  },
  "nomenclature": "NT: No tiene / BN: Bueno / ML: Malo / NA: No aplica / NR: No realizada (indicar motivos en observaciones). En caso de observaciones críticas, se adjunta registro fotográfico con la referencia.",
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
      "id": "switchgear",
      "title": "Switchgear 23 kV",
      "items": [
        {
          "id": "item_01",
          "type": "verificacion",
          "label": "Luces pilotos encendidas."
        },
        {
          "id": "item_02",
          "type": "verificacion",
          "label": "Amperímetros análogos funcionando."
        },
        {
          "id": "item_03",
          "type": "verificacion",
          "label": "Verificar funcionamiento de selector de amperímetros."
        },
        {
          "id": "item_04",
          "type": "verificacion",
          "label": "Verificar funcionamiento de voltímetros."
        },
        {
          "id": "item_05",
          "type": "verificacion",
          "label": "Verificar funcionamiento de selector de voltímetros."
        },
        {
          "id": "item_06",
          "type": "verificacion",
          "label": "Relé de bloqueo 86 (bandera negra)."
        },
        {
          "id": "item_07",
          "type": "verificacion",
          "label": "Selector Local Remoto (Local)."
        },
        {
          "id": "item_08",
          "type": "verificacion",
          "label": "Carga de resortes (amarillo)."
        },
        {
          "id": "item_09",
          "type": "verificacion",
          "label": "Realizar descarga de ajustes y eventos de Multilin."
        },
        {
          "id": "item_10",
          "type": "verificacion",
          "label": "Panel de alarmas funcionando, poner en Test."
        },
        {
          "id": "item_11",
          "type": "verificacion",
          "label": "Interruptores de control (cerrados)."
        },
        {
          "id": "item_12",
          "type": "verificacion",
          "label": "Verificar limpieza de los equipos."
        },
        {
          "id": "item_13",
          "type": "verificacion",
          "label": "Estado de los conductores de control."
        },
        {
          "id": "item_14",
          "type": "verificacion",
          "label": "Está operativa manivela extracción de carros."
        },
        {
          "id": "item_15",
          "type": "verificacion",
          "label": "Revisar barra para cierre manual carros."
        },
        {
          "id": "item_16",
          "type": "verificacion",
          "label": "Existencia de planos de cubículo."
        },
        {
          "id": "item_17",
          "type": "nameplate",
          "label": "Horómetro y operaciones carro interruptor",
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
    }
  ]
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'switchgear_23kv' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- EST-ELEC-MLP-Bbosch-14 · Switchgear principal Tranque Mauro 23 kV - Inspección según Plan Matriz (18 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Switchgear principal Tranque Mauro 23 kV - Inspección según Plan Matriz",
  "meta": {
    "norma": "EST-ELEC-MLP-Bbosch-14",
    "revision": "Abril 2024",
    "titulo": "Inspección Switchgear principal Tranque Mauro 23 kV"
  },
  "nomenclature": "NT: No tiene / BN: Bueno / ML: Malo / NA: No aplica / NR: No realizada (indicar motivos en observaciones). En caso de observaciones críticas, se adjunta registro fotográfico con la referencia.",
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
    },
    {
      "key": "cubiculo",
      "label": "Cubículo",
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
      "id": "cubiculo",
      "title": "Cubículo",
      "items": [
        {
          "id": "item_01",
          "type": "verificacion",
          "label": "Luces pilotos encendidas."
        },
        {
          "id": "item_02",
          "type": "verificacion",
          "label": "Amperímetros análogos funcionando."
        },
        {
          "id": "item_03",
          "type": "verificacion",
          "label": "Funcionamiento de selector de amperímetros."
        },
        {
          "id": "item_04",
          "type": "verificacion",
          "label": "Funcionamiento de voltímetros."
        },
        {
          "id": "item_05",
          "type": "verificacion",
          "label": "Funcionamiento de selector de voltímetros."
        },
        {
          "id": "item_06",
          "type": "verificacion",
          "label": "Relé de bloqueo 86 (bandera negra)."
        },
        {
          "id": "item_07",
          "type": "verificacion",
          "label": "Selector Local Remoto (Local)."
        },
        {
          "id": "item_08",
          "type": "verificacion",
          "label": "Carga de resortes (amarillo)."
        },
        {
          "id": "item_09",
          "type": "verificacion",
          "label": "Descargar ajustes y eventos de Multilins."
        },
        {
          "id": "item_10",
          "type": "verificacion",
          "label": "Panel de alarmas funcionando, poner en Test."
        },
        {
          "id": "item_11",
          "type": "verificacion",
          "label": "Interruptores de control (cerrados)."
        },
        {
          "id": "item_12",
          "type": "verificacion",
          "label": "Verificar limpieza de los equipos."
        },
        {
          "id": "item_13",
          "type": "verificacion",
          "label": "Estado de los conductores de control."
        },
        {
          "id": "item_14",
          "type": "verificacion",
          "label": "Está operativa manivela extracción de carros."
        },
        {
          "id": "item_15",
          "type": "verificacion",
          "label": "Barra para cierre manual carros."
        },
        {
          "id": "item_16",
          "type": "verificacion",
          "label": "Existencia de planos de cubículo."
        },
        {
          "id": "item_17",
          "type": "nameplate",
          "label": "Horómetro y operaciones carro interruptor",
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
      "id": "fotos",
      "title": "Galería fotográfica",
      "items": [
        {
          "id": "item_18",
          "type": "photo",
          "label": "Galería fotográfica",
          "required": false,
          "maxPhotos": 6
        }
      ]
    }
  ]
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'switchgear_tranque_mauro' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- EST-ELEC-INSP-MLP-Bbosch-15 · Túnel de cables STMG - Inspección según Plan Matriz (13 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Túnel de cables STMG - Inspección según Plan Matriz",
  "meta": {
    "norma": "EST-ELEC-INSP-MLP-Bbosch-15",
    "revision": "Abril 2024",
    "titulo": "Inspección Túnel de cables STMG"
  },
  "nomenclature": "NT: No tiene / BN: Bueno / ML: Malo / NA: No aplica / NR: No realizada (indicar motivos en observaciones). En caso de observaciones críticas, se adjunta registro fotográfico con la referencia.",
  "header": [
    {
      "key": "tag",
      "label": "Tramo",
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
    }
  ],
  "roles": [
    "Encargado de la actividad",
    "Supervisor Bbosch",
    "Planificador Bbosch"
  ],
  "sections": [
    {
      "id": "recorrido",
      "title": "Recorrido del túnel",
      "items": [
        {
          "id": "item_01",
          "type": "verificacion",
          "label": "Verificar los accesos al túnel."
        },
        {
          "id": "item_02",
          "type": "verificacion",
          "label": "Verificar el estado de los conductores."
        },
        {
          "id": "item_03",
          "type": "verificacion",
          "label": "Verificar las amarras de los conductores."
        },
        {
          "id": "item_04",
          "type": "verificacion",
          "label": "Verificar cable guía porta conductor."
        },
        {
          "id": "item_05",
          "type": "verificacion",
          "label": "Verificar el revestimiento contra llama si aplica."
        },
        {
          "id": "item_06",
          "type": "verificacion",
          "label": "Verificar estado de las escalerillas o ganchos."
        },
        {
          "id": "item_07",
          "type": "verificacion",
          "label": "Verificar conexión de escalerillas a tierra."
        },
        {
          "id": "item_08",
          "type": "verificacion",
          "label": "Verificar iluminación."
        },
        {
          "id": "item_09",
          "type": "verificacion",
          "label": "Existen equipos para amago de incendio."
        },
        {
          "id": "item_10",
          "type": "verificacion",
          "label": "Verificar si existen filtraciones de agua."
        },
        {
          "id": "item_11",
          "type": "verificacion",
          "label": "Vías de escape señalizadas."
        },
        {
          "id": "item_12",
          "type": "verificacion",
          "label": "¿Existe roce con escalerillas de estaciones pull cord u otro elemento?"
        },
        {
          "id": "item_13",
          "type": "text",
          "label": "Observaciones con referencia: ítem, pata o distancia de referencia y observación.",
          "required": false,
          "multiline": true
        }
      ]
    }
  ],
  "note": "Durante el recorrido, si se encuentra alguna observación, indicarla en el último punto con el ítem y la pata o distancia de referencia. En caso de observaciones críticas, adjuntar registro fotográfico con la referencia."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'tunel_cables_stmg' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

