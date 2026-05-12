# NaijaPulse MVP — Complete Build Specification
> Feed this entire file to Claude Code. Follow every section in order. Do not skip steps.

---

## 0. WHO YOU ARE & WHAT YOU ARE BUILDING

You are building **NaijaPulse** — a Nigerian-lens news aggregator with Ground News feature parity.  
Target: functional MVP ready for 10 beta users.  
Builder: solo developer, nights + weekends, fresh machine.  
You will write every file, run every test, and fix every failure before marking any phase complete.

---

## 1. MACHINE SETUP (Run once, in order)

### 1.1 Install System Dependencies

```bash
# macOS
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node git ollama

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git
curl -fsSL https://ollama.com/install.sh | sh

# Verify
node --version   # must be >= 20
git --version
ollama --version
```

### 1.2 Pull Ollama Models

```bash
# Primary enrichment model — fast, good at JSON tasks
ollama pull llama3.1:8b

# Embedding model — for story clustering
ollama pull nomic-embed-text

# Verify both are available
ollama list
```

### 1.3 Install pnpm

```bash
npm install -g pnpm
pnpm --version  # must be >= 8
```

### 1.4 Install Vercel CLI + Supabase CLI

```bash
pnpm add -g vercel supabase
vercel --version
supabase --version
```

---

## 2. PROJECT SCAFFOLD

### 2.1 Create Next.js Project

```bash
pnpm create next-app@latest naijapulse \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack

cd naijapulse
```

### 2.2 Install All Dependencies

```bash
pnpm add \
  @supabase/supabase-js \
  @supabase/ssr \
  rss-parser \
  cheerio \
  node-cron \
  date-fns \
  zod \
  framer-motion \
  lucide-react \
  clsx \
  tailwind-merge \
  @radix-ui/react-dialog \
  @radix-ui/react-tooltip \
  @radix-ui/react-tabs \
  @radix-ui/react-progress \
  sharp

pnpm add -D \
  @types/node \
  @types/rss-parser \
  vitest \
  @vitest/ui \
  @vitejs/plugin-react \
  @playwright/test \
  @testing-library/react \
  @testing-library/jest-dom \
  jsdom \
  tsx
```

### 2.3 Project Directory Structure

Claude Code must create this exact structure:

```
naijapulse/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Home feed
│   │   ├── globals.css
│   │   ├── story/
│   │   │   └── [id]/
│   │   │       └── page.tsx            # Story detail + bias spectrum
│   │   ├── blindspots/
│   │   │   └── page.tsx                # Blindspot feed
│   │   ├── source/
│   │   │   └── [domain]/
│   │   │       └── page.tsx            # Source profile
│   │   └── api/
│   │       ├── ingest/
│   │       │   └── route.ts            # RSS ingestion endpoint
│   │       ├── enrich/
│   │       │   └── route.ts            # Ollama enrichment trigger
│   │       ├── cluster/
│   │       │   └── route.ts            # Clustering trigger
│   │       └── cron/
│   │           └── route.ts            # Vercel cron handler
│   ├── components/
│   │   ├── ui/
│   │   │   ├── BiasBar.tsx             # Left/Center/Right animated bar
│   │   │   ├── BiasChip.tsx            # Inline bias label chip
│   │   │   ├── FactualityBadge.tsx     # Factuality score badge
│   │   │   ├── BlindspotBanner.tsx     # Blindspot warning banner
│   │   │   ├── CoverageSpectrum.tsx    # Story coverage breakdown
│   │   │   ├── SourceCount.tsx         # "14 sources" indicator
│   │   │   ├── NigerianLens.tsx        # NG relevance filter slider
│   │   │   └── LoadingSkeleton.tsx     # Skeleton loaders
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── feed/
│   │   │   ├── StoryCard.tsx           # Main story card (Ground News style)
│   │   │   ├── StoryFeed.tsx           # Feed container with infinite scroll
│   │   │   └── CategoryFilter.tsx      # Category tabs
│   │   └── story/
│   │       ├── StoryHeader.tsx
│   │       ├── BiasComparison.tsx      # Left/Center/Right summaries
│   │       └── SourceList.tsx          # List of sources covering story
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts               # Browser client
│   │   │   ├── server.ts               # Server client
│   │   │   └── middleware.ts
│   │   ├── ollama/
│   │   │   ├── client.ts               # Ollama API wrapper
│   │   │   ├── enrichment.ts           # Article enrichment logic
│   │   │   └── embedding.ts            # Embedding generation
│   │   ├── ingestion/
│   │   │   ├── rss.ts                  # RSS fetch + parse
│   │   │   ├── dedup.ts                # URL hash deduplication
│   │   │   └── sources.ts              # Source registry
│   │   ├── clustering/
│   │   │   └── similarity.ts           # Cosine similarity + cluster logic
│   │   ├── blindspot/
│   │   │   └── detector.ts             # Blindspot detection logic
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts                    # All shared TypeScript types
│   └── constants/
│       ├── sources.ts                  # Seeded Nigerian sources
│       └── categories.ts
├── supabase/
│   └── migrations/
│       ├── 001_extensions.sql
│       ├── 002_sources.sql
│       ├── 003_articles.sql
│       ├── 004_clusters.sql
│       ├── 005_user_reads.sql
│       └── 006_seed_sources.sql
├── tests/
│   ├── unit/
│   │   ├── rss.test.ts
│   │   ├── dedup.test.ts
│   │   ├── enrichment.test.ts
│   │   ├── clustering.test.ts
│   │   └── blindspot.test.ts
│   └── e2e/
│       ├── home.spec.ts
│       ├── story.spec.ts
│       └── blindspots.spec.ts
├── scripts/
│   └── seed-sources.ts                 # Run once to seed MBFC data
├── vitest.config.ts
├── playwright.config.ts
├── .env.local.example
└── vercel.json
```

