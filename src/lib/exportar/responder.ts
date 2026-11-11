import { getSession } from "@/lib/auth/session";
import { ROLE_LABEL } from "@/lib/auth/roles";
import { hoyIso } from "@/lib/fecha";
import { contentDisposition } from "@/lib/informe/nombre-archivo";
import { texto } from "@/lib/informe/responder";
import { SIN_TURNO, nombreZona } from "@/lib/revision/carpetas";
import { listarFallas } from "@/lib/revision/queries";
import { leerCatalogoExportar, leerExportar } from "./consulta";
import { ESTADOS_EXPORTAR, MAX_FILAS_EXPORTAR, nombreArchivo, parseFiltroExportar, zonaDelFiltro } from "./filtro";
import { hojaCriterios, hojaHallazgos, hojaInspecciones, ordenarHallazgos } from "./libro";
import { MIME_XLSX, crearXlsx, type Celda } from "./xlsx";

/** Solo el personal de revisión exporta; el técnico no tiene esta pestaña. */
const ROLES_QUE_EXPORTAN = new Set(["admin", "supervisor", "planner"]);

/**
 * Respuesta con el Excel de las inspecciones que cumplen el filtro de la URL. Segunda línea de defensa tras el proxy:
 * valida la sesión y el rol, y todas las lecturas pasan por RLS con la sesión de quien descarga.
 */
export async function responderExcel(request: Request): Promise<Response> {
  const session = await getSession();
  if (!session) return texto("Sesión no iniciada", 401);
  if (!ROLES_QUE_EXPORTAN.has(session.role)) return texto("Sin permiso para exportar", 403);

  const sp = Object.fromEntries(new URL(request.url).searchParams);
  const filtro = parseFiltroExportar(sp, hoyIso());
  const catalogo = await leerCatalogoExportar();
  const { inspecciones, truncado } = await leerExportar(filtro, catalogo);
  if (truncado) {
    return texto(`La consulta supera las ${MAX_FILAS_EXPORTAR} inspecciones por archivo. Acote las fechas o los filtros.`, 413);
  }
  const conHallazgos = inspecciones.filter((f) => f.hallazgos > 0).map((f) => f.id);
  const hallazgos = conHallazgos.length > 0 ? ordenarHallazgos(await listarFallas({ inspeccionIds: conHallazgos }), inspecciones) : [];

  const zona = zonaDelFiltro(filtro.area);
  const criterios: [string, Celda][] = [
    ["Generado", new Date()],
    ["Generado por", `${session.fullName} (${ROLE_LABEL[session.role]})`],
    ["Enviadas desde", filtro.desde],
    ["Enviadas hasta", filtro.hasta],
    ["Tipo de trabajo", filtro.tipo === "mantencion" ? "Solo mantenciones" : filtro.tipo === "inspeccion" ? "Solo inspecciones" : "Inspecciones y mantenciones"],
    ["Turno", filtro.turno === SIN_TURNO ? "Sin turno" : filtro.turno ? `Turno ${filtro.turno}` : "Ambos"],
    ["Área", zona ? nombreZona(zona) : (catalogo.areas.find((a) => a.code === filtro.area)?.name ?? "Todas")],
    ["Tipo de equipo", catalogo.equipos.find((e) => e.code === filtro.equipo)?.name ?? "Todos"],
    ["TAG contiene", filtro.tag || "(sin filtro)"],
    ["Estado", ESTADOS_EXPORTAR.find((e) => e.value === filtro.estado)?.label ?? ""],
    ["Inspecciones y mantenciones", inspecciones.length],
    ["Hallazgos", hallazgos.length],
  ];
  const libro = crearXlsx([hojaInspecciones(inspecciones), hojaHallazgos(hallazgos), hojaCriterios(criterios)]);
  // Copia a un ArrayBuffer propio: el tipo de `Response` no acepta un Uint8Array respaldado por un búfer compartido.
  return new Response(new Uint8Array(libro), {
    headers: {
      "Content-Type": MIME_XLSX,
      "Content-Disposition": contentDisposition(nombreArchivo(filtro)),
      "Cache-Control": "private, no-store",
    },
  });
}
