import { describe, it, expect } from 'vitest'
import { detectBlindspot } from '@/lib/blindspot/detector'

describe('detectBlindspot', () => {
  it('detects missing left', () => {
    const r = detectBlindspot({ has_left: false, has_center: true, has_right: true })
    expect(r.is_blindspot).toBe(true)
    expect(r.blindspot_lean).toBe('left')
  })

  it('detects missing right', () => {
    const r = detectBlindspot({ has_left: true, has_center: true, has_right: false })
    expect(r.is_blindspot).toBe(true)
    expect(r.blindspot_lean).toBe('right')
  })

  it('detects missing center', () => {
    const r = detectBlindspot({ has_left: true, has_center: false, has_right: true })
    expect(r.is_blindspot).toBe(true)
    expect(r.blindspot_lean).toBe('center')
  })

  it('no blindspot when all three covered', () => {
    const r = detectBlindspot({ has_left: true, has_center: true, has_right: true })
    expect(r.is_blindspot).toBe(false)
    expect(r.blindspot_lean).toBeNull()
  })

  it('no blindspot when only 1 lean covered (not enough to compare)', () => {
    expect(detectBlindspot({ has_left: false, has_center: true, has_right: false }).is_blindspot).toBe(false)
    expect(detectBlindspot({ has_left: true, has_center: false, has_right: false }).is_blindspot).toBe(false)
  })

  it('no blindspot when nothing covered', () => {
    const r = detectBlindspot({ has_left: false, has_center: false, has_right: false })
    expect(r.is_blindspot).toBe(false)
  })
})
