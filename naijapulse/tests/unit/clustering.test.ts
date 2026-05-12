import { describe, it, expect } from 'vitest'
import { cosineSimilarity, findSimilarArticles } from '@/lib/clustering/similarity'

describe('cosineSimilarity', () => {
  it('returns 1.0 for identical vectors', () => {
    const v = [1, 0.5, 0.3, 0.8]
    expect(cosineSimilarity(v, v)).toBeCloseTo(1.0)
  })

  it('returns 0 for orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0)
  })

  it('returns 0 for mismatched lengths', () => {
    expect(cosineSimilarity([1, 2], [1, 2, 3])).toBe(0)
  })

  it('returns 0 for empty vectors', () => {
    expect(cosineSimilarity([], [])).toBe(0)
  })

  it('handles negative values', () => {
    const result = cosineSimilarity([-1, 0], [1, 0])
    expect(result).toBeCloseTo(-1)
  })

  it('result is bounded between -1 and 1', () => {
    const a = Array.from({ length: 768 }, () => Math.random())
    const b = Array.from({ length: 768 }, () => Math.random())
    const r = cosineSimilarity(a, b)
    expect(r).toBeGreaterThanOrEqual(-1)
    expect(r).toBeLessThanOrEqual(1)
  })
})

describe('findSimilarArticles', () => {
  it('finds articles above threshold', () => {
    const target = [1, 0, 0]
    const candidates = [
      { id: 'a', embedding: [0.99, 0.1, 0] },
      { id: 'b', embedding: [0, 1, 0] },
    ]
    const result = findSimilarArticles(target, candidates, 0.82)
    expect(result).toContain('a')
    expect(result).not.toContain('b')
  })

  it('returns empty when nothing matches', () => {
    expect(
      findSimilarArticles([1, 0], [{ id: 'x', embedding: [0, 1] }], 0.9)
    ).toHaveLength(0)
  })

  it('returns all candidates when threshold is 0', () => {
    const result = findSimilarArticles(
      [1, 0],
      [{ id: 'a', embedding: [0, 1] }, { id: 'b', embedding: [1, 0] }],
      0
    )
    expect(result.length).toBe(2)
  })
})
