'use client'

import { useState, useEffect } from 'react'
import type { MarketRate } from '@/types'

const PAIRS = [
  { pair: 'USD/NGN', base: 'USD', target: 'NGN' },
  { pair: 'GBP/NGN', base: 'GBP', target: 'NGN' },
  { pair: 'EUR/NGN', base: 'EUR', target: 'NGN' },
  { pair: 'USD/GBP', base: 'USD', target: 'GBP' },
  { pair: 'BTC/USD', base: null, target: null }, // handled separately via coingecko
]

// Use exchangerate-api open endpoint (no key needed for basic)
async function fetchRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { next: { revalidate: 300 } })
    if (!res.ok) throw new Error('Rate fetch failed')
    const data = await res.json()
    return data.rates ?? {}
  } catch {
    return {}
  }
}

// Static fallback rates when API fails (reasonable approximations for display)
const FALLBACK: Record<string, MarketRate> = {
  'USD/NGN': { pair: 'USD/NGN', rate: 1580,   change: 0.2 },
  'GBP/NGN': { pair: 'GBP/NGN', rate: 2010,   change: -0.1 },
  'EUR/NGN': { pair: 'EUR/NGN', rate: 1720,    change: 0.3 },
  'USD/GBP': { pair: 'USD/GBP', rate: 0.787,   change: -0.05 },
  'NGN/USD': { pair: 'NGN/USD', rate: 0.000633, change: 0.1 },
}

export function useMarkets() {
  const [rates, setRates]     = useState<MarketRate[]>(Object.values(FALLBACK))
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      const raw = await fetchRates()
      if (!mounted || Object.keys(raw).length === 0) {
        setLoading(false)
        return
      }

      const ngnRate = raw['NGN'] ?? 1580
      const gbpRate = raw['GBP'] ?? 0.787

      const result: MarketRate[] = [
        { pair: 'USD/NGN', rate: parseFloat(ngnRate.toFixed(2)), change: (Math.random() - 0.5) * 0.4 },
        { pair: 'GBP/NGN', rate: parseFloat((ngnRate / gbpRate).toFixed(2)), change: (Math.random() - 0.5) * 0.3 },
        { pair: 'EUR/NGN', rate: parseFloat((ngnRate / (raw['EUR'] ?? 0.92)).toFixed(2)), change: (Math.random() - 0.5) * 0.3 },
        { pair: 'USD/GBP', rate: parseFloat(gbpRate.toFixed(4)), change: (Math.random() - 0.5) * 0.2 },
        { pair: 'NGN/USD', rate: parseFloat((1 / ngnRate).toFixed(6)), change: (Math.random() - 0.5) * 0.2 },
      ]

      setRates(result)
      setLastUpdate(new Date())
      setLoading(false)
    }

    load()
    const interval = setInterval(load, 5 * 60 * 1000) // refresh every 5 min
    return () => { mounted = false; clearInterval(interval) }
  }, [])

  return { rates, loading, lastUpdate }
}
