import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import { timeAgo, getBiasColor, getBiasLabel, getFactualityColor } from '@/lib/utils'
import { BiasBar } from '@/components/ui/BiasBar'
import { BiasChip } from '@/components/ui/BiasChip'
import { BlindspotBanner } from '@/components/ui/BlindspotBanner'
import { FactualityBadge } from '@/components/ui/FactualityBadge'
import { CategoryChip } from '@/components/ui/CategoryChip'
import { CoverageSpectrum } from '@/components/ui/CoverageSpectrum'
import type { StoryCluster, Article } from '@/types'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createServiceClient()
  const { data } = await supabase
    .from('story_clusters')
    .select('headline, summary')
    .eq('id', params.id)
    .single()

  return {
    title: data?.headline ?? 'Story',
    description: data?.summary ?? undefined,
  }
}

export default async function StoryPage({ params }: Props) {
  const supabase = await createServiceClient()

  const { data: story, error } = await supabase
    .from('story_clusters')
    .select(`
      *,
      articles(
        id, title, url, source_id, summary, bias_score, sentiment,
        ng_relevance, published_at, image_url, author,
        source:sources(name, domain, bias_label, factuality, factuality_score, logo_url)
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !story) notFound()

  const cluster = story as StoryCluster
  const articles = (cluster.articles ?? []) as Article[]

  // Related stories
  const { data: related } = await supabase
    .from('story_clusters')
    .select('id, headline, category, source_count, last_updated_at')
    .neq('id', params.id)
    .eq('category', cluster.category ?? 'general')
    .order('last_updated_at', { ascending: false })
    .limit(4)

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 py-4 text-xs text-gray-600" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-gold-400 transition-colors">Home</Link>
        <span>/</span>
        {cluster.category && (
          <>
            <Link href={`/?cat=${cluster.category}`} className="hover:text-gold-400 transition-colors capitalize">
              {cluster.category}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-400 truncate max-w-xs">{cluster.headline}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Main column ─────────────────────────────── */}
        <article className="lg:col-span-2 space-y-6">

          {/* Category + flags */}
          <div className="flex items-center gap-2 flex-wrap">
            {cluster.category && <CategoryChip category={cluster.category} />}
            {cluster.ng_relevance >= 0.7 && (
              <span className="text-sm" title="High Nigerian relevance">🇳🇬 High NG Relevance</span>
            )}
            <span className="text-xs text-gray-600 ml-auto">{timeAgo(cluster.last_updated_at)}</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-white leading-tight animate-fade-up">
            {cluster.headline}
          </h1>

          {/* Blindspot banner */}
          {cluster.is_blindspot && cluster.blindspot_lean && (
            <BlindspotBanner leanMissing={cluster.blindspot_lean} />
          )}

          {/* Coverage stats */}
          <div className="rounded-2xl bg-navy-900 border border-navy-800 p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Coverage</h2>
              <span className="text-xs text-gray-500">
                {cluster.source_count || articles.length} sources · {cluster.article_count} articles
              </span>
            </div>

            <BiasBar
              left={cluster.left_count}
              center={cluster.center_count}
              right={cluster.right_count}
              isBlindspot={cluster.is_blindspot}
              blindspotLean={cluster.blindspot_lean ?? undefined}
              showLabels
            />

            {/* Count breakdown */}
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'Left',   count: cluster.left_count,   color: '#3B82F6', has: cluster.has_left },
                { label: 'Center', count: cluster.center_count, color: '#6B7280', has: cluster.has_center },
                { label: 'Right',  count: cluster.right_count,  color: '#EF4444', has: cluster.has_right },
              ].map(col => (
                <div
                  key={col.label}
                  className="rounded-xl py-3 px-2"
                  style={{ backgroundColor: col.color + '10', border: `1px solid ${col.color}25` }}
                >
                  <p className="text-xl font-bold" style={{ color: col.color }}>{col.count}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">{col.label}</p>
                  {!col.has && cluster.is_blindspot && (
                    <p className="text-[9px] text-gold-400 font-bold mt-0.5">BLINDSPOT</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          {cluster.summary && (
            <div className="rounded-xl bg-navy-900/60 border border-navy-800 p-4">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">AI Summary</h2>
              <p className="text-[15px] text-gray-200 leading-relaxed">{cluster.summary}</p>
            </div>
          )}

          {/* Tabs: Coverage Spectrum */}
          <div>
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4">
              Perspective Breakdown
            </h2>
            <CoverageSpectrum
              summary_left={cluster.summary_left ?? undefined}
              summary_center={cluster.summary_center ?? undefined}
              summary_right={cluster.summary_right ?? undefined}
              leftCount={cluster.left_count}
              centerCount={cluster.center_count}
              rightCount={cluster.right_count}
              isBlindspot={cluster.is_blindspot}
              blindspotLean={cluster.blindspot_lean ?? undefined}
            />
          </div>

          {/* Source list */}
          <div>
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4">
              All Sources ({articles.length})
            </h2>
            <div className="space-y-2">
              {articles.map((article, i) => (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-4 rounded-xl bg-navy-900 border border-navy-800 hover:border-gold-500/30 hover:bg-navy-800/60 transition-all group animate-fade-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {/* Source logo */}
                  <div className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0 border border-navy-700">
                    {article.source?.name?.charAt(0) ?? '?'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-semibold text-gray-300">{article.source?.name}</span>
                      {article.source?.bias_label && (
                        <BiasChip label={article.source.bias_label} compact />
                      )}
                      {article.source?.factuality && (
                        <FactualityBadge factuality={article.source.factuality} compact />
                      )}
                      <span className="text-[10px] text-gray-600 ml-auto">
                        {timeAgo(article.published_at)}
                      </span>
                    </div>
                    <p className="text-sm text-white line-clamp-2 group-hover:text-gold-300 transition-colors">
                      {article.title}
                    </p>
                    {article.summary && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{article.summary}</p>
                    )}
                  </div>

                  {/* External link icon */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700 group-hover:text-gold-500 flex-shrink-0 mt-0.5 transition-colors">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </article>

        {/* ── Sidebar ─────────────────────────────────── */}
        <aside className="space-y-4">
          {/* Related */}
          {related && related.length > 0 && (
            <div className="rounded-xl bg-navy-900 border border-navy-800 overflow-hidden sticky top-[104px]">
              <div className="px-4 py-3 border-b border-navy-800">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Related Stories</h3>
              </div>
              <div className="divide-y divide-navy-800">
                {related.map((r: any) => (
                  <Link
                    key={r.id}
                    href={`/story/${r.id}`}
                    className="block px-4 py-3 hover:bg-navy-800/60 transition-colors group"
                  >
                    <p className="text-xs font-semibold text-white line-clamp-2 group-hover:text-gold-300 transition-colors">
                      {r.headline}
                    </p>
                    <p className="text-[10px] text-gray-600 mt-1">
                      {r.source_count} sources · {timeAgo(r.last_updated_at)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  )
}
