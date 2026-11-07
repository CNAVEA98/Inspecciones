import { LOGO_PROPORCION } from "./logo";
import { ESTADOS_VER, ORDEN_SEVERIDAD, fmtNumero, type EstadoVer, type Informe, type LecturaAncha, type LecturaChica, type SeveridadInforme } from "./modelo";

/**
 * Informe en HTML para convertirlo a PDF en el teléfono (`expo-print`). Es una réplica del PDF de la web
 * (`src/components/informe/informe-pdf.tsx`, hecho con React-PDF): mismas medidas, colores y orden de secciones. Las medidas
 * están en `px` con el mismo número que usa React-PDF en puntos (el PDF se imprime a 595 × 842, A4). Función pura: no lee archivos.
 *
 * Escala: el teléfono imprime la hoja A4 con 793 px de ancho CSS (96 px por pulgada) y React-PDF usa 595 puntos; por eso la hoja se
 * dibuja a 595 px y se amplía con `zoom: 4/3`. Sin esa ampliación el contenido ocupa solo el 75 % del ancho y queda pegado a la izquierda.
 *
 * Diferencias inevitables con el PDF de la web: sin «Página X de Y» (el HTML no sabe en qué página cae) y los recuadros de las
 * tablas se cortan en el salto de página en vez de cerrarse en cada página.
 */

const MARGEN = 31;
const MONO = `Courier, "Courier New", monospace`;
const TEXTO = `Helvetica, Arial, sans-serif`;

const C = {
  graf: "#14181d",
  cu: "#c4602d",
  cuSoft: "#f6e6dc",
  cuTexto: "#8d3d14",
  paper: "#f6f4f0",
  sub: "#5b646d",
  hair: "#e1ddd5",
  pista: "#e4e0d7",
};

const PILL: Record<EstadoVer, { bg: string; fg: string }> = {
  BN: { bg: "#e1f2e8", fg: "#0b6b3a" },
  ML: { bg: "#bb0000", fg: "#ffffff" },
  NT: { bg: "#e9ebed", fg: "#4a525a" },
  NA: { bg: "#f4ecce", fg: "#6e5700" },
  NR: { bg: "#f3e1d3", fg: "#7a3d12" },
  RL: { bg: "#e1f2e8", fg: "#0b6b3a" },
  RMP: { bg: "#dbe9f4", fg: "#1f4f73" },
  SI: { bg: "#e1f2e8", fg: "#0b6b3a" },
  NO: { bg: "#e9ebed", fg: "#4a525a" },
};

const SEGMENTO: Record<EstadoVer, string> = {
  BN: "#1d7a46",
  ML: "#bb0000",
  NT: "#9aa1a8",
  NA: "#c9a227",
  NR: "#b8651b",
  RL: "#1d7a46",
  RMP: "#2f78ad",
  SI: "#1d7a46",
  NO: "#9aa1a8",
};

const SEV: Record<SeveridadInforme, { bg: string; fg: string; texto: string }> = {
  baja: { bg: "#e1f2e8", fg: "#0b6b3a", texto: "Baja" },
  media: { bg: "#f4ecce", fg: "#6e5700", texto: "Media" },
  alta: { bg: "#fbe3cf", fg: "#8a3d00", texto: "Alta" },
  critica: { bg: "#bb0000", fg: "#ffffff", texto: "Crítica" },
};

export const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const saltos = (s: string) => esc(s).replace(/\n/g, "<br>");

export interface OpcionesHtml {
  /** PNG del logo a color en base64 (sin el prefijo `data:`). */
  logoBase64: string | null;
  /** Imagen por la URL que trae el informe (`fotos[].url` y `firmas[].imagenUrl`), ya como `data:`. */
  imagenes: Record<string, string>;
  /** Aviso bajo el encabezado (p. ej. «copia generada en el teléfono»). */
  aviso?: string;
}

