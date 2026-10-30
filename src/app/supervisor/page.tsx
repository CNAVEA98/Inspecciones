import { Bandeja } from "@/components/revision/bandeja";
import { parseConsulta } from "@/lib/revision/consulta";
import { parseFiltro } from "@/lib/revision/estado";

export const metadata = { title: "Bandeja del supervisor · Inspecciones MLP" };

export default async function BandejaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  return (
    <Bandeja
      base="/supervisor"
      rol="supervisor"
      filtro={parseFiltro(sp.estado)}
      consulta={parseConsulta(sp)}
      titulo="Bandeja de inspecciones"
    />
  );
}
