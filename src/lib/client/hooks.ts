"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./api";
import { useThemeContext, DEFAULT_PREFERENCES } from "@/app/providers";
import type { UserPreferences } from "@/lib/types";
import { setEnabled as setSoundEnabled } from "./sound";

export interface UserMe {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  preferences: UserPreferences;
}

/**
 * Sincroniza preferencias del usuario:
 * - Lee GET /api/user al montar (y cuando la sesión cambia) y las aplica al tema.
 * - update() hace PATCH /api/user { preferences: merge } y actualiza estado local.
 */
export function useUserPreferences() {
  const { preferences, setPreferences } = useThemeContext();
  const [user, setUser] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const fetchUser = useCallback(async () => {
    try {
      const me = await api.get<UserMe>("/api/user");
      if (!mounted.current) return;
      setUser(me);
      if (me.preferences) {
        setPreferences({ ...DEFAULT_PREFERENCES, ...me.preferences });
      }
      setError(null);
    } catch (e) {
      if (!mounted.current) return;
      // 401 = sin sesión: no es un error de UI, el layout redirige
      if (e instanceof Error && e.message.includes("401")) {
        setError(null);
      } else {
        setError(e instanceof Error ? e.message : "Error al cargar usuario");
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [setPreferences]);

  useEffect(() => {
    mounted.current = true;
    void fetchUser();
    return () => {
      mounted.current = false;
    };
  }, [fetchUser]);

  const update = useCallback(
    async (patch: Partial<UserPreferences>, extra?: { name?: string }) => {
      const next = { ...preferences, ...patch };
      // Aplicación optimista inmediata
      setPreferences(patch);
      setSoundEnabled(next.sound);
      try {
        const body: { name?: string; preferences?: Partial<UserPreferences> } = {};
        if (extra?.name !== undefined) body.name = extra.name;
        body.preferences = patch;
        const updated = await api.patch<UserMe>("/api/user", body);
        if (mounted.current) {
          setUser(updated);
          if (updated.preferences) {
            setPreferences({ ...DEFAULT_PREFERENCES, ...updated.preferences });
          }
        }
        return updated;
      } catch (e) {
        throw e;
      }
    },
    [preferences, setPreferences]
  );

  const updateName = useCallback(
    async (name: string) => {
      const updated = await api.patch<UserMe>("/api/user", { name });
      if (mounted.current) setUser(updated);
      return updated;
    },
    []
  );

  return { preferences, user, loading, error, update, updateName, refresh: fetchUser };
}

/* ---------------- Toasts ---------------- */

export type ToastType = "success" | "error" | "info";
export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

type Listener = (toasts: ToastItem[]) => void;
let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();
let nextId = 1;

function emit() {
  listeners.forEach((l) => l([...toasts]));
}

export function pushToast(message: string, type: ToastType = "info") {
  const id = nextId++;
  toasts = [...toasts, { id, message, type }];
  emit();
  window.setTimeout(() => dismissToast(id), 4200);
  return id;
}

export function dismissToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

/** Hook para mostrar toasts (la UI los renderiza mediante <ToastHost>). */
export function useToast() {
  return {
    toast: pushToast,
    success: (m: string) => pushToast(m, "success"),
    error: (m: string) => pushToast(m, "error"),
    info: (m: string) => pushToast(m, "info"),
  };
}

/** Lo usa <ToastHost> para suscribirse. */
export function useToastState() {
  const [state, setState] = useState<ToastItem[]>(toasts);
  useEffect(() => {
    const l: Listener = (t) => setState(t);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return state;
}