const ESTILOS = `
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; }
  body { font-family: ${TEXTO}; font-size: 8.5px; line-height: 1.25; color: ${C.graf}; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  /* Tabla de una sola celda: su encabezado y su pie se repiten en cada página y dan los márgenes superior (28) e inferior (50). */
  table.hoja { zoom: 1.33333; width: 595px; min-height: 842px; border-collapse: collapse; table-layout: fixed; }
  table.hoja > thead > tr > td { height: 28px; padding: 0; }
  table.hoja > tfoot > tr > td { height: 50px; padding: 0 ${MARGEN}px 20px; vertical-align: bottom; font-family: ${MONO}; font-size: 6.8px; color: ${C.sub}; }
  table.hoja > tbody > tr > td { padding: 0; vertical-align: top; }
  .mono { font-family: ${MONO}; }
  .mb { font-family: ${MONO}; font-weight: 700; }
  .et { font-family: ${MONO}; font-size: 6.3px; letter-spacing: 0.6px; color: ${C.sub}; text-transform: uppercase; }
  .fila { display: flex; flex-direction: row; }
  .sev { display: inline-block; background: var(--bg); color: var(--fg); border-radius: 8px; padding: 1.5px 6px; margin-right: 5px; font-family: ${MONO}; font-weight: 700; font-size: 6.5px; text-transform: uppercase; white-space: nowrap; }
  .pill { width: 34px; height: 16px; border-radius: 8px; background: var(--bg); color: var(--fg); display: flex; align-items: center; justify-content: center; font-family: ${MONO}; font-weight: 700; font-size: 7px; }

  /* En la primera página el encabezado sube sobre el margen superior (como en el PDF de la web): se desplaza 28px y el contenido que sigue sube lo mismo. */
  .hero { position: relative; top: -28px; margin-bottom: -28px; background: ${C.graf}; padding: 28px ${MARGEN}px 18px; border-bottom: 3px solid ${C.cu}; border-radius: 0 0 20px 20px; color: #fff; }
  .hero .sup { display: flex; justify-content: space-between; align-items: center; }
  .hero .logo { background: #fff; border-radius: 8px; padding: 4px 9px; }
  .hero .logo img { display: block; height: 24px; }
  .hero .estado { color: #fff; margin-left: 8px; border: 1px solid #4a545e; border-radius: 10px; padding: 1.5px 7px; }
  .hero .inf { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px; }
  .hero .titulo { font-family: ${TEXTO}; font-weight: 700; font-size: 8px; letter-spacing: 1px; color: ${C.cu}; text-transform: uppercase; }
  .hero .tag { font-family: ${MONO}; font-weight: 700; font-size: 32px; margin: 5px 0 3px; white-space: nowrap; }
  .hero .lugar { font-size: 10px; color: #c9d0d6; }
  .hero .meta { max-width: 190px; }
  .hero .meta .m { display: flex; justify-content: flex-end; margin-top: 2px; }
  .hero .meta .k { font-size: 8px; color: #8c97a1; margin-right: 8px; }
  .hero .meta .v { font-family: ${MONO}; font-weight: 700; font-size: 8px; min-width: 62px; }

  .aviso { margin: 10px ${MARGEN}px 0; background: ${C.cuSoft}; border: 1px solid #ecc9b5; border-radius: 8px; padding: 5px 9px; font-size: 7.5px; color: ${C.cuTexto}; }

  .specs { margin: 16px ${MARGEN}px 0; border: 1px solid ${C.hair}; border-radius: 12px; display: flex; flex-wrap: wrap; overflow: hidden; break-inside: avoid; }
  .specs .s { width: 33.333%; padding: 6px 11px; }
  .specs .v { font-family: ${MONO}; font-weight: 700; font-size: 9px; margin-top: 2px; }

  .resumen { display: flex; margin: 14px ${MARGEN}px 0; break-inside: avoid; }
  .resumen .izq { flex: 1.4; padding-right: 18px; }
  .resumen .num { display: flex; align-items: flex-end; margin-top: 2px; }
  .resumen .num b { font-family: ${MONO}; font-weight: 700; font-size: 20px; line-height: 1; }
  .resumen .num span { font-size: 8.5px; color: ${C.sub}; margin-left: 5px; margin-bottom: 3px; }
  .resumen .barra { display: flex; height: 8px; border-radius: 4px; overflow: hidden; background: ${C.hair}; margin: 5px 0; }
  .resumen .leyenda { display: flex; flex-wrap: wrap; }
  .resumen .leyenda div { display: flex; align-items: center; margin-right: 12px; font-size: 7.5px; color: ${C.sub}; }
  .resumen .leyenda i { display: block; width: 6px; height: 6px; border-radius: 2px; margin-right: 4px; }
  .resumen .der { flex: 1; border-radius: 10px; border: 1px solid var(--borde); background: var(--fondo); padding: 8px; }
  .resumen .der .et { font-weight: 700; color: var(--texto); }
  .resumen .der p { font-size: 8px; margin-top: 3px; }

  .lecturas { display: flex; flex-wrap: wrap; margin: 11px ${MARGEN - 3}px 0; break-inside: avoid; }
  .lecturas .c { padding: 3px; }
  .lecturas .caja { background: ${C.paper}; border: 1px solid ${C.hair}; border-radius: 10px; padding: 6px 9px; }
  .lecturas .val { display: flex; align-items: flex-end; }
  .lecturas .val b { font-family: ${MONO}; font-weight: 700; font-size: 17px; line-height: 1.1; }
  .lecturas .val span { font-size: 8px; color: ${C.sub}; margin-left: 2px; margin-bottom: 2px; }
  .lecturas .pista { position: relative; height: 5px; border-radius: 3px; background: ${C.pista}; margin: 7px 0 3px; }
  .lecturas .pista i { display: block; height: 5px; border-radius: 3px; background: ${C.graf}; }
  .lecturas .pista u { position: absolute; top: -3px; width: 2px; height: 11px; background: ${C.cu}; }
  .lecturas .pie { display: flex; justify-content: space-between; font-size: 6.5px; color: ${C.sub}; }

  .grupo { margin: 14px ${MARGEN}px 0; border: 1px solid ${C.hair}; border-radius: 12px; padding: 7px 11px 3px; }
  .grupo .cab { display: flex; align-items: flex-end; margin-bottom: 3px; }
  .grupo .cab b { font-family: ${TEXTO}; font-weight: 700; font-size: 9.5px; }
  .grupo .cab .et { margin-left: 8px; }
  .item { border-bottom: 1px solid ${C.hair}; padding: 3.5px 0; break-inside: avoid; }
  .item.ultimo { border-bottom: 0; }
  .item .linea { display: flex; align-items: center; }
  .item .n { font-family: ${MONO}; font-size: 7.5px; color: ${C.sub}; width: 22px; }
  .item .t { flex: 1; font-size: 8.5px; padding-right: 8px; }
  .item .t.ml { font-weight: 700; }
  .item .v { font-family: ${MONO}; font-weight: 700; font-size: 8.5px; min-width: 50px; text-align: right; margin-right: 8px; }
  .item .vacio { width: 34px; }
  .item .obs { margin: 3px 0 0 22px; background: ${C.cuSoft}; border-radius: 6px; padding: 3px 7px; display: flex; align-items: center; }
  .item .obs span.tx { font-size: 8px; color: ${C.cuTexto}; flex: 1; }
  .item .traza { margin: 2px 0 0 22px; font-family: ${MONO}; font-weight: 700; font-size: 7px; color: ${C.sub}; }
  .corte { break-inside: avoid; }

  .hall { margin: 14px ${MARGEN}px 0; border: 1px solid ${C.hair}; border-radius: 12px; padding: 7px 11px 3px; }
  .hall .cab { display: flex; align-items: flex-end; margin-bottom: 3px; break-after: avoid; }
  .hall .cab b { font-weight: 700; font-size: 9.5px; }
  .hall .cab .et { margin-left: 8px; }
  .hall .f { display: flex; align-items: flex-start; border-top: 1px solid ${C.hair}; padding: 3.5px 0; break-inside: avoid; }
  .hall .f.primera { border-top: 0; }
  .hall .f .n { font-family: ${MONO}; font-size: 7.5px; color: ${C.sub}; width: 22px; }
  .hall .f .t { flex: 1; }
  .hall .f .t b { font-weight: 700; font-size: 8.5px; }
  .hall .f .t p { font-size: 8px; color: ${C.cuTexto}; margin-top: 1px; }

  .cierre { break-inside: avoid; }
  .nomen { margin: 14px ${MARGEN}px 0; font-size: 6.8px; color: ${C.sub}; }
  .diag { display: flex; margin: 8px ${MARGEN - 3}px 0; }
  .diag .c { width: 50%; padding: 3px; }
  .diag .caja { min-height: 62px; border: 1px solid ${C.hair}; background: ${C.paper}; border-radius: 10px; padding: 8px; }
  .diag .caja p { font-size: 8.5px; margin-top: 3px; }
  .firmas { display: flex; flex-wrap: wrap; margin: 8px ${MARGEN - 3}px 0; }
  .firmas .c { width: 25%; padding: 3px; }
  .firmas .caja { border: 1px solid ${C.hair}; border-radius: 10px; padding: 7px; min-height: 92px; }
  .firmas img { display: block; height: 30px; max-width: 100%; margin-top: 4px; object-fit: contain; object-position: left; }
  .firmas .sin { height: 34px; }
  .firmas .nombre { font-weight: 700; font-size: 8.5px; margin-top: 2px; }
  .firmas .det { font-size: 7px; color: ${C.sub}; margin-top: 2px; }
  .firmas .linea { border-top: 1px solid ${C.graf}; margin-top: 4px; padding-top: 2px; font-size: 6.5px; color: ${C.sub}; }

  .fotos { break-before: page; }
  .fotos h2 { margin: 6px ${MARGEN}px 8px; font-weight: 700; font-size: 14px; }
  .fotos .rej { display: flex; flex-wrap: wrap; margin: 0 ${MARGEN - 7}px; }
  .fotos .foto { width: 50%; padding: 7px; break-inside: avoid; }
  .fotos img { display: block; width: 100%; height: 200px; border-radius: 10px; object-fit: cover; }
  .fotos p { font-size: 8px; margin-top: 4px; }
`;

