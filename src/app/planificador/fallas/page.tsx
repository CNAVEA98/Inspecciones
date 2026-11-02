import { FallasEquipos } from "@/components/revision/fallas-equipos";
import { parseFiltroFallas } from "@/lib/revision/fallas";

export const metadata = { title: "Equipos con fallas · Inspecciones MLP" };

export default async function FallasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <FallasEquipos base="/planificador" filtro={parseFiltroFallas(await searchParams)} puedeGestionar={false} carpetas />;
}
