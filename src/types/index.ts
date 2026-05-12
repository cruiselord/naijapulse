export type BiasLabel =
  | 'far-left' | 'left' | 'center-left'
  | 'center'
  | 'center-right' | 'right' | 'far-right'
  | 'unknown';

export type FactualityLabel =
  | 'very-high' | 'high' | 'mixed' | 'low' | 'very-low';

export type ArticleStatus = 'pending' | 'enriched' | 'failed' | 'skipped';

export type Sentiment = 'positive' | 'negative' | 'neutral';

export type Category =
  | 'politics' | 'business' | 'economy' | 'security'
  | 'tech' | 'sports' | 'entertainment' | 'health'
  | 'environment' | 'diaspora' | 'general';

export interface Source {
  id: string;
  name: string;
  domain: string;
  rss_url: string | null;
  country: string;
  region: 'nigeria' | 'africa' | 'global';
  bias_label: BiasLabel;
  bias_score: number;
  factuality: FactualityLabel;
  factuality_score: number;
  mbfc_rated: boolean;
  ai_rated: boolean;
  logo_url: string | null;
  description: string | null;
  ownership: string | null;
  is_active: boolean;
}

export interface Article {
  id: string;
  source_id: string;
  cluster_id: string | null;
  url: string;
  url_hash: string;
  title: string;
  description: string | null;
  image_url: string | null;
  author: string | null;
  published_at: string;
  status: ArticleStatus;
  summary: string | null;
  category: Category | null;
  sentiment: Sentiment | null;
  bias_score: number | null;
  bias_signals: string[] | null;
  ng_relevance: number;
  ng_relevance_reason: string | null;
  enriched_at: string | null;
  created_at: string;
  source?: Source;
}

export interface StoryCluster {
  id: string;
  headline: string;
  summary: string | null;
  summary_left: string | null;
  summary_center: string | null;
  summary_right: string | null;
  category: Category | null;
  article_count: number;
  source_count: number;
  left_count: number;
  center_count: number;
  right_count: number;
  has_left: boolean;
  has_center: boolean;
  has_right: boolean;
  is_blindspot: boolean;
  blindspot_lean: 'left' | 'center' | 'right' | null;
  ng_relevance: number;
  first_seen_at: string;
  last_updated_at: string;
  articles?: Article[];
}

export interface EnrichmentResult {
  summary: string;
  category: Category;
  sentiment: Sentiment;
  bias_score: number;
  bias_signals: string[];
  ng_relevance: number;
  ng_relevance_reason: string;
}

export interface MarketRate {
  pair: string;
  rate: number;
  change: number;
}

export interface CityTime {
  city: string;
  timezone: string;
  flag: string;
}

export interface FeedFilters {
  category: Category | 'all';
  ng_relevance_min: number;
  bias_filter: BiasLabel | 'all';
  blindspots_only: boolean;
}
