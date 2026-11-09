"use client";

import { SessionProvider } from "next-auth/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { UserPreferences } from "@/lib/types";
import { setEnabled as setSoundEnabled } from "@/lib/client/sound";

const PREFS_KEY = "nexa-prefs";

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "dark",
  accent: "#8b5cf6",
  notifications: true,
  language: "es",
  sound: true,
};

/** Convierte un hex a HSL, rota el matiz y devuelve hex — para el segundo stop del gradiente. */
function shiftHue(hex: string, deg = 55): string {
  const m = hex.replace("#", "");
  if (m.length !== 6) return "#3b82f6";
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  h = (h + deg) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const mm = l - c / 2;
  let rr = 0, gg = 0, bb = 0;
  if (h < 60) { rr = c; gg = x; }
  else if (h < 120) { rr = x; gg = c; }
  else if (h < 180) { gg = c; bb = x; }
  else if (h < 240) { gg = x; bb = c; }
  else if (h < 300) { rr = x; bb = c; }
  else { rr = c; bb = x; }
  const to = (v: number) => Math.round((v + mm) * 255).toString(16).padStart(2, "0");
  return `#${to(rr)}${to(gg)}${to(bb)}`;
}

interface ThemeContextValue {
  preferences: UserPreferences;
  setPreferences: (p: Partial<UserPreferences>) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext debe usarse dentro de <Providers>");
  return ctx;
}

function readLocalPrefs(): UserPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function Providers({ children }: { children: ReactNode }) {
  const [preferences, setPreferencesState] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPreferencesState(readLocalPrefs());
    setHydrated(true);
  }, []);

  const applyToDom = useCallback((p: UserPreferences) => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", p.theme);
    document.documentElement.style.setProperty("--accent", p.accent);
    document.documentElement.style.setProperty("--accent-2", shiftHue(p.accent));
    setSoundEnabled(p.sound);
  }, []);

  useEffect(() => {
    if (hydrated) applyToDom(preferences);
  }, [preferences, hydrated, applyToDom]);

  const setPreferences = useCallback((patch: Partial<UserPreferences>) => {
    setPreferencesState((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      } catch {
        /* almacenamiento no disponible */
      }
      return next;
    });
  }, []);

  const value = useMemo(() => ({ preferences, setPreferences }), [preferences, setPreferences]);

  return (
    <SessionProvider>
      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    </SessionProvider>
  );
}
