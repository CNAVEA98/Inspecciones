import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Inspección Eléctrica Bbosch-MLP",
    short_name: "Inspecciones",
    description: "Inspecciones de terreno de infraestructura eléctrica",
    lang: "es-CL",
    // El icono abre directo el área del técnico (la usa el teléfono): el service worker la tiene guardada, así abre
    // aunque no haya red. Otros roles son redirigidos por el proxy a su área sin renderizar nada intermedio.
    start_url: "/tecnico",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f4f0",
    theme_color: "#14181d",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
