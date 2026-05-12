import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow } from 'date-fns'
import type { BiasLabel, FactualityLabel, Category } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function getBiasColor(label: BiasLabel): string {
  const map: Record<BiasLabel, string> = {
    'far-left':     '#1D4ED8',
    'left':         '#3B82F6',
    'center-left':  '#60A5FA',
    'center':       '#6B7280',
    'center-right': '#F97316',
    'right':        '#EF4444',
    'far-right':    '#991B1B',
    'unknown':      '#4B5563',
  }
  return map[label] ?? '#4B5563'
}

export function getBiasLabel(label: BiasLabel): string {
  const map: Record<BiasLabel, string> = {
    'far-left':     'Far Left',
    'left':         'Left',
    'center-left':  'Center Left',
    'center':       'Center',
    'center-right': 'Center Right',
    'right':        'Right',
    'far-right':    'Far Right',
    'unknown':      'Unknown',
  }
  return map[label] ?? 'Unknown'
}

export function getBiasLean(label: BiasLabel): 'left' | 'center' | 'right' {
  if (['far-left', 'left', 'center-left'].includes(label)) return 'left'
  if (['center-right', 'right', 'far-right'].includes(label)) return 'right'
  return 'center'
}

export function getFactualityColor(label: FactualityLabel): string {
  const map: Record<FactualityLabel, string> = {
    'very-high': '#10B981',
    'high':      '#34D399',
    'mixed':     '#F59E0B',
    'low':       '#EF4444',
    'very-low':  '#7F1D1D',
  }
  return map[label] ?? '#6B7280'
}

export function getFactualityStars(label: FactualityLabel): number {
  const map: Record<FactualityLabel, number> = {
    'very-high': 5, 'high': 4, 'mixed': 3, 'low': 2, 'very-low': 1,
  }
  return map[label] ?? 0
}

export function getCategoryColor(cat: Category | string): string {
  const map: Record<string, string> = {
    politics:      '#8B5CF6',
    business:      '#3B82F6',
    economy:       '#10B981',
    security:      '#EF4444',
    tech:          '#06B6D4',
    sports:        '#F59E0B',
    entertainment: '#EC4899',
    health:        '#84CC16',
    environment:   '#14B8A6',
    diaspora:      '#E8B800',
    general:       '#6B7280',
  }
  return map[cat] ?? '#6B7280'
}

export function getCategoryLabel(cat: string): string {
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

export function formatNgRelevance(score: number): string {
  if (score >= 0.8) return 'High NG Relevance'
  if (score >= 0.5) return 'Medium NG Relevance'
  return 'Low NG Relevance'
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + '…' : str
}
