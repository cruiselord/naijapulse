'use client'

import { useState } from 'react'
import { StoryCard } from '@/components/feed/StoryCard'
import { BlindspotBanner } from '@/components/ui/BlindspotBanner'
import { StoryCardSkeleton } from '@/components/ui/LoadingSkeleton'
import { useStories } from '@/hooks/useStories'
import { useIntersection } from '@/hooks/useIntersection'
import { cn } from '@/lib/utils'

type BlindspotFilter = 'all' | 'left' | 'center' | 'right'

const FILTERS: Array<{ value: BlindspotFilter; label: string; color: string }> = [
  { value: 'all',    label: 'All Blindspots',  color: '#E8B800' },
  { value: 'left',   label: 'Missing Left',    color: '#3B82F6' },
  { value: 'center', label: 'Missing Center',  color: '#6B7280' },
  { value: 'right',  label: 'Missing Right',   color: '#EF4444' },
]

export default function BlindSpotsPage() {
  const [filter, setFilter] = useState<BlindspotFilter>('all')

  const { stories, loading, initialLoad, hasMore, loadMore } = useStories({
    blindspotsOnly: true,
  })

  const filtered = filter === 'all'
    ? stories
    : stories.filter(s => s.blindspot_lean === filter)

  const sentinelRef = useIntersection(loadMore, !loading && hasMore)

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">

      {/* Hero */}
      <section className="py-10 text-center animate-fade-up">
        <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/30">
          <span className="text-xl animate-pulse-gold">🕵️</span>
          <span className="text-xs font-bold text-gold-400 uppercase tracking-widest">Coverage Gaps</span>
        </div>
        <h1 className="font-serif font-black text-4xl sm:text-5xl text-white mb-4">
          News <span className="text-gradient-gold">Blindspots</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto text-[15px] leading-relaxed">
          Stories where one political perspective is entirely absent from current coverage. 
          These gaps can be just as telling as the stories themselves.
        </p>
      </section>

      {/* Explainer */}
      <div className="rounded-2xl bg-navy-900 border border-navy-800 p-6 mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
          <span>💡</span> Why do blindspots matter?
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          When one side of the political spectrum ignores a story, it often means their audience never hears about it. 
          Blindspots reveal what ideological echo chambers look like in practice — not through spin, but through silence. 
          NaijaPulse flags stories when left, center, or right-leaning sources have zero coverage so you know when 
          you're only getting half the picture.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-1 animate-fade-up" style={{ animationDelay: '0.15s' }}>
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
              filter === f.value
                ? 'font-bold shadow-lg text-navy-950'
                : 'text-gray-400 bg-navy-900 border border-navy-800 hover:text-white hover:border-navy-700'
            )}
            style={filter === f.value ? { backgroundColor: f.color, borderColor: f.color } : {}}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {!initialLoad && filtered.length === 0 && (
        <div className="text-center py-20">
          <span className="text-4xl opacity-30 block mb-3">👁️</span>
          <p className="text-gray-500">No blindspot stories found for this filter.</p>
          <p className="text-xs text-gray-700 mt-1">Run enrichment + clustering to detect blindspots.</p>
        </div>
      )}

      {/* Skeleton */}
      {initialLoad && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array(6).fill(0).map((_, i) => <StoryCardSkeleton key={i} />)}
        </div>
      )}

      {/* Feed */}
      {!initialLoad && filtered.length > 0 && (
        <div className="space-y-6">
          {/* Summary banner */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gold-500/5 border border-gold-500/20">
            <span className="text-gold-400 font-bold text-sm">{filtered.length}</span>
            <span className="text-gray-400 text-sm">
              {filter === 'all' ? 'stories with missing perspectives' : `stories missing ${filter} coverage`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((story, i) => (
              <StoryCard key={story.id} story={story} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Infinite scroll */}
      <div ref={sentinelRef} className="h-4 mt-6" />
      {loading && !initialLoad && (
        <div className="flex justify-center py-8 gap-2">
          {[0, 150, 300].map(d => (
            <div key={d} className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-bounce" style={{ animationDelay: `${d}ms` }} />
          ))}
        </div>
      )}
    </main>
  )
}
