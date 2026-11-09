import { useEffect, useState } from "react";
import { redNativa } from "./red";

/** ¿Hay señal ahora? Se actualiza cuando cambia la red o la app vuelve a primer plano. */
export function useEnLinea(): boolean {
  const [enLinea, setEnLinea] = useState(() => redNativa.enLinea());
  useEffect(() => redNativa.escuchar(() => setEnLinea(redNativa.enLinea())), []);
  return enLinea;
}
