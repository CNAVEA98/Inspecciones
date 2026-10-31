-- Plantillas de mantención MANT-01 a 17 y 20 × Mantenimiento programado (Word revisados de «Bases de datos generales/Formatos BBOSCH/MANTENCIONES»).
-- MANT-18 y 19 aún no están (siguen en .doc). Es seguro ejecutarlo más de una vez y también en un Supabase remoto.
-- Requiere que existan los modos de trabajo (seed_catalogo.sql). En el SQL Editor remoto elegir «postgres (Superuser)» junto a «Run».

insert into public.equipment_types (code, name, sort)
values ('mant_generadores_locales', 'Mantención · Generadores locales', 20)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('mant_parques_generacion', 'Mantención · Parques de generación', 21)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('mant_subestacion_movil', 'Mantención · Subestación móvil', 22)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('mant_cargadores_baterias', 'Mantención · Cargadores y banco de baterías', 23)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('mant_tablero_bt', 'Mantención · Tablero BT', 24)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('mant_reconectador', 'Mantención · Reconectador', 25)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('mant_switchgear_sala_12', 'Mantención · Switchgear sala 12 23 kV', 26)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('mant_switchgear_estaciones', 'Mantención · Switchgear estaciones 23 kV', 27)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('mant_switchgear_sala_1_y_12', 'Mantención · Switchgear sala 1 y sala 12', 28)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('mant_switchgear_mauro', 'Mantención · Switchgear SE El Mauro 23 kV', 29)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('mant_transformador_aereo', 'Mantención · Transformador aéreo', 30)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('mant_filtro_chancado', 'Mantención · Filtro armónico Chancado', 31)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('mant_filtro_planta', 'Mantención · Filtro armónico Planta', 32)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('mant_filtro_ppch', 'Mantención · Filtro armónico PPCH', 33)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('mant_parrones', 'Mantención · Parrones 23 kV', 34)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('mant_transformador_piso', 'Mantención · Transformador de piso', 35)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('mant_transformador_poder_correas', 'Mantención · Transformador de poder Correas', 36)
on conflict (code) do nothing;

insert into public.equipment_types (code, name, sort)
values ('mant_linea_aerea', 'Mantención · Línea aérea 23 kV', 37)
on conflict (code) do nothing;

