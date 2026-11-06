/**
 * Simulación de terreno: entra como TECNICO_A a la app LOCAL, envía una inspección por cada formato disponible
 * (dos escenarios: «conforme» y «con hallazgos») y descarga cada PDF a una carpeta para revisarlos.
 *
 * Requisitos: `corepack pnpm supabase start` y `corepack pnpm dev` (por defecto http://localhost:3000).
 * Uso:   node scripts/simular-formatos.mjs [carpeta_salida] [--solo=INSP-01,MANT-03] [--url=http://localhost:3000]
 * Solo trabaja contra Supabase local (se niega a correr contra otra URL).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { deflateSync } from "node:zlib";
import { randomUUID } from "node:crypto";
import { createServerClient } from "@supabase/ssr";
import { expandirSecciones } from "../src/lib/templates/repetir.ts";

const args = process.argv.slice(2);
const opt = (n) => args.find((a) => a.startsWith(`--${n}=`))?.split("=")[1];
const BASE = opt("url") ?? "http://localhost:3000";
const SOLO = opt("solo")?.split(",");
const hoy = new Date().toISOString().slice(0, 10);
const SALIDA = args.find((a) => !a.startsWith("--")) ?? path.resolve("..", "simulacion-formatos", hoy);

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

// --- sesión del técnico (cookies idénticas a las que usa la app) ---
const jar = new Map();
const sb = createServerClient(URL_SB, ANON, {
  cookies: { getAll: () => [...jar].map(([name, value]) => ({ name, value })), setAll: (l) => l.forEach(({ name, value }) => (value ? jar.set(name, value) : jar.delete(name))) },
});
const { data: login, error: eLogin } = await sb.auth.signInWithPassword({ email: "tecnico_a@mlp.local", password: "CLAVE-ELIMINADA" });
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

// --- generación de respuestas ---
const SEVERIDADES = ["baja", "media", "alta", "critica"];
const num = (it) => (it.min !== undefined && it.max !== undefined ? (it.min + it.max) / 2 : it.min ?? it.max ?? 10);

async function subir(inspId, kind, buf, ext, mime) {
  const id = randomUUID();
  const storage_path = `${userId}/${inspId}/${id}.${ext}`;
  const { error } = await sb.storage.from("inspection-photos").upload(storage_path, buf, { contentType: mime, upsert: true });
  if (error) throw new Error(`Storage: ${error.message}`);
  return { id, storage_path, kind, mime, size_bytes: buf.length };
}

function tagPara(formato, i) {
  const d = formato.designadores;
  const pool = maestro.filter((m) => d.includes(m.designador) && (!formato.areas.length || formato.areas.includes(m.area)));
  return pool[i % Math.max(pool.length, 1)]?.tag ?? `SIM-${formato.id}-${i + 1}`;
}

async function armar(formato, tpl, hallazgos) {
  const inspId = randomUUID(), schema = tpl.schema, adj = [], answers = [], findings = [];
  const estadosPlantilla = schema.estados;
  const conRep = {};
  if (hallazgos) for (const s of schema.sections) if (s.repetible) conRep[s.id] = 2;
  const secciones = expandirSecciones(schema, conRep);
  const fotoOk = await subir(inspId, "photo", FOTO, "png", "image/png");
  adj.push(fotoOk);
  let nML = 0;

  for (const s of secciones) for (const it of s.items) {
    if (it.type === "verificacion") {
      const ests = it.estados ?? estadosPlantilla ?? ["BN", "ML", "NT", "NA", "NR"];
      const bueno = ests.includes("RL") ? "RL" : ests.includes("BN") ? "BN" : ests[0];
      const v = { estado: bueno };
      if (it.unit !== undefined) v.valor = num(it);
      if (hallazgos && nML < 3 && ests.includes("ML") && answers.length % 4 === 1) {
        nML++;
        const f = await subir(inspId, "finding_photo", FOTO, "png", "image/png");
        adj.push(f);
        v.estado = "ML"; v.obs = `Hallazgo simulado ${nML}: desgaste visible, requiere revisión por Supervisión.`; v.fotos = [f.id];
        findings.push({ id: randomUUID(), item_key: it.id, severity: SEVERIDADES[(nML - 1) % 4], description: v.obs, photo_attachment_id: f.id });
      } else if (hallazgos && ests.includes("NA") && answers.length % 7 === 3) { v.estado = "NA"; }
      answers.push({ item_key: it.id, value: v });
    } else if (it.type === "number") answers.push({ item_key: it.id, value: num(it) });
    else if (it.type === "text") answers.push({ item_key: it.id, value: it.multiline ? "Texto de simulación.\nSegunda línea del campo." : "Simulación" });
    else if (it.type === "photo") answers.push({ item_key: it.id, value: [fotoOk.id] });
    else if (it.type === "nameplate") answers.push({ item_key: it.id, value: Object.fromEntries(it.fields.map((f) => [f.key, `SIM-${f.key}`])) });
  }

  const header = {};
  for (const h of schema.header) {
    header[h.key] = h.key === "tag" ? tagPara(formato, hallazgos ? 1 : 0)
      : h.options?.length ? h.options[0]
      : h.input === "date" ? hoy : h.input === "time" ? (h.key.includes("fin") ? "10:30" : "08:00")
      : h.input === "number" ? "1" : h.key === "ot" ? "4500123456" : `Simulación ${h.label}`;
  }
  const firma = await subir(inspId, "participant_signature", FIRMA, "png", "image/png");
  adj.push(firma);
  const roles = Object.fromEntries(schema.roles.map((r) => [r, /encargado/i.test(r) ? "Técnico A" : `Persona ${r}`]));
  const rolEnc = schema.roles.find((r) => /encargado/i.test(r));

  if (Object.keys(conRep).length) answers.push({ item_key: "_repeticiones", value: conRep });
  answers.push({ item_key: "_header", value: header });
  answers.push({ item_key: "_ejecutor", value: "Técnico A" });
  answers.push({ item_key: "_lista_participantes", value: "Participante Uno, Participante Dos" });
  answers.push({ item_key: "_participantes", value: { nombres: rolEnc ? "Técnico A" : "", firmaId: firma.id } });
  answers.push({ item_key: "_roles", value: roles });
  answers.push({ item_key: "_diagnostico", value: { observaciones: hallazgos ? "Se detectan hallazgos simulados." : "Sin observaciones.", consideraciones: "Documento generado por la simulación de formatos." } });

  return {
    inspection: { id: inspId, area_id: areas.get(formato.areas[0] ?? "chacay"), equipment_type_id: tipos.get(formato.plantilla.tipoEquipo), work_mode_id: modos.get(formato.plantilla.modo), template_id: tpl.id, equipment_tag: header.tag ?? "", started_at: new Date().toISOString(), performed_by: "Técnico A" },
    answers, findings, attachments: adj,
  };
}

// --- ejecución ---
mkdirSync(SALIDA, { recursive: true });
const formatos = FORMATOS.filter((f) => f.estado === "disponible" && (!SOLO || SOLO.includes(f.id)));
const filas = [];
console.log(`Simulando ${formatos.length} formatos × 2 escenarios → ${SALIDA}`);

for (const f of formatos) for (const [esc, hallazgos] of [["conforme", false], ["con-hallazgos", true]]) {
  const fila = { formato: f.id, titulo: f.titulo.trim(), escenario: esc, envio: "", pdf: "", kb: 0, paginas: "", detalle: "", archivo: "" };
  try {
    const tpl = plantillas.get(`${tipos.get(f.plantilla.tipoEquipo)}|${modos.get(f.plantilla.modo)}`);
    if (!tpl) throw new Error(`Sin plantilla publicada para ${f.plantilla.tipoEquipo} × ${f.plantilla.modo}`);
    const payload = await armar(f, tpl, hallazgos);
    const { data, error } = await sb.rpc("submit_inspection", { p: payload });
    if (error) { fila.envio = "FALLA"; throw new Error(`Envío rechazado: ${error.message}`); }
    fila.envio = "ok"; fila.detalle = `folio ${data.folio}`;
    const res = await fetch(`${BASE}/tecnico/${data.id}/pdf`, { headers: { cookie: cookie() }, signal: AbortSignal.timeout(120_000) });
    const buf = Buffer.from(await res.arrayBuffer());
    if (!res.ok || buf.subarray(0, 4).toString() !== "%PDF") throw new Error(`PDF HTTP ${res.status}: ${buf.subarray(0, 300).toString().replace(/\s+/g, " ")}`);
    const nombre = `${f.id}_${esc}.pdf`;
    writeFileSync(path.join(SALIDA, nombre), buf);
    fila.pdf = "ok"; fila.kb = Math.round(buf.length / 1024); fila.archivo = nombre;
    fila.paginas = (buf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []).length;
  } catch (e) {
    fila.pdf ||= "FALLA"; fila.detalle = `${fila.detalle} ${e.message}`.trim();
  }
  filas.push(fila);
  console.log(`${fila.pdf === "ok" ? "✔" : "✘"} ${f.id} ${esc}${fila.pdf === "ok" ? ` · ${fila.paginas} pág · ${fila.kb} KB` : ` · ${fila.detalle}`}`);
}

const fallas = filas.filter((x) => x.pdf !== "ok");
const md = [
  `# Simulación de formatos · ${hoy}`, "",
  `Técnico: TECNICO_A · App: ${BASE} · Generado: ${new Date().toLocaleString("es-CL", { timeZone: "America/Santiago" })}`, "",
  `**${filas.length - fallas.length} de ${filas.length} PDF generados; ${fallas.length} con falla.**`, "",
  "| Formato | Título | Escenario | Envío | PDF | Páginas | KB | Detalle |", "|---|---|---|---|---|---|---|---|",
  ...filas.map((x) => `| ${x.formato} | ${x.titulo} | ${x.escenario} | ${x.envio} | ${x.pdf} | ${x.paginas} | ${x.kb} | ${x.detalle.replace(/\|/g, "/")} |`),
].join("\n");
writeFileSync(path.join(SALIDA, "RESUMEN.md"), md);
console.log(`\n${filas.length - fallas.length}/${filas.length} PDF generados. Resumen: ${path.join(SALIDA, "RESUMEN.md")}`);
process.exit(fallas.length ? 2 : 0);
