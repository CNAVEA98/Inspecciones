import { Formulario } from "@/components/tecnico/formulario";

export const metadata = { title: "Inspección · Inspección Eléctrica Bbosch-MLP" };

export default async function InspeccionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Formulario id={id} />;
}
