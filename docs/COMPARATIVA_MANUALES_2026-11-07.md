# Comparativa: inspecciones manuales de terreno vs. formatos digitales (2026-11-07)

Fuente: carpeta `Desktop\Inspeciones manuales` de Cristóbal (14 PDF escaneados, 33 páginas, fechas sep–oct 2026; no están en el repo).
Se leyeron a mano (son imágenes) y se compararon con las plantillas de `supabase/seed_plantillas_*.sql`, el Maestro de TAG
(`src/data/maestro-tags.json`) y el filtro del menú (`src/lib/formatos/catalogo.ts` y `tags.ts`).
**Estado:** comparativa hecha y probada en la app **local** (Docker): las 13 inspecciones en papel (19 PDF, por los cubículos) se cargaron con `scripts/simular-manuales.mjs` y se generó su PDF digital (19/19 OK, folios INS-2026-000014 a 000032 en la base local). Lado a lado: `C:\Proyectos\simulacion-formatos\manuales-2026-11-07\comparativa.html` (fuera del repo). No se probó el menú con clics en pantalla ni en el teléfono.

## 1. Qué trae cada manual y a qué formato digital corresponde

| # | Archivo | TAG escrito | Formato digital | Observación |
|---|---|---|---|---|
| 1 | IEP_120ER106 | 120 ER 106 (TP1) | INSP-04 Limpieza salas STMG | En Maestro (mina, ER). Digital sí lo ofrece |
| 2 | IEP_120ER5001 | 120 ER 5001 (TP2) | INSP-04 | **TAG no está en el Maestro** (solo `0741-ER-5001`, chacay) |
| 3 | IEP_730GG017 | 730-GG-017 (Hotel Mina) | INSP-16 Grupo Generador | En Maestro (chacay, GG) |
| 4 | IEP_730GG018 | 730-GG-018 (Red incendio) | INSP-16 | Rev. marzo 2026 (la 017 dice abril 2024) |
| 5 | Insp. 370XF1480 | 370XF1480 | INSP-12 Transformador de piso | En Maestro (valle, piso). Rev. **junio 2026** vs digital abril 2024 |
| 6 | INSP. Carg&bat 560BC001-002 | 560 BC 001 y 002 | INSP-17 Cargador y banco de baterías | En Maestro (puerto). Rev. «Julio 16» |
| 7 | Insp. Parron 23Kv PPCH | 560-PM-562 | INSP-09 Parrones de maniobra | Ver hallazgo M3 |
| 8 | Insp. Seccionador23Kv Balsas 9 | 4330 SW 4007 | INSP-01 Seccionador | **TAG no está en el Maestro** |
| 9 | Insp. SG 23kv Est. Booster | 370 SG 1180 (cubículo 52-1) | INSP-13 Switchgear 23 kV | En Maestro (valle) |
| 10 | Inspección Switchgear 560SG562 | 560-SG-562 (cubículos 52-1 a 52-4) | INSP-13 o INSP-29 (PPCH) | Cada cubículo con su propia OT |
| 11 | Mtto Interruptor 52-1 ope. | «INT 52-1 / 530-XF-531» | INSP-13 | TAG escrito es de un transformador |
| 12 | INSP.-PRUEBA OP. 4260GE1000 | 4260GE1000 | INSP-16 (o INSP-03 Mauro) | Rev. 03 abril 2026, más ítems que el digital |
| 13 | Mant. GG Disipadora | 4260-**GG**-1000 | MANT-01 Generadores locales | Maestro tiene `4260-GE-1000`, no GG |
| 14 | Informe termográfico Los Vilos | — | (ninguno) | Informe FLIR de un tercero, no es un formato |

## 2. Hallazgos del menú (Área → Trabajo → Familia → Formato → TAG)

El menú filtra formatos por `areas` y los equipos por designador + área del Maestro (salvo el interruptor «todas las áreas»).