const pildoraEstado = (e: EstadoVer) => `<div class="pill" style="--bg:${PILL[e].bg};--fg:${PILL[e].fg}">${e}</div>`;
const pildoraSev = (s: SeveridadInforme) => `<span class="sev" style="--bg:${SEV[s].bg};--fg:${SEV[s].fg}">${SEV[s].texto}</span>`;

function desgloseSeveridad(hallazgos: Informe["resumen"]["hallazgos"]): string {
  const partes = ORDEN_SEVERIDAD.map((sv) => [sv, hallazgos.filter((h) => h.severidad === sv).length] as const)
    .filter(([, n]) => n > 0)
    .map(([sv, n]) => `${n} ${SEV[sv].texto.toLowerCase()}${n > 1 ? "s" : ""}`);
  const sin = hallazgos.filter((h) => h.severidad === null).length;
  if (sin) partes.push(`${sin} sin severidad`);
  return partes.join(", ");
}

function hero(r: Informe, op: OpcionesHtml): string {
  const meta: [string, string][] = [
    ["Folio", r.folio],
    ["N° OT", r.ot],
    ["Fecha", r.fecha],
    ["Horario", r.horario],
  ];
  const logo = op.logoBase64
    ? `<div class="logo"><img src="data:image/png;base64,${op.logoBase64}" alt="BBOSCH" style="width:${(24 * LOGO_PROPORCION).toFixed(1)}px"></div>`
    : `<b style="font-size:11px">BBOSCH</b>`;
  return `<div class="hero">
    <div class="sup">
      ${logo}
      <div style="display:flex;align-items:center">
        <span class="et" style="color:#9aa4ad">${esc(r.norma)}${r.revision ? ` · Rev. ${esc(r.revision)}` : ""}</span>
        <span class="et estado">${esc(r.estadoRegistro)}</span>
      </div>
    </div>
    <div class="inf">
      <div style="flex:1;padding-right:24px">
        <div class="titulo">${esc(r.titulo)}</div>
        <div class="tag">${esc(r.tag)}</div>
        <div class="lugar">${esc(r.lugar || "—")}</div>
      </div>
      <div class="meta">${meta.map(([k, v]) => `<div class="m"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`).join("")}</div>
    </div>
  </div>`;
}

