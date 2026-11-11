import Link from "next/link";
import { ListaEventos } from "@/components/admin/lista-eventos";
import { FILAS_AUDITORIA, TIPOS_AUDITORIA, parseTipoAuditoria } from "@/lib/admin/auditoria";
import { leerAuditoria } from "@/lib/admin/auditoria-queries";
import { requireRole } from "@/lib/auth/session";
import { parsePagina } from "@/lib/exportar/consulta";

export const metadata = { title: "Auditoría · Inspección Eléctrica Bbosch-MLP" };

const flecha =
  "inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-hair px-3 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-cu";

/**
 * Registro de movimientos (solo el administrador): envíos, firmas, eliminaciones, cambios de cuentas y de formatos.
 * La base lo escribe sola y no deja modificarlo ni borrarlo; aquí solo se lee.
 */
export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole("admin");
  const sp = await searchParams;
  const tipo = parseTipoAuditoria(sp.tipo);
  const { eventos, total, pagina, paginas } = await leerAuditoria(tipo, parsePagina(sp.pagina));
  const url = (t: string, p = 1) => `/admin/auditoria?tipo=${t}${p > 1 ? `&pagina=${p}` : ""}`;
  const primera = (pagina - 1) * FILAS_AUDITORIA + 1;

  return (
    <section className="rounded-2xl border border-hair bg-white">
      <div className="border-b border-hair px-5 py-4">
        <h1 className="text-xl font-bold tracking-tight">Auditoría</h1>
        <p className="mt-1 max-w-3xl text-sm text-sub">
          Quién hizo qué y cuándo: envíos, firmas, eliminaciones de inspecciones, cambios de cuentas, formatos y seguimiento de hallazgos. El
          registro lo escribe la base de datos y no se puede modificar ni borrar. En cobre, los movimientos delicados.
        </p>
        <nav aria-label="Tipo de movimiento" className="mt-4 flex flex-wrap gap-1.5">
          {TIPOS_AUDITORIA.map((t) => (
            <Link
              key={t.value}
              href={url(t.value)}
              aria-current={t.value === tipo ? "page" : undefined}
              className={`rounded-full border px-3 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-cu ${
                t.value === tipo ? "border-graf bg-graf text-white" : "border-hair bg-white text-graf hover:bg-paper"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>

      <p className="border-b border-hair px-5 py-2.5 text-sm text-sub" role="status">
        {total === 0
          ? "Sin movimientos de este tipo."
          : `${total.toLocaleString("es-CL")} ${total === 1 ? "movimiento" : "movimientos"} · se muestran del ${primera} al ${primera + eventos.length - 1}, del más reciente al más antiguo`}
      </p>

      <ListaEventos eventos={eventos} vacio="No hay movimientos registrados." />

      {paginas > 1 && (
        <nav aria-label="Páginas de la auditoría" className="flex items-center justify-between gap-3 border-t border-hair px-5 py-3">
          {pagina > 1 ? (
            <Link href={url(tipo, pagina - 1)} className={`${flecha} hover:bg-paper`}>
              ← Más recientes
            </Link>
          ) : (
            <span className={`${flecha} text-sub opacity-50`} aria-disabled="true">
              ← Más recientes
            </span>
          )}
          <span className="font-mono text-xs text-sub">
            Página {pagina} de {paginas}
          </span>
          {pagina < paginas ? (
            <Link href={url(tipo, pagina + 1)} className={`${flecha} hover:bg-paper`}>
              Más antiguos →
            </Link>
          ) : (
            <span className={`${flecha} text-sub opacity-50`} aria-disabled="true">
              Más antiguos →
            </span>
          )}
        </nav>
      )}
    </section>
  );
}
