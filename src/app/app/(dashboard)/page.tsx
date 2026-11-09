"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  PackagePlus,
  Layers,
  CheckCircle2,
  Clock,
  History,
  Settings,
  Hammer,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/Button";
import { StatCard } from "@/components/StatCard";
import { BuildCard } from "@/components/BuildCard";
import { SectionHeader } from "@/components/SectionHeader";
import { EmptyState } from "@/components/EmptyState";
import { LoadingScreen } from "@/components/Spinner";
import { Card } from "@/components/Card";
import { api } from "@/lib/client/api";
import type { DashboardStatsDTO } from "@/lib/types";

const QUICK = [
  { href: "/app/crear", label: "Crear APK", Icon: Hammer },
  { href: "/app/historial", label: "Historial", Icon: History },
  { href: "/app/configuracion", label: "Ajustes", Icon: Settings },
];

const ACTIVE_STATUSES = new Set(["QUEUED", "PREPARING", "BUILDING"]);

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStatsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async (silent = false) => {
    try {
      const s = await api.get<DashboardStatsDTO>("/api/builds/stats");
      setStats(s);
      setError(null);
    } catch (e) {
      if (!silent) setError(e instanceof Error ? e.message : "Error al cargar estadísticas");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [load]);

  // Polling ligero cada 15s si hay builds pendientes
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (stats && stats.pending > 0) {
      timerRef.current = setInterval(() => void load(true), 15000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stats?.pending, load]);

  if (loading) return <LoadingScreen text="Cargando tu panel…" />;

  const firstName = (session?.user?.name || "Creador").split(" ")[0];

  return (
    <div>
      {error && (
        <div className="alert alert-error mb-2" role="alert">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Hero de bienvenida */}
      <Card
        className="anim-in"
        style={{
          background:
            "linear-gradient(135deg, rgba(139,92,246,0.18), rgba(59,130,246,0.10), rgba(6,182,212,0.08))",
          borderColor: "rgba(139,92,246,0.3)",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", marginBottom: 6 }}>
              Hola, <span className="gradient-text">{firstName}</span>
            </h2>
            <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
              {stats && stats.total > 0
                ? `Has creado ${stats.total} ${stats.total === 1 ? "aplicación" : "aplicaciones"}. ¿Qué compilas hoy?`
                : "Aún no has creado ninguna APK. Empieza en menos de un minuto."}
            </p>
          </div>
          <Button variant="primary" size="lg" href="/app/crear" icon={<PackagePlus size={18} />}>
            Crear APK
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid-3 anim-in delay-1">
        <StatCard icon={<Layers size={20} />} label="Compilaciones totales" value={stats?.total ?? 0} />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="Completadas"
          value={stats?.completed ?? 0}
          accent="#10b981"
        />
        <StatCard
          icon={<Clock size={20} />}
          label="Pendientes"
          value={stats?.pending ?? 0}
          accent="#f59e0b"
        />
      </div>

      {/* Accesos rápidos */}
      <SectionHeader title="Accesos rápidos" subtitle="Las acciones más usadas" />
      <div className="quick-grid anim-in delay-2">
        {QUICK.map(({ href, label, Icon }) => (
          <Link key={href} href={href} className="quick-item">
            <span className="qi-icon">
              <Icon size={20} />
            </span>
            {label}
          </Link>
        ))}
      </div>

      {/* Actividad reciente */}
      <SectionHeader
        title="Actividad reciente"
        subtitle={stats?.pending ? `${stats.pending} en curso · se actualiza cada 15 s` : "Tus últimas compilaciones"}
        action={
          <Link href="/app/historial" style={{ fontSize: "0.82rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
            Ver todo <ArrowRight size={14} />
          </Link>
        }
      />
      {!stats || stats.recent.length === 0 ? (
        <Card className="anim-in delay-3">
          <EmptyState
            icon={<PackagePlus size={26} />}
            title="Sin compilaciones todavía"
            description="Crea tu primera APK desde una URL, código HTML o un archivo ZIP."
            actionLabel="Crear mi primera APK"
            actionHref="/app/crear"
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-3 anim-in delay-3">
          {stats.recent.slice(0, 5).map((b) => (
            <BuildCard key={b.id} build={b} />
          ))}
        </div>
      )}
    </div>
  );
}
