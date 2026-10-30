# Árbol de inspecciones · Inspecciones MLP

Estructura general para ordenar los ~40 formatos de `C:\Proyectos\INSPECCIONES KIZEO` (fuera del repo).
Estado: **propuesta en revisión**. Lo marcado «confirmado» lo dijo el usuario; lo marcado «supuesto» sale de los nombres de los documentos.

## Niveles

```
Área (sector)
 └─ Instalación            ← se salta sola si el área tiene una sola
     └─ Sistema            ← Media tensión 23 kV, Generación, Salas eléctricas, Filtros y STATCOM, Baja tensión y respaldo, Cables y canalizaciones
         └─ Tipo de equipo
             └─ Variante   ← solo si el mismo equipo difiere según el sitio (p. ej. Banco de condensadores: Mauro / PPCH)
                 └─ Modo   ← Plan Matriz / Mantenimiento programado
                     └─ Formulario → TAG o equipo concreto
```

Regla: **un nivel con una sola opción no se muestra** (El Mauro entra directo a «Tranque general»).
Un tipo de equipo se define una vez y se habilita en cada instalación donde exista (tabla de disponibilidad); así los formatos transversales no se duplican.

## Ubicaciones (confirmado)

| Área (sector) | Instalaciones |
|---|---|
| Chacay (1600 m) | Tranque · Planta · STATCOM · Piuquenes |
| Mina (3200 m) | Sala 12 · SE Móviles · Parrones |
| El Mauro | Tranque general (única: se entra directo) |
| Los Vilos | SE Los Vilos · Desalinizadora · PPCH (las dos primeras, sin formatos por ahora) |

Chacay y Mina están físicamente en la misma zona pero a distinta altura: son sectores distintos y no se fusionan.

## Formatos por instalación (supuesto, salvo lo indicado)

| Instalación | Formatos (n.º de origen) |
|---|---|
| Chacay → Planta | 30 y 39 (sala 740-ER-5002), 27 y 28 (filtros de molino 740-HF) |
| Chacay → STATCOM | 25 (filtro), 33 y 41 (salas), 37 (cerco) |
| Chacay → Piuquenes | 38 (carga de combustible) |
| Mina → Sala 12 | 08 (switchgear), 10 (presurizado), 04 (limpieza de salas) |
| Mina → SE Móviles | 06 |
| Mina → Parrones | 09 |
| El Mauro → Tranque general | 02 (banco de condensadores), 03 (pruebas de generadores), 14 (switchgear principal) |
| Los Vilos → PPCH | 29 (switchgear), 35 (banco de condensadores) |
| Chacay y Mina | 18 (pruebas de generadores «Chacay-Mina»: un formato habilitado en ambos sectores) |

Transversales, a habilitar donde existan: 01 desconectador, 05 y 34 reconectadores, 07 y 12 transformadores, 11 líneas aéreas,
13 switchgear, 17 cargador y baterías, 20 celda, 21 cruce de caminos, 22 luminarias, 23 tablero BT, 26 UPS.

## Sistemas (propuesta, sin confirmar)

| Sistema | Formatos |
|---|---|
| Media tensión 23 kV (16) | 01, 02, 05, 06, 07, 08, 09, 11, 12, 13, 14, 20, 21, 29, 34, 35 |
| Generación (8) | 03, 16, 18, 24, 31, 32, 38, 40 |
| Salas eléctricas (6) | 04, 10, 30, 33, 39, 41 |
| Filtros armónicos y STATCOM (4) | 25, 27, 28, 37 |
| Baja tensión y respaldo (4) | 17, 22, 23, 26 |
| Cables y canalizaciones (2) | 15, 19 |

## Hallazgos sobre los documentos

- Un mismo tipo de equipo en distintos sitios **no es el mismo formulario**: switchgear 23 kV 32 % a 77 % de líneas iguales; pruebas de generadores 53 % a 69 %; banco de condensadores 17 %. Por eso existe el nivel «Variante».
- Hay tres formas de inspección: un equipo con TAG (la mayoría), varios equipos en una visita (pruebas de generadores 03, 18, 24, 40) y tramo o circuito sin TAG (11, 15, 19). El esquema actual solo cubre la primera.
- Falta el n.º 36; el 34 está duplicado en `.doc` y `.docx`; el 41 se titula «740-ER-5002» pero su archivo dice 741-ER-5002.
- Los formatos 01 a 03 usan código `Bbosch` y el resto `STN`; falta definir el número BBOSCH definitivo de cada uno.
- Los formatos 16, 24, 31 y 32 son cuatro formatos distintos de grupo generador (6 % a 22 % iguales entre sí).

## Pendientes de decisión

1. Formato 40, «Puerto-Mauro»: ¿va en El Mauro o en Los Vilos → PPCH?
2. STMG (formatos 15 túnel de cables y 04 salas 23 kV): ¿a qué instalación pertenece? (supuesto: Mina)
3. Generadores sueltos (16, 24, 31, 32, 38): ¿en qué instalaciones existen y cuáles de los cuatro formatos se usan?
4. Modo «Plan Matriz» / «Mantenimiento programado»: ¿mismo formulario o distinto?
5. ¿Sirven los 6 sistemas o se agrupa distinto (p. ej. separar Transformadores de Maniobra y protección)?

## Cambios de base de datos previstos (migraciones nuevas; nada implementado todavía)

1. `areas.parent_id` (Área → Instalación), reutilizando la tabla existente.
2. Tabla `equipment_systems` y `equipment_types.system_id`.
3. Tabla de disponibilidad instalación × tipo de equipo.
4. `form_templates.variant`.
5. Más adelante: registro de equipos con TAG por instalación, y las formas «varios equipos» y «tramo o circuito».

## Orden de trabajo

1. Cerrar este árbol (en curso).
2. Migración de estructura, sin plantillas nuevas.
3. Selector del técnico con los niveles nuevos, probado con el único formato actual (Transformador de piso × Plan Matriz).
4. Transcribir formatos por sistema, empezando por Media tensión.
5. Formas especiales: varios equipos y tramo o circuito.
