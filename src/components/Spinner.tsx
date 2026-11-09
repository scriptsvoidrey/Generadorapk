interface SpinnerProps {
  size?: "sm" | "lg";
  dark?: boolean;
}

export function Spinner({ size, dark }: SpinnerProps = {}) {
  return (
    <span
      className={`spinner ${size === "lg" ? "spinner-lg" : ""} ${dark ? "dark" : ""}`.trim()}
      role="status"
      aria-label="Cargando"
    />
  );
}

export function LoadingScreen({ text = "Cargando…" }: { text?: string }) {
  return (
    <div className="loading-center">
      <Spinner size="lg" />
      <span className="muted small">{text}</span>
    </div>
  );
}
