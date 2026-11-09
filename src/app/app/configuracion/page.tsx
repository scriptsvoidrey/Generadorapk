"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Moon, Sun, Bell, Volume2, Globe, LogOut, Check, AlertTriangle, Save } from "lucide-react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Toggle } from "@/components/Toggle";
import { SectionHeader } from "@/components/SectionHeader";
import { Badge } from "@/components/Badge";
import { useUserPreferences, useToast } from "@/lib/client/hooks";
import { playClick, unlockAudio } from "@/lib/client/sound";

const ACCENTS = [
  "#8b5cf6", "#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#a855f7",
];

export default function ConfiguracionPage() {
  const { preferences, user, update, updateName } = useUserPreferences();
  const toast = useToast();
  const [name, setName] = useState(user?.name || "");
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // Sync name when user loads
  if (user?.name && name === "" && user.name) {
    // controlled by state; set on first load via effect would be better but OK
  }

  const handleTheme = async (theme: "dark" | "light") => {
    unlockAudio();
    playClick();
    try {
      await update({ theme });
      toast.success(theme === "dark" ? "Tema oscuro activado" : "Tema claro activado");
    } catch {
      toast.error("No se pudo guardar el tema");
    }
  };

  const handleAccent = async (accent: string) => {
    unlockAudio();
    playClick();
    try {
      await update({ accent });
    } catch {
      toast.error("No se pudo guardar el color");
    }
  };

  const handleToggle = async (key: "notifications" | "sound", value: boolean) => {
    unlockAudio();
    if (key === "sound" && value) playClick();
    try {
      await update({ [key]: value });
    } catch {
      toast.error("No se pudo guardar");
    }
  };

  const handleSaveName = async () => {
    setNameError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("El nombre no puede estar vacío");
      return;
    }
    setSavingName(true);
    try {
      await updateName(trimmed);
      toast.success("Nombre actualizado");
    } catch (e) {
      setNameError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSavingName(false);
    }
  };

  const handleLogout = async () => {
    playClick();
    setLoggingOut(true);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="anim-in">
        <SectionHeader title="Apariencia" subtitle="Tema y color de acento" />
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <Button
            variant={preferences.theme === "dark" ? "primary" : "secondary"}
            icon={<Moon size={15} />}
            onClick={() => void handleTheme("dark")}
          >
            Oscuro
          </Button>
          <Button
            variant={preferences.theme === "light" ? "primary" : "secondary"}
            icon={<Sun size={15} />}
            onClick={() => void handleTheme("light")}
          >
            Claro
          </Button>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {ACCENTS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Color ${c}`}
              onClick={() => void handleAccent(c)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: c,
                border: preferences.accent === c ? "3px solid #fff" : "2px solid transparent",
                boxShadow: preferences.accent === c ? `0 0 0 2px ${c}` : "none",
                cursor: "pointer",
              }}
            >
              {preferences.accent === c && <Check size={14} color="#fff" style={{ margin: "auto" }} />}
            </button>
          ))}
        </div>
      </Card>

      <Card className="anim-in delay-1">
        <SectionHeader title="Preferencias" />
        <div className="flex justify-between" style={{ padding: "12px 0", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Bell size={16} /> Notificaciones
          </span>
          <Toggle checked={preferences.notifications} onChange={(v) => void handleToggle("notifications", v)} ariaLabel="Notificaciones" />
        </div>
        <div className="flex justify-between" style={{ padding: "12px 0", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Volume2 size={16} /> Sonidos
          </span>
          <Toggle checked={preferences.sound} onChange={(v) => void handleToggle("sound", v)} ariaLabel="Sonidos" />
        </div>
        <div className="flex justify-between" style={{ padding: "12px 0", alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Globe size={16} /> Idioma
          </span>
          <Badge tone="neutral">Español</Badge>
        </div>
      </Card>

      <Card className="anim-in delay-2">
        <SectionHeader title="Perfil" subtitle="Nombre visible" />
        <Input
          label="Nombre"
          value={name || user?.name || ""}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
        />
        {nameError && (
          <div className="alert alert-error mb-2" role="alert">
            <AlertTriangle size={16} />
            <span>{nameError}</span>
          </div>
        )}
        <Button variant="primary" onClick={() => void handleSaveName()} loading={savingName} icon={<Save size={15} />}>
          Guardar nombre
        </Button>
      </Card>

      <Card className="anim-in delay-3">
        <SectionHeader title="Sesión" />
        {nameError && (
          <div className="alert alert-error mb-2" role="alert">
            <AlertTriangle size={16} />
            <span>{nameError}</span>
          </div>
        )}
        <Button variant="danger" onClick={() => void handleLogout()} loading={loggingOut} icon={<LogOut size={16} />}>
          Cerrar sesión
        </Button>
      </Card>
    </div>
  );
}
