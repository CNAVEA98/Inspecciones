import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MlpDB, type DraftRecord, type PhotoRecord, type SubmitPayload } from "./db";
import {
  MAX_ATTEMPTS,
  TransportError,
  backoffMs,
  enqueueSubmission,
  getSyncSnapshot,
  processOutbox,
  retryNow,
  type SubmitResult,
  type Transport,
} from "./outbox";
import { fitWithin } from "./compress";

const UID = "11111111-1111-4111-8111-111111111111";
const INSPECTION = "22222222-2222-4222-8222-222222222222";
const PHOTO = "33333333-3333-4333-8333-333333333333";

function payload(id = INSPECTION): SubmitPayload {
  return {
    inspection: {
      id,
      area_id: "a",
      equipment_type_id: "e",
      work_mode_id: "m",
      template_id: "t",
      equipment_tag: "740XF001",
      started_at: "2026-10-17T12:45:00Z",
      performed_by: "Manuel Aguilar",
    },
    answers: [{ item_key: "item_01", value: { estado: "BN" } }],
    findings: [],
    attachments: [
      { id: PHOTO, storage_path: `${UID}/${id}/${PHOTO}.jpg`, kind: "photo", mime: "image/jpeg", size_bytes: 3 },
    ],
  };
}

/** Servidor simulado: submit es idempotente por id, igual que la RPC real. */
class FakeServer implements Transport {
  online = true;
  failSubmitWith: TransportError | null = null;
  uploads: string[] = [];
  submitCalls = 0;
  stored = new Map<string, SubmitPayload>();
  /** Simula que el servidor guardó pero la respuesta se perdió. */
  loseResponseOnce = false;
  private n = 0;

  async uploadPhoto(photo: PhotoRecord) {
    if (!this.online) throw new TransportError("Failed to fetch", true);
    this.uploads.push(photo.storagePath);
  }

  async submit(p: SubmitPayload): Promise<SubmitResult> {
    this.submitCalls++;
    if (!this.online) throw new TransportError("Failed to fetch", true);
    if (this.failSubmitWith) throw this.failSubmitWith;
    const id = p.inspection.id;
    const duplicate = this.stored.has(id);
    if (!duplicate) this.stored.set(id, p);
    if (this.loseResponseOnce) {
      this.loseResponseOnce = false;
      throw new TransportError("Network connection lost", true);
    }
    return { id, folio: `INS-2026-${String(++this.n).padStart(6, "0")}`, status: "submitted", duplicate };
  }
}

let db: MlpDB;
let server: FakeServer;
let t: number;
const clock = () => t;
let seq = 0;

async function seedDraft(id = INSPECTION) {
  const draft: DraftRecord = {
    id,
    technicianId: UID,
    areaId: "a",
    equipmentTypeId: "e",
    workModeId: "m",
    templateId: "t",
    header: {},
    answers: {},
    findings: [],
    photoIds: [PHOTO],
    startedAt: "2026-10-17T12:45:00Z",
    updatedAt: 0,
    state: "draft",
  };
  await db.drafts.add(draft);
  await db.photos.add({
    id: PHOTO,
    inspectionId: id,
    blob: new Blob([new Uint8Array([1, 2, 3])]),
    mime: "image/jpeg",
    sizeBytes: 3,
    storagePath: `${UID}/${id}/${PHOTO}.jpg`,
    uploaded: false,
  });
}

beforeEach(async () => {
  db = new MlpDB(`test-${++seq}-${Math.random()}`);
  server = new FakeServer();
  t = 1_000_000;
  await seedDraft();
});

afterEach(async () => {
  await db.delete();
});

