import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cosineSimilarity } from '@/lib/clustering/similarity'
import { detectBlindspot } from '@/lib/blindspot/detector'

export const maxDuration = 120

const SIMILARITY_THRESHOLD = parseFloat(process.env.CLUSTER_SIMILARITY_THRESHOLD ?? '0.82')
const WINDOW_HOURS          = parseInt(process.env.CLUSTER_WINDOW_HOURS ?? '48')

export async function POST(_req: NextRequest) {
  const supabase  = await createServiceClient()
  const windowCutoff = new Date(Date.now() - WINDOW_HOURS * 60 * 60 * 1000).toISOString()

  // Fetch enriched articles with embeddings from window
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, embedding, source_id, source:sources(bias_label)')
    .eq('status', 'enriched')
    .gte('enriched_at', windowCutoff)
    .is('cluster_id', null) // only unclustered

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const items = (articles ?? []) as any[]
  const validItems = items.filter(a => a.embedding)

  let clusters_created = 0
  let clusters_updated = 0
  let articles_clustered = 0

  const clustered = new Set<string>()

  for (let i = 0; i < validItems.length; i++) {
    const article = validItems[i]
    if (clustered.has(article.id)) continue

    const embA = parseEmbedding(article.embedding)
    const group = [article]

    for (let j = i + 1; j < validItems.length; j++) {
      const candidate = validItems[j]
      if (clustered.has(candidate.id)) continue

      const embB = parseEmbedding(candidate.embedding)
      if (cosineSimilarity(embA, embB) >= SIMILARITY_THRESHOLD) {
        group.push(candidate)
      }
    }

    if (group.length < 2) continue // single article, skip

    // Count bias distribution
    const biasMap = { left: 0, center: 0, right: 0 }
    for (const a of group) {
      const lean = getBiasLean(a.source?.bias_label ?? 'unknown')
      biasMap[lean]++
    }

    const blindspot = detectBlindspot({
      has_left:   biasMap.left > 0,
      has_center: biasMap.center > 0,
      has_right:  biasMap.right > 0,
    })

    // Check if any article is already in a cluster (cluster update path)
    const existingClusterIds = group
      .map((a: any) => a.cluster_id)
      .filter(Boolean)

    let clusterId: string

    if (existingClusterIds.length > 0) {
      // Update existing cluster
      clusterId = existingClusterIds[0]
      await supabase
        .from('story_clusters')
        .update({
          article_count:  group.length,
          source_count:   new Set(group.map((a: any) => a.source_id)).size,
          left_count:     biasMap.left,
          center_count:   biasMap.center,
          right_count:    biasMap.right,
          has_left:       biasMap.left > 0,
          has_center:     biasMap.center > 0,
          has_right:      biasMap.right > 0,
          is_blindspot:   blindspot.is_blindspot,
          blindspot_lean: blindspot.blindspot_lean,
          last_updated_at:new Date().toISOString(),
        })
        .eq('id', clusterId)
      clusters_updated++
    } else {
      // Create new cluster
      const { data: newCluster, error: clErr } = await supabase
        .from('story_clusters')
        .insert({
          headline:       group[0].title, // representative headline
          article_count:  group.length,
          source_count:   new Set(group.map((a: any) => a.source_id)).size,
          left_count:     biasMap.left,
          center_count:   biasMap.center,
          right_count:    biasMap.right,
          has_left:       biasMap.left > 0,
          has_center:     biasMap.center > 0,
          has_right:      biasMap.right > 0,
          is_blindspot:   blindspot.is_blindspot,
          blindspot_lean: blindspot.blindspot_lean,
          first_seen_at:  new Date().toISOString(),
          last_updated_at:new Date().toISOString(),
        })
        .select('id')
        .single()

      if (clErr || !newCluster) continue
      clusterId = newCluster.id
      clusters_created++
    }

    // Assign cluster_id to all articles in group
    const ids = group.map((a: any) => a.id)
    await supabase
      .from('articles')
      .update({ cluster_id: clusterId })
      .in('id', ids)

    ids.forEach((id: string) => clustered.add(id))
    articles_clustered += ids.length
  }

  return NextResponse.json({ clusters_created, clusters_updated, articles_clustered })
}

function parseEmbedding(raw: any): number[] {
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return [] }
  }
  return []
}

function getBiasLean(label: string): 'left' | 'center' | 'right' {
  if (['far-left','left','center-left'].includes(label)) return 'left'
  if (['far-right','right','center-right'].includes(label)) return 'right'
  return 'center'
}
