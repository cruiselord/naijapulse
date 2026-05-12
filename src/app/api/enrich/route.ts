import { NextRequest } from 'next/server'
import { runEnrich } from '@/lib/pipeline/enrich'

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { limit?: number }
  const result = await runEnrich(body.limit)
  if ('error' in result) {
    const status = result.error === 'Ollama not running' ? 503 : 500
    return Response.json(result, { status })
  }
  return Response.json(result, { status: 200 })
}
