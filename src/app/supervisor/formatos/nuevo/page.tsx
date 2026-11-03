import { PaginaNuevoFormato } from "@/components/formatos/pagina-nuevo-formato";

export const metadata = { title: "Nuevo formato · Inspecciones MLP" };

export default function NuevoFormatoPage() {
  return <PaginaNuevoFormato base="/supervisor" />;
}