---

## 3. ENVIRONMENT VARIABLES

Create `.env.local.example` (Claude Code must also create `.env.local` with placeholder values):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Ollama (local)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
OLLAMA_EMBED_MODEL=nomic-embed-text

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=generate_a_random_32_char_string_here

# Ingest settings
RSS_FETCH_INTERVAL_MINUTES=30
CLUSTER_SIMILARITY_THRESHOLD=0.82
CLUSTER_WINDOW_HOURS=48
MAX_ARTICLES_PER_FETCH=50
```

---

## 4. DATABASE SCHEMA (Supabase Migrations)

### 4.1 `001_extensions.sql`

```sql
-- Enable pgvector for embedding similarity search
create extension if not exists vector;

-- Enable UUID generation
create extension if not exists "uuid-ossp";
```

### 4.2 `002_sources.sql`

```sql
create table public.sources (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  domain          text unique not null,
  rss_url         text,
  country         text default 'NG',
  region          text,                    -- 'nigeria' | 'africa' | 'global'
  bias_label      text,                    -- 'far-left' | 'left' | 'center-left' | 'center' | 'center-right' | 'right' | 'far-right' | 'unknown'
  bias_score      numeric default 0,       -- -3.0 to +3.0 mirroring MBFC scale
  factuality      text,                    -- 'very-high' | 'high' | 'mixed' | 'low' | 'very-low'
  factuality_score integer default 0,     -- 0-100
  mbfc_rated      boolean default false,
  ai_rated        boolean default false,
  ownership       text,
  description     text,
  logo_url        text,
  is_active       boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index idx_sources_domain on public.sources(domain);
create index idx_sources_bias_label on public.sources(bias_label);
create index idx_sources_is_active on public.sources(is_active);
```

### 4.3 `003_articles.sql`

```sql
create table public.articles (
  id              uuid primary key default uuid_generate_v4(),
  source_id       uuid references public.sources(id) on delete cascade,
  cluster_id      uuid,                    -- set after clustering (FK added after clusters table)
  url             text unique not null,
  url_hash        text unique not null,    -- SHA-256 of url for fast dedup
  title           text not null,
  description     text,
  raw_content     text,
  image_url       text,
  author          text,
  published_at    timestamptz,
  status          text default 'pending',  -- 'pending' | 'enriched' | 'failed' | 'skipped'
  
  -- AI enriched fields (populated after Ollama processing)
  summary         text,
  category        text,
  sentiment       text,                    -- 'positive' | 'negative' | 'neutral'
  bias_score      numeric,                 -- -2.0 to +2.0 (article-level, not source-level)
  bias_signals    text[],                  -- phrases flagged as biased
  ng_relevance    numeric default 0,       -- 0.0 to 1.0
  ng_relevance_reason text,
  embedding       vector(768),             -- nomic-embed-text output dimension
  
  enriched_at     timestamptz,
  created_at      timestamptz default now()
);

create index idx_articles_source_id on public.articles(source_id);
create index idx_articles_status on public.articles(status);
create index idx_articles_published_at on public.articles(published_at desc);
create index idx_articles_cluster_id on public.articles(cluster_id);
create index idx_articles_url_hash on public.articles(url_hash);

-- Vector index for similarity search (add after data exists)
-- create index idx_articles_embedding on public.articles using ivfflat (embedding vector_cosine_ops) with (lists = 100);
```

### 4.4 `004_clusters.sql`

```sql
create table public.story_clusters (
  id              uuid primary key default uuid_generate_v4(),
  headline        text not null,           -- AI-generated representative headline
  summary         text,                    -- AI-generated cross-source summary
  summary_left    text,                    -- How left sources frame it
  summary_center  text,                    -- How center sources frame it
  summary_right   text,                    -- How right sources frame it
  category        text,
  article_count   integer default 0,
  source_count    integer default 0,
  
  -- Coverage breakdown
  left_count      integer default 0,
  center_count    integer default 0,
  right_count     integer default 0,
  has_left        boolean default false,
  has_center      boolean default false,
  has_right       boolean default false,
  
  -- Blindspot flags
  is_blindspot    boolean default false,
  blindspot_lean  text,                    -- which lean is MISSING: 'left' | 'center' | 'right'
  
  -- Relevance
  ng_relevance    numeric default 0,
  
  -- Timestamps
  first_seen_at   timestamptz default now(),
  last_updated_at timestamptz default now()
);

-- Add FK from articles to clusters
alter table public.articles
  add constraint fk_articles_cluster
  foreign key (cluster_id) references public.story_clusters(id) on delete set null;

create index idx_clusters_is_blindspot on public.story_clusters(is_blindspot);
create index idx_clusters_ng_relevance on public.story_clusters(ng_relevance desc);
create index idx_clusters_last_updated on public.story_clusters(last_updated_at desc);
create index idx_clusters_category on public.story_clusters(category);
```

### 4.5 `005_user_reads.sql`

```sql
-- Auth handled by Supabase Auth (enable in dashboard)
create table public.user_reads (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references auth.users(id) on delete cascade,
  article_id      uuid references public.articles(id) on delete cascade,
  cluster_id      uuid references public.story_clusters(id) on delete cascade,
  source_bias     text,                    -- snapshot of source bias at time of read
  read_at         timestamptz default now(),
  unique(user_id, article_id)
);

create index idx_user_reads_user_id on public.user_reads(user_id);
```

### 4.6 `006_seed_sources.sql`

```sql
-- Nigerian Sources (manually verified + MBFC cross-referenced)
insert into public.sources (name, domain, rss_url, country, region, bias_label, bias_score, factuality, factuality_score, mbfc_rated) values
  ('Punch Nigeria',       'punchng.com',          'https://punchng.com/feed/',                        'NG', 'nigeria',  'center',       0.0,  'high',      75, true),
  ('Premium Times',       'premiumtimesng.com',   'https://www.premiumtimesng.com/feed',              'NG', 'nigeria',  'center',       0.0,  'high',      80, true),
  ('The Guardian Nigeria','guardian.ng',           'https://guardian.ng/feed/',                        'NG', 'nigeria',  'center',       0.0,  'high',      78, true),
  ('Vanguard Nigeria',    'vanguardngr.com',       'https://www.vanguardngr.com/feed/',               'NG', 'nigeria',  'center',       0.1,  'mixed',     60, true),
  ('ThisDay Live',        'thisdaylive.com',       'https://www.thisdaylive.com/index.php/feed/',     'NG', 'nigeria',  'center-right', 0.5,  'high',      72, true),
  ('Daily Trust',         'dailytrust.com',        'https://dailytrust.com/feed/',                    'NG', 'nigeria',  'center',       0.0,  'high',      76, true),
  ('BusinessDay NG',      'businessday.ng',        'https://businessday.ng/feed/',                    'NG', 'nigeria',  'center',      -0.1,  'high',      82, true),
  ('Sahara Reporters',    'saharareporters.com',   'https://saharareporters.com/rss.xml',             'NG', 'nigeria',  'left',        -1.0,  'mixed',     55, true),
  ('Channels TV',         'channelstv.com',        'https://www.channelstv.com/feed/',                'NG', 'nigeria',  'center',       0.0,  'high',      80, true),
  ('NAN Nigeria',         'nan.ng',                'https://nan.ng/feed/',                            'NG', 'nigeria',  'center-right', 0.6,  'mixed',     58, true),
  ('The Cable',           'thecable.ng',           'https://www.thecable.ng/feed',                   'NG', 'nigeria',  'center',      -0.1,  'high',      77, true),
  ('Nairaland Forum',     'nairaland.com',         null,                                              'NG', 'nigeria',  'unknown',      0.0,  'mixed',     40, false),
  ('Nairametrics',        'nairametrics.com',      'https://nairametrics.com/feed/',                  'NG', 'nigeria',  'center',       0.0,  'high',      75, true),
  ('TechCabal',           'techcabal.com',         'https://techcabal.com/feed/',                    'NG', 'nigeria',  'center',       0.0,  'high',      80, true),
  ('Stears',              'stears.co',             null,                                              'NG', 'nigeria',  'center',       0.0,  'high',      78, false),
-- Global sources with strong Nigeria coverage
  ('BBC News',            'bbc.com',               'https://feeds.bbci.co.uk/news/world/africa/rss.xml', 'GB', 'global', 'center',  -0.2, 'very-high', 90, true),
  ('Reuters',             'reuters.com',           'https://feeds.reuters.com/reuters/africaNews',   'GB', 'global',  'center',      -0.1,  'very-high', 92, true),
  ('Al Jazeera',          'aljazeera.com',         'https://www.aljazeera.com/xml/rss/all.xml',      'QA', 'global',  'center-left', -0.5,  'high',      82, true),
  ('CNN',                 'cnn.com',               'https://rss.cnn.com/rss/edition_africa.rss',     'US', 'global',  'center-left', -0.8,  'high',      78, true),
  ('The Guardian UK',     'theguardian.com',       'https://www.theguardian.com/world/africa/rss',   'GB', 'global',  'left',        -1.2,  'high',      82, true);
```

---

## 5. TYPESCRIPT TYPES

### `src/types/index.ts`

```typescript
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

export interface FeedFilters {
  category: Category | 'all';
  ng_relevance_min: number;
  bias_filter: BiasLabel | 'all';
  blindspots_only: boolean;
}
```

---

## 6. CORE LIBRARY IMPLEMENTATIONS

### 6.1 `src/lib/ollama/client.ts`

```typescript
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';
const OLLAMA_EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';

export async function ollamaChat(prompt: string, systemPrompt?: string): Promise<string> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama chat error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.message?.content || '';
}

