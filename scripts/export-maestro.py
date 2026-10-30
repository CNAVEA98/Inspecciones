#!/usr/bin/env python3
"""Exporta el Maestro de TAG de MLP a JSON para la app (solo lectura del .xlsx).

Uso:
    python scripts/export-maestro.py [ruta/al/Maestro_TAGs_MLP.xlsx]

Requiere Python 3.10+ y openpyxl (pip install openpyxl). openpyxl es solo para este script:
no es una dependencia de la app.

Genera:
    src/data/maestro-tags.json   datos que lee el selector de TAG
    docs/MAPEO_ZONA_AREA.md      tabla Zona/Instalación -> área y sector, para revisión
"""
import collections
import json
import re
import sys
from pathlib import Path

import openpyxl

RAIZ = Path(__file__).resolve().parent.parent
XLSX_POR_DEFECTO = Path(r"C:\Proyectos\Bases de datos generales\Maestro_TAGs_MLP.xlsx")
SALIDA_JSON = RAIZ / "src" / "data" / "maestro-tags.json"
SALIDA_MAPEO = RAIZ / "docs" / "MAPEO_ZONA_AREA.md"

# Zona del Maestro -> código de área de la app. "Generadores y trafos elevadores" se resuelve por instalación.
AREA_POR_ZONA = {
    "Chacay": "chacay",
    "Chacay – STATCOM": "chacay",
    "Chacay – Sistema 220 kV": "chacay",
    "Concentradora": "chacay",
    "Tranque Quillayes – Líneas 23 kV": "chacay",
    "Tranque Quillayes – Subestaciones": "chacay",
    "Mina": "mina",
    "Mina – Correas y chancado": "mina",
    "Mauro": "mauro",
    "Tranque El Mauro": "mauro",
    "Puerto Punta Chungo": "puerto",
    "PPCH": "puerto",
    "Valle": "valle",
    "Valle Choapa Viejo y Pupio": "valle",
}
ZONA_GENERADORES = "Generadores y trafos elevadores"

# Color de relleno de la celda TAG -> estado (respaldo de la hoja «Cambios y propuestas»).
ESTADO_POR_COLOR = {"FFD966": "propuesto", "F4B183": "reasignado", "9DC3E6": "por_validar"}
ESTADO_POR_CAMBIO = {"Propuesto": "propuesto", "Duplicado resuelto": "reasignado", "Por nombre (validar)": "por_validar"}

ES_GG = re.compile(r"^GG |GENERADORES Y TRAFOS|PARQUE (DE )?GENERACI|^PARQUE (PIUQUENES|DREN)")


def area_de(zona: str, instalacion: str):
    """-> (área, dudoso o None)"""
    if zona == ZONA_GENERADORES:
        if instalacion == "GG MINA":
            return "mina", None
        if instalacion == "GG VALLE":
            return "valle", None
        if instalacion == "GG QUILLAY Y HOTEL MINA":
            return "chacay", "el nombre menciona Hotel Mina"
        return "chacay", None
    return AREA_POR_ZONA[zona], None


def sector_de(area: str, zona: str, instalacion: str):
    """-> (sector o '', dudoso o None). Vacío = el Maestro no permite asignarlo sin inventar."""
    i = instalacion.upper()
    if ES_GG.search(i):
        return "GG", None
    if area == "chacay":
        if zona == "Chacay – STATCOM":
            return "STATCOM", None
        if zona == "Concentradora":
            return "Planta", None
        if zona == "Chacay – Sistema 220 kV":
            return "Piuquenes", "la descripción dice «PATIO PIUQUENES»"
        if zona.startswith("Tranque Quillayes"):
            if any(k in i for k in ("CAMPAMENTO", "CABECERA", "CONAFE")):
                return "Tranque", "nombre sin relación directa con el tranque"
            return "Tranque", None
        if zona == "Chacay":
            if "MOLIENDA" in i or "SALA 5002" in i:
                return "Planta", "alimentador de Sala 1 o 5002"
            if "TRANQUE QUILLAYES" in i:
                return "Tranque", None
    if area == "mina":
        if "MOVIL" in i:
            return "SE Móviles", None
        if "PARRON" in i:
            return "Parrones", None
        if "SALA 12" in i:
            return "Sala 12", None
    return "", None


