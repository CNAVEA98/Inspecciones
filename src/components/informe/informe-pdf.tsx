/* eslint-disable jsx-a11y/alt-text -- el <Image> de @react-pdf/renderer dibuja en el PDF; no es un <img> HTML y no admite alt. */
import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import type { EstadoVer, Informe, LecturaAncha, LecturaChica } from "@/lib/informe/modelo";
import { ESTADOS_VER, fmtNumero } from "@/lib/informe/modelo";
import { cortarEnTramos } from "@/lib/informe/paginado";

/** Imagen ya descargada, lista para incrustar. */
export interface ImagenPdf {
  data: Buffer;
  format: "png" | "jpg";
}

export interface RecursosPdf {
  logo: { img: ImagenPdf; ancho: number; alto: number } | null;
  /** Por URL firmada original. */
  imagenes: Map<string, ImagenPdf>;
}

// Tokens del diseño «Cobre» (docs/DESIGN.md, muestra docs/muestras/informe-transformador-piso.html).
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

const MARGEN = 31; // 11 mm
const MONO = "Courier";
const MONO_B = "Courier-Bold";
const TEXTO_B = "Helvetica-Bold";

const etiqueta = { fontFamily: MONO, fontSize: 6.3, letterSpacing: 0.6, color: C.sub, textTransform: "uppercase" as const };

