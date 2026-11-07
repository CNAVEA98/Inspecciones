import { File } from "expo-file-system";
import * as SQLite from "expo-sqlite";
import type { Almacen } from "./almacen";
import type { CatalogRecord, DraftRecord, OutboxRecord, PhotoRecord } from "./db";

const NOMBRE_BD = "mlp-inspecciones.db";

/**
 * Cada tabla guarda el registro completo en `json` (el mismo objeto que la web guarda en Dexie) y repite en columnas
 * solo lo que se usa para buscar y ordenar.
 */
const ESQUEMA = `
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS drafts (
  id TEXT PRIMARY KEY NOT NULL,
  technician_id TEXT NOT NULL,
  state TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  json TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS drafts_tecnico ON drafts (technician_id, updated_at);
CREATE TABLE IF NOT EXISTS outbox (
  id TEXT PRIMARY KEY NOT NULL,
  created_at INTEGER NOT NULL,
  json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY NOT NULL,
  inspection_id TEXT NOT NULL,
  uri TEXT NOT NULL,
  json TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS photos_inspeccion ON photos (inspection_id);
CREATE TABLE IF NOT EXISTS catalog (
  key TEXT PRIMARY KEY NOT NULL,
  json TEXT NOT NULL
);
`;

interface FilaJson {
  json: string;
}

const leer = <T>(f: FilaJson | null | undefined): T | undefined => (f ? (JSON.parse(f.json) as T) : undefined);

/** Aplica un cambio parcial; una propiedad en `undefined` se pierde al serializar (igual que `update` de Dexie). */
const fusionar = <T extends object>(actual: T, cambio: Partial<T>): T => ({ ...actual, ...cambio });

/** Almacén real de la app: SQLite (`expo-sqlite`) para los registros y archivos para las imágenes. */
export class AlmacenSqlite implements Almacen {
  private constructor(private readonly db: SQLite.SQLiteDatabase) {}

  /** Abre (o crea) la base local. Llamar una sola vez al iniciar la app. */
  static async abrir(nombre = NOMBRE_BD): Promise<AlmacenSqlite> {
    const db = await SQLite.openDatabaseAsync(nombre);
    await db.execAsync(ESQUEMA);
    return new AlmacenSqlite(db);
  }

  // Borradores
  async obtenerBorrador(id: string) {
    return leer<DraftRecord>(await this.db.getFirstAsync<FilaJson>("SELECT json FROM drafts WHERE id = ?", id));
  }
  async guardarBorrador(d: DraftRecord) {
    await this.db.runAsync(
      "INSERT OR REPLACE INTO drafts (id, technician_id, state, updated_at, json) VALUES (?, ?, ?, ?, ?)",
      d.id,
      d.technicianId,
      d.state,
      d.updatedAt,
      JSON.stringify(d),
    );
  }
  async listarBorradores(technicianId: string) {
    const filas = await this.db.getAllAsync<FilaJson>(
      "SELECT json FROM drafts WHERE technician_id = ? ORDER BY updated_at DESC",
      technicianId,
    );
    return filas.map((f) => JSON.parse(f.json) as DraftRecord);
  }
  async actualizarBorrador(id: string, cambio: Partial<DraftRecord>) {
    const actual = await this.obtenerBorrador(id);
    if (actual) await this.guardarBorrador(fusionar(actual, cambio));
  }
  async eliminarBorrador(id: string) {
    await this.db.runAsync("DELETE FROM drafts WHERE id = ?", id);
  }

  // Cola de envío
  async obtenerSalida(id: string) {
    return leer<OutboxRecord>(await this.db.getFirstAsync<FilaJson>("SELECT json FROM outbox WHERE id = ?", id));
  }
  async agregarSalida(r: OutboxRecord) {
    await this.db.runAsync(
      "INSERT INTO outbox (id, created_at, json) VALUES (?, ?, ?)",
      r.id,
      r.createdAt,
      JSON.stringify(r),
    );
  }
  async actualizarSalida(id: string, cambio: Partial<OutboxRecord>) {
    const actual = await this.obtenerSalida(id);
    if (!actual) return;
    const nuevo = fusionar(actual, cambio);
    await this.db.runAsync("UPDATE outbox SET json = ? WHERE id = ?", JSON.stringify(nuevo), id);
  }
  async eliminarSalida(id: string) {
    await this.db.runAsync("DELETE FROM outbox WHERE id = ?", id);
  }
  async listarSalidas() {
    const filas = await this.db.getAllAsync<FilaJson>("SELECT json FROM outbox ORDER BY created_at");
    return filas.map((f) => JSON.parse(f.json) as OutboxRecord);
  }

  // Fotos
  async obtenerFoto(id: string) {
    return leer<PhotoRecord>(await this.db.getFirstAsync<FilaJson>("SELECT json FROM photos WHERE id = ?", id));
  }
  async agregarFoto(p: PhotoRecord) {
    await this.db.runAsync(
      "INSERT OR REPLACE INTO photos (id, inspection_id, uri, json) VALUES (?, ?, ?, ?)",
      p.id,
      p.inspectionId,
      p.uri,
      JSON.stringify(p),
    );
  }
  async actualizarFoto(id: string, cambio: Partial<PhotoRecord>) {
    const actual = await this.obtenerFoto(id);
    if (actual) await this.agregarFoto(fusionar(actual, cambio));
  }
  async fotosDeInspeccion(inspectionId: string) {
    const filas = await this.db.getAllAsync<FilaJson>("SELECT json FROM photos WHERE inspection_id = ?", inspectionId);
    return filas.map((f) => JSON.parse(f.json) as PhotoRecord);
  }
  async eliminarFotos(ids: string[]) {
    for (const id of ids) {
      const foto = await this.obtenerFoto(id);
      if (!foto) continue;
      try {
        const archivo = new File(foto.uri);
        if (archivo.exists) archivo.delete();
      } catch {
        // un archivo que ya no está no impide limpiar el registro
      }
      await this.db.runAsync("DELETE FROM photos WHERE id = ?", id);
    }
  }

  // Catálogo
  async leerCatalogo(key: string) {
    const fila = await this.db.getFirstAsync<{ json: string }>("SELECT json FROM catalog WHERE key = ?", key);
    return leer<CatalogRecord>(fila);
  }
  async guardarCatalogo(r: CatalogRecord) {
    await this.db.runAsync("INSERT OR REPLACE INTO catalog (key, json) VALUES (?, ?)", r.key, JSON.stringify(r));
  }

  async transaccion<T>(fn: () => Promise<T>): Promise<T> {
    let resultado!: T;
    await this.db.withTransactionAsync(async () => {
      resultado = await fn();
    });
    return resultado;
  }
}
