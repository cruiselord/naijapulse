import { getBiasColor, getBiasLabel } from '@/lib/utils'
import type { BiasLabel } from '@/types'
import { cn } from '@/lib/utils'

interface BiasChipProps {
  label:      BiasLabel
  compact?:   boolean
  className?: string
}

export function BiasChip({ label, compact = false, className }: BiasChipProps) {
  const color = getBiasColor(label)
  const text  = getBiasLabel(label)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        compact ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-0.5',
        className
      )}
      style={{
        color,
        borderColor: color + '40',
        backgroundColor: color + '15',
      }}
    >
      <span
        className="rounded-full flex-shrink-0"
        style={{ width: compact ? 5 : 6, height: compact ? 5 : 6, backgroundColor: color }}
      />
      {text}
    </span>
  )
}
