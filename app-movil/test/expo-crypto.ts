// Sustituto de `expo-crypto` en las pruebas (Node no tiene el módulo nativo).
export { randomUUID } from "node:crypto";
