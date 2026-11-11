import { Exportar } from "@/components/revision/exportar";
import { hoyIso } from "@/lib/fecha";
import { parsePagina } from "@/lib/exportar/consulta";
import { parseFiltroExportar } from "@/lib/exportar/filtro";

export const metadata = { title: "Exportar a Excel · Inspección Eléctrica Bbosch-MLP" };

export default async function ExportarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  return <Exportar base="/supervisor" filtro={parseFiltroExportar(sp, hoyIso())} pagina={parsePagina(sp.pagina)} />;
}
