import { NextRequest } from 'next/server'
import { runCluster } from '@/lib/pipeline/cluster'

export async function POST(request: NextRequest) {
  const result = await runCluster()
  if ('error' in result) {
    return Response.json(result, { status: 500 })
  }
  return Response.json(result, { status: 200 })
}
