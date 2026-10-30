import { Bandeja } from "@/components/revision/bandeja";
import { parseConsulta } from "@/lib/revision/consulta";
import { parseFiltro } from "@/lib/revision/estado";

export const metadata = { title: "Bandeja del programador · Inspecciones MLP" };

export default async function BandejaPlanificadorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  return (
    <Bandeja
      base="/planificador"
      rol="planner"
      filtro={parseFiltro(sp.estado)}
      consulta={parseConsulta(sp)}
      titulo="Inspecciones por firmar"
    />
  );
}
