import { NextRequest } from 'next/server'
import { runIngest } from '@/lib/pipeline/ingest'

export async function POST(request: NextRequest) {
  const result = await runIngest()
  if ('error' in result) {
    return Response.json(result, { status: 500 })
  }
  return Response.json(result, { status: 200 })
}
