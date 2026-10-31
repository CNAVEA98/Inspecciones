# Formatos de origen

Formatos digitales (Word, PDF, Excel o foto) de cada tipo de inspección, a partir de los cuales se construye su formulario.

## Estructura

```
docs/formatos/
├── inspecciones/   INSP-01 … INSP-41 (sin INSP-36, que no existe)
└── mantenciones/   MANT-01 … MANT-20
```

- Un archivo por formato, con el nombre `INSP-NN Nombre.docx` o `MANT-NN Nombre.docx` (el mismo código del catálogo en `src/lib/formatos/catalogo.ts`).
- Los formatos se agregan **de a uno**, a medida que se convierten en plantilla; no hace falta copiar los 60 de una vez.
- La colección completa (60 formatos y `Indice_renombrado.csv`) vive fuera de Git, en la carpeta «Bases de datos generales».
- Los `.doc` antiguos (MANT-18 y MANT-19) se convierten a `.docx` antes de usarlos.
- Cada formato nuevo o cada plantilla cargada se registra en `docs/BITACORA.md`.

## Demo estática (referencia visual)

- Formatos de **un equipo**: se crea `demo/formatos/<id>.js` (copiar uno existente y cambiar cabecera, ítems, grupos y firmantes) y se agrega al menú `inspecciones.html` con `href: "inspeccion.html?f=<id>"`. El motor común es `inspeccion.html`.
- Formatos con **varios equipos** en una misma inspección (como Grupos Generadores Chacay-Mina) tienen su propia página.
