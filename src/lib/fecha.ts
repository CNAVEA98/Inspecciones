const ZONA = "America/Santiago";

/** Fecha y hora en horario de Chile, p. ej. "17-10-2026 09:45". */
export function formatFechaHora(ms: number | string | Date): string {
  const d = new Date(ms);
  const f = new Intl.DateTimeFormat("es-CL", {
    timeZone: ZONA,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const p = Object.fromEntries(f.map((x) => [x.type, x.value]));
  return `${p.day}-${p.month}-${p.year} ${p.hour}:${p.minute}`;
}

/** Día (Chile) de un instante, en formato ISO yyyy-mm-dd. */
export function fechaIso(ms: number | string | Date): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: ZONA, year: "numeric", month: "2-digit", day: "2-digit" })
      .formatToParts(new Date(ms))
      .map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day}`;
}

/** Fecha de hoy (Chile) en formato ISO yyyy-mm-dd, para inputs type="date". */
export function hoyIso(): string {
  return fechaIso(new Date());
}

/** Suma (o resta) días a una fecha ISO yyyy-mm-dd; es aritmética de calendario, sin zonas horarias. */
export function sumarDias(dia: string, n: number): string {
  const [a, m, d] = dia.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10);
}

/**
 * Primer instante de un día de Chile (yyyy-mm-dd), para acotar consultas por fecha en la base.
 * Chile va entre UTC-3 y UTC-4 y el cambio de hora ocurre a medianoche (un día puede empezar a la 01:00),
 * por eso se busca la primera hora UTC que ya cae en ese día en vez de sumar un desfase fijo.
 */
export function inicioDiaChile(dia: string): Date {
  const [a, m, d] = dia.split("-").map(Number);
  for (let h = 2; h <= 6; h++) {
    const t = Date.UTC(a, m - 1, d, h);
    if (fechaIso(t) === dia) return new Date(t);
  }
  return new Date(Date.UTC(a, m - 1, d, 4));
}

/**
 * Fecha y hora de Chile como número de serie de Excel (días desde 1899-12-30), para que la celda sea una fecha real
 * (se puede ordenar y filtrar) y muestre la hora de Chile sin depender de la zona del computador que abre el archivo.
 */
export function serieExcelChile(ms: number | string | Date): number {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: ZONA,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(ms))
      .map((x) => [x.type, Number(x.value)]),
  );
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) / 86_400_000 + 25_569;
}
