// GET /api/builds/[id]/source?token= → descarga del zip fuente para el runner.
// Sin sesión: se autentica con callbackToken (validado aquí, no en middleware).
import { getBuildByCallbackToken } from "@/lib/server/build-access";
import { notFound, serverError, unauthorized } from "@/lib/server/http";
import { storage } from "@/lib/server/storage";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const build = await getBuildByCallbackToken(params.id, token);
  if (!build) return unauthorized("Token inválido");
  try {
    if (!build.sourceRef) return notFound("Fuente del build no disponible");
    const stream = await storage.getDownloadStream(build.sourceRef);
    return new Response(stream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="source-${build.id}.zip"`,
      },
    });
  } catch (err) {
    console.error("[source download] error:", err);
    return serverError("No se pudo descargar el fuente");
  }
}