# ---------- Normalización de TAG y limpieza de nombres ----------


def _tokens(texto: str) -> str:
    """740XF001 -> 740-XF-001; 4150PP003XF -> 4150-PP-003-XF; 280XF281A -> 280-XF-281A; 320ML001XF4 -> 320-ML-001-XF-4."""
    partes = []
    for bloque in re.split(r"[\s\-]+", texto.strip()):
        if bloque:
            partes += re.findall(r"\d+(?:[A-Z](?![A-Z]))?(?!\d)|[A-Z]+", bloque)
    return "-".join(partes)


def normalizar_tag(tag: str) -> str:
    """TAG con guiones separadores: prefijo numérico, designador y correlativo. Si no se reconoce, no se toca."""
    if re.search(r"VCP-W\d+", tag):
        return tag
    lados = [x.strip() for x in re.split(r"\s*/\s*", tag)]
    salida = []
    for lado in lados:
        sufijo = ""
        m = re.match(r"^(.*?)(\s*\(.*\))$", lado)
        if m:
            lado, sufijo = m.group(1), m.group(2)
        # Solo se reescribe si tiene la forma «número + letras + número» (con o sin guiones); si no, queda igual.
        if re.match(r"^\d+[\s\-]*[A-Z]{2,4}[\s\-]*\d", lado) or re.match(r"^[A-Z]{2}\d{4}$", lado):
            lado = _tokens(lado)
        salida.append(lado + sufijo)
    return " / ".join(salida)


_PAREN = re.compile(r"\s*\(([^()]*)\)")
_NOTA = re.compile(r"^\s*SOLO(?!\w)", re.I)
_DATO = re.compile(r"KVA|MVA|(?<!\w)KW(?!\w)|(?<!\w)KV(?!\w)|Z=|SERIE|\d\s*A(?!\w)|^\s*(A[ÉE]REA|PISO)(?!\w)", re.I)


def limpiar_nombre(texto):
    """Quita del nombre los paréntesis que no son parte del nombre. -> (nombre, notas, datos).

    - «(SOLO MUESTRAS DE ACEITE)», «(SOLO HASTA MUFAS…)»: aclaraciones de alcance -> notas.
    - «(5,0 / 6,5 MVA.)», «(N° DE SERIE: …)», «(200 A)»: datos de placa -> datos.
    - Los demás paréntesis (p. ej. «(PATIO DE CABLE)», «(COM)») se dejan: son parte del nombre.
    """
    if not texto:
        return texto, [], []
    notas, datos = [], []

    def cambio(m):
        dentro = m.group(1).strip()
        if _NOTA.match(dentro):
            notas.append(dentro)
            return ""
        if _DATO.search(dentro):
            datos.append(re.sub(r"\s+", " ", dentro).strip(" ."))
            return ""
        return m.group(0)

    limpio = re.sub(r"\s{2,}", " ", _PAREN.sub(cambio, texto)).strip(" ,;")
    return limpio, notas, datos


def designador(tag: str):
    """Segundo bloque del TAG: 740-XF-001, 740XF001, 320ML001XF4, 740SG001 / CUB-52-10. None si no tiene."""
    for patron in (r"^\d+-([A-Z]+)-", r"^\d+ML\d+-?([A-Z]+)\d+", r"^\d+([A-Z]{2,3})\d+"):
        m = re.match(patron, tag)
        if m:
            return m.group(1)
    return None


def tipo_trafo(texto: str):
    """Pista de piso/aéreo solo si el texto lo dice; None si no alcanza (no se inventa)."""
    piso = "PISO" in texto
    aereo = bool(re.search(r"A[ÉE]REO|POSTE", texto))
    if piso and not aereo:
        return "piso"
    if aereo and not piso:
        return "aereo"
    return None


