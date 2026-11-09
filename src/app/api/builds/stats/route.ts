// GET /api/builds/stats → contadores reales de BD + builds recientes.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { getCurrentUserId } from "@/lib/server/auth";
import { toBuildDTO } from "@/lib/server/dto";
import { serverError, unauthorized } from "@/lib/server/http";

const PENDING_STATUSES = ["QUEUED", "PREPARING", "BUILDING"];

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();
  try {
    const [total, completed, pending, recent] = await Promise.all([
      prisma.build.count({ where: { userId } }),
      prisma.build.count({ where: { userId, status: "COMPLETED" } }),
      prisma.build.count({ where: { userId, status: { in: PENDING_STATUSES } } }),
      prisma.build.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);
    return NextResponse.json({
      total,
      completed,
      pending,
      recent: recent.map(toBuildDTO),
    });
  } catch (err) {
    console.error("[builds stats] error:", err);
    return serverError();
  }
}
