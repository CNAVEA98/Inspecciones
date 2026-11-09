import { getSession } from "@/lib/auth/session";
import { archivarInforme, responderPdf, texto } from "@/lib/informe/responder";

export async function GET(_req: Request, ctx: RouteContext<"/planificador/[id]/pdf">) {
  const { id } = await ctx.params;
  return responderPdf(id);
}

/** Archiva el PDF oficial tras la firma del programador (lo llama el panel de revisión). El proxy ya exige el rol. */
export async function POST(_req: Request, ctx: RouteContext<"/planificador/[id]/pdf">) {
  const { id } = await ctx.params;
  const session = await getSession();
  if (!session || session.role !== "planner") return texto("Sin permiso", 403);
  return archivarInforme(id);
}
