import { PanelInicio } from "@/components/revision/panel-inicio";
import { parseFiltroPanel } from "@/lib/revision/panel";
import { requireRole } from "@/lib/auth/session";

export const metadata = { title: "Inicio · Inspección Eléctrica Bbosch-MLP" };

/** Pantalla de inicio del supervisor: indicadores de lo recibido, lo que falta firmar y los hallazgos. */
export default async function PanelPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireRole("supervisor");
  return <PanelInicio base="/supervisor" rol="supervisor" session={session} filtro={parseFiltroPanel(await searchParams)} />;
}