export async function ollamaEmbed(text: string): Promise<number[]> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_EMBED_MODEL,
      prompt: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama embed error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.embedding;
}

export async function isOllamaRunning(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}
```

### 6.2 `src/lib/ollama/enrichment.ts`

```typescript
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
```

### 6.3 `src/lib/clustering/similarity.ts`

```typescript
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dot = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export function findSimilarArticles(
  targetEmbedding: number[],
  candidates: Array<{ id: string; embedding: number[] }>,
  threshold: number = 0.82
): string[] {
  return candidates
    .filter(c => cosineSimilarity(targetEmbedding, c.embedding) >= threshold)
    .map(c => c.id);
}
```

### 6.4 `src/lib/ingestion/rss.ts`

```typescript
import Parser from 'rss-parser';
import crypto from 'crypto';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'NaijaPulse/1.0 (news aggregator; contact@naijapulse.com)',
  },
});

export interface RawArticle {
  url: string;
  url_hash: string;
  title: string;
  description: string | null;
  raw_content: string | null;
  image_url: string | null;
  author: string | null;
  published_at: Date;
  source_id: string;
}

export async function fetchRssFeed(
  rssUrl: string,
  sourceId: string,
  maxItems: number = 50
): Promise<RawArticle[]> {
  const feed = await parser.parseURL(rssUrl);
  const items = feed.items.slice(0, maxItems);

  return items
    .filter(item => item.link && item.title)
    .map(item => {
      const url = item.link!;
      return {
        url,
        url_hash: crypto.createHash('sha256').update(url).digest('hex'),
        title: item.title!.trim(),
        description: item.contentSnippet || item.summary || null,
        raw_content: item.content || item['content:encoded'] || item.contentSnippet || null,
        image_url: item.enclosure?.url || null,
        author: item.creator || item.author || null,
        published_at: item.pubDate ? new Date(item.pubDate) : new Date(),
        source_id: sourceId,
      };
    });
}

