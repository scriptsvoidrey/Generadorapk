import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { Providers } from "./providers";
import { SWRegister } from "@/components/SWRegister";
import "@/styles/globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NEXA APK STUDIO — Convierte tus ideas en aplicaciones Android",
    template: "%s · NEXA APK STUDIO",
  },
  description:
    "Crea aplicaciones Android APK desde una URL, código HTML o un archivo ZIP. Compilación en la nube con GitHub Actions.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NEXA",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#8b5cf6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// Script inline sin flash: aplica tema/acento desde localStorage antes del paint.
const noFlashScript = `(function(){try{var p=JSON.parse(localStorage.getItem('nexa-prefs')||'{}');var t=p.theme||'dark';document.documentElement.setAttribute('data-theme',t);if(p.accent){document.documentElement.style.setProperty('--accent',p.accent);}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <Providers>
          {children}
          <SWRegister />
        </Providers>
      </body>
    </html>
  );
}
