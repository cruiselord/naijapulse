'use client'

import { cn } from '@/lib/utils'

interface NigerianLensProps {
  value:     number
  onChange:  (val: number) => void
  className?: string
}

export function NigerianLens({ value, onChange, className }: NigerianLensProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-label="Nigeria flag">🇳🇬</span>
          <span className="text-sm font-semibold text-white">Nigerian Lens</span>
        </div>
        <span className="text-sm font-bold text-gold-400">{value}%</span>
      </div>

      <div className="relative w-full">
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full h-2 rounded-full bg-navy-700 appearance-none cursor-pointer accent-gold-500"
        />
        <div className="absolute inset-x-0 top-1/2 h-1 bg-gold-500 rounded-full pointer-events-none" style={{ width: `${value}%` }} />
      </div>

      <div className="flex justify-between mt-1.5 text-[10px] text-gray-600">
        <span>All news</span>
        <span>Nigeria only</span>
      </div>

      {value > 0 && (
        <p className="mt-2 text-[11px] text-gray-500">
          Showing stories with ≥{value}% Nigeria relevance
        </p>
      )}
    </div>
  )
}
