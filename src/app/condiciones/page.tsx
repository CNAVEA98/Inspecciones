import type { Metadata } from "next";
import Link from "next/link";
import { PaginaLegal } from "@/components/shared/pagina-legal";

export const metadata: Metadata = { title: "Condiciones de uso · Inspección Eléctrica Bbosch-MLP" };

const ul = "ml-5 list-disc space-y-2";

/** Condiciones de uso internas de la aplicación. */
export default function CondicionesPage() {
  return (
    <PaginaLegal titulo="Condiciones de uso" actualizado="3 de noviembre de 2026">
      <p>
        La aplicación «Inspección Eléctrica Bbosch-MLP» es una herramienta de trabajo de <strong>Bbosch</strong> para los
        servicios que presta a <strong>Minera Los Pelambres (MLP)</strong>. Al usarla, usted acepta estas condiciones:
      </p>
      <ul className={ul}>
        <li>
          <strong>Uso autorizado.</strong> Solo puede usarla el personal autorizado por Bbosch y MLP, para las tareas de
          inspección, mantención, revisión y firma que le corresponden según su rol.
        </li>
        <li>
          <strong>Cuentas.</strong> Las cuentas las entrega el equipo de la aplicación. No comparta la contraseña fuera de su
          turno ni la use para otra persona, y cierre sesión en equipos que no sean de trabajo.
        </li>
        <li>
          <strong>Información verídica.</strong> Lo que registre (respuestas, hallazgos, fotos, participantes) debe
          corresponder a lo que realmente se inspeccionó. Las fotos deben ser solo del equipo o del trabajo, sin personas
          identificables cuando se pueda evitar.
        </li>
        <li>
          <strong>Firmas.</strong> Firmar en la aplicación deja constancia de que usted realizó, revisó o aprobó la
          inspección. Una inspección aprobada no se modifica.
        </li>
        <li>
          <strong>Confidencialidad.</strong> Los datos de equipos, instalaciones e informes son información de MLP y de
          Bbosch: no los comparta fuera del trabajo. Al compartir un PDF, envíelo solo a quien corresponda.
        </li>
        <li>
          <strong>Problemas.</strong> Si algo falla, avise a su supervisor indicando la versión que aparece al pie de la
          pantalla (por ejemplo, V1.1.0).
        </li>
      </ul>
      <p>
        El tratamiento de los datos personales se explica en{" "}
        <Link href="/privacidad" className="font-semibold text-cu underline underline-offset-2">
          Privacidad y uso de datos
        </Link>
        .
      </p>
    </PaginaLegal>
  );
}
