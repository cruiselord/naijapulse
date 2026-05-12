# NaijaPulse — Nigerian News Aggregator with AI Bias Detection

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/Typecript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com/)
[![Ollama](https://img.shields.io/badge/Ollama-LLM-orange?logo=ollama)](https://ollama.com/)

**NaijaPulse** is a Nigerian-lens news aggregator that shows every perspective on major stories — inspired by Ground News. It aggregates news from 20+ Nigerian and global sources, uses AI to detect bias in articles, and flags "blindspots" (missing perspectives).

---

## 🌟 Features

- **Multi-Perspective Coverage**: Left/center/right political bias detection
- **AI Enrichment**: Automatic summary, category, sentiment, and relevance scoring
- **Story Clustering**: Groups similar articles into cohesive stories
- **Blindspot Detection**: Flags coverage gaps (missing ideological perspectives)
- **Nigerian Lens Filter**: Filter stories by Nigerian relevance (0.0–1.0)
- **Real-time RSS Ingestion**: Fetches articles every 30 minutes via cron

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes, Supabase (PostgreSQL + pgvector) |
| **AI/ML** | Ollama (Llama 3.1, Nomic Embed), Cosine Similarity Clustering |
| **Deployment** | Vercel (serverless functions), Supabase (database) |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- Ollama (for local AI inference)
- Supabase project (free tier)

### 1. Clone & Install

```bash
git clone https://github.com/cruiselord/naijapulse.git
cd naijapulse

# Install dependencies
pnpm install
```

### 2. Configure Environment

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Ollama (required for AI enrichment)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3.5:0.8b
OLLAMA_EMBED_MODEL=nomic-embed-text

# App settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=generate_a_random_32_char_string_here

# Ingestion settings
RSS_FETCH_INTERVAL_MINUTES=30
CLUSTER_SIMILARITY_THRESHOLD=0.82
CLUSTER_WINDOW_HOURS=48
MAX_ARTICLES_PER_FETCH=50
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the migrations in `supabase/migrations/`:
   - `001_extensions.sql` (pgvector)
   - `002_sources.sql`
   - `003_articles.sql`
   - `004_clusters.sql`
   - `005_user_reads.sql`
   - `006_seed_sources.sql`

3. Copy your Supabase credentials to `.env.local`

### 4. Start Ollama

```bash
# Pull required models
ollama pull qwen3.5:0.8b
ollama pull nomic-embed-text

# Verify models are available
ollama list
```

### 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📖 Developer Onboarding Guide

### Project Structure

```
naijapulse/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes (ingest, enrich, cluster, cron)
│   │   ├── blindspots/        # Blindspots page
│   │   ├── source/[domain]/   # Source detail page
│   │   ├── story/[id]/        # Story detail page
│   │   └── ...                # Other pages
│   ├── components/            # React components
│   │   ├── feed/              # Story feed components
│   │   ├── layout/            # Navbar, Footer
│   │   ├── ui/                # Reusable UI components
│   │   └── widgets/           # Dashboard widgets
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Business logic
│   │   ├── ollama/            # AI enrichment & embeddings
│   │   ├── ingestion/         # RSS feed parsing
│   │   ├── clustering/        # Story grouping & blindspot detection
│   │   ├── supabase/          # Database clients
│   │   └── pipeline/          # Full pipeline orchestration
│   └── types/                 # TypeScript type definitions
├── supabase/
│   └── migrations/            # Database schema migrations
├── tests/
│   ├── e2e/                   # Playwright end-to-end tests
│   └── unit/                  # Vitest unit tests
├── .agents/                   # Claude Code agent skills
└── naijapulse/                # Duplicate project root (legacy)
```

### Core Workflows

#### 1. Ingest RSS Feeds

Fetches new articles from 20+ Nigerian news sources:

```bash
pnpm ingest  # or POST /api/ingest
```

**What it does:**
- Fetches RSS feeds from active sources
- Deduplicates by URL hash
- Inserts new articles with `status: 'pending'`

#### 2. Enrich with AI

Analyzes pending articles using Ollama:

```bash
pnpm enrich  # or POST /api/enrich
```

**What it does:**
- Calls Ollama LLM for summary, category, sentiment, bias analysis
- Generates embeddings for clustering
- Updates article with enriched metadata
- Marks article as `status: 'enriched'`

#### 3. Cluster Stories

Groups similar articles into stories:

```bash
pnpm cluster  # or POST /api/cluster
```

**What it does:**
- Uses cosine similarity (threshold: 0.82) to group articles
- Creates story clusters with multi-perspective summaries
- Detects blindspots (missing left/center/right coverage)
- Updates articles with `cluster_id`

#### 4. Run Full Pipeline

Orchestrates all three steps:

```bash
curl -X POST http://localhost:3000/api/full-process
```

**What it does:**
- Ingest → Enrich (up to 3 batches) → Cluster
- Returns detailed step-by-step results

---

## 🧪 Testing

### Unit Tests

```bash
pnpm test              # Run all unit tests
pnpm test:watch        # Watch mode
pnpm test:all          # Unit + E2E
```

### E2E Tests

```bash
pnpm test:e2e          # Run Playwright tests
pnpm test:e2e:ui       # Run with Playwright UI
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OLLAMA_BASE_URL`
   - `OLLAMA_MODEL`
   - `OLLAMA_EMBED_MODEL`
   - `CRON_SECRET`
4. Deploy

### Supabase Database Setup (Production)

Run migrations in order:

```sql
-- 1. Enable pgvector
supabase/migrations/001_extensions.sql

-- 2. Create tables
supabase/migrations/002_sources.sql
supabase/migrations/003_articles.sql
supabase/migrations/004_clusters.sql
supabase/migrations/005_user_reads.sql

-- 3. Seed sources
supabase/migrations/006_seed_sources.sql
```

---

## 📚 API Reference

### `/api/ingest` (POST)

Fetches new articles from RSS feeds.

**Response:**
```json
{
  "inserted": 126,
  "skipped": 105,
  "errors": []
}
```

### `/api/enrich` (POST)

Enriches pending articles with AI analysis.

**Query Params:**
- `limit` (optional): Max articles to process (default: 20)

**Response:**
```json
{
  "enriched": 20,
  "failed": 0,
  "message": "Processed 20 articles"
}
```

### `/api/cluster` (POST)

Groups similar articles into stories.

**Response:**
```json
{
  "clusters_created": 5,
  "articles_clustered": 42,
  "message": "Created 5 clusters, grouped 42 articles"
}
```

### `/api/full-process` (POST)

Runs the complete pipeline (ingest → enrich → cluster).

**Response:**
```json
{
  "status": "success",
  "timestamp": "2026-05-12T...",
  "total_duration_ms": 45000,
  "steps": [
    {
      "name": "ingest",
      "status": "success",
      "result": { "inserted": 126, "skipped": 105 },
      "duration_ms": 12000
    },
    {
      "name": "enrich-1",
      "status": "success",
      "result": { "enriched": 20, "failed": 0 },
      "duration_ms": 25000
    },
    {
      "name": "cluster",
      "status": "success",
      "result": { "clusters_created": 5, "articles_clustered": 42 },
      "duration_ms": 8000
    }
  ]
}
```

---

## 🎨 Design System

### Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Navy-950** | `#050D1A` | Background, cards |
| **Navy-900** | `#0F172A` | Sidebar, headers |
| **Navy-800** | `#1E293B` | Borders, accents |
| **Gold-500** | `#E8B800` | Primary, highlights |
| **Gold-400** | `#F5CC33` | Hover states |
| **Bias-Left** | `#EF4444` | Left-leaning bias |
| **Bias-Center** | `#F59E0B` | Center bias |
| **Bias-Right** | `#3B82F6` | Right-leaning bias |

### Typography

- **Headlines**: Playfair Display (serif)
- **Body**: DM Sans (sans-serif)
- **Code**: Fira Code (monospace)

---

## 🤝 Contributing

### Adding a New RSS Source

1. Add source to `supabase/migrations/006_seed_sources.sql`
2. Run migration to update database
3. Source will be picked up on next ingest cycle

### Adding a New Feature

1. Create feature branch: `git checkout -b feature/your-feature`
2. Implement changes
3. Add tests if applicable
4. Run `pnpm lint && pnpm test`
5. Commit: `git commit -m "feat: add your feature"`
6. Push: `git push origin feature/your-feature`

---

## 📝 Notes for AI Assistants (Claude Code, Copilot, etc.)

When working on this codebase:

1. **Always check existing patterns** in `src/components/` and `src/lib/`
2. **Use TypeScript types** from `src/types/index.ts`
3. **Follow naming conventions**:
   - Components: PascalCase (e.g., `StoryCard.tsx`)
   - Hooks: `useXxx` (e.g., `useStories.ts`)
   - Lib files: lowercase with hyphens (e.g., `blindspot/detector.ts`)
4. **Database queries**: Use Supabase client from `src/lib/supabase/server.ts`
5. **AI enrichment**: Always use Ollama client from `src/lib/ollama/client.ts`
6. **Testing**: Add unit tests in `tests/unit/` and E2E tests in `tests/e2e/`

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- Inspired by [Ground News](https://ground.news)
- Built with [Supabase](https://supabase.com), [Ollama](https://ollama.com), and [Next.js](https://nextjs.org)
- Nigerian news sources curated from media bias databases

---

**Made with ❤️ for Nigeria**
