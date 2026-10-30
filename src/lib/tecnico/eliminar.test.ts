import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { MlpDB, type DraftRecord } from "@/lib/offline/db";
import { eliminarBorrador } from "./eliminar";

const draft = (id: string, state: DraftRecord["state"]): DraftRecord => ({
  id,
  technicianId: "u1",
  areaId: "a",
  equipmentTypeId: "e",
  workModeId: "m",
  templateId: "t",
  header: {},
  answers: {},
  findings: [],
  photoIds: [],
  startedAt: "2026-10-30T10:00:00Z",
  updatedAt: 1,
  state,
});

const foto = (id: string, inspectionId: string) => ({
  id,
  inspectionId,
  blob: new Blob(["x"]),
  mime: "image/jpeg",
  sizeBytes: 1,
  storagePath: `u1/${inspectionId}/${id}.jpg`,
  uploaded: false,
});

describe("eliminarBorrador", () => {
  it("borra el borrador y sus fotos, y deja las de otras inspecciones", async () => {
    const db = new MlpDB(`test-${crypto.randomUUID()}`);
    await db.drafts.bulkAdd([draft("a", "draft"), draft("b", "draft")]);
    await db.photos.bulkAdd([foto("f1", "a"), foto("f2", "a"), foto("f3", "b")]);

    expect(await eliminarBorrador(db, "a")).toBe(true);
    expect(await db.drafts.get("a")).toBeUndefined();
    expect((await db.photos.toArray()).map((p) => p.id)).toEqual(["f3"]);
    expect(await db.drafts.get("b")).toBeDefined();
  });

  it("no elimina una inspección en cola ni una enviada", async () => {
    const db = new MlpDB(`test-${crypto.randomUUID()}`);
    await db.drafts.bulkAdd([draft("q", "queued"), draft("s", "sent")]);
    expect(await eliminarBorrador(db, "q")).toBe(false);
    expect(await eliminarBorrador(db, "s")).toBe(false);
    expect(await db.drafts.count()).toBe(2);
  });

  it("devuelve false si no existe", async () => {
    const db = new MlpDB(`test-${crypto.randomUUID()}`);
    expect(await eliminarBorrador(db, "nada")).toBe(false);
  });
});
