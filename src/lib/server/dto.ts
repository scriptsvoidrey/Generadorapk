// Mapeos Prisma → DTO. SQLite guarda preferences/permissions como String con
// JSON serializado: aquí se parsean a objetos/arrays antes de devolverlos.
import type { Build, BuildEvent, User } from "@prisma/client";
import type {
  BuildDTO,
  BuildDetailDTO,
  BuildStatus,
  ContentType,
  UserPreferences,
} from "@/lib/types";

function parseJSON<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function parsePreferences(user: User): UserPreferences {
  const parsed = parseJSON<Partial<UserPreferences>>(user.preferences, {});
  return {
    theme: parsed.theme === "light" ? "light" : "dark",
    accent: typeof parsed.accent === "string" ? parsed.accent : "#8b5cf6",
    notifications: typeof parsed.notifications === "boolean" ? parsed.notifications : true,
    language: "es",
    sound: typeof parsed.sound === "boolean" ? parsed.sound : true,
  };
}

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  image: string | null;
  preferences: UserPreferences;
}

export function toUserDTO(user: User): UserDTO {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image ?? null,
    preferences: parsePreferences(user),
  };
}

export function toBuildDTO(build: Build): BuildDTO {
  return {
    id: build.id,
    appName: build.appName,
    packageName: build.packageName,
    versionName: build.versionName,
    versionCode: build.versionCode,
    contentType: build.contentType as ContentType,
    permissions: parseJSON<string[]>(build.permissions, []),
    status: build.status as BuildStatus,
    errorMessage: build.errorMessage ?? null,
    apkSize: build.apkSize ?? null,
    createdAt: build.createdAt.toISOString(),
    updatedAt: build.updatedAt.toISOString(),
    hasApk: Boolean(build.apkPath),
  };
}

export function toBuildDetailDTO(
  build: Build & { events: BuildEvent[] },
): BuildDetailDTO {
  return {
    ...toBuildDTO(build),
    iconPath: build.iconPath ?? null,
    events: build.events
      .slice()
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((e) => ({
        status: e.status as BuildStatus,
        message: e.message,
        createdAt: e.createdAt.toISOString(),
      })),
  };
}
