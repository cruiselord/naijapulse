import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/ollama/client', () => ({
  ollamaChat: vi.fn().mockResolvedValue(JSON.stringify({
    summary:            'Nigeria's economy showed growth in Q3. Analysts remain cautious. Key sectors performed well.',
    category:           'economy',
    sentiment:          'neutral',
    bias_score:         0.2,
    bias_signals:       ['allegedly', 'claimed'],
    ng_relevance:       0.95,
    ng_relevance_reason:'Story directly covers Nigerian economic data.',
  })),
}))

import { enrichArticle } from '@/lib/ollama/enrichment'

describe('enrichArticle', () => {
  it('returns valid enrichment result', async () => {
    const r = await enrichArticle('Economy Grows', 'Nigeria GDP rose...', 'BusinessDay')
    expect(r.summary).toBeTruthy()
    expect(r.category).toBe('economy')
    expect(r.sentiment).toBe('neutral')
    expect(r.bias_score).toBeGreaterThanOrEqual(-2)
    expect(r.bias_score).toBeLessThanOrEqual(2)
    expect(r.ng_relevance).toBeGreaterThanOrEqual(0)
    expect(r.ng_relevance).toBeLessThanOrEqual(1)
    expect(Array.isArray(r.bias_signals)).toBe(true)
  })

  it('clamps bias_score to [-2, 2]', async () => {
    const { ollamaChat } = await import('@/lib/ollama/client')
    vi.mocked(ollamaChat).mockResolvedValueOnce(JSON.stringify({
      summary: 'x', category: 'general', sentiment: 'neutral',
      bias_score: 99, bias_signals: [], ng_relevance: 0, ng_relevance_reason: 'x',
    }))
    const r = await enrichArticle('Title', 'Content', 'Source')
    expect(r.bias_score).toBeLessThanOrEqual(2)
  })

  it('clamps ng_relevance to [0, 1]', async () => {
    const { ollamaChat } = await import('@/lib/ollama/client')
    vi.mocked(ollamaChat).mockResolvedValueOnce(JSON.stringify({
      summary: 'x', category: 'general', sentiment: 'neutral',
      bias_score: 0, bias_signals: [], ng_relevance: 5, ng_relevance_reason: 'x',
    }))
    const r = await enrichArticle('Title', 'Content', 'Source')
    expect(r.ng_relevance).toBeLessThanOrEqual(1)
  })

  it('throws on invalid JSON from Ollama', async () => {
    const { ollamaChat } = await import('@/lib/ollama/client')
    vi.mocked(ollamaChat).mockResolvedValueOnce('NOT JSON AT ALL')
    await expect(enrichArticle('T', 'C', 'S')).rejects.toThrow()
  })
})
