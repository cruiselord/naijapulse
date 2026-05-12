'use client'

import { cn } from '@/lib/utils'

interface CoverageSpectrumProps {
  summary_left?:   string
  summary_center?: string
  summary_right?:  string
  leftCount:       number
  centerCount:     number
  rightCount:      number
  isBlindspot:     boolean
  blindspotLean?:  string
  className?:      string
}

const cols = [
  {
    key:        'left' as const,
    label:      'Left Lean',
    color:      '#3B82F6',
    bgColor:    'rgba(59,130,246,0.06)',
    borderColor:'rgba(59,130,246,0.25)',
    dotColor:   '#3B82F6',
  },
  {
    key:        'center' as const,
    label:      'Center',
    color:      '#9CA3AF',
    bgColor:    'rgba(156,163,175,0.06)',
    borderColor:'rgba(156,163,175,0.2)',
    dotColor:   '#6B7280',
  },
  {
    key:        'right' as const,
    label:      'Right Lean',
    color:      '#EF4444',
    bgColor:    'rgba(239,68,68,0.06)',
    borderColor:'rgba(239,68,68,0.25)',
    dotColor:   '#EF4444',
  },
]

export function CoverageSpectrum({
  summary_left, summary_center, summary_right,
  leftCount, centerCount, rightCount,
  isBlindspot, blindspotLean, className,
}: CoverageSpectrumProps) {
  const countMap = { left: leftCount, center: centerCount, right: rightCount }
  const summaryMap = { left: summary_left, center: summary_center, right: summary_right }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-3', className)}>
      {cols.map((col, i) => {
        const count   = countMap[col.key]
        const summary = summaryMap[col.key]
        const isMissing = isBlindspot && blindspotLean === col.key

        return (
          <div
            key={col.key}
            className="rounded-xl p-4 flex flex-col gap-3 animate-fade-up"
            style={{
              backgroundColor: isMissing ? 'rgba(232,184,0,0.05)' : col.bgColor,
              border: `1px solid ${isMissing ? 'rgba(232,184,0,0.3)' : col.borderColor}`,
              animationDelay: `${i * 0.1}s`,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: col.dotColor }}
                />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: col.color }}>
                  {col.label}
                </span>
              </div>
              <span className="text-xs text-gray-500 font-mono">
                {count} {count === 1 ? 'source' : 'sources'}
              </span>
            </div>

            {/* Content */}
            {isMissing ? (
              <div className="flex flex-col items-center justify-center py-4 gap-2 text-center">
                <span className="text-2xl opacity-40">🕵️</span>
                <p className="text-xs font-semibold text-gold-400">
                  Blindspot — No {col.label} Coverage
                </p>
                <p className="text-[11px] text-gray-500">
                  This perspective is missing from current coverage.
                </p>
              </div>
            ) : summary ? (
              <p className="text-sm text-gray-300 leading-relaxed">{summary}</p>
            ) : count === 0 ? (
              <p className="text-xs text-gray-600 italic">No coverage from this perspective yet.</p>
            ) : (
              <p className="text-xs text-gray-500 italic">Summary generating…</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