- **M1 · TAG fuera del Maestro (3 de 14).** `120ER5001`, `4330SW4007` y el interruptor de `INT 52-1 / 530-XF-531` no existen tal como se escribieron. El técnico tendría que usar «sin TAG» o proponer uno: conviene confirmar con MLP si son errores de tipeo o equipos faltantes (para 4330-SW-4007 el Maestro tiene 4330-SW-4003 y 4330-SW-4010; para 120-ER-5001 no hay equivalente en mina).
- **M2 · Designador mal escrito a mano (error de papel, no del digital).** El mismo generador figura como `4260GE1000` y `4260-GG-1000`; manda el Maestro: `4260-GE-1000`. En el digital el técnico **elige** el TAG de una lista filtrada por GG/GE/DG, así que el error no se puede repetir; solo afectaría a quien busque escribiendo «gg1000». Criterio acordado: el Maestro es la verdad; no se cambia nada.
- **M3 · Parrón de Puerto no sale en el menú.** `560-PM-562` es área *puerto* pero INSP-09 está limitado a *mina* (`areas: ["mina"]`). Con Área = Puerto el formato no aparece; con Área = Mina aparece pero el equipo queda filtrado (área ≠ mina) salvo que active «todas las áreas». Hay que decidir si INSP-09 debe aplicar también a Puerto (y Mauro: hay 4330-PM-xxxx).
- **M4 · Dos formatos para el mismo switchgear de PPCH.** El manual usó el genérico (INSP-13) para `560-SG-562`, pero existe INSP-29 (Switchgear PPCH) con horómetro por carro 52/01…52/05. En el menú de Puerto salen ambos: definir cuál usa el técnico (hoy el genérico exige una inspección por cubículo, como en el papel).
- **M5 · Formato de grupo generador ambiguo.** Para `4260-GE-1000` (Mauro) el menú ofrece INSP-03, INSP-16, INSP-24, etc. El manual usado es el «Inspección y Pruebas Grupo Generador Rev. 03 abril 2026», que no coincide exactamente con ninguno (ver C4).
- **M6 · Mantención de GG sin separar GG y GE.** MANT-01 acepta GG/GE/DG: bien. El problema es solo M2.

## 3. Diferencias de contenido (papel vs. digital)

**C1 · Revisiones de documento distintas.** El papel está más nuevo que el digital en: transformador de piso (Rev. junio 2026 vs abril 2024), grupo generador 018 (marzo 2026), pruebas GG 4260GE1000 (Rev. 03 abril 2026). Los switchgear en papel llevan el código `EST-ELEC-INSP-MLP-bbosch-14` mientras el digital genérico es `-13` (el `-14` es Tranque Mauro). Hay que fijar cuál es la versión vigente antes de digitalizar.

**C2 · «Selector Local/Remoto» (SG, ítem 7).** En papel se escribe «Local» o «Remoto»; en el digital es un ítem BN/ML/NT/NA/NR sin lugar para esa palabra. Cambiar a ítem con estados propios (`estados` por ítem existe en el esquema) o texto.

**C3 · Valores en ítems numéricos.** `Energía` (INSP-16, unidad kWh): en el papel de 730GG017 se escribió «380/220V» (un voltaje); el digital exige un número finito y rechazaría ese texto. Revisar qué se mide realmente (¿tensión de salida?). Igual con el nivel de estanque («90%»): la unidad no está declarada.

**C4 · INSP-16 (grupo generador) quedó atrás respecto al papel de Abril-2026.** El papel nuevo añade: horómetro **inicial y final**, energía **inicial y final**, **fecha de mantención de extintores** y fecha de extintor (digital: un horómetro, una energía, ninguna fecha). Tiene 32 ítems + observaciones vs 30 digitales.

**C5 · Horómetro y operaciones del switchgear.** En papel «( - / 556 )» (horómetro / operaciones, con el horómetro casi siempre vacío). El digital lo modela bien (`nameplate` horómetro + operaciones, opcional). Falta el campo **«Cubículo / Interruptor»** en la cabecera de INSP-13 (el papel lo tiene y cada cubículo lleva su OT: 4906910, 4906911, 4906920). Hoy dependería de elegir el TAG «560-SG-562 / 52-1».

**C6 · Cargador y banco de baterías (INSP-17).** El papel solo pide 4 mediciones y 10 ítems visuales («Operativo» = Sí/No; estado = «bueno»). El digital agrega: corriente de salida del cargador, signos de sulfatación y 8 indicadores del cargador. Más largo que la práctica de terreno; el técnico respondió «bueno» en vez de BN. «Operativo Sí/No» no existe como Sí/No en digital.

