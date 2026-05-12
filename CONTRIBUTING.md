# Contributing to NaijaPulse

Welcome! NaijaPulse is a Nigerian-lens news aggregator with AI bias detection. We're building a platform that shows every perspective on major stories. Here's how to get started.

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ ([download](https://nodejs.org/))
- **pnpm** 8+ (`npm install -g pnpm`)
- **Ollama** ([download](https://ollama.ai/)) — for local AI (LLaMA 3.1 inference)
- **Supabase Account** ([create free](https://supabase.com/)) — PostgreSQL database + auth
- **Git** — clone and contribute

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/naijapulse.git
cd naijapulse
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` (or create it with these values):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Ollama (AI/LLM)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2  # or llama3.1, etc.
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# Optional: Vercel (production only)
VERCEL_PROJECT_ID=
VERCEL_ORG_ID=
```

**Get Supabase Keys:**
1. Create a free project at [supabase.com](https://supabase.com)
2. Go to Settings → API to find `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Get `SUPABASE_SERVICE_ROLE_KEY` from Settings → API → Service role

**Start Ollama:**
```bash
ollama serve
# In a new terminal: ollama pull llama3.1 nomic-embed-text
```

### 3. Install & Run

```bash
# Install dependencies
pnpm install

# Run database migrations (one-time setup)
# See /supabase/migrations for schema
pnpm run migrate  # (if configured)

# Start development server
pnpm run dev

# Open http://localhost:3000
```

### 4. Test Everything Works

```bash
# Unit tests
pnpm run test

# End-to-end tests (Playwright)
pnpm run test:e2e

# Run the data pipeline manually
pnpm run ingest   # Fetch articles from RSS feeds
pnpm run enrich   # AI analysis (summary, bias, embeddings)
pnpm run cluster  # Group articles into stories, detect blindspots
```

---

## 📁 Project Structure

```
naijapulse/
├── src/
│   ├── app/              # Next.js app directory (pages + layouts)
│   ├── components/       # React components (feed, UI, widgets)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities & business logic
│   │   ├── supabase/     # Database queries
│   │   ├── blindspot/    # Blindspot detection logic
│   │   ├── clustering/   # Story clustering algorithm
│   │   ├── ingestion/    # RSS feed parsing
│   │   └── ollama/       # AI inference wrapper
│   └── types/            # TypeScript interfaces
├── supabase/
│   └── migrations/       # Database schema (PostgreSQL)
├── tests/
│   ├── e2e/              # Playwright tests (user flows)
│   └── unit/             # Jest/Vitest tests (logic)
└── public/               # Static assets
```

---

## 🔄 Data Pipeline

The app automatically ingests, enriches, and clusters news articles:

1. **Ingest** (`POST /api/ingest`)
   - Fetches articles from 20+ RSS feeds every 30 minutes
   - Deduplicates by URL + title

2. **Enrich** (`POST /api/enrich`)
   - Ollama summarizes each article
   - Detects political bias (left/center/right)
   - Categorizes content (politics, business, sports, etc.)
   - Generates vector embeddings for similarity matching

3. **Cluster** (`POST /api/cluster`)
   - Groups similar articles into stories (cosine similarity > 0.82)
   - Detects "blindspots" (missing perspectives)
   - Summarizes each story

---

## 🧪 Testing

```bash
# Run all tests
pnpm run test:all

# Watch mode (unit tests)
pnpm run test:watch

# E2E tests with UI
pnpm run test:e2e:ui
```

Key test files:
- [tests/unit/blindspot.test.ts](tests/unit/blindspot.test.ts) — blindspot detection
- [tests/unit/clustering.test.ts](tests/unit/clustering.test.ts) — story grouping
- [tests/e2e/home.spec.ts](tests/e2e/home.spec.ts) — user experience flows

---

## 💻 Development Workflow

### Making Changes

1. **Create a branch** for your feature/fix:
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes** and test locally:
   ```bash
   pnpm run dev
   pnpm run test
   pnpm run test:e2e --headed  # See browser
   ```

3. **Commit with a clear message:**
   ```bash
   git add .
   git commit -m "feat: add blindspot banner to story cards"
   ```

4. **Push and create a Pull Request:**
   ```bash
   git push origin feature/my-feature
   # Then create PR on GitHub
   ```

### Code Style

- **TypeScript** — strict mode enabled
- **Tailwind CSS** — utility-first styling
- **ESLint** — run `pnpm run lint`
- **Naming:** camelCase for functions/variables, PascalCase for components
- **Comments:** Add JSDoc for complex logic

---

## 🛠 Common Tasks

### Add a News Source

1. Add to `sources` table in Supabase
2. Add RSS feed URL and bias rating (e.g., -1.0 = left, 0 = center, 1.0 = right)
3. Next ingest cycle will fetch from it

### Fix a Bug

1. Identify the issue (check [GitHub Issues](https://github.com/your-username/naijapulse/issues))
2. Create a test that reproduces it
3. Fix the bug
4. Ensure tests pass
5. Open a PR

### Improve AI Accuracy

- Modify prompts in [src/lib/ollama/](src/lib/ollama/)
- Tune clustering threshold in [src/lib/clustering/](src/lib/clustering/)
- Adjust blindspot detection in [src/lib/blindspot/](src/lib/blindspot/)
- Test locally with `pnpm run test`

---

## 🐛 Debugging

### Check Database

```bash
# Open Supabase Studio (in browser)
# View articles, clusters, and user_reads tables
```

### Check Ollama

```bash
# Verify Ollama is running
curl http://localhost:11434/api/tags

# See available models
ollama list
```

### Check API Logs

```bash
# Terminal where you ran `pnpm run dev`
# Look for API route logs + errors
```

### Browser DevTools

- **Network tab** — check API responses
- **Console** — check JS errors
- **Lighthouse** — audit performance

---

## 📋 Checklist Before PR

- [ ] Code tested locally (`pnpm run test`, `pnpm run test:e2e`)
- [ ] Linting passes (`pnpm run lint`)
- [ ] No TypeScript errors
- [ ] Environment variables documented (if new)
- [ ] Database schema updated (if data changes)
- [ ] Commit messages are clear
- [ ] PR description explains the change

---

## 🤝 Code of Conduct

- Be respectful and inclusive
- Assume good intent
- Provide constructive feedback
- Ask for help when stuck
- Share knowledge with the team

---

## 📞 Getting Help

- **Questions?** Open a discussion in [GitHub Discussions](https://github.com/your-username/naijapulse/discussions)
- **Found a bug?** Create an [issue](https://github.com/your-username/naijapulse/issues)
- **Security concern?** Email privately (don't open public issue)

---

## 📚 Resources

- [NaijaPulse README](README.md) — project overview
- [Design Guide](DESIGN.md) — architecture & components
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Ollama Docs](https://github.com/jmorganca/ollama)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Happy coding! 🚀**
