import Link from "next/link";
import { formatFechaHora } from "@/lib/fecha";
import { STATUS_LABEL } from "@/lib/revision/estado";
import { ETIQUETA_ESTADO, extrasDe, seleccionDeCabecera } from "@/lib/formatos/tags";
import type { Adjunto, DetalleInspeccion } from "@/lib/revision/queries";
import type { TemplateItem, VerificationValue } from "@/lib/templates/schema";

const ESTADO_NOMBRE: Record<string, string> = {
  BN: "Buen estado",
  ML: "Mal estado",
  NT: "No terminado",
  NA: "No aplica",
  NR: "No se pudo realizar",
};

const SEVERIDAD_NOMBRE = { baja: "Baja", media: "Media", alta: "Alta", critica: "Crítica" } as const;

function Fotos({ ids, adjuntos }: { ids: string[]; adjuntos: Map<string, Adjunto> }) {
  const visibles = ids.map((id) => adjuntos.get(id)).filter((a): a is Adjunto => !!a);
  if (visibles.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {visibles.map((a) =>
        a.url ? (
          <a key={a.id} href={a.url} target="_blank" rel="noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element -- URL firmada temporal de Storage */}
            <img src={a.url} alt="Foto de la inspección" className="h-24 w-24 rounded-lg border border-hair object-cover" />
          </a>
        ) : (
          <span key={a.id} className="grid h-24 w-24 place-items-center rounded-lg border border-hair text-xs text-sub">
            Sin acceso
          </span>
        ),
      )}
    </div>
  );
}

function Respuesta({ item, valor, adjuntos }: { item: TemplateItem; valor: unknown; adjuntos: Map<string, Adjunto> }) {
  if (valor === undefined) return <span className="text-sub">Sin respuesta</span>;

  if (item.type === "verificacion") {
    const v = valor as Partial<VerificationValue>;
    return (
      <div>
        <span className={`font-semibold ${v.estado === "ML" ? "text-bad" : ""}`}>
          {v.estado ? `${v.estado} · ${ESTADO_NOMBRE[v.estado]}` : "Sin estado"}
        </span>
        {v.valor !== undefined && (
          <span className="ml-3 font-mono">
            {v.valor} {item.unit}
          </span>
        )}
        {v.obs && <p className="mt-1 text-sub">{v.obs}</p>}
        <Fotos ids={v.fotos ?? []} adjuntos={adjuntos} />
      </div>
    );
  }
  if (item.type === "photo") return <Fotos ids={(valor as string[]) ?? []} adjuntos={adjuntos} />;
  if (item.type === "nameplate") {
    const campos = valor as Record<string, string | number>;
    return (
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 font-mono text-xs">
        {item.fields.map((f) => (
          <div key={f.key} className="contents">
            <dt className="text-sub">{f.label}</dt>
            <dd>
              {campos[f.key] ?? "—"} {f.unit}
            </dd>
          </div>
        ))}
      </dl>
    );
  }
  if (item.type === "number") {
    return (
      <span className="font-mono">
        {String(valor)} {item.unit}
      </span>
    );
  }
  return <span className="whitespace-pre-wrap">{String(valor)}</span>;
}

