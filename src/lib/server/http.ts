// Helpers HTTP para respuestas JSON consistentes (errores en español, sin stack traces).
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonError(
  status: number,
  error: string,
  details?: unknown,
): NextResponse {
  const body: { error: string; details?: unknown } = { error };
  if (details !== undefined) body.details = details;
  return NextResponse.json(body, { status });
}

export function badRequest(error = "Solicitud inválida", details?: unknown) {
  return jsonError(400, error, details);
}

export function unauthorized(error = "unauthorized") {
  return jsonError(401, error);
}

export function notFound(error = "Recurso no encontrado") {
  return jsonError(404, error);
}

export function conflict(error = "Conflicto", details?: unknown) {
  return jsonError(409, error, details);
}

export function serverError(error = "Error interno del servidor") {
  // Nunca exponer detalles internos al cliente; el error real se loguea en el servidor.
  return jsonError(500, error);
}

/** Extrae mensajes de ZodError en un objeto legible. */
export function zodDetails(err: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    out[key] = issue.message;
  }
  return out;
}
