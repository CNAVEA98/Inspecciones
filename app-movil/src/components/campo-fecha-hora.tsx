import { memo, useEffect, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fechaIso } from "@/lib/fecha";
import { Boton } from "@/ui/componentes";
import { alto, color, radio } from "@/ui/tema";

const ALTO_CELDA = 48;
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const dos = (n: number) => String(n).padStart(2, "0");
const rango = (desde: number, hasta: number) => Array.from({ length: hasta - desde + 1 }, (_, i) => desde + i);

/** Hora actual de Chile como [hora, minuto]. */
function ahoraChile(): [number, number] {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone: "America/Santiago", hour: "2-digit", minute: "2-digit", hour12: false })
      .formatToParts(new Date())
      .map((x) => [x.type, x.value]),
  );
  return [Number(p.hour) % 24, Number(p.minute)];
}

interface ColumnaProps {
  titulo: string;
  opciones: { valor: number; texto: string }[];
  seleccionado: number;
  onElegir: (valor: number) => void;
}

/** Columna desplazable de opciones; abre centrada en la seleccionada. */
const Columna = memo(function Columna({ titulo, opciones, seleccionado, onElegir }: ColumnaProps) {
  const lista = useRef<ScrollViewInstance>(null);
  const indice = Math.max(0, opciones.findIndex((o) => o.valor === seleccionado));
  useEffect(() => {
    const t = setTimeout(() => lista.current?.scrollTo({ y: Math.max(0, indice * ALTO_CELDA - ALTO_CELDA * 2), animated: false }), 0);
    return () => clearTimeout(t);
    // Solo al abrir: después el usuario desplaza a mano.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <View style={estilos.columna}>
      <Text style={estilos.columnaTitulo}>{titulo}</Text>
      <ScrollView ref={lista} style={estilos.lista} showsVerticalScrollIndicator nestedScrollEnabled>
        {opciones.map((o) => {
          const activo = o.valor === seleccionado;
          return (
            <Pressable
              key={o.valor}
              accessibilityRole="button"
              accessibilityState={{ selected: activo }}
              onPress={() => onElegir(o.valor)}
              style={[estilos.celda, activo && { backgroundColor: color.graf }]}
            >
              <Text style={[estilos.celdaTexto, activo && { color: color.blanco, fontWeight: "700" }]}>{o.texto}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
});

interface Props {
  etiqueta: string;
  /** «time» guarda «HH:MM»; «date» guarda «AAAA-MM-DD» (igual que los campos de la web). */
  tipo: "time" | "date";
  value: string;
  onChange: (valor: string) => void;
  deshabilitado?: boolean;
}

function textoVisible(tipo: Props["tipo"], value: string): string {
  if (!value) return tipo === "time" ? "Elegir hora" : "Elegir fecha";
  if (tipo === "time") return value;
  const [a, m, d] = value.split("-").map(Number);
  return a && m && d ? `${dos(d)} de ${MESES[m - 1].toLowerCase()} de ${a}` : value;
}

/** Campo de hora o fecha: al tocarlo se abre un menú con columnas (horas y minutos, o día, mes y año). */
export function CampoFechaHora({ etiqueta, tipo, value, onChange, deshabilitado }: Props) {
  const insets = useSafeAreaInsets();
  const [abierto, setAbierto] = useState(false);
  const [a, setA] = useState(0); // hora, o día
  const [b, setB] = useState(0); // minuto, o mes
  const [c, setC] = useState(0); // año (solo fecha)

  const abrir = () => {
    if (tipo === "time") {
      const [h, m] = /^\d{1,2}:\d{2}$/.test(value) ? value.split(":").map(Number) : ahoraChile();
      setA(h);
      setB(m);
    } else {
      const [anio, mes, dia] = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value.split("-").map(Number) : fechaIso(new Date()).split("-").map(Number);
      setA(dia);
      setB(mes);
      setC(anio);
    }
    setAbierto(true);
  };

  const aceptar = () => {
    if (tipo === "time") onChange(`${dos(a)}:${dos(b)}`);
    else {
      const maxDia = new Date(c, b, 0).getDate();
      onChange(`${c}-${dos(b)}-${dos(Math.min(a, maxDia))}`);
    }
    setAbierto(false);
  };

  const anioActual = Number(fechaIso(new Date()).slice(0, 4));
  const diasDelMes = tipo === "date" ? new Date(c || anioActual, b || 1, 0).getDate() : 31;

  return (
    <View style={{ gap: 6 }}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${etiqueta}: ${textoVisible(tipo, value)}`}
        disabled={deshabilitado}
        onPress={abrir}
        style={[estilos.campo, deshabilitado && { opacity: 0.6 }]}
      >
        <Text style={[estilos.campoTexto, !value && { color: color.sub }]}>{textoVisible(tipo, value)}</Text>
        <Text style={estilos.flecha}>▾</Text>
      </Pressable>

      <Modal visible={abierto} transparent animationType="slide" onRequestClose={() => setAbierto(false)}>
        <Pressable style={estilos.fondo} onPress={() => setAbierto(false)} accessibilityLabel="Cerrar" />
        <View style={[estilos.hoja, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={estilos.titulo}>{etiqueta}</Text>
          <View style={estilos.columnas}>
            {tipo === "time" ? (
              <>
                <Columna titulo="Hora" opciones={rango(0, 23).map((n) => ({ valor: n, texto: dos(n) }))} seleccionado={a} onElegir={setA} />
                <Columna titulo="Minutos" opciones={rango(0, 59).map((n) => ({ valor: n, texto: dos(n) }))} seleccionado={b} onElegir={setB} />
              </>
            ) : (
              <>
                <Columna titulo="Día" opciones={rango(1, diasDelMes).map((n) => ({ valor: n, texto: dos(n) }))} seleccionado={Math.min(a, diasDelMes)} onElegir={setA} />
                <Columna titulo="Mes" opciones={MESES.map((m, i) => ({ valor: i + 1, texto: m }))} seleccionado={b} onElegir={setB} />
                <Columna titulo="Año" opciones={rango(anioActual - 3, anioActual + 3).map((n) => ({ valor: n, texto: String(n) }))} seleccionado={c} onElegir={setC} />
              </>
            )}
          </View>
          <View style={estilos.botones}>
            <Boton texto="Cancelar" variante="secundario" onPress={() => setAbierto(false)} style={estilos.boton} />
            {tipo === "time" ? (
              <Boton
                texto="Ahora"
                variante="secundario"
                onPress={() => {
                  const [h, m] = ahoraChile();
                  onChange(`${dos(h)}:${dos(m)}`);
                  setAbierto(false);
                }}
                style={estilos.boton}
              />
            ) : null}
            <Boton texto="Aceptar" onPress={aceptar} style={estilos.boton} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const estilos = StyleSheet.create({
  etiqueta: { color: color.graf, fontSize: 14, fontWeight: "600" },
  campo: {
    minHeight: alto.campo,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: radio.chico,
    borderWidth: 1.5,
    borderColor: color.borde,
    backgroundColor: color.blanco,
    paddingHorizontal: 16,
  },
  campoTexto: { color: color.graf, fontSize: 18 },
  flecha: { color: color.sub, fontSize: 18 },
  fondo: { flex: 1, backgroundColor: "rgba(20,24,29,0.45)" },
  hoja: { backgroundColor: color.papel, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 16 },
  titulo: { color: color.graf, fontSize: 20, fontWeight: "700" },
  columnas: { flexDirection: "row", gap: 12 },
  columna: { flex: 1, gap: 6 },
  columnaTitulo: { color: color.sub, fontSize: 13, fontWeight: "600", textAlign: "center" },
  lista: { height: ALTO_CELDA * 5, borderRadius: radio.chico, borderWidth: 1.5, borderColor: color.borde, backgroundColor: color.blanco },
  celda: { height: ALTO_CELDA, alignItems: "center", justifyContent: "center", borderRadius: 8 },
  celdaTexto: { color: color.graf, fontSize: 18, fontVariant: ["tabular-nums"] },
  botones: { flexDirection: "row", gap: 12 },
  boton: { flex: 1, paddingHorizontal: 8 },
});
