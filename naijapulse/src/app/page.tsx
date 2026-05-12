'use client'

import { useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { StoryCard } from '@/components/feed/StoryCard'
import { CategoryFilter } from '@/components/feed/CategoryFilter'
import { BreakingNewsSlider } from '@/components/widgets/BreakingNewsSlider'
import { TopSources, TrendingTopics } from '@/components/widgets/TrendingSidebar'
import { WorldClock } from '@/components/widgets/WorldClock'
import { NigerianLens } from '@/components/ui/NigerianLens'
import { StoryCardSkeleton } from '@/components/ui/LoadingSkeleton'
import { useStories } from '@/hooks/useStories'
import { useIntersection } from '@/hooks/useIntersection'
import type { Category } from '@/types'

export default function HomePage() {
  const searchParams = useSearchParams()
  const initialCat   = (searchParams.get('cat') as Category) ?? 'all'

  const [category,      setCategory]      = useState<Category | 'all'>(initialCat)
  const [ngRelevance,   setNgRelevance]   = useState(0)

  const { stories, loading, initialLoad, hasMore, error, loadMore } = useStories({
    category,
    ngRelevanceMin: ngRelevance,
  })

  const sentinelRef = useIntersection(loadMore, !loading && hasMore)

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">

      {/* ── Hero / Breaking slider ───────────────────────── */}
      <section className="py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <BreakingNewsSlider />
          </div>
          <div className="hidden lg:block">
            <WorldClock />
          </div>
        </div>
      </section>

      {/* ── Hero headline (Ground News style) ───────────── */}
      <section className="py-4 border-y border-navy-800">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-white leading-tight">
              See Every Side of <span className="text-gradient-gold">Every Story</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Covering Nigerian and global news across the political spectrum
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-bias-left" /> Left
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-bias-center" /> Center
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-bias-right" /> Right
            </span>
          </div>
        </div>
      </section>

      {/* ── Main content + sidebar ───────────────────────── */}
      <div className="flex gap-6 mt-6">

        {/* ── Feed ──────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Category filter */}
          <div className="sticky top-[92px] z-30 py-3 bg-navy-950/95 backdrop-blur-sm -mx-1 px-1 border-b border-navy-900 mb-5">
            <CategoryFilter active={category} onChange={setCategory} />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-red-950/30 border border-red-800/50 p-4 mb-6 text-sm text-red-400">
              {error} — check your Supabase connection.
            </div>
          )}

          {/* Empty state */}
          {!initialLoad && !loading && stories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <span className="text-5xl opacity-30">📰</span>
              <p className="text-gray-500">No stories yet. Run the ingestion pipeline to get started.</p>
              <code className="text-xs text-gold-600 bg-navy-900 px-3 py-1.5 rounded font-mono">
                pnpm ingest
              </code>
            </div>
          )}

          {/* Skeleton on initial load */}
          {initialLoad && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array(8).fill(0).map((_, i) => <StoryCardSkeleton key={i} />)}
            </div>
          )}

          {/* Story grid */}
          {!initialLoad && stories.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stories.map((story, i) => (
                <StoryCard key={story.id} story={story} index={i % 20} />
              ))}
            </div>
          )}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-4 mt-6" />

          {/* Loading more indicator */}
          {loading && !initialLoad && (
            <div className="flex justify-center py-8 gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}

          {/* End of feed */}
          {!hasMore && stories.length > 0 && (
            <p className="text-center text-xs text-gray-700 py-8 font-mono">
              — End of feed · {stories.length} stories loaded —
            </p>
          )}
        </div>

        {/* ── Sidebar ───────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col gap-4 w-72 flex-shrink-0">
          {/* Nigerian Lens */}
          <div className="rounded-xl bg-navy-900 border border-navy-800 p-4">
            <NigerianLens value={ngRelevance} onChange={setNgRelevance} />
          </div>

          <TrendingTopics />
          <TopSources />
        </aside>
      </div>
    </main>
  )
}
