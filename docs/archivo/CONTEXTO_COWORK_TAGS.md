# Contexto para Cowork · Levantamiento de la organización de TAG de equipos

Documento autocontenido para trabajar fuera del repositorio. Fecha: 2026-10-30.
Lo marcado **confirmado** lo dijo el usuario; lo marcado **supuesto** sale de los nombres de los documentos o de inferencias y hay que validarlo.

## 1. Qué es el proyecto

**Inspecciones MLP**: aplicación web instalable (PWA) para que el personal técnico de BBOSCH realice **inspecciones de terreno en infraestructura eléctrica de Minera Los Pelambres (MLP)**, incluso sin señal, y para que supervisores y planificadores las revisen y firmen. Reemplaza formularios en papel/Word/Kizeo.

- Repositorio privado: `CNAVEA98/Inspecciones_BBOSCH` (rama `main`). Equipo de 2 personas.
- Stack: Next.js 16 (App Router, TypeScript), Tailwind, Supabase (Postgres, Auth, Storage, RLS), despliegue futuro en Vercel. Toda la interfaz en español (Chile), fechas en `America/Santiago`.
- Roles: **técnico** (llena formularios), **supervisor** (firma 1.ª etapa), **planificador** (firma 2.ª etapa y descarga el PDF), **administrador** (ve todo, gestiona catálogo, elimina). Turnos A/B solo como etiqueta. Las cuentas las crea el equipo de desarrollo (no hay autoregistro).
- Flujo de una inspección: el técnico elige **Área → Tipo de equipo → Modo** (Plan Matriz / Mantenimiento programado), completa el formulario (ítems BN/ML/NT/NA/NR, lecturas, fotos, firma del participante) y lo envía; queda en estado *Enviada* → *Firmada por supervisor* → *Aprobada* (o *Rechazada*). Si la rechazan, el técnico corrige y reenvía como inspección nueva.
- Estado: funciona con **un solo formato** (Transformador de piso × Plan Matriz, 29 ítems). Existen otros formatos como demostración, pero aún no están en la app.

## 2. El problema: el TAG hoy es texto libre

En la app actual el técnico **escribe el TAG a mano** en el campo «TAG Equipo» (ejemplo del campo: `740-XF-001`). Consecuencias:

- Un mismo equipo puede quedar escrito de varias formas (`740-XF-001`, `740XF001`, `740 xf 001`) y no se reconoce como el mismo.
- No hay lista de equipos válidos: se puede inspeccionar un TAG que no existe o escribirlo mal.
- La consulta «historial de este equipo» se hace por coincidencia exacta del texto, así que depende de que todos lo escriban igual.
- No se sabe a qué instalación, sistema o tipo de equipo pertenece un TAG hasta que alguien lo lee.

Los TAG guardados hoy en la base local son **datos de prueba** (`740-XF-001`, `MA-TP-012`, `PU-TP-003`, `333`, `PRUEBA-CORR-01`); no sirven como fuente.

## 3. Objetivo del levantamiento

Obtener el **registro maestro de equipos con su TAG**, ordenado según la estructura de la app, para cargarlo luego en una tabla de equipos y que el técnico **elija el TAG de una lista** (en vez de escribirlo) y la app muestre el historial por equipo.

Entregable pedido: **una planilla (Excel o CSV)** con una fila por equipo, y una hoja aparte de dudas y supuestos.

### Columnas de la planilla

| Columna | Contenido | Observación |
|---|---|---|
| Área | Chacay, Mina, El Mauro, Los Vilos | Ver sección 4 |
| Instalación | Tranque, Planta, STATCOM, Piuquenes, Sala 12, SE Móviles, Parrones, Tranque general, SE Los Vilos, Desalinizadora, PPCH | Ver sección 4 |
| Sistema | Media tensión 23 kV, Generación, Salas eléctricas, Filtros armónicos y STATCOM, Baja tensión y respaldo, Cables y canalizaciones | Propuesta sin confirmar |
| Tipo de equipo | Transformador de piso, Desconectador/seccionador, Banco de condensadores, Grupo generador, etc. | Nombre tal como aparece en el formato |
| Variante | Solo si el mismo tipo difiere según el sitio (p. ej. Banco de condensadores Mauro / PPCH) | Puede ir vacía |
| **TAG** | Código del equipo tal como figura en terreno/planos | Un TAG por fila, **sin repetidos** |
| Descripción | Nombre o función del equipo | Opcional pero útil |
| Ubicación específica | Sala, tablero, línea, etc. | Opcional |
| Datos de placa | Tensión, potencia, N.° de serie | Opcional; los formularios ya los piden |
| Formato aplicable | N.º del formato de inspección (01 a 41) | Ver sección 5 |
| Fuente | Documento, plano o persona de donde sale el dato | Obligatoria |
| Estado | **Confirmado** (visto en documento oficial) o **Supuesto** | Obligatoria |
| Observaciones | Dudas, duplicados, TAG ilegibles | |

### Reglas para los TAG

- **Un TAG = un equipo físico.** Si el mismo TAG aparece en dos ubicaciones, no resolver: marcarlo en la hoja de dudas.
- Copiar el TAG **exactamente como está en el documento**, y agregar una columna con la **forma normalizada propuesta** (mayúsculas, guiones consistentes). La regla de normalización la decide el usuario; no inventarla.
- No deducir ni «completar» TAG que no estén escritos en alguna fuente. Si un equipo no tiene TAG, dejarlo con la celda vacía y avisar.
- Separar lo que sea **un tramo o circuito sin TAG** (líneas aéreas, cables) de los equipos con TAG: esos casos no encajan en el modelo de «un equipo con TAG» (ver sección 6).

## 4. Estructura de ubicaciones (confirmado)

