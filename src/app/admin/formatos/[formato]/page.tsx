import { PaginaFormato } from "@/components/formatos/pagina-formato";

export const metadata = { title: "Formato · Inspección Eléctrica Bbosch-MLP" };

export default async function FormatoPage({ params }: { params: Promise<{ formato: string }> }) {
  const { formato } = await params;
  return <PaginaFormato base="/admin" formatoId={formato} puedeEditar={true} />;
}
