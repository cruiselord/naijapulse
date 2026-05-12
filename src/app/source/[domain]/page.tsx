import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import { timeAgo, getBiasColor, getBiasLabel } from '@/lib/utils'
import { BiasBar } from '@/components/ui/BiasBar'
import { BiasChip } from '@/components/ui/BiasChip'
import { FactualityBadge } from '@/components/ui/FactualityBadge'
import type { Source } from '@/types'

interface Props { params: { domain: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: decodeURIComponent(params.domain) }
}

export default async function SourcePage({ params }: Props) {
  const domain   = decodeURIComponent(params.domain)
  const supabase = await createServiceClient()

  const { data: source, error } = await supabase
    .from('sources')
    .select('*')
    .eq('domain', domain)
    .single()

  if (error || !source) notFound()

  const src = source as Source

  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, url, published_at, summary, bias_score, sentiment, ng_relevance, category')
    .eq('source_id', src.id)
    .order('published_at', { ascending: false })
    .limit(15)

  const { count: totalArticles } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('source_id', src.id)

  const biasColor = getBiasColor(src.bias_label)

  const lean = src.bias_score < -0.5 ? { left: 1, center: 0, right: 0 }
             : src.bias_score > 0.5  ? { left: 0, center: 0, right: 1 }
             : { left: 0, center: 1, right: 0 }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
      <nav className="flex items-center gap-2 py-4 text-xs text-gray-600">
        <Link href="/" className="hover:text-gold-400 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/sources" className="hover:text-gold-400 transition-colors">Sources</Link>
        <span>/</span>
        <span className="text-gray-400">{src.name}</span>
      </nav>

      <div className="rounded-2xl bg-navy-900 border border-navy-800 p-6 mb-8 animate-fade-up">
        <div className="flex items-start gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white border border-navy-700 flex-shrink-0"
            style={{ backgroundColor: biasColor + '20' }}
          >
            {src.logo_url
              ? <img src={src.logo_url} alt={src.name} className="w-full h-full object-cover rounded-2xl" />
              : src.name.charAt(0)
            }
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="font-serif font-bold text-2xl text-white">{src.name}</h1>
                <a
                  href={`https://${src.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-gold-400 transition-colors"
                >
                  {src.domain} ↗
                </a>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {src.mbfc_rated && (
                  <span className="px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    MBFC Rated
                  </span>
                )}
                {src.ai_rated && !src.mbfc_rated && (
                  <span className="px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                    AI Rated
                  </span>
                )}
                <span className="text-lg" title={src.country}>{src.country === 'NG' ? '🇳🇬' : src.country === 'GB' ? '🇬🇧' : src.country === 'US' ? '🇺🇸' : '🌐'}</span>
              </div>
            </div>

            {src.description && (
              <p className="text-sm text-gray-400 mt-2 leading-relaxed">{src.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-xl bg-navy-900 border border-navy-800 p-5 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Political Bias</h2>
          <div className="flex items-center gap-3 mb-4">
            <BiasChip label={src.bias_label} />
            <span className="text-xs text-gray-500 font-mono">Score: {src.bias_score.toFixed(2)}</span>
          </div>
          <BiasBar left={lean.left} center={lean.center} right={lean.right} showLabels />
          <p className="text-[11px] text-gray-600 mt-3">
            Source-level rating from {src.mbfc_rated ? 'Media Bias/Fact Check' : 'NaijaPulse AI analysis'}.
          </p>
        </div>

        <div className="rounded-xl bg-navy-900 border border-navy-800 p-5 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Factuality</h2>
          <FactualityBadge factuality={src.factuality} factualityScore={src.factuality_score} />

          <div className="mt-4 flex flex-col gap-2">
            {[
              { label: 'Articles Indexed', value: totalArticles ?? 0 },
              { label: 'Region', value: src.region },
              { label: 'Country', value: src.country },
            ].map(row => (
              <div key={row.label} className="flex justify-between text-xs">
                <span className="text-gray-600">{row.label}</span>
                <span className="text-gray-300 font-medium capitalize">{String(row.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4">Recent Articles ({articles?.length ?? 0})</h2>
        <div className="space-y-2">
          {(articles ?? []).map((article: any, i: number) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-4 rounded-xl bg-navy-900 border border-navy-800 hover:border-gold-500/30 hover:bg-navy-800/50 transition-all group animate-fade-up"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {article.category && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gold-500/70">{article.category}</span>
                  )}
                  <span className="text-[10px] text-gray-600 ml-auto">{timeAgo(article.published_at)}</span>
                </div>
                <p className="text-sm text-white leading-snug line-clamp-2 group-hover:text-gold-300 transition-colors">{article.title}</p>
                {article.summary && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{article.summary}</p>
                )}
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700 group-hover:text-gold-500 flex-shrink-0 mt-1 transition-colors">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          ))}
        </div>
      </div>
    </main>
  )
}
