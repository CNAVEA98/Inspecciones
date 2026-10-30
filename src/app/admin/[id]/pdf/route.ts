import { responderPdf } from "@/lib/informe/responder";

export async function GET(_req: Request, ctx: RouteContext<"/admin/[id]/pdf">) {
  const { id } = await ctx.params;
  return responderPdf(id);
}
