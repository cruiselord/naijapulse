import { describe, it, expect } from 'vitest'
import { hashUrl } from '@/lib/ingestion/rss'

describe('hashUrl', () => {
  it('returns consistent hash for same url', () => {
    const url = 'https://punchng.com/article/nigerian-economy-2024'
    expect(hashUrl(url)).toBe(hashUrl(url))
  })

  it('different urls produce different hashes', () => {
    expect(hashUrl('https://a.com/1')).not.toBe(hashUrl('https://a.com/2'))
  })

  it('returns 64-char hex string (SHA-256)', () => {
    expect(hashUrl('https://test.com/article')).toMatch(/^[a-f0-9]{64}$/)
  })

  it('handles empty string', () => {
    expect(hashUrl('')).toMatch(/^[a-f0-9]{64}$/)
  })
})
