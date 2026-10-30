import { notFound } from "next/navigation";
import { Detalle } from "@/components/revision/detalle";
import { PanelRevision } from "@/components/revision/panel-revision";
import { etapaPendiente } from "@/lib/revision/estado";
import { obtenerDetalle } from "@/lib/revision/queries";

export const metadata = { title: "Detalle de inspección · Inspecciones MLP" };

export default async function DetallePlanificadorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detalle = await obtenerDetalle(id);
  if (!detalle) notFound();
  const etapa = etapaPendiente(detalle.status, "planner");
  return (
    <Detalle
      d={detalle}
      volver="/planificador"
      revision={etapa ? <PanelRevision inspeccionId={detalle.id} folio={detalle.folio ?? detalle.id} etapa={etapa} /> : undefined}
    />
  );
}