| Área (sector) | Instalaciones |
|---|---|
| Chacay (1600 m) | Tranque · Planta · STATCOM · Piuquenes |
| Mina (3200 m) | Sala 12 · SE Móviles · Parrones |
| El Mauro | Tranque general (única) |
| Los Vilos | SE Los Vilos · Desalinizadora · PPCH (las dos primeras, sin formatos por ahora) |

Chacay y Mina están en la misma zona pero a distinta altura: son sectores distintos y **no se fusionan**.

Árbol de la app: `Área → Instalación → Sistema → Tipo de equipo → Variante → Modo → TAG`. Regla: un nivel con una sola opción no se muestra.

## 5. Formatos de inspección (fuente principal para encontrar TAG)

Existen unos 40 formatos Word (`INSPECCIONES KIZEO`), numerados 01 a 41 (falta el 36; el 34 está duplicado en `.doc` y `.docx`). Las ubicaciones de abajo son **supuestas**, salvo la tabla de la sección 4.

| Instalación | Formatos (n.º) |
|---|---|
| Chacay → Planta | 30 y 39 (sala 740-ER-5002), 27 y 28 (filtros de molino 740-HF) |
| Chacay → STATCOM | 25 (filtro), 33 y 41 (salas), 37 (cerco) |
| Chacay → Piuquenes | 38 (carga de combustible) |
| Mina → Sala 12 | 08 (switchgear), 10 (presurizado), 04 (limpieza de salas) |
| Mina → SE Móviles | 06 |
| Mina → Parrones | 09 |
| El Mauro → Tranque general | 02 (banco de condensadores), 03 (pruebas de generadores), 14 (switchgear principal) |
| Los Vilos → PPCH | 29 (switchgear), 35 (banco de condensadores) |
| Chacay y Mina | 18 (pruebas de generadores) |

Transversales (a habilitar donde existan): 01 desconectador, 05 y 34 reconectadores, 07 y 12 transformadores, 11 líneas aéreas, 13 switchgear, 17 cargador y baterías, 20 celda, 21 cruce de caminos, 22 luminarias, 23 tablero BT, 26 UPS.

Sistemas propuestos (sin confirmar): Media tensión 23 kV (01, 02, 05, 06, 07, 08, 09, 11, 12, 13, 14, 20, 21, 29, 34, 35) · Generación (03, 16, 18, 24, 31, 32, 38, 40) · Salas eléctricas (04, 10, 30, 33, 39, 41) · Filtros armónicos y STATCOM (25, 27, 28, 37) · Baja tensión y respaldo (17, 22, 23, 26) · Cables y canalizaciones (15, 19).

## 6. Hallazgos y casos especiales a tener presentes

- Un mismo tipo de equipo en distintos sitios **no es el mismo formulario** (switchgear 23 kV: 32 % a 77 % de líneas iguales; pruebas de generadores 53 % a 69 %; banco de condensadores 17 %). Por eso existe el nivel «Variante».
- Hay **tres formas de inspección**: (a) un equipo con TAG (la mayoría); (b) **varios equipos en una visita** (pruebas de generadores 03, 18, 24, 40: el formato pide «cantidad de equipos» y un TAG por grupo); (c) **tramo o circuito sin TAG** (11, 15, 19).
- El formato 41 se titula «740-ER-5002» pero su archivo dice 741-ER-5002 (revisar cuál es el correcto).
- Los códigos de los TAG que aparecen en nombres de formatos (`740-ER-5002`, `740-HF`) sugieren que el prefijo numérico identifica una zona o área de planta. **Es un supuesto**: confirmar con el usuario antes de usarlo como regla.

## 7. Decisiones abiertas (el usuario debe responderlas)

1. Formato 40 «Puerto-Mauro»: ¿va en El Mauro o en Los Vilos → PPCH?
2. STMG (formatos 15 túnel de cables y 04 salas 23 kV): ¿a qué instalación pertenece? (supuesto: Mina)
3. Generadores sueltos (16, 24, 31, 32, 38): ¿en qué instalaciones existen y cuál de los cuatro formatos se usa en cada una?
4. Modo «Plan Matriz» vs «Mantenimiento programado»: ¿mismo formulario o distinto?
5. ¿Sirven los 6 sistemas o se agrupa distinto (p. ej. separar transformadores de maniobra y protección)?
6. ¿Cuál es la **fuente oficial de TAG** (listado SAP, planos, lista de equipos de MLP)? Es la que debe mandar sobre los documentos Word.
7. ¿Hay una convención de TAG de MLP que deba respetarse para normalizar (prefijo, tipo, correlativo)?

## 8. Qué NO hacer

- No inventar TAG, ubicaciones ni tipos de equipo: si no está en una fuente, va como **Supuesto** o se deja en la hoja de dudas.
- No fusionar Chacay con Mina.
- No modificar los formatos originales; trabajar sobre copias.
- No incluir datos confidenciales ajenos al levantamiento.

## 9. Qué debe adjuntar el usuario a Cowork

- Los formatos Word 01 a 41 (carpeta `INSPECCIONES KIZEO`).
- Cualquier listado de equipos de MLP o BBOSCH (SAP, Excel, planos unifilares).
- Este documento.

## 10. Cómo se usará el resultado en la app (para dimensionar la planilla)

Cambios previstos en la base de datos (aún no implementados): `areas.parent_id` (Área → Instalación), tabla de sistemas, disponibilidad instalación × tipo de equipo, variante en las plantillas y **una tabla de equipos con TAG por instalación**. La planilla de este levantamiento alimentará esa última tabla. El técnico pasará de escribir el TAG a elegirlo de una lista filtrada por la instalación y el tipo de equipo que ya seleccionó.
