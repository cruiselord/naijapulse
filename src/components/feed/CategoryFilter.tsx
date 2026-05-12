'use client'

import { cn } from '@/lib/utils'
import type { Category } from '@/types'

const CATEGORIES: Array<{ value: Category | 'all'; label: string }> = [
  { value: 'all',           label: 'All' },
  { value: 'politics',      label: 'Politics' },
  { value: 'business',      label: 'Business' },
  { value: 'economy',       label: 'Economy' },
  { value: 'security',      label: 'Security' },
  { value: 'tech',          label: 'Tech' },
  { value: 'sports',        label: 'Sports' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'health',        label: 'Health' },
  { value: 'diaspora',      label: 'Diaspora' },
]

interface CategoryFilterProps {
  active:   Category | 'all'
  onChange: (cat: Category | 'all') => void
}

export function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <div className="relative">
      <div
        className="flex gap-1 overflow-x-auto scrollbar-hide pb-px"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        role="tablist"
        aria-label="News categories"
      >
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            role="tab"
            aria-selected={active === cat.value}
            onClick={() => onChange(cat.value)}
            className={cn(
              'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap',
              active === cat.value
                ? 'bg-gold-500 text-navy-950 font-bold shadow-gold'
                : 'text-gray-400 hover:text-white hover:bg-navy-800'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-navy-950 to-transparent pointer-events-none" />
    </div>
  )
}
