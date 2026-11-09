import { STATUS_LABEL, type BuildStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: BuildStatus }) {
  return <span className={`badge status-${status}`}>{STATUS_LABEL[status]}</span>;
}

type Tone = "neutral" | "success" | "warning" | "info";

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: Tone }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