-- MANT-01 · EST-ELEC-MANT-MLP-BBOSCH-01 · Mantención Control de GG MLP (24 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Mantención Control de GG MLP",
  "meta": {
    "norma": "EST-ELEC-MANT-MLP-BBOSCH-01",
    "revision": "Junio 2026",
    "titulo": "Mantención Control de GG MLP"
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
      "key": "n_serie",
      "label": "N° Serie",
      "input": "text",
      "required": false
    },
    {
      "key": "potencia",
      "label": "Potencia",
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
      "key": "marca",
      "label": "Marca",
      "input": "text",
      "required": false
    },
    {
      "key": "horometro",
      "label": "Horómetro",
      "input": "text",
      "required": false
    },
    {
      "key": "capacidad_interruptor_gr",
      "label": "Capacidad Interruptor Gral",
      "input": "text",
      "required": false
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
      "id": "tablero_de_control",
      "title": "Tablero de control",
      "items": [
        {
          "id": "item_001",
          "type": "verificacion",
          "label": "Realizar la revisión de los equipos de visualización"
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Realizar limpieza general"
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Verificar y realizar reapriete de conexiones"
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Revisión de estado de contactores y relés"
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Revisión de estado de protecciones (disyuntores y porta fusibles)"
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Verificar y realiza ordenamiento de cables"
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Realizar revisión de luces pilotos"
        }
      ]
    },
    {
      "id": "grupo_generador",
      "title": "Grupo Generador",
      "items": [
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Registrar nivel de combustible",
          "unit": ""
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Registrar tensión de baterías",
          "unit": "V"
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Registrar temperatura de Refrigerante",
          "unit": "°C"
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Calefactor se encuentra en buenas condiciones"
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Estado de filtro de aire"
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Limpieza general de baterías y bornes"
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Revisión de apriete de prensas en bornes"
        }
      ]
    },
    {
      "id": "house_keeping_general",
      "title": "House keeping general",
      "items": [
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Realizar limpieza general al interior del generador"
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Retirar residuos generados durante mantención"
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Verificar estado canalizaciones de fuerza"
        }
      ]
    },
    {
      "id": "tareas_al_termino_de_mantencio",
      "title": "Tareas al término de mantención",
      "items": [
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Chequeo de alarmas, posterior a energización"
        }
      ]
    },
    {
      "id": "entorno",
      "title": "Entorno",
      "items": [
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "Verificar estado de cerco perimetral"
        },
        {
          "id": "item_020",
          "type": "verificacion",
          "label": "Verificar señalética de seguridad en cerco o equipo"
        },
        {
          "id": "item_021",
          "type": "verificacion",
          "label": "Desmalezar y/o limpiar contorno del equipo"
        },
        {
          "id": "item_022",
          "type": "verificacion",
          "label": "Verificar existencia y estado de equipo de extinción de incendios"
        },
        {
          "id": "item_023",
          "type": "verificacion",
          "label": "Verificar estado de iluminación"
        },
        {
          "id": "item_024",
          "type": "verificacion",
          "label": "Verificar conexión a tierra, reapretar si aplica"
        }
      ]
    }
  ],
  "nomenclature": "SI / NO / RL: REALIZADO / NR: NO REALIZADO / BN: BUENO / ML: MALO (Indicar motivos en observaciones) / RMP: REEMPLAZADO (Indicar motivos en observaciones) / NT: NO TIENE",
  "estados": [
    "SI",
    "NO",
    "RL",
    "NR",
    "BN",
    "ML",
    "RMP",
    "NT"
  ],
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia, además realizar set fotográfico con el antes y después de la Mantención."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'mant_generadores_locales' and wm.code = 'mantenimiento_programado'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- MANT-02 · EST-ELEC-MANT-MLP-BBOSCH-02 · Mantención Control de GG Emergencia MLP (26 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Mantención Control de GG Emergencia MLP",
  "meta": {
    "norma": "EST-ELEC-MANT-MLP-BBOSCH-02",
    "revision": "Junio 2026",
    "titulo": "Mantención Control de GG Emergencia MLP"
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
      "key": "n_serie",
      "label": "N° Serie",
      "input": "text",
      "required": false
    },
    {
      "key": "potencia",
      "label": "Potencia",
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
      "key": "marca",
      "label": "Marca",
      "input": "text",
      "required": false
    },
    {
      "key": "horometro",
      "label": "Horómetro",
      "input": "text",
      "required": false
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
      "id": "tablero_de_control",
      "title": "Tablero de control",
      "items": [
        {
          "id": "item_001",
          "type": "verificacion",
          "label": "Verificar tensión cero en tablero de control"
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Realizar limpieza general de tablero de control"
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Verificar y realizar reapriete de conexiones en tablero de control"
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Revisión de estado de contactores y relés en tablero de control"
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Revisión de estado de protecciones (disyuntores y porta fusibles) en tablero de control"
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Revisión de estado y funcionamiento de parada de emergencia en Tablero de control"
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Verificar y realiza ordenamiento de cables en tablero de control"
        }
      ]
    },
    {
      "id": "tablero_de_fuerza_de_ventilado",
      "title": "Tablero de fuerza de ventiladores",
      "items": [
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Verificar tensión cero en tablero de fuerza"
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Limpieza general de tablero de fuerza"
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Revisión de apriete de conexiones de tablero de fuerza"
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Revisión de estado de disyuntores, guarda motores y contactores"
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Verificar ordenamiento de cables en tablero de fuerza"
        }
      ]
    },
    {
      "id": "baterias",
      "title": "Baterías",
      "items": [
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Limpieza general de baterías y bornes"
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Revisión de apriete de prensas en bornes"
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Instalar protecciones metálicas sobre baterías"
        }
      ]
    },
    {
      "id": "estanque_diario_de_combustible",
      "title": "Estanque diario de combustible",
      "items": [
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Limpieza de bornes de sensor de nivel"
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Revisión de apriete de conexiones de sensor de nivel"
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "dejar con acrílico de protección en sensor de nivel"
        },
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "Limpieza general de caja de paso al costado del estanque"
        },
        {
          "id": "item_020",
          "type": "verificacion",
          "label": "Revisión de apriete de conexiones de la caja de paso"
        },
        {
          "id": "item_021",
          "type": "verificacion",
          "label": "Revisión de ordenamiento de cables en la caja de paso"
        }
      ]
    },
    {
      "id": "house_keeping_general",
      "title": "House keeping general",
      "items": [
        {
          "id": "item_022",
          "type": "verificacion",
          "label": "Realizar limpieza general al interior del generador"
        },
        {
          "id": "item_023",
          "type": "verificacion",
          "label": "Retirar residuos generados durante mantención"
        }
      ]
    },
    {
      "id": "tareas_al_termino_de_mantencio",
      "title": "Tareas al término de mantención",
      "items": [
        {
          "id": "item_024",
          "type": "verificacion",
          "label": "Desbloqueo y energización de interruptor principal intervenido"
        },
        {
          "id": "item_025",
          "type": "verificacion",
          "label": "Chequeo de alarmas, posterior a energización"
        },
        {
          "id": "item_026",
          "type": "verificacion",
          "label": "Coordinar con operador de sala eléctrica 1 las pruebas de funcionamiento en generador intervenido"
        }
      ]
    }
  ],
  "nomenclature": "SI / NO / RL: REALIZADO / NR: NO REALIZADO / BN: BUENO / ML: MALO (Indicar motivos en observaciones) / RMP: REEMPLAZADO (Indicar motivos en observaciones) / NT: NO TIENE",
  "estados": [
    "SI",
    "NO",
    "RL",
    "NR",
    "BN",
    "ML",
    "RMP",
    "NT"
  ],
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia, además realizar set fotográfico con el antes y después de la Mantención."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'mant_parques_generacion' and wm.code = 'mantenimiento_programado'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- MANT-03 · EST-ELEC-MANT-MLP-BBOSCH-03 · Mantención S/E Móvil (50 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Mantención S/E Móvil",
  "meta": {
    "norma": "EST-ELEC-MANT-MLP-BBOSCH-03",
    "revision": "Junio 2026",
    "titulo": "Mantención S/E Móvil"
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
      "key": "marca",
      "label": "Marca",
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
      "key": "aceite",
      "label": "Aceite",
      "input": "text",
      "required": false
    },
    {
      "key": "volumen_de_aceite",
      "label": "Volumen de aceite",
      "input": "text",
      "required": false
    },
    {
      "key": "voltaje_primario",
      "label": "Voltaje primario",
      "input": "text",
      "required": false
    },
    {
      "key": "voltaje_secundario",
      "label": "Voltaje secundario",
      "input": "text",
      "required": false
    },
    {
      "key": "potencia",
      "label": "Potencia",
      "input": "text",
      "required": false
    },
    {
      "key": "conexion",
      "label": "Conexión",
      "input": "text",
      "required": false
    },
    {
      "key": "h_inicio",
      "label": "Hora y fecha de inicio",
      "input": "text"
    },
    {
      "key": "h_fin",
      "label": "Hora y fecha de término",
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
      "id": "transformador_23_6_9_kv",
      "title": "Transformador 23/6.9 kV",
      "items": [
        {
          "id": "item_001",
          "type": "verificacion",
          "label": "Registrar temperatura actual de enrollado.",
          "unit": "°C"
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Registrar temperatura máxima de enrollado.",
          "unit": "°C"
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Realizar reposición aguja arrastre Tº enrollado."
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Registrar temperatura actual de aceite.",
          "unit": "°C"
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Registrar temperatura máxima de aceite.",
          "unit": "°C"
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Realizar reposición aguja arrastre T° aceite."
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Registrar nivel de aceite de conservador.",
          "unit": ""
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Registrar Tap de transformador.",
          "unit": ""
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Verificar estado de flanges, filtraciones."
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Verificar estado de uniones estancas y costuras, filtraciones"
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Realizar apriete de conexión de puesta a tierra."
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Verificar estado de válvulas."
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Poner en servicio ventilador y verificar funcionamiento."
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Verificar estado de pintura de equipo y señales de corrosión."
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Verificar estado de tablero de control, pintura, cierre."
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Verificar ventilación de tablero de control."
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Verificar calefacción de tablero de control."
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Verificar iluminación de tablero de control."
        },
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "Realizar reapriete de conexiones en tablero de control."
        },
        {
          "id": "item_020",
          "type": "verificacion",
          "label": "Verificar funcionamiento de iluminación exterior."
        },
        {
          "id": "item_021",
          "type": "verificacion",
          "label": "Realizar limpieza en general de equipo."
        },
        {
          "id": "item_022",
          "type": "verificacion",
          "label": "Reapriete de conexiones transformador"
        },
        {
          "id": "item_023",
          "type": "verificacion",
          "label": "Realizar limpieza y reapriete de aisladores."
        }
      ]
    },
    {
      "id": "switchgear_de_23_kv",
      "title": "Switchgear de 23 kV",
      "items": [
        {
          "id": "item_024",
          "type": "verificacion",
          "label": "Realizar reemplazo de luces pilotos según registro de inspección"
        },
        {
          "id": "item_025",
          "type": "verificacion",
          "label": "Selector Local Remoto (Local)"
        },
        {
          "id": "item_026",
          "type": "verificacion",
          "label": "Verificar estado de relé de protección (27 – 59)"
        },
        {
          "id": "item_027",
          "type": "verificacion",
          "label": "Revisar iluminación interior celdas."
        },
        {
          "id": "item_028",
          "type": "verificacion",
          "label": "Realizar limpieza general de equipo"
        },
        {
          "id": "item_029",
          "type": "verificacion",
          "label": "Realizar limpieza a tablero auxiliar."
        },
        {
          "id": "item_030",
          "type": "verificacion",
          "label": "Realizar limpieza general de equipo"
        },
        {
          "id": "item_031",
          "type": "verificacion",
          "label": "Realizar reapriete de borneras de control"
        },
        {
          "id": "item_032",
          "type": "verificacion",
          "label": "Verificar resorte de Interruptor si está Cargado"
        },
        {
          "id": "item_033",
          "type": "verificacion",
          "label": "Verificar estado de Iluminación interior celda."
        }
      ]
    },
    {
      "id": "switchgear_de_6_9_kv",
      "title": "Switchgear de 6.9 kV",
      "items": [
        {
          "id": "item_034",
          "type": "verificacion",
          "label": "Realizar reemplazo de luces pilotos según registro de inspección"
        },
        {
          "id": "item_035",
          "type": "verificacion",
          "label": "Selector Local Remoto (Local)"
        },
        {
          "id": "item_036",
          "type": "verificacion",
          "label": "Verificar estado de relé de protección (27 – 59)"
        },
        {
          "id": "item_037",
          "type": "verificacion",
          "label": "Revisar iluminación interior celdas."
        },
        {
          "id": "item_038",
          "type": "verificacion",
          "label": "Realizar limpieza general de equipo"
        },
        {
          "id": "item_039",
          "type": "verificacion",
          "label": "Realizar limpieza a tablero auxiliar."
        },
        {
          "id": "item_040",
          "type": "verificacion",
          "label": "Realizar limpieza general de equipo"
        },
        {
          "id": "item_041",
          "type": "verificacion",
          "label": "Realizar reapriete de borneras de control"
        },
        {
          "id": "item_042",
          "type": "verificacion",
          "label": "Verificar resorte de Interruptor si está Cargado"
        },
        {
          "id": "item_043",
          "type": "verificacion",
          "label": "Verificar estado de Iluminación interior celda."
        },
        {
          "id": "item_044",
          "type": "verificacion",
          "label": "Verificar que Interruptores de control están cerrados."
        },
        {
          "id": "item_045",
          "type": "verificacion",
          "label": "Verificar Calefacción interior celdas."
        },
        {
          "id": "item_046",
          "type": "verificacion",
          "label": "Registrar Nº de operaciones Int. 52-1.",
          "unit": ""
        },
        {
          "id": "item_047",
          "type": "verificacion",
          "label": "Registrar Nº de operaciones Int. 52-2.",
          "unit": ""
        },
        {
          "id": "item_048",
          "type": "verificacion",
          "label": "Registrar Nº de operaciones Int. 52-3.",
          "unit": ""
        },
        {
          "id": "item_049",
          "type": "verificacion",
          "label": "Registrar Nº de operaciones Int. 52-4.",
          "unit": ""
        },
        {
          "id": "item_050",
          "type": "verificacion",
          "label": "Registrar Nº de operaciones Int. 52-5.",
          "unit": ""
        }
      ]
    }
  ],
  "nomenclature": "SI / NO / RL: REALIZADO / NR: NO REALIZADO / BN: BUENO / ML: MALO (Indicar motivos en observaciones) / RMP: REEMPLAZADO (Indicar motivos en observaciones) / NT: NO TIENE",
  "estados": [
    "SI",
    "NO",
    "RL",
    "NR",
    "BN",
    "ML",
    "RMP",
    "NT"
  ],
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia, además realizar set fotográfico con el antes y después de la Mantención."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'mant_subestacion_movil' and wm.code = 'mantenimiento_programado'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- MANT-04 · EST-ELEC-MANT-MLP-BBOSCH-04 · Mantención Cargadores Banco de Baterías (28 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Mantención Cargadores Banco de Baterías",
  "meta": {
    "norma": "EST-ELEC-MANT-MLP-BBOSCH-04",
    "revision": "Junio 2026",
    "titulo": "Mantención Cargadores Banco de Baterías"
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
      "id": "cargador_n_1",
      "title": "Cargador N° 1",
      "items": [
        {
          "id": "item_001",
          "type": "verificacion",
          "label": "Realizar limpieza interior de cargadores, aspirando polvo."
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Revisar interior por presencia de humedad u otro ajeno al sistema"
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Revisar componentes y tarjetas en su interior."
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Realizar el reapriete de conexiones en borneras en 125 VCC y 400 VAC"
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Revisar estado de conductores y conexiones de amperímetros y voltímetros"
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Revisar estado de fusibles de protección."
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "En caso de encontrar fusibles operados, realizar la revisión de componentes"
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Revisar estado de luces indicadoras"
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Revisar estado de selectores y contactos del mismo"
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Revisar estado de acometida de cables a su interior"
        }
      ]
    },
    {
      "id": "cargador_n_2",
      "title": "Cargador N° 2",
      "items": [
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Realizar limpieza interior de cargadores, aspirando polvo."
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Revisar interior por presencia de humedad u otro ajeno al sistema"
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Revisar componentes y tarjetas en su interior."
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Realizar el reapriete de conexiones en borneras en 125 VCC y 400 VAC"
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Revisar estado de conductores y conexiones de amperímetros y voltímetros"
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Revisar estado de fusibles de protección."
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "En caso de encontrar fusibles operados, realizar la revisión de componentes"
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Revisar estado de luces indicadoras"
        },
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "Revisar estado de selectores y contactos del mismo"
        },
        {
          "id": "item_020",
          "type": "verificacion",
          "label": "Revisar estado de acometida de cables a su interior"
        }
      ]
    },
    {
      "id": "banco_de_baterias",
      "title": "Banco de baterías",
      "items": [
        {
          "id": "item_021",
          "type": "verificacion",
          "label": "Realizar medición de resistencia interna por cada batería"
        },
        {
          "id": "item_022",
          "type": "verificacion",
          "label": "Registrar valores obtenidos en planilla adjunta"
        },
        {
          "id": "item_023",
          "type": "verificacion",
          "label": "Revisión de terminales y bornes de las baterías."
        },
        {
          "id": "item_024",
          "type": "verificacion",
          "label": "Revisar el cableado de las baterías."
        },
        {
          "id": "item_025",
          "type": "verificacion",
          "label": "Medición del voltaje de carga de las baterías.",
          "unit": "V"
        },
        {
          "id": "item_026",
          "type": "verificacion",
          "label": "Medir voltaje de entrada del Banco",
          "unit": "V"
        },
        {
          "id": "item_027",
          "type": "verificacion",
          "label": "Medir corriente de consumo del banco",
          "unit": "A"
        },
        {
          "id": "item_028",
          "type": "verificacion",
          "label": "Verificación de estado y conectividad de la tierra instalada en la fuente."
        }
      ]
    }
  ],
  "nomenclature": "NT: NO TIENE / BN: BUENO / ML: MALO / NA: NO APLICA / NR: No Realizada (Indicar motivos en observaciones)",
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'mant_cargadores_baterias' and wm.code = 'mantenimiento_programado'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- MANT-05 · EST-ELEC-MANT-MLP-BBOSCH-05 · Mantención Tablero de BT MLP (13 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Mantención Tablero de BT MLP",
  "meta": {
    "norma": "EST-ELEC-MANT-MLP-BBOSCH-05",
    "revision": "Junio 2026",
    "titulo": "Mantención Tablero de BT MLP"
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
      "key": "tension",
      "label": "Tensión",
      "input": "text",
      "required": false
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
          "label": "Cambiar luces indicadoras de presencia de tensión",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Posee señalética presencia de energía u otra",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Posee doble tapa",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_004",
          "type": "number",
          "label": "Indicar capacidad de protección principal",
          "required": false,
          "unit": "A"
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Existe plano unilineal",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Están identificados los circuitos",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Revisar empotrado e tablero",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Posee chapa o aldaba para cerrar",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Verificar presencia de oxido",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Revisar sellos de tablero y realizar sellado de los que estén anormales",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Realizar limpieza de tablero en su interior",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Realizar reapriete de conexiones de barras",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Realizar reapriete de conexiones de control",
          "estados": [
            "SI",
            "NO"
          ]
        }
      ]
    }
  ],
  "nomenclature": "SI / NO / RL: REALIZADO / NR: NO REALIZADO / BN: BUENO / ML: MALO (Indicar motivos en observaciones) / RMP: REEMPLAZADO (Indicar motivos en observaciones) / NT: NO TIENE",
  "estados": [
    "SI",
    "NO",
    "RL",
    "NR",
    "BN",
    "ML",
    "RMP",
    "NT"
  ],
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia, además realizar set fotográfico con el antes y después de la Mantención."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'mant_tablero_bt' and wm.code = 'mantenimiento_programado'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- MANT-06 · EST-ELEC-MANT-MLP-BBOSCH-06 · Reconectador 23 kV (21 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Reconectador 23 kV",
  "meta": {
    "norma": "EST-ELEC-MANT-MLP-BBOSCH-06",
    "revision": "Junio 2026",
    "titulo": "Reconectador 23 kV"
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
          "label": "Acceso a reconectador."
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Verificar presencia de tensión 220 volts."
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Verificar estado de postes"
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Verificar estado de pintura de equipo y señales de corrosión"
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Verificar limpieza en general de equipo."
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Realizar limpieza de tablero BT."
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Realizar limpieza y revisión de aisladores"
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Realizar limpieza y revisión de Pararrayos."
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Realizar limpieza y revisión de desconectadores fusible."
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Realizar limpieza y revisión de mufas"
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Realizar reapriete de crucetas y ferretería."
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Estado de señaléticas de S/E. y reconectador."
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Registrar número de operaciones",
          "unit": ""
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Revisar estado de conductores"
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Realizar desmalezamiento."
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Verificar el aterrizado de Transformador"
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Verificar el aterrizado de Pararrayos"
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Realizar reapriete del control en control de Reconectador"
        },
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "Realizar revisión de conectores de control"
        },
        {
          "id": "item_020",
          "type": "verificacion",
          "label": "Bajar ajustes y eventos."
        },
        {
          "id": "item_021",
          "type": "verificacion",
          "label": "Realizar medición y revisión de estado de baterías"
        }
      ]
    }
  ],
  "nomenclature": "NT: NO TIENE / BN: BUENO / ML: MALO / NA: NO APLICA / NR: No Realizada (Indicar motivos en observaciones)",
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'mant_reconectador' and wm.code = 'mantenimiento_programado'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- MANT-07 · EST-ELEC-MANT-MLP-BBOSCH-07 · Mantención Switchgear 23 Kv Sala Eléctrica 12 (57 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Mantención Switchgear 23 Kv Sala Eléctrica 12",
  "meta": {
    "norma": "EST-ELEC-MANT-MLP-BBOSCH-07",
    "revision": "Junio 2026",
    "titulo": "Mantención Switchgear 23 Kv Sala Eléctrica 12"
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
      "key": "modelo",
      "label": "Modelo de interruptor",
      "input": "text",
      "required": false
    },
    {
      "key": "corriente",
      "label": "Corriente de interruptor",
      "input": "text",
      "required": false
    },
    {
      "key": "anio",
      "label": "Año de fabricación",
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
          "label": "Limpieza general de Cubículo."
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Limpieza de Relé Multilin."
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Limpieza de Borneras laterales de cubículo."
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Limpieza de Conexión de Instrumentos, luces y Switch de panel."
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Limpieza de Switch de posición de carro."
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Aplicar limpia contactos en borneras de relé Multilin."
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Aplicar limpia contactos en borneras laterales de cubículo."
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Aplicar limpia contactos en borneras de relés auxiliares y contactores de control."
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Aplicar limpia contactos en bornera de Instrumentos, luces y Switch de panel."
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Aplicación de limpia contactos a Switch de posición de carro."
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Reapriete de contactos en borneras de relé Multilin."
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Reapriete de contactos en borneras laterales de cubículo."
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Reapriete de contactos en borneras de relés auxiliares y contactores de control."
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Reapriete de contactos en bornera de Instrumentos, luces y switch de panel."
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Reapriete a conexiones de Switch de posición de carro."
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Revisión de estados contactos Switch de posición (TOC y MOC)"
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Verificar estado general (chisporroteo) de contactos de todas borneras de celda."
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Verificar funcionamiento de relés auxiliares y contactores de control."
        },
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "Verificar estado de fundas cobertoras de mufas 23 kV."
        },
        {
          "id": "item_020",
          "type": "verificacion",
          "label": "Verificar estado de mufas 23 kV."
        },
        {
          "id": "item_021",
          "type": "verificacion",
          "label": "Reapriete de conexión de mufas 23 kV."
        },
        {
          "id": "item_022",
          "type": "verificacion",
          "label": "Revisar estado de fundas cobertoras barras."
        },
        {
          "id": "item_023",
          "type": "verificacion",
          "label": "Reapriete de uniones de barras (Torque 100 Nm Barra)"
        },
        {
          "id": "item_024",
          "type": "verificacion",
          "label": "Verificar estado general (chisporroteo, señal de coci, alta T°, etc.) de unión barras"
        },
        {
          "id": "item_025",
          "type": "verificacion",
          "label": "Revisar mecanismos móviles arrastre del interruptor."
        },
        {
          "id": "item_026",
          "type": "verificacion",
          "label": "Verificar estado de cortinas de cubículo."
        },
        {
          "id": "item_027",
          "type": "verificacion",
          "label": "Verificar y lubricar estado de tulipas de conexión de Interruptor."
        },
        {
          "id": "item_028",
          "type": "verificacion",
          "label": "Reapriete de conexiones de Transformador de potencial (Torque 90 Nm TT/PP)"
        },
        {
          "id": "item_029",
          "type": "verificacion",
          "label": "Reapriete de conexiones de Transformadores de corriente (TC)."
        },
        {
          "id": "item_030",
          "type": "verificacion",
          "label": "Limpieza y reapriete de conexión de pararrayos."
        },
        {
          "id": "item_031",
          "type": "verificacion",
          "label": "Verificar el retiro de todas herramientas y materiales de cubículo."
        },
        {
          "id": "item_032",
          "type": "verificacion",
          "label": "Cerrar tapas de cubículo."
        }
      ]
    },
    {
      "id": "interruptores_sala_electrica_1",
      "title": "Interruptores Sala Eléctrica 12",
      "items": [
        {
          "id": "item_033",
          "type": "number",
          "label": "Interruptor 52-1 (1200 A · serie 98050240 · IN 12 - 01): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_034",
          "type": "number",
          "label": "Interruptor 52-2 (1200 A · serie 98070287 · IN 12 - 02): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_035",
          "type": "number",
          "label": "Interruptor 52-3 (1200 A · serie 98050241 · IN 12 - 03): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_036",
          "type": "number",
          "label": "Interruptor 52-4 (1200 A · serie 98070289 · IN 12 - 04): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_037",
          "type": "number",
          "label": "Interruptor 52-5 (1200 A · serie 5102050 · IN 12 - 05): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_038",
          "type": "number",
          "label": "Interruptor 52-6 (1200 A · serie 98050229 · IN 12 - 06): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_039",
          "type": "number",
          "label": "Interruptor 52-7 (1200 A · serie 98050235 · IN 12 - 07): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_040",
          "type": "number",
          "label": "Interruptor 52-8 (1200 A · serie 98040218 · IN 12 - 08): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_041",
          "type": "number",
          "label": "Interruptor 52-9 (1200 A · serie 98050238 · IN 12 - 09): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_042",
          "type": "number",
          "label": "Interruptor 52-10 (1200 A · serie 98050233 · IN 12 - 10): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_043",
          "type": "number",
          "label": "Interruptor 52-11 (1200 A · serie 98070288 · IN 12 - 11): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_044",
          "type": "number",
          "label": "Interruptor 52-12 (1200 A · serie 140101026 · IN 12 - 12): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        }
      ]
    },
    {
      "id": "protocolo_de_torque_de_pernos",
      "title": "Protocolo de torque de pernos de barras 23 kV",
      "items": [
        {
          "id": "item_045",
          "type": "text",
          "label": "Aprobado por",
          "required": false,
          "multiline": false
        },
        {
          "id": "item_046",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 1",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_047",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 2",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_048",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 3",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_049",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 4",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_050",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 5",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_051",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 6",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_052",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 7",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_053",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 8",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_054",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 9",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_055",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 10",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_056",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 11",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_057",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 12",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        }
      ]
    }
  ],
  "nomenclature": "RL: REALIZADO / NR: NO REALIZADO / ML: MALO / BN: BUENO / RMP: REEMPLAZADO (Indicar motivos en observaciones) / NT: NO TIENE",
  "estados": [
    "RL",
    "NR",
    "BN",
    "ML",
    "RMP",
    "NT"
  ],
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia, además realizar set fotográfico con el antes y después de la Mantención. Protocolo de torque: torque aprobado por el cliente, 100 Nm en pernos de barra y 90 Nm en pernos TT/PP."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'mant_switchgear_sala_12' and wm.code = 'mantenimiento_programado'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- MANT-08 · EST-ELEC-MANT-MLP-BBOSCH-08 · Mantención Switchgear 23 Kv (58 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Mantención Switchgear 23 Kv",
  "meta": {
    "norma": "EST-ELEC-MANT-MLP-BBOSCH-08",
    "revision": "Abril 2024",
    "titulo": "Mantención Switchgear 23 Kv"
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
      "key": "n_serie",
      "label": "N° Serie",
      "input": "text",
      "required": false
    },
    {
      "key": "modelo_de_interruptor",
      "label": "Modelo de Interruptor",
      "input": "text",
      "required": false
    },
    {
      "key": "corriente_de_interruptor",
      "label": "Corriente de Interruptor",
      "input": "text",
      "required": false
    },
    {
      "key": "ano_fabricacion",
      "label": "Año fabricación",
      "input": "text",
      "required": false
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
          "label": "Limpieza general de Cubículo."
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Limpieza de Relé Multilin."
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Limpieza de Borneras laterales de cubículo."
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Limpieza de Conexión de Instrumentos, luces y Switch de panel."
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Limpieza de Switch de posición de carro."
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Aplicar limpia contactos en borneras de relé Multilin."
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Aplicar limpia contactos en borneras laterales de cubículo."
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Aplicar limpia contactos en borneras de relés auxiliares y contactores de control."
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Aplicar limpia contactos en bornera de Instrumentos, luces y Switch de panel."
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Aplicación de limpia contactos a Switch de posición de carro."
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Reapriete de contactos en borneras de relé Multilin."
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Reapriete de contactos en borneras laterales de cubículo."
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Reapriete de contactos en borneras de relés auxiliares y contactores de control."
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Reapriete de contactos en bornera de Instrumentos, luces y switch de panel."
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Reapriete a conexiones de Switch de posición de carro."
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Revisión de estados contactos Switch de posición (TOC y MOC)"
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Verificar estado general (chisporroteo) de contactos de todas borneras de celda."
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Verificar funcionamiento de relés auxiliares y contactores de control."
        },
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "Verificar estado de fundas cobertoras de mufas 23 kV."
        },
        {
          "id": "item_020",
          "type": "verificacion",
          "label": "Verificar estado de mufas 23 kV."
        },
        {
          "id": "item_021",
          "type": "verificacion",
          "label": "Reapriete de conexión de mufas 23 kV."
        },
        {
          "id": "item_022",
          "type": "verificacion",
          "label": "Revisar estado de fundas cobertoras barras."
        },
        {
          "id": "item_023",
          "type": "verificacion",
          "label": "Reapriete de uniones de barras (Torque 100 Nm Barra)"
        },
        {
          "id": "item_024",
          "type": "verificacion",
          "label": "Verificar estado general (chisporroteo, señal de coci, alta T°, etc.) de unión barras"
        },
        {
          "id": "item_025",
          "type": "verificacion",
          "label": "Revisar mecanismos móviles arrastre del interruptor."
        },
        {
          "id": "item_026",
          "type": "verificacion",
          "label": "Verificar estado de cortinas de cubículo."
        },
        {
          "id": "item_027",
          "type": "verificacion",
          "label": "Verificar y lubricar estado de tulipas de conexión de Interruptor."
        },
        {
          "id": "item_028",
          "type": "verificacion",
          "label": "Reapriete de conexiones de Transformador de potencial (Torque 90 Nm TT/PP)"
        },
        {
          "id": "item_029",
          "type": "verificacion",
          "label": "Reapriete de conexiones de Transformadores de corriente (TC)."
        },
        {
          "id": "item_030",
          "type": "verificacion",
          "label": "Limpieza y reapriete de conexión de pararrayos."
        },
        {
          "id": "item_031",
          "type": "verificacion",
          "label": "Registro operaciones de interruptor (fin de Mantención)."
        },
        {
          "id": "item_032",
          "type": "verificacion",
          "label": "Chequeo de fin de mantención."
        },
        {
          "id": "item_033",
          "type": "verificacion",
          "label": "Verificar el retiro de todas herramientas y materiales de cubículo."
        },
        {
          "id": "item_034",
          "type": "verificacion",
          "label": "Cerrar tapas de cubículo."
        },
        {
          "id": "item_035",
          "type": "verificacion",
          "label": "Normalizada la energía Bajar ajustes y eventos de Multilin"
        }
      ]
    },
    {
      "id": "interruptores_sala_electrica",
      "title": "Interruptores Sala Eléctrica",
      "items": [
        {
          "id": "item_036",
          "type": "nameplate",
          "label": "Interruptor 52-1",
          "required": false,
          "fields": [
            {
              "key": "amp",
              "label": "Corriente",
              "unit": "A"
            },
            {
              "key": "serie",
              "label": "Serie"
            },
            {
              "key": "codigo",
              "label": "Código interno"
            },
            {
              "key": "operaciones",
              "label": "N° de operaciones"
            }
          ]
        },
        {
          "id": "item_037",
          "type": "nameplate",
          "label": "Interruptor 52-2",
          "required": false,
          "fields": [
            {
              "key": "amp",
              "label": "Corriente",
              "unit": "A"
            },
            {
              "key": "serie",
              "label": "Serie"
            },
            {
              "key": "codigo",
              "label": "Código interno"
            },
            {
              "key": "operaciones",
              "label": "N° de operaciones"
            }
          ]
        },
        {
          "id": "item_038",
          "type": "nameplate",
          "label": "Interruptor 52-3",
          "required": false,
          "fields": [
            {
              "key": "amp",
              "label": "Corriente",
              "unit": "A"
            },
            {
              "key": "serie",
              "label": "Serie"
            },
            {
              "key": "codigo",
              "label": "Código interno"
            },
            {
              "key": "operaciones",
              "label": "N° de operaciones"
            }
          ]
        },
        {
          "id": "item_039",
          "type": "nameplate",
          "label": "Interruptor 52-4",
          "required": false,
          "fields": [
            {
              "key": "amp",
              "label": "Corriente",
              "unit": "A"
            },
            {
              "key": "serie",
              "label": "Serie"
            },
            {
              "key": "codigo",
              "label": "Código interno"
            },
            {
              "key": "operaciones",
              "label": "N° de operaciones"
            }
          ]
        },
        {
          "id": "item_040",
          "type": "nameplate",
          "label": "Interruptor 52-5",
          "required": false,
          "fields": [
            {
              "key": "amp",
              "label": "Corriente",
              "unit": "A"
            },
            {
              "key": "serie",
              "label": "Serie"
            },
            {
              "key": "codigo",
              "label": "Código interno"
            },
            {
              "key": "operaciones",
              "label": "N° de operaciones"
            }
          ]
        },
        {
          "id": "item_041",
          "type": "nameplate",
          "label": "Interruptor 52-6",
          "required": false,
          "fields": [
            {
              "key": "amp",
              "label": "Corriente",
              "unit": "A"
            },
            {
              "key": "serie",
              "label": "Serie"
            },
            {
              "key": "codigo",
              "label": "Código interno"
            },
            {
              "key": "operaciones",
              "label": "N° de operaciones"
            }
          ]
        },
        {
          "id": "item_042",
          "type": "nameplate",
          "label": "Interruptor 52-7",
          "required": false,
          "fields": [
            {
              "key": "amp",
              "label": "Corriente",
              "unit": "A"
            },
            {
              "key": "serie",
              "label": "Serie"
            },
            {
              "key": "codigo",
              "label": "Código interno"
            },
            {
              "key": "operaciones",
              "label": "N° de operaciones"
            }
          ]
        },
        {
          "id": "item_043",
          "type": "nameplate",
          "label": "Interruptor 52-8",
          "required": false,
          "fields": [
            {
              "key": "amp",
              "label": "Corriente",
              "unit": "A"
            },
            {
              "key": "serie",
              "label": "Serie"
            },
            {
              "key": "codigo",
              "label": "Código interno"
            },
            {
              "key": "operaciones",
              "label": "N° de operaciones"
            }
          ]
        }
      ]
    },
    {
      "id": "protocolo_de_torque_de_pernos",
      "title": "Protocolo de torque de pernos de barras 23 kV",
      "items": [
        {
          "id": "item_044",
          "type": "text",
          "label": "Aprobado por",
          "required": false,
          "multiline": false
        },
        {
          "id": "item_045",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 1",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_046",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 2",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_047",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 3",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_048",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 4",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_049",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 5",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_050",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 6",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_051",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 7",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_052",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 8",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_053",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 9",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_054",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 10",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_055",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 11",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_056",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 12",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_057",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 13",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_058",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 14",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        }
      ]
    }
  ],
  "nomenclature": "RL: REALIZADO / NR: NO REALIZADO / ML: MALO / BN: BUENO / RMP: REEMPLAZADO (Indicar motivos en observaciones) / NT: NO TIENE",
  "estados": [
    "RL",
    "NR",
    "BN",
    "ML",
    "RMP",
    "NT"
  ],
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia, además realizar set fotográfico con el antes y después de la Mantención. Protocolo de torque: torque aprobado por el cliente, 100 Nm en pernos de barra y 90 Nm en pernos TT/PP."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'mant_switchgear_estaciones' and wm.code = 'mantenimiento_programado'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- MANT-09 · EST-ELEC-MANT-MLP-BBOSCH-09 · Mantención Switchgear 23 Kv Sala 1 y 12 (113 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Mantención Switchgear 23 Kv Sala 1 y 12",
  "meta": {
    "norma": "EST-ELEC-MANT-MLP-BBOSCH-09",
    "revision": "Junio 2026",
    "titulo": "Mantención Switchgear 23 Kv Sala 1 y 12"
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
      "key": "n_serie",
      "label": "N° Serie",
      "input": "text",
      "required": false
    },
    {
      "key": "modelo_de_interruptor",
      "label": "Modelo de Interruptor",
      "input": "text",
      "required": false
    },
    {
      "key": "corriente_de_interruptor",
      "label": "Corriente de Interruptor",
      "input": "text",
      "required": false
    },
    {
      "key": "ano_fabricacion",
      "label": "Año fabricación",
      "input": "text",
      "required": false
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
          "label": "Limpieza general de Cubículo."
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Limpieza de Relé Multilin."
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Limpieza de Borneras laterales de cubículo."
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Limpieza de Conexión de Instrumentos, luces y Switch de panel."
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Limpieza de Switch de posición de carro."
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Aplicar limpia contactos en borneras de relé Multilin."
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Aplicar limpia contactos en borneras laterales de cubículo."
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Aplicar limpia contactos en borneras de relés auxiliares y contactores de control."
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Aplicar limpia contactos en bornera de Instrumentos, luces y Switch de panel."
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Aplicación de limpia contactos a Switch de posición de carro."
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Reapriete de contactos en borneras de relé Multilin."
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Reapriete de contactos en borneras laterales de cubículo."
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Reapriete de contactos en borneras de relés auxiliares y contactores de control."
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Reapriete de contactos en bornera de Instrumentos, luces y switch de panel."
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Reapriete a conexiones de Switch de posición de carro."
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Revisión de estados contactos Switch de posición (TOC y MOC)"
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Verificar estado general (chisporroteo) de contactos de todas borneras de celda."
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Verificar funcionamiento de relés auxiliares y contactores de control."
        },
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "Verificar estado de fundas cobertoras de mufas 23 kV."
        },
        {
          "id": "item_020",
          "type": "verificacion",
          "label": "Verificar estado de mufas 23 kV."
        },
        {
          "id": "item_021",
          "type": "verificacion",
          "label": "Reapriete de conexión de mufas 23 kV."
        },
        {
          "id": "item_022",
          "type": "verificacion",
          "label": "Revisar estado de fundas cobertoras barras."
        },
        {
          "id": "item_023",
          "type": "verificacion",
          "label": "Reapriete de uniones de barras (Torque 100 Nm Barra)"
        },
        {
          "id": "item_024",
          "type": "verificacion",
          "label": "Verificar estado general (chisporroteo, señal de coci, alta T°, etc.) de unión barras"
        },
        {
          "id": "item_025",
          "type": "verificacion",
          "label": "Revisar mecanismos móviles arrastre del interruptor."
        },
        {
          "id": "item_026",
          "type": "verificacion",
          "label": "Verificar estado de cortinas de cubículo."
        },
        {
          "id": "item_027",
          "type": "verificacion",
          "label": "Verificar y lubricar estado de tulipas de conexión de Interruptor."
        },
        {
          "id": "item_028",
          "type": "verificacion",
          "label": "Reapriete de conexiones de Transformador de potencial (Torque 90 Nm TT/PP)"
        },
        {
          "id": "item_029",
          "type": "verificacion",
          "label": "Reapriete de conexiones de Transformadores de corriente (TC)."
        },
        {
          "id": "item_030",
          "type": "verificacion",
          "label": "Limpieza y reapriete de conexión de pararrayos."
        },
        {
          "id": "item_031",
          "type": "verificacion",
          "label": "Registro operaciones de interruptor (fin de Mantención)."
        },
        {
          "id": "item_032",
          "type": "verificacion",
          "label": "Chequeo de fin de mantención."
        },
        {
          "id": "item_033",
          "type": "verificacion",
          "label": "Verificar el retiro de todas herramientas y materiales de cubículo."
        },
        {
          "id": "item_034",
          "type": "verificacion",
          "label": "Cerrar tapas de cubículo."
        },
        {
          "id": "item_035",
          "type": "verificacion",
          "label": "Normalizada la energía Bajar ajustes y eventos de Multilin"
        }
      ]
    },
    {
      "id": "interruptores_sala_electrica_1",
      "title": "Interruptores Sala Eléctrica 1",
      "items": [
        {
          "id": "item_036",
          "type": "number",
          "label": "Interruptor 52-1 (1200 A · serie 98080325 · IN 1 - 01): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_037",
          "type": "number",
          "label": "Interruptor 52-2 (1200 A · serie 5102048 · IN 1 - 02): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_038",
          "type": "number",
          "label": "Interruptor 52-3 (1200 A · serie 98050228 · IN 1 - 03): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_039",
          "type": "number",
          "label": "Interruptor 52-4 (1200 A · serie 98040212 · IN 1 - 04): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_040",
          "type": "number",
          "label": "Interruptor 52-5 (1200 A · serie 98050231 · IN 1 - 05): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_041",
          "type": "number",
          "label": "Interruptor 52-6 (1200 A · serie 98040214 · IN 1 - 06): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_042",
          "type": "number",
          "label": "Interruptor 52-7 (1200 A · IN 1 - 07): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_043",
          "type": "number",
          "label": "Interruptor 52-8 (2500 A · serie 98060258 · IN 1 - 08): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_044",
          "type": "number",
          "label": "Interruptor 52-9 (1200 A · serie 98050226 · IN 1 - 09): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_045",
          "type": "number",
          "label": "Interruptor 52-10 (1200 A · serie 98050225 · IN 1 - 10): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_046",
          "type": "number",
          "label": "Interruptor 52-11 (1200 A · serie 98040210 · IN 1 - 11): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_047",
          "type": "number",
          "label": "Interruptor 52-12 (1200 A · serie 98050224 · IN 1 - 12): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_048",
          "type": "number",
          "label": "Interruptor 52-13 (1200 A · serie 80800662 · IN 1 - 13): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_049",
          "type": "number",
          "label": "Interruptor 52-14 (1200 A · serie 98040207 · IN 1 - 14): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_050",
          "type": "number",
          "label": "Interruptor 52-15 (1200 A · serie 98040215 · IN 1 - 15): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_051",
          "type": "number",
          "label": "Interruptor 52-16 (2500 A · serie 98060260 · IN 1 - 16): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_052",
          "type": "number",
          "label": "Interruptor 52-17 (1200 A · serie 98040216 · IN 1 - 17): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_053",
          "type": "number",
          "label": "Interruptor 52-18 (1200 A · serie 80800642 · IN 1 - 18): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_054",
          "type": "number",
          "label": "Interruptor 52-19 (1200 A · serie 98040219 · IN 1 - 19): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_055",
          "type": "number",
          "label": "Interruptor 52-20 (1200 A · serie 98050223 · IN 1 - 20): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_056",
          "type": "number",
          "label": "Interruptor 52-21 (1200 A · serie 98050236 · IN 1 - 21): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_057",
          "type": "number",
          "label": "Interruptor 52-22 (2500 A · serie 5102053 · IN 1 - 22): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_058",
          "type": "number",
          "label": "Interruptor 52-23 (1200 A · serie 98050234 · IN 1 - 23): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_059",
          "type": "number",
          "label": "Interruptor 52-24 (1200 A · serie 98040220 · IN 1 - 24): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_060",
          "type": "number",
          "label": "Interruptor 52-25 (1200 A · serie 98050224 · IN 1 - 25): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_061",
          "type": "number",
          "label": "Interruptor 52-26 (1200 A · serie 98050222 · IN 1 - 26): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_062",
          "type": "number",
          "label": "Interruptor 52-27 (1200 A · serie 8801272 · IN 1 - 27): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_063",
          "type": "number",
          "label": "Interruptor 52-28 (1200 A · serie 5102052 · IN 1 - 28): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_064",
          "type": "number",
          "label": "Interruptor 52-29 (1200 A · serie 98080321 · IN 1 - 29): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_065",
          "type": "number",
          "label": "Interruptor 52-30 (2500 A · serie 98860262 · IN 1 - 30): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_066",
          "type": "number",
          "label": "Interruptor 52-31 (2500 A · serie 98060261 · IN 1 - 31): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_067",
          "type": "number",
          "label": "Interruptor 52-32 (1200 A · serie 98050227 · IN 1 - 32): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_068",
          "type": "number",
          "label": "Interruptor 52-33 (1200 A · serie 80800992 · IN 1 - 33): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_069",
          "type": "number",
          "label": "Interruptor 52-34 (1200 A · serie 90800662 · IN 1 - 34): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_070",
          "type": "number",
          "label": "Interruptor 52-35 (1200 A · serie 98050232 · IN 1 - 35): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_071",
          "type": "number",
          "label": "Interruptor 52-36 (1200 A · serie 98040213 · IN 1 - 36): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_072",
          "type": "number",
          "label": "Interruptor 52-37 (1200 A · serie 98040211 · IN 1 - 37): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_073",
          "type": "number",
          "label": "Interruptor 52-38 (1200 A · serie 5102049 · IN 1 - 38): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_074",
          "type": "number",
          "label": "Interruptor 52-41 (1200 A · serie 98040217 · IN 1 - 39): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        }
      ]
    },
    {
      "id": "interruptores_sala_electrica_1_2",
      "title": "Interruptores Sala Eléctrica 12",
      "items": [
        {
          "id": "item_075",
          "type": "number",
          "label": "Interruptor 52-1 (1200 A · serie 98050240 · IN 12 - 01): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_076",
          "type": "number",
          "label": "Interruptor 52-2 (1200 A · serie 98070287 · IN 12 - 02): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_077",
          "type": "number",
          "label": "Interruptor 52-3 (1200 A · serie 98050241 · IN 12 - 03): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_078",
          "type": "number",
          "label": "Interruptor 52-4 (1200 A · serie 98070289 · IN 12 - 04): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_079",
          "type": "number",
          "label": "Interruptor 52-5 (1200 A · serie 5102050 · IN 12 - 05): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_080",
          "type": "number",
          "label": "Interruptor 52-6 (1200 A · serie 98050229 · IN 12 - 06): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_081",
          "type": "number",
          "label": "Interruptor 52-7 (1200 A · serie 98050235 · IN 12 - 07): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_082",
          "type": "number",
          "label": "Interruptor 52-8 (1200 A · serie 98040218 · IN 12 - 08): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_083",
          "type": "number",
          "label": "Interruptor 52-9 (1200 A · serie 98050238 · IN 12 - 09): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_084",
          "type": "number",
          "label": "Interruptor 52-10 (1200 A · serie 98050233 · IN 12 - 10): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_085",
          "type": "number",
          "label": "Interruptor 52-11 (1200 A · serie 98070288 · IN 12 - 11): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        },
        {
          "id": "item_086",
          "type": "number",
          "label": "Interruptor 52-12 (1200 A · serie 140101026 · IN 12 - 12): N° de operaciones",
          "required": false,
          "unit": "operaciones"
        }
      ]
    },
    {
      "id": "protocolo_de_torque_de_pernos",
      "title": "Protocolo de torque de pernos de barras 23 kV",
      "items": [
        {
          "id": "item_087",
          "type": "text",
          "label": "Aprobado por",
          "required": false,
          "multiline": false
        },
        {
          "id": "item_088",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 1",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_089",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 2",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_090",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 3",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_091",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 4",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_092",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 5",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_093",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 6",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_094",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 7",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_095",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 8",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_096",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 9",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_097",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 10",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_098",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 11",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_099",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 12",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_100",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 13",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_101",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 14",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_102",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 30",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_103",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 31",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_104",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 32",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_105",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 33",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_106",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 34",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_107",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 35",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_108",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 36",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_109",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 37",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_110",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 38",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_111",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 39",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_112",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 40",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_113",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 41",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        }
      ]
    }
  ],
  "nomenclature": "RL: REALIZADO / NR: NO REALIZADO / ML: MALO / BN: BUENO / RMP: REEMPLAZADO (Indicar motivos en observaciones) / NT: NO TIENE",
  "estados": [
    "RL",
    "NR",
    "BN",
    "ML",
    "RMP",
    "NT"
  ],
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia, además realizar set fotográfico con el antes y después de la Mantención. Protocolo de torque: torque aprobado por el cliente, 100 Nm en pernos de barra y 90 Nm en pernos TT/PP."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'mant_switchgear_sala_1_y_12' and wm.code = 'mantenimiento_programado'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- MANT-10 · EST-ELEC-MANT-MLP-BBOSCH-10 · Mantención Switchgear 23 Kv SE Mauro (58 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Mantención Switchgear 23 Kv SE Mauro",
  "meta": {
    "norma": "EST-ELEC-MANT-MLP-BBOSCH-10",
    "revision": "Junio 2026",
    "titulo": "Mantención Switchgear 23 Kv SE Mauro"
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
      "key": "n_serie",
      "label": "N° Serie",
      "input": "text",
      "required": false
    },
    {
      "key": "modelo_de_interruptor",
      "label": "Modelo de Interruptor",
      "input": "text",
      "required": false
    },
    {
      "key": "corriente_de_interruptor",
      "label": "Corriente de Interruptor",
      "input": "text",
      "required": false
    },
    {
      "key": "ano_fabricacion",
      "label": "Año fabricación",
      "input": "text",
      "required": false
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
          "label": "Limpieza general de Cubículo."
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Limpieza de Relé Multilin."
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Limpieza de Borneras laterales de cubículo."
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Limpieza de Conexión de Instrumentos, luces y Switch de panel."
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Limpieza de Switch de posición de carro."
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Aplicar limpia contactos en borneras de relé Multilin."
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Aplicar limpia contactos en borneras laterales de cubículo."
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Aplicar limpia contactos en borneras de relés auxiliares y contactores de control."
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Aplicar limpia contactos en bornera de Instrumentos, luces y Switch de panel."
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Aplicación de limpia contactos a Switch de posición de carro."
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Reapriete de contactos en borneras de relé Multilin."
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Reapriete de contactos en borneras laterales de cubículo."
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Reapriete de contactos en borneras de relés auxiliares y contactores de control."
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Reapriete de contactos en bornera de Instrumentos, luces y switch de panel."
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Reapriete a conexiones de Switch de posición de carro."
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Revisión de estados contactos Switch de posición (TOC y MOC)"
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Verificar estado general (chisporroteo) de contactos de todas borneras de celda."
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Verificar funcionamiento de relés auxiliares y contactores de control."
        },
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "Verificar estado de fundas cobertoras de mufas 23 kV."
        },
        {
          "id": "item_020",
          "type": "verificacion",
          "label": "Verificar estado de mufas 23 kV."
        },
        {
          "id": "item_021",
          "type": "verificacion",
          "label": "Reapriete de conexión de mufas 23 kV."
        },
        {
          "id": "item_022",
          "type": "verificacion",
          "label": "Revisar estado de fundas cobertoras barras."
        },
        {
          "id": "item_023",
          "type": "verificacion",
          "label": "Reapriete de uniones de barras (Torque 100 Nm Barra)"
        },
        {
          "id": "item_024",
          "type": "verificacion",
          "label": "Verificar estado general (chisporroteo, señal de coci, alta T°, etc.) de unión barras"
        },
        {
          "id": "item_025",
          "type": "verificacion",
          "label": "Revisar mecanismos móviles arrastre del interruptor."
        },
        {
          "id": "item_026",
          "type": "verificacion",
          "label": "Verificar estado de cortinas de cubículo."
        },
        {
          "id": "item_027",
          "type": "verificacion",
          "label": "Verificar y lubricar estado de tulipas de conexión de Interruptor."
        },
        {
          "id": "item_028",
          "type": "verificacion",
          "label": "Reapriete de conexiones de Transformador de potencial (Torque 90 Nm TT/PP)"
        },
        {
          "id": "item_029",
          "type": "verificacion",
          "label": "Reapriete de conexiones de Transformadores de corriente (TC)."
        },
        {
          "id": "item_030",
          "type": "verificacion",
          "label": "Limpieza y reapriete de conexión de pararrayos."
        },
        {
          "id": "item_031",
          "type": "verificacion",
          "label": "Registro operaciones de interruptor (fin de Mantención)."
        },
        {
          "id": "item_032",
          "type": "verificacion",
          "label": "Chequeo de fin de mantención."
        },
        {
          "id": "item_033",
          "type": "verificacion",
          "label": "Verificar el retiro de todas herramientas y materiales de cubículo."
        },
        {
          "id": "item_034",
          "type": "verificacion",
          "label": "Cerrar tapas de cubículo."
        },
        {
          "id": "item_035",
          "type": "verificacion",
          "label": "Normalizada la energía Bajar ajustes y eventos de Multilin"
        }
      ]
    },
    {
      "id": "interruptores_sala_electrica_m",
      "title": "Interruptores Sala Eléctrica Mauro",
      "items": [
        {
          "id": "item_036",
          "type": "nameplate",
          "label": "Interruptor 52-1",
          "required": false,
          "fields": [
            {
              "key": "amp",
              "label": "Corriente",
              "unit": "A"
            },
            {
              "key": "serie",
              "label": "Serie"
            },
            {
              "key": "codigo",
              "label": "Código interno"
            },
            {
              "key": "operaciones",
              "label": "N° de operaciones"
            }
          ]
        },
        {
          "id": "item_037",
          "type": "nameplate",
          "label": "Interruptor 52-2",
          "required": false,
          "fields": [
            {
              "key": "amp",
              "label": "Corriente",
              "unit": "A"
            },
            {
              "key": "serie",
              "label": "Serie"
            },
            {
              "key": "codigo",
              "label": "Código interno"
            },
            {
              "key": "operaciones",
              "label": "N° de operaciones"
            }
          ]
        },
        {
          "id": "item_038",
          "type": "nameplate",
          "label": "Interruptor 52-3",
          "required": false,
          "fields": [
            {
              "key": "amp",
              "label": "Corriente",
              "unit": "A"
            },
            {
              "key": "serie",
              "label": "Serie"
            },
            {
              "key": "codigo",
              "label": "Código interno"
            },
            {
              "key": "operaciones",
              "label": "N° de operaciones"
            }
          ]
        },
        {
          "id": "item_039",
          "type": "nameplate",
          "label": "Interruptor 52-4",
          "required": false,
          "fields": [
            {
              "key": "amp",
              "label": "Corriente",
              "unit": "A"
            },
            {
              "key": "serie",
              "label": "Serie"
            },
            {
              "key": "codigo",
              "label": "Código interno"
            },
            {
              "key": "operaciones",
              "label": "N° de operaciones"
            }
          ]
        },
        {
          "id": "item_040",
          "type": "nameplate",
          "label": "Interruptor 52-5",
          "required": false,
          "fields": [
            {
              "key": "amp",
              "label": "Corriente",
              "unit": "A"
            },
            {
              "key": "serie",
              "label": "Serie"
            },
            {
              "key": "codigo",
              "label": "Código interno"
            },
            {
              "key": "operaciones",
              "label": "N° de operaciones"
            }
          ]
        },
        {
          "id": "item_041",
          "type": "nameplate",
          "label": "Interruptor 52-6",
          "required": false,
          "fields": [
            {
              "key": "amp",
              "label": "Corriente",
              "unit": "A"
            },
            {
              "key": "serie",
              "label": "Serie"
            },
            {
              "key": "codigo",
              "label": "Código interno"
            },
            {
              "key": "operaciones",
              "label": "N° de operaciones"
            }
          ]
        },
        {
          "id": "item_042",
          "type": "nameplate",
          "label": "Interruptor 52-7",
          "required": false,
          "fields": [
            {
              "key": "amp",
              "label": "Corriente",
              "unit": "A"
            },
            {
              "key": "serie",
              "label": "Serie"
            },
            {
              "key": "codigo",
              "label": "Código interno"
            },
            {
              "key": "operaciones",
              "label": "N° de operaciones"
            }
          ]
        },
        {
          "id": "item_043",
          "type": "nameplate",
          "label": "Interruptor 52-8",
          "required": false,
          "fields": [
            {
              "key": "amp",
              "label": "Corriente",
              "unit": "A"
            },
            {
              "key": "serie",
              "label": "Serie"
            },
            {
              "key": "codigo",
              "label": "Código interno"
            },
            {
              "key": "operaciones",
              "label": "N° de operaciones"
            }
          ]
        }
      ]
    },
    {
      "id": "protocolo_de_torque_de_pernos",
      "title": "Protocolo de torque de pernos de barras 23 kV",
      "items": [
        {
          "id": "item_044",
          "type": "text",
          "label": "Aprobado por",
          "required": false,
          "multiline": false
        },
        {
          "id": "item_045",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 1",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_046",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 2",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_047",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 3",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_048",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 4",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_049",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 5",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_050",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 6",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_051",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 7",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_052",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 8",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_053",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 9",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_054",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 10",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_055",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 11",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_056",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 12",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_057",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 13",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        },
        {
          "id": "item_058",
          "type": "nameplate",
          "label": "Protocolo de torque · ítem 14",
          "required": false,
          "fields": [
            {
              "key": "cubiculo",
              "label": "Cubículo interruptor"
            },
            {
              "key": "revision",
              "label": "Revisión torque"
            },
            {
              "key": "torque",
              "label": "Torque aplicado",
              "unit": "Nm"
            },
            {
              "key": "f1",
              "label": "Fase F1"
            },
            {
              "key": "f2",
              "label": "Fase F2"
            },
            {
              "key": "f3",
              "label": "Fase F3"
            },
            {
              "key": "pernos",
              "label": "Pernos por fase"
            },
            {
              "key": "observaciones",
              "label": "Observaciones"
            }
          ]
        }
      ]
    }
  ],
  "nomenclature": "RL: REALIZADO / NR: NO REALIZADO / ML: MALO / BN: BUENO / RMP: REEMPLAZADO (Indicar motivos en observaciones) / NT: NO TIENE",
  "estados": [
    "RL",
    "NR",
    "BN",
    "ML",
    "RMP",
    "NT"
  ],
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia, además realizar set fotográfico con el antes y después de la Mantención. Protocolo de torque: torque aprobado por el cliente, 100 Nm en pernos de barra y 90 Nm en pernos TT/PP."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'mant_switchgear_mauro' and wm.code = 'mantenimiento_programado'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- MANT-11 · EST-ELEC-MANT-MLP-BBOSCH-11 · Mantención Transformador Aéreo (17 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Mantención Transformador Aéreo",
  "meta": {
    "norma": "EST-ELEC-MANT-MLP-BBOSCH-11",
    "revision": "Junio 2026",
    "titulo": "Mantención Transformador Aéreo"
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
      "key": "n_serie",
      "label": "N° Serie",
      "input": "text",
      "required": false
    },
    {
      "key": "potencia",
      "label": "Potencia",
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
      "key": "conexion",
      "label": "Conexión",
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
      "key": "tipos_aislante",
      "label": "Tipos Aislante",
      "input": "text",
      "required": false
    },
    {
      "key": "cantidad_aislante",
      "label": "Cantidad aislante",
      "input": "text",
      "required": false
    },
    {
      "key": "ano_fabricacion",
      "label": "Año fabricación",
      "input": "text",
      "required": false
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
          "label": "Registrar Temperatura actual de aceite.",
          "unit": "°C"
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Registrar Temperatura máxima de aceite.",
          "unit": "°C"
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Realizar la reposición aguja arrastre T° aceite."
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Registrar nivel de aceite de la cuba.",
          "unit": ""
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Registrar N° posición del TAP",
          "unit": ""
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Realizar recorrido de Tap de transformador y reponer en estado inicial."
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Reapriete de conexión de puesta a tierra."
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Limpieza de tablero distribución BT."
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Reapriete de conexiones en tablero BT"
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Reapriete de pararrayos."
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Reapriete y estado de desconectadores fusible."
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Reapriete y estado de conexiones desc. fusible"
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Reapriete y estado de conexiones transformador"
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Limpieza, reapriete y estado de aisladores."
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Reapriete de conexiones de enmalle y estado de prensas"
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Reapriete de crucetas y ferretería."
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Realizar limpieza en general de equipo."
        }
      ]
    }
  ],
  "nomenclature": "RL: REALIZADO / NR: NO REALIZADO / ML: MALO / BN: BUENO / RMP: REEMPLAZADO (Indicar motivos en observaciones) / NT: NO TIENE",
  "estados": [
    "RL",
    "NR",
    "BN",
    "ML",
    "RMP",
    "NT"
  ],
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia, además realizar set fotográfico con el antes y después de la Mantención."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'mant_transformador_aereo' and wm.code = 'mantenimiento_programado'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- MANT-12 · EST-ELEC-MANT-MLP-BBOSCH-12 · Mantención Filtro Armónico Mina 23kV (56 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Mantención Filtro Armónico Mina 23kV",
  "meta": {
    "norma": "EST-ELEC-MANT-MLP-BBOSCH-12",
    "revision": "Junio 2026",
    "titulo": "Mantención Filtro Armónico Mina 23kV"
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
          "label": "Chequeo de luces pilotos (probador)."
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Verificar estado de contactores"
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Limpieza de tableros de control"
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Estado de los borneras de control"
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Reapriete de ctos de control."
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Limpieza desconectador."
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Reapriete conexiones desconectador"
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Limpieza desc puesta a tierra."
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Reapriete conexiones desc puesta tierra"
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Tº de Inductores."
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Nivel de aceite de inductores."
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Verificar estado de calefactores."
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Limpieza de inductores."
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Reapriete conexiones de inductores"
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Reapriete de puesta a tierra inductores"
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Reapriete de conexiones inductores"
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Limpieza de capacitores."
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Reapriete de puesta a tierra capacitores"
        },
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "Reapriete de conexiones capacitores"
        },
        {
          "id": "item_020",
          "type": "verificacion",
          "label": "Limpieza de resistores"
        },
        {
          "id": "item_021",
          "type": "verificacion",
          "label": "Reapriete de puesta a tierra resistores"
        },
        {
          "id": "item_022",
          "type": "verificacion",
          "label": "Reapriete de conexiones resistores"
        },
        {
          "id": "item_023",
          "type": "verificacion",
          "label": "Limpieza de aisladores"
        },
        {
          "id": "item_024",
          "type": "verificacion",
          "label": "Verificación de estado TC’s"
        },
        {
          "id": "item_025",
          "type": "verificacion",
          "label": "Verificar estado de mufas"
        },
        {
          "id": "item_026",
          "type": "verificacion",
          "label": "Realizar limpieza de piso"
        }
      ]
    },
    {
      "id": "x3a_sintonia",
      "title": "3a sintonía",
      "items": [
        {
          "id": "item_027",
          "type": "verificacion",
          "label": "3a sintonía · unidades capacitivas: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_028",
          "type": "verificacion",
          "label": "3a sintonía · unidades capacitivas: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_029",
          "type": "verificacion",
          "label": "3a sintonía · unidades inductivas: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_030",
          "type": "verificacion",
          "label": "3a sintonía · unidades inductivas: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_031",
          "type": "verificacion",
          "label": "3a sintonía · unidades resistivas: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_032",
          "type": "verificacion",
          "label": "3a sintonía · unidades resistivas: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        }
      ]
    },
    {
      "id": "x5a_sintonia",
      "title": "5a sintonía",
      "items": [
        {
          "id": "item_033",
          "type": "verificacion",
          "label": "5a sintonía · unidades capacitivas: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_034",
          "type": "verificacion",
          "label": "5a sintonía · unidades capacitivas: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_035",
          "type": "verificacion",
          "label": "5a sintonía · unidades inductivas: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_036",
          "type": "verificacion",
          "label": "5a sintonía · unidades inductivas: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_037",
          "type": "verificacion",
          "label": "5a sintonía · unidades resistivas: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_038",
          "type": "verificacion",
          "label": "5a sintonía · unidades resistivas: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        }
      ]
    },
    {
      "id": "x7a_sintonia",
      "title": "7a sintonía",
      "items": [
        {
          "id": "item_039",
          "type": "verificacion",
          "label": "7a sintonía · unidades capacitivas: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_040",
          "type": "verificacion",
          "label": "7a sintonía · unidades capacitivas: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_041",
          "type": "verificacion",
          "label": "7a sintonía · unidades inductivas: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_042",
          "type": "verificacion",
          "label": "7a sintonía · unidades inductivas: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_043",
          "type": "verificacion",
          "label": "7a sintonía · unidades resistivas: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_044",
          "type": "verificacion",
          "label": "7a sintonía · unidades resistivas: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        }
      ]
    },
    {
      "id": "x11a_sintonia",
      "title": "11a sintonía",
      "items": [
        {
          "id": "item_045",
          "type": "verificacion",
          "label": "11a sintonía · unidades capacitivas: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_046",
          "type": "verificacion",
          "label": "11a sintonía · unidades capacitivas: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_047",
          "type": "verificacion",
          "label": "11a sintonía · unidades inductivas: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_048",
          "type": "verificacion",
          "label": "11a sintonía · unidades inductivas: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_049",
          "type": "verificacion",
          "label": "11a sintonía · unidades resistivas: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_050",
          "type": "verificacion",
          "label": "11a sintonía · unidades resistivas: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        }
      ]
    },
    {
      "id": "x13a_sintonia",
      "title": "13a sintonía",
      "items": [
        {
          "id": "item_051",
          "type": "verificacion",
          "label": "13a sintonía · unidades capacitivas: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_052",
          "type": "verificacion",
          "label": "13a sintonía · unidades capacitivas: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_053",
          "type": "verificacion",
          "label": "13a sintonía · unidades inductivas: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_054",
          "type": "verificacion",
          "label": "13a sintonía · unidades inductivas: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_055",
          "type": "verificacion",
          "label": "13a sintonía · unidades resistivas: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_056",
          "type": "verificacion",
          "label": "13a sintonía · unidades resistivas: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        }
      ]
    }
  ],
  "nomenclature": "RL: REALIZADO / NR: NO REALIZADO / ML: MALO / BN: BUENO / RMP: REEMPLAZADO (Indicar motivos en observaciones) / NT: NO TIENE",
  "estados": [
    "RL",
    "NR",
    "BN",
    "ML",
    "RMP",
    "NT"
  ],
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia, además realizar set fotográfico con el antes y después de la Mantención. Filtro de armónicos 120HF001."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'mant_filtro_chancado' and wm.code = 'mantenimiento_programado'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- MANT-13 · EST-ELEC-MANT-MLP-BBOSCH-13 · Mantención Filtro Armónico Planta 23kV (149 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Mantención Filtro Armónico Planta 23kV",
  "meta": {
    "norma": "EST-ELEC-MANT-MLP-BBOSCH-13",
    "revision": "Junio 2026",
    "titulo": "Mantención Filtro Armónico Planta 23kV"
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
          "label": "Realizar Limpieza y reapriete a desconectadores"
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Realizar Limpieza y reapriete puesta a tierra."
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Realizar limpieza y reapriete a inductores."
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Revisar estado de pintura de inductores"
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Realizar limpieza y reapriete de capacitores."
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Revisar estado de pintura de capacitores."
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Revisar fuga en los capacitores"
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Realizar limpieza y reapriete a resistores"
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Revisar estado de pintura de resistores"
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Realizar Limpieza y reapriete a aisladores"
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Realizar limpieza de piso"
        }
      ]
    },
    {
      "id": "filtro_de_armonicos_740hf001",
      "title": "Filtro de Armónicos 740HF001",
      "items": [
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Capacitivas · 740HF001-1XC1: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Capacitivas · 740HF001-1XC1: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Inductivas · 740HF001-1XL1: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Inductivas · 740HF001-1XL1: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Inductivas · 740HF001-1XL2: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Inductivas · 740HF001-1XL2: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Inductivas · 740HF001-1XL3: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Inductivas · 740HF001-1XL3: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_020",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Resistivas · 740HF001-1XR1: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_021",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Resistivas · 740HF001-1XR1: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_022",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Resistivas · 740HF001-1XR2: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_023",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Resistivas · 740HF001-1XR2: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_024",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Resistivas · 740HF001-1XR3: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_025",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Resistivas · 740HF001-1XR3: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_026",
          "type": "verificacion",
          "label": "9na Sintonía · Unidades Capacitivas · 740HF001-2XC1: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_027",
          "type": "verificacion",
          "label": "9na Sintonía · Unidades Capacitivas · 740HF001-2XC1: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_028",
          "type": "verificacion",
          "label": "9na Sintonía · Unidades Inductivas · 740HF001-2XL1: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_029",
          "type": "verificacion",
          "label": "9na Sintonía · Unidades Inductivas · 740HF001-2XL1: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_030",
          "type": "verificacion",
          "label": "9na Sintonía · Unidades Inductivas · 740HF001-2XL2: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_031",
          "type": "verificacion",
          "label": "9na Sintonía · Unidades Inductivas · 740HF001-2XL2: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_032",
          "type": "verificacion",
          "label": "9na Sintonía · Unidades Inductivas · 740HF001-2XL3: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_033",
          "type": "verificacion",
          "label": "9na Sintonía · Unidades Inductivas · 740HF001-2XL3: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_034",
          "type": "verificacion",
          "label": "9na Sintonía · Unidades Resistivas · 740HF001-2XR1: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_035",
          "type": "verificacion",
          "label": "9na Sintonía · Unidades Resistivas · 740HF001-2XR1: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_036",
          "type": "verificacion",
          "label": "9na Sintonía · Unidades Resistivas · 740HF001-2XR2: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_037",
          "type": "verificacion",
          "label": "9na Sintonía · Unidades Resistivas · 740HF001-2XR2: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_038",
          "type": "verificacion",
          "label": "9na Sintonía · Unidades Resistivas · 740HF001-2XR3: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_039",
          "type": "verificacion",
          "label": "9na Sintonía · Unidades Resistivas · 740HF001-2XR3: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_040",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Capacitivas · 740HF001-3C1: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_041",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Capacitivas · 740HF001-3C1: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_042",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Capacitivas · 740HF001-3C2: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_043",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Capacitivas · 740HF001-3C2: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_044",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Capacitivas · 740HF001-3C3: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_045",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Capacitivas · 740HF001-3C3: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_046",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Inductivas · 740HF001-3L1: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_047",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Inductivas · 740HF001-3L1: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_048",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Inductivas · 740HF001-3L2: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_049",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Inductivas · 740HF001-3L2: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_050",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Inductivas · 740HF001-3L3: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_051",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Inductivas · 740HF001-3L3: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_052",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Resistivas · 740HF001-3: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_053",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Resistivas · 740HF001-3: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        }
      ]
    },
    {
      "id": "filtro_de_armonicos_740hf002",
      "title": "Filtro de Armónicos 740HF002",
      "items": [
        {
          "id": "item_054",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Capacitivas · 740HF002-1XC1: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_055",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Capacitivas · 740HF002-1XC1: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_056",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Inductivas · 740HF002-1XL1: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_057",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Inductivas · 740HF002-1XL1: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_058",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Inductivas · 740HF002-1XL2: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_059",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Inductivas · 740HF002-1XL2: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_060",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Inductivas · 740HF002-1XL3: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_061",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Inductivas · 740HF002-1XL3: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_062",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Resistivas · 740HF002-1XR1: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_063",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Resistivas · 740HF002-1XR1: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_064",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Resistivas · 740HF002-1XR2: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_065",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Resistivas · 740HF002-1XR2: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_066",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Resistivas · 740HF002-1XR3: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_067",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Resistivas · 740HF002-1XR3: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_068",
          "type": "verificacion",
          "label": "9na Sintonía · Unidades Capacitivas · 740HF002-2XC1: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_069",
          "type": "verificacion",
          "label": "9na Sintonía · Unidades Capacitivas · 740HF002-2XC1: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_070",
          "type": "verificacion",
          "label": "9na Sintonía · Unidades Inductivas · 740HF002-2XL1: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_071",
          "type": "verificacion",
          "label": "9na Sintonía · Unidades Inductivas · 740HF002-2XL1: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_072",
          "type": "verificacion",
          "label": "9na Sintonía · Unidades Inductivas · 740HF002-2XL2: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_073",
          "type": "verificacion",
          "label": "9na Sintonía · Unidades Inductivas · 740HF002-2XL2: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_074",
          "type": "verificacion",
          "label": "9na Sintonía · Unidades Inductivas · 740HF002-2XL3: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_075",
          "type": "verificacion",
          "label": "9na Sintonía · Unidades Inductivas · 740HF002-2XL3: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_076",
          "type": "verificacion",
          "label": "9na Sintonía · Unidades Resistivas · 740HF002-2XR1: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_077",
          "type": "verificacion",
          "label": "9na Sintonía · Unidades Resistivas · 740HF002-2XR1: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_078",
          "type": "verificacion",
          "label": "9na Sintonía · Unidades Resistivas · 740HF002-2XR2: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_079",
          "type": "verificacion",
          "label": "9na Sintonía · Unidades Resistivas · 740HF002-2XR2: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_080",
          "type": "verificacion",
          "label": "9na Sintonía · Unidades Resistivas · 740HF002-2XR3: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_081",
          "type": "verificacion",
          "label": "9na Sintonía · Unidades Resistivas · 740HF002-2XR3: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_082",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Capacitivas · 740HF002-3C1: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_083",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Capacitivas · 740HF002-3C1: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_084",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Capacitivas · 740HF002-3C2: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_085",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Capacitivas · 740HF002-3C2: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_086",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Capacitivas · 740HF002-3C3: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_087",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Capacitivas · 740HF002-3C3: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_088",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Inductivas · 740HF002-3L1: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_089",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Inductivas · 740HF002-3L1: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_090",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Inductivas · 740HF002-3L2: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_091",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Inductivas · 740HF002-3L2: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_092",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Inductivas · 740HF002-3L3: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_093",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Inductivas · 740HF002-3L3: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_094",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Resistivas · 740HF002-3: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_095",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Resistivas · 740HF002-3: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        }
      ]
    },
    {
      "id": "filtro_de_armonicos_740hf003",
      "title": "Filtro de Armónicos 740HF003",
      "items": [
        {
          "id": "item_096",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Capacitivas · 740HF003-1-XC-A: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_097",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Capacitivas · 740HF003-1-XC-A: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_098",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Capacitivas · 740HF003-1-XC-B: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_099",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Capacitivas · 740HF003-1-XC-B: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_100",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Capacitivas · 740HF003-1-XC-C: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_101",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Capacitivas · 740HF003-1-XC-C: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_102",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Inductivas · 740HF003-1XLA: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_103",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Inductivas · 740HF003-1XLA: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_104",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Inductivas · 740HF003-1XLB: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_105",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Inductivas · 740HF003-1XLB: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_106",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Inductivas · 740HF003-1XLC: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_107",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Inductivas · 740HF003-1XLC: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_108",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Resistivas · 740HF001-1-RD-A: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_109",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Resistivas · 740HF001-1-RD-A: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_110",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Resistivas · 740HF001-1-RD-B: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_111",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Resistivas · 740HF001-1-RD-B: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_112",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Resistivas · 740HF001-1-RD-C: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_113",
          "type": "verificacion",
          "label": "5ta Sintonía · Unidades Resistivas · 740HF001-1-RD-C: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_114",
          "type": "verificacion",
          "label": "7th Sintonía · Unidades Capacitivas · 740HF003-2-XC-A: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_115",
          "type": "verificacion",
          "label": "7th Sintonía · Unidades Capacitivas · 740HF003-2-XC-A: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_116",
          "type": "verificacion",
          "label": "7th Sintonía · Unidades Capacitivas · 740HF003-2-XC-B: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_117",
          "type": "verificacion",
          "label": "7th Sintonía · Unidades Capacitivas · 740HF003-2-XC-B: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_118",
          "type": "verificacion",
          "label": "7th Sintonía · Unidades Capacitivas · 740HF003-2-XC-C: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_119",
          "type": "verificacion",
          "label": "7th Sintonía · Unidades Capacitivas · 740HF003-2-XC-C: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_120",
          "type": "verificacion",
          "label": "7th Sintonía · Unidades Inductivas · 740HF003-2-XLA: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_121",
          "type": "verificacion",
          "label": "7th Sintonía · Unidades Inductivas · 740HF003-2-XLA: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_122",
          "type": "verificacion",
          "label": "7th Sintonía · Unidades Inductivas · 740HF003-2-XLB: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_123",
          "type": "verificacion",
          "label": "7th Sintonía · Unidades Inductivas · 740HF003-2-XLB: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_124",
          "type": "verificacion",
          "label": "7th Sintonía · Unidades Inductivas · 740HF003-2-XLC: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_125",
          "type": "verificacion",
          "label": "7th Sintonía · Unidades Inductivas · 740HF003-2-XLC: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_126",
          "type": "verificacion",
          "label": "7th Sintonía · Unidades Resistivas · 740HF001-2-RD-A: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_127",
          "type": "verificacion",
          "label": "7th Sintonía · Unidades Resistivas · 740HF001-2-RD-A: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_128",
          "type": "verificacion",
          "label": "7th Sintonía · Unidades Resistivas · 740HF001-2-RD-B: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_129",
          "type": "verificacion",
          "label": "7th Sintonía · Unidades Resistivas · 740HF001-2-RD-B: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_130",
          "type": "verificacion",
          "label": "7th Sintonía · Unidades Resistivas · 740HF001-2-RD-C: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_131",
          "type": "verificacion",
          "label": "7th Sintonía · Unidades Resistivas · 740HF001-2-RD-C: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_132",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Capacitivas · 740HF003-3-XC-A: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_133",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Capacitivas · 740HF003-3-XC-A: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_134",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Capacitivas · 740HF003-3-XC-B: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_135",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Capacitivas · 740HF003-3-XC-B: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_136",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Capacitivas · 740HF003-3-XC-C: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_137",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Capacitivas · 740HF003-3-XC-C: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_138",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Inductivas · 740HF003-3-XLA: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_139",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Inductivas · 740HF003-3-XLA: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_140",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Inductivas · 740HF003-3-XLB: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_141",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Inductivas · 740HF003-3-XLB: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_142",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Inductivas · 740HF003-3-XLC: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_143",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Inductivas · 740HF003-3-XLC: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_144",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Resistivas · 740HF001-3-RD-A: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_145",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Resistivas · 740HF001-3-RD-A: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_146",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Resistivas · 740HF001-3-RD-B: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_147",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Resistivas · 740HF001-3-RD-B: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_148",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Resistivas · 740HF001-3-RD-C: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_149",
          "type": "verificacion",
          "label": "11th Sintonía · Unidades Resistivas · 740HF001-3-RD-C: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        }
      ]
    }
  ],
  "nomenclature": "RL: REALIZADO / NR: NO REALIZADO / ML: MALO / BN: BUENO / RMP: REEMPLAZADO (Indicar motivos en observaciones) / NT: NO TIENE",
  "estados": [
    "RL",
    "NR",
    "BN",
    "ML",
    "RMP",
    "NT"
  ],
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia, además realizar set fotográfico con el antes y después de la Mantención."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'mant_filtro_planta' and wm.code = 'mantenimiento_programado'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- MANT-14 · EST-ELEC-MANT-MLP-BBOSCH-14 · Mantención Filtro Armónico Puerto Punta Chungo (47 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Mantención Filtro Armónico Puerto Punta Chungo",
  "meta": {
    "norma": "EST-ELEC-MANT-MLP-BBOSCH-14",
    "revision": "Junio 2026",
    "titulo": "Mantención Filtro Armónico Puerto Punta Chungo"
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
          "label": "Realizar Limpieza y reapriete a desconectadores"
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Realizar Limpieza y reapriete puesta a tierra."
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Realizar limpieza y reapriete a inductores."
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Revisar estado de pintura de inductores"
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Realizar limpieza y reapriete de capacitores."
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Revisar estado de pintura de capacitores."
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Revisar fuga en los capacitores"
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Realizar limpieza y reapriete a resistores"
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Revisar estado de pintura de resistores"
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Realizar Limpieza y reapriete a aisladores"
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Realizar limpieza de piso"
        }
      ]
    },
    {
      "id": "filtro_de_armonicos_560hf001",
      "title": "Filtro de Armónicos 560HF001",
      "items": [
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 0,4 MVAR · Unidades Capacitivas · 560HF001-1XCA: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 0,4 MVAR · Unidades Capacitivas · 560HF001-1XCA: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 0,4 MVAR · Unidades Capacitivas · 560HF001-1XCB: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 0,4 MVAR · Unidades Capacitivas · 560HF001-1XCB: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 0,4 MVAR · Unidades Capacitivas · 560HF001-1XCC: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 0,4 MVAR · Unidades Capacitivas · 560HF001-1XCC: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 0,4 MVAR · Unidades Inductivas · 560HF001-1XLA: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 0,4 MVAR · Unidades Inductivas · 560HF001-1XLA: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_020",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 0,4 MVAR · Unidades Inductivas · 560HF001-1XLB: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_021",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 0,4 MVAR · Unidades Inductivas · 560HF001-1XLB: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_022",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 0,4 MVAR · Unidades Inductivas · 560HF001-1XLC: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_023",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 0,4 MVAR · Unidades Inductivas · 560HF001-1XLC: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_024",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 0,4 MVAR · Unidades Resistivas · 560HF001-1RDA: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_025",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 0,4 MVAR · Unidades Resistivas · 560HF001-1RDA: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_026",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 0,4 MVAR · Unidades Resistivas · 560HF001-1RDB: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_027",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 0,4 MVAR · Unidades Resistivas · 560HF001-1RDB: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_028",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 0,4 MVAR · Unidades Resistivas · 560HF001-1RDC: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_029",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 0,4 MVAR · Unidades Resistivas · 560HF001-1RDC: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_030",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 1 MVAR · Unidades Capacitivas · 560HF001-2XCA: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_031",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 1 MVAR · Unidades Capacitivas · 560HF001-2XCA: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_032",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 1 MVAR · Unidades Capacitivas · 560HF001-2XCB: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_033",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 1 MVAR · Unidades Capacitivas · 560HF001-2XCB: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_034",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 1 MVAR · Unidades Capacitivas · 560HF001-2XCC: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_035",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 1 MVAR · Unidades Capacitivas · 560HF001-2XCC: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_036",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 1 MVAR · Unidades Inductivas · 560HF001-2XLA: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_037",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 1 MVAR · Unidades Inductivas · 560HF001-2XLA: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_038",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 1 MVAR · Unidades Inductivas · 560HF001-2XLB: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_039",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 1 MVAR · Unidades Inductivas · 560HF001-2XLB: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_040",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 1 MVAR · Unidades Inductivas · 560HF001-2XLC: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_041",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 1 MVAR · Unidades Inductivas · 560HF001-2XLC: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_042",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 1 MVAR · Unidades Resistivas · 560HF001-2RDA: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_043",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 1 MVAR · Unidades Resistivas · 560HF001-2RDA: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_044",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 1 MVAR · Unidades Resistivas · 560HF001-2RDB: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_045",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 1 MVAR · Unidades Resistivas · 560HF001-2RDB: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        },
        {
          "id": "item_046",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 1 MVAR · Unidades Resistivas · 560HF001-2RDC: estado del componente",
          "estados": [
            "BN",
            "ML"
          ]
        },
        {
          "id": "item_047",
          "type": "verificacion",
          "label": "5ta Sintonía Etapa 1 MVAR · Unidades Resistivas · 560HF001-2RDC: ¿se realizó mantención?",
          "estados": [
            "SI",
            "NO"
          ]
        }
      ]
    }
  ],
  "nomenclature": "RL: REALIZADO / NR: NO REALIZADO / ML: MALO / BN: BUENO / RMP: REEMPLAZADO (Indicar motivos en observaciones) / NT: NO TIENE",
  "estados": [
    "RL",
    "NR",
    "BN",
    "ML",
    "RMP",
    "NT"
  ],
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia, además realizar set fotográfico con el antes y después de la Mantención."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'mant_filtro_ppch' and wm.code = 'mantenimiento_programado'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- MANT-15 · EST-ELEC-MANT-MLP-BBOSCH-15 · Mantención parrón de maniobra 23kV (19 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Mantención parrón de maniobra 23kV",
  "meta": {
    "norma": "EST-ELEC-MANT-MLP-BBOSCH-15",
    "revision": "Junio 2026",
    "titulo": "Mantención parrón de maniobra 23kV"
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
          "label": "Reapriete de crucetas."
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Reapriete de Vigas."
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Reapriete fijación de desconectadores."
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Reapriete conexiones de desconectadores."
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Reapriete conexiones GVR’s."
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Reapriete de conexiones Transformador."
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Reapriete conexiones enmalle."
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Reapriete de conexiones de puesta a tierra."
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Verificar sistema de comunicación (fibra óptica)"
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Limpieza de Bushing trafo TP y Control"
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Limpieza Bushing GVR’s."
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Limpieza de pararrayos."
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Limpieza de aisladores"
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Limpieza de tableros BT."
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Reapriete de conexiones tableros de BT."
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Número de operaciones de GVR 1",
          "unit": ""
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Número de operaciones de GVR 2",
          "unit": ""
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Número de operaciones de GVR 3",
          "unit": ""
        },
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "Número de operaciones de GVR 4",
          "unit": ""
        }
      ]
    }
  ],
  "nomenclature": "NT: NO TIENE / BN: BUENO / ML: MALO / NA: NO APLICA / NR: No Realizada (Indicar motivos en observaciones)",
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'mant_parrones' and wm.code = 'mantenimiento_programado'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- MANT-16 · EST-ELEC-MANT-MLP-BBOSCH-16 · Mantención transformadora de piso (38 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Mantención transformadora de piso",
  "meta": {
    "norma": "EST-ELEC-MANT-MLP-BBOSCH-16",
    "revision": "Junio 2026",
    "titulo": "Mantención transformadora de piso"
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
      "key": "marca",
      "label": "Marca",
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
      "key": "aceite",
      "label": "Aceite",
      "input": "text",
      "required": false
    },
    {
      "key": "volumen_de_aceite",
      "label": "Volumen de aceite",
      "input": "text",
      "required": false
    },
    {
      "key": "voltaje_primario",
      "label": "Voltaje primario",
      "input": "text",
      "required": false
    },
    {
      "key": "voltaje_secundario",
      "label": "Voltaje secundario",
      "input": "text",
      "required": false
    },
    {
      "key": "potencia",
      "label": "Potencia",
      "input": "text",
      "required": false
    },
    {
      "key": "conexion",
      "label": "Conexión",
      "input": "text",
      "required": false
    },
    {
      "key": "h_inicio",
      "label": "Hora y fecha de inicio",
      "input": "text"
    },
    {
      "key": "h_fin",
      "label": "Hora y fecha de término",
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
      "id": "celda_desconectadora_23_kv",
      "title": "Celda desconectadora 23 kV",
      "items": [
        {
          "id": "item_001",
          "type": "verificacion",
          "label": "Equipo cuenta con celda desconectadora."
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Realizar prueba de apertura y cierre de celda"
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Realizar limpieza interior y exterior de celda"
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Realizar limpieza y revisión de aisladores"
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Realizar limpieza y revisión de pararrayos"
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Realizar limpieza y revisión de mecanismo desconectador"
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Capacidad de los fusibles (Amp)",
          "unit": "A"
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Verificar estado de las mufas"
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Reapriete de conexión de puesta a tierra."
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Verificar descargas parciales en mufas y cables"
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Realizar reapriete de conexiones según la especificación del vendor adjunto en este estándar."
        }
      ]
    },
    {
      "id": "transformador_23_kv",
      "title": "Transformador 23 kV",
      "items": [
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Realizar limpieza y revisión de los bushinglado AT"
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Realizar limpieza de Aislador AT."
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Realizar Reapriete de conexiones en aisladores AT"
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Realizar limpieza y verificar estado de Aislador BT."
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Realizar reapriete de conexiones en aisladores BT"
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Realizar limpieza y verificar estado de pararrayos."
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Realizar reapriete de conexiones de pararrayos"
        },
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "Limpieza de desc. Fusible."
        },
        {
          "id": "item_020",
          "type": "verificacion",
          "label": "Verificar Estado de Relé presión súbita."
        },
        {
          "id": "item_021",
          "type": "verificacion",
          "label": "Nº posición cambiador de TAP"
        },
        {
          "id": "item_022",
          "type": "verificacion",
          "label": "Pruebas (operar) cambiador de tap."
        },
        {
          "id": "item_023",
          "type": "verificacion",
          "label": "Verificar fugas en flanges y empaquetadura de radiador"
        },
        {
          "id": "item_024",
          "type": "verificacion",
          "label": "Verificar válvulas de radiador que estén abierta."
        },
        {
          "id": "item_025",
          "type": "verificacion",
          "label": "Registrar temperatura mínima de aceite.",
          "unit": "°C"
        },
        {
          "id": "item_026",
          "type": "verificacion",
          "label": "Registrar temperatura máxima de aceite.",
          "unit": "°C"
        },
        {
          "id": "item_027",
          "type": "verificacion",
          "label": "Devolver aguja Arrastre a temperatura actual."
        },
        {
          "id": "item_028",
          "type": "verificacion",
          "label": "Registrar presión de vacío",
          "unit": ""
        },
        {
          "id": "item_029",
          "type": "verificacion",
          "label": "Realizar Limpieza generaldel equipo"
        },
        {
          "id": "item_030",
          "type": "verificacion",
          "label": "Verificar estado general de pintura"
        },
        {
          "id": "item_031",
          "type": "verificacion",
          "label": "Limpieza de tablero de control."
        },
        {
          "id": "item_032",
          "type": "verificacion",
          "label": "Reapriete de conexiones en tablero de control"
        },
        {
          "id": "item_033",
          "type": "verificacion",
          "label": "Realizar revisión de estado de interruptoresde control"
        },
        {
          "id": "item_034",
          "type": "verificacion",
          "label": "Realizar prueba de selector aut/man de ventiladores"
        },
        {
          "id": "item_035",
          "type": "verificacion",
          "label": "Revisión de fusibles que están instalados y en buen estado"
        },
        {
          "id": "item_036",
          "type": "verificacion",
          "label": "Realizar pruebas efectivas de instrumentos según los planos de control. Una vez terminada esta actividad, se deben reponer todas las alarmas y trip´s asociados."
        },
        {
          "id": "item_037",
          "type": "verificacion",
          "label": "Realizar medida de tensión Fase - Fase, Fase – Neutro y fase tierra."
        },
        {
          "id": "item_038",
          "type": "verificacion",
          "label": "Realizar reapriete de conexiones según la especificación del vendor adjunto en este estándar."
        }
      ]
    }
  ],
  "nomenclature": "SI / NO / RL: REALIZADO / NR: NO REALIZADO / BN: BUENO / ML: MALO (Indicar motivos en observaciones) / RMP: REEMPLAZADO (Indicar motivos en observaciones) / NT: NO TIENE",
  "estados": [
    "SI",
    "NO",
    "RL",
    "NR",
    "BN",
    "ML",
    "RMP",
    "NT"
  ],
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia, además realizar set fotográfico con el antes y después de la Mantención."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'mant_transformador_piso' and wm.code = 'mantenimiento_programado'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- MANT-17 · EST-ELEC-MANT-MLP-BBOSCH-17 · Mantención Transformador Poder Correas (27 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Mantención Transformador Poder Correas",
  "meta": {
    "norma": "EST-ELEC-MANT-MLP-BBOSCH-17",
    "revision": "Junio 2026",
    "titulo": "Mantención Transformador Poder Correas"
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
      "key": "marca",
      "label": "Marca",
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
      "key": "aceite",
      "label": "Aceite",
      "input": "text",
      "required": false
    },
    {
      "key": "volumen_de_aceite",
      "label": "Volumen de aceite",
      "input": "text",
      "required": false
    },
    {
      "key": "voltaje_primario",
      "label": "Voltaje primario",
      "input": "text",
      "required": false
    },
    {
      "key": "voltaje_secundario",
      "label": "Voltaje secundario",
      "input": "text",
      "required": false
    },
    {
      "key": "potencia",
      "label": "Potencia",
      "input": "text",
      "required": false
    },
    {
      "key": "conexion",
      "label": "Conexión",
      "input": "text",
      "required": false
    },
    {
      "key": "h_inicio",
      "label": "Hora y fecha de inicio",
      "input": "text"
    },
    {
      "key": "h_fin",
      "label": "Hora y fecha de término",
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
      "id": "actividades",
      "title": "Actividades",
      "items": [
        {
          "id": "item_001",
          "type": "verificacion",
          "label": "Revisar estado de los bushing"
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Limpieza de Aislador AT."
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Reapriete de conexiones en aisladores AT."
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Limpieza de Aislador BT."
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Reapriete de conexiones en aisladores BT"
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Verificar estado de las mufas AT."
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Verificar estado de las mufas BT."
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Reapriete de conexión de puesta a tierra."
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Verificar Estado de Relé presión súbita."
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Verificar estado de Relé Buscholz"
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Limpieza de tablero de control."
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Reapriete de conexiones en tablero de control"
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Nº posición cambiador de TAP’s"
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Pruebas (operar) cambiador de tap."
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Verificar flanches y empaquetadura de radiador"
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Válvulas de mariposa de radiador abierta."
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Anotar temperatura mínima de aceite.",
          "unit": "°C"
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Anotar temperatura máxima de aceite.",
          "unit": "°C"
        },
        {
          "id": "item_019",
          "type": "verificacion",
          "label": "Devolver aguja arrastre a temperatura actual."
        },
        {
          "id": "item_020",
          "type": "verificacion",
          "label": "Revisar estado vaso Silica gel, cambiar si amerita"
        },
        {
          "id": "item_021",
          "type": "verificacion",
          "label": "Limpieza general"
        },
        {
          "id": "item_022",
          "type": "verificacion",
          "label": "Estado general de pintura"
        },
        {
          "id": "item_023",
          "type": "verificacion",
          "label": "Si hay filtraciones en cuba o conservador, limpiar"
        },
        {
          "id": "item_024",
          "type": "verificacion",
          "label": "Retiro de los Bloqueos en AT. y BT."
        },
        {
          "id": "item_025",
          "type": "verificacion",
          "label": "Realizar Housekeeping y retiro de elementos mantención"
        },
        {
          "id": "item_026",
          "type": "verificacion",
          "label": "Realizar pruebas efectivas de instrumentos según los planos de control. Una vez terminada esta actividad, se deben reponer todas las alarmas y trip´s asociados."
        },
        {
          "id": "item_027",
          "type": "verificacion",
          "label": "Realizar reapriete de conexiones según la especificación del vendor adjunto en este estándar."
        }
      ]
    }
  ],
  "nomenclature": "SI / NO / RL: REALIZADO / NR: NO REALIZADO / BN: BUENO / ML: MALO (Indicar motivos en observaciones) / RMP: REEMPLAZADO (Indicar motivos en observaciones) / NT: NO TIENE",
  "estados": [
    "SI",
    "NO",
    "RL",
    "NR",
    "BN",
    "ML",
    "RMP",
    "NT"
  ],
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia, además realizar set fotográfico con el antes y después de la Mantención."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'mant_transformador_poder_correas' and wm.code = 'mantenimiento_programado'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

