import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { fetchRssFeed } from '@/lib/ingestion/rss'
import type { Source } from '@/types'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const supabase = await createServiceClient()
  const body = await req.json().catch(() => ({}))
  const { source_id } = body as { source_id?: string }

  // Fetch sources
  let query = supabase
    .from('sources')
    .select('id, name, domain, rss_url')
    .eq('is_active', true)
    .not('rss_url', 'is', null)

  if (source_id) query = query.eq('id', source_id)

  const { data: sources, error: srcErr } = await query
  if (srcErr) return NextResponse.json({ error: srcErr.message }, { status: 500 })

  let inserted = 0
  let skipped  = 0
  const errors: string[] = []

  for (const source of (sources ?? []) as Source[]) {
    if (!source.rss_url) continue
    try {
      const articles = await fetchRssFeed(source.rss_url, source.id)

      for (const article of articles) {
        const { error: insertErr } = await supabase
          .from('articles')
          .insert({
            source_id:   article.source_id,
            url:         article.url,
            url_hash:    article.url_hash,
            title:       article.title,
            description: article.description,
            raw_content: article.raw_content,
            image_url:   article.image_url,
            author:      article.author,
            published_at:article.published_at.toISOString(),
            status:      'pending',
          })
          .select('id')
          .single()

        if (insertErr) {
          if (insertErr.code === '23505') { skipped++ } // unique violation = dupe
          else errors.push(`${source.name}: ${insertErr.message}`)
        } else {
          inserted++
        }
      }
      console.log(`[ingest] ${source.name}: ${articles.length} fetched`)
    } catch (err: any) {
      const msg = `${source.name}: ${err.message}`
      errors.push(msg)
      console.error('[ingest]', msg)
    }
  }

  return NextResponse.json({ inserted, skipped, errors, sources_processed: sources?.length ?? 0 })
}
