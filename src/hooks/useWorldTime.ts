'use client'

import { useState, useEffect } from 'react'

export interface CityTimeData {
  city:     string
  timezone: string
  flag:     string
  time:     string
  date:     string
}

const CITIES: Array<{ city: string; timezone: string; flag: string }> = [
  { city: 'Lagos',   timezone: 'Africa/Lagos',     flag: '🇳🇬' },
  { city: 'London',  timezone: 'Europe/London',     flag: '🇬🇧' },
  { city: 'New York',timezone: 'America/New_York',  flag: '🇺🇸' },
  { city: 'Dubai',   timezone: 'Asia/Dubai',         flag: '🇦🇪' },
  { city: 'Nairobi', timezone: 'Africa/Nairobi',    flag: '🇰🇪' },
  { city: 'Accra',   timezone: 'Africa/Accra',      flag: '🇬🇭' },
]

function formatCityTime(timezone: string): { time: string; date: string } {
  const now = new Date()
  const time = now.toLocaleTimeString('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const date = now.toLocaleDateString('en-US', {
    timeZone: timezone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  return { time, date }
}

export function useWorldTime() {
  const [cities, setCities] = useState<CityTimeData[]>(() =>
    CITIES.map(c => ({ ...c, ...formatCityTime(c.timezone) }))
  )

  useEffect(() => {
    const tick = () => {
      setCities(CITIES.map(c => ({ ...c, ...formatCityTime(c.timezone) })))
    }

    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  return cities
}
