import { randomUUID } from "expo-crypto";

/** UUID v4. Hermes no trae `crypto.randomUUID`; los id van al servidor (RPC y Storage), así que deben ser UUID reales. */
export const nuevoId = (): string => randomUUID();
