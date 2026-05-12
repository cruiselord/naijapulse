import { createServiceClient } from '@/lib/supabase/server'
import { cosineSimilarity } from '@/lib/clustering/similarity'
import { detectBlindspot } from '@/lib/blindspot/detector'
import type { Article } from '@/types'

interface ArticleWithSource extends Omit<Article, 'source'> {
  source?: {
    name: string
    bias_label: string
  }
  embedding?: number[] | string | null
}

export async function runCluster() {
  try {
    const supabase = await createServiceClient()
    const threshold = parseFloat(process.env.CLUSTER_SIMILARITY_THRESHOLD || '0.82')
    const windowHours = parseInt(process.env.CLUSTER_WINDOW_HOURS || '48')

    const cutoffTime = new Date(Date.now() - windowHours * 3600000).toISOString()
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select(
        `id, title, summary, category, source_id, cluster_id,
         embedding, ng_relevance, enriched_at,
         sources(name, bias_label)`
      )
      .eq('status', 'enriched')
      .is('cluster_id', null)
      .gte('enriched_at', cutoffTime)
      .limit(500)

    if (articlesError) {
      return { error: 'Failed to fetch articles', details: articlesError }
    }

    if (!articles || articles.length === 0) {
      return { clusters_created: 0, clusters_updated: 0, articles_clustered: 0, debug: 'no enriched articles found' }
    }

    const validArticles: ArticleWithSource[] = (articles as any[])
      .filter((a) => {
        if (!a.embedding) return false
        const emb = a.embedding
        if (Array.isArray(emb)) return emb.length > 0
        if (typeof emb === 'string') {
          const parsed = emb.replace(/\[\]/g, '').split(',').map(Number)
          a.embedding = parsed
          return parsed.length > 0
        }
        return false
      })
      .map((a) => ({
        ...a,
        source: a.sources,
      }))

    if (validArticles.length === 0) {
      return { clusters_created: 0, clusters_updated: 0, articles_clustered: 0, debug: 'no articles with embeddings' }
    }

    const clusters = performClustering(validArticles, threshold)
    let clustersCreated = 0
    let articlesUpdated = 0

    for (const clusterArticles of clusters) {
      if (clusterArticles.length === 0) continue

      const biasCount = { left: 0, center: 0, right: 0 }
      const sourceNames = new Set<string>()

      for (const article of clusterArticles) {
        if (article.source?.name) sourceNames.add(article.source.name)
        const bias = article.source?.bias_label || 'unknown'
        if (bias.includes('left')) {
          biasCount.left++
        } else if (bias.includes('right')) {
          biasCount.right++
        } else {
          biasCount.center++
        }
      }

      const headlineArticle = clusterArticles.reduce((prev, current) =>
        (current.ng_relevance || 0) > (prev.ng_relevance || 0) ? current : prev
      )

      const categoryCount: Record<string, number> = {}
      for (const article of clusterArticles) {
        if (article.category) {
          categoryCount[article.category] = (categoryCount[article.category] || 0) + 1
        }
      }
      const topCategory = Object.entries(categoryCount).sort(([, a], [, b]) => b - a)[0]?.[0] || 'general'

      const has_left = biasCount.left > 0
      const has_center = biasCount.center > 0
      const has_right = biasCount.right > 0
      const { is_blindspot, blindspot_lean } = detectBlindspot({ has_left, has_center, has_right })
      const avgNgRelevance = clusterArticles.reduce((sum, a) => sum + (a.ng_relevance || 0), 0) / clusterArticles.length

      const { data: createdCluster, error: insertError } = await supabase
        .from('story_clusters')
        .insert({
          headline: headlineArticle.title,
          summary: headlineArticle.summary,
          summary_left: has_left ? `Covered by ${biasCount.left} left-leaning sources` : null,
          summary_center: has_center ? `Covered by ${biasCount.center} center sources` : null,
          summary_right: has_right ? `Covered by ${biasCount.right} right-leaning sources` : null,
          category: topCategory,
          article_count: clusterArticles.length,
          source_count: sourceNames.size,
          left_count: biasCount.left,
          center_count: biasCount.center,
          right_count: biasCount.right,
          has_left,
          has_center,
          has_right,
          is_blindspot,
          blindspot_lean,
          ng_relevance: avgNgRelevance,
        })
        .select('id')
        .single()

      if (insertError || !createdCluster) {
        console.error('[cluster] Failed to create cluster:', insertError?.message ?? 'no cluster created')
        continue
      }

      clustersCreated++
      const articleIds = clusterArticles.map((a) => a.id)
      const { error: updateError } = await supabase
        .from('articles')
        .update({ cluster_id: createdCluster.id })
        .in('id', articleIds)

      if (updateError) {
        console.error('[cluster] Failed to update articles:', updateError.message)
      } else {
        articlesUpdated += articleIds.length
      }
    }

    return {
      clusters_created: clustersCreated,
      articles_clustered: articlesUpdated,
      message: `Created ${clustersCreated} clusters, grouped ${articlesUpdated} articles`,
    }
  } catch (error) {
    console.error('[cluster] Error:', error)
    return { error: 'Clustering failed', details: String(error) }
  }
}

function performClustering(articles: ArticleWithSource[], threshold: number) {
  const clusters: ArticleWithSource[][] = []
  const assigned = new Set<string>()

  for (const article of articles) {
    if (assigned.has(article.id)) continue
    const newCluster: ArticleWithSource[] = [article]
    assigned.add(article.id)

    for (const candidate of articles) {
      if (assigned.has(candidate.id)) continue
      if (
        candidate.embedding &&
        article.embedding &&
        cosineSimilarity(
          article.embedding as unknown as number[],
          candidate.embedding as unknown as number[]
        ) >= threshold
      ) {
        newCluster.push(candidate)
        assigned.add(candidate.id)
      }
    }

    clusters.push(newCluster)
  }

  return clusters
}
