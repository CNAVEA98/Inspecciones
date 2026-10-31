import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SerwistProvider } from "@serwist/turbopack/react";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Inspección Eléctrica Bbosch-MLP",
  description: "Inspecciones de terreno de infraestructura eléctrica",
};

export const viewport: Viewport = { themeColor: "#14181d" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* El service worker solo se registra en producción; sin recarga automática al volver la red
            (podría interrumpir un formulario; los borradores igual se guardan en el equipo). */}
        <SerwistProvider
          swUrl="/serwist/sw.js"
          disable={process.env.NODE_ENV !== "production"}
          cacheOnNavigation={false}
          reloadOnOnline={false}
        >
          {children}
        </SerwistProvider>
      </body>
    </html>
  );
}
