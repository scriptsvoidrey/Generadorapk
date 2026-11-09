"use client";

import { ANDROID_PERMISSIONS } from "@/lib/types";
import { Lock } from "lucide-react";
import { playClick } from "@/lib/client/sound";

interface PermissionsSelectorProps {
  selected: string[];
  onChange: (next: string[]) => void;
}

export function PermissionsSelector({ selected, onChange }: PermissionsSelectorProps) {
  const toggle = (id: string) => {
    if (id === "INTERNET") return; // bloqueado, siempre activo
    playClick();
    if (selected.includes(id)) onChange(selected.filter((p) => p !== id));
    else onChange([...selected, id]);
  };

  return (
    <div className="perm-grid">
      {ANDROID_PERMISSIONS.map((p) => {
        const locked = p.id === "INTERNET";
        const checked = selected.includes(p.id);
        return (
          <label
            key={p.id}
            className={`perm-item ${checked ? "checked" : ""} ${locked ? "locked" : ""}`}
            onClick={(e) => {
              if (locked) e.preventDefault();
            }}
          >
            <input
              type="checkbox"
              checked={checked}
              disabled={locked}
              onChange={() => toggle(p.id)}
              aria-label={p.label}
            />
            <div style={{ flex: 1 }}>
              <div className="pi-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {p.label}
                {locked && <Lock size={12} color="var(--text-faint)" />}
              </div>
              <div className="pi-desc">{p.desc}</div>
            </div>
          </label>
        );
      })}
    </div>
  );
}
