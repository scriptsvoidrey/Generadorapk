// POST /api/builds/[id]/status?token= → callback del runner de GitHub Actions.
// Actualiza el estado del build y registra un evento. Sin sesión (token auth).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { getBuildByCallbackToken } from "@/lib/server/build-access";
import { badRequest, serverError, unauthorized, zodDetails } from "@/lib/server/http";
import { runnerStatusSchema } from "@/lib/server/validators";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const build = await getBuildByCallbackToken(params.id, token);
  if (!build) return unauthorized("Token inválido");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Cuerpo JSON inválido");
  }
  const parsed = runnerStatusSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Estado inválido", zodDetails(parsed.error));
  }
  const { status, message, error } = parsed.data;

  try {
    const eventMessage =
      message ||
      (status === "COMPLETED"
        ? "Compilación completada"
        : status === "ERROR"
          ? error || "Error en la compilación"
          : status === "PREPARING"
            ? "Preparando entorno de compilación"
            : "Compilando APK");

    await prisma.$transaction([
      prisma.build.update({
        where: { id: build.id },
        data: {
          status,
          errorMessage: status === "ERROR" ? error ?? eventMessage : build.errorMessage,
        },
      }),
      prisma.buildEvent.create({
        data: { buildId: build.id, status, message: eventMessage },
      }),
    ]);

    return NextResponse.json({ ok: true, status });
  } catch (err) {
    console.error("[status callback] error:", err);
    return serverError();
  }
}
