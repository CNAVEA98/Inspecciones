import { Bandeja } from "@/components/revision/bandeja";
import { parseConsulta } from "@/lib/revision/consulta";
import { parseFiltro } from "@/lib/revision/estado";

export const metadata = { title: "Inspecciones · Administrador · Inspecciones MLP" };

export default async function InspeccionesAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  // Por defecto el administrador ve todas, no solo las que debe firmar otro rol.
  const filtro = sp.estado ? parseFiltro(sp.estado) : "todas";
  return <Bandeja base="/admin" rol="admin" filtro={filtro} consulta={parseConsulta(sp)} titulo="Todas las inspecciones" />;
}
