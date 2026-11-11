import { ROLE_LABEL, type Role } from "@/lib/auth/roles";

/**
 * Pestaña «Auditoría» del administrador: lee `audit_log` (solo inserción; lo escriben los triggers y los RPC de la base)
 * y lo muestra en palabras. Aquí está el filtro y la descripción de cada movimiento, sin base de datos.
 */
export type TipoAuditoria = "todas" | "inspecciones" | "eliminaciones" | "cuentas" | "formatos" | "seguimiento";

export const TIPOS_AUDITORIA: { value: TipoAuditoria; label: string }[] = [
  { value: "todas", label: "Todo" },
  { value: "inspecciones", label: "Inspecciones y firmas" },
  { value: "eliminaciones", label: "Eliminaciones" },
  { value: "cuentas", label: "Cuentas y roles" },
  { value: "formatos", label: "Formatos" },
  { value: "seguimiento", label: "Seguimiento de hallazgos" },
];

export const FILAS_AUDITORIA = 50;

export function parseTipoAuditoria(v: string | string[] | undefined): TipoAuditoria {
  const s = Array.isArray(v) ? v[0] : v;
  return TIPOS_AUDITORIA.some((t) => t.value === s) ? (s as TipoAuditoria) : "todas";
}

/** Tablas y acciones de `audit_log` que corresponden a cada filtro. */
export function criterioAuditoria(tipo: TipoAuditoria): { tablas: string[] | null; accion?: string; sinAccion?: string } {
  switch (tipo) {
    case "inspecciones":
      return { tablas: ["inspections", "signatures"], sinAccion: "DELETE" };
    case "eliminaciones":
      return { tablas: ["inspections"], accion: "DELETE" };
    case "cuentas":
      return { tablas: ["profiles", "cuentas"] };
    case "formatos":
      return { tablas: ["form_templates"] };
    case "seguimiento":
      return { tablas: ["finding_followups"] };
    default:
      return { tablas: null };
  }
}

/**
 * Columnas que se piden: del `diff` (que puede traer la fila completa) solo los campos que se muestran.
 * Los alias son los de `FilaAuditoria`.
 */
export const SELECT_AUDITORIA = `id, table_name, row_id, action, actor_id, at,
  folio:diff->>folio, folio_nuevo:diff->new->>folio,
  estado:diff->>status, estado_antes:diff->old->>status, estado_nuevo:diff->new->>status,
  rol_antes:diff->old->>role, rol_nuevo:diff->new->>role,
  turno_antes:diff->old->>shift, turno_nuevo:diff->new->>shift,
  nombre_antes:diff->old->>full_name, nombre_nuevo:diff->new->>full_name,
  aviso_antes:diff->old->>aviso_privacidad_at, aviso_nuevo:diff->new->>aviso_privacidad_at,
  decision:diff->>decision, etapa:diff->>stage, inspeccion_id:diff->>inspection_id,
  usuario:diff->>usuario, version:diff->>version, version_nueva:diff->new->>version,
  alcance:diff->new->>scope, aviso_sap:diff->new->>sap_notice`;

export interface FilaAuditoria {
  id: number;
  table_name: string;
  row_id: string | null;
  action: string;
  actor_id: string | null;
  at: string;
  folio?: string | null;
  folio_nuevo?: string | null;
  estado?: string | null;
  estado_antes?: string | null;
  estado_nuevo?: string | null;
  rol_antes?: string | null;
  rol_nuevo?: string | null;
  turno_antes?: string | null;
  turno_nuevo?: string | null;
  nombre_antes?: string | null;
  nombre_nuevo?: string | null;
  aviso_antes?: string | null;
  aviso_nuevo?: string | null;
  decision?: string | null;
  etapa?: string | null;
  inspeccion_id?: string | null;
  usuario?: string | null;
  version?: string | null;
  version_nueva?: string | null;
  alcance?: string | null;
  aviso_sap?: string | null;
}

export type CategoriaEvento = "inspeccion" | "firma" | "eliminacion" | "cuenta" | "formato" | "seguimiento" | "otro";

export interface EventoAuditoria {
  id: number;
  at: string;
  categoria: CategoriaEvento;
  /** Qué pasó, en una frase. */
  titulo: string;
  /** Sobre qué (folio, cuenta, formato) y datos de apoyo. */
  detalle: string;
  /** Quién lo hizo; «Sistema» si no hubo una sesión (SQL directo o clave de servicio). */
  actor: string;
  /** Ruta dentro de `/admin` para abrir el objeto, si todavía se puede ver. */
  href: string | null;
  /** Movimiento delicado (borrado, cambio de rol, bloqueo, contraseña): se destaca. */
  sensible: boolean;
}

export const CATEGORIA_NOMBRE: Record<CategoriaEvento, string> = {
  inspeccion: "Inspección",
  firma: "Firma",
  eliminacion: "Eliminación",
  cuenta: "Cuenta",
  formato: "Formato",
  seguimiento: "Seguimiento",
  otro: "Otro",
};

const rol = (r: string | null | undefined) => (r && r in ROLE_LABEL ? ROLE_LABEL[r as Role] : (r ?? "—"));
const turno = (t: string | null | undefined) => (t ? `Turno ${t}` : "sin turno");

