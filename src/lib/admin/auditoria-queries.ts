import { createClient } from "@/lib/supabase/server";
import { FILAS_AUDITORIA, SELECT_AUDITORIA, criterioAuditoria, describirEvento, type EventoAuditoria, type FilaAuditoria, type TipoAuditoria } from "./auditoria";

/** Nombre de cada perfil por id, para decir quién hizo cada movimiento. */
async function leerNombres(supabase: Awaited<ReturnType<typeof createClient>>): Promise<Map<string, string>> {
  const { data, error } = await supabase.from("profiles").select("id, full_name").limit(1000);
  if (error) throw new Error(`No se pudieron leer los perfiles: ${error.message}`);
  return new Map((data ?? []).map((p) => [p.id as string, (p.full_name as string) || "Sin nombre"]));
}

export interface PaginaAuditoria {
  eventos: EventoAuditoria[];
  total: number;
  pagina: number;
  paginas: number;
}

/**
 * Una página de la auditoría, de lo más reciente a lo más antiguo. Lee con la sesión de quien mira: la política de
 * `audit_log` solo deja leer al administrador (a cualquier otro rol le devuelve cero filas).
 */
export async function leerAuditoria(tipo: TipoAuditoria, paginaPedida: number): Promise<PaginaAuditoria> {
  const supabase = await createClient();
  const c = criterioAuditoria(tipo);
  const consulta = (pagina: number) => {
    let q = supabase.from("audit_log").select(SELECT_AUDITORIA, { count: "exact" });
    if (c.tablas) q = q.in("table_name", c.tablas);
    if (c.accion) q = q.eq("action", c.accion);
    if (c.sinAccion) q = q.neq("action", c.sinAccion);
    const desde = (pagina - 1) * FILAS_AUDITORIA;
    return q.order("at", { ascending: false }).order("id", { ascending: false }).range(desde, desde + FILAS_AUDITORIA - 1);
  };

  let pagina = Math.max(1, paginaPedida);
  const [primera, nombres] = await Promise.all([consulta(pagina), leerNombres(supabase)]);
  let r = primera;
  // Página que ya no existe (PostgREST responde con error de rango y sin total): se vuelve a la primera.
  if (pagina > 1 && (r.error || (r.data ?? []).length === 0)) {
    pagina = 1;
    r = await consulta(1);
  }
  if (r.error) throw new Error(`No se pudo leer la auditoría: ${r.error.message}`);
  const data = r.data;
  const total = r.count ?? 0;
  const paginas = Math.max(1, Math.ceil(total / FILAS_AUDITORIA));
  return {
    eventos: ((data ?? []) as unknown as FilaAuditoria[]).map((f) => describirEvento(f, nombres)),
    total,
    pagina,
    paginas,
  };
}

/** Últimos movimientos de una cuenta: lo que hizo y lo que se le hizo. */
export async function leerActividadCuenta(id: string, limite = 12): Promise<EventoAuditoria[]> {
  const supabase = await createClient();
  const [filas, nombres] = await Promise.all([
    supabase
      .from("audit_log")
      .select(SELECT_AUDITORIA)
      .or(`actor_id.eq.${id},and(row_id.eq.${id},table_name.in.(profiles,cuentas))`)
      .order("at", { ascending: false })
      .order("id", { ascending: false })
      .limit(limite),
    leerNombres(supabase),
  ]);
  if (filas.error) throw new Error(`No se pudo leer la actividad: ${filas.error.message}`);
  return ((filas.data ?? []) as unknown as FilaAuditoria[]).map((f) => describirEvento(f, nombres));
}

export interface ResumenAdmin {
  /** Movimientos delicados de los últimos 7 días. */
  eliminaciones7: number;
  cambiosCuentas7: number;
  ultimos: EventoAuditoria[];
}

/** Para la pantalla «Inicio» del administrador: cuántos movimientos delicados hubo en la semana y los más recientes. */
export async function leerResumenAdmin(desdeIso: string): Promise<ResumenAdmin> {
  const supabase = await createClient();
  const contar = () => supabase.from("audit_log").select("id", { count: "exact", head: true }).gte("at", desdeIso);
  const [eliminaciones, cuentas, ultimos, nombres] = await Promise.all([
    contar().eq("table_name", "inspections").eq("action", "DELETE"),
    contar().eq("table_name", "cuentas"),
    supabase
      .from("audit_log")
      .select(SELECT_AUDITORIA)
      .or("table_name.eq.cuentas,and(table_name.eq.inspections,action.eq.DELETE)")
      .order("at", { ascending: false })
      .order("id", { ascending: false })
      .limit(5),
    leerNombres(supabase),
  ]);
  if (ultimos.error) throw new Error(`No se pudo leer la auditoría: ${ultimos.error.message}`);
  return {
    eliminaciones7: eliminaciones.count ?? 0,
    cambiosCuentas7: cuentas.count ?? 0,
    ultimos: ((ultimos.data ?? []) as unknown as FilaAuditoria[]).map((f) => describirEvento(f, nombres)),
  };
}
