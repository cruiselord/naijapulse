'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { timeAgo, cn } from '@/lib/utils'
import type { StoryCluster } from '@/types'

export function BreakingNewsSlider() {
  const [stories, setStories]   = useState<StoryCluster[]>([])
  const [active, setActive]     = useState(0)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('story_clusters')
        .select('id, headline, summary, category, article_count, source_count, is_blindspot, ng_relevance, last_updated_at, articles(image_url)')
        .order('last_updated_at', { ascending: false })
        .limit(6)

      setStories((data ?? []) as StoryCluster[])
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (stories.length <= 1) return
    const t = setInterval(() => setActive(a => (a + 1) % stories.length), 5000)
    return () => clearInterval(t)
  }, [stories.length])

  if (loading) {
    return (
      <div className="w-full h-72 rounded-2xl bg-navy-900 border border-navy-800 animate-shimmer" />
    )
  }

  if (stories.length === 0) return null

  const current = stories[active]
  const imageUrl = current.articles?.[0]?.image_url

  return (
    <div className="relative w-full h-72 rounded-2xl overflow-hidden bg-navy-900 border border-navy-800 group">
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <span className="breaking-stripe px-3 py-1 text-[10px] font-black text-navy-950 uppercase tracking-widest rounded-full">
          🔴 Breaking
        </span>
      </div>

      {imageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-900/30" />

      <Link href={`/story/${current.id}`} className="absolute inset-0 z-10 flex flex-col justify-end p-6">
        <p className="text-[10px] font-bold text-gold-400 uppercase tracking-widest mb-2">
          {current.category} · {timeAgo(current.last_updated_at)} · {current.source_count} sources
        </p>
        <h2 className="font-serif font-bold text-white text-xl leading-snug line-clamp-3 group-hover:text-gold-300 transition-colors">
          {current.headline}
        </h2>
      </Link>

      <div className="absolute bottom-4 right-4 z-20 flex gap-1.5">
        {stories.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              'rounded-full transition-all duration-300',
              i === active ? 'bg-gold-500 w-5 h-1.5' : 'bg-white/30 hover:bg-white/60 w-1.5 h-1.5'
            )}
            aria-label={`Go to story ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
