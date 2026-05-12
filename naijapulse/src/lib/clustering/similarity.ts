export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : dot / denom
}

export function findSimilarArticles(
  targetEmbedding: number[],
  candidates: Array<{ id: string; embedding: number[] }>,
  threshold = 0.82
): string[] {
  return candidates
    .filter(c => cosineSimilarity(targetEmbedding, c.embedding) >= threshold)
    .map(c => c.id)
}
