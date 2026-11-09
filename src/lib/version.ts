/**
 * Versión visible de la app (pie de página). Debe ser igual a `version` de `package.json` (lo revisa un test).
 *
 * Regla (decisión del usuario, 2026-11-03): se partió en 1.1.0 y **cada mejora que se une a `main` sube el último
 * número** (1.1.1, 1.1.2…). La versión se anota en la entrada de la bitácora de esa mejora.
 */
export const VERSION_APP = "1.1.7";

/** «V1.1.0». */
export const VERSION_ETIQUETA = `V${VERSION_APP}`;

/**
 * Versión del aviso de privacidad. Si cambia el texto de `/privacidad` en algo de fondo, se cambia esta fecha y a cada
 * usuario se le vuelve a mostrar el aviso al entrar.
 */
export const VERSION_AVISO_PRIVACIDAD = "2026-11-09";