function specs(r: Informe): string {
  if (!r.specs.length) return "";
  return `<div class="specs">${r.specs
    .map((s, i) => {
      const borde = `${i >= 3 ? `border-top:1px solid ${C.hair};` : ""}${i % 3 === 0 ? "" : `border-left:1px solid ${C.hair};`}`;
      return `<div class="s" style="${borde}"><div class="et">${esc(s.label)}</div><div class="v">${esc(s.valor)}</div></div>`;
    })
    .join("")}</div>`;
}

function resumen(r: Informe): string {
  const { cuenta, conformes, total, aplicables, hallazgos } = r.resumen;
  const presentes = ESTADOS_VER.filter((e) => cuenta[e] > 0);
  const hay = hallazgos.length > 0;
  const colores = hay
    ? { borde: "#ecc9b5", fondo: C.cuSoft, texto: C.cu }
    : { borde: "#bfe2cd", fondo: "#e4f3ea", texto: "#1d7a46" };
  return `<div class="resumen">
    <div class="izq">
      <div class="et">${r.esMantencion ? "Resultado de la mantención" : "Resultado de la inspección"}</div>
      <div class="num"><b>${conformes}</b><span>de ${aplicables} ítems conformes${total !== aplicables ? ` (${total - aplicables} no aplican)` : ""}</span></div>
      <div class="barra">${presentes.map((e) => `<div style="width:${(cuenta[e] / Math.max(total, 1)) * 100}%;background:${SEGMENTO[e]}"></div>`).join("")}</div>
      <div class="leyenda">${presentes.map((e) => `<div><i style="background:${SEGMENTO[e]}"></i>${e} ${cuenta[e]}</div>`).join("")}</div>
    </div>
    <div class="der" style="--borde:${colores.borde};--fondo:${colores.fondo};--texto:${colores.texto}">
      <div class="et">${hay ? `${hallazgos.length} hallazgo${hallazgos.length > 1 ? "s" : ""}` : "Sin hallazgos"}</div>
      <p>${
        hay
          ? `${esc(desgloseSeveridad(hallazgos))} · Ítem ${hallazgos.map((h) => h.n).join(", ")}. Detalle más abajo.`
          : "Todos los ítems realizados quedaron conformes."
      }</p>
    </div>
  </div>`;
}

