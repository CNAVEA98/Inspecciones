/**
 * Carga en la app LOCAL las inspecciones manuales de terreno (papel, sep–oct 2026) con los valores que escribieron los
 * técnicos, y descarga el PDF digital de cada una para compararlo con el escaneo.
 * Los datos están transcritos a mano de los escaneos (ver docs/COMPARATIVA_MANUALES_2026-11-07.md). Las fotos y la firma son sintéticas.
 *
 * Requisitos: `corepack pnpm supabase start` y `corepack pnpm dev`.
 * Uso:   node scripts/simular-manuales.mjs [carpeta_salida] [--url=http://localhost:3000]
 * Solo trabaja contra Supabase local.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { deflateSync } from "node:zlib";
import { randomUUID } from "node:crypto";
import { createServerClient } from "@supabase/ssr";

const args = process.argv.slice(2);
const opt = (n) => args.find((a) => a.startsWith(`--${n}=`))?.split("=")[1];
const BASE = opt("url") ?? "http://localhost:3000";
const hoy = new Date().toISOString().slice(0, 10);
const SALIDA = args.find((a) => !a.startsWith("--")) ?? path.resolve("..", "simulacion-formatos", `manuales-${hoy}`);


// --- entorno (.env.local, solo lectura) ---
const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const URL_SB = env.NEXT_PUBLIC_SUPABASE_URL, ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!/^https?:\/\/(127\.0\.0\.1|localhost)/.test(URL_SB)) {
  console.error(`Se niega a correr: NEXT_PUBLIC_SUPABASE_URL no es local (${URL_SB}).`);
  process.exit(1);
}

// --- imágenes sintéticas (PNG sin dependencias) ---
const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
function png(w, h, px) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const [r, g, b, a] = px(x, y); const o = y * (w * 4 + 1) + 1 + x * 4; raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = a; }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}
const FOTO = png(480, 320, (x, y) => [40 + (x * 150) / 480, 90 + (y * 100) / 320, 160, 255]);
const FIRMA = (() => {
  const W = 360, H = 120, tinta = new Set();
  for (let t = 0; t < 1; t += 0.0008) {
    const x = 20 + t * 320, y = 60 + Math.sin(t * 22) * 28 * (1 - t * 0.5);
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) tinta.add(`${Math.round(x) + dx},${Math.round(y) + dy}`);
  }
  return png(W, H, (x, y) => (tinta.has(`${x},${y}`) ? [20, 30, 80, 255] : [0, 0, 0, 0]));
})();

const CLAVES = JSON.parse(readFileSync("supabase/.claves-dev.json", "utf8")); // generado por `corepack pnpm seed:usuarios` (no se versiona)
// --- sesión del técnico (cookies idénticas a las que usa la app) ---
const jar = new Map();
const sb = createServerClient(URL_SB, ANON, {
  cookies: { getAll: () => [...jar].map(([name, value]) => ({ name, value })), setAll: (l) => l.forEach(({ name, value }) => (value ? jar.set(name, value) : jar.delete(name))) },
});
const { data: login, error: eLogin } = await sb.auth.signInWithPassword({ email: "tecnico_a@mlp.local", password: CLAVES.tecnico_a });
if (eLogin) { console.error("No se pudo entrar como TECNICO_A:", eLogin.message); process.exit(1); }
const userId = login.user.id;
const cookie = () => [...jar].map(([n, v]) => `${n}=${v}`).join("; ");

// --- catálogo y plantillas publicadas ---
const q = async (p) => { const { data, error } = await p; if (error) throw new Error(error.message); return data; };
const areas = new Map((await q(sb.from("areas").select("id, code"))).map((a) => [a.code, a.id]));
const tipos = new Map((await q(sb.from("equipment_types").select("id, code"))).map((a) => [a.code, a.id]));
const modos = new Map((await q(sb.from("work_modes").select("id, code"))).map((a) => [a.code, a.id]));
const plantillas = new Map();
for (const t of await q(sb.from("form_templates").select("id, equipment_type_id, work_mode_id, version, schema").eq("status", "published").order("version"))) {
  plantillas.set(`${t.equipment_type_id}|${t.work_mode_id}`, t);
}
const FORMATOS = (await q(sb.from("formatos").select("id, tipo, titulo, areas, designadores, tipo_equipo_code, modo_code, activo").order("orden")))
  .map((f) => ({ id: f.id, tipo: f.tipo, titulo: f.titulo, areas: f.areas ?? [], designadores: f.designadores ?? [], estado: f.tipo_equipo_code && f.activo ? "disponible" : "proximamente", plantilla: f.tipo_equipo_code ? { tipoEquipo: f.tipo_equipo_code, modo: f.modo_code } : undefined }));
const maestro = JSON.parse(readFileSync("src/data/maestro-tags.json", "utf8"));


// ───────────────────────── Datos transcritos de los manuales ─────────────────────────
// Cada «vals» va en el orden de los ítems de la plantilla digital. Fichas:
//   "BN"  "NT"  "NA"  "NR|motivo"  "ML|obs"  "BN#25" (estado + valor)  "BN|obs"  "-" (el papel no tiene ese ítem)
//   "NP:clave=valor;clave=valor" (ítem de placa).
const r = (n, t) => Array(n).fill(t);
const SG16 = ["BN", "NT", "NT", "BN", "BN", "BN", "BN|Local", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "NT"];

const CASOS = [
  { archivo: "IEP_120ER106", formato: "INSP-04", area: "mina", tag: "120-ER-106", ot: "4988555", ubic: "TP1", fecha: "2026-10-29", ini: "17:30", fin: "18:50",
    gente: ["Fabián Olivares"], enc: "Fabián Olivares", sup: "Claudio Valdés", pla: "Juan Gómez",
    vals: [...r(10, "BN"), "NT", "BN", "-", ...r(6, "BN"), "BN", "NA", "NP:cubiculo=B11 barra 1;dia_lectura=Jue;valor_psi=13", "NP:toma=Temperatura interior sala eléctrica (°C);dia_lectura=Jue;valor=16.9"],
    diag: "Polvo en sala por puertas abiertas y goma de puerta principal en mal estado. 2 tubos fluorescentes quemados. Se realiza aseo a piso." },
  { archivo: "IEP_120ER5001", formato: "INSP-04", area: "mina", tag: "120-ER-5001", tagFuera: true, ot: "4988556", ubic: "TP2", fecha: "2026-10-29", ini: "12:00", fin: "13:30",
    gente: ["Fabián Olivares"], enc: "Fabián Olivares", sup: "Claudio Valdés", pla: "Juan Gómez",
    vals: [...r(10, "BN"), "NT", "BN", "-", "NT", ...r(5, "BN"), "BN", "NA", "NP:cubiculo=B11 barra 1;dia_lectura=Jue;valor_psi=14", "NP:toma=Temperatura interior sala eléctrica (°C);dia_lectura=Jue;valor=22"],
    diag: "No hay luz de emergencia." },
  { archivo: "IEP_730GG017", formato: "INSP-16", area: "chacay", tag: "730-GG-017", ot: "4988531", ubic: "Hotel Mina", pot: "390 kVA", fecha: "2026-10-29", ini: "11:00", fin: "12:15",
    gente: ["Fabián Olivares"], enc: "Fabián Olivares", sup: "Claudio Valdés", pla: "Juan Gómez",
    vals: ["NT", "BN", "NT", "NT", "BN#6072.53", "BN|Nivel 90%", "BN|En papel: «380/220V» (un voltaje, no kWh)", "BN", "BN", "ML|Luces pilotos en mal estado", "NT", "BN", "BN", "NR|No presenta visor de T° de aceite", "BN",
      "BN", "BN", "BN", "BN", "BN", "NT", "BN", "BN", "BN", "NT", "NT", "BN", "BN", "NT", "NT"],
    diag: "Luces pilotos en mal estado. NR No realizado, no presenta visor de T° de aceite." },
  { archivo: "IEP_730GG018", formato: "INSP-16", area: "chacay", tag: "730-GG-018", ot: "4988532", ubic: "Red Incendio Hotel Mina", pot: "40 kVA", fecha: "2026-10-29", ini: "14:00", fin: "15:00",
    gente: ["Fabián Olivares"], enc: "Fabián Olivares", sup: "Claudio Valdés", pla: "Juan Gómez",
    vals: ["NT", "BN", "NT", "NT", "BN#1077.33", "BN|Nivel 89%", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "NT", "BN",
      "BN", "BN", "BN", "BN", "NT", "NT", "BN", "BN", "BN", "NT", "NT", "BN", "BN", "NT", "BN"],
    diag: "No hay luz de emergencia." },
  { archivo: "Insp_370XF1480_OT5005665", formato: "INSP-12", area: "valle", tag: "370-XF-1480", ot: "5005665", ubic: "Estación booster", fecha: "2026-10-21", ini: "10:00", fin: "11:00",
    extra: { aceite_cant: "1100", aceite_tipo: "Vegetal", tension: "23000/400", potencia: "1500 kVA", serie: "39805", conexion: "Dyn-1" },
    gente: ["Nicolás Rojas S"], enc: "Luis Ponce", sup: "Álvaro Carmona", pla: "",
    vals: ["BN", "BN#25", "BN#37", "BN#30", "BN#50", "BN", "BN#25", "BN|Presión 0.8", "BN#3", "BN", "BN", "BN", "BN", "BN", ...r(6, "NT"), "BN", "BN", "NT", "BN", "BN", "BN", "BN", "BN", "BN"],
    diag: "Extintor vence en diciembre del presente año." },
  { archivo: "INSP_Carg-bat_560BC002_OT4906905", formato: "INSP-17", area: "puerto", tag: "560-BC-002", ot: "4906905", ubic: "PPCH - Sala eléctrica N°16", fecha: "2026-09-09", ini: "17:00", fin: "17:30",
    extra: { serie: "" }, gente: ["Daniel Guerra J."], enc: "Nicolás Rojas", sup: "Luis Ponce", pla: "Esteban Rocha G.",
    vals: ["BN#136", "BN#136.8", "BN#136", "BN#0.2", "-", "BN|Operativo: Sí", ...r(4, "BN"), ...r(5, "BN"), "-", ...r(8, "-")],
    diag: "Cargador de baterías sin anomalías. Aseo general correcto." },
  { archivo: "INSP_Carg-bat_560BC001_OT4906905", formato: "INSP-17", area: "puerto", tag: "560-BC-001", ot: "4906905", ubic: "PPCH - Sala eléctrica N°16", fecha: "2026-09-09", ini: "16:00", fin: "16:30",
    extra: { serie: "52767-1 / 347660-1WH" }, gente: ["Daniel Guerra J."], enc: "Nicolás Rojas", sup: "Luis Ponce", pla: "Esteban Rocha G.",
    vals: ["BN#136", "BN#136.9", "BN#136", "BN#0.3", "-", "BN|Operativo: Sí", ...r(4, "BN"), ...r(5, "BN"), "-", ...r(8, "-")],
    diag: "Cargador de baterías sin anomalías. Aseo general correcto." },
  { archivo: "Insp_Parron_PPCH_OT4921133", formato: "INSP-09", area: "puerto", tag: "560-PM-562", ot: "4921133", ubic: "Parrón de llegada PPCH", fecha: "2026-08-17", ini: "09:00", fin: "10:00",
    gente: ["Nicolás Rojas"], enc: "Luis Ponce", sup: "Álvaro Carmona", pla: "Juan Gómez",
    vals: [...r(7, "BN"), "NT", ...r(5, "BN"), "NT", "BN", ...r(5, "NA"), "NT", "NA", "NA", "NT", ...r(4, "NA"), "NT", ...r(5, "NA"), "BN", "BN", "NR|En papel se anotó «RL» (sin equivalente en BN/ML/NT/NA/NR)", "NT", "NT"],
    diag: "" },
  { archivo: "Insp_Seccionador23kV_Balsas9_OT4974423", formato: "INSP-01", area: "mauro", tag: "4330-SW-4007", tagFuera: true, ot: "4974423", ubic: "Estación Balsas N°9", fecha: "2026-10-04", ini: "11:05", fin: "11:30",
    gente: ["Nicolás Rojas S"], enc: "Jorge Salgado", sup: "Álvaro Carmona", pla: "Juan Pablo Gómez",
    // El papel (SJ ATXXX, Rev. 1 feb 2026, 19 ítems) no coincide con INSP-01: se cargó por afinidad de texto; lo que no tiene ítem digital queda en "-".
    vals: ["BN", "BN", "BN", "BN", "-", "-", "-", "BN", "BN", "-", "-", "BN", "-", "-", "BN", "BN", "-", "NR|Resultados termográficos se anexan", "NT", "NT", "-", "-", "-", "-"],
    diag: "Sistema operativo sin inconvenientes." },
  ...[["52-1", "133"], ["52-2", "112"]].map(([cub, ops], i) => ({ archivo: `Insp_SG23kV_Booster_${cub}_OT4844623`, formato: "INSP-13", area: "valle", tag: "370-SG-1180", ot: "4844623", ubic: "Estación booster", fecha: "2026-09-21", ini: "12:00", fin: "13:00",
    extra: { serie: "ZS351-220-POA-ESMO-00003", marca: "Rolec S.A", tension: "23 kV" }, cubiculo: cub, gente: ["Marco Ahumada"], enc: "Nicolás Rojas", sup: "Álvaro Carmona", pla: "Juan Gómez",
    vals: [...(i === 0 ? ["BN", "NT", "NT", "BN", "BN", "BN", "BN|Local", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "NT"] : ["BN", "NT", "NT", "NT", "NT", "BN", "BN|Local", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "NT"]), `NP:horometro=;operaciones=${ops}`],
    diag: "Equipo operativo sin anomalías presentes." })),
  ...[["52-1", "4906910", "", "556", "BN"], ["52-2", "4906911", "54693", "700", "BN|Remoto"], ["52-3", "4906920", "", "728", "BN|Local"], ["52-4", "4906918", "", "839", "BN|Local"], ["52-5", "4906919", "", "1306", "BN|Remoto"]].map(([cub, ot, hor, ops, sel]) => ({
    archivo: `Insp_SG_560SG562_${cub}_OT${ot}`, formato: "INSP-13", area: "puerto", tag: `560-SG-562 / ${cub}`, ot, ubic: "PPCH - Sala eléctrica N°16", fecha: "2026-09-07", ini: "", fin: "",
    extra: { serie: "", marca: "Rolec S.A", tension: "23 kV" }, cubiculo: cub, gente: ["Nicolás Rojas S", "Manuel Pastén B"], enc: "R. Cautivo (AGG)", sup: "", pla: "",
    vals: ["BN", "BN", "BN", "NT", "NT", "BN", sel, "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "NT", `NP:horometro=${hor};operaciones=${ops}`].filter((_, k) => k !== 6 || true),
    diag: "Equipo switchgear operando en forma normal. Se instala cinta de distancia de seguridad en piso." })),
  { archivo: "Mtto_Interruptor_52-1_OT4794431", formato: "INSP-13", area: "puerto", tag: "530-SG-1001 / 52-1", tagSupuesto: "INT 52-1 / 530-XF-531", ot: "4794431", ubic: "Sala eléctrica 12", fecha: "2026-09-08", ini: "17:00", fin: "17:30",
    extra: { serie: "ODC-MIP-SP-002", marca: "Eaton", tension: "23 kV" }, cubiculo: "52-1", gente: ["Manuel Pastén B. (Linero)"], enc: "Nicolás Rojas", sup: "Luis Ponce", pla: "",
    vals: [...SG16, "NP:horometro=;operaciones=172"], diag: "Aseo general en buen estado. Interruptor operando sin inconvenientes." },
  { archivo: "INSP-PRUEBA_OP_4260GE1000", formato: "INSP-16", area: "mauro", tag: "4260-GE-1000", ot: "4898271", ubic: "Estación disipadora", pot: "150 kVA", fecha: "2026-09-03", ini: "18:00", fin: "18:30",
    gente: ["Nicolás Rojas S."], enc: "Manuel Pastén", sup: "Álvaro Carmona", pla: "Juan Pablo Gómez",
    vals: ["NT", "BN", "BN#13.7", "BN#0.1", "BN#973.58|En papel: horómetro inicial 973,58 y final 974,01", "BN|Nivel 99%", "NT", "BN", "BN", "BN", "NT", "NT", "BN", "BN#37", "BN", "BN", "BN", "BN", "BN", "NT", "NT", "BN|Fecha mantención extintores: Jun 2027", "BN", "BN", "BN", "NT", "BN", "BN", "NT", "-"],
    diag: "Prueba funcional realizada sin inconvenientes. Nivel de combustible 99%. Extintor disponible y mantención al día." },
  { archivo: "Mant_GG_Disipadora_4260GG1000", formato: "MANT-01", area: "mauro", tag: "4260-GE-1000", tagSupuesto: "4260-GG-1000", ot: "4781557", ubic: "Estación disipadora", fecha: "2026-10-05", ini: "11:00", fin: "13:30",
    extra: { n_serie: "065360", potencia: "150 kVA", tension: "400-231 V", marca: "Lureye", horometro: "974.10", capacidad_interruptor_gr: "250 A" },
    gente: ["Maykol Biaggini (Electromecánico)"], enc: "Jorge Salgado", sup: "Álvaro Carmona Calderón", pla: "Víctor Juan Pablo Gómez",
    vals: ["BN", "RL", "RL", "BN", "BN", "RL", "BN", "BN|Nivel combustible 99%", "BN#13.3", "BN#50", "BN", "BN", "BN", "RL", "RL", "RL", "RL", "RL", "BN", "BN", "RL", "BN", "BN", "BN"],
    diag: "No se encuentra plano de equipo en terreno. Se realiza limpieza, reapriete de conexión, ordenamiento de cables y verificación de componentes de GG." },
];

// ───────────────────────── Carga ─────────────────────────
async function subir(inspId, kind, buf) {
  const id = randomUUID(), storage_path = `${userId}/${inspId}/${id}.png`;
  const { error } = await sb.storage.from("inspection-photos").upload(storage_path, buf, { contentType: "image/png", upsert: true });
  if (error) throw new Error(`Storage: ${error.message}`);
  return { id, storage_path, kind, mime: "image/png", size_bytes: buf.length };
}
const fmt = (id) => FORMATOS.find((f) => f.id === id);

async function armar(c) {
  const f = fmt(c.formato);
  const tpl = plantillas.get(`${tipos.get(f.plantilla.tipoEquipo)}|${modos.get(f.plantilla.modo)}`);
  if (!tpl) throw new Error("Sin plantilla publicada");
  const schema = tpl.schema, inspId = randomUUID(), adj = [], answers = [], findings = [];
  const items = schema.sections.flatMap((s) => s.items);
  if (items.length !== c.vals.length) throw new Error(`${items.length} ítems en la plantilla y ${c.vals.length} fichas del manual`);
  for (const [i, it] of items.entries()) {
    const t = c.vals[i];
    if (t === "-") continue;
    if (it.type === "verificacion") {
      const [head, ...o] = t.split("|");
      const obs = o.join("|") || undefined;
      const [estado, val] = head.split("#");
      const v = { estado };
      if (val !== undefined) v.valor = Number(val);
      if (obs) v.obs = obs;
      if (estado === "ML") {
        const ph = await subir(inspId, "finding_photo", FOTO);
        adj.push(ph);
        v.fotos = [ph.id];
        findings.push({ id: randomUUID(), item_key: it.id, severity: "media", description: obs, photo_attachment_id: ph.id });
      }
      answers.push({ item_key: it.id, value: v });
    } else if (it.type === "text") answers.push({ item_key: it.id, value: t.replace(/^T:/, "") });
    else if (it.type === "nameplate") {
      const kv = Object.fromEntries(t.replace(/^NP:/, "").split(";").map((p) => { const k = p.indexOf("="); return [p.slice(0, k), p.slice(k + 1)]; }));
      answers.push({ item_key: it.id, value: Object.fromEntries(it.fields.map((fl) => [fl.key, kv[fl.key] ?? ""])) });
    }
  }
  const header = {};
  for (const h of schema.header) {
    header[h.key] = ({ tag: c.tag, ot: c.ot, ubicacion: c.ubic, fecha: c.fecha, h_inicio: c.ini, h_fin: c.fin, potencia: c.pot, ...(c.extra ?? {}) })[h.key] ?? "";
  }
  if (c.tagFuera) header.tag_estado = "propuesto";
  const firma = await subir(inspId, "participant_signature", FIRMA);
  adj.push(firma);
  const roles = Object.fromEntries(schema.roles.map((rol) => [rol, /encargado/i.test(rol) ? c.enc : /supervisor/i.test(rol) ? c.sup : c.pla]));
  answers.push({ item_key: "_header", value: header });
  answers.push({ item_key: "_ejecutor", value: c.enc });
  answers.push({ item_key: "_lista_participantes", value: c.gente.join(", ") });
  answers.push({ item_key: "_participantes", value: { nombres: c.gente.join(", "), firmaId: firma.id } });
  answers.push({ item_key: "_roles", value: roles });
  answers.push({ item_key: "_diagnostico", value: { observaciones: c.diag, consideraciones: "" } });
  return {
    inspection: { id: inspId, area_id: areas.get(c.area), equipment_type_id: tipos.get(f.plantilla.tipoEquipo), work_mode_id: modos.get(f.plantilla.modo), template_id: tpl.id, equipment_tag: header.tag, started_at: new Date(`${c.fecha}T${c.ini || "09:00"}:00-03:00`).toISOString(), performed_by: c.enc },
    answers, findings, attachments: adj,
  };
}

mkdirSync(SALIDA, { recursive: true });
const filas = [];
for (const c of CASOS) {
  const fila = { archivo: c.archivo, formato: c.formato, tag: c.tag, envio: "", pdf: "", paginas: "", detalle: "" };
  try {
    const { data, error } = await sb.rpc("submit_inspection", { p: await armar(c) });
    if (error) { fila.envio = "FALLA"; throw new Error(`Envío rechazado: ${error.message}`); }
    fila.envio = "ok";
    fila.detalle = data.folio;
    const res = await fetch(`${BASE}/tecnico/${data.id}/pdf`, { headers: { cookie: cookie() }, signal: AbortSignal.timeout(120_000) });
    const buf = Buffer.from(await res.arrayBuffer());
    if (!res.ok || buf.subarray(0, 4).toString() !== "%PDF") throw new Error(`PDF HTTP ${res.status}`);
    writeFileSync(path.join(SALIDA, `${c.archivo}__digital.pdf`), buf);
    fila.pdf = "ok";
    fila.paginas = (buf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []).length;
  } catch (e) { fila.pdf ||= "FALLA"; fila.detalle = `${fila.detalle} ${e.message}`.trim(); }
  filas.push(fila);
  console.log(`${fila.pdf === "ok" ? "OK " : "ERR"} ${c.archivo} -> ${c.formato} · ${fila.detalle}${fila.paginas ? ` · ${fila.paginas} pág` : ""}`);
}
writeFileSync(path.join(SALIDA, "resultado.json"), JSON.stringify(filas, null, 2));
process.exit(filas.some((x) => x.pdf !== "ok") ? 2 : 0);
