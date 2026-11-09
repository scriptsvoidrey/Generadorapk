"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Mail,
  KeyRound,
  Layers,
  CalendarClock,
  LogOut,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { LoadingScreen } from "@/components/Spinner";
import { SectionHeader } from "@/components/SectionHeader";
import { api } from "@/lib/client/api";
import { useToast } from "@/lib/client/hooks";
import { playClick } from "@/lib/client/sound";
import type { DashboardStatsDTO } from "@/lib/types";

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3" style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
      <dt className="muted small" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {icon}
        {label}
      </dt>
      <dd style={{ margin: 0, fontWeight: 600, fontSize: "0.9rem", textAlign: "right", wordBreak: "break-all" }}>
        {value}
      </dd>
    </div>
  );
}

export default function CuentaPage() {
  const { data: session } = useSession();
  const toast = useToast();
  const [stats, setStats] = useState<DashboardStatsDTO | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    api
      .get<DashboardStatsDTO>("/api/builds/stats")
      .then(setStats)
      .catch(() => undefined);
  }, []);

  if (!session) return <LoadingScreen text="Cargando cuenta…" />;

  const email = session.user?.email || "—";
  const name = session.user?.name || email.split("@")[0];
  const isGoogle = !!session.user?.image;
  const providerLabel = isGoogle ? "Google" : "Email y contraseña";

  const handleLogout = async () => {
    playClick();
    setLoggingOut(true);
    await signOut({ callbackUrl: "/" });
  };

  const handlePassword = () => {
    toast.info("Cambio de contraseña próximamente. Por ahora, usa la recuperación de tu proveedor.");
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="anim-in">
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: "var(--gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1.6rem",
              flexShrink: 0,
            }}
          >
            {(name[0] || "U").toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: "1.3rem" }}>{name}</h2>
            <div className="muted small mono" style={{ wordBreak: "break-all" }}>{email}</div>
            <div style={{ marginTop: 6 }}>
              <Badge tone={isGoogle ? "info" : "neutral"}>{providerLabel}</Badge>
            </div>
          </div>
        </div>

        <SectionHeader title="Datos de la cuenta" />
        <dl style={{ margin: 0 }}>
          <Row icon={<Mail size={14} />} label="Email" value={email} />
          <Row icon={<ShieldCheck size={14} />} label="Proveedor de acceso" value={providerLabel} />
          <Row
            icon={<Layers size={14} />}
            label="Compilaciones totales"
            value={stats ? `${stats.total} (${stats.completed} completadas)` : "—"}
          />
          <Row
            icon={<CalendarClock size={14} />}
            label="Miembro desde"
            value={<span className="faint">No disponible</span>}
          />
        </dl>
      </Card>

      <Card className="anim-in delay-1">
        <SectionHeader title="Seguridad" subtitle="Contraseña y acceso" />
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={<KeyRound size={15} />}
            onClick={handlePassword}
            disabled={isGoogle}
            title={isGoogle ? "Usa la recuperación de contraseña de Google" : "Próximamente"}
          >
            Cambiar contraseña
          </Button>
          {isGoogle ? (
            <span className="faint small">Tu cuenta usa Google. Gestiona tu acceso desde Google.</span>
          ) : (
            <span className="faint small" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <AlertCircle size={13} />
              Función próximamente. Por ahora contacta al administrador.
            </span>
          )}
        </div>
      </Card>

      <Card className="anim-in delay-2">
        <SectionHeader title="Sesión" />
        <Button variant="danger" onClick={() => void handleLogout()} loading={loggingOut} icon={<LogOut size={16} />}>
          Cerrar sesión
        </Button>
      </Card>
    </div>
  );
}
