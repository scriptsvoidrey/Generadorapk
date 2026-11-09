/**
 * Cliente HTTP para la API de NEXA (base relativa "" = mismo origen).
 * Consume el contrato congelado de CONTRACT.md. No mockea respuestas.
 */

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown; // se serializa a JSON salvo que sea FormData
};

async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const init: RequestInit = {
    credentials: "include",
    headers: isFormData
      ? { ...(headers as Record<string, string> | undefined) }
      : { "Content-Type": "application/json", ...(headers as Record<string, string> | undefined) },
    ...rest,
  };

  if (body !== undefined) {
    init.body = isFormData ? (body as FormData) : JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(path, init);
  } catch {
    throw new ApiError("No se pudo conectar con el servidor. Revisa tu conexión.", 0);
  }

  let data: unknown = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const errObj = data as { error?: string; message?: string; details?: unknown } | null;
    const message =
      errObj?.error ||
      errObj?.message ||
      `Error ${res.status} en ${path}`;
    throw new ApiError(message, res.status, errObj?.details);
  }

  if (res.status === 204 || data === null) return undefined as T;
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  /** POST multipart (FormData). El body debe ser un FormData. */
  postMultipart: <T>(path: string, form: FormData) =>
    request<T>(path, { method: "POST", body: form }),
};

/** Normaliza una URL según el contrato: si no empieza por http(s) se prefija https://. */
export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** Devuelve true si el contenido parece HTML (empieza por < o <!DOCTYPE). */
export function looksLikeHtml(content: string): boolean {
  return /^\s*(<|<!DOCTYPE)/i.test(content);
}

export function formatBytes(bytes?: number | null): string {
  if (!bytes && bytes !== 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatDateEs(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
