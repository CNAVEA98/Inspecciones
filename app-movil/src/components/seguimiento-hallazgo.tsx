import { useState } from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";
import {
  ALCANCE_NOMBRE,
  GESTION_NOMBRE,
  SEGUIMIENTO_INICIAL,
  estadoGestion,
  fichaSap,
  type Alcance,
  type EstadoGestion,
  type HallazgoFalla,
} from "@/lib/revision/fallas";
import { guardarSeguimiento } from "@/lib/revision/servidor";
import { useRevision } from "@/lib/revision-contexto";
import { Aviso, Boton, Campo, Insignia } from "@/ui/componentes";
import { color, type Tono } from "@/ui/tema";

const TONO_GESTION: Record<EstadoGestion, Tono> = { pendiente: "cobre", con_aviso: "ok", canalizado: "neutro" };

/**
 * Estado del seguimiento de un hallazgo y, para la Supervisión (supervisor y administrador), el formulario para registrarlo
 * (igual que la web). La ficha para SAP se comparte como texto (WhatsApp, correo, notas) para pegarla al crear el aviso.
 */
export function SeguimientoHallazgo({
  h,
  puedeGestionar,
  enLinea,
  onGuardado,
}: {
  h: HallazgoFalla;
  puedeGestionar: boolean;
  enLinea: boolean;
  onGuardado: () => void;
}) {
  const { supabase } = useRevision();
  const inicial = h.seguimiento ?? SEGUIMIENTO_INICIAL;
  const [abierto, setAbierto] = useState(false);
  const [scope, setScope] = useState<Alcance>(inicial.scope);
  const [aviso, setAviso] = useState(inicial.sapNotice ?? "");
  const [nota, setNota] = useState(inicial.channelNote ?? "");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const estado = estadoGestion(h.seguimiento);

  const guardar = async () => {
    if (guardando) return;
    setGuardando(true);
    setMensaje(null);
    try {
      await guardarSeguimiento(supabase, { findingId: h.id, scope, sapNotice: aviso, channelNote: nota });
      setMensaje({ ok: true, texto: "Guardado." });
      onGuardado();
    } catch (e) {
      setMensaje({ ok: false, texto: e instanceof Error ? e.message : "No se pudo guardar." });
    } finally {
      setGuardando(false);
    }
  };

  const compartirFicha = async () => {
    try {
      await Share.share({ message: fichaSap(h), title: `Aviso subsecuente ${h.tag}` });
    } catch {
      setMensaje({ ok: false, texto: "No se pudo compartir la ficha." });
    }
  };

  return (
    <View style={estilos.caja}>
      <View style={estilos.fila}>
        <Insignia texto={GESTION_NOMBRE[estado]} tono={TONO_GESTION[estado]} />
        {h.seguimiento?.scope === "bbosch" && h.seguimiento.sapNotice ? (
          <Text style={estilos.mono}>Aviso N.º {h.seguimiento.sapNotice}</Text>
        ) : null}
      </View>
      {h.seguimiento?.scope === "terceros" ? (
        <Text style={estilos.sub}>Requiere apoyo de terceros{h.seguimiento.channelNote ? `: ${h.seguimiento.channelNote}` : ""}</Text>
      ) : null}

      <Boton texto="Compartir ficha para SAP" variante="secundario" onPress={() => void compartirFicha()} />

      {puedeGestionar ? (
        <>
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: abierto }} onPress={() => setAbierto((x) => !x)} style={estilos.enlace}>
            <Text style={estilos.enlaceTexto}>{abierto ? "Ocultar gestión" : "Gestionar este hallazgo"}</Text>
          </Pressable>
          {abierto ? (
            <View style={estilos.form}>
              <Text style={estilos.etiqueta}>Alcance</Text>
              {(Object.keys(ALCANCE_NOMBRE) as Alcance[]).map((a) => (
                <Pressable
                  key={a}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: scope === a }}
                  onPress={() => setScope(a)}
                  style={estilos.radio}
                >
                  <View style={[estilos.punto, scope === a && estilos.puntoActivo]} />
                  <Text style={estilos.radioTexto}>{ALCANCE_NOMBRE[a]}</Text>
                </Pressable>
              ))}
              {scope === "bbosch" ? (
                <Campo
                  etiqueta="N.º de aviso subsecuente (SAP)"
                  value={aviso}
                  onChangeText={setAviso}
                  maxLength={20}
                  keyboardType="number-pad"
                  placeholder="Se anota cuando el aviso ya está creado"
                />
              ) : (
                <Campo
                  etiqueta="Canalización con MLP (a quién, cuándo y por qué medio)"
                  value={nota}
                  onChangeText={setNota}
                  maxLength={300}
                  multilinea
                  placeholder="Ej.: informado a … por radio, 31-10 10:30"
                />
              )}
              {!enLinea ? <Aviso tono="cobre" texto="Guardar el seguimiento necesita señal." /> : null}
              <Boton
                texto={guardando ? "Guardando…" : "Guardar seguimiento"}
                onPress={() => void guardar()}
                deshabilitado={guardando || !enLinea}
              />
            </View>
          ) : null}
        </>
      ) : null}
      {mensaje ? <Text style={[estilos.sub, { color: mensaje.ok ? color.okTexto : color.malo }]}>{mensaje.texto}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: { gap: 8, marginTop: 4 },
  fila: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  mono: { fontFamily: "monospace", fontSize: 14, color: color.graf },
  sub: { fontSize: 14, color: color.sub },
  enlace: { minHeight: 44, justifyContent: "center" },
  enlaceTexto: { color: color.cu, fontSize: 15, fontWeight: "700" },
  form: { gap: 10, borderTopWidth: 1, borderTopColor: color.linea, paddingTop: 10 },
  etiqueta: { fontSize: 14, fontWeight: "700", color: color.sub },
  radio: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 10 },
  punto: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: color.borde },
  puntoActivo: { borderColor: color.cu, backgroundColor: color.cu },
  radioTexto: { flex: 1, fontSize: 15, color: color.graf },
});
