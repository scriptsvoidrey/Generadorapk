"use client";

import { playClick } from "@/lib/client/sound";

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

export function Toggle({ checked, onChange, label, description, disabled, ariaLabel }: ToggleProps) {
  const handle = () => {
    if (disabled) return;
    playClick();
    onChange(!checked);
  };

  const switchEl = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel || label || "Interruptor"}
      disabled={disabled}
      onClick={handle}
      className={`toggle ${checked ? "on" : ""}`}
      style={disabled ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
    />
  );

  if (!label && !description) return switchEl;

  return (
    <div className="toggle-row">
      <div>
        <div className="tr-title">{label}</div>
        {description && <div className="tr-desc">{description}</div>}
      </div>
      {switchEl}
    </div>
  );
}
