/**
 * Copia local de lo que ve quien revisa (bandeja, detalle, equipos con fallas), para consultarlo sin señal.
 * Con señal se pide al servidor y se guarda la copia; sin señal (o si el servidor falla) se muestra la última copia.
 * Firmar y registrar seguimiento siguen necesitando señal: la copia es solo de lectura.
 */

/** Almacén clave-valor (en la app, `expo-sqlite/kv-store`; en las pruebas, un Map). */
export interface Kv {
  getItemAsync(clave: string): Promise<string | null>;
  setItemAsync(clave: string, valor: string): Promise<void>;
  removeItemAsync(clave: string): Promise<boolean>;
  getAllKeysAsync(): Promise<string[]>;
}

export interface Copia<T> {
  guardadoEn: number;
  datos: T;
}

export interface Resultado<T> {
  datos: T;
  /** Cuándo se guardó la copia mostrada; null si los datos vienen del servidor recién. */
  copiaDe: number | null;
  /** Motivo por el que no se pudo leer del servidor (solo si se muestra una copia). */
  aviso?: string;
}

const PREFIJO = "rev:";

export const claveBandeja = (userId: string, filtro: string) => `${PREFIJO}${userId}:bandeja:${filtro}`;
export const claveDetalle = (userId: string, id: string) => `${PREFIJO}${userId}:detalle:${id}`;
export const claveFallas = (userId: string) => `${PREFIJO}${userId}:fallas`;

export async function guardarCopia<T>(kv: Kv, clave: string, datos: T, ahora = Date.now()): Promise<void> {
  try {
    await kv.setItemAsync(clave, JSON.stringify({ guardadoEn: ahora, datos } satisfies Copia<T>));
  } catch {
    // Sin espacio o base ocupada: la pantalla funciona igual con señal.
  }
}

export async function leerCopia<T>(kv: Kv, clave: string): Promise<Copia<T> | null> {
  try {
    const raw = await kv.getItemAsync(clave);
    if (!raw) return null;
    const c = JSON.parse(raw) as Partial<Copia<T>>;
    return typeof c.guardadoEn === "number" && c.datos !== undefined ? (c as Copia<T>) : null;
  } catch {
    return null;
  }
}

export const SIN_SENAL = "Sin conexión a internet.";

/**
 * Pide al servidor y guarda la copia; si no hay señal o el servidor falla, devuelve la última copia con un aviso.
 * Sin copia, lanza el error (o «sin señal») para que la pantalla lo muestre.
 */
export async function conCopia<T>(kv: Kv, clave: string, enLinea: boolean, pedir: () => Promise<T>): Promise<Resultado<T>> {
  let motivo = SIN_SENAL;
  if (enLinea) {
    try {
      const datos = await pedir();
      await guardarCopia(kv, clave, datos);
      return { datos, copiaDe: null };
    } catch (e) {
      motivo = e instanceof Error ? e.message : String(e);
    }
  }
  const copia = await leerCopia<T>(kv, clave);
  if (copia) return { datos: copia.datos, copiaDe: copia.guardadoEn, aviso: motivo };
  throw new Error(motivo === SIN_SENAL ? "Sin señal y sin datos guardados en este teléfono. Ábralo una vez con señal." : motivo);
}

/** Borra las copias de revisión (al cerrar sesión, para que la siguiente cuenta no las vea). */
export async function borrarCopias(kv: Kv): Promise<number> {
  let n = 0;
  try {
    for (const k of await kv.getAllKeysAsync()) {
      if (k.startsWith(PREFIJO) && (await kv.removeItemAsync(k))) n++;
    }
  } catch {
    // nada que borrar
  }
  return n;
}
