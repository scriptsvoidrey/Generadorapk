"use client";

import { useCallback, useEffect, useState } from "react";
import { History, PackagePlus, AlertTriangle, RefreshCw } from "lucide-react";
import { BuildCard } from "@/components/BuildCard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingScreen } from "@/components/Spinner";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { SectionHeader } from "@/components/SectionHeader";
import { api } from "@/lib/client/api";
import { useToast } from "@/lib/client/hooks";
import type { BuildDTO } from "@/lib/types";

export default function HistorialPage() {
  const toast = useToast();
  const [builds, setBuilds] = useState<BuildDTO[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await api.get<{ builds: BuildDTO[] }>("/api/builds");
      setBuilds(data.builds || []);
      setError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al cargar el historial";
      setError(msg);
      if (silent) toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <LoadingScreen text="Cargando historial…" />;

  return (
    <div>
      {error && (
        <div className="alert alert-error mb-2" role="alert">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      <SectionHeader
        title={`${builds?.length || 0} compilaciones`}
        subtitle="Tus APKs generadas, de la más reciente a la más antigua"
        action={
          <Button size="sm" variant="secondary" onClick={() => void load(true)} loading={refreshing} icon={<RefreshCw size={14} />}>
            Actualizar
          </Button>
        }
      />

      {!builds || builds.length === 0 ? (
        <Card>
          <EmptyState
            icon={<History size={26} />}
            title="Aún no hay compilaciones"
            description="Crea tu primera APK y aparecerá aquí con su estado en tiempo real."
            actionLabel="Crear mi primera APK"
            actionHref="/app/crear"
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-3 anim-in">
          {builds.map((b) => (
            <BuildCard key={b.id} build={b} />
          ))}
        </div>
      )}

      <div style={{ marginTop: 28, textAlign: "center" }}>
        <Button variant="primary" href="/app/crear" icon={<PackagePlus size={16} />}>
          Nueva compilación
        </Button>
      </div>
    </div>
  );
}
