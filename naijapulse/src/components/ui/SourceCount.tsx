import { cn } from '@/lib/utils'

interface SourceCountProps {
  count:     number
  sources?:  string[]
  className?: string
}

export function SourceCount({ count, sources, className }: SourceCountProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs text-gray-400 font-medium',
        className
      )}
      title={sources ? sources.join(', ') : undefined}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M4 6h16M4 10h16M4 14h8"/>
        <circle cx="17" cy="17" r="3"/>
        <path d="m21 21-1.5-1.5"/>
      </svg>
      {count} {count === 1 ? 'source' : 'sources'}
    </span>
  )
}
