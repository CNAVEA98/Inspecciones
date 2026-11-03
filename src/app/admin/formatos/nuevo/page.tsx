import Link from "next/link";
import { NuevoFormato } from "@/components/formatos/nuevo-formato";
import type { CodigoArea } from "@/lib/formatos/catalogo";
import { siguienteNumero } from "@/lib/formatos/nuevo";
import { cargarFormatos } from "@/lib/formatos/plantillas";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Nuevo formato · Inspecciones MLP" };

/** Solo el administrador (el layout de /admin lo exige; la acción y la base lo vuelven a validar). */
export default async function NuevoFormatoPage() {
  const supabase = await createClient();
  const [formatos, { data: areas }] = await Promise.all([
    cargarFormatos(),
    supabase.from("areas").select("code, name").eq("active", true).order("sort"),
  ]);
  const origenes = formatos
    .filter((f) => f.estado === "disponible")
    .map(({ id, tipo, titulo, familia, areas, designadores, campo, variosEquipos }) => ({ id, tipo, titulo, familia, areas, designadores, campo, variosEquipos }));

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <Link href="/admin/formatos" className="text-sm font-semibold text-sub hover:text-graf focus-visible:outline-2 focus-visible:outline-cu">
          ← Formatos
        </Link>
        <h1 className="text-xl font-bold tracking-tight">Nuevo formato</h1>
        <p className="max-w-3xl text-sm text-sub">
          El formato nuevo parte como una copia del contenido vigente de otro del mismo tipo. Al crearlo se abre el editor para
          ajustar sus secciones e ítems.
        </p>
      </header>
      <NuevoFormato
        origenes={origenes}
        areas={(areas ?? []) as { code: CodigoArea; name: string }[]}
        siguiente={{ INSP: siguienteNumero(formatos, "INSP"), MANT: siguienteNumero(formatos, "MANT") }}
        existentes={formatos.map((f) => f.id)}
      />
    </div>
  );
}
