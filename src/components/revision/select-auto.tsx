"use client";

import type { ComponentProps } from "react";

/** Select que envía su formulario al elegir una opción (sin JavaScript, se aplica con el botón «Buscar»). */
export function SelectAuto(props: ComponentProps<"select">) {
  return <select {...props} onChange={(e) => e.currentTarget.form?.requestSubmit()} />;
}
