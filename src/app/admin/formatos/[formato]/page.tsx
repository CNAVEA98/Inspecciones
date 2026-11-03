import { PaginaFormato } from "@/components/formatos/pagina-formato";

export const metadata = { title: "Formato · Inspecciones MLP" };

export default async function FormatoPage({ params }: { params: Promise<{ formato: string }> }) {
  const { formato } = await params;
  return <PaginaFormato base="/admin" formatoId={formato} puedeEditar={true} />;
}
