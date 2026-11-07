import type { Almacen } from "./almacen";
import type { CatalogRecord, DraftRecord, OutboxRecord, PhotoRecord } from "./db";

const copia = <T>(v: T): T => structuredClone(v);

/** Aplica un cambio parcial; una propiedad en `undefined` se elimina (igual que al guardar como JSON). */
function fusionar<T extends object>(actual: T, cambio: Partial<T>): T {
  const r = { ...actual, ...cambio } as Record<string, unknown>;
  for (const k of Object.keys(r)) if (r[k] === undefined) delete r[k];
  return r as T;
}

/** Almacén en memoria para pruebas. Se comporta como el de SQLite, sin archivos. */
export class AlmacenMemoria implements Almacen {
  private borradores = new Map<string, DraftRecord>();
  private salidas = new Map<string, OutboxRecord>();
  private fotos = new Map<string, PhotoRecord>();
  private catalogo = new Map<string, CatalogRecord>();

  async obtenerBorrador(id: string) {
    const v = this.borradores.get(id);
    return v && copia(v);
  }
  async guardarBorrador(d: DraftRecord) {
    this.borradores.set(d.id, copia(d));
  }
  async listarBorradores(technicianId: string) {
    return [...this.borradores.values()]
      .filter((d) => d.technicianId === technicianId)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map(copia);
  }
  async actualizarBorrador(id: string, cambio: Partial<DraftRecord>) {
    const actual = this.borradores.get(id);
    if (actual) this.borradores.set(id, fusionar(actual, copia(cambio)));
  }
  async eliminarBorrador(id: string) {
    this.borradores.delete(id);
  }

  async obtenerSalida(id: string) {
    const v = this.salidas.get(id);
    return v && copia(v);
  }
  async agregarSalida(r: OutboxRecord) {
    if (this.salidas.has(r.id)) throw new Error(`Ya existe la salida ${r.id}`);
    this.salidas.set(r.id, copia(r));
  }
  async actualizarSalida(id: string, cambio: Partial<OutboxRecord>) {
    const actual = this.salidas.get(id);
    if (actual) this.salidas.set(id, fusionar(actual, copia(cambio)));
  }
  async eliminarSalida(id: string) {
    this.salidas.delete(id);
  }
  async listarSalidas() {
    return [...this.salidas.values()].map(copia);
  }

  async obtenerFoto(id: string) {
    const v = this.fotos.get(id);
    return v && copia(v);
  }
  async agregarFoto(p: PhotoRecord) {
    this.fotos.set(p.id, copia(p));
  }
  async actualizarFoto(id: string, cambio: Partial<PhotoRecord>) {
    const actual = this.fotos.get(id);
    if (actual) this.fotos.set(id, fusionar(actual, copia(cambio)));
  }
  async fotosDeInspeccion(inspectionId: string) {
    return [...this.fotos.values()].filter((p) => p.inspectionId === inspectionId).map(copia);
  }
  async eliminarFotos(ids: string[]) {
    for (const id of ids) this.fotos.delete(id);
  }

  async leerCatalogo(key: string) {
    const v = this.catalogo.get(key);
    return v && copia(v);
  }
  async guardarCatalogo(r: CatalogRecord) {
    this.catalogo.set(r.key, copia(r));
  }

  async transaccion<T>(fn: () => Promise<T>): Promise<T> {
    const respaldo = {
      b: new Map(this.borradores),
      s: new Map(this.salidas),
      f: new Map(this.fotos),
      c: new Map(this.catalogo),
    };
    try {
      return await fn();
    } catch (e) {
      this.borradores = respaldo.b;
      this.salidas = respaldo.s;
      this.fotos = respaldo.f;
      this.catalogo = respaldo.c;
      throw e;
    }
  }
}
