// Middleware: protege /app/* (redirige a /login sin sesión) y /api/*
// (401 JSON sin sesión), salvo rutas públicas y callbacks del runner que
// se autentican con token query param (la validación real del token la
// hace cada route handler contra la BD; aquí solo exigimos presencia).
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_API_PREFIXES = ["/api/auth/"];
const PUBLIC_API_EXACT = ["/api/pipeline/status"];
// Callbacks del runner de GitHub Actions (token en query param).
const RUNNER_CALLBACK_RE = /^\/api\/builds\/[^/]+\/(source|status|apk)$/;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rutas de auth públicas.
  if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }
  // Estado del pipeline (público, para la página de Ayuda).
  if (PUBLIC_API_EXACT.includes(pathname)) {
    return NextResponse.next();
  }
  // Callbacks del runner: requieren token query param (validación real en el handler).
  if (RUNNER_CALLBACK_RE.test(pathname)) {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  const secret = process.env.NEXTAUTH_SECRET;
  const session = await getToken({ req, secret });

  // Resto de rutas /api/* requieren sesión.
  if (pathname.startsWith("/api/")) {
    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Páginas protegidas /app/* → redirige a /login.
  if (pathname.startsWith("/app")) {
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/api/:path*"],
};