function lectura(l: LecturaAncha | LecturaChica): string {
  if (l.tipo === "ancha") {
    const pct = (x: number | null) => (x === null ? 0 : (x / l.limite) * 100);
    const marca = l.max === null ? "" : `<u style="left:${Math.min(99, Math.max(0, pct(l.max)))}%"></u>`;
    return `<div class="c" style="width:50%"><div class="caja">
      <div class="et">${esc(l.titulo)}</div>
      <div class="val"><b>${l.actual === null ? "—" : fmtNumero(l.actual)}</b><span>${esc(l.unidad)}</span></div>
      <div class="pista"><i style="width:${Math.min(100, Math.max(0, pct(l.actual)))}%"></i>${marca}</div>
      <div class="pie"><span>Actual</span><span>Máx. registrada ${l.max === null ? "—" : `${fmtNumero(l.max)} ${esc(l.unidad)}`} · límite ${fmtNumero(l.limite)} ${esc(l.unidad)}</span></div>
    </div></div>`;
  }
  return `<div class="c" style="width:25%"><div class="caja">
    <div class="et">${esc(l.titulo)}</div>
    <div class="val"><b>${l.valor === null ? "—" : fmtNumero(l.valor)}</b><span>${esc(l.unidad)}</span></div>
  </div></div>`;
}

function lecturas(r: Informe): string {
  if (r.lecturas.length === 0) return "";
  const anchas = r.lecturas.filter((l) => l.tipo === "ancha");
  const chicas = r.lecturas.filter((l) => l.tipo === "chica");
  return `<div class="lecturas">${[...anchas, ...chicas].map(lectura).join("")}</div>`;
}

type Fila = Informe["grupos"][number]["filas"][number];

function fila(f: Fila, ultima: boolean): string {
  const estado = f.estado ? pildoraEstado(f.estado) : `<div class="vacio"></div>`;
  return `<div class="item${ultima ? " ultimo" : ""}">
    <div class="linea">
      <span class="n">${String(f.n).padStart(2, "0")}</span>
      <span class="t${f.estado === "ML" ? " ml" : ""}">${esc(f.texto)}</span>
      <span class="v">${esc(f.valor)}</span>
      ${estado}
    </div>
    ${f.obs ? `<div class="obs">${f.severidad ? pildoraSev(f.severidad) : ""}<span class="tx">${saltos(f.obs)}</span></div>` : ""}
    ${f.traza ? `<div class="traza">${esc(f.traza)}</div>` : ""}
  </div>`;
}

