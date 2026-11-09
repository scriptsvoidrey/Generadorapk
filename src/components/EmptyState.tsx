import type { ReactNode } from "react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="es-icon">{icon}</div>
      <h3>{title}</h3>
      {description && <p style={{ maxWidth: 380, margin: "0 auto 18px", fontSize: "0.88rem" }}>{description}</p>}
      {actionLabel &&
        (actionHref ? (
          <Button href={actionHref} variant="primary" size="sm">
            {actionLabel}
          </Button>
        ) : (
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        ))}
    </div>
  );
}
