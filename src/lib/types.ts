// Tipos compartidos (congelados). Backend y frontend los usan idénticos.

export type BuildStatus = "QUEUED" | "PREPARING" | "BUILDING" | "COMPLETED" | "ERROR";
export type ContentType = "URL" | "HTML_PASTE" | "HTML_FILE" | "ZIP";

export const STATUS_LABEL: Record<BuildStatus, string> = {
  QUEUED: "En espera",
  PREPARING: "Preparando",
  BUILDING: "Compilando",
  COMPLETED: "Completado",
  ERROR: "Error",
};

export const ANDROID_PERMISSIONS: { id: string; label: string; desc: string }[] = [
  { id: "INTERNET", label: "Internet", desc: "Acceso a la red (obligatorio para WebView)" },
  { id: "ACCESS_NETWORK_STATE", label: "Estado de red", desc: "Detectar conectividad" },
  { id: "CAMERA", label: "Cámara", desc: "Acceso a la cámara desde la web" },
  { id: "RECORD_AUDIO", label: "Micrófono", desc: "Grabar audio desde la web" },
  { id: "ACCESS_FINE_LOCATION", label: "Ubicación precisa", desc: "GPS / ubicación fina" },
  { id: "ACCESS_COARSE_LOCATION", label: "Ubicación aproximada", desc: "Ubicación por red" },
  { id: "READ_EXTERNAL_STORAGE", label: "Leer almacenamiento", desc: "Acceso a archivos (API < 33)" },
  { id: "WRITE_EXTERNAL_STORAGE", label: "Escribir almacenamiento", desc: "Guardar archivos (API < 29)" },
  { id: "VIBRATE", label: "Vibración", desc: "Controlar el vibrador" },
  { id: "POST_NOTIFICATIONS", label: "Notificaciones", desc: "Mostrar notificaciones (API 33+)" },
];

export interface UserPreferences {
  theme: "dark" | "light";
  accent: string; // hex
  notifications: boolean;
  language: "es";
  sound: boolean;
}

export interface BuildDTO {
  id: string;
  appName: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  contentType: ContentType;
  permissions: string[];
  status: BuildStatus;
  errorMessage?: string | null;
  apkSize?: number | null;
  createdAt: string;
  updatedAt: string;
  hasApk: boolean;
}

export interface BuildDetailDTO extends BuildDTO {
  iconPath?: string | null;
  events: { status: BuildStatus; message: string; createdAt: string }[];
}

export interface DashboardStatsDTO {
  total: number;
  completed: number;
  pending: number; // QUEUED + PREPARING + BUILDING
  recent: BuildDTO[];
}