function deInspeccion(f: FilaAuditoria): Pick<EventoAuditoria, "categoria" | "titulo" | "detalle" | "sensible"> {
  const folio = f.folio_nuevo ?? f.folio ?? "sin folio";
  if (f.action === "DELETE") return { categoria: "eliminacion", titulo: "Inspección eliminada", detalle: `${folio} (queda la copia en la auditoría)`, sensible: true };
  const estado = f.action === "INSERT" ? f.estado : f.estado_nuevo;
  const cambio = f.action === "INSERT" || f.estado_antes !== f.estado_nuevo;
  const titulo = !cambio
    ? "Inspección actualizada"
    : estado === "submitted"
      ? "Inspección enviada"
      : estado === "supervisor_signed"
        ? "Firmada por el supervisor"
        : estado === "approved"
          ? "Aprobada por el programador"
          : estado === "rejected"
            ? "Inspección rechazada"
            : estado === "draft"
              ? "Borrador creado"
              : "Inspección actualizada";
  return { categoria: "inspeccion", titulo, detalle: folio, sensible: false };
}

function dePerfil(f: FilaAuditoria, cuenta: string): Pick<EventoAuditoria, "categoria" | "titulo" | "detalle" | "sensible"> {
  const cambios: string[] = [];
  if (f.rol_antes !== f.rol_nuevo) cambios.push(`rol: ${rol(f.rol_antes)} → ${rol(f.rol_nuevo)}`);
  if ((f.turno_antes ?? null) !== (f.turno_nuevo ?? null)) cambios.push(`turno: ${turno(f.turno_antes)} → ${turno(f.turno_nuevo)}`);
  if (f.nombre_antes !== f.nombre_nuevo) cambios.push(`nombre: «${f.nombre_antes ?? ""}» → «${f.nombre_nuevo ?? ""}»`);
  if (cambios.length > 0) {
    return { categoria: "cuenta", titulo: "Cuenta modificada", detalle: `${cuenta} · ${cambios.join(" · ")}`, sensible: f.rol_antes !== f.rol_nuevo };
  }
  if ((f.aviso_antes ?? null) !== (f.aviso_nuevo ?? null)) {
    return { categoria: "cuenta", titulo: "Aviso de privacidad leído", detalle: cuenta, sensible: false };
  }
  return { categoria: "cuenta", titulo: "Perfil actualizado", detalle: cuenta, sensible: false };
}

const ACCION_CUENTA: Record<string, string> = {
  CREAR_CUENTA: "Cuenta creada",
  CAMBIAR_CLAVE: "Contraseña cambiada",
  BLOQUEAR: "Cuenta bloqueada",
  DESBLOQUEAR: "Cuenta desbloqueada",
};

/**
 * Convierte una fila de `audit_log` en un movimiento legible.
 * @param nombres nombre de cada perfil por id (para «quién» y para la cuenta afectada).
 */
export function describirEvento(f: FilaAuditoria, nombres: ReadonlyMap<string, string>): EventoAuditoria {
  const actor = f.actor_id ? (nombres.get(f.actor_id) ?? "Cuenta eliminada") : "Sistema";
  const base = { id: f.id, at: f.at, actor };
  const cuenta = (id: string | null) => (id ? (nombres.get(id) ?? f.usuario ?? "cuenta eliminada") : "—");

  switch (f.table_name) {
    case "inspections": {
      const e = deInspeccion(f);
      return { ...base, ...e, href: f.action !== "DELETE" && f.row_id && e.titulo !== "Borrador creado" ? `/admin/${f.row_id}` : null };
    }
    case "signatures": {
      const etapa = f.etapa === "planner" ? "programador" : "supervisor";
      return {
        ...base,
        categoria: "firma",
        titulo: f.decision === "rejected" ? `Firma del ${etapa}: rechaza` : `Firma del ${etapa}: aprueba`,
        detalle: "Firma registrada",
        href: f.inspeccion_id ? `/admin/${f.inspeccion_id}` : null,
        sensible: false,
      };
    }
    case "profiles":
      return { ...base, ...dePerfil(f, cuenta(f.row_id)), href: f.row_id ? `/admin/usuarios/${f.row_id}` : null };
    case "cuentas":
      return {
        ...base,
        categoria: "cuenta",
        titulo: ACCION_CUENTA[f.action] ?? "Acción sobre una cuenta",
        detalle: f.usuario ? `${f.usuario} · ${cuenta(f.row_id)}` : cuenta(f.row_id),
        href: f.row_id ? `/admin/usuarios/${f.row_id}` : null,
        sensible: true,
      };
    case "form_templates": {
      const version = f.version_nueva ?? f.version;
      const v = version ? `versión ${version}` : "versión";
      const titulo =
        f.action === "DELETE"
          ? "Borrador de formato eliminado"
          : f.action === "INSERT"
            ? f.estado === "published"
              ? "Formato publicado"
              : "Borrador de formato creado"
            : f.estado_antes !== "published" && f.estado_nuevo === "published"
              ? "Formato publicado"
              : "Borrador de formato modificado";
      return { ...base, categoria: "formato", titulo, detalle: v.charAt(0).toUpperCase() + v.slice(1), href: null, sensible: false };
    }
    case "finding_followups":
      return {
        ...base,
        categoria: "seguimiento",
        titulo: "Seguimiento de hallazgo",
        // Alcance «bbosch» sin número de aviso es la forma de quitar el seguimiento (RPC `set_finding_followup`).
        detalle:
          f.alcance === "terceros"
            ? "Canalizado con MLP (requiere apoyo de terceros)"
            : f.aviso_sap
              ? `Aviso SAP ${f.aviso_sap}`
              : "Seguimiento quitado",
        href: null,
        sensible: false,
      };
    default:
      return { ...base, categoria: "otro", titulo: `${f.table_name} · ${f.action}`, detalle: "", href: null, sensible: false };
  }
}
