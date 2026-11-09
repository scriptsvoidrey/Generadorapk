// POST /api/auth/register — crea usuario con email+contraseña (bcrypt).
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/server/db";
import { registerSchema } from "@/lib/server/validators";
import { badRequest, conflict, serverError, zodDetails } from "@/lib/server/http";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Cuerpo JSON inválido");
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Datos de registro inválidos", zodDetails(parsed.error));
  }
  const { email, name, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return conflict("Ya existe una cuenta con ese email");
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { email, name, passwordHash, provider: "credentials" },
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[register] error:", err);
    return serverError();
  }
}
