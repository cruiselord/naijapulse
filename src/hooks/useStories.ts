'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { StoryCluster, Category } from '@/types'

interface UseStoriesOptions {
  category?:       Category | 'all'
  ngRelevanceMin?: number
  blindspotsOnly?: boolean
  pageSize?:       number
}

export function useStories({
  category       = 'all',
  ngRelevanceMin = 0,
  blindspotsOnly = false,
  pageSize       = 20,
}: UseStoriesOptions = {}) {
  const [stories, setStories]       = useState<StoryCluster[]>([])
  const [page, setPage]             = useState(0)
  const [loading, setLoading]       = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [hasMore, setHasMore]       = useState(true)
  const [error, setError]           = useState<string | null>(null)

  const fetchPage = useCallback(async (pageNum: number, reset = false) => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      let query = supabase
        .from('story_clusters')
        .select(`
          id, headline, summary, summary_left, summary_center, summary_right,
          category, article_count, source_count,
          left_count, center_count, right_count,
          has_left, has_center, has_right,
          is_blindspot, blindspot_lean, ng_relevance,
          first_seen_at, last_updated_at,
          articles(
            id, title, url, image_url, source_id, summary,
            bias_score, ng_relevance, published_at,
            source:sources(name, bias_label, factuality, factuality_score, logo_url)
          )
        `)
        .order('last_updated_at', { ascending: false })
        .range(pageNum * pageSize, (pageNum + 1) * pageSize - 1)

      if (category && category !== 'all') {
        query = query.eq('category', category)
      }
      if (ngRelevanceMin > 0) {
        query = query.gte('ng_relevance', ngRelevanceMin / 100)
      }
      if (blindspotsOnly) {
        query = query.eq('is_blindspot', true)
      }

      const { data, error: err } = await query
      if (err) throw err

      const items = (data ?? []) as unknown as StoryCluster[]
      setHasMore(items.length === pageSize)
      setStories(prev => reset ? items : [...prev, ...items])
    } catch (err: any) {
      setError(err.message ?? 'Failed to load stories')
    } finally {
      setLoading(false)
      setInitialLoad(false)
    }
  }, [category, ngRelevanceMin, blindspotsOnly, pageSize])

  useEffect(() => {
    setPage(0)
    setStories([])
    setHasMore(true)
    setInitialLoad(true)
    fetchPage(0, true)
  }, [category, ngRelevanceMin, blindspotsOnly, fetchPage])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const next = page + 1
      setPage(next)
      fetchPage(next)
    }
  }, [loading, hasMore, page, fetchPage])

  return { stories, loading, initialLoad, hasMore, error, loadMore }
}
