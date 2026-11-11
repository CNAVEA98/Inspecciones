"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { BLOQUEO_INDEFINIDO, SIN_BLOQUEO, esquemaClave, esquemaDatosCuenta, esquemaNuevaCuenta, usuarioDeEmail, type EstadoAccion } from "@/lib/admin/cuentas";
import { requireRole } from "@/lib/auth/session";
import { clienteServicio } from "@/lib/informe/archivo";
import { createClient } from "@/lib/supabase/server";

/**
 * Administración de cuentas. Solo un administrador: lo exigen `requireRole("admin")` en cada acción, las políticas de RLS
 * y los RPC de la base (`registrar_accion_cuenta`, `cerrar_sesiones_cuenta`, migración 0022).
 *
 * Crear cuentas, cambiar contraseñas y bloquear se hace en Supabase Auth con la clave de servicio, que solo existe en el
 * servidor. Cada una de esas acciones se registra en `audit_log` ANTES de ejecutarse (si no se puede registrar, no se
 * hace). Nunca se guarda ni se registra una contraseña.
 */
const SIN_SERVICIO = "El servidor no tiene configurada la clave de servicio (SUPABASE_SERVICE_ROLE_KEY); no se pueden administrar cuentas desde aquí.";

const primerError = (e: z.ZodError) => e.issues[0]?.message ?? "Revise los datos del formulario.";
const refrescar = (id?: string) => {
  revalidatePath("/admin/usuarios");
  if (id) revalidatePath(`/admin/usuarios/${id}`);
  revalidatePath("/admin/auditoria");
  revalidatePath("/admin/panel");
};

type Accion = "CREAR_CUENTA" | "CAMBIAR_CLAVE" | "BLOQUEAR" | "DESBLOQUEAR";

/** Deja el movimiento en la auditoría. Devuelve el motivo si no se pudo (p. ej. falta aplicar la migración 0022). */
async function registrar(supabase: SupabaseClient, userId: string, accion: Accion, detalle: Record<string, string | null>): Promise<string | null> {
  const { error } = await supabase.rpc("registrar_accion_cuenta", { p_user: userId, p_accion: accion, p_detalle: detalle });
  return error ? `No se pudo registrar la acción en la auditoría, así que no se ejecutó (${error.message}).` : null;
}

/** Usuario («TECNICO_A») de una cuenta, para dejarlo escrito en la auditoría. */
async function usuarioDe(servicio: SupabaseClient, userId: string): Promise<string | null> {
  const { data, error } = await servicio.auth.admin.getUserById(userId);
  return error || !data.user ? null : usuarioDeEmail(data.user.email);
}

export async function crearCuenta(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  await requireRole("admin");
  const parsed = esquemaNuevaCuenta.safeParse({
    usuario: formData.get("usuario"),
    fullName: formData.get("fullName"),
    role: formData.get("role"),
    shift: formData.get("shift") ?? "",
    clave: formData.get("clave"),
  });
  if (!parsed.success) return { ok: false, error: primerError(parsed.error) };
  const d = parsed.data;
  const servicio = clienteServicio();
  if (!servicio) return { ok: false, error: SIN_SERVICIO };

  const { data, error } = await servicio.auth.admin.createUser({
    email: d.email,
    password: d.clave,
    email_confirm: true,
    user_metadata: { full_name: d.fullName },
  });
  if (error || !data.user) {
    const repetido = /already|registered|exists/i.test(error?.message ?? "");
    return { ok: false, error: repetido ? `Ya existe una cuenta con el usuario ${usuarioDeEmail(d.email)}.` : `No se pudo crear la cuenta: ${error?.message ?? "sin respuesta"}` };
  }
  const id = data.user.id;

  // El alta crea el perfil como técnico sin turno; rol y turno se asignan con la sesión del administrador (queda en la auditoría).
  const supabase = await createClient();
  const perfil = await supabase.from("profiles").update({ full_name: d.fullName, role: d.role, shift: d.shift }).eq("id", id).select("id");
  const falla =
    perfil.error?.message ??
    (perfil.data?.length === 1 ? null : "no se encontró el perfil recién creado") ??
    (await registrar(supabase, id, "CREAR_CUENTA", { usuario: usuarioDeEmail(d.email), rol: d.role, turno: d.shift }));
  if (falla) {
    // No se deja una cuenta a medias (sin rol o sin registro).
    await servicio.auth.admin.deleteUser(id);
    return { ok: false, error: `No se pudo crear la cuenta: ${falla}` };
  }

  refrescar();
  return { ok: true, mensaje: `Cuenta ${usuarioDeEmail(d.email)} creada. Entregue la contraseña a la persona: no se vuelve a mostrar.` };
}

