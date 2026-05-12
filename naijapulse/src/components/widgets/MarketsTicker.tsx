'use client'

import { useMarkets } from '@/hooks/useMarkets'
import { cn } from '@/lib/utils'

export function MarketsTicker() {
  const { rates, loading, lastUpdate } = useMarkets()

  if (loading && rates.length === 0) {
    return (
      <div className="h-8 bg-navy-900 border-b border-navy-800 flex items-center px-4">
        <div className="h-3 w-48 rounded bg-navy-700 animate-shimmer" />
      </div>
    )
  }

  // Duplicate for seamless loop
  const items = [...rates, ...rates]

  return (
    <div className="h-9 bg-navy-900 border-b border-navy-800 overflow-hidden flex items-center">
      <div className="flex-shrink-0 flex items-center gap-2 px-3 border-r border-navy-700 h-full bg-navy-800">
        <span className="text-gold-500 text-[10px] font-bold uppercase tracking-widest">Markets</span>
      </div>

      <div className="ticker-wrap flex-1 overflow-hidden relative">
        <div className="animate-ticker flex items-center gap-0 whitespace-nowrap">
          {items.map((rate, i) => (
            <span key={i} className="inline-flex items-center gap-2 px-5 border-r border-navy-800 h-9">
              <span className="text-[11px] font-bold text-gray-300 font-mono">{rate.pair}</span>
              <span className="text-[11px] font-mono text-white">
                {rate.pair.includes('NGN') && !rate.pair.startsWith('NGN')
                  ? rate.rate.toLocaleString('en-NG', { maximumFractionDigits: 2 })
                  : rate.rate.toFixed(4)}
              </span>
              <span className={cn(
                'text-[10px] font-mono',
                rate.change >= 0 ? 'text-emerald-400' : 'text-red-400'
              )}>
                {rate.change >= 0 ? '▲' : '▼'} {Math.abs(rate.change).toFixed(2)}%
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="flex-shrink-0 px-3 border-l border-navy-700 h-full flex items-center">
        <span className="text-[9px] text-gray-600 font-mono">
          {lastUpdate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}
