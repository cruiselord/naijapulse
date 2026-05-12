import { ollamaChat } from './client';
import type { EnrichmentResult } from '@/types';

const SYSTEM_PROMPT = `You are a news analysis engine for NaijaPulse, a Nigerian news aggregator.
Your job is to analyze articles and return structured JSON only.
Never include markdown, code blocks, preamble, or explanation in your response.
Return ONLY a valid JSON object.`;

export async function enrichArticle(
  title: string,
  content: string,
  sourceName: string
): Promise<EnrichmentResult> {
  const truncatedContent = content.slice(0, 1500);

  const prompt = `Analyze this news article:

Title: "${title}"
Source: ${sourceName}
Content: ${truncatedContent}

Return ONLY this JSON structure (no markdown, no explanation):
{
  "summary": "3-sentence neutral summary of the article",
  "category": "one of: politics|business|economy|security|tech|sports|entertainment|health|environment|diaspora|general",
  "sentiment": "one of: positive|negative|neutral",
  "bias_score": <number from -2.0 (far left framing) to 2.0 (far right framing), 0.0 is neutral>,
  "bias_signals": ["specific word or phrase that indicates bias", "another example"],
  "ng_relevance": <number from 0.0 to 1.0 indicating how relevant this is to Nigeria or Nigerians>,
  "ng_relevance_reason": "one sentence explaining the relevance score"
}`;

  const raw = await ollamaChat(prompt, SYSTEM_PROMPT);
  
  // Strip any accidental markdown if model adds it
  const cleaned = raw.replace(/```json|```/g, '').trim();
  
  try {
    const result = JSON.parse(cleaned) as EnrichmentResult;
    // Validate and clamp
    result.bias_score = Math.max(-2, Math.min(2, result.bias_score || 0));
    result.ng_relevance = Math.max(0, Math.min(1, result.ng_relevance || 0));
    result.bias_signals = result.bias_signals || [];
    return result;
  } catch (e) {
    throw new Error(`Failed to parse enrichment JSON: ${cleaned.slice(0, 200)}`);
  }
}
