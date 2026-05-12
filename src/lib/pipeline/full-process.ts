export interface PipelineStepResult {
  name: string;
  status: 'success' | 'error';
  result?: Record<string, any>;
  error?: string;
  duration_ms: number;
}

export interface PipelineSummary {
  status: 'success' | 'partial' | 'error';
  timestamp: string;
  total_duration_ms: number;
  steps: PipelineStepResult[];
}

function normalizeBaseUrl(baseUrl: string) {
  try {
    return new URL(baseUrl).origin;
  } catch {
    return baseUrl.replace(/\/$/, '');
  }
}

export async function runFullProcess(baseUrl: string, enrichLimit = 50): Promise<PipelineSummary> {
  const origin = normalizeBaseUrl(baseUrl);
  const steps: PipelineStepResult[] = [];

  const runStep = async (name: string, url: string, options: RequestInit) => {
    const start = Date.now();
    try {
      const res = await fetch(url, options);
      const duration_ms = Date.now() - start;

      if (!res.ok) {
        const text = await res.text().catch(() => 'Unable to read error body');
        const message = `HTTP ${res.status}: ${text}`;
        steps.push({ name, status: 'error', error: message, duration_ms });
        return null;
      }
      const json = await res.json().catch(() => null);
      steps.push({ name, status: 'success', result: json ?? undefined, duration_ms });
      return json;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      steps.push({ name, status: 'error', error: message, duration_ms: Date.now() - start });
      return null;
    }
  };

  const ingestUrl = `${origin}/api/ingest`;
  const enrichUrl = `${origin}/api/enrich`;
  const clusterUrl = `${origin}/api/cluster`;

  await runStep('ingest', ingestUrl, { method: 'POST' });

  const enrichResult = await runStep('enrich', enrichUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ limit: enrichLimit }),
  });

  if (enrichResult && enrichResult.enriched === enrichLimit) {
    await runStep('enrich-continuation', enrichUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit: enrichLimit }),
    });
  }

  await runStep('cluster', clusterUrl, { method: 'POST' });

  const total_duration_ms = steps.reduce((sum, step) => sum + step.duration_ms, 0);
  const failed = steps.filter(step => step.status === 'error').length;
  const status = failed === 0 ? 'success' : failed === steps.length ? 'error' : 'partial';

  return {
    status,
    timestamp: new Date().toISOString(),
    total_duration_ms,
    steps,
  };
}
