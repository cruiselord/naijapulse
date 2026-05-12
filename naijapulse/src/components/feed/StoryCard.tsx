'use client'

import Link from 'next/link'
import Image from 'next/image'
import { timeAgo, cn } from '@/lib/utils'
import { BiasBar } from '@/components/ui/BiasBar'
import { CategoryChip } from '@/components/ui/CategoryChip'
import { SourceCount } from '@/components/ui/SourceCount'
import type { StoryCluster } from '@/types'

interface StoryCardProps {
  story:      StoryCluster
  index?:     number
  className?: string
}

export function StoryCard({ story, index = 0, className }: StoryCardProps) {
  const imageUrl = story.articles?.[0]?.image_url
  const delay    = `${index * 60}ms`

  return (
    <Link
      href={`/story/${story.id}`}
      className={cn(
        'story-card group block rounded-2xl bg-navy-900 border border-navy-800',
        'overflow-hidden animate-fade-up',
        className
      )}
      style={{ animationDelay: delay }}
      data-testid="story-card"
    >
      {/* Image */}
      {imageUrl && (
        <div className="relative w-full h-44 overflow-hidden bg-navy-800">
          <Image
            src={imageUrl}
            alt={story.headline}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            onError={() => {}}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-transparent to-transparent" />
        </div>
      )}

      <div className="p-5 flex flex-col gap-3">
        {/* Top row: category + blindspot badge */}
        <div className="flex items-center gap-2 flex-wrap">
          {story.category && (
            <CategoryChip category={story.category} />
          )}
          {story.is_blindspot && story.blindspot_lean && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-[10px] font-bold text-gold-400 uppercase tracking-widest animate-pulse-gold">
              🚨 Blindspot — No {story.blindspot_lean}
            </span>
          )}
          {story.ng_relevance >= 0.7 && (
            <span className="text-sm" title="High Nigerian relevance">🇳🇬</span>
          )}
        </div>

        {/* Headline */}
        <h3 className="font-serif font-bold text-white leading-snug line-clamp-3 text-[17px] group-hover:text-gold-300 transition-colors duration-200">
          {story.headline}
        </h3>

        {/* Summary */}
        {story.summary && (
          <p className="text-[13px] text-gray-400 leading-relaxed line-clamp-2">
            {story.summary}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 text-gray-500">
          <SourceCount count={story.source_count || story.article_count} />
          <span className="text-gray-700">·</span>
          <span className="text-xs">{timeAgo(story.last_updated_at)}</span>
        </div>

        {/* Bias bar + factuality */}
        <div className="pt-1 border-t border-navy-800">
          <BiasBar
            left={story.left_count}
            center={story.center_count}
            right={story.right_count}
            isBlindspot={story.is_blindspot}
            blindspotLean={story.blindspot_lean ?? undefined}
            compact
          />
        </div>
      </div>
    </Link>
  )
}