describe("cola offline", () => {
  it("encola sin red y no envía nada", async () => {
    server.online = false;
    await enqueueSubmission(db, { payload: payload(), photoIds: [PHOTO] }, t);

    const res = await processOutbox(db, server, { now: clock, isOnline: () => false });

    expect(res.skipped).toBe(true);
    expect(server.submitCalls).toBe(0);
    expect(await db.outbox.count()).toBe(1);
    expect((await db.drafts.get(INSPECTION))?.state).toBe("queued");
  });

  it("con red intermitente reintenta con espera creciente y no envía de más", async () => {
    server.online = false;
    await enqueueSubmission(db, { payload: payload(), photoIds: [PHOTO] }, t);

    const r1 = await processOutbox(db, server, { now: clock });
    expect(r1.retry).toEqual([INSPECTION]);
    const e1 = (await db.outbox.get(INSPECTION))!;
    expect(e1.attempts).toBe(1);
    expect(e1.nextAttemptAt).toBe(t + backoffMs(1));

    // Antes de que venza la espera no se intenta de nuevo.
    const before = server.submitCalls;
    await processOutbox(db, server, { now: clock });
    expect(server.submitCalls).toBe(before);
  });

  it("al reconectar envía la inspección una sola vez y limpia fotos", async () => {
    server.online = false;
    await enqueueSubmission(db, { payload: payload(), photoIds: [PHOTO] }, t);
    await processOutbox(db, server, { now: clock });

    server.online = true;
    t += backoffMs(1) + 1;
    const res = await processOutbox(db, server, { now: clock });

    expect(res.sent).toEqual([INSPECTION]);
    expect(server.stored.size).toBe(1);
    expect(server.uploads).toEqual([`${UID}/${INSPECTION}/${PHOTO}.jpg`]);
    expect(await db.outbox.count()).toBe(0);
    expect(await db.photos.count()).toBe(0);
    const draft = await db.drafts.get(INSPECTION);
    expect(draft?.state).toBe("sent");
    expect(draft?.folio).toBe("INS-2026-000001");
  });

  it("no duplica: dos pasadas simultáneas envían una sola vez", async () => {
    await enqueueSubmission(db, { payload: payload(), photoIds: [PHOTO] }, t);
    const [a, b] = await Promise.all([
      processOutbox(db, server, { now: clock }),
      processOutbox(db, server, { now: clock }),
    ]);
    expect(a).toBe(b);
    expect(server.submitCalls).toBe(1);
    expect(server.stored.size).toBe(1);
  });

  it("no duplica: encolar el mismo id dos veces deja una sola entrada", async () => {
    await enqueueSubmission(db, { payload: payload(), photoIds: [PHOTO] }, t);
    await enqueueSubmission(db, { payload: payload(), photoIds: [PHOTO] }, t + 5_000);
    expect(await db.outbox.count()).toBe(1);
    expect((await db.outbox.get(INSPECTION))?.createdAt).toBe(t);
  });

  it("no duplica: si la respuesta se pierde, el reintento es idempotente", async () => {
    server.loseResponseOnce = true;
    await enqueueSubmission(db, { payload: payload(), photoIds: [PHOTO] }, t);

    await processOutbox(db, server, { now: clock });
    expect(server.stored.size).toBe(1); // el servidor sí guardó
    expect(await db.outbox.count()).toBe(1); // el cliente no lo sabe

    t += backoffMs(1) + 1;
    const res = await processOutbox(db, server, { now: clock });
    expect(res.sent).toEqual([INSPECTION]);
    expect(server.stored.size).toBe(1);
    expect(await db.outbox.count()).toBe(0);
  });

  it("no vuelve a subir fotos ya subidas cuando falla el envío", async () => {
    server.failSubmitWith = new TransportError("503", true);
    await enqueueSubmission(db, { payload: payload(), photoIds: [PHOTO] }, t);
    await processOutbox(db, server, { now: clock });
    expect(server.uploads).toHaveLength(1);
    expect((await db.photos.get(PHOTO))?.uploaded).toBe(true);

    server.failSubmitWith = null;
    t += backoffMs(1) + 1;
    await processOutbox(db, server, { now: clock });
    expect(server.uploads).toHaveLength(1);
    expect(server.stored.size).toBe(1);
  });

  it("un rechazo del servidor no se reintenta hasta que el usuario lo pida", async () => {
    server.failSubmitWith = new TransportError("ML exige foto", false);
    await enqueueSubmission(db, { payload: payload(), photoIds: [PHOTO] }, t);

    const res = await processOutbox(db, server, { now: clock });
    expect(res.failed).toEqual([INSPECTION]);
    expect((await db.outbox.get(INSPECTION))?.status).toBe("failed");

    t += 10 * 60_000;
    const calls = server.submitCalls;
    await processOutbox(db, server, { now: clock });
    expect(server.submitCalls).toBe(calls);

    server.failSubmitWith = null;
    await retryNow(db, INSPECTION, t);
    const again = await processOutbox(db, server, { now: clock });
    expect(again.sent).toEqual([INSPECTION]);
  });

  it("tras demasiados intentos pasa a failed", async () => {
    server.online = false;
    await enqueueSubmission(db, { payload: payload(), photoIds: [PHOTO] }, t);
    await db.outbox.update(INSPECTION, { attempts: MAX_ATTEMPTS - 1 });
    const res = await processOutbox(db, server, { now: clock });
    expect(res.failed).toEqual([INSPECTION]);
  });

  it("recupera una entrada que quedó en 'sending' por un cierre de la app", async () => {
    await enqueueSubmission(db, { payload: payload(), photoIds: [PHOTO] }, t);
    await db.outbox.update(INSPECTION, { status: "sending" });
    const res = await processOutbox(db, server, { now: clock });
    expect(res.sent).toEqual([INSPECTION]);
  });
});

describe("indicador de sincronización", () => {
  it("refleja sincronizado, pendiente, sin conexión y atención", async () => {
    expect((await getSyncSnapshot(db, true)).state).toBe("synced");
    expect((await getSyncSnapshot(db, false)).state).toBe("offline");

    await enqueueSubmission(db, { payload: payload(), photoIds: [PHOTO] }, t);
    expect(await getSyncSnapshot(db, true)).toEqual({ state: "pending", pending: 1, failed: 0 });
    expect((await getSyncSnapshot(db, true, true)).state).toBe("syncing");
    expect((await getSyncSnapshot(db, false)).state).toBe("offline");

    await db.outbox.update(INSPECTION, { status: "failed" });
    expect(await getSyncSnapshot(db, true)).toEqual({ state: "attention", pending: 0, failed: 1 });
  });
});

describe("backoff y compresión", () => {
  it("duplica la espera y respeta el tope de 5 minutos", () => {
    expect(backoffMs(1)).toBe(2_000);
    expect(backoffMs(2)).toBe(4_000);
    expect(backoffMs(3)).toBe(8_000);
    expect(backoffMs(30)).toBe(5 * 60_000);
  });

  it("fitWithin reduce al lado mayor sin agrandar", () => {
    expect(fitWithin(4000, 3000)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(3000, 4000)).toEqual({ width: 1200, height: 1600 });
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
  });
});
