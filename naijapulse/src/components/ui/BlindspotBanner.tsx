'use client'

import { cn } from '@/lib/utils'

interface BlindspotBannerProps {
  leanMissing: 'left' | 'center' | 'right'
  storyTitle?: string
  compact?:    boolean
  className?:  string
}

const LEAN_LABELS = {
  left:   'Left-leaning',
  center: 'Center',
  right:  'Right-leaning',
}

export function BlindspotBanner({
  leanMissing, storyTitle, compact = false, className
}: BlindspotBannerProps) {
  return (
    <div
      className={cn(
        'animate-slide-down w-full flex items-center gap-3 rounded-lg',
        compact
          ? 'px-3 py-1.5 text-xs'
          : 'px-4 py-3 text-sm',
        className
      )}
      style={{ backgroundColor: '#E8B800', color: '#050D1A' }}
      role="alert"
    >
      {/* Pulsing eye icon */}
      <span
        className="flex-shrink-0 text-lg animate-pulse-gold"
        style={{ display: 'inline-block' }}
        aria-hidden
      >
        🕵️
      </span>

      <div className="flex-1 min-w-0">
        <span className="font-bold uppercase tracking-wide">
          Blindspot Alert
        </span>
        <span className="mx-1.5">—</span>
        <span className="font-medium">
          {LEAN_LABELS[leanMissing]} media is not covering this story
        </span>
        {storyTitle && !compact && (
          <span className="block text-[11px] mt-0.5 opacity-70 truncate">
            {storyTitle}
          </span>
        )}
      </div>

      {!compact && (
        <a
          href="/blindspots"
          className="flex-shrink-0 text-[11px] font-bold underline underline-offset-2 hover:opacity-80 transition-opacity"
        >
          See all blindspots →
        </a>
      )}
    </div>
  )
}
