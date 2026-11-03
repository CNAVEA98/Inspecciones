import Link from "next/link";
import { NuevoFormato } from "./nuevo-formato";
import type { CodigoArea } from "@/lib/formatos/catalogo";
import { siguienteNumero } from "@/lib/formatos/nuevo";
import { cargarFormatos } from "@/lib/formatos/plantillas";
import { createClient } from "@/lib/supabase/server";

/** Página «Nuevo formato» (supervisor y administrador; la acción y la base vuelven a validar el rol). */
export async function PaginaNuevoFormato({ base }: { base: string }) {
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
        <Link href={`${base}/formatos`} className="text-sm font-semibold text-sub hover:text-graf focus-visible:outline-2 focus-visible:outline-cu">
          ← Formatos
        </Link>
        <h1 className="text-xl font-bold tracking-tight">Nuevo formato</h1>
        <p className="max-w-3xl text-sm text-sub">
          El formato nuevo parte como una copia del contenido vigente de otro del mismo tipo. Al crearlo se abre el editor para
          ajustar sus secciones e ítems.
        </p>
      </header>
      <NuevoFormato
        base={base}
        origenes={origenes}
        areas={(areas ?? []) as { code: CodigoArea; name: string }[]}
        siguiente={{ INSP: siguienteNumero(formatos, "INSP"), MANT: siguienteNumero(formatos, "MANT") }}
        existentes={formatos.map((f) => f.id)}
      />
    </div>
  );
}
