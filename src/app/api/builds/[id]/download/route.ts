// GET /api/builds/[id]/download → stream del APK (solo COMPLETED y dueño).
import { getCurrentUserId } from "@/lib/server/auth";
import { getOwnBuild } from "@/lib/server/build-access";
import { conflict, notFound, serverError, unauthorized } from "@/lib/server/http";
import { storage } from "@/lib/server/storage";

export const runtime = "nodejs";

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 80) || "app";
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();
  try {
    const build = await getOwnBuild(params.id, userId);
    if (!build) return notFound("Build no encontrado");
    if (build.status !== "COMPLETED" || !build.apkPath) {
      return conflict("El APK aún no está listo o la compilación falló");
    }
    const stream = await storage.getDownloadStream(build.apkPath);
    const filename = `${sanitizeFilename(build.appName)}.apk`;
    return new Response(stream, {
      headers: {
        "Content-Type": "application/vnd.android.package-archive",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[apk download] error:", err);
    return serverError("No se pudo descargar el APK");
  }
}
