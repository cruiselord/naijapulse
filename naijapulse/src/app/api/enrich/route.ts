import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { enrichArticle } from '@/lib/ollama/enrichment'
import { ollamaEmbed, isOllamaRunning } from '@/lib/ollama/client'
import type { Article } from '@/types'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  // Check Ollama is up
  const ollamaUp = await isOllamaRunning()
  if (!ollamaUp) {
    return NextResponse.json(
      { error: 'Ollama is not running. Start it with: ollama serve' },
      { status: 503 }
    )
  }

  const body   = await req.json().catch(() => ({}))
  const limit  = Math.min(body.limit ?? 20, 50)
  const supabase = await createServiceClient()

  const { data: pending, error } = await supabase
    .from('articles')
    .select('id, title, description, raw_content, source:sources(name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let enriched = 0
  let failed   = 0

  for (const article of (pending ?? []) as any[]) {
    try {
      const content     = article.raw_content || article.description || article.title
      const sourceName  = article.source?.name ?? 'Unknown'
      const result      = await enrichArticle(article.title, content, sourceName)
      const textToEmbed = `${article.title} ${result.summary}`
      const embedding   = await ollamaEmbed(textToEmbed)

      await supabase
        .from('articles')
        .update({
          summary:            result.summary,
          category:           result.category,
          sentiment:          result.sentiment,
          bias_score:         result.bias_score,
          bias_signals:       result.bias_signals,
          ng_relevance:       result.ng_relevance,
          ng_relevance_reason:result.ng_relevance_reason,
          embedding:          `[${embedding.join(',')}]`,
          status:             'enriched',
          enriched_at:        new Date().toISOString(),
        })
        .eq('id', article.id)

      // Look up source bias — attach to source if not AI-rated
      const { data: src } = await supabase
        .from('sources')
        .select('bias_label, ai_rated')
        .eq('id', article.source_id)
        .single()

      if (src && src.bias_label === 'unknown' && !src.ai_rated) {
        // TODO: queue for source-level AI rating
      }

      enriched++
    } catch (err: any) {
      console.error(`[enrich] failed ${article.id}:`, err.message)
      await supabase
        .from('articles')
        .update({ status: 'failed' })
        .eq('id', article.id)
      failed++
    }
  }

  return NextResponse.json({ enriched, failed, total_processed: (pending ?? []).length })
}
