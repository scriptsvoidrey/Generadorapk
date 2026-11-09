// Esquemas de validación (zod) para todas las entradas del backend.
import { z } from "zod";
import { ANDROID_PERMISSIONS } from "@/lib/types";

export const ALLOWED_PERMISSION_IDS = ANDROID_PERMISSIONS.map((p) => p.id);

// ── Registro de usuario ───────────────────────────────────────────────
export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email inválido"),
  name: z.string().trim().min(1, "El nombre es obligatorio").max(100),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(200),
});

// ── Actualización de usuario ──────────────────────────────────────────
export const userPatchSchema = z.object({
  name: z.string().trim().min(1, "El nombre no puede estar vacío").max(100).optional(),
  // preferences es un objeto parcial (se mergea con el existente).
  preferences: z.record(z.unknown()).optional(),
});

// ── Creación de build (campos de texto; los archivos se validan aparte) ─
export const contentTypeEnum = z.enum(["URL", "HTML_PASTE", "HTML_FILE", "ZIP"]);

export const createBuildFieldsSchema = z.object({
  appName: z.string().trim().min(1, "appName es obligatorio").max(100),
  // Al menos dos segmentos (un punto), cada uno empieza por letra.
  packageName: z
    .string()
    .trim()
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/,
      "packageName debe tener formato com.tu.app (al menos dos segmentos, sin espacios)",
    )
    .max(150),
  versionName: z.string().trim().max(50).default("1.0.0").optional(),
  versionCode: z.coerce.number().int().positive().max(2_100_000_000).optional(),
  contentType: contentTypeEnum,
  url: z.string().trim().max(2048).optional(),
  html: z.string().max(5_000_000).optional(), // ~5MB de HTML pegado
  permissions: z.string().default("[]"),
});

// ── Callback de estado del runner (GitHub Actions) ────────────────────
export const runnerStatusSchema = z.object({
  status: z.enum(["PREPARING", "BUILDING", "COMPLETED", "ERROR"]),
  message: z.string().max(2000).optional(),
  error: z.string().max(4000).optional(),
});

/** Valida que un string JSON sea un array de ids de permisos conocidos. */
export function parsePermissions(raw: string): string[] {
  let arr: unknown;
  try {
    arr = JSON.parse(raw);
  } catch {
    throw new Error("permissions no es un JSON array válido");
  }
  if (!Array.isArray(arr)) {
    throw new Error("permissions debe ser un array JSON");
  }
  const cleaned = new Set<string>();
  for (const item of arr) {
    if (typeof item !== "string") {
      throw new Error("permissions contiene elementos que no son texto");
    }
    const id = item.trim().toUpperCase();
    if (!ALLOWED_PERMISSION_IDS.includes(id)) {
      throw new Error(`Permiso no permitido: ${item}`);
    }
    cleaned.add(id);
  }
  // INTERNET es obligatorio para WebView.
  cleaned.add("INTERNET");
  return Array.from(cleaned);
}
