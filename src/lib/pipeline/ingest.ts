import { createServiceClient } from '@/lib/supabase/server'
import { fetchRssFeed } from '@/lib/ingestion/rss'

export async function runIngest() {
  try {
    const supabase = await createServiceClient()
    const { data: sources, error: sourcesError } = await supabase
      .from('sources')
      .select('id, name, rss_url')
      .eq('is_active', true)
      .not('rss_url', 'is', null)

    if (sourcesError) {
      return { error: 'Failed to fetch sources', details: sourcesError }
    }

    if (!sources || sources.length === 0) {
      return { inserted: 0, skipped: 0, errors: ['No active sources found'] }
    }

    let inserted = 0
    let skipped = 0
    const errors: string[] = []

    for (const source of sources) {
      try {
        console.log(`[INGEST] Processing ${source.name}...`)
        const rawArticles = await fetchRssFeed(
          source.rss_url!,
          source.id,
          parseInt(process.env.MAX_ARTICLES_PER_FETCH || '50')
        )

        const urlHashes = rawArticles.map(a => a.url_hash)
        const { data: existing } = await supabase
          .from('articles')
          .select('url_hash')
          .in('url_hash', urlHashes)

        const existingHashes = new Set(existing?.map(a => a.url_hash) || [])
        const newArticles = rawArticles.filter(a => !existingHashes.has(a.url_hash))

        if (newArticles.length > 0) {
          const { error: insertError } = await supabase
            .from('articles')
            .insert(
              newArticles.map(a => ({
                source_id: a.source_id,
                url: a.url,
                url_hash: a.url_hash,
                title: a.title,
                description: a.description,
                raw_content: a.raw_content,
                image_url: a.image_url,
                author: a.author,
                published_at: a.published_at.toISOString(),
                status: 'pending',
              }))
            )

          if (insertError) {
            errors.push(`${source.name}: ${insertError.message}`)
          } else {
            inserted += newArticles.length
            console.log(`[INGEST] ✓ ${source.name}: inserted ${newArticles.length}`)
          }
        }

        skipped += existingHashes.size
      } catch (sourceError) {
        const msg = sourceError instanceof Error ? sourceError.message : String(sourceError)
        errors.push(`${source.name}: ${msg}`)
        console.error(`[INGEST] ✗ ${source.name}: ${msg}`)
      }
    }

    return { inserted, skipped, errors }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[INGEST] Fatal error:', msg)
    return { error: 'Ingestion failed', details: msg }
  }
}
