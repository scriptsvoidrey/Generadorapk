// POST /api/builds/[id]/cancel → cancela un build activo (pasa a ERROR).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { getCurrentUserId } from "@/lib/server/auth";
import { getOwnBuild } from "@/lib/server/build-access";
import { conflict, notFound, serverError, unauthorized } from "@/lib/server/http";
import { ACTIVE_STATUSES } from "@/lib/server/build-engine";
import { toBuildDTO } from "@/lib/server/dto";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();
  try {
    const build = await getOwnBuild(params.id, userId);
    if (!build) return notFound("Build no encontrado");

    if (!ACTIVE_STATUSES.includes(build.status as (typeof ACTIVE_STATUSES)[number])) {
      return conflict("Solo se pueden cancelar builds en espera, preparación o compilación");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.build.update({
        where: { id: build.id },
        data: { status: "ERROR", errorMessage: "Cancelado por el usuario" },
      });
      await tx.buildEvent.create({
        data: { buildId: build.id, status: "ERROR", message: "Cancelado por el usuario" },
      });
      return b;
    });

    return NextResponse.json({ ok: true, build: toBuildDTO(updated) });
  } catch (err) {
    console.error("[cancel] error:", err);
    return serverError();
  }
}
