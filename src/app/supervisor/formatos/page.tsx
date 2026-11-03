import { ListaFormatos } from "@/components/formatos/lista-formatos";

export const metadata = { title: "Formatos · Inspecciones MLP" };

export default function FormatosPage() {
  return <ListaFormatos base="/supervisor" puedeEditar={true} puedeActivar />;
}
