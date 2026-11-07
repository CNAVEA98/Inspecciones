import { describe, expect, it } from "vitest";
import { AlmacenMemoria } from "./almacen-memoria";
import type { DraftRecord, SubmitPayload } from "./db";
import { ejecutarEnvio } from "./envio-segundo-plano";
import { TransportError, enqueueSubmission, type SubmitResult, type Transport } from "./outbox";

const ID = "22222222-2222-4222-8222-222222222222";

const payload = (): SubmitPayload => ({
  inspection: { id: ID, area_id: "a", equipment_type_id: "e", work_mode_id: "m", template_id: "t", equipment_tag: "X", started_at: "2026-11-07T12:00:00Z", performed_by: "P" },
  answers: [],
  findings: [],
  attachments: [],
});

const borrador = (): DraftRecord => ({
  id: ID, technicianId: "u", areaId: "a", equipmentTypeId: "e", workModeId: "m", templateId: "t",
  header: {}, answers: {}, findings: [], photoIds: [], startedAt: "2026-11-07T12:00:00Z", updatedAt: 1, state: "draft",
});

class Servidor implements Transport {
  llamadas = 0;
  falla: Error | null = null;
  async uploadPhoto() {}
  async submit(): Promise<SubmitResult> {
    this.llamadas++;
    if (this.falla) throw this.falla;
    return { id: ID, folio: "INS-2026-000001", status: "submitted", duplicate: false };
  }
}

async function conCola() {
  const a = new AlmacenMemoria();
  await a.guardarBorrador(borrador());
  await enqueueSubmission(a, { payload: payload(), photoIds: [] });
  return a;
}

describe("envío en segundo plano", () => {
  it("con la cola vacía no llama al servidor", async () => {
    const s = new Servidor();
    expect(await ejecutarEnvio(new AlmacenMemoria(), s)).toBe("exito");
    expect(s.llamadas).toBe(0);
  });

  it("envía lo pendiente y vacía la cola", async () => {
    const a = await conCola();
    const s = new Servidor();
    expect(await ejecutarEnvio(a, s)).toBe("exito");
    expect(s.llamadas).toBe(1);
    expect(await a.listarSalidas()).toEqual([]);
    expect((await a.obtenerBorrador(ID))?.folio).toBe("INS-2026-000001");
  });

  it("sin señal no es un fallo de la tarea: la inspección queda pendiente sin gastar intentos", async () => {
    const a = await conCola();
    const s = new Servidor();
    s.falla = new TransportError("Network request failed", true, true);
    expect(await ejecutarEnvio(a, s)).toBe("exito");
    const e = (await a.obtenerSalida(ID))!;
    expect(e.status).toBe("pending");
    expect(e.attempts).toBe(0);
  });

  it("repetir la tarea tras un envío exitoso no duplica", async () => {
    const a = await conCola();
    const s = new Servidor();
    await ejecutarEnvio(a, s);
    await ejecutarEnvio(a, s);
    expect(s.llamadas).toBe(1);
  });

  it("un error inesperado del almacén se informa como fallo, sin lanzar", async () => {
    const a = new AlmacenMemoria();
    a.listarSalidas = async () => {
      throw new Error("base cerrada");
    };
    expect(await ejecutarEnvio(a, new Servidor())).toBe("fallo");
  });
});
