import Link from "next/link";
import { notFound } from "next/navigation";
import { formatFechaHora } from "@/lib/fecha";
import { obtenerPlantillaEditable } from "@/lib/formatos/plantillas";
import { EditorFormato } from "./editor-formato";

/** Detalle de un formato: editor (supervisor y administrador) o solo lectura (planificador), más el historial de versiones. */
export async function PaginaFormato({ base, formatoId, puedeEditar }: { base: string; formatoId: string; puedeEditar: boolean }) {
  const p = await obtenerPlantillaEditable(formatoId);
  if (!p) notFound();
  const titulo = p.formato.titulo.trim();

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <Link href={`${base}/formatos`} className="text-sm font-semibold text-sub hover:text-graf focus-visible:outline-2 focus-visible:outline-cu">
          ← Formatos
        </Link>
        <h1 className="text-xl font-bold tracking-tight">
          <span className="font-mono">{p.formato.id}</span> · {titulo}
        </h1>
        <p className="text-sm text-sub">
          {p.familia} · versión vigente <strong className="text-graf">v{p.actual.version}</strong>
          {p.schema.meta ? ` · ${p.schema.meta.norma} · ${p.schema.meta.revision}` : ""}
          {puedeEditar ? "" : " · solo lectura"}
        </p>
        {p.formato.activo ? null : (
          <p className="rounded-xl border border-hair bg-paper px-4 py-2 text-sm font-semibold text-sub">
            Formato desactivado: los técnicos no lo ven al elegir un formato. Un supervisor o un administrador puede reactivarlo desde la lista.
          </p>
        )}
        {puedeEditar && (
          <p className="max-w-3xl text-sm text-sub">
            Puede cambiar textos, ayudas, unidades y rangos, agregar o quitar secciones e ítems y reordenarlos. También puede sumar campos propios a la
            cabecera. No se cambian el tipo ni el identificador de los ítems que ya existen, ni los campos estándar de la cabecera, las firmas
            ni las lecturas del informe. Si cambia el contenido
            normativo, recuerde actualizar la revisión del documento oficial.
          </p>
        )}
      </header>

      <EditorFormato
        key={p.actual.version}
        formatoId={p.formato.id}
        titulo={titulo}
        versionBase={p.actual.version}
        inicial={p.schema}
        soloLectura={!puedeEditar}
      />

      <section className="rounded-2xl border border-hair bg-white">
        <h2 className="border-b border-hair px-5 py-3 text-base font-bold">Historial de versiones</h2>
        <ul className="divide-y divide-hair text-sm">
          {p.historial.map((v) => (
            <li key={v.id} className="flex flex-wrap gap-x-4 gap-y-1 px-5 py-3">
              <span className="font-mono font-semibold">v{v.version}</span>
              <span className="text-sub">{v.publicadaEn ? formatFechaHora(v.publicadaEn) : "—"}</span>
              <span className="text-sub">{v.autor ?? "Carga inicial"}</span>
              <span className="min-w-60 flex-1">{v.nota ?? "Versión inicial del formato."}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
