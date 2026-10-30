-- Catálogo y plantilla. Es seguro ejecutarlo también en un proyecto Supabase remoto (no crea usuarios).
-- Las cuentas de prueba están en seed_usuarios_dev.sql (solo local).

-- ---------- Catálogo ----------
insert into public.areas (code, name, sort) values
  ('chacay', 'Chacay', 1),
  ('mina', 'Mina', 2),
  ('mauro', 'Mauro', 3),
  ('puerto', 'Puerto', 4),
  ('valle', 'Valle', 5)
on conflict (code) do nothing; -- Valle también lo agrega la migración 0011

insert into public.equipment_types (code, name, sort) values
  ('transformador_piso', 'Transformador de piso', 1),
  ('transformador_aereo', 'Transformador aéreo', 2),
  ('reconectador', 'Reconectador', 3),
  ('inspeccion_lineas', 'Inspección de líneas', 4),
  ('grupo_generador', 'Grupo generador', 5);

insert into public.work_modes (code, name, sort) values
  ('plan_matriz', 'Inspección según Plan Matriz', 1),
  ('mantenimiento_programado', 'Mantenimiento programado', 2);

-- ---------- Plantilla real: Transformador de piso x Plan Matriz (EST-ELEC-INSP-MLP-BBOSCH-12, abril 2024) ----------
-- Las demás combinaciones quedan en el catálogo sin plantilla.
insert into public.form_templates (equipment_type_id, work_mode_id, version, status, schema)
select et.id, wm.id, 1, 'published', $tpl$
{
  "title": "Transformador de piso - Inspección según Plan Matriz",
  "meta": {
    "norma": "EST-ELEC-INSP-MLP-BBOSCH-12",
    "revision": "Abril 2024",
    "titulo": "Inspección Transformador Piso"
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
      "key": "aceite_cant",
      "label": "Cantidad de aceite (L)",
      "input": "number"
    },
    {
      "key": "aceite_tipo",
      "label": "Tipo de aceite",
      "input": "text",
      "options": [
        "Mineral",
        "Silicona",
        "Vegetal"
      ]
    },
    {
      "key": "tension",
      "label": "Tensión AT y BT",
      "input": "text"
    },
    {
      "key": "potencia",
      "label": "Potencia",
      "input": "text"
    },
    {
      "key": "serie",
      "label": "N° Serie",
      "input": "text"
    },
    {
      "key": "conexion",
      "label": "Tipo de conexión",
      "input": "text",
      "options": [
        "Dyn1",
        "Dyn5",
        "Yzn1",
        "Yyn0"
      ]
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
  "readings": [
    {
      "label": "Aceite · cuba",
      "item": "item_02",
      "maxItem": "item_03",
      "limit": 65
    },
    {
      "label": "Aceite · enrollado",
      "item": "item_04",
      "maxItem": "item_05",
      "limit": 65
    },
    {
      "label": "Nivel conservador",
      "item": "item_07"
    },
    {
      "label": "Presión de aceite",
      "item": "item_08"
    },
    {
      "label": "Posición de tap",
      "item": "item_09"
    },
    {
      "label": "Calefactor tablero",
      "item": "item_17"
    }
  ],
  "sections": [
    {
      "id": "temperaturas",
      "title": "Temperaturas, nivel y presión",
      "items": [
        {
          "id": "item_01",
          "type": "verificacion",
          "label": "Transformador tiene su alimentador cerrado (celda u otro)."
        },
        {
          "id": "item_02",
          "type": "verificacion",
          "label": "Temperatura actual de aceite de la cuba.",
          "unit": "°C"
        },
        {
          "id": "item_03",
          "type": "verificacion",
          "label": "Temperatura máxima de aceite de la cuba (65 °C).",
          "unit": "°C"
        },
        {
          "id": "item_04",
          "type": "verificacion",
          "label": "Temperatura actual de aceite del enrollado.",
          "unit": "°C"
        },
        {
          "id": "item_05",
          "type": "verificacion",
          "label": "Temperatura máxima de aceite del enrollado (65 °C).",
          "unit": "°C"
        },
        {
          "id": "item_06",
          "type": "verificacion",
          "label": "Reposición aguja arrastre T° aceite del enrollado y cuba."
        },
        {
          "id": "item_07",
          "type": "verificacion",
          "label": "Nivel de aceite de conservador.",
          "unit": "%"
        },
        {
          "id": "item_08",
          "type": "verificacion",
          "label": "Presión de aceite.",
          "unit": ""
        },
        {
          "id": "item_09",
          "type": "verificacion",
          "label": "N° posición de tap de transformador.",
          "unit": "tap"
        }
      ]
    },
    {
      "id": "cuba_valvulas",
      "title": "Cuba, flanges y válvulas",
      "items": [
        {
          "id": "item_10",
          "type": "verificacion",
          "label": "Verificar estado de flanges, fugas."
        },
        {
          "id": "item_11",
          "type": "verificacion",
          "label": "Verificar estado de uniones estancas y costuras, fugas."
        },
        {
          "id": "item_12",
          "type": "verificacion",
          "label": "Verificar válvulas de radiador (cerradas o abiertas)."
        },
        {
          "id": "item_13",
          "type": "verificacion",
          "label": "Verificar válvulas de presión súbita (cerradas o abiertas)."
        },
        {
          "id": "item_14",
          "type": "verificacion",
          "label": "Verificar válvulas de cuba del trafo (cerradas o abiertas)."
        }
      ]
    },
    {
      "id": "ventilacion_tablero",
      "title": "Ventilación y tablero de control",
      "items": [
        {
          "id": "item_15",
          "type": "verificacion",
          "label": "Realizar prueba de ventiladores en manual."
        },
        {
          "id": "item_16",
          "type": "verificacion",
          "label": "Ventilador queda en posición automático."
        },
        {
          "id": "item_17",
          "type": "verificacion",
          "label": "Registrar la temperatura del calefactor de tablero de control.",
          "unit": "°C"
        },
        {
          "id": "item_18",
          "type": "verificacion",
          "label": "Verificar iluminación de tablero de control."
        },
        {
          "id": "item_19",
          "type": "verificacion",
          "label": "Verificar con multímetro fusibles en buen estado."
        },
        {
          "id": "item_20",
          "type": "verificacion",
          "label": "Relé 86 se encuentra con bandera negra."
        },
        {
          "id": "item_21",
          "type": "verificacion",
          "label": "Verificar estado de tablero de control, pintura, cierre y sello."
        }
      ]
    },
    {
      "id": "entorno",
      "title": "Pintura, limpieza y entorno",
      "items": [
        {
          "id": "item_22",
          "type": "verificacion",
          "label": "Verificar estado de pintura de equipo y señales de corrosión."
        },
        {
          "id": "item_23",
          "type": "verificacion",
          "label": "Verificar funcionamiento alumbrado emergencia si lo amerita."
        },
        {
          "id": "item_24",
          "type": "verificacion",
          "label": "Verificar limpieza en general del equipo."
        },
        {
          "id": "item_25",
          "type": "verificacion",
          "label": "Verificar manchas de aceite en el piso."
        },
        {
          "id": "item_26",
          "type": "verificacion",
          "label": "Cerco perimetral está en buenas condiciones."
        },
        {
          "id": "item_27",
          "type": "verificacion",
          "label": "Cerco perimetral está señalizado."
        },
        {
          "id": "item_28",
          "type": "verificacion",
          "label": "Existe sistema de amago incendio y está vigente."
        },
        {
          "id": "item_29",
          "type": "verificacion",
          "label": "Realizar desmalezado al interior del cerco o entorno."
        }
      ]
    }
  ]
}
$tpl$::jsonb
from public.equipment_types et, public.work_modes wm
where et.code = 'transformador_piso' and wm.code = 'plan_matriz';