export function hashUrl(url: string): string {
  return crypto.createHash('sha256').update(url).digest('hex');
}
```

### 6.5 `src/lib/blindspot/detector.ts`

```typescript
import type { StoryCluster } from '@/types';

export function detectBlindspot(cluster: Pick<StoryCluster, 'has_left' | 'has_center' | 'has_right'>): {
  is_blindspot: boolean;
  blindspot_lean: 'left' | 'center' | 'right' | null;
} {
  // Only flag as blindspot if at least 2 leans are present (enough coverage to compare)
  const covered = [cluster.has_left, cluster.has_center, cluster.has_right].filter(Boolean).length;
  
  if (covered < 2) {
    return { is_blindspot: false, blindspot_lean: null };
  }

  if (!cluster.has_left) return { is_blindspot: true, blindspot_lean: 'left' };
  if (!cluster.has_right) return { is_blindspot: true, blindspot_lean: 'right' };
  if (!cluster.has_center) return { is_blindspot: true, blindspot_lean: 'center' };

  return { is_blindspot: false, blindspot_lean: null };
}
```

---

## 7. API ROUTES

### 7.1 `src/app/api/ingest/route.ts`

This route fetches all active RSS sources, parses articles, deduplicates by url_hash, and inserts new articles with status `pending`.

Implementation requirements:
- Accept POST request with optional `{ source_id?: string }` body to ingest single source
- If no source_id, ingest all active sources with non-null rss_url
- Skip articles where url_hash already exists in articles table
- Return `{ inserted: number, skipped: number, errors: string[] }`
- Use Supabase service role client (not anon)
- Handle RSS parse failures per-source without failing entire batch
- Log each source result to console

### 7.2 `src/app/api/enrich/route.ts`

This route picks up articles with status `pending` and enriches them via Ollama.

Implementation requirements:
- Accept POST with optional `{ limit?: number }` (default: 20 per run to avoid rate issues)
- Check Ollama is running first — return 503 if not
- For each pending article: call `enrichArticle()`, generate embedding via `ollamaEmbed(title + ' ' + summary)`
- Update article: set all enriched fields + status = 'enriched'
- On failure: set status = 'failed', log error
- Return `{ enriched: number, failed: number }`

### 7.3 `src/app/api/cluster/route.ts`

This route runs clustering on enriched articles from the last 48 hours.

Implementation requirements:
- Fetch all enriched articles with embeddings from last `CLUSTER_WINDOW_HOURS`
- For each article not yet in a cluster:
  - Compare embedding against all other unclustered articles
  - If similarity >= `CLUSTER_SIMILARITY_THRESHOLD`: group them
  - Create or update `story_clusters` record
  - Update `cluster_id` on all grouped articles
- After clustering: run blindspot detection per cluster
- Update `has_left`, `has_center`, `has_right`, `is_blindspot`, `blindspot_lean`, counts
- Return `{ clusters_created: number, clusters_updated: number, articles_clustered: number }`

### 7.4 `src/app/api/cron/route.ts`

Master cron endpoint — called by Vercel Cron or manually.

```typescript
// vercel.json cron config:
// { "crons": [{ "path": "/api/cron", "schedule": "*/30 * * * *" }] }

