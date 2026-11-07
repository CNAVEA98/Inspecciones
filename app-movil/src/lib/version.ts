import Constants from "expo-constants";

/** Versión de la app móvil: la de `app.json` (única fuente). Se muestra al pie de página para reportar problemas. */
export const VERSION_APP = Constants.expoConfig?.version ?? "?";

/** «V1.0.0». */
export const VERSION_ETIQUETA = `V${VERSION_APP}`;
