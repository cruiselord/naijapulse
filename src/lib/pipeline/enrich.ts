import { createServiceClient } from '@/lib/supabase/server'
import { isOllamaRunning, ollamaEmbed } from '@/lib/ollama/client'
import { enrichArticle } from '@/lib/ollama/enrichment'

type PendingArticle = {
  id: string
  title: string
  raw_content: string | null
  description: string | null
  source_id: string
}

export async function runEnrich(limit?: number) {
  const running = await isOllamaRunning()
  if (!running) {
    return { error: 'Ollama not running' }
  }

  const resolvedLimit = limit ?? Number(process.env.MAX_ARTICLES_PER_FETCH ?? 20)
  const supabase = await createServiceClient()

  const pendingQuery = await supabase
    .from('articles')
    .select('id, title, raw_content, description, source_id')
    .eq('status', 'pending')
    .limit(resolvedLimit)

  const { data: pendingArticles, error: pendingError } = pendingQuery as {
    data: PendingArticle[] | null
    error: any
  }

  if (pendingError) {
    console.error('[ENRICH] failed to fetch pending articles', pendingError)
    return { error: 'Failed to load pending articles', details: pendingError.message }
  }

  if (!pendingArticles || pendingArticles.length === 0) {
    return { enriched: 0, failed: 0, message: 'No pending articles found' }
  }

  const sourceIds = Array.from(new Set(pendingArticles.map((article) => article.source_id)))
  const sourceQuery = await supabase
    .from('sources')
    .select('id, name')
    .in('id', sourceIds)

  const { data: sourceData, error: sourceError } = sourceQuery as {
    data: { id: string; name: string }[] | null
    error: any
  }

  if (sourceError) {
    console.error('[ENRICH] failed to load sources', sourceError)
    return { error: 'Failed to load source metadata', details: sourceError.message }
  }

  const sourceMap = new Map<string, string>()
  sourceData?.forEach((source) => sourceMap.set(source.id, source.name))

  let enrichedCount = 0
  let failedCount = 0
  const errors: string[] = []

  for (const article of pendingArticles) {
    const articleId = article.id
    const sourceName = sourceMap.get(article.source_id) || article.source_id
    const content = article.raw_content || article.description || article.title || ''

    if (!content.trim()) {
      failedCount += 1
      errors.push(`${articleId}: no content available`)
      await supabase.from('articles').update({ status: 'failed' }).eq('id', articleId)
      continue
    }

    try {
      const result = await enrichArticle(article.title, content, sourceName)
      const embedding = await ollamaEmbed(`${article.title} ${result.summary}`)

      const { error: updateError } = await supabase
        .from('articles')
        .update({
          summary: result.summary,
          category: result.category,
          sentiment: result.sentiment,
          bias_score: result.bias_score,
          bias_signals: result.bias_signals,
          ng_relevance: result.ng_relevance,
          ng_relevance_reason: result.ng_relevance_reason,
          embedding,
          enriched_at: new Date().toISOString(),
          status: 'enriched',
        })
        .eq('id', articleId)

      if (updateError) {
        throw updateError
      }

      enrichedCount += 1
      console.log(`[ENRICH] enriched article ${articleId}`)
    } catch (error) {
      failedCount += 1
      const message = error instanceof Error ? error.message : String(error)
      errors.push(`${articleId}: ${message}`)
      console.error('[ENRICH] article failed', articleId, message)

      await supabase
        .from('articles')
        .update({ status: 'failed' })
        .eq('id', articleId)
    }
  }

  return { enriched: enrichedCount, failed: failedCount, errors }
}
