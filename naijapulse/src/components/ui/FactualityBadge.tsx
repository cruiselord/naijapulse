import { getFactualityColor, getFactualityStars } from '@/lib/utils'
import type { FactualityLabel } from '@/types'
import { cn } from '@/lib/utils'

interface FactualityBadgeProps {
  factuality:      FactualityLabel
  factualityScore?: number
  compact?:        boolean
  className?:      string
}

const LABELS: Record<FactualityLabel, string> = {
  'very-high': 'Very High',
  'high':      'High',
  'mixed':     'Mixed',
  'low':       'Low',
  'very-low':  'Very Low',
}

export function FactualityBadge({
  factuality, factualityScore, compact = false, className
}: FactualityBadgeProps) {
  const color = getFactualityColor(factuality)
  const stars = getFactualityStars(factuality)

  if (compact) {
    return (
      <span
        className={cn('inline-flex items-center gap-0.5 text-[9px] font-semibold', className)}
        style={{ color }}
        title={`Factuality: ${LABELS[factuality]}${factualityScore ? ` (${factualityScore}/100)` : ''}`}
      >
        {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
      </span>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-medium',
        className
      )}
      style={{ color, borderColor: color + '30', backgroundColor: color + '10' }}
      title={`Factuality: ${LABELS[factuality]}${factualityScore ? ` (${factualityScore}/100)` : ''}`}
    >
      <span>{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
      <span>{LABELS[factuality]}</span>
      {factualityScore !== undefined && (
        <span className="text-gray-500 text-[10px]">({factualityScore}%)</span>
      )}
    </div>
  )
}