function Hero({ r, rec }: { r: Informe; rec: RecursosPdf }) {
  const meta: [string, string][] = [
    ["Folio", r.folio],
    ["N° OT", r.ot],
    ["Fecha", r.fecha],
    ["Horario", r.horario],
  ];
  return (
    <View
      style={{
        backgroundColor: C.graf,
        marginTop: -28,
        paddingTop: 28,
        paddingHorizontal: MARGEN,
        paddingBottom: 18,
        borderBottomWidth: 3,
        borderBottomColor: C.cu,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        color: "#ffffff",
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        {rec.logo ? (
          <View style={{ backgroundColor: "#ffffff", borderRadius: 8, paddingVertical: 4, paddingHorizontal: 9 }}>
            <Image src={rec.logo.img} style={{ height: rec.logo.alto, width: rec.logo.ancho }} />
          </View>
        ) : (
          <Text style={{ fontFamily: TEXTO_B, fontSize: 11 }}>BBOSCH</Text>
        )}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ ...etiqueta, color: "#9aa4ad" }}>
            {r.norma}
            {r.revision ? ` · Rev. ${r.revision}` : ""}
          </Text>
          <Text
            style={{
              ...etiqueta,
              color: "#ffffff",
              marginLeft: 8,
              borderWidth: 1,
              borderColor: "#4a545e",
              borderRadius: 10,
              paddingVertical: 1.5,
              paddingHorizontal: 7,
            }}
          >
            {r.estadoRegistro}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 20 }}>
        <View style={{ flex: 1, paddingRight: 24 }}>
          <Text style={{ fontFamily: TEXTO_B, fontSize: 8, letterSpacing: 1, color: C.cu, textTransform: "uppercase" }}>{r.titulo}</Text>
          <Text style={{ fontFamily: MONO_B, fontSize: 32, marginTop: 5, marginBottom: 3 }}>{r.tag}</Text>
          <Text style={{ fontSize: 10, color: "#c9d0d6" }}>{r.lugar || "—"}</Text>
        </View>
        <View>
          {meta.map(([k, v]) => (
            <View key={k} style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 2 }}>
              <Text style={{ fontSize: 8, color: "#8c97a1", marginRight: 8 }}>{k}</Text>
              <Text style={{ fontFamily: MONO_B, fontSize: 8, minWidth: 62 }}>{v}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function Specs({ r }: { r: Informe }) {
  return (
    <View
      wrap={false}
      style={{
        marginHorizontal: MARGEN,
        marginTop: 16,
        borderWidth: 1,
        borderColor: C.hair,
        borderRadius: 12,
        flexDirection: "row",
        flexWrap: "wrap",
        overflow: "hidden",
      }}
    >
      {r.specs.map((s, i) => (
        <View
          key={s.label}
          style={{
            width: "33.333%",
            paddingVertical: 6,
            paddingHorizontal: 11,
            borderTopWidth: i >= 3 ? 1 : 0,
            borderTopColor: C.hair,
            borderLeftWidth: i % 3 === 0 ? 0 : 1,
            borderLeftColor: C.hair,
          }}
        >
          <Text style={etiqueta}>{s.label}</Text>
          <Text style={{ fontFamily: MONO_B, fontSize: 9, marginTop: 2 }}>{s.valor}</Text>
        </View>
      ))}
    </View>
  );
}

function Resumen({ r }: { r: Informe }) {
  const { cuenta, conformes, total, criticos } = r.resumen;
  const presentes = ESTADOS_VER.filter((e) => cuenta[e] > 0);
  return (
    <View wrap={false} style={{ flexDirection: "row", marginHorizontal: MARGEN, marginTop: 14 }}>
      <View style={{ flex: 1.4, paddingRight: 18 }}>
        <Text style={etiqueta}>Resultado de la inspección</Text>
        <View style={{ flexDirection: "row", alignItems: "flex-end", marginTop: 2 }}>
          <Text style={{ fontFamily: MONO_B, fontSize: 20 }}>{conformes}</Text>
          <Text style={{ fontSize: 8.5, color: C.sub, marginLeft: 5, marginBottom: 3 }}>de {total} ítems conformes</Text>
        </View>
        <View style={{ flexDirection: "row", height: 8, borderRadius: 4, overflow: "hidden", backgroundColor: C.hair, marginTop: 5, marginBottom: 5 }}>
          {presentes.map((e) => (
            <View key={e} style={{ width: `${(cuenta[e] / Math.max(total, 1)) * 100}%`, backgroundColor: SEGMENTO[e] }} />
          ))}
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {presentes.map((e) => (
            <View key={e} style={{ flexDirection: "row", alignItems: "center", marginRight: 12 }}>
              <View style={{ width: 6, height: 6, borderRadius: 2, backgroundColor: SEGMENTO[e], marginRight: 4 }} />
              <Text style={{ fontSize: 7.5, color: C.sub }}>
                {e} {cuenta[e]}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <View
        style={{
          flex: 1,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: criticos.length ? "#ecc9b5" : "#bfe2cd",
          backgroundColor: criticos.length ? C.cuSoft : "#e4f3ea",
          padding: 8,
        }}
      >
        <Text style={{ ...etiqueta, fontFamily: MONO_B, color: criticos.length ? C.cu : "#1d7a46" }}>
          {criticos.length
            ? `${criticos.length} observación${criticos.length > 1 ? "es" : ""} crítica${criticos.length > 1 ? "s" : ""}`
            : "Sin observaciones críticas"}
        </Text>
        <Text style={{ fontSize: 8, marginTop: 3 }}>
          {criticos.length
            ? `Ítem ${criticos.map((c) => c.n).join(", ")} · ${criticos[0].obs || criticos[0].texto}`
            : "Todos los ítems realizados quedaron conformes."}
        </Text>
      </View>
    </View>
  );
}

function Pista({ pct, marca }: { pct: number; marca?: number | null }) {
  return (
    <View style={{ height: 5, borderRadius: 3, backgroundColor: C.pista, marginTop: 7, marginBottom: 3 }}>
      <View style={{ height: 5, borderRadius: 3, backgroundColor: C.graf, width: `${Math.min(100, Math.max(0, pct))}%` }} />
      {marca != null && (
        <View style={{ position: "absolute", top: -3, left: `${Math.min(99, Math.max(0, marca))}%`, width: 2, height: 11, backgroundColor: C.cu }} />
      )}
    </View>
  );
}

function Lectura({ l }: { l: LecturaAncha | LecturaChica }) {
  const caja = { backgroundColor: C.paper, borderWidth: 1, borderColor: C.hair, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 9 };
  if (l.tipo === "ancha") {
    const pct = (x: number | null) => (x === null ? 0 : (x / l.limite) * 100);
    return (
      <View style={{ width: "50%", padding: 3 }}>
        <View style={caja}>
          <Text style={etiqueta}>{l.titulo}</Text>
          <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
            <Text style={{ fontFamily: MONO_B, fontSize: 17 }}>{l.actual === null ? "—" : fmtNumero(l.actual)}</Text>
            <Text style={{ fontSize: 8, color: C.sub, marginLeft: 2, marginBottom: 2 }}>{l.unidad}</Text>
          </View>
          <Pista pct={pct(l.actual)} marca={l.max === null ? null : pct(l.max)} />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 6.5, color: C.sub }}>Actual</Text>
            <Text style={{ fontSize: 6.5, color: C.sub }}>
              Máx. registrada {l.max === null ? "—" : `${fmtNumero(l.max)} ${l.unidad}`} · límite {fmtNumero(l.limite)} {l.unidad}
            </Text>
          </View>
        </View>
      </View>
    );
  }
  return (
    <View style={{ width: "25%", padding: 3 }}>
      <View style={caja}>
        <Text style={etiqueta}>{l.titulo}</Text>
        <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
          <Text style={{ fontFamily: MONO_B, fontSize: 17 }}>{l.valor === null ? "—" : fmtNumero(l.valor)}</Text>
          <Text style={{ fontSize: 8, color: C.sub, marginLeft: 2, marginBottom: 2 }}>{l.unidad}</Text>
        </View>
      </View>
    </View>
  );
}

function Lecturas({ r }: { r: Informe }) {
  if (r.lecturas.length === 0) return null;
  const anchas = r.lecturas.filter((l) => l.tipo === "ancha");
  const chicas = r.lecturas.filter((l) => l.tipo === "chica");
  return (
    <View wrap={false} style={{ marginHorizontal: MARGEN - 3, marginTop: 11, flexDirection: "row", flexWrap: "wrap" }}>
      {[...anchas, ...chicas].map((l) => (
        <Lectura key={l.titulo} l={l} />
      ))}
    </View>
  );
}

function Pill({ estado }: { estado: EstadoVer | null }) {
  if (!estado) return <View style={{ width: 34 }} />;
  const p = PILL[estado];
  return (
    <View style={{ width: 34, height: 16, borderRadius: 8, backgroundColor: p.bg, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontFamily: MONO_B, fontSize: 7, color: p.fg }}>{estado}</Text>
    </View>
  );
}

type Fila = Informe["grupos"][number]["filas"][number];

function FilaItem({ f, ultima, medir }: { f: Fila; ultima: boolean; medir?: (pagina: number) => void }) {
  return (
    <View wrap={false} style={{ borderBottomWidth: ultima ? 0 : 1, borderBottomColor: C.hair, paddingVertical: 3.5 }}>
      {medir ? (
        <Text
          style={{ position: "absolute", fontSize: 1 }}
          render={({ pageNumber }) => {
            medir(pageNumber);
            return "";
          }}
        />
      ) : null}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={{ fontFamily: MONO, fontSize: 7.5, color: C.sub, width: 22 }}>{String(f.n).padStart(2, "0")}</Text>
        <Text style={{ flex: 1, fontSize: 8.5, fontFamily: f.estado === "ML" ? TEXTO_B : "Helvetica", paddingRight: 8 }}>{f.texto}</Text>
        <Text style={{ fontFamily: MONO_B, fontSize: 8.5, minWidth: 50, textAlign: "right", marginRight: 8 }}>{f.valor}</Text>
        <Pill estado={f.estado} />
      </View>
      {f.obs ? (
        <View style={{ marginLeft: 22, marginTop: 3, backgroundColor: C.cuSoft, borderRadius: 6, paddingVertical: 3, paddingHorizontal: 7 }}>
          <Text style={{ fontSize: 8, color: C.cuTexto }}>{f.obs}</Text>
        </View>
      ) : null}
      {f.traza ? (
        <Text style={{ marginLeft: 22, marginTop: 2, fontFamily: MONO_B, fontSize: 7, color: C.sub }}>{f.traza}</Text>
      ) : null}
    </View>
  );
}

function Grupos({ r, paginado }: { r: Informe; paginado: Paginado }) {
  return (
    <>
      {r.grupos.map((g, gi) => {
        // La tabla empieza donde haya espacio y sigue en la página siguiente. Con la medición hecha, cada página
        // lleva su propio recuadro cerrado (tramo); las filas nunca se cortan por la mitad.
        const tramos = cortarEnTramos(
          g.filas.map((f, i) => ({ f, i })),
          paginado.tramos?.[gi] ?? [0],
        );
        const medir = paginado.medir;
        const fila = ({ f, i }: { f: Fila; i: number }, ultima: boolean) => (
          <FilaItem key={i} f={f} ultima={ultima} medir={medir ? (p) => medir(gi, i, p) : undefined} />
        );
        return tramos.map((tramo, k) => (
          <View
            key={`${g.titulo}-${k}`}
            break={k > 0}
            style={{ marginHorizontal: MARGEN, marginTop: k > 0 ? 0 : 14, borderWidth: 1, borderColor: C.hair, borderRadius: 12, paddingTop: k > 0 ? 4 : 7, paddingBottom: 3, paddingHorizontal: 11 }}
          >
            {k === 0 ? (
              // El título viaja junto con la primera fila: así nunca queda solo al pie de una página.
              <View wrap={false}>
                <View style={{ flexDirection: "row", alignItems: "flex-end", marginBottom: 3 }}>
                  <Text style={{ fontFamily: TEXTO_B, fontSize: 9.5 }}>{g.titulo}</Text>
                  <Text style={{ ...etiqueta, marginLeft: 8 }}>{g.total ? `${g.conformes}/${g.total} conformes` : `${g.filas.length} ítems`}</Text>
                </View>
                {fila(tramo[0], tramo.length === 1)}
              </View>
            ) : (
              fila(tramo[0], tramo.length === 1)
            )}
            {tramo.slice(1).map((x, j) => fila(x, j === tramo.length - 2))}
          </View>
        ));
      })}
    </>
  );
}

function Diagnostico({ r }: { r: Informe }) {
  const caja = { minHeight: 62, borderWidth: 1, borderColor: C.hair, backgroundColor: C.paper, borderRadius: 10, padding: 8 };
  return (
    <View wrap={false}>
      <Text style={{ marginHorizontal: MARGEN, marginTop: 14, fontSize: 6.8, color: C.sub }}>{r.nomenclatura}</Text>
      <View style={{ flexDirection: "row", marginHorizontal: MARGEN - 3, marginTop: 8 }}>
        <View style={{ width: "50%", padding: 3 }}>
          <View style={caja}>
            <Text style={etiqueta}>Observaciones generales</Text>
            <Text style={{ fontSize: 8.5, marginTop: 3 }}>{r.observaciones || "—"}</Text>
          </View>
        </View>
        <View style={{ width: "50%", padding: 3 }}>
          <View style={caja}>
            <Text style={etiqueta}>Consideraciones</Text>
            <Text style={{ fontSize: 8.5, marginTop: 3 }}>{r.consideraciones || "—"}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function Firmas({ r, rec }: { r: Informe; rec: RecursosPdf }) {
  return (
    <View wrap={false} style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: MARGEN - 3, marginTop: 8 }}>
      {r.firmas.map((f) => {
        const img = f.imagenUrl ? rec.imagenes.get(f.imagenUrl) : undefined;
        return (
          <View key={f.rol} style={{ width: "25%", padding: 3 }}>
            <View style={{ borderWidth: 1, borderColor: C.hair, borderRadius: 10, padding: 7, minHeight: 92 }}>
              <Text style={etiqueta}>{f.rol}</Text>
              {img ? <Image src={img} style={{ height: 30, marginTop: 4, objectFit: "contain", objectPosition: "left" }} /> : <View style={{ height: 34 }} />}
              <Text style={{ fontFamily: TEXTO_B, fontSize: 8.5, marginTop: 2 }}>{f.nombre || "Pendiente de firma"}</Text>
              {f.detalle ? <Text style={{ fontSize: 7, color: C.sub, marginTop: 2 }}>{f.detalle}</Text> : null}
              <View style={{ borderTopWidth: 1, borderTopColor: C.graf, marginTop: 4, paddingTop: 2 }}>
                <Text style={{ fontSize: 6.5, color: C.sub }}>{f.fecha ? `Firma · ${f.fecha}` : "Firma"}</Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function Fotos({ r, rec }: { r: Informe; rec: RecursosPdf }) {
  const fotos = r.fotos.filter((f) => rec.imagenes.has(f.url));
  if (fotos.length === 0) return null;
  return (
    <View break>
      <Text style={{ marginHorizontal: MARGEN, marginTop: 6, marginBottom: 8, fontFamily: TEXTO_B, fontSize: 14 }}>Registro fotográfico</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: MARGEN - 7 }}>
        {fotos.map((f, i) => (
          <View key={`${f.n}-${i}`} wrap={false} style={{ width: "50%", padding: 7 }}>
            <Image src={rec.imagenes.get(f.url)!} style={{ height: 200, borderRadius: 10, objectFit: "cover" }} />
            <Text style={{ fontSize: 8, marginTop: 4 }}>
              Punto {f.n}: {f.texto}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * Paginado de las tablas: en la pasada de medición (`medir`) se anota la página de cada fila; en la pasada final
 * (`tramos`) cada grupo se dibuja con un recuadro cerrado por página. Sin ninguno, la tabla va en un solo recuadro.
 */
export interface Paginado {
  medir?: (grupo: number, fila: number, pagina: number) => void;
  tramos?: number[][];
}

/**
 * Espacio que la pasada de medición deja libre al pie de cada página: cubre el cierre del recuadro y la
 * apertura del siguiente, que la pasada final agrega en cada corte, para que las filas no cambien de página.
 */
const HOLGURA_MEDICION = 16;

export function InformePdf({
  informe: r,
  recursos: rec,
  paginado = {},
}: {
  informe: Informe;
  recursos: RecursosPdf;
  paginado?: Paginado;
}) {
  return (
    <Document title={`${r.folio} · ${r.titulo}`} author="BBOSCH" subject={`Inspección ${r.tag}`} language="es-CL">
      <Page
        size="A4"
        style={{ paddingTop: 28, paddingBottom: 50 + (paginado.medir ? HOLGURA_MEDICION : 0), fontFamily: "Helvetica", fontSize: 8.5, color: C.graf }}
      >
        <Hero r={r} rec={rec} />
        <Specs r={r} />
        <Resumen r={r} />
        <Lecturas r={r} />
        <Grupos r={r} paginado={paginado} />
        {/* Cierre (observaciones y firmas) siempre junto: las firmas no quedan solas en una página. */}
        <View wrap={false}>
          <Diagnostico r={r} />
          <Firmas r={r} rec={rec} />
        </View>
        <Fotos r={r} rec={rec} />

        <View fixed style={{ position: "absolute", left: MARGEN, right: MARGEN, bottom: 20, flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: MONO, fontSize: 6.8, color: C.sub }}>
            {r.norma} · {r.tag} · Generado digitalmente {r.generado}
          </Text>
          <Text style={{ fontFamily: MONO, fontSize: 6.8, color: C.sub }} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
