import { describe, it, expect, vi } from 'vitest';

// Mock the ollama client
vi.mock('@/lib/ollama/client', () => ({
  ollamaChat: vi.fn().mockResolvedValue(JSON.stringify({
    summary: 'Test summary sentence one. Sentence two. Sentence three.',
    category: 'politics',
    sentiment: 'neutral',
    bias_score: 0.3,
    bias_signals: ['allegedly'],
    ng_relevance: 0.9,
    ng_relevance_reason: 'Story involves Nigerian government policy.'
  }))
}));

import { enrichArticle } from '@/lib/ollama/enrichment';

describe('enrichArticle', () => {
  it('returns valid enrichment result', async () => {
    const result = await enrichArticle('Test Headline', 'Test content here.', 'Punch Nigeria');
    expect(result.summary).toBeTruthy();
    expect(result.category).toBe('politics');
    expect(result.bias_score).toBeGreaterThanOrEqual(-2);
    expect(result.bias_score).toBeLessThanOrEqual(2);
    expect(result.ng_relevance).toBeGreaterThanOrEqual(0);
    expect(result.ng_relevance).toBeLessThanOrEqual(1);
    expect(Array.isArray(result.bias_signals)).toBe(true);
  });

  it('clamps bias_score to [-2, 2] range', async () => {
    const { ollamaChat } = await import('@/lib/ollama/client');
    vi.mocked(ollamaChat).mockResolvedValueOnce(JSON.stringify({
      summary: 'x', category: 'general', sentiment: 'neutral',
      bias_score: 99, bias_signals: [], ng_relevance: 0, ng_relevance_reason: 'x'
    }));
    const result = await enrichArticle('Title', 'Content', 'Source');
    expect(result.bias_score).toBeLessThanOrEqual(2);
  });
});
