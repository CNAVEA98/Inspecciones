-- Plantillas INSP-01 a INSP-05 × Plan Matriz (Word de «Bases de datos generales/Inspeciones»).
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

-- EST-ELEC-MLP-BBOSCH-01 · Desconectador/seccionador de maniobra 23 kV - Inspección según Plan Matriz (24 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Desconectador/seccionador de maniobra 23 kV - Inspección según Plan Matriz",
  "meta": {
    "norma": "EST-ELEC-MLP-BBOSCH-01",
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

-- EST-ELEC-MLP-BBOSCH-02 · Banco de condensadores Mauro - Inspección según Plan Matriz (56 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Banco de condensadores Mauro - Inspección según Plan Matriz",
  "meta": {
    "norma": "EST-ELEC-MLP-BBOSCH-02",
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
          "id": "item_22",
          "type": "verificacion",
          "label": "El cerco perimetral cuenta con extintor."
        },
        {
          "id": "item_23",
          "type": "verificacion",
          "label": "Estatus de limpieza al interior del cerco perimetral."
        },
        {
          "id": "item_24",
          "type": "verificacion",
          "label": "Estatus de limpieza de aisladores y componentes."
        },
        {
          "id": "item_25",
          "type": "verificacion",
          "label": "Estatus de condensadores banco etapa 1."
        },
        {
          "id": "item_26",
          "type": "verificacion",
          "label": "Estatus de condensadores banco etapa 2."
        },
        {
          "id": "item_27",
          "type": "verificacion",
          "label": "Estatus de condensadores banco etapa 3."
        },
        {
          "id": "item_28",
          "type": "verificacion",
          "label": "Estatus de condensadores banco etapa 4."
        },
        {
          "id": "item_29",
          "type": "verificacion",
          "label": "Estatus de condensadores banco etapa 5."
        },
        {
          "id": "item_30",
          "type": "verificacion",
          "label": "Estatus de transformadores de corriente banco etapa 1."
        },
        {
          "id": "item_31",
          "type": "verificacion",
          "label": "Estatus de transformadores de corriente banco etapa 2."
        },
        {
          "id": "item_32",
          "type": "verificacion",
          "label": "Estatus de transformadores de corriente banco etapa 3."
        },
        {
          "id": "item_33",
          "type": "verificacion",
          "label": "Estatus de transformadores de corriente banco etapa 4."
        },
        {
          "id": "item_34",
          "type": "verificacion",
          "label": "Estatus de transformadores de corriente banco etapa 5."
        },
        {
          "id": "item_35",
          "type": "verificacion",
          "label": "Estatus de transformadores de potencial banco etapa 1."
        },
        {
          "id": "item_36",
          "type": "verificacion",
          "label": "Estatus de transformadores de potencial banco etapa 2."
        },
        {
          "id": "item_37",
          "type": "verificacion",
          "label": "Estatus de transformadores de potencial banco etapa 3."
        },
        {
          "id": "item_38",
          "type": "verificacion",
          "label": "Estatus de transformadores de potencial banco etapa 4."
        },
        {
          "id": "item_39",
          "type": "verificacion",
          "label": "Estatus de transformadores de potencial banco etapa 5."
        },
        {
          "id": "item_40",
          "type": "verificacion",
          "label": "Estado de los interruptores Power-Cooper etapa 1."
        },
        {
          "id": "item_41",
          "type": "verificacion",
          "label": "Estado de los interruptores Power-Cooper etapa 2."
        },
        {
          "id": "item_42",
          "type": "verificacion",
          "label": "Estado de los interruptores Power-Cooper etapa 3."
        },
        {
          "id": "item_43",
          "type": "verificacion",
          "label": "Estado de los interruptores Power-Cooper etapa 4."
        },
        {
          "id": "item_44",
          "type": "verificacion",
          "label": "Estado de los interruptores Power-Cooper etapa 5."
        },
        {
          "id": "item_45",
          "type": "verificacion",
          "label": "Estado visual de los capacitores."
        },
        {
          "id": "item_46",
          "type": "verificacion",
          "label": "Signos de hinchazón o deformación de los capacitores."
        },
        {
          "id": "item_47",
          "type": "verificacion",
          "label": "Signos de filtración de aceite de los capacitores."
        },
        {
          "id": "item_48",
          "type": "verificacion",
          "label": "Estado de aisladores."
        },
        {
          "id": "item_49",
          "type": "verificacion",
          "label": "Estado de los inductores."
        },
        {
          "id": "item_50",
          "type": "verificacion",
          "label": "Estado de la puesta a tierra."
        },
        {
          "id": "item_51",
          "type": "verificacion",
          "label": "Estado de los conductores."
        },
        {
          "id": "item_52",
          "type": "verificacion",
          "label": "Signos de oxidación en la estructura."
        },
        {
          "id": "item_53",
          "type": "verificacion",
          "label": "Estado de seccionadora palanca 23 kV."
        },
        {
          "id": "item_54",
          "type": "verificacion",
          "label": "Estado de cerco perimetral."
        },
        {
          "id": "item_55",
          "type": "verificacion",
          "label": "Estado de acceso al patio de condensadores."
        },
        {
          "id": "item_56",
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

-- EST-ELEC-INSP-MLP-BBOSCH-03 · Pruebas de grupos generadores principales y auxiliares Tranque El Mauro - Inspección según Plan Matriz (45 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Pruebas de grupos generadores principales y auxiliares Tranque El Mauro - Inspección según Plan Matriz",
  "meta": {
    "norma": "EST-ELEC-INSP-MLP-BBOSCH-03",
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

-- EST-ELEC-MLP-BBOSCH-04 · Limpieza de salas eléctricas STMG 23 kV - Inspección según Plan Matriz (24 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Limpieza de salas eléctricas STMG 23 kV - Inspección según Plan Matriz",
  "meta": {
    "norma": "EST-ELEC-MLP-BBOSCH-04",
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
              "label": "Toma de T° y presión"
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
    },
    {
      "id": "fotos",
      "title": "Registro fotográfico",
      "items": [
        {
          "id": "item_24",
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
where et.code = 'sala_electrica_stmg' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- EST-ELEC-MLP-BBOSCH-05 · Reconectador 23 kV - Inspección según Plan Matriz (23 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Reconectador 23 kV - Inspección según Plan Matriz",
  "meta": {
    "norma": "EST-ELEC-MLP-BBOSCH-05",
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
    },
    {
      "id": "fotos",
      "title": "Galería fotográfica",
      "items": [
        {
          "id": "item_23",
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
where et.code = 'reconectador' and wm.code = 'plan_matriz'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

