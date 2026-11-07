import type { CatalogRecord, DraftRecord, OutboxRecord, PhotoRecord } from "./db";

/**
 * Almacenamiento local de la app. Reemplaza a Dexie de la web: mismas cuatro «tablas» (borradores, cola, fotos, catálogo).
 * En el teléfono lo implementa SQLite (`almacen-sqlite.ts`); en las pruebas, una copia en memoria (`almacen-memoria.ts`).
 */
export interface Almacen {
  // Borradores
  obtenerBorrador(id: string): Promise<DraftRecord | undefined>;
  /** Crea o reemplaza. */
  guardarBorrador(d: DraftRecord): Promise<void>;
  /** Los del técnico, del más reciente al más antiguo. */
  listarBorradores(technicianId: string): Promise<DraftRecord[]>;
  actualizarBorrador(id: string, cambio: Partial<DraftRecord>): Promise<void>;
  eliminarBorrador(id: string): Promise<void>;

  // Cola de envío
  obtenerSalida(id: string): Promise<OutboxRecord | undefined>;
  agregarSalida(r: OutboxRecord): Promise<void>;
  /** Una propiedad en `undefined` se borra (p. ej. `lastError`). */
  actualizarSalida(id: string, cambio: Partial<OutboxRecord>): Promise<void>;
  eliminarSalida(id: string): Promise<void>;
  listarSalidas(): Promise<OutboxRecord[]>;

  // Fotos y firmas (metadatos en la base, imagen en un archivo)
  obtenerFoto(id: string): Promise<PhotoRecord | undefined>;
  agregarFoto(p: PhotoRecord): Promise<void>;
  actualizarFoto(id: string, cambio: Partial<PhotoRecord>): Promise<void>;
  fotosDeInspeccion(inspectionId: string): Promise<PhotoRecord[]>;
  /** Borra los registros y también los archivos. Ignora los id que no existen. */
  eliminarFotos(ids: string[]): Promise<void>;

  // Catálogo y copias locales
  leerCatalogo(key: string): Promise<CatalogRecord | undefined>;
  guardarCatalogo(r: CatalogRecord): Promise<void>;

  /** Agrupa operaciones: o se aplican todas o ninguna. */
  transaccion<T>(fn: () => Promise<T>): Promise<T>;
}
