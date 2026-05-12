import { getCategoryColor, getCategoryLabel } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface CategoryChipProps {
  category:   string
  compact?:   boolean
  className?: string
}

export function CategoryChip({ category, compact = false, className }: CategoryChipProps) {
  const color = getCategoryColor(category)
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold uppercase tracking-widest',
        compact ? 'text-[9px] px-2 py-0.5' : 'text-[10px] px-2.5 py-0.5',
        className
      )}
      style={{ color, backgroundColor: `${color}18`, border: `1px solid ${color}30` }}
    >
      {getCategoryLabel(category)}
    </span>
  )
}
