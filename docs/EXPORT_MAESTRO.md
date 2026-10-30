# Export del Maestro de TAG

El selector de TAG de la app lee `src/data/maestro-tags.json`, generado desde `Maestro_TAGs_MLP.xlsx`.
El `.xlsx` es **solo de lectura**: el script nunca lo modifica. El JSON se versiona en el repositorio.

## Regenerar

Requiere **Python 3.10 o superior** y **openpyxl** (probado con Python 3.14 y openpyxl 3.1.5). `openpyxl` es solo
para este script: no es una dependencia de la app ni de `package.json`.

```bash
pip install openpyxl
python scripts/export-maestro.py                       # lee C:\Proyectos\Bases de datos generales\Maestro_TAGs_MLP.xlsx
python scripts/export-maestro.py ruta\a\otra-copia.xlsx
```

Genera `src/data/maestro-tags.json` y `docs/MAPEO_ZONA_AREA.md` (tabla Zona/Instalación → área y sector, para revisar).
Al terminar imprime los conteos por estado y las discrepancias entre la hoja y el color; deben ser 0.

## Qué contiene cada equipo

| Campo | Origen |
|---|---|
| `zona`, `tipoEquipo`, `descripcion` | Hoja «Maestro», tal cual |
| `tag`, `tagFuente` | TAG **normalizado** con guiones (`740XF001` → `740-XF-001`); `tagFuente` guarda el original solo si cambió. La búsqueda encuentra ambos |
| `nombre`, `instalacion` | Hoja «Maestro» **sin** los paréntesis que no son parte del nombre (ver abajo) |
| `datos`, `nota` | Lo que se sacó de esos paréntesis: datos de placa (`5,0 / 6,5 MVA`, `N° DE SERIE: …`) y aclaraciones de alcance (`SOLO MUESTRAS DE ACEITE`) |
| `designador` | Segundo bloque del TAG (`740-XF-001`, `740XF001`, `320ML001XF4`, `740SG001 / CUB-52-10` → `XF`, `XF`, `XF`, `SG`). `null` si no se reconoce (77 TAG, p. ej. `380VCP-W32 52-10`, `52-E1`) |
| `area`, `sector` | Reglas del script (`AREA_POR_ZONA`, `sector_de`); ver `docs/MAPEO_ZONA_AREA.md`. «Generadores y trafos elevadores» se resuelve por instalación; los GG van al sector «GG» de su área |
| `estado` | Hoja «Cambios y propuestas», columna «Tipo de cambio»: Propuesto → `propuesto`, Duplicado resuelto → `reasignado`, Por nombre (validar) → `por_validar`; sin fila → `oficial`. Respaldo: color de la celda TAG (FFD966, F4B183, 9DC3E6) |
| `tagOriginal` | Solo `reasignado`: columna «TAG original en fuente» de «Cambios y propuestas» |
| `tipoTrafo` | Solo XF: `piso` o `aereo` cuando el texto lo dice; `null` si no alcanza (no se infiere) |

`propuesto` y `reasignado` son **provisionales** (no existen en las bases del cliente); el selector los muestra con la
insignia «TAG provisional» y el registro guardado conserva el estado para que supervisión lo revise.

## Cuándo regenerar

Cada vez que cambie el Maestro. Revise el diff del JSON y de `docs/MAPEO_ZONA_AREA.md`, y registre el cambio en la bitácora.
Una zona o instalación nueva en el Maestro hace fallar el script (`KeyError`): agréguela a `AREA_POR_ZONA`.

## Reglas de normalización (en `scripts/export-maestro.py`)

**TAG** (`normalizar_tag`): prefijo numérico, designador y correlativo separados por guiones.
`740XF001` → `740-XF-001` · `4150PP003XF` → `4150-PP-003-XF` · `280XF281A` → `280-XF-281A` ·
`320ML001XF4` → `320-ML-001-XF-4` · `740SG001 / CUB-52-10` → `740-SG-001 / CUB-52-10`.
Si el TAG no tiene la forma «número + letras + número», **no se toca** (no se inventan prefijos):
celdas `380VCP-W32 52-n` (modelo de interruptor), posiciones `52-101` y `52-E1`, `XF-6001` (sin prefijo), `160PMAP`.
Si la normalización dejara dos TAG iguales, el script se detiene con error.

**Nombres** (`limpiar_nombre`): se quitan los paréntesis de alcance (`(SOLO …)`) y de datos de placa
(kVA, MVA, kW, kV, A, N.° de serie, «AÉREA/PISO … kVA»), que pasan a `nota` y `datos`. Los demás paréntesis
(`(PATIO DE CABLE)`, `(COM)`, `(AMPLIACION)`, alimentadores `(52-38)`) se dejan porque forman parte del nombre.
El tipo piso/aéreo del transformador se calcula con el texto original, antes de limpiar.
