import { NextRequest } from 'next/server';

interface CronStep {
  name: string;
  status: 'success' | 'error';
  result?: Record<string, any>;
  error?: string;
  duration_ms?: number;
}

export async function POST(request: NextRequest) {
  // Verify CRON_SECRET header
  const secret = request.headers.get('x-vercel-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  const steps: CronStep[] = [];

  console.log('[CRON] Starting sequence:', new Date().toISOString());

  // Step 1: Ingest RSS feeds
  const ingestStart = Date.now();
  try {
    console.log('[CRON] Step 1: Ingest');
    const ingestRes = await fetch(`${baseUrl}/api/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!ingestRes.ok) {
      throw new Error(`Ingest failed: ${ingestRes.status}`);
    }

    const ingestData = await ingestRes.json();
    steps.push({
      name: 'ingest',
      status: 'success',
      result: ingestData,
      duration_ms: Date.now() - ingestStart,
    });
    console.log('[CRON] Ingest complete:', ingestData);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    steps.push({
      name: 'ingest',
      status: 'error',
      error: message,
      duration_ms: Date.now() - ingestStart,
    });
    console.error('[CRON] Ingest failed:', message);
  }

  // Step 2: Enrich pending articles
  // Use a reasonable batch size to avoid timeouts
  const enrichStart = Date.now();
  try {
    console.log('[CRON] Step 2: Enrich');
    const enrichRes = await fetch(`${baseUrl}/api/enrich`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit: 50 }),
    });

    if (!enrichRes.ok) {
      throw new Error(`Enrich failed: ${enrichRes.status}`);
    }

    const enrichData = await enrichRes.json();
    steps.push({
      name: 'enrich',
      status: 'success',
      result: enrichData,
      duration_ms: Date.now() - enrichStart,
    });
    console.log('[CRON] Enrich complete:', enrichData);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    steps.push({
      name: 'enrich',
      status: 'error',
      error: message,
      duration_ms: Date.now() - enrichStart,
    });
    console.error('[CRON] Enrich failed:', message);
  }

  // Step 3: Cluster enriched articles
  const clusterStart = Date.now();
  try {
    console.log('[CRON] Step 3: Cluster');
    const clusterRes = await fetch(`${baseUrl}/api/cluster`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!clusterRes.ok) {
      throw new Error(`Cluster failed: ${clusterRes.status}`);
    }

    const clusterData = await clusterRes.json();
    steps.push({
      name: 'cluster',
      status: 'success',
      result: clusterData,
      duration_ms: Date.now() - clusterStart,
    });
    console.log('[CRON] Cluster complete:', clusterData);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    steps.push({
      name: 'cluster',
      status: 'error',
      error: message,
      duration_ms: Date.now() - clusterStart,
    });
    console.error('[CRON] Cluster failed:', message);
  }

  // Summary
  const allSucceeded = steps.every(s => s.status === 'success');
  const totalDuration = steps.reduce((sum, s) => sum + (s.duration_ms || 0), 0);

  const summary = {
    timestamp: new Date().toISOString(),
    status: allSucceeded ? 'success' : 'partial',
    total_duration_ms: totalDuration,
    steps,
    summary: {
      ingest: steps[0]?.result?.inserted || 0,
      enriched: steps[1]?.result?.enriched || 0,
      clusters_created: steps[2]?.result?.clusters_created || 0,
      errors: steps.filter(s => s.status === 'error').length,
    },
  };

  console.log('[CRON] Sequence complete:', summary);

  return Response.json(summary, {
    status: allSucceeded ? 200 : 206,
  });
}