**C7 · Sala eléctrica (INSP-04).** El papel trae «Protocolo de Inspección y Limpieza Salas y Equipos» Rev. enero 2023 con 19 ítems, un ítem 20 (presurización sala 12), 21 observaciones y una **tabla SF6** por GIS (20 posiciones B11…+J14 × 7 días, en PSI) más temperatura interior/exterior y presión atmosférica. El digital tiene 21 ítems, una fecha de caducidad de extintor (no está en el papel) y SF6 como **una sola lectura** (cubículo + día + valor): no es repetible, así que las 20 posiciones × 7 días del papel no caben. Falta **presión atmosférica**; solo hay una temperatura (la plantilla dice «Temperatura de sala GIS»; el papel pide interior y exterior). En la prueba solo se pudo cargar la primera posición.

**C8 · Estados de mantención.** El papel de MANT usa `RL` (realizado), `BN`, `ML`, `RMP`, `SI/NO`, `NR`, `NT`. La plantilla digital declara la misma nomenclatura (campo `estados`): verificar en pantalla que RL aparezca y que se pueda mezclar BN y RL en el mismo formulario como en el papel. Además el papel lleva «Observaciones generales» al final; digital: confirmar que exista un campo de diagnóstico final.

**C9 · «Diagnóstico final / Consideraciones / Recomendaciones».** Todos los papeles terminan con «Observaciones generales» y «Consideraciones» (el de trafo dice «Recomendaciones»). Revisar si el digital tiene ambos campos en todos los formatos.

**C10 · Datos de cabecera del papel que el digital no siempre pide.** `Marca`, `N° Serie`, `Tensión`, `Cargo` del participante (Limiero, Electromecánico…), `Potencia`, `Cantidad de aceite`, `Tipo de conexión`. Varios sí existen (SG, trafo); `Cargo` de participantes y `Capacidad interruptor` no aparecen en todos.

**C11 · Firmas y supervisor.** El papel trae supervisor y planificador **preimpresos o escritos** (Alvaro Carmona, Juan Pablo Gómez…) y firma del encargado + «Firma/Fecha Recepción». El digital firma en dos etapas con cuentas; hay que confirmar cómo se muestra el nombre del supervisor/planificador en el PDF cuando el técnico no los escribe.

**C12 · Errores de llenado en papel que la app evitaría.** En `560SG562` quedaron en blanco hora de inicio, hora de término, supervisor y planificador; en varios, el «Planificador» está vacío o sin firma de recepción. El digital marca obligatorios los datos de cabecera.

## 3b. Qué mostró la prueba con los PDF digitales (19/19 generados)

- **P1 · Supervisor y planificador no aparecen por nombre.** El papel trae sus nombres (Álvaro Carmona, Juan Gómez…); el PDF digital solo dice «Pendiente de firma» hasta que firmen.
- **P2 · Notas informativas salen como «observación» en rojo/naranja.** «Local», «Remoto», «Nivel 90%», «Presión 0.8», el horómetro y las operaciones del interruptor usan el mismo recuadro que una falla. Confunde a quien lee el PDF.
- **P3 · Valores sin unidad no se pueden registrar.** «Presión de aceite» (trafo) y «Nivel de estanque» (generador) no tienen unidad, así que el número solo cabe como texto en observación; el resumen del PDF muestra «—» en Presión de aceite.
- **P4 · «NT» (no tiene) resta puntaje.** 730-GG-017 muestra «19 de 30 conformes» con 9 NT; en terreno NT es una respuesta correcta («el equipo no tiene ese componente»). Revisar si NT y NA deben salir del denominador (NA ya lo hace desde V1.1.1).
- **P5 · Hora de inicio/término vacías se imprimen como «—»** (el escaneo de `560SG562` también las dejó en blanco): el digital debería exigirlas.
- **P6 · Un switchgear de 5 cubículos = 5 inspecciones con 5 OT.** Calza con el papel (cada cubículo tiene su OT), pero el técnico tendría que repetir cabecera 5 veces. Evaluar «copiar cabecera».
- El seguimiento de hallazgos funcionó con el ML de 730-GG-017 (aparece «1 hallazgo, media, ítem 10») y RL se cuenta como conforme en la mantención.

## 3c. Auditoría del menú (Área → Formato → equipos; 1.073 equipos del Maestro × 60 formatos)

