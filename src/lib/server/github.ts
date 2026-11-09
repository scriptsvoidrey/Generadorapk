// Cliente ligero para GitHub Actions API: disparar workflow_dispatch y,
// con mejor esfuerzo, obtener el run_id asociado. El callback del runner
// es la fuente de verdad; el runId es solo para trazabilidad.

export interface DispatchResult {
  dispatched: boolean;
  runId?: number;
  error?: string;
}

export function isPipelineConfigured(): boolean {
  return Boolean(
    process.env.GITHUB_TOKEN &&
      process.env.GITHUB_TOKEN.trim() &&
      process.env.GITHUB_REPOSITORY &&
      process.env.GITHUB_REPOSITORY.trim() &&
      process.env.GITHUB_REPOSITORY.includes("/"),
  );
}

export function configuredRepository(): string | undefined {
  return isPipelineConfigured() ? process.env.GITHUB_REPOSITORY! : undefined;
}

const API_BASE = "https://api.github.com";

function authHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
    "User-Agent": "nexa-apk-studio",
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Mejor esfuerzo: encuenta el run más reciente creado en los últimos 2 min. */
async function getLatestRunId(token: string, repo: string): Promise<number | undefined> {
  for (let attempt = 0; attempt < 3; attempt++) {
    await sleep(1500 * (attempt + 1));
    try {
      const res = await fetch(
        `${API_BASE}/repos/${repo}/actions/runs?event=workflow_dispatch&per_page=5`,
        { headers: authHeaders(token) },
      );
      if (!res.ok) continue;
      const data = (await res.json()) as { workflow_runs?: Array<{ id: number; created_at: string }> };
      const run = data.workflow_runs?.[0];
      if (run?.id) {
        const ageMs = Date.now() - new Date(run.created_at).getTime();
        if (ageMs < 2 * 60 * 1000) return run.id;
      }
    } catch {
      // ignorar: mejor esfuerzo
    }
  }
  return undefined;
}

/** Dispara workflow_dispatch con los inputs dados. */
export async function triggerDispatch(inputs: Record<string, string>): Promise<DispatchResult> {
  if (!isPipelineConfigured()) {
    return { dispatched: false, error: "GitHub Actions no está configurado" };
  }
  const token = process.env.GITHUB_TOKEN!;
  const repo = process.env.GITHUB_REPOSITORY!;
  const workflowId = process.env.GITHUB_WORKFLOW_ID || "build-apk.yml";
  const ref = process.env.GITHUB_DEFAULT_BRANCH || "main";

  try {
    const res = await fetch(
      `${API_BASE}/repos/${repo}/actions/workflows/${workflowId}/dispatches`,
      {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ ref, inputs }),
      },
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const error = `GitHub API respondió ${res.status}: ${text.slice(0, 200)}`;
      console.error("[github] dispatch falló:", error);
      return { dispatched: false, error };
    }
    // 204 No Content = aceptado. Intentar obtener runId (mejor esfuerzo).
    const runId = await getLatestRunId(token, repo);
    return { dispatched: true, runId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[github] error de red en dispatch:", msg);
    return { dispatched: false, error: msg };
  }
}
