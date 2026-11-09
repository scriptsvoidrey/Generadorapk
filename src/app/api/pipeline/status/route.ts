// GET /api/pipeline/status — público: indica driver activo y si está configurado.
import { NextResponse } from "next/server";
import { configuredRepository, isPipelineConfigured } from "@/lib/server/github";
import { activeDriver } from "@/lib/server/build-engine";
import { isLocalConfigured } from "@/lib/server/build-driver-local";

export const dynamic = "force-dynamic";

export async function GET() {
  const driver = activeDriver();
  let configured = false;
  let message: string | undefined;
  let repository: string | undefined;

  if (driver === "github") {
    configured = isPipelineConfigured();
    repository = configured ? configuredRepository() : undefined;
    if (!configured) {
      message =
        "Configura GITHUB_TOKEN y GITHUB_REPOSITORY, o cambia a BUILD_DRIVER=local y ejecuta scripts/setup-android.sh.";
    }
  } else {
    configured = isLocalConfigured();
    if (!configured) {
      message =
        "Ejecuta bash scripts/setup-android.sh una vez para instalar JDK 17 + Android SDK + Gradle, luego reinicia el servidor.";
    }
  }

  const body: {
    configured: boolean;
    driver: "local" | "github";
    message?: string;
    repository?: string;
  } = { configured, driver };
  if (message) body.message = message;
  if (repository) body.repository = repository;
  return NextResponse.json(body);
}
