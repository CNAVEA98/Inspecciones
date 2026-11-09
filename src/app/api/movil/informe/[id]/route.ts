import { archivarPdfMovil, responderPdfMovil } from "@/lib/informe/responder-movil";

/** PDF de una inspección para la app móvil (token en `Authorization: Bearer`). Ver `lib/informe/responder-movil`. */
export async function GET(req: Request, ctx: RouteContext<"/api/movil/informe/[id]">) {
  const { id } = await ctx.params;
  return responderPdfMovil(id, req);
}

/** Archiva el PDF oficial de una inspección aprobada (la app lo llama tras la firma del programador). */
export async function POST(req: Request, ctx: RouteContext<"/api/movil/informe/[id]">) {
  const { id } = await ctx.params;
  return archivarPdfMovil(id, req);
}
