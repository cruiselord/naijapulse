import { getBiasColor, getBiasLabel } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface BiasChipProps {
  label: string
  compact?: boolean
  className?: string
}

export function BiasChip({ label, compact = false, className }: BiasChipProps) {
  const color = getBiasColor(label as any)

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold uppercase tracking-widest',
        compact ? 'text-[9px] px-2 py-0.5' : 'text-[10px] px-2.5 py-0.5',
        className
      )}
      style={{ color, backgroundColor: `${color}18`, border: `1px solid ${color}30` }}
    >
      {getBiasLabel(label as any)}
    </span>
  )
}