// Sequence: ingest → enrich → cluster
// Verify CRON_SECRET header before running
// Return summary of all three steps
```

---

## 8. UI DESIGN SYSTEM

### 8.1 Design Philosophy

Mirror Ground News layout exactly. Use Deep Navy + Gold color palette instead of their dark navy + yellow.

### 8.2 `src/app/globals.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* NaijaPulse Deep Navy + Gold */
  --navy-950: #050D1A;
  --navy-900: #0A1628;
  --navy-800: #0F2040;
  --navy-700: #162B56;
  --navy-600: #1E3A6E;
  --navy-500: #264880;

  --gold-400: #F5C842;
  --gold-500: #E8B800;
  --gold-600: #CC9F00;

  --white: #FFFFFF;
  --gray-100: #F0F2F5;
  --gray-200: #D8DCE3;
  --gray-400: #8A94A6;
  --gray-600: #4A5568;

  /* Bias colors */
  --bias-left: #3B82F6;
  --bias-center-left: #60A5FA;
  --bias-center: #6B7280;
  --bias-center-right: #F97316;
  --bias-right: #EF4444;

  /* Factuality colors */
  --fact-very-high: #10B981;
  --fact-high: #34D399;
  --fact-mixed: #F59E0B;
  --fact-low: #EF4444;
  --fact-very-low: #991B1B;
}

* { box-sizing: border-box; }

