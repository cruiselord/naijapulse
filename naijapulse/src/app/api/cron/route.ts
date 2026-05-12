import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const base  = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const start = Date.now()
  const results: Record<string, any> = {}

  try {
    // Step 1: Ingest
    const ingestRes  = await fetch(`${base}/api/ingest`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    results.ingest   = await ingestRes.json()
  } catch (e: any) {
    results.ingest   = { error: e.message }
  }

  try {
    // Step 2: Cluster (enrichment requires Ollama — skip in cron, run manually)
    const clusterRes = await fetch(`${base}/api/cluster`, { method: 'POST' })
    results.cluster  = await clusterRes.json()
  } catch (e: any) {
    results.cluster  = { error: e.message }
  }

  return NextResponse.json({
    ok:            true,
    duration_ms:   Date.now() - start,
    timestamp:     new Date().toISOString(),
    note:          'Enrichment (Ollama) must be triggered manually: POST /api/enrich',
    results,
  })
}
