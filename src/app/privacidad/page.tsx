import type { Metadata } from "next";
import { PaginaLegal } from "@/components/shared/pagina-legal";

export const metadata: Metadata = { title: "Privacidad · Inspección Eléctrica Bbosch-MLP" };

const h2 = "mt-4 text-xl font-bold";
const ul = "ml-5 list-disc space-y-1";

/** Política de privacidad y uso de datos. Si cambia en algo de fondo, actualizar `VERSION_AVISO_PRIVACIDAD`. */
export default function PrivacidadPage() {
  return (
    <PaginaLegal titulo="Privacidad y uso de datos" actualizado="3 de noviembre de 2026">
      <p>
        Esta aplicación la opera <strong>Bbosch</strong> para registrar las inspecciones y mantenciones de terreno de la
        infraestructura eléctrica de <strong>Minera Los Pelambres (MLP)</strong>. Es de uso interno: solo la usan personas
        autorizadas por Bbosch y MLP, con cuentas creadas por el equipo de la aplicación.
      </p>

      <h2 className={h2}>Qué datos se guardan</h2>
      <ul className={ul}>
        <li>Datos de la cuenta: usuario, nombre, rol (técnico, supervisor, programador o administrador) y turno.</li>
        <li>
          Lo que se registra en cada inspección: equipo (TAG), fecha y hora, respuestas, observaciones, hallazgos, fotos,
          nombre de los participantes y del encargado de la actividad.
        </li>
        <li>Firmas dibujadas del encargado, del supervisor y del programador.</li>
        <li>Registro de acciones: quién creó, envió, firmó, aprobó, rechazó o eliminó cada registro y cuándo.</li>
      </ul>
      <p>
        <strong>No se guarda</strong> la ubicación del teléfono: las fotos se procesan en el teléfono antes de subirlas y se
        les quitan los metadatos (ubicación GPS, modelo del equipo). No hay publicidad, ni herramientas de analítica, ni
        seguimiento entre sitios.
      </p>

      <h2 className={h2}>Para qué se usan</h2>
      <ul className={ul}>
        <li>Dejar constancia firmada y trazable del estado de los equipos inspeccionados.</li>
        <li>Revisar, aprobar o rechazar las inspecciones y dar seguimiento a los hallazgos (incluidos los avisos en SAP de MLP).</li>
        <li>Generar los informes PDF que se entregan a MLP.</li>
        <li>Controlar el acceso según el rol de cada persona.</li>
      </ul>
      <p>
        El tratamiento se basa en la relación laboral o contractual con Bbosch y en el contrato de servicio entre Bbosch y
        MLP; no se usa para otros fines.
      </p>

      <h2 className={h2}>Quién ve los datos</h2>
      <ul className={ul}>
        <li>El técnico ve sus propias inspecciones.</li>
        <li>Supervisores, programadores y administradores de Bbosch ven las inspecciones para revisarlas y firmarlas.</li>
        <li>MLP recibe los informes y la información de los hallazgos como cliente del servicio.</li>
      </ul>

      <h2 className={h2}>Dónde se guardan</h2>
      <p>La aplicación usa dos proveedores, que tratan los datos solo por cuenta de Bbosch:</p>
      <ul className={ul}>
        <li>
          <strong>Supabase</strong> (base de datos, fotos, firmas y cuentas), con servidores en São Paulo, Brasil.
        </li>
        <li>
          <strong>Vercel</strong> (aloja la aplicación; sus funciones corren en São Paulo, Brasil). Como todo servidor web,
          registra datos técnicos de las conexiones, como la dirección IP.
        </li>
      </ul>
      <p>Por eso los datos se guardan fuera de Chile. El acceso está protegido por usuario y contraseña y por reglas en la base de datos que limitan qué puede ver cada rol.</p>

      <h2 className={h2}>Cookies y datos en el teléfono</h2>
      <p>
        La aplicación usa solo <strong>cookies necesarias</strong> para mantener la sesión iniciada. No usa cookies de
        publicidad ni de analítica, por eso no muestra un aviso de cookies. Para trabajar sin señal, guarda en el teléfono
        las inspecciones del técnico (también las ya enviadas, para mostrarlas en «Enviadas»), el catálogo de formatos y
        algunas páginas de la app. Las inspecciones en curso se pueden eliminar desde la app, y las páginas guardadas se
        borran al cerrar sesión.
      </p>

      <h2 className={h2}>Cuánto tiempo se conservan</h2>
      <p>
        Las inspecciones firmadas son registros de mantenimiento: se conservan mientras sean necesarias para la trazabilidad
        de los equipos y según los plazos de conservación documental de Bbosch y MLP.
      </p>

      <h2 className={h2}>Sus derechos</h2>
      <p>
        Puede pedir acceso a sus datos, su rectificación y, cuando corresponda, su eliminación o bloqueo, según la Ley
        N.º 19.628 sobre protección de la vida privada y, desde su entrada en vigencia, la Ley N.º 21.719. Hágalo a través de
        su supervisor o del administrador de la aplicación en Bbosch. Una inspección aprobada es un registro de mantenimiento
        y no se modifica; si contiene un error, avise a su supervisor.
      </p>
    </PaginaLegal>
  );
}