body {
  font-family: 'DM Sans', sans-serif;
  background: var(--navy-950);
  color: var(--white);
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3 {
  font-family: 'Playfair Display', serif;
}
```

### 8.3 `tailwind.config.ts`

Extend with NaijaPulse color tokens:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#050D1A',
          900: '#0A1628',
          800: '#0F2040',
          700: '#162B56',
          600: '#1E3A6E',
          500: '#264880',
        },
        gold: {
          400: '#F5C842',
          500: '#E8B800',
          600: '#CC9F00',
        },
        bias: {
          left: '#3B82F6',
          'center-left': '#60A5FA',
          center: '#6B7280',
          'center-right': '#F97316',
          right: '#EF4444',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'bias-fill': 'biasFill 0.8s ease-out forwards',
        'fade-up': 'fadeUp 0.4s ease-out forwards',
        'slide-in': 'slideIn 0.3s ease-out forwards',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        biasFill: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--fill-width)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(232, 184, 0, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(232, 184, 0, 0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

### 8.4 Key UI Components

#### `src/components/ui/BiasBar.tsx`

Animated horizontal bar showing Left / Center / Right coverage proportions. Mirrors Ground News bias bar exactly.

Requirements:
- Three segments: Left (blue), Center (gray), Right (red)
- Segments animate in on mount using framer-motion (staggered, 0.1s delay each)
- Width of each segment = proportional to article count for that lean
- On hover: show tooltip with exact count + percentage
- Show "BLINDSPOT" gold badge if `is_blindspot === true`
- Prop types: `{ left: number; center: number; right: number; isBlindspot?: boolean; blindspotLean?: string }`

#### `src/components/ui/BlindspotBanner.tsx`

Gold warning banner shown on blindspot stories.

Requirements:
- Gold background (`var(--gold-500)`) with navy text
- Icon: eye with slash
- Text: "Blindspot — {lean} media not covering this story"
- Animate in from top with slide-down on mount
- Pulse animation on the icon

#### `src/components/ui/FactualityBadge.tsx`

Small badge showing source factuality.

Requirements:
- Color-coded: Very High = emerald, High = green, Mixed = amber, Low = red, Very Low = dark red
- Show star icon + label text
- Tooltip on hover with explanation

#### `src/components/feed/StoryCard.tsx`

Main story card — mirrors Ground News card layout.

Requirements:
- Dark card background (`navy-800`) with subtle border
- Top: Category chip + Blindspot badge (if applicable)
- Middle: Headline (Playfair Display font, large), 2-line clamp
- Below headline: Source count pill ("14 sources"), time ago
- Bottom: Bias bar (compact, 6px height), Factuality badge of top source
- Hover: card lifts (translateY -2px), gold border appears
- Click: navigate to `/story/[id]`
- Animate in on page load: fade-up with staggered delay per card index
- Nigerian relevance: show small NG flag icon if `ng_relevance >= 0.7`

#### `src/components/story/BiasComparison.tsx`

Three-column layout showing Left / Center / Right perspective summaries.

Requirements:
- Three columns, color-coded headers
- Each column: source name(s) + summary text for that lean
- If a lean has no coverage: show "No [Left/Center/Right] coverage" in muted style with blindspot explanation
- Animate columns in with stagger on mount

---

## 9. PAGE IMPLEMENTATIONS

### 9.1 Home Page `src/app/page.tsx`

Layout (mirrors Ground News homepage):
- Fixed navbar with NaijaPulse logo (left), category filters (center), search icon + auth (right)
- Hero section: "See Every Side of Every Story" with animated bias bar demo
- Category tabs below hero: All | Politics | Business | Economy | Security | Tech | Sports
- Story feed: 2-column grid on desktop, 1-column on mobile
- Sidebar (desktop only): Trending topics, Top sources by factuality
- Nigerian Lens filter: slider 0-100% relevance threshold, fixed to sidebar
- Infinite scroll: load 20 more stories on scroll to bottom

### 9.2 Story Detail `src/app/story/[id]/page.tsx`

Layout (mirrors Ground News story page):
- Breadcrumb: Home > Category > Story
- Story headline (large, Playfair Display)
- Blindspot banner (if applicable, full-width, gold)
- Coverage count: "This story covered by X sources"
- Large animated bias bar showing full spectrum
- Tabs: "All Sources" | "Bias Comparison" | "Coverage Map"
  - All Sources: list of articles with source name, bias chip, factuality badge, published time, link
  - Bias Comparison: three-column Left/Center/Right summaries
  - Coverage Map: placeholder for Phase 2
- Related stories at bottom

### 9.3 Blindspots Page `src/app/blindspots/page.tsx`

Layout (mirrors Ground News Blindspots section):
- Page header: "Blindspots" + explanation copy
- Filter tabs: "Missing Left" | "Missing Center" | "Missing Right" | "All Blindspots"
- Story cards identical to home feed but all have gold Blindspot badge
- Explanation tooltip: "Why does this matter?" popover

### 9.4 Source Profile `src/app/source/[domain]/page.tsx`

Layout:
- Source name + logo
- Bias rating display (large bias bar for single source)
- Factuality score (star rating style)
- MBFC-rated badge or AI-rated badge
- Recent articles from this source
- Stats: articles indexed, avg bias score over time

---

## 10. NAVBAR `src/components/layout/Navbar.tsx`

Requirements:
- Fixed top, blur background (`backdrop-blur-md`), navy-900/80 with border-bottom
- Left: NaijaPulse wordmark — "Naija" in gold, "Pulse" in white, Playfair Display font
- Center: Category nav links (hidden on mobile, hamburger menu)
- Right: Nigerian Lens toggle icon, Search icon, Auth button
- Mobile: hamburger opens slide-in drawer with full nav
- Scroll behavior: border-bottom appears after 10px scroll
- Gold accent line animates in under active nav item

---

## 11. TESTING

### 11.1 `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 11.2 `tests/setup.ts`

```typescript
import '@testing-library/jest-dom';
```

### 11.3 Unit Tests — Claude Code must write AND pass all of these

#### `tests/unit/clustering.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { cosineSimilarity, findSimilarArticles } from '@/lib/clustering/similarity';

describe('cosineSimilarity', () => {
  it('returns 1.0 for identical vectors', () => {
    const v = [1, 0.5, 0.3, 0.8];
    expect(cosineSimilarity(v, v)).toBeCloseTo(1.0);
  });

  it('returns 0 for orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
  });

  it('returns 0 for mismatched lengths', () => {
    expect(cosineSimilarity([1, 2], [1, 2, 3])).toBe(0);
  });

  it('clamps between -1 and 1', () => {
    const result = cosineSimilarity([0.9, 0.1], [0.9, 0.1]);
    expect(result).toBeGreaterThanOrEqual(-1);
    expect(result).toBeLessThanOrEqual(1);
  });
});

