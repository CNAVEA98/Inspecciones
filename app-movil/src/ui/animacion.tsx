import { useEffect, useRef, type ReactNode } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { color } from "./tema";

/**
 * Animaciones de la app. Solo se animan `transform` y `opacity` con el driver nativo (no tocan el diseño de la pantalla).
 * Si el teléfono tiene activado «Reducir movimiento», todo aparece de inmediato.
 */
let reducido = false;
void AccessibilityInfo.isReduceMotionEnabled().then((v) => {
  reducido = v;
});
AccessibilityInfo.addEventListener("reduceMotionChanged", (v) => {
  reducido = v;
});
export const movimientoReducido = () => reducido;

const SALIDA_SUAVE = Easing.out(Easing.cubic);

/** Aparece con fundido y un pequeño desplazamiento (y, si se pide, un leve agrandado) al montarse. */
export function Aparecer({
  children,
  retraso = 0,
  desde = 14,
  escalaDesde = 1,
  duracion = 380,
  style,
}: {
  children: ReactNode;
  retraso?: number;
  /** Desplazamiento vertical inicial en px (negativo = viene desde arriba). */
  desde?: number;
  escalaDesde?: number;
  duracion?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const valor = useRef(new Animated.Value(reducido ? 1 : 0)).current;
  useEffect(() => {
    if (reducido) return;
    Animated.timing(valor, { toValue: 1, duration: duracion, delay: retraso, easing: SALIDA_SUAVE, useNativeDriver: true }).start();
  }, [valor, retraso, duracion]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: valor,
          transform: [
            { translateY: valor.interpolate({ inputRange: [0, 1], outputRange: [desde, 0] }) },
            { scale: valor.interpolate({ inputRange: [0, 1], outputRange: [escalaDesde, 1] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const PresionableAnimado = Animated.createAnimatedComponent(Pressable);

/** Pressable que se hunde un poco al tocarlo y rebota al soltar (respuesta táctil). */
export function Presionable({
  escala = 0.97,
  style,
  onPressIn,
  onPressOut,
  ...props
}: Omit<PressableProps, "style"> & { escala?: number; style?: StyleProp<ViewStyle> }) {
  const valor = useRef(new Animated.Value(1)).current;
  const ir = (a: number) => {
    if (reducido) return;
    Animated.spring(valor, { toValue: a, speed: 50, bounciness: 7, useNativeDriver: true }).start();
  };
  return (
    <PresionableAnimado
      {...props}
      onPressIn={(e) => {
        ir(escala);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        ir(1);
        onPressOut?.(e);
      }}
      style={[style, { transform: [{ scale: valor }] }]}
    />
  );
}

/** Barra de progreso que crece suavemente (usa `scaleX`, no el ancho). */
export function BarraProgreso({ progreso, alto = 8 }: { progreso: number; alto?: number }) {
  const valor = useRef(new Animated.Value(progreso)).current;
  useEffect(() => {
    if (reducido) {
      valor.setValue(progreso);
      return;
    }
    Animated.timing(valor, { toValue: progreso, duration: 320, easing: SALIDA_SUAVE, useNativeDriver: true }).start();
  }, [valor, progreso]);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(progreso * 100) }}
      style={{ height: alto, borderRadius: 999, backgroundColor: "#e4e0d7", overflow: "hidden" }}
    >
      <Animated.View
        style={{
          height: "100%",
          width: "100%",
          borderRadius: 999,
          backgroundColor: color.cu,
          transformOrigin: "left center",
          transform: [{ scaleX: valor }],
        }}
      />
    </View>
  );
}

/** Marcador de posición que parpadea suavemente mientras carga el contenido. */
export function Esqueleto({ alto = 72, style }: { alto?: number; style?: StyleProp<ViewStyle> }) {
  const valor = useRef(new Animated.Value(0.55)).current;
  useEffect(() => {
    if (reducido) return;
    const bucle = Animated.loop(
      Animated.sequence([
        Animated.timing(valor, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(valor, { toValue: 0.55, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    bucle.start();
    return () => bucle.stop();
  }, [valor]);
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ height: alto, borderRadius: 16, backgroundColor: "#e9e5dc", opacity: valor }, style]}
    />
  );
}

/** Círculo verde con una marca que «salta» al aparecer (confirmación de envío). */
export function MarcaExito({ tamano = 88 }: { tamano?: number }) {
  const valor = useRef(new Animated.Value(reducido ? 1 : 0)).current;
  useEffect(() => {
    if (reducido) return;
    Animated.spring(valor, { toValue: 1, speed: 9, bounciness: 14, useNativeDriver: true }).start();
  }, [valor]);
  return (
    <Animated.View
      accessibilityElementsHidden
      style={{
        width: tamano,
        height: tamano,
        borderRadius: tamano / 2,
        backgroundColor: color.ok,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        opacity: valor,
        transform: [{ scale: valor.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }],
      }}
    >
      <Text style={{ color: color.blanco, fontSize: tamano * 0.5, fontWeight: "700", lineHeight: tamano * 0.6 }}>✓</Text>
    </Animated.View>
  );
}
