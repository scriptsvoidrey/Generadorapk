// POST /api/builds/[id]/apk?token= → el runner sube el APK compilado (multipart,
// field "apk"). Se guarda en storage, el build pasa a COMPLETED. Sin sesión.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { getBuildByCallbackToken } from "@/lib/server/build-access";
import { badRequest, serverError, unauthorized } from "@/lib/server/http";
import { MAX_UPLOAD_BYTES, storage } from "@/lib/server/storage";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const build = await getBuildByCallbackToken(params.id, token);
  if (!build) return unauthorized("Token inválido");

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return badRequest("Formulario multipart inválido");
  }

  const apkField = formData.get("apk");
  if (!(apkField instanceof File)) {
    return badRequest("Falta el campo 'apk' con el archivo");
  }
  if (apkField.size === 0) return badRequest("El APK está vacío");
  if (apkField.size > MAX_UPLOAD_BYTES) {
    return badRequest("El APK excede el límite de tamaño permitido");
  }

  try {
    const buffer = Buffer.from(await apkField.arrayBuffer());
    const apkRef = await storage.saveBuffer(`${build.id}.apk`, buffer, "apks");

    await prisma.$transaction([
      prisma.build.update({
        where: { id: build.id },
        data: { status: "COMPLETED", apkPath: apkRef, apkSize: buffer.length, errorMessage: null },
      }),
      prisma.buildEvent.create({
        data: {
          buildId: build.id,
          status: "COMPLETED",
          message: `APK subido por el runner (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`,
        },
      }),
    ]);

    return NextResponse.json({ ok: true, apkSize: buffer.length });
  } catch (err) {
    console.error("[apk upload] error:", err);
    return serverError("No se pudo guardar el APK");
  }
}
