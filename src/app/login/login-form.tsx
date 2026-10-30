"use client";

import { useActionState } from "react";
import { iniciarSesion, type FormState } from "./actions";

const campo =
  "min-h-14 w-full rounded-xl border-[1.5px] border-[#8f897e] bg-white px-4 text-lg text-graf " +
  "placeholder:text-sub focus:border-cu focus:outline-3 focus:outline-offset-1 focus:outline-cu/40";

function Mensaje({ state }: { state: FormState }) {
  if (!state?.error) return null;
  return (
    <p
      role="alert"
      className="rounded-xl border border-[#bb0000] bg-[#fdecec] px-4 py-3 text-base font-medium text-[#7a0000]"
    >
      {state.error}
    </p>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action, entrando] = useActionState(iniciarSesion, undefined);

  return (
    <form action={action} className="flex w-full max-w-md flex-col gap-5" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <div className="flex flex-col gap-2">
        <label htmlFor="usuario" className="text-sm font-semibold text-graf">
          Usuario
        </label>
        <input
          id="usuario"
          name="usuario"
          type="text"
          defaultValue={state?.usuario ?? ""}
          autoComplete="username"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Ej.: TECNICO_A"
          required
          className={campo}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-semibold text-graf">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={8}
          required
          className={campo}
        />
      </div>

      <Mensaje state={state} />

      <button
        type="submit"
        disabled={entrando}
        className="min-h-14 rounded-xl bg-graf px-6 text-lg font-semibold text-white transition-transform hover:bg-graf-2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cu active:scale-[0.98] disabled:opacity-60"
      >
        {entrando ? "Procesando" : "Ingresar"}
      </button>

      <p className="text-sm text-sub">Si no tiene acceso, solicítelo al administrador.</p>
    </form>
  );
}