/** Vista de solo lectura de una inspección enviada, con fotos, hallazgos y firmas. */
export function Detalle({
  d,
  volver,
  revision,
}: {
  d: DetalleInspeccion;
  volver: string;
  /** Panel de firma; solo lo recibe el rol al que le toca firmar esta inspección. */
  revision?: React.ReactNode;
}) {
  const adjuntos = new Map(d.adjuntos.map((a) => [a.id, a]));
  const header = (d.respuestas._header ?? {}) as Record<string, string>;
  const seleccion = seleccionDeCabecera(header);
  const avisoTag = seleccion ? ETIQUETA_ESTADO[seleccion.estado] : null;
  const extras = extrasDe(header);
  // La clave `_participantes` es heredada: hoy guarda la firma del encargado de la actividad.
  const encargado = d.respuestas._participantes as { nombres?: string; firmaId?: string } | undefined;
  const diagnostico = d.respuestas._diagnostico as { observaciones?: string; consideraciones?: string } | undefined;
  const firmaEncargado = encargado?.firmaId ? adjuntos.get(encargado.firmaId) : undefined;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={volver} className="text-sm font-semibold text-cu hover:underline">
          ← Volver a la bandeja
        </Link>
        {revision ? (
          <a href="#revision" className="rounded-lg border border-cu px-4 py-2 text-sm font-semibold text-cu hover:bg-cu-soft focus-visible:outline-2 focus-visible:outline-cu">
            Ir a firmar ↓
          </a>
        ) : null}
        {/* Enlace normal (no Link): es una descarga, no una página, y no debe precargarse. */}
        <a
          href={`${volver}/${d.id}/pdf`}
          download
          className="rounded-lg bg-graf px-4 py-2 text-sm font-semibold text-white hover:bg-graf-2 focus-visible:outline-2 focus-visible:outline-cu"
        >
          Descargar PDF
        </a>
      </div>

      <section className="rounded-2xl border border-hair bg-white p-5">
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-sub">{STATUS_LABEL[d.status]}</p>
        <h1 className="mt-1 text-xl font-bold tracking-tight">
          {d.folio ?? "Sin folio"} · {d.equipo} · {d.modo}
        </h1>
        <dl className="mt-3 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div><dt className="inline text-sub">Área: </dt><dd className="inline">{d.area}</dd></div>
          <div><dt className="inline text-sub">TAG: </dt><dd className="inline font-mono">{d.equipmentTag || "—"}</dd></div>
          {avisoTag ? (
            <div className="sm:col-span-2 lg:col-span-3" role="note">
              <dd className="inline rounded-md bg-cu-soft px-2 py-0.5 font-semibold text-[#7a3d12]">{avisoTag}</dd>
              {seleccion?.tagOriginal ? <span className="text-sub"> · TAG original: <span className="font-mono">{seleccion.tagOriginal}</span></span> : null}
            </div>
          ) : null}
          {extras.length > 0 ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="inline text-sub">Otros equipos: </dt>
              <dd className="inline font-mono">
                {extras.map((x) => `${x.tag}${ETIQUETA_ESTADO[x.estado] ? ` (${ETIQUETA_ESTADO[x.estado]})` : ""}`).join(" · ")}
              </dd>
            </div>
          ) : null}
          <div><dt className="inline text-sub">Técnico (realizó): </dt><dd className="inline font-semibold">{d.realizadoPor}</dd></div>
          <div>
            <dt className="inline text-sub">Cuenta de envío: </dt>
            <dd className="inline">
              {d.tecnico}
              {d.turno ? ` · Turno ${d.turno}` : ""}
            </dd>
          </div>
          <div><dt className="inline text-sub">Inicio: </dt><dd className="inline font-mono">{formatFechaHora(d.startedAt)}</dd></div>
          <div>
            <dt className="inline text-sub">Envío: </dt>
            <dd className="inline font-mono">{d.submittedAt ? formatFechaHora(d.submittedAt) : "—"}</dd>
          </div>
          <div><dt className="inline text-sub">Plantilla: </dt><dd className="inline">versión {d.templateVersion}</dd></div>
          {(d.plantilla?.header ?? [])
            .filter((h) => h.key !== "tag" && header[h.key])
            .map((h) => (
              <div key={h.key}>
                <dt className="inline text-sub">{h.label}: </dt>
                <dd className="inline">{header[h.key]}</dd>
              </div>
            ))}
        </dl>
      </section>

      {!d.plantilla && (
        <p className="rounded-2xl border border-bad bg-white p-5 text-bad">
          No se pudo leer la plantilla de esta inspección; se muestran solo los datos generales.
        </p>
      )}

      {d.plantilla?.sections.map((s) => (
        <section key={s.id} className="rounded-2xl border border-hair bg-white">
          <h2 className="border-b border-hair px-5 py-3 font-bold">{s.title}</h2>
          <ul>
            {s.items.map((item) => (
              <li key={item.id} className="grid gap-1 border-t border-hair px-5 py-3 first:border-t-0 md:grid-cols-[1fr_2fr]">
                <span className="text-sm text-sub">{item.label}</span>
                <Respuesta item={item} valor={d.respuestas[item.id]} adjuntos={adjuntos} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="rounded-2xl border border-hair bg-white p-5">
        <h2 className="font-bold">Hallazgos ({d.hallazgos.length})</h2>
        {d.hallazgos.length === 0 ? (
          <p className="mt-1 text-sub">Sin hallazgos registrados.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {d.hallazgos.map((h) => {
              const item = d.plantilla?.sections.flatMap((s) => s.items).find((i) => i.id === h.itemKey);
              return (
                <li key={h.id} className="rounded-lg bg-cu-soft px-3 py-2 text-sm">
                  <span className="font-semibold">{SEVERIDAD_NOMBRE[h.severity]}</span> · {item?.label ?? h.itemKey}
                  {h.description && <p className="text-sub">{h.description}</p>}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {(diagnostico?.observaciones || diagnostico?.consideraciones) && (
        <section className="rounded-2xl border border-hair bg-white p-5 text-sm">
          <h2 className="font-bold">Diagnóstico</h2>
          {diagnostico.observaciones && <p className="mt-2 whitespace-pre-wrap">{diagnostico.observaciones}</p>}
          {diagnostico.consideraciones && (
            <p className="mt-2 whitespace-pre-wrap text-sub">{diagnostico.consideraciones}</p>
          )}
        </section>
      )}

      <section className="rounded-2xl border border-hair bg-white p-5 text-sm">
        <h2 className="font-bold">Encargado de la actividad</h2>
        <p className="mt-1">{encargado?.nombres?.trim() || d.realizadoPor || "—"}</p>
        {firmaEncargado?.url && (
          // eslint-disable-next-line @next/next/no-img-element -- URL firmada temporal de Storage
          <img src={firmaEncargado.url} alt="Firma del encargado de la actividad" className="mt-2 h-20 rounded-lg border border-hair bg-white" />
        )}
      </section>

      <section className="rounded-2xl border border-hair bg-white p-5 text-sm">
        <h2 className="font-bold">Firmas de revisión</h2>
        {d.firmas.length === 0 ? (
          <p className="mt-1 text-sub">Aún sin firmas.</p>
        ) : (
          <ul className="mt-2 space-y-3">
            {d.firmas.map((f) => (
              <li key={f.stage}>
                <span className="font-semibold">
                  {f.stage === "supervisor" ? "Supervisor" : "Programador"} · {f.decision === "approved" ? "aprobó" : "rechazó"}
                </span>{" "}
                <span className="text-sub">
                  {f.firmante} · {formatFechaHora(f.signedAt)}
                </span>
                {f.comment && <p>{f.comment}</p>}
                {f.url && (
                  // eslint-disable-next-line @next/next/no-img-element -- URL firmada temporal de Storage
                  <img src={f.url} alt={`Firma del ${f.stage}`} className="mt-1 h-16 rounded-lg border border-hair" />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {revision}
    </div>
  );
}