def main():
    ruta = Path(sys.argv[1]) if len(sys.argv) > 1 else XLSX_POR_DEFECTO
    # Dos lecturas: valores (rápida) y estilos (para el color de la celda TAG).
    libro = openpyxl.load_workbook(ruta, read_only=False, data_only=True)
    hoja = libro["Maestro"]
    cambios = {}
    for fila in list(libro["Cambios y propuestas"].iter_rows(values_only=True))[1:]:
        if fila[2]:
            cambios[str(fila[2]).strip()] = (fila[4], fila[3])

    equipos, mapeo = [], collections.OrderedDict()
    discrepancias = []
    for fila in hoja.iter_rows(min_row=2, max_col=7):
        n, zona, inst, nombre, tag, desc, tipo = (c.value for c in fila)
        if n is None:
            continue
        tag = str(tag).strip()
        relleno = fila[4].fill.fgColor.rgb if fila[4].fill and fila[4].fill.fill_type else None
        por_color = ESTADO_POR_COLOR.get(str(relleno)[-6:]) if relleno else None
        cambio, original = cambios.get(tag, (None, None))
        por_hoja = ESTADO_POR_CAMBIO.get(cambio)
        if por_hoja != por_color:
            discrepancias.append((tag, por_hoja, por_color))
        estado = por_hoja or por_color or "oficial"
        area, dud_area = area_de(zona, inst)
        sector, dud_sector = sector_de(area, zona, inst)
        texto_trafo = " ".join(str(x or "") for x in (inst, nombre, desc)).upper()
        nombre_l, notas_n, datos_n = limpiar_nombre(nombre)
        inst_l, notas_i, datos_i = limpiar_nombre(inst)
        tag_n = normalizar_tag(tag)
        original_n = normalizar_tag(str(original).strip()) if estado == "reasignado" and original else None
        equipos.append(
            {
                "tag": tag_n,
                "tagFuente": tag if tag_n != tag else None,
                "nombre": nombre_l,
                "instalacion": inst_l,
                "zona": zona,
                "tipoEquipo": tipo,
                "descripcion": desc,
                "datos": " · ".join(dict.fromkeys(datos_n + datos_i)) or None,
                "nota": " · ".join(dict.fromkeys(notas_n + notas_i)) or None,
                "designador": designador(tag_n),
                "area": area,
                "sector": sector or None,
                "estado": estado,
                "tagOriginal": original_n,
                "tipoTrafo": tipo_trafo(texto_trafo) if designador(tag_n) == "XF" else None,
            }
        )
        inst = inst_l
        clave = (zona, inst, area, sector)
        previo = mapeo.get(clave, [0, set()])
        previo[0] += 1
        previo[1].update(d for d in (dud_area, dud_sector) if d)
        mapeo[clave] = previo

    repetidos = [t for t, n in collections.Counter(e["tag"] for e in equipos).items() if n > 1]
    if repetidos:
        sys.exit(f"ERROR: la normalización dejó TAG repetidos: {repetidos[:10]}")

    SALIDA_JSON.parent.mkdir(parents=True, exist_ok=True)
    SALIDA_JSON.write_text(json.dumps(equipos, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")

    lineas = [
        "# Mapeo Zona/Instalación → área y sector",
        "",
        "Generado por `scripts/export-maestro.py` desde `Maestro_TAGs_MLP.xlsx` (solo lectura). No editar a mano.",
        "Dudoso = requiere confirmación. Sector «—» = el Maestro no permite asignarlo sin inventar.",
        "",
        "| Zona | Instalación | Filas | Área | Sector | Dudoso |",
        "|---|---|---:|---|---|---|",
    ]
    for (zona, inst, area, sector), (n, duds) in mapeo.items():
        lineas.append(f"| {zona} | {inst} | {n} | {area} | {sector or '—'} | {'; '.join(sorted(duds))} |")
    SALIDA_MAPEO.write_text("\n".join(lineas) + "\n", encoding="utf-8")

    cuenta = collections.Counter(e["estado"] for e in equipos)
    print(f"{len(equipos)} equipos -> {SALIDA_JSON.relative_to(RAIZ)}")
    print("estados:", dict(cuenta))
    print("TAG normalizados:", sum(1 for e in equipos if e["tagFuente"]), "de", len(equipos))
    print("con datos de placa movidos:", sum(1 for e in equipos if e["datos"]), "· con nota:", sum(1 for e in equipos if e["nota"]))
    print("áreas:", dict(collections.Counter(e["area"] for e in equipos)))
    print(f"discrepancias hoja/color: {len(discrepancias)}", discrepancias[:5])


if __name__ == "__main__":
    main()