-- MANT-20 · EST-ELEC-MANT-MLP-BBOSCH-20 · Mantención Línea Aérea 23kV (18 ítems)
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Mantención Línea Aérea 23kV",
  "meta": {
    "norma": "EST-ELEC-MANT-MLP-BBOSCH-20",
    "revision": "Junio 2026",
    "titulo": "Mantención Línea Aérea 23kV"
  },
  "header": [
    {
      "key": "tag",
      "label": "Circuito / Tramo",
      "input": "text"
    },
    {
      "key": "ot",
      "label": "N° OT",
      "input": "text"
    },
    {
      "key": "desde_hasta",
      "label": "Desde/Hasta",
      "input": "text",
      "required": false
    },
    {
      "key": "fecha",
      "label": "Fecha",
      "input": "date"
    },
    {
      "key": "ubicacion",
      "label": "Ubicación / Sector",
      "input": "text",
      "required": false
    },
    {
      "key": "supervisor_linea",
      "label": "Supervisor",
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
      "id": "estructura",
      "title": "Estructura",
      "items": [
        {
          "id": "item_001",
          "type": "text",
          "label": "N° de estructura",
          "required": true,
          "multiline": false
        },
        {
          "id": "item_002",
          "type": "verificacion",
          "label": "Identificación"
        },
        {
          "id": "item_003",
          "type": "verificacion",
          "label": "Equipo Maniobra"
        },
        {
          "id": "item_004",
          "type": "verificacion",
          "label": "Limpieza de Aisladores"
        },
        {
          "id": "item_005",
          "type": "verificacion",
          "label": "Cable Guarda"
        },
        {
          "id": "item_006",
          "type": "verificacion",
          "label": "Estado del Poste"
        },
        {
          "id": "item_007",
          "type": "verificacion",
          "label": "Estado Tirantes"
        },
        {
          "id": "item_008",
          "type": "verificacion",
          "label": "Estado de Crucetas"
        },
        {
          "id": "item_009",
          "type": "verificacion",
          "label": "Estado de Puentes"
        },
        {
          "id": "item_010",
          "type": "verificacion",
          "label": "Acceso"
        },
        {
          "id": "item_011",
          "type": "verificacion",
          "label": "Templado de línea"
        },
        {
          "id": "item_012",
          "type": "verificacion",
          "label": "Limpieza equipo maniobra"
        },
        {
          "id": "item_013",
          "type": "verificacion",
          "label": "Capacidad hilo fusible"
        },
        {
          "id": "item_014",
          "type": "verificacion",
          "label": "Potencia S"
        },
        {
          "id": "item_015",
          "type": "verificacion",
          "label": "Estado de aislación"
        },
        {
          "id": "item_016",
          "type": "verificacion",
          "label": "Estado de pararrayos"
        },
        {
          "id": "item_017",
          "type": "verificacion",
          "label": "Estado desconectador fusible"
        },
        {
          "id": "item_018",
          "type": "verificacion",
          "label": "Estado de puesta a tierra"
        }
      ],
      "repetible": true
    }
  ],
  "nomenclature": "RL: REALIZADO / NR: NO REALIZADO / ML: MALO / BN: BUENO / RMP: REEMPLAZADO (Indicar motivos en observaciones) / NT: NO TIENE",
  "estados": [
    "RL",
    "NR",
    "BN",
    "ML",
    "RMP",
    "NT"
  ],
  "note": "En caso de encontrar observaciones críticas, adjuntar registro fotográfico con la referencia, además realizar set fotográfico con el antes y después de la Mantención. Si el tramo tiene más de una estructura, use «Agregar estructura» al final de la sección."
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'mant_linea_aerea' and wm.code = 'mantenimiento_programado'
on conflict (equipment_type_id, work_mode_id, version) do nothing;

