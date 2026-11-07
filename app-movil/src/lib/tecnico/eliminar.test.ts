// Copia de src/lib/tecnico/eliminar.test.ts de la web (2026-11-07), adaptada a `Almacen`.
import { describe, expect, it } from "vitest";
import { AlmacenMemoria } from "@/lib/offline/almacen-memoria";
import type { DraftRecord } from "@/lib/offline/db";
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
  uri: "file:///fotos/x.jpg",
  mime: "image/jpeg",
  sizeBytes: 1,
  storagePath: `u1/${inspectionId}/${id}.jpg`,
  uploaded: false,
});

describe("eliminarBorrador", () => {
  it("borra el borrador y sus fotos, y deja las de otras inspecciones", async () => {
    const db = new AlmacenMemoria();
    for (const d of [draft("a", "draft"), draft("b", "draft")]) await db.guardarBorrador(d);
    for (const f of [foto("f1", "a"), foto("f2", "a"), foto("f3", "b")]) await db.agregarFoto(f);

    expect(await eliminarBorrador(db, "a")).toBe(true);
    expect(await db.obtenerBorrador("a")).toBeUndefined();
    expect([...(await db.fotosDeInspeccion("a")), ...(await db.fotosDeInspeccion("b"))].map((p) => p.id)).toEqual(["f3"]);
    expect(await db.obtenerBorrador("b")).toBeDefined();
  });

  it("no elimina una inspección en cola ni una enviada", async () => {
    const db = new AlmacenMemoria();
    for (const d of [draft("q", "queued"), draft("s", "sent")]) await db.guardarBorrador(d);
    expect(await eliminarBorrador(db, "q")).toBe(false);
    expect(await eliminarBorrador(db, "s")).toBe(false);
    expect((await db.listarBorradores("u1")).length).toBe(2);
  });

  it("devuelve false si no existe", async () => {
    const db = new AlmacenMemoria();
    expect(await eliminarBorrador(db, "nada")).toBe(false);
  });
});
