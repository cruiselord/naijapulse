'use client'

import { useEffect, useRef } from 'react'

export function useIntersection(callback: () => void, enabled = true) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled || !ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) callback() },
      { threshold: 0.1, rootMargin: '100px' }
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [callback, enabled])

  return ref
}