function grupos(r: Informe): string {
  return r.grupos
    .map((g) => {
      const conteo = g.total ? `${g.conformes}/${g.aplicables} conformes` : `${g.filas.length} ítems`;
      const [primera, ...resto] = g.filas;
      // El título viaja junto con la primera fila: así nunca queda solo al pie de una página.
      return `<div class="grupo">
        <div class="corte"><div class="cab"><b>${esc(g.titulo)}</b><span class="et">${conteo}</span></div>${primera ? fila(primera, resto.length === 0) : ""}</div>
        ${resto.map((f, i) => fila(f, i === resto.length - 1)).join("")}
      </div>`;
    })
    .join("");
}

function hallazgos(r: Informe): string {
  const lista = r.resumen.hallazgos;
  if (lista.length === 0) return "";
  return `<div class="hall">
    <div class="cab"><b>Hallazgos</b><span class="et">${esc(desgloseSeveridad(lista))}</span></div>
    ${lista
      .map(
        (h, i) => `<div class="f${i === 0 ? " primera" : ""}">
          <span class="n">${String(h.n).padStart(2, "0")}</span>
          ${h.severidad ? pildoraSev(h.severidad) : ""}
          <div class="t"><b>${esc(h.texto)}</b>${h.obs ? `<p>${saltos(h.obs)}</p>` : ""}</div>
        </div>`,
      )
      .join("")}
  </div>`;
}

function cierre(r: Informe, imagenes: Record<string, string>): string {
  const firmas = r.firmas
    .map((f) => {
      const img = f.imagenUrl ? imagenes[f.imagenUrl] : undefined;
      return `<div class="c"><div class="caja">
        <div class="et">${esc(f.rol)}</div>
        ${img ? `<img src="${img}" alt="">` : `<div class="sin"></div>`}
        <div class="nombre">${esc(f.nombre || "Pendiente de firma")}</div>
        ${f.detalle ? `<div class="det">${saltos(f.detalle)}</div>` : ""}
        <div class="linea">${f.fecha ? `Firma · ${esc(f.fecha)}` : "Firma"}</div>
      </div></div>`;
    })
    .join("");
  return `<div class="cierre">
    <div class="nomen">${esc(r.nomenclatura)}</div>
    <div class="diag">
      <div class="c"><div class="caja"><div class="et">Observaciones generales</div><p>${r.observaciones ? saltos(r.observaciones) : "—"}</p></div></div>
      <div class="c"><div class="caja"><div class="et">Consideraciones</div><p>${r.consideraciones ? saltos(r.consideraciones) : "—"}</p></div></div>
    </div>
    <div class="firmas">${firmas}</div>
  </div>`;
}

function fotos(r: Informe, imagenes: Record<string, string>): string {
  const con = r.fotos.filter((f) => imagenes[f.url]);
  if (con.length === 0) return "";
  return `<div class="fotos">
    <h2>Registro fotográfico</h2>
    <div class="rej">${con
      .map(
        (f) =>
          `<div class="foto"><img src="${imagenes[f.url]}" alt=""><p>Punto ${f.n}: ${esc(f.texto)}${f.severidad ? ` · Severidad ${SEV[f.severidad].texto.toLowerCase()}` : ""}</p></div>`,
      )
      .join("")}</div>
  </div>`;
}

/** Documento HTML completo del informe. */
export function informeAHtml(r: Informe, op: OpcionesHtml): string {
  const pie = `${esc(r.norma)} · ${esc(r.tag)} · Generado digitalmente ${esc(r.generado)}`;
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(r.folio)} · ${esc(r.titulo)}</title><style>${ESTILOS}</style></head>
<body>
<table class="hoja">
  <thead><tr><td></td></tr></thead>
  <tfoot><tr><td>${pie}</td></tr></tfoot>
  <tbody><tr><td>
    ${hero(r, op)}
    ${op.aviso ? `<div class="aviso">${esc(op.aviso)}</div>` : ""}
    ${specs(r)}
    ${resumen(r)}
    ${lecturas(r)}
    ${grupos(r)}
    ${hallazgos(r)}
    ${cierre(r, op.imagenes)}
    ${fotos(r, op.imagenes)}
  </td></tr></tbody>
</table>
</body></html>`;
}
