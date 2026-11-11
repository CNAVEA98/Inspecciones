import { responderExcel } from "@/lib/exportar/responder";

/** Excel con las inspecciones y mantenciones que cumplen los filtros de la URL. */
export async function GET(request: Request) {
  return responderExcel(request);
}
