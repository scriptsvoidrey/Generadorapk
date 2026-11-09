import type { ReactNode } from "react";
import { Card } from "./Card";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  accent?: string;
}

export function StatCard({ icon, label, value, accent }: StatCardProps) {
  return (
    <Card className="stat-card">
      <div className="stat-icon" style={accent ? { color: accent, background: `${accent}22` } : undefined}>
        {icon}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </Card>
  );
}
