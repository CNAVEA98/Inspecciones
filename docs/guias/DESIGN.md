# DESIGN.md — Inspecciones MLP · sistema «Cobre»

Sistema visual aprobado el 2026-10-29. Referencia viva: `docs/muestras/formulario-transformador-piso.html`
(formulario + informe en vivo) e `docs/muestras/informe-transformador-piso.html` (solo informe).
Nació de la familia SAP de awesome-design-md (lienzo claro, bandas planas, un solo color interactivo)
y se llevó a un lenguaje propio: grafito + cobre (el mineral de Los Pelambres), números grandes tipo
instrumento y bordes redondeados. IBM Carbon queda descartado.

## Color

| Token | Hex | Uso |
|---|---|---|
| `graf` | `#14181d` | Encabezado del informe, texto principal, botón secundario oscuro |
| `graf-2` | `#232a31` | Superficies oscuras secundarias |
| `cu` | `#c4602d` | Acento: kicker, marcas de límite, foco, bordes de alerta |
| `cu-soft` | `#f6e6dc` | Fondo de alertas y observaciones |
| `paper` | `#f6f4f0` | Tarjetas de lectura, fondo del editor |
| `hair` | `#e1ddd5` | Bordes de 1px |
| `sub` | `#5b646d` | Texto secundario |
| `primary` | `#0057d2` | Solo acciones de la barra de herramientas / enlaces de UI |

Estados de inspección (únicos colores semánticos; texto blanco sobre fondo pleno, 4.5:1):
`BN` `#1d7a46` · `ML` `#bb0000` · `NT` `#6a6d70` · `NA` `#8a6d00` · `NR` `#8a4b1d`.
En el informe se muestran como píldora (fondo suave + texto oscuro, ML pleno rojo).
Severidad de hallazgo: baja `#1d7a46`, media `#8a6d00`, alta `#c25400`, crítica `#bb0000`.

## Tipografía

- **Geist** (texto) y **Geist Mono** (cifras, etiquetas, TAG), de Google Fonts; respaldo `Segoe UI, Arial`.
- Etiquetas: Geist Mono 500, mayúsculas, tracking .06–.08em, 6.6–7pt (informe) / 11px (app).
- TAG del equipo: 38pt / 700 / tracking -.02em. Cifras de lectura: Geist Mono 19pt / 600.
- App técnico: cuerpo 16px mínimo, objetivos ≥ 48px, botones de estado 52px.
- App supervisor: cuerpo 14px, tabla densa.

## Forma

- Radios: **22px** encabezado, **14–16px** tarjetas y grupos, **12px** módulos/campos/botones,
  **10px** botones de estado y miniaturas, **99px** píldoras y chips.
- Sin sombras; jerarquía por `paper`, bordes `hair` y el encabezado grafito. Excepción: toast.
- Espacio base 4px; márgenes del informe 11mm; separación entre bloques 5mm.

## Componentes

- **Encabezado de informe**: bloque grafito a sangre, norma/revisión en mono, estado en chip, TAG grande,
  metadatos OT/fecha/horario; borde inferior de 3px `cu`.
- **Ficha de datos**: rejilla 3×2 en tarjeta blanca redondeada, etiqueta mono + valor mono 11pt.
- **Resultado**: cifra grande («24 de 29»), barra segmentada por estado, alerta de observaciones críticas.
- **Lecturas**: tarjetas `paper`; las de temperatura con barra contra el límite (65 °C) y marca `cu` de máx. registrada.
- **Grupo de ítems**: tarjeta con título y conteo BN; filas N° · texto · valor mono · píldora; observación bajo la fila en `cu-soft`.
- **Selector de estado** (app): 5 botones de 52px; al seleccionar toma el color del estado.
- **Campo**: 48px, borde 1.5px, foco con anillo `cu` de 3px.
- **Firma**: canvas con borde punteado; en el informe, tarjetas por rol.
- **Fotos**: cuadro redondeado 12px con pie «Punto N: …».

## Logo

- Archivo: `public/brand/bbosch-logo.png` (1115×391, BBOSCH «Infraestructura para el futuro»).
- En el informe va en la esquina superior izquierda del encabezado, sobre una chip blanca de 10px de radio
  (el logo tiene letras grises y naranjas y no se lee sobre grafito). Alto 8.5mm; no recolorear ni deformar.
- El PDF debe usar el mismo PNG dentro de una caja blanca redondeada.

## Reglas

- Cobre es acento escaso: kicker, marcas, foco. No usarlo como fondo grande salvo `cu-soft` en alertas.
- ML (y NO, donde exista) exige observación; NR exige motivo. La foto es siempre opcional; si hay, el informe la refleja con `[Ver foto(s) punto N]`.
- Sin modo oscuro. Toda la UI en español (Chile); fechas en `America/Santiago`.
- Sin geo-referencia (descartada por el usuario).
- El login es la única pantalla con `design-taste-frontend-v2-experimental`, usando estos tokens.
- El PDF (`@react-pdf/renderer`) debe reproducir este informe: mismas páginas, jerarquía y colores.
