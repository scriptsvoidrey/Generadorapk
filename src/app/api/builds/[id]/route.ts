// GET /api/builds/[id] → detalle del build con sus eventos.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { getCurrentUserId } from "@/lib/server/auth";
import { toBuildDetailDTO } from "@/lib/server/dto";
import { notFound, serverError, unauthorized } from "@/lib/server/http";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();
  try {
    const build = await prisma.build.findUnique({
      where: { id: params.id },
      include: { events: true },
    });
    if (!build || build.userId !== userId) {
      return notFound("Build no encontrado");
    }
    return NextResponse.json(toBuildDetailDTO(build));
  } catch (err) {
    console.error("[build detail] error:", err);
    return serverError();
  }
}
