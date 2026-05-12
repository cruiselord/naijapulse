import { ollamaChat } from './client'
import type { EnrichmentResult } from '@/types'

const SYSTEM = `You are a news analysis engine for NaijaPulse, a Nigerian bias-aware news aggregator.
Return ONLY valid JSON. No markdown fences, no explanation, no preamble. Just the JSON object.`

export async function enrichArticle(
  title: string, content: string, sourceName: string
): Promise<EnrichmentResult> {
  const prompt = `Analyze this article:

Title: "${title}"
Source: ${sourceName}
Content (first 1500 chars): ${content.slice(0, 1500)}

Return ONLY this JSON:
{
  "summary": "3-sentence neutral summary",
  "category": "one of: politics|business|economy|security|tech|sports|entertainment|health|environment|diaspora|general",
  "sentiment": "positive|negative|neutral",
  "bias_score": <-2.0 to 2.0, negative=left framing, positive=right framing, 0=neutral>,
  "bias_signals": ["loaded word or phrase", "another example"],
  "ng_relevance": <0.0 to 1.0, how relevant to Nigeria or Nigerians>,
  "ng_relevance_reason": "one sentence"
}`

  const raw     = await ollamaChat(prompt, SYSTEM)
  const cleaned = raw.replace(/```json|```/g, '').trim()

  try {
    const result = JSON.parse(cleaned) as EnrichmentResult
    result.bias_score   = Math.max(-2, Math.min(2, result.bias_score   ?? 0))
    result.ng_relevance = Math.max(0,  Math.min(1, result.ng_relevance ?? 0))
    result.bias_signals = result.bias_signals ?? []
    return result
  } catch {
    throw new Error(`JSON parse failed. Raw: ${cleaned.slice(0, 200)}`)
  }
}
