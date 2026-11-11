"use client";

import { useActionState, useRef, useState } from "react";
import { actualizarCuenta, cambiarBloqueo, cambiarClave, crearCuenta } from "@/app/admin/usuarios/actions";
import { LARGO_MINIMO_CLAVE, generarClave, type EstadoAccion } from "@/lib/admin/cuentas";
import { ROLES, ROLE_LABEL, SHIFTS, type Role, type Shift } from "@/lib/auth/roles";

const campo =
  "w-full min-w-0 rounded-lg border border-hair bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-cu disabled:bg-paper disabled:text-sub";
const rotulo = "grid w-full gap-1 text-xs font-semibold text-sub";
const boton =
  "inline-flex min-h-9 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cu disabled:opacity-60";
const principal = `${boton} bg-graf text-white hover:bg-graf-2`;
const secundario = `${boton} border border-hair bg-white hover:bg-paper`;

/** Resultado de la última acción, bajo el formulario. */
function Mensaje({ estado }: { estado: EstadoAccion }) {
  if (!estado) return null;
  return estado.ok ? (
    <p role="status" className="rounded-lg border border-[#1d7a46]/40 bg-[#eaf5ee] px-3 py-2 text-sm font-medium text-[#14532d]">
      {estado.mensaje}
    </p>
  ) : (
    <p role="alert" className="rounded-lg border border-[#bb0000]/50 bg-[#fdecec] px-3 py-2 text-sm font-medium text-[#7a0000]">
      {estado.error}
    </p>
  );
}

/** Rol y turno: el administrador no lleva turno, así que al elegirlo el turno se desactiva. */
function RolYTurno({ rol, turno, bloqueado = false }: { rol: Role; turno: Shift | null; bloqueado?: boolean }) {
  const [elegido, setElegido] = useState<Role>(rol);
  return (
    <>
      <label className={rotulo}>
        Rol
        <select name="role" value={elegido} onChange={(e) => setElegido(e.target.value as Role)} disabled={bloqueado} className={campo}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABEL[r]}
            </option>
          ))}
        </select>
        {/* Un campo desactivado no viaja en el formulario. */}
        {bloqueado ? <input type="hidden" name="role" value={elegido} /> : null}
      </label>
      <label className={rotulo}>
        Turno
        <select name="shift" defaultValue={elegido === "admin" ? "" : (turno ?? "A")} disabled={elegido === "admin"} className={campo} key={elegido === "admin" ? "sin" : "con"}>
          {elegido === "admin" ? <option value="">Sin turno</option> : null}
          {SHIFTS.map((s) => (
            <option key={s} value={s}>
              Turno {s}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}

/** Campo de contraseña a la vista (hay que entregársela a la persona), con un botón que propone una al azar. */
function CampoClave({ id }: { id: string }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <label className={rotulo} htmlFor={id}>
      Contraseña nueva
      <span className="flex gap-2">
        <input
          ref={ref}
          id={id}
          name="clave"
          type="text"
          required
          minLength={LARGO_MINIMO_CLAVE}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className={`${campo} font-mono`}
        />
        <button
          type="button"
          className={`${secundario} shrink-0`}
          onClick={() => {
            if (ref.current) ref.current.value = generarClave((n) => crypto.getRandomValues(new Uint8Array(n)));
          }}
        >
          Generar
        </button>
      </span>
      <span className="font-normal">Mínimo {LARGO_MINIMO_CLAVE} caracteres, con letras y números. Anótela ahora: después no se puede ver.</span>
    </label>
  );
}

export function FormNuevaCuenta({ habilitado }: { habilitado: boolean }) {
  const [estado, accion, enviando] = useActionState(crearCuenta, undefined);
  return (
    <form action={accion} className="grid gap-4">
      <fieldset disabled={!habilitado || enviando} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className={rotulo}>
          Usuario
          <input
            name="usuario"
            required
            maxLength={39}
            pattern="[A-Za-z0-9][A-Za-z0-9._\-]{1,38}"
            title="De 2 a 39 letras, números, punto, guion o guion bajo, sin espacios"
            placeholder="Ej.: TECNICO_C"
            autoComplete="off"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            className={`${campo} font-mono uppercase placeholder:normal-case`}
          />
        </label>
        <label className={rotulo}>
          Nombre
          <input name="fullName" required maxLength={80} placeholder="Ej.: Técnico C" autoComplete="off" className={campo} />
        </label>
        <RolYTurno rol="technician" turno="A" />
        <div className="sm:col-span-2">
          <CampoClave id="clave-nueva-cuenta" />
        </div>
      </fieldset>
      <Mensaje estado={estado} />
      <div>
        <button type="submit" disabled={!habilitado || enviando} className={principal}>
          {enviando ? "Creando…" : "Crear cuenta"}
        </button>
      </div>
    </form>
  );
}

export function FormDatosCuenta({ id, nombre, rol, turno, propia }: { id: string; nombre: string; rol: Role; turno: Shift | null; propia: boolean }) {
  const [estado, accion, enviando] = useActionState(actualizarCuenta, undefined);
  return (
    <form action={accion} className="grid gap-4">
      <input type="hidden" name="userId" value={id} />
      <div className="grid gap-4 sm:grid-cols-3">
        <label className={rotulo}>
          Nombre
          <input name="fullName" required maxLength={80} defaultValue={nombre} autoComplete="off" className={campo} />
        </label>
        <RolYTurno rol={rol} turno={turno} bloqueado={propia} />
      </div>
      {propia ? <p className="text-xs text-sub">Es su propia cuenta: puede corregir el nombre, pero no quitarse el rol de administrador.</p> : null}
      <Mensaje estado={estado} />
      <div>
        <button type="submit" disabled={enviando} className={principal}>
          {enviando ? "Guardando…" : "Guardar datos"}
        </button>
      </div>
    </form>
  );
}

export function FormClave({ id, habilitado }: { id: string; habilitado: boolean }) {
  const [estado, accion, enviando] = useActionState(cambiarClave, undefined);
  return (
    <form action={accion} className="grid gap-4">
      <input type="hidden" name="userId" value={id} />
      <fieldset disabled={!habilitado || enviando} className="max-w-xl">
        <CampoClave id={`clave-${id}`} />
      </fieldset>
      <Mensaje estado={estado} />
      <div>
        <button type="submit" disabled={!habilitado || enviando} className={principal}>
          {enviando ? "Cambiando…" : "Cambiar contraseña"}
        </button>
      </div>
    </form>
  );
}

export function FormBloqueo({ id, usuario, bloqueada, habilitado, propia }: { id: string; usuario: string; bloqueada: boolean; habilitado: boolean; propia: boolean }) {
  const [estado, accion, enviando] = useActionState(cambiarBloqueo, undefined);
  return (
    <form
      action={accion}
      className="grid gap-4"
      onSubmit={(e) => {
        if (!bloqueada && !window.confirm(`¿Bloquear la cuenta ${usuario}? No podrá ingresar hasta que la desbloquee.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="userId" value={id} />
      <input type="hidden" name="bloquear" value={bloqueada ? "0" : "1"} />
      <Mensaje estado={estado} />
      <div>
        <button
          type="submit"
          disabled={!habilitado || enviando || (propia && !bloqueada)}
          className={bloqueada ? principal : `${boton} border border-[#bb0000] bg-white text-[#7a0000] hover:bg-[#fdecec]`}
        >
          {enviando ? "Procesando…" : bloqueada ? "Desbloquear cuenta" : "Bloquear cuenta"}
        </button>
      </div>
    </form>
  );
}
