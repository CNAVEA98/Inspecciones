import { AccionesPdf } from "@/components/acciones-pdf";
import { rolConTurno } from "@/lib/sesion";
import { entregarPdf } from "@/lib/tecnico/informe";
import { useTecnico } from "@/lib/tecnico-contexto";

/**
 * PDF de una inspección del técnico: compartir o guardar en el teléfono.
 * Con señal y enviada usa el PDF oficial del servidor; sin señal usa el oficial descargado antes o lo genera en el teléfono,
 * así que siempre se puede obtener.
 */
export function BotonPdf({ id }: { id: string }) {
  const { almacen, supabase, catalog, perfil } = useTecnico();
  return (
    <AccionesPdf
      obtener={(destino) =>
        entregarPdf({ almacen, supabase, catalog: catalog.catalog, tecnico: rolConTurno(perfil), turno: perfil.turno }, id, destino)
      }
    />
  );
}
