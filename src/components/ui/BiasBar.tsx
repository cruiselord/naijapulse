'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface BiasBarProps {
  left:          number
  center:        number
  right:         number
  isBlindspot?:  boolean
  blindspotLean?: 'left' | 'center' | 'right'
  compact?:      boolean
  showLabels?:   boolean
  className?:    string
}

interface TooltipState {
  visible: boolean
  x: number
  label: string
  count: number
  pct: number
}

export function BiasBar({
  left, center, right,
  isBlindspot, blindspotLean,
  compact = false,
  showLabels = false,
  className,
}: BiasBarProps) {
  const total = left + center + right || 1
  const pctLeft   = Math.round((left   / total) * 100)
  const pctCenter = Math.round((center / total) * 100)
  const pctRight  = Math.round((right  / total) * 100)

  const [animated, setAnimated] = useState(false)
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, label: '', count: 0, pct: 0 })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimated(true) },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const height = compact ? 'h-1.5' : 'h-2.5'

  const segments = [
    { key: 'left',   pct: pctLeft,   count: left,   color: 'bg-bias-left',   label: 'Left',   rounded: 'rounded-l-full' },
    { key: 'center', pct: pctCenter, count: center, color: 'bg-bias-center', label: 'Center', rounded: '' },
    { key: 'right',  pct: pctRight,  count: right,  color: 'bg-bias-right',  label: 'Right',  rounded: 'rounded-r-full' },
  ]

  return (
    <div className={cn('w-full', className)}>
      {showLabels && (
        <div className="flex justify-between mb-1 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
          <span className="text-bias-left">Left</span>
          <span className="text-bias-center">Center</span>
          <span className="text-bias-right">Right</span>
        </div>
      )}

      <div
        ref={ref}
        className={cn('relative flex w-full overflow-hidden rounded-full', height, 'bg-navy-800 gap-px')}
        data-bias-bar
      >
        {segments.map((seg, i) => (
          <div
            key={seg.key}
            className={cn(seg.color, seg.rounded, 'relative cursor-pointer transition-opacity hover:opacity-80')}
            style={{
              width: animated ? `${seg.pct}%` : '0%',
              transition: `width 0.6s cubic-bezier(0.4,0,0.2,1) ${i * 0.1}s`,
              minWidth: seg.count > 0 ? '2px' : '0',
            }}
            onMouseEnter={(e) => {
              setTooltip({ visible: true, x: e.clientX, label: seg.label, count: seg.count, pct: seg.pct })
            }}
            onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}
          />
        ))}

        {isBlindspot && blindspotLean && (
          <div
            className="absolute inset-0 flex items-center justify-end pr-1 pointer-events-none"
            style={{ left: blindspotLean === 'right' ? '66%' : blindspotLean === 'left' ? '0' : '33%', width: '33%' }}
          >
            <div className="w-full h-full bg-gold-500/20 border-l border-r border-gold-500/40" />
          </div>
        )}
      </div>

      {!compact && (
        <div className="flex justify-between mt-1 text-[10px] text-gray-500 font-mono">
          <span className="text-bias-left">{left}L</span>
          <span className="text-bias-center">{center}C</span>
          <span className="text-bias-right">{right}R</span>
        </div>
      )}

      {isBlindspot && blindspotLean && !compact && (
        <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/30 animate-pulse-gold">
          <span className="text-[9px] font-bold text-gold-400 uppercase tracking-widest">
            ⚠ Blindspot — No {blindspotLean} coverage
          </span>
        </div>
      )}

      {tooltip.visible && (
        <div
          className="fixed z-50 pointer-events-none px-2.5 py-1.5 rounded-lg bg-navy-800 border border-navy-600 shadow-xl text-xs text-white"
          style={{ top: -40, left: tooltip.x }}
        >
          <span className="font-semibold">{tooltip.label}</span>: {tooltip.count} articles ({tooltip.pct}%)
        </div>
      )}
    </div>
  )
}
