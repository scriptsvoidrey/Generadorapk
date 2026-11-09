"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Volume2, VolumeX } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { ToastHost } from "@/components/Toast";
import { LoadingScreen } from "@/components/Spinner";
import { Toggle } from "@/components/Toggle";
import { useUserPreferences } from "@/lib/client/hooks";
import { playClick, unlockAudio } from "@/lib/client/sound";

const TITLES: Record<string, string> = {
  "/app": "Inicio",
  "/app/crear": "Crear APK",
  "/app/historial": "Historial de compilaciones",
  "/app/configuracion": "Configuración",
  "/app/cuenta": "Mi cuenta",
  "/app/ayuda": "Ayuda",
};

function titleFor(pathname: string | null): string {
  if (!pathname) return "NEXA";
  if (pathname.startsWith("/app/historial/")) return "Detalle de compilación";
  return TITLES[pathname] || "NEXA";
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { preferences, update } = useUserPreferences();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?callbackUrl=${encodeURIComponent(pathname || "/app")}`);
    }
  }, [status, router, pathname]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div style={{ minHeight: "100vh" }}>
        <LoadingScreen text="Cargando tu sesión…" />
      </div>
    );
  }

  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "Usuario";
  const initial = (userName[0] || "U").toUpperCase();

  const toggleSound = async (value: boolean) => {
    unlockAudio();
    if (value) playClick();
    try {
      await update({ sound: value });
    } catch {
      /* silencioso: el toggle ya aplicó optimistamente */
    }
  };

  return (
    <>
      <Sidebar />
      <BottomNav />
      <ToastHost />
      <main className="page">
        <header className="app-header">
          <h1 className="ah-title">{titleFor(pathname)}</h1>
          <div className="ah-right">
            <Toggle
              checked={preferences.sound}
              onChange={toggleSound}
              ariaLabel={preferences.sound ? "Silenciar sonidos" : "Activar sonidos"}
            />
            <span style={{ color: "var(--text-faint)", display: "flex" }} aria-hidden="true">
              {preferences.sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </span>
            <div className="user-chip" title={session?.user?.email || ""}>
              <span className="avatar">{initial}</span>
              <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {userName}
              </span>
            </div>
          </div>
        </header>
        {children}
      </main>
    </>
  );
}