El filtro es: formato por `areas` (vacío = todas) y equipos por `designadores` + área elegida. Resultado:

1. **Transformadores:** INSP-07 (aéreos), INSP-12 (de piso), MANT-11 y MANT-16 muestran **todos los XF** del área elegida (350 en total; 189 en Chacay) y MANT-17 los 52 de Mina. El filtro **no usa** `tipoTrafo` (solo lo muestra como etiqueta): un formato de trafo aéreo ofrece trafos de piso y viceversa. Además 156 XF no tienen tipo, y bajo el designador XF hay 13 equipos que no son transformadores (CBTC, desconectadores, interruptores).
2. **Switchgear:** INSP-08 «Sala 12» y MANT-07/08/09 muestran los 48 SG de toda la mina, no los de su sala/estación. MANT-08 «Estaciones móviles» solo aparece en Mina (el SG del booster es de Valle). INSP-13 y INSP-14/29 (Mauro y PPCH) se solapan.
3. **Formatos visibles sin equipos en esa área (menú vacío):** INSP-15 Túnel STMG (Mina: 0; los 3 TU están en Chacay), INSP-01 y INSP-20 y MANT-18 en Mina (0 SW), INSP-22 luminarias solo en Chacay (2), INSP-26 UPS solo en Chacay y Mauro, MANT-14 Filtro PPCH (0 HF en Puerto), INSP-17/MANT-04/05 en Valle (0).
4. **Equipos sin ningún formato en su área:** PM (parrones) en Mauro (9), Puerto (1) y Chacay (1) porque INSP-09 y MANT-15 son solo Mina; ER (salas) en Mauro (5); CE cámaras eléctricas en Mina (14); CV (11) en Mina; ML (30) y PP (5) en Chacay; SEU/US/USS; CB (10); GR (5) en Mauro; HF en Mauro (1); ~40 designadores más con 1–4 equipos (lista completa en la salida de la auditoría).
5. **Formatos con `designadores` vacíos (INSP-10, 19, 37, 38):** son de «tramo»; deben usar el campo Tramo y no el selector de TAG. No verificado en pantalla.
6. **Generadores:** GG/GE/DG con formatos propios por área (INSP-03 Mauro, INSP-18 Chacay-Mina, INSP-40 Puerto-Mauro) más cuatro transversales (INSP-16, 24, 31, 32, MANT-01/02): el técnico ve 4 a 7 opciones para el mismo equipo; conviene definir cuál corresponde a cada uno.

## 4. Qué hacer (propuesta, por prioridad)

1. Confirmar con Cristóbal/MLP los TAG de M1 y decidir el alias GG/GE (M2): cambia el Maestro, no las plantillas.
2. Decidir las áreas de INSP-09 (M3) y cuál switchgear usa PPCH (M4): migración nueva en `supabase/migrations` (no editar las aplicadas) para `areas` en la tabla `formatos`.
3. Actualizar INSP-16 a la Rev. abril 2026 (C4) y trafo de piso a Rev. junio 2026 (C1): plantilla nueva (v3), con el parche de plantillas en el remoto y bitácora.
4. Ítem 7 del switchgear (C2), Energía (C3) y campo «Cubículo» (C5).
5. Revisar INSP-17 y la tabla SF6 de INSP-04 (C6, C7) con el equipo de terreno: ¿se quiere más corto o igual de largo?
6. Verificar en pantalla C8, C9 y C11 (necesitan la app corriendo).

## 5. Cómo repetir la prueba

`corepack pnpm supabase start` · `corepack pnpm dev` · `node scripts/simular-manuales.mjs` (usa TECNICO_A local; deja los PDF en `..\simulacion-formatos\manuales-AAAA-MM-DD`).
Supuestos al transcribir: el TAG `INT 52-1 / 530-XF-531` se cargó como `530-SG-1001 / 52-1`; `4260-GG-1000` como `4260-GE-1000`; `120ER5001` y `4330SW4007` como TAG «propuesto»; el seccionador Balsas 9 (papel de 19 ítems, distinto de INSP-01) se cargó por afinidad de texto; en `730GG017` la «Energía» «380/220V» se guardó como observación; el «RL» del parrón como NR. Iniciales poco legibles (p. ej. «R. Cautivo (AGG)») pueden estar mal leídas. Fotos y firma son sintéticas.