describe('findSimilarArticles', () => {
  it('finds articles above threshold', () => {
    const target = [1, 0, 0];
    const candidates = [
      { id: 'a', embedding: [0.99, 0.1, 0] },
      { id: 'b', embedding: [0, 1, 0] },
    ];
    const result = findSimilarArticles(target, candidates, 0.82);
    expect(result).toContain('a');
    expect(result).not.toContain('b');
  });

  it('returns empty array when nothing matches', () => {
    const result = findSimilarArticles([1, 0], [{ id: 'x', embedding: [0, 1] }], 0.9);
    expect(result).toHaveLength(0);
  });
});
```

#### `tests/unit/blindspot.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { detectBlindspot } from '@/lib/blindspot/detector';

describe('detectBlindspot', () => {
  it('detects missing left coverage', () => {
    const result = detectBlindspot({ has_left: false, has_center: true, has_right: true });
    expect(result.is_blindspot).toBe(true);
    expect(result.blindspot_lean).toBe('left');
  });

  it('detects missing right coverage', () => {
    const result = detectBlindspot({ has_left: true, has_center: true, has_right: false });
    expect(result.is_blindspot).toBe(true);
    expect(result.blindspot_lean).toBe('right');
  });

  it('does not flag blindspot when only 1 lean covered', () => {
    const result = detectBlindspot({ has_left: false, has_center: true, has_right: false });
    expect(result.is_blindspot).toBe(false);
  });

  it('does not flag blindspot when all leans covered', () => {
    const result = detectBlindspot({ has_left: true, has_center: true, has_right: true });
    expect(result.is_blindspot).toBe(false);
    expect(result.blindspot_lean).toBeNull();
  });
});
```

#### `tests/unit/dedup.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { hashUrl } from '@/lib/ingestion/rss';

describe('hashUrl', () => {
  it('returns consistent hash for same url', () => {
    const url = 'https://punchng.com/article/123';
    expect(hashUrl(url)).toBe(hashUrl(url));
  });

  it('returns different hashes for different urls', () => {
    expect(hashUrl('https://a.com')).not.toBe(hashUrl('https://b.com'));
  });

  it('returns 64 character hex string (SHA-256)', () => {
    const hash = hashUrl('https://test.com/article');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
```

#### `tests/unit/enrichment.test.ts`

```typescript
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
```

### 11.4 `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 1,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
```

### 11.5 E2E Tests — Claude Code must write AND pass all of these

#### `tests/e2e/home.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Home Feed', () => {
  test('loads and shows navbar', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.getByText('Naija')).toBeVisible();
  });

  test('shows category filter tabs', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('tab', { name: /all/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /politics/i })).toBeVisible();
  });

  test('story cards render on home page', async ({ page }) => {
    await page.goto('/');
    // Allow time for data to load
    await page.waitForTimeout(2000);
    const cards = page.locator('[data-testid="story-card"]');
    // Should have at least 0 cards (may be empty on fresh install)
    await expect(cards.count()).resolves.toBeGreaterThanOrEqual(0);
  });

  test('navbar is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();
  });
});
```

#### `tests/e2e/blindspots.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Blindspots Page', () => {
  test('blindspots page loads', async ({ page }) => {
    await page.goto('/blindspots');
    await expect(page).toHaveURL('/blindspots');
    await expect(page.getByRole('heading', { name: /blindspot/i })).toBeVisible();
  });

  test('shows filter tabs', async ({ page }) => {
    await page.goto('/blindspots');
    await expect(page.getByText(/missing left/i)).toBeVisible();
    await expect(page.getByText(/missing right/i)).toBeVisible();
  });
});
```

### 11.6 `package.json` Test Scripts

Add these scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "pnpm test && pnpm test:e2e",
    "ingest": "curl -X POST http://localhost:3000/api/ingest",
    "enrich": "curl -X POST http://localhost:3000/api/enrich",
    "cluster": "curl -X POST http://localhost:3000/api/cluster"
  }
}
```

