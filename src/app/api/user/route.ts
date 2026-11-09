// GET /api/user → datos del usuario (preferences parseadas).
// PATCH /api/user → actualiza name y/o mergea preferences.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { getCurrentUserId } from "@/lib/server/auth";
import { parsePreferences, toUserDTO } from "@/lib/server/dto";
import { userPatchSchema } from "@/lib/server/validators";
import { badRequest, serverError, unauthorized, zodDetails } from "@/lib/server/http";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return unauthorized();
    return NextResponse.json(toUserDTO(user));
  } catch (err) {
    console.error("[user GET] error:", err);
    return serverError();
  }
}

export async function PATCH(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Cuerpo JSON inválido");
  }
  const parsed = userPatchSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Datos inválidos", zodDetails(parsed.error));
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return unauthorized();

    const data: { name?: string; preferences?: string } = {};
    if (parsed.data.name !== undefined) data.name = parsed.data.name;

    if (parsed.data.preferences !== undefined) {
      // Merge de preferences: las claves entrantes sobrescriben las existentes.
      const current = parsePreferences(user) as unknown as Record<string, unknown>;
      const merged = { ...current, ...parsed.data.preferences };
      data.preferences = JSON.stringify(merged);
    }

    const updated = await prisma.user.update({ where: { id: userId }, data });
    return NextResponse.json(toUserDTO(updated));
  } catch (err) {
    console.error("[user PATCH] error:", err);
    return serverError();
  }
}