export async function actualizarCuenta(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const session = await requireRole("admin");
  const parsed = esquemaDatosCuenta.safeParse({
    userId: formData.get("userId"),
    fullName: formData.get("fullName"),
    role: formData.get("role"),
    shift: formData.get("shift") ?? "",
  });
  if (!parsed.success) return { ok: false, error: primerError(parsed.error) };
  const d = parsed.data;
  // El administrador no se quita el acceso a sí mismo; puede corregir su nombre.
  if (d.userId === session.id && d.role !== "admin") return { ok: false, error: "No puede cambiar el rol de su propia cuenta." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ full_name: d.fullName, role: d.role, shift: d.shift })
    .eq("id", d.userId)
    .select("id");
  if (error) return { ok: false, error: `No se guardó: ${error.message}` };
  if (data?.length !== 1) return { ok: false, error: "La cuenta ya no existe." };

  refrescar(d.userId);
  return { ok: true, mensaje: "Datos guardados." };
}

export async function cambiarClave(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const session = await requireRole("admin");
  const parsed = esquemaClave.safeParse({ userId: formData.get("userId"), clave: formData.get("clave") });
  if (!parsed.success) return { ok: false, error: primerError(parsed.error) };
  const { userId, clave } = parsed.data;
  const servicio = clienteServicio();
  if (!servicio) return { ok: false, error: SIN_SERVICIO };
  const usuario = await usuarioDe(servicio, userId);
  if (!usuario) return { ok: false, error: "La cuenta ya no existe." };

  const supabase = await createClient();
  const sinRegistro = await registrar(supabase, userId, "CAMBIAR_CLAVE", { usuario });
  if (sinRegistro) return { ok: false, error: sinRegistro };

  const { error } = await servicio.auth.admin.updateUserById(userId, { password: clave });
  if (error) return { ok: false, error: `No se pudo cambiar la contraseña: ${error.message}` };

  // La contraseña anterior deja de servir; además se cierran las sesiones que la persona tenía abiertas.
  let cierre = "";
  if (userId !== session.id) {
    const { error: e } = await supabase.rpc("cerrar_sesiones_cuenta", { p_user: userId });
    cierre = e ? " No se pudieron cerrar sus sesiones abiertas; siguen activas hasta que salga." : " Sus sesiones abiertas se cerraron.";
  }
  refrescar(userId);
  return { ok: true, mensaje: `Contraseña de ${usuario} cambiada.${cierre} Entréguela a la persona: no se vuelve a mostrar.` };
}

const entradaBloqueo = z.object({ userId: z.string().uuid(), bloquear: z.enum(["1", "0"]) });

export async function cambiarBloqueo(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const session = await requireRole("admin");
  const parsed = entradaBloqueo.safeParse({ userId: formData.get("userId"), bloquear: formData.get("bloquear") });
  if (!parsed.success) return { ok: false, error: "Solicitud inválida." };
  const { userId } = parsed.data;
  const bloquear = parsed.data.bloquear === "1";
  if (bloquear && userId === session.id) return { ok: false, error: "No puede bloquear su propia cuenta." };
  const servicio = clienteServicio();
  if (!servicio) return { ok: false, error: SIN_SERVICIO };
  const usuario = await usuarioDe(servicio, userId);
  if (!usuario) return { ok: false, error: "La cuenta ya no existe." };

  const supabase = await createClient();
  const sinRegistro = await registrar(supabase, userId, bloquear ? "BLOQUEAR" : "DESBLOQUEAR", { usuario });
  if (sinRegistro) return { ok: false, error: sinRegistro };

  const { error } = await servicio.auth.admin.updateUserById(userId, { ban_duration: bloquear ? BLOQUEO_INDEFINIDO : SIN_BLOQUEO });
  if (error) return { ok: false, error: `No se pudo ${bloquear ? "bloquear" : "desbloquear"} la cuenta: ${error.message}` };

  let cierre = "";
  if (bloquear) {
    const { error: e } = await supabase.rpc("cerrar_sesiones_cuenta", { p_user: userId });
    cierre = e
      ? " No se pudieron cerrar sus sesiones abiertas: pueden seguir activas hasta una hora."
      : " Sus sesiones abiertas se cerraron.";
  }
  refrescar(userId);
  return {
    ok: true,
    mensaje: bloquear
      ? `Cuenta ${usuario} bloqueada: no puede ingresar.${cierre} Sus inspecciones y firmas se conservan.`
      : `Cuenta ${usuario} desbloqueada: puede volver a ingresar con su contraseña.`,
  };
}
