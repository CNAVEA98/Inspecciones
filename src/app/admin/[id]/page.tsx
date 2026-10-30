import { notFound } from "next/navigation";
import { Detalle } from "@/components/revision/detalle";
import { obtenerDetalle } from "@/lib/revision/queries";

export const metadata = { title: "Detalle de inspección · Inspecciones MLP" };

export default async function DetalleAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detalle = await obtenerDetalle(id);
  if (!detalle) notFound();
  return <Detalle d={detalle} volver="/admin" />;
}
