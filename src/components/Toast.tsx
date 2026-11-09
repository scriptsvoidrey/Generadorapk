"use client";

import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { useToastState, dismissToast, type ToastItem } from "@/lib/client/hooks";

const iconFor = {
  success: <CheckCircle2 size={18} color="#34d399" />,
  error: <AlertTriangle size={18} color="#f87171" />,
  info: <Info size={18} color="#60a5fa" />,
};

function ToastRow({ t }: { t: ToastItem }) {
  return (
    <div className={`toast ${t.type}`} role="status">
      {iconFor[t.type]}
      <span style={{ flex: 1 }}>{t.message}</span>
      <button
        onClick={() => dismissToast(t.id)}
        aria-label="Cerrar notificación"
        style={{
          background: "transparent",
          border: "none",
          color: "var(--text-faint)",
          cursor: "pointer",
          padding: 2,
          display: "flex",
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

/** Host fijo de toasts. Se monta una sola vez (en el layout de app). */
export function ToastHost() {
  const toasts = useToastState();
  return (
    <div className="toast-host" aria-live="polite">
      {toasts.map((t) => (
        <ToastRow key={t.id} t={t} />
      ))}
    </div>
  );
}
