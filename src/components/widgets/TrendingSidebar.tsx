'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getFactualityColor, cn } from '@/lib/utils'
import type { Source, StoryCluster } from '@/types'
import { SourceCardSkeleton } from '@/components/ui/LoadingSkeleton'

export function TopSources({ className }: { className?: string }) {
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('sources')
      .select('id, name, domain, bias_label, factuality, factuality_score, logo_url, country')
      .eq('is_active', true)
      .order('factuality_score', { ascending: false })
      .limit(8)
      .then(({ data }) => {
        setSources((data ?? []) as Source[])
        setLoading(false)
      })
  }, [])

  return (
    <div className={cn('rounded-xl bg-navy-900 border border-navy-800 overflow-hidden', className)}>
      <div className="px-4 py-3 border-b border-navy-800 flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest">Top Sources</h3>
        <Link href="/sources" className="text-[10px] text-gold-500 hover:text-gold-400 transition-colors">
          See all →
        </Link>
      </div>
      <div className="divide-y divide-navy-800">
        {loading
          ? Array(5).fill(0).map((_, i) => <SourceCardSkeleton key={i} />)
          : sources.map(source => (
            <Link
              key={source.id}
              href={`/source/${source.domain}`}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-navy-800/60 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-400 overflow-hidden border border-navy-700">
                {source.logo_url
                  ? <img src={source.logo_url} alt={source.name} className="w-full h-full object-cover" />
                  : source.name.charAt(0)
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{source.name}</p>
                <p className="text-[10px]" style={{ color: getFactualityColor(source.factuality) }}>
                  {'★'.repeat(Math.round(source.factuality_score / 20))} {source.factuality}
                </p>
              </div>
            </Link>
          ))
        }
      </div>
    </div>
  )
}

export function TrendingTopics({ className }: { className?: string }) {
  const [topics, setTopics] = useState<StoryCluster[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('story_clusters')
      .select('id, headline, category, source_count, ng_relevance')
      .order('source_count', { ascending: false })
      .limit(6)
      .then(({ data }) => setTopics((data ?? []) as StoryCluster[]))
  }, [])

  return (
    <div className={cn('rounded-xl bg-navy-900 border border-navy-800 overflow-hidden', className)}>
      <div className="px-4 py-3 border-b border-navy-800">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest">🔥 Trending</h3>
      </div>
      <div className="divide-y divide-navy-800">
        {topics.map((t, i) => (
          <Link
            key={t.id}
            href={`/story/${t.id}`}
            className="flex items-start gap-3 px-4 py-3 hover:bg-navy-800/60 transition-colors group"
          >
            <span className="text-[11px] font-mono font-bold text-navy-600 pt-0.5 w-4 flex-shrink-0">
              {String(i + 1).padStart(2, '0')}
            </span>
            <p className="text-[12px] text-gray-300 leading-snug line-clamp-2 group-hover:text-white transition-colors">
              {t.headline}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
