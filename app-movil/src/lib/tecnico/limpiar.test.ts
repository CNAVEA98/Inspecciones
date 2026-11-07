import { describe, expect, it } from "vitest";
import { AlmacenMemoria } from "@/lib/offline/almacen-memoria";
import type { DraftRecord } from "@/lib/offline/db";
import { DIAS_FOTOS_ENVIADAS, limpiarFotosEnviadas } from "./eliminar";

const DIA = 24 * 60 * 60 * 1000;
const AHORA = 100 * DIA;

const borrador = (id: string, state: DraftRecord["state"], hace: number, technicianId = "u1"): DraftRecord => ({
  id,
  technicianId,
  areaId: "a",
  equipmentTypeId: "e",
  workModeId: "m",
  templateId: "t",
  header: {},
  answers: {},
  findings: [],
  photoIds: [],
  startedAt: "2026-11-01T10:00:00Z",
  updatedAt: AHORA - hace * DIA,
  state,
});

const foto = (id: string, inspectionId: string) => ({
  id,
  inspectionId,
  uri: `file:///fotos/${id}.jpg`,
  mime: "image/jpeg",
  sizeBytes: 1,
  storagePath: `u1/${inspectionId}/${id}.jpg`,
  uploaded: true,
});

describe("limpiarFotosEnviadas", () => {
  it("borra las fotos de las enviadas antiguas y deja las recientes, las en cola y los borradores", async () => {
    const db = new AlmacenMemoria();
    for (const d of [
      borrador("vieja", "sent", DIAS_FOTOS_ENVIADAS + 1),
      borrador("reciente", "sent", 2),
      borrador("cola", "queued", 60),
      borrador("curso", "draft", 60),
      borrador("ajena", "sent", 60, "u2"),
    ]) {
      await db.guardarBorrador(d);
      await db.agregarFoto(foto(`f-${d.id}`, d.id));
    }

    expect(await limpiarFotosEnviadas(db, "u1", DIAS_FOTOS_ENVIADAS, AHORA)).toBe(1);
    expect(await db.obtenerFoto("f-vieja")).toBeUndefined();
    for (const id of ["reciente", "cola", "curso", "ajena"]) expect(await db.obtenerFoto(`f-${id}`)).toBeDefined();
    // El registro de la inspección enviada se conserva (solo se liberan las imágenes).
    expect(await db.obtenerBorrador("vieja")).toBeDefined();
  });

  it("no cuenta las inspecciones que ya no tienen fotos", async () => {
    const db = new AlmacenMemoria();
    await db.guardarBorrador(borrador("sin-fotos", "sent", 60));
    expect(await limpiarFotosEnviadas(db, "u1", DIAS_FOTOS_ENVIADAS, AHORA)).toBe(0);
  });
});
