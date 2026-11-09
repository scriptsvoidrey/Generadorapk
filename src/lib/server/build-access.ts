// Helpers compartidos para rutas de builds: carga por dueño y por callback token.
import type { Build } from "@prisma/client";
import { prisma } from "./db";

/** Devuelve el build solo si pertenece al usuario; null en caso contrario. */
export async function getOwnBuild(id: string, userId: string): Promise<Build | null> {
  const build = await prisma.build.findUnique({ where: { id } });
  if (!build || build.userId !== userId) return null;
  return build;
}

/** Valida el callback token del runner; devuelve el build o null. */
export async function getBuildByCallbackToken(
  id: string,
  token: string | null,
): Promise<Build | null> {
  if (!token) return null;
  const build = await prisma.build.findUnique({ where: { id } });
  if (!build) return null;
  // Comparación en tiempo constante para evitar timing attacks.
  if (build.callbackToken.length !== token.length) return null;
  let diff = 0;
  for (let i = 0; i < build.callbackToken.length; i++) {
    diff |= build.callbackToken.charCodeAt(i) ^ token.charCodeAt(i);
  }
  if (diff !== 0) return null;
  return build;
}
