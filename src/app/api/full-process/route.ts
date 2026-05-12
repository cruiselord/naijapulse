import { NextRequest } from 'next/server'
import { runIngest } from '@/lib/pipeline/ingest'
import { runEnrich } from '@/lib/pipeline/enrich'
import { runCluster } from '@/lib/pipeline/cluster'

interface PipelineStepResult {
  name: string
  status: 'success' | 'error'
  result?: any
  error?: string
  duration_ms: number
}

interface PipelineSummary {
  status: 'success' | 'partial' | 'error'
  timestamp: string
  total_duration_ms: number
  steps: PipelineStepResult[]
}

export async function POST(request: NextRequest) {
  const enrichLimit = Number(process.env.MAX_ARTICLES_PER_FETCH ?? 50)
  const maxEnrichBatches = Number(process.env.MAX_ENRICH_BATCHES ?? 3)
  const steps: PipelineStepResult[] = []

  const runStep = async (name: string, fn: () => Promise<any>) => {
    const start = Date.now()
    try {
      const result = await fn()
      const duration_ms = Date.now() - start
      if (result?.error) {
        steps.push({ name, status: 'error', error: String(result.error || 'Unknown error'), result, duration_ms })
      } else {
        steps.push({ name, status: 'success', result, duration_ms })
      }
      return result
    } catch (error) {
      const duration_ms = Date.now() - start
      const message = error instanceof Error ? error.message : String(error)
      steps.push({ name, status: 'error', error: message, duration_ms })
      return { error: message }
    }
  }

  await runStep('ingest', runIngest)

  for (let batch = 1; batch <= maxEnrichBatches; batch += 1) {
    const enrichResult = await runStep(`enrich-${batch}`, () => runEnrich(enrichLimit))
    if (enrichResult?.error) break
    if (!enrichResult.enriched || enrichResult.enriched < enrichLimit) break
  }

  await runStep('cluster', runCluster)

  const total_duration_ms = steps.reduce((sum, step) => sum + step.duration_ms, 0)
  const failed = steps.filter((step) => step.status === 'error').length
  const status = failed === 0 ? 'success' : failed === steps.length ? 'error' : 'partial'

  const summary: PipelineSummary = {
    status,
    timestamp: new Date().toISOString(),
    total_duration_ms,
    steps,
  }

  return Response.json(summary, { status: status === 'success' ? 200 : 206 })
}
