'use client'

import { useWorldTime } from '@/hooks/useWorldTime'
import { cn } from '@/lib/utils'

export function WorldClock({ className }: { className?: string }) {
  const cities = useWorldTime()

  return (
    <div className={cn('rounded-xl bg-navy-900 border border-navy-800 overflow-hidden', className)}>
      <div className="px-4 py-3 border-b border-navy-800 flex items-center gap-2">
        <span className="text-sm">🕐</span>
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest">World Time</h3>
      </div>
      <div className="divide-y divide-navy-800">
        {cities.map(city => (
          <div key={city.city} className="flex items-center justify-between px-4 py-2.5 hover:bg-navy-800/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-base">{city.flag}</span>
              <div>
                <p className="text-xs font-semibold text-white">{city.city}</p>
                <p className="text-[10px] text-gray-600">{city.date}</p>
              </div>
            </div>
            <span className="text-sm font-mono font-bold text-gold-400">{city.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
