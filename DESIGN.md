# NaijaPulse Frontend Design & Build Guide

> Give this file to Claude/GPT to generate frontend code and components.

---

## 1. PROJECT OVERVIEW

**NaijaPulse** is a Nigerian-lens news aggregator showing every perspective on major stories, inspired by Ground News.

**Core Mission:**
- Aggregate news from 20 Nigerian + global sources
- Use AI to detect bias in articles
- Show left/center/right political coverage of each story
- Flag "blindspots" (missing perspectives)
- Filter by Nigerian relevance

**Tech Stack:**
- Frontend: Next.js 14, React, TypeScript, Tailwind CSS
- Backend: Next.js API Routes, Supabase (PostgreSQL + pgvector), Ollama LLM
- Colors: Deep Navy (#050D1A) + Gold (#E8B800)
- Fonts: Playfair Display (headlines), DM Sans (body)

---

## 2. FEATURES IMPLEMENTED (BACKEND READY)

### ✅ Data Pipeline
- **Ingest**: Fetch articles from 20 RSS feeds every 30 minutes
- **Enrich**: Use Ollama AI to analyze each article (summary, bias, category, sentiment, embeddings)
- **Cluster**: Group similar articles into stories using cosine similarity (0.82 threshold)
- **Blindspot Detection**: Automatically flag stories missing left/center/right coverage

### ✅ Database Schema (Ready to Query)
- **sources**: 20 Nigerian/global news outlets with bias ratings
- **articles**: ~240+ articles with AI-enriched metadata
- **story_clusters**: Grouped stories with multi-perspective summaries
- **user_reads**: Track which articles users have clicked (auth integration ready)

### ✅ API Endpoints Available
- `POST /api/ingest` → New articles from RSS
- `POST /api/enrich` → AI analysis (summary, bias, category, sentiment, embeddings)
- `POST /api/cluster` → Story grouping and blindspot detection
- `POST /api/cron` → Orchestrate all three (ingest → enrich → cluster)

---

## 3. DATABASE CONTENT & SCHEMA

### Sources Table (20 rows)
```
Sources seeded in database:

NIGERIAN SOURCES (13):
- Punch Nigeria (center, high factuality)
- Premium Times (center, high factuality)
- The Guardian Nigeria (center, high factuality)
- Vanguard Nigeria (center, mixed) 
- ThisDay Live (center-right, high)
- Daily Trust (center, high)
- BusinessDay NG (center, high)
- Sahara Reporters (left, mixed)
- Channels TV (center, high)
- NAN Nigeria (center-right, mixed)
- The Cable (center, high)
- Nairametrics (center, high)
- TechCabal (center, high)

GLOBAL/AFRICA SOURCES (7):
- BBC News (center, very-high factuality)
- Reuters (center, very-high)
- Al Jazeera (center-left, high)
- CNN (center-left, high)
- The Guardian UK (left, high)
```

Each source has:
- name, domain, rss_url
- country, region (nigeria|africa|global)
- bias_label, bias_score (-3 to +3)
- factuality, factuality_score (0-100)
- mbfc_rated, ai_rated (boolean)
- logo_url (placeholder)

### Articles Table (~240+ rows)
Each article has:
```
- id (uuid)
- source_id (foreign key)
- cluster_id (foreign key to story_clusters)
- url, url_hash, title, description, image_url, author, published_at
- status: 'pending' | 'enriched' | 'failed'

[AI-ENRICHED FIELDS - populated after /api/enrich]
- summary (3-sentence AI summary)
- category: politics|business|economy|security|tech|sports|entertainment|health|environment|diaspora|general
- sentiment: positive|negative|neutral
- bias_score (-2.0 to +2.0, article-level bias from AI)
- bias_signals (array of phrases showing bias)
- ng_relevance (0.0-1.0 score, how relevant to Nigeria)
- ng_relevance_reason (1-sentence explanation)
- embedding (768-dimensional vector for similarity search)
- enriched_at (timestamp)
```

### Story_Clusters Table (~25 clusters)
```
Each cluster groups 2+ related articles:
- headline (AI-generated from highest-relevance article)
- summary, summary_left, summary_center, summary_right
- category, article_count, source_count
- left_count, center_count, right_count
- has_left, has_center, has_right (boolean coverage flags)
- is_blindspot (boolean)
- blindspot_lean ('left'|'center'|'right'|null - which perspective is missing)
- ng_relevance (0.0-1.0)
- first_seen_at, last_updated_at (timestamps)
```

### User_Reads Table (empty, ready)
```
- id (uuid)
- user_id (from Supabase Auth)
- article_id, cluster_id
- source_bias (snapshot of source bias at read time)
- read_at (timestamp)
```

---

## 4. API RESPONSE EXAMPLES

### GET /api/clusters (not yet built - needed for UI)
Should return array of clustered stories with all articles linked.

**Suggested Query:**
```typescript
// Fetch story clusters with articles
const { data } = await supabase
  .from('story_clusters')
  .select(`
    id, headline, summary, category, article_count, source_count,
    left_count, center_count, right_count,
    is_blindspot, blindspot_lean, ng_relevance,
    articles(id, title, url, source_id, summary, bias_score, ng_relevance, sources(name, bias_label, factuality))
  `)
  .order('last_updated_at', { ascending: false })
  .limit(20);
```

---

## 5. COLOR PALETTE & TYPOGRAPHY

### Colors
```css
--navy-950: #050D1A    /* Background */
--navy-900: #0A1628    /* Cards */
--navy-800: #0F2040
--gold-500: #E8B800    /* Accent, CTAs */
--white: #FFFFFF
--gray-400: #8A94A6

/* Bias colors */
--bias-left: #3B82F6        /* Blue */
--bias-center-left: #60A5FA /* Light blue */
--bias-center: #6B7280      /* Gray */
--bias-center-right: #F97316 /* Orange */
--bias-right: #EF4444       /* Red */

/* Factuality colors */
--fact-very-high: #10B981   /* Emerald */
--fact-high: #34D399
--fact-mixed: #F59E0B       /* Amber */
--fact-low: #EF4444         /* Red */
```

### Fonts
- **Headlines**: Playfair Display (serif, bold)
- **Body**: DM Sans (sans-serif, regular/medium)

---

## 6. CORE UI COMPONENTS NEEDED

### 6.1 BiasBar.tsx
**Purpose**: Show left/center/right coverage proportions as animated bar

**Props:**
```typescript
{
  left: number          // count of left-bias articles
  center: number        // count of center articles
  right: number         // count of right-bias articles
  isBlindspot?: boolean // show gold badge if true
  blindspotLean?: 'left'|'center'|'right'
}
```

**Design:**
- Three horizontal segments: blue | gray | red
- Each segment width ∝ article count for that lean
- Animate in on mount (0.2s per segment, staggered)
- Hover: show tooltip with exact count + percentage
- If isBlindspot=true: show gold "BLINDSPOT" badge + lean label

**Example:** 12 left : 8 center : 3 right
```
[====== LEFT ======|===== CENTER =====|= RIGHT =|  BLINDSPOT
    60%  |           40%      |  15%
```

### 6.2 StoryCard.tsx
**Purpose**: Main feed card (Ground News style)

**Props:**
```typescript
{
  id: string
  headline: string
  category: string
  imageUrl?: string
  sourceCount: number
  leftCount: number
  centerCount: number
  rightCount: number
  isBlindspot: boolean
  blindspotLean?: string
  ngRelevance: number
  timeAgo: string  // e.g., "2 hours ago"
}
```

**Layout:**
```
┌─────────────────────────────────────────┐
│ [POLITICS] [🚨 BLINDSPOT - Right]        │
├─────────────────────────────────────────┤
│ Nigeria Inflation Hits 10-Year High      │  (Playfair Display, 20px)
│ Nigeria's currency continues collapse   │  (clamp 2 lines)
├─────────────────────────────────────────┤
│ 🔗 12 sources  •  2 hours ago            │
│ ┌───────────────────────────────────────┐│
│ │[🔵 8][⚫ 3][🔴 1]      Factuality: ⭐⭐⭐⭐ 🏴 │  (BiasBar + FactualityBadge)
│ └───────────────────────────────────────┘│
└─────────────────────────────────────────┘

On hover: lift up slightly (translateY -2px), gold border appears
```

**Animations:**
- Fade in on mount with stagger (0.1s delay per card)
- Hover: scale 1.02, gold shadow

### 6.3 BlindspotBanner.tsx
**Purpose**: Gold warning banner for blindspot stories

**Props:**
```typescript
{
  leanMissing: 'left'|'center'|'right'
  storyTitle?: string
}
```

**Design:**
- Full-width, gold background (#E8B800), navy text
- Icon: eye-slash
- Text: "Blindspot Alert — {{leanMissing}} media is not covering this story"
- Slide down animation on mount
- Icon pulses continuously

### 6.4 FactualityBadge.tsx
**Purpose**: Show source factuality

**Props:**
```typescript
{
  factuality: 'very-high'|'high'|'mixed'|'low'|'very-low'
  factualityScore: number  // 0-100
}
```

**Design:**
- Star icon + label text
- Color-coded: very-high=emerald, high=green, mixed=amber, low/very-low=red
- Tooltip on hover with score percentage

### 6.5 BiasChip.tsx
**Purpose**: Inline bias label

**Props:**
```typescript
{ bias_label: string }
```

**Design:**
- Pill-shaped badge
- Color-mapped to bias scale
- Text: "Left-leaning", "Center", "Right-leaning", etc.

### 6.6 SourceCount.tsx
**Purpose**: "12 sources" indicator

**Props:**
```typescript
{ count: number }
```

**Design:**
- Icon: stack/layers
- Text: "{{count}} sources"
- Tooltip: shows source names on hover

### 6.7 NigerianLens.tsx
**Purpose**: Filter slider for Nigerian relevance

**Props:**
```typescript
{
  value: number  // 0-100
  onChange: (val: number) => void
}
```

**Design:**
- Slider 0-100%
- Label: "Nigerian Relevance"
- Icon: 🇳🇬
- Use Radix-UI slider

### 6.8 CoverageSpectrum.tsx
**Purpose**: Three-column breakdown of left/center/right coverage

**Props:**
```typescript
{
  summary_left?: string
  summary_center?: string
  summary_right?: string
  leftCount: number
  centerCount: number
  rightCount: number
  isBlindspot: boolean
  blindspotLean?: string
}
```

**Layout:**
```
┌─────────────────┬─────────────────┬─────────────────┐
│   LEFT LEAN     │      CENTER     │   RIGHT LEAN    │
│   (2 sources)   │   (5 sources)   │   (1 source)    │
├─────────────────┼─────────────────┼─────────────────┤
│ BBC, CNN report │ Reuters, AFP    │ (No coverage)   │
│ on corruption   │ report neutral  │ [BLINDSPOT]     │
│ in government   │ economic data   │ Missing voice   │
└─────────────────┴─────────────────┴─────────────────┘
```

---

## 7. PAGE STRUCTURES

### 7.1 Home Page `/`
```
Fixed Navbar
  ├─ Logo "Naija" (gold) + "Pulse" (white)
  ├─ Nav: All | Politics | Business | Economy | Security | Tech | Sports | Entertainment | Health
  └─ Search, Nigerian Lens toggle, Auth

Hero Section
  ├─ "See Every Side of Every Story"
  ├─ Animated BiasBar demo
  └─ Scroll prompt

Main Feed
  ├─ Category tabs (horizontal)
  └─ Story cards (2-column grid, desktop; 1-column mobile)
  └─ Infinite scroll (load 20 more on scroll to bottom)

Sidebar (desktop only)
  ├─ Trending topics
  ├─ Top sources by factuality
  └─ Nigerian Lens slider (0-100%)

Footer
  ├─ About NaijaPulse
  ├─ Privacy, Terms
  └─ Social links
```

### 7.2 Story Detail `/story/[id]`
```
Breadcrumb: Home > Category > Story

Header
  ├─ Headline (Playfair Display, huge)
  ├─ BlindspotBanner (if applicable)
  └─ "Covered by X sources" | Last updated

Coverage Stats
  ├─ Large animated BiasBar
  ├─ Source count breakdown
  └─ Categories covered

Tabs
  ├─ All Sources (list view)
  │   └─ Each article: source name | bias chip | factuality badge | published | link
  ├─ Left / Center / Right (perspective summaries)
  │   └─ CoverageSpectrum component
  └─ Coverage Map (Phase 2 placeholder)

Related Stories
  └─ 3-5 other story cards at bottom
```

### 7.3 Blindspots Page `/blindspots`
```
Hero: "Blindspots in Coverage"
  └─ Explanation: "Stories where one political perspective is missing"

Filter Tabs
  ├─ All Blindspots
  ├─ Missing Left
  ├─ Missing Center
  └─ Missing Right

Feed
  └─ Story cards (all have BlindspotBanner)
  └─ Sorted by most recent

Explainer Card
  └─ "Why does this matter?" → popover with education text
```

### 7.4 Source Profile `/source/[domain]`
```
Header
  ├─ Logo + source name
  ├─ Country flag
  └─ MBFC-rated or AI-rated badge

Ratings
  ├─ Large BiasBar (single source)
  ├─ Factuality: ⭐⭐⭐⭐ + score
  └─ Ownership info, description

Stats
  ├─ Articles indexed: 23
  ├─ Avg bias over time (chart placeholder)
  └─ Last updated: 2 hours ago

Recent Articles
  └─ Last 10 articles from this source
```

---

## 8. DATA FETCHING PATTERNS

### Server-Side (strongly preferred for pages)
```typescript
// src/app/story/[id]/page.tsx
import { createServiceClient } from '@/lib/supabase/server';

export default async function StoryPage({ params: { id } }) {
  const supabase = await createServiceClient();
  
  const { data: story } = await supabase
    .from('story_clusters')
    .select(`
      *,
      articles(
        id, title, url, source_id, summary, bias_score, sentiment, ng_relevance,
        sources(name, bias_label, factuality, factuality_score, logo_url)
      )
    `)
    .eq('id', id)
    .single();
    
  return <StoryDetail story={story} />;
}
```

### Client-Side (for infinite scroll, filters)
```typescript
// src/hooks/useStories.ts
import { createBrowserClient } from '@/lib/supabase/client';

export function useStories(category, ngRelevanceMin, biasFilter) {
  const [stories, setStories] = useState([]);
  const [page, setPage] = useState(0);
  
  useEffect(() => {
    const supabase = createBrowserClient();
    let query = supabase.from('story_clusters').select(`...`);
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (ngRelevanceMin > 0) {
      query = query.gte('ng_relevance', ngRelevanceMin / 100);
    }
    
    query
      .order('last_updated_at', { ascending: false })
      .range(page * 20, (page + 1) * 20)
      .then(({ data }) => setStories(prev => [...prev, ...data]));
  }, [page, category, ngRelevanceMin, biasFilter]);
  
  return { stories, loadMore: () => setPage(p => p + 1) };
}
```

---

## 9. ANIMATION SPECS

### Tailwind Classes & Keyframes (in globals.css)
```css
@keyframes biasFill {
  0% { width: 0%; }
  100% { width: var(--fill-width); }
}

@keyframes fadeUp {
  0% { opacity: 0; transform: translateY(16px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  0% { opacity: 0; transform: translateX(-12px); }
  100% { opacity: 1; transform: translateX(0); }
}

/* Use in components */
<BiasBar className="animate-bias-fill" />
<StoryCard className="animate-fade-up" style={{ animationDelay: `${index * 100}ms` }} />
```

---

## 10. KNOWN DATA AVAILABLE NOW

**Total articles in DB**: ~240+
- Status: ~215 enriched, ~25 pending, ~0 failed
- Clustered into: ~25 story clusters
- Categories: politics, business, security, tech, etc.
- Bias range: -2.0 (far left) to +2.0 (far right)
- Relevance: 0.0-1.0 (low to high Nigeria relevance)

**All 20 sources active** with:
- Bias labels (left, center-left, center, center-right, right)
- Factuality scores (40-92 out of 100)
- Ownership info, descriptions, logo URLs (some placeholders)

---

## 11. NEXT STEPS FOR UI BUILD

1. **Create `/src/lib/supabase/client.ts`** (browser-safe client, if not exists)
2. **Build components in `/src/components/ui/`**:
   - BiasBar (most critical, used everywhere)
   - StoryCard
   - BlindspotBanner
   - FactualityBadge
   - Others (BiasChip, SourceCount, NigerianLens, CoverageSpectrum)

3. **Build page components**:
   - Home: Feed with infinite scroll + category filters
   - Story detail: Display cluster with perspectives
   - Blindspots: Filter by missing lean
   - Source profile: Show source stats + recent articles

4. **Add routes if needed**:
   - `GET /api/clusters` (list clustered stories with pagination)
   - `GET /api/galleries` (future recommendation engine)

5. **Testing**: Write E2E tests in `/tests/e2e/`

---

## 12. DEPLOYMENT CHECKLIST

- [ ] Set real Supabase credentials in production
- [ ] Deploy to Vercel (cron will auto-run every 30 min)
- [ ] Configure Auth (enable Supabase GitHub/Google/Email login)
- [ ] Set up custom domain DNS
- [ ] Monitor `/api/cron` logs in Vercel dashboard
- [ ] Load test on production (InfiniteScroll, clustering performance)

---

**Ready to build!** This document has everything needed to generate frontend UI code.