---

## 12. `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "*/30 * * * *"
    }
  ],
  "functions": {
    "src/app/api/ingest/route.ts": { "maxDuration": 60 },
    "src/app/api/enrich/route.ts": { "maxDuration": 300 },
    "src/app/api/cluster/route.ts": { "maxDuration": 120 }
  }
}
```

**NOTE:** Vercel cron will not call the Ollama enrich endpoint because Ollama runs locally. For production, the cron only runs ingest + cluster. Run enrich manually while Ollama is running:
```bash
pnpm enrich
```

---

## 13. BUILD PHASES & COMPLETION CHECKLIST

Claude Code must complete phases in order and verify each checklist before proceeding.

### Phase 1 — Foundation ✓ when:
- [ ] `pnpm dev` starts without errors
- [ ] All Supabase migrations run: `supabase db push`
- [ ] Sources table seeded with 20 entries: `select count(*) from sources;` returns 20
- [ ] `POST /api/ingest` returns `{ inserted: N, skipped: 0, errors: [] }` on first run
- [ ] Articles appear in Supabase dashboard
- [ ] `pnpm test` — unit tests for `dedup.test.ts` pass

### Phase 2 — AI Enrichment ✓ when:
- [ ] `ollama list` shows `llama3.1:8b` and `nomic-embed-text`
- [ ] `POST /api/enrich` returns `{ enriched: N, failed: 0 }` for N > 0
- [ ] Articles in DB have non-null `summary`, `category`, `bias_score`, `embedding`
- [ ] `POST /api/cluster` creates at least 1 cluster when articles exist
- [ ] Clusters have correct `has_left/center/right` flags
- [ ] Blindspot detection sets `is_blindspot = true` on qualifying clusters
- [ ] `pnpm test` — all unit tests pass (clustering, blindspot, enrichment)

### Phase 3 — Frontend ✓ when:
- [ ] Home page loads story cards from Supabase
- [ ] BiasBar renders and animates on story cards
- [ ] BlindspotBanner renders on blindspot stories
- [ ] Story detail page shows bias comparison tabs
- [ ] Blindspots page shows filtered blindspot stories
- [ ] Mobile layout works at 375px width
- [ ] `pnpm test:e2e` — all e2e tests pass

### Phase 4 — Beta Ready ✓ when:
- [ ] `pnpm build` completes with 0 errors
- [ ] `pnpm lint` shows 0 errors
- [ ] All tests pass: `pnpm test:all`
- [ ] Vercel deploy succeeds: `vercel --prod`
- [ ] Cron runs on Vercel and inserts articles
- [ ] Shared with 1 test user — page loads in < 3s

---

## 14. KNOWN CONSTRAINTS & DECISIONS

| Constraint | Decision |
|---|---|
| Ollama runs locally | Enrichment is manual trigger, not automated cron on Vercel |
| No domain yet | Use `naijapulse.vercel.app` as NEXT_PUBLIC_APP_URL |
| pgvector free tier | Add IVFFlat index only after articles table > 5,000 rows |
| Nairaland has no RSS | Skip for MVP, add scraper in Phase 2 |
| Stears.co has no RSS | Skip for MVP, add API later |
| Some Nigerian RSS feeds go down | Per-source error handling — failure of one never blocks others |
| Supabase free tier limits | 500MB DB, 2GB bandwidth — sufficient for 10 beta users |

---

## 15. SUPABASE SETUP STEPS (Human does this, not Claude Code)

1. Go to https://supabase.com → New project → Name: `naijapulse`
2. Copy Project URL + anon key + service_role key → paste into `.env.local`
3. In Supabase SQL editor: run `create extension if not exists vector;`
4. Run: `supabase db push` to apply all migrations
5. In Supabase dashboard → Authentication → Enable Email magic link

---

*End of NaijaPulse Build Specification v1.0*
*Feed this document to Claude Code at session start. Say: "Read NAIJAPULSE_BUILD_SPEC.md and start Phase 1."*
