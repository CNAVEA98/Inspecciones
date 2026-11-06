/**
 * Prueba de estabilidad y rendimiento (solo contra la app y el Supabase LOCALES).
 * Turno A: N sesiones de técnico (por defecto 12) envían formatos a la vez; 1 supervisor y 1 programador consultan su
 * bandeja, abren cada inspección y la firman. Mide tiempos, detecta operaciones «pegadas» y errores, y escribe un informe.
 *
 * Requisitos: `corepack pnpm supabase start` y la app corriendo (mejor `pnpm build && pnpm start`: es lo que se despliega).
 * Uso:  node scripts/prueba-carga.mjs [carpeta_salida] [--tecnicos=12] [--rondas=5] [--url=http://localhost:3000] [--limite=60]
 * Deja datos de prueba en la base local: `corepack pnpm supabase db reset` los limpia.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { deflateSync } from "node:zlib";
import { randomUUID } from "node:crypto";
import { createServerClient } from "@supabase/ssr";
import { expandirSecciones } from "../src/lib/templates/repetir.ts";

const args = process.argv.slice(2);
const opt = (n, d) => args.find((a) => a.startsWith(`--${n}=`))?.split("=")[1] ?? d;
const BASE = opt("url", "http://localhost:3000");
const N_TEC = Number(opt("tecnicos", 12));
const RONDAS = Number(opt("rondas", 5));
const LIMITE_MS = Number(opt("limite", 60)) * 1000; // una operación que pasa de esto se considera «pegada»
const hoy = new Date().toISOString().slice(0, 10);
const SALIDA = args.find((a) => !a.startsWith("--")) ?? path.resolve("..", "simulacion-formatos", `${hoy}-carga`);

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const URL_SB = env.NEXT_PUBLIC_SUPABASE_URL, ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!/^https?:\/\/(127\.0\.0\.1|localhost)/.test(URL_SB)) {
  console.error(`Se niega a correr: NEXT_PUBLIC_SUPABASE_URL no es local (${URL_SB}).`);
  process.exit(1);
}
if (!/^https?:\/\/(127\.0\.0\.1|localhost)/.test(BASE)) {
  console.error(`Se niega a correr: la app no es local (${BASE}).`);
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

// --- generación de respuestas ---
const SEVERIDADES = ["baja", "media", "alta", "critica"];
const num = (it) => (it.min !== undefined && it.max !== undefined ? (it.min + it.max) / 2 : it.min ?? it.max ?? 10);

function tagPara(formato, i) {
  const d = formato.designadores;
  const pool = maestro.filter((m) => d.includes(m.designador) && (!formato.areas.length || formato.areas.includes(m.area)));
  return pool[i % Math.max(pool.length, 1)]?.tag ?? `SIM-${formato.id}-${i + 1}`;
}

async function armar(ctx, formato, tpl, hallazgos) {
  const inspId = randomUUID(), schema = tpl.schema, adj = [], answers = [], findings = [];
  const estadosPlantilla = schema.estados;
  const conRep = {};
  if (hallazgos) for (const s of schema.sections) if (s.repetible) conRep[s.id] = 2;
  const secciones = expandirSecciones(schema, conRep);
  const fotoOk = await ctx.subir(inspId, "photo", FOTO, "png", "image/png");
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
        const f = await ctx.subir(inspId, "finding_photo", FOTO, "png", "image/png");
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
  const firma = await ctx.subir(inspId, "participant_signature", FIRMA, "png", "image/png");
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


const CLAVES = JSON.parse(readFileSync("supabase/.claves-dev.json", "utf8")); // generado por `corepack pnpm seed:usuarios` (no se versiona)

// ---------- sesiones ----------
const ahora = () => performance.now();
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const conLimite = (p, etiqueta) =>
  Promise.race([p, dormir(LIMITE_MS).then(() => { throw new Error(`PEGADO: ${etiqueta} sin respuesta en ${LIMITE_MS / 1000} s`); })]);

async function sesion(usuario, clave) {
  const jar = new Map();
  const sb = createServerClient(URL_SB, ANON, {
    cookies: { getAll: () => [...jar].map(([name, value]) => ({ name, value })), setAll: (l) => l.forEach(({ name, value }) => (value ? jar.set(name, value) : jar.delete(name))) },
  });
  const { data, error } = await sb.auth.signInWithPassword({ email: `${usuario}@mlp.local`, password: clave });
  if (error) throw new Error(`No se pudo entrar como ${usuario}: ${error.message}`);
  const userId = data.user.id;
  return {
    sb, userId, usuario,
    cookie: () => [...jar].map(([n, v]) => `${n}=${v}`).join("; "),
    async subir(inspId, kind, buf, ext, mime) {
      const id = randomUUID();
      const storage_path = `${userId}/${inspId}/${id}.${ext}`;
      const { error: e } = await sb.storage.from("inspection-photos").upload(storage_path, buf, { contentType: mime, upsert: true });
      if (e) throw new Error(`Storage: ${e.message}`);
      return { id, storage_path, kind, mime, size_bytes: buf.length };
    },
    async get(ruta) {
      const t = ahora();
      const res = await conLimite(fetch(`${BASE}${ruta}`, { headers: { cookie: this.cookie() }, redirect: "manual" }), `GET ${ruta}`);
      const cuerpo = Buffer.from(await conLimite(res.arrayBuffer(), `cuerpo ${ruta}`));
      return { status: res.status, ms: ahora() - t, cuerpo };
    },
  };
}

const admin = await sesion("tecnico_a", CLAVES.tecnico_a);
const q = async (p) => { const { data, error } = await p; if (error) throw new Error(error.message); return data; };
const areas = new Map((await q(admin.sb.from("areas").select("id, code"))).map((a) => [a.code, a.id]));
const tipos = new Map((await q(admin.sb.from("equipment_types").select("id, code"))).map((a) => [a.code, a.id]));
const modos = new Map((await q(admin.sb.from("work_modes").select("id, code"))).map((a) => [a.code, a.id]));
const plantillas = new Map();
for (const t of await q(admin.sb.from("form_templates").select("id, equipment_type_id, work_mode_id, version, schema").eq("status", "published").order("version"))) {
  plantillas.set(`${t.equipment_type_id}|${t.work_mode_id}`, t);
}
const todos = (await q(admin.sb.from("formatos").select("id, tipo, titulo, areas, designadores, tipo_equipo_code, modo_code, activo").order("orden")))
  .filter((f) => f.tipo_equipo_code && f.activo)
  .map((f) => ({ id: f.id, titulo: f.titulo, areas: f.areas ?? [], designadores: f.designadores ?? [], plantilla: { tipoEquipo: f.tipo_equipo_code, modo: f.modo_code } }));
// Mezcla de formatos livianos y pesados.
const PREFERIDOS = ["INSP-01", "INSP-02", "INSP-14", "INSP-31", "MANT-05", "MANT-09", "MANT-13", "MANT-16"];
const FORMATOS = PREFERIDOS.map((id) => todos.find((f) => f.id === id)).filter(Boolean);
if (FORMATOS.length === 0) throw new Error("No hay formatos disponibles en la base local (¿corrió el seed?).");
const maestro = JSON.parse(readFileSync("src/data/maestro-tags.json", "utf8"));

// ---------- métricas ----------
const M = { subida: [], rpc: [], envio: [], visibleSup: [], visiblePlan: [], bandejaSup: [], bandejaPlan: [], listaSup: [], listaPlan: [], detalleSup: [], detallePlan: [], firmaSup: [], firmaPlan: [], pdf: [] };
const errores = [];
const T0 = ahora();
const err = (quien, que, e) => errores.push({ t: Math.round((ahora() - T0) / 1000), quien, que, detalle: String(e?.message ?? e).slice(0, 200) });
const enviadas = new Map(); // folio -> { id, tFin }
const firmadasSup = new Map(), completas = new Set();
let tecnicosActivos = N_TEC;

const pct = (a, p) => { if (!a.length) return NaN; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))]; };
const f1 = (x) => (Number.isFinite(x) ? `${Math.round(x)} ms` : "—");

// ---------- técnicos ----------
async function tecnico(i) {
  let ctx;
  try { ctx = await sesion("tecnico_a", CLAVES.tecnico_a); } catch (e) { err(`T${i + 1}`, "login", e); tecnicosActivos--; return; }
  let ultimo = null;
  for (let r = 0; r < RONDAS; r++) {
    const formato = FORMATOS[(i + r) % FORMATOS.length];
    const tpl = plantillas.get(`${tipos.get(formato.plantilla.tipoEquipo)}|${modos.get(formato.plantilla.modo)}`);
    try {
      const t0 = ahora();
      const payload = await conLimite(armar(ctx, formato, tpl, r % 2 === 1), `subida de fotos ${formato.id}`);
      const t1 = ahora();
      const { data, error } = await conLimite(ctx.sb.rpc("submit_inspection", { p: payload }), "submit_inspection");
      if (error) throw new Error(`Envío rechazado: ${error.message}`);
      const t2 = ahora();
      M.subida.push(t1 - t0); M.rpc.push(t2 - t1); M.envio.push(t2 - t0);
      enviadas.set(data.folio, { id: data.id, tFin: t2, formato: formato.id });
      ultimo = data.id;
    } catch (e) { err(`T${i + 1}`, `envío ${formato.id}`, e); }
    await dormir(300 + Math.random() * 1200);
  }
  if (ultimo) {
    try {
      const res = await ctx.get(`/tecnico/${ultimo}/pdf`);
      if (res.status !== 200 || res.cuerpo.subarray(0, 4).toString() !== "%PDF") throw new Error(`PDF HTTP ${res.status}`);
      M.pdf.push(res.ms);
      if (i < 3) writeFileSync(path.join(SALIDA, `pdf_tecnico_${i + 1}.pdf`), res.cuerpo);
    } catch (e) { err(`T${i + 1}`, "PDF", e); }
  }
  tecnicosActivos--;
}

// ---------- supervisor y programador ----------
async function revisor({ nombre, usuario, clave, ruta, etapa, visible, bandeja, lista, detalle, firma, origen, alTerminar }) {
  const ctx = await sesion(usuario, clave);
  const vistos = new Set(), cola = [];
  const inicio = Date.now();
  while (true) {
    const fuentes = origen();
    const productorActivo = etapa === "supervisor" ? tecnicosActivos > 0 : (tecnicosActivos > 0 || firmadasSup.size < enviadas.size);
    if (!productorActivo && fuentes.size === vistos.size && cola.length === 0) break;
    if (Date.now() - inicio > 900_000) { err(nombre, "tiempo total", "se cortó a los 15 min"); break; }
    try {
      // Pantalla de carpetas (la de entrada) y lista completa (donde se ven los folios).
      const c = await ctx.get(ruta);
      if (c.status !== 200) throw new Error(`HTTP ${c.status}`);
      bandeja.push(c.ms);
      const r = await ctx.get(`${ruta}?vista=lista`);
      if (r.status !== 200) throw new Error(`lista HTTP ${r.status}`);
      lista.push(r.ms);
      const html = r.cuerpo.toString("utf8");
      for (const [folio, v] of fuentes) {
        if (!vistos.has(folio) && html.includes(folio)) { vistos.add(folio); visible.push(ahora() - v.tFin); cola.push({ folio, ...v }); }
      }
    } catch (e) { err(nombre, `bandeja ${ruta}`, e); }
    const item = cola.shift();
    if (item) {
      try {
        const d = await ctx.get(`${ruta}/${item.id}`);
        if (d.status !== 200) throw new Error(`detalle HTTP ${d.status}`);
        detalle.push(d.ms);
        const tf = ahora();
        const rutaFirma = `${item.id}/${etapa}-${randomUUID()}.png`;
        const sub = await conLimite(ctx.sb.storage.from("signatures").upload(rutaFirma, FIRMA, { contentType: "image/png" }), "subir firma");
        if (sub.error) throw new Error(`firma: ${sub.error.message}`);
        const { error } = await conLimite(ctx.sb.rpc("review_inspection", { p_id: item.id, p_decision: "approved", p_comment: "", p_signature_path: rutaFirma }), "review_inspection");
        if (error) throw new Error(`review_inspection: ${error.message}`);
        firma.push(ahora() - tf);
        alTerminar(item, true);
      } catch (e) { err(nombre, `revisión ${item.folio}`, e); alTerminar(item, false); }
    }
    await dormir(item ? 150 : 700);
  }
}

// ---------- ejecución ----------
mkdirSync(SALIDA, { recursive: true });
console.log(`Prueba de carga: ${N_TEC} técnicos × ${RONDAS} envíos, 1 supervisor, 1 programador → ${BASE}`);
console.log(`Formatos: ${FORMATOS.map((f) => f.id).join(", ")} · límite «pegado»: ${LIMITE_MS / 1000} s`);
const latido = setInterval(() => console.log(`  [${Math.round((ahora() - T0) / 1000)} s] enviadas ${enviadas.size}/${N_TEC * RONDAS} · firmadas sup ${firmadasSup.size} · completas ${completas.size} · errores ${errores.length}`), 5000);

const trabajos = [
  ...Array.from({ length: N_TEC }, (_, i) => tecnico(i)),
  revisor({ nombre: "Supervisor", usuario: "supervisor_a", clave: CLAVES.supervisor_a, ruta: "/supervisor", etapa: "supervisor", visible: M.visibleSup, bandeja: M.bandejaSup, lista: M.listaSup, detalle: M.detalleSup, firma: M.firmaSup, origen: () => enviadas,
    alTerminar: (it) => firmadasSup.set(it.folio, { id: it.id, tFin: ahora(), formato: it.formato }) }),
  revisor({ nombre: "Programador", usuario: "programador_a", clave: CLAVES.programador_a, ruta: "/planificador", etapa: "planner", visible: M.visiblePlan, bandeja: M.bandejaPlan, lista: M.listaPlan, detalle: M.detallePlan, firma: M.firmaPlan, origen: () => firmadasSup,
    alTerminar: (it, bien) => { if (bien) completas.add(it.folio); } }),
].map((p, i) => p.catch((e) => err(i < N_TEC ? `T${i + 1}` : "revisor", "sesión caída", e)));
await Promise.all(trabajos);
clearInterval(latido);
const duracion = (ahora() - T0) / 1000;

// ---------- informe ----------
const fila = (nombre, a) => `| ${nombre} | ${a.length} | ${f1(pct(a, 50))} | ${f1(pct(a, 95))} | ${f1(a.length ? Math.max(...a) : NaN)} |`;
const total = N_TEC * RONDAS;
const ok = enviadas.size === total && completas.size === total && errores.length === 0;
const md = [
  `# Prueba de carga · ${hoy}`, "",
  `App: ${BASE} · Turno A · ${N_TEC} sesiones de técnico × ${RONDAS} envíos + 1 supervisor + 1 programador · duración ${duracion.toFixed(1)} s`, "",
  `**${ok ? "APROBADA" : "CON PROBLEMAS"}:** enviadas ${enviadas.size}/${total} · firmadas por el supervisor ${firmadasSup.size}/${total} · completas (programador) ${completas.size}/${total} · errores ${errores.length}.`, "",
  `Ritmo de envío: ${(enviadas.size / duracion).toFixed(2)} formularios/s en promedio.`, "",
  "| Medida | Muestras | p50 | p95 | Máx |", "|---|---:|---:|---:|---:|",
  fila("Técnico: subir fotos y firma", M.subida), fila("Técnico: RPC submit_inspection", M.rpc), fila("Técnico: envío completo", M.envio),
  fila("Hasta verse en la bandeja del supervisor", M.visibleSup), fila("Hasta verse en la bandeja del programador", M.visiblePlan),
  fila("Bandeja del supervisor (carpetas)", M.bandejaSup), fila("Bandeja del supervisor (lista completa)", M.listaSup),
  fila("Bandeja del programador (carpetas)", M.bandejaPlan), fila("Bandeja del programador (lista completa)", M.listaPlan),
  fila("Abrir una inspección (supervisor)", M.detalleSup), fila("Abrir una inspección (programador)", M.detallePlan),
  fila("Firmar (supervisor)", M.firmaSup), fila("Firmar (programador)", M.firmaPlan), fila("Descargar PDF (técnico)", M.pdf), "",
  errores.length ? `## Errores (${errores.length})\n\n| s | Quién | Qué | Detalle |\n|---:|---|---|---|\n${errores.slice(0, 60).map((e) => `| ${e.t} | ${e.quien} | ${e.que} | ${e.detalle.replace(/\|/g, "/")} |`).join("\n")}` : "Sin errores ni operaciones pegadas.",
].join("\n");
writeFileSync(path.join(SALIDA, "RESULTADO.md"), md);
console.log("\n" + md);
process.exit(ok ? 0 : 2);
