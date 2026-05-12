import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'About — NaijaPulse' }

const METHODOLOGY = [
  { icon: '📡', title: 'RSS Ingestion', body: 'We fetch articles every 30 minutes from 20+ Nigerian and global RSS feeds. Each article is deduplicated by URL hash so you never see the same story twice.' },
  { icon: '🤖', title: 'AI Enrichment', body: 'Each article is sent to a locally-running Llama 3.1 model via Ollama. The model extracts a neutral summary, category, sentiment, bias signals, and a Nigerian relevance score (0–1).' },
  { icon: '🔗', title: 'Story Clustering', body: 'We generate a text embedding for each article and group articles covering the same story using cosine similarity (threshold: 0.82) over a 48-hour rolling window.' },
  { icon: '⚖️', title: 'Bias Ratings', body: 'Source-level bias ratings come from Media Bias/Fact Check (MBFC), the gold standard for source-level media analysis. For sources MBFC hasn\'t rated, we use AI-generated ratings clearly labeled as such.' },
  { icon: '🕵️', title: 'Blindspot Detection', body: 'After clustering, we check which political lean buckets (Left / Center / Right) covered each story. If any lean has zero coverage and at least 2 others do, we flag the story as a Blindspot.' },
  { icon: '🇳🇬', title: 'Nigerian Lens', body: 'Every article gets a Nigerian relevance score. The Nigerian Lens filter lets you surface only stories most relevant to Nigeria, Nigerian diaspora, or African affairs.' },
]

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
      <section className="py-12 animate-fade-up">
        <h1 className="font-serif font-black text-4xl text-white mb-4">
          About <span className="text-gradient-gold">NaijaPulse</span>
        </h1>
        <p className="text-gray-300 text-[15px] leading-relaxed mb-3">
          NaijaPulse is Nigeria's first bias-aware news aggregator. We believe the news you 
          <em> don\'t</em> see shapes your worldview just as much as the news you do.
        </p>
        <p className="text-gray-400 text-[15px] leading-relaxed">
          By showing you left, center, and right-leaning coverage of the same story — and flagging when any 
          perspective is absent — we help you read the full picture, not just the half your algorithm shows you.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Our Methodology</h2>
        <div className="space-y-4">
          {METHODOLOGY.map((step, i) => (
            <div
              key={step.title}
              className="flex gap-4 p-5 rounded-xl bg-navy-900 border border-navy-800 animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="text-2xl flex-shrink-0">{step.icon}</span>
              <div>
                <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-gold-500/5 border border-gold-500/20 p-6 animate-fade-up">
        <h2 className="font-serif font-bold text-xl text-white mb-3">Limitations & Transparency</h2>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex gap-2"><span className="text-gold-500">·</span> AI-generated ratings are imperfect and should be treated as a starting point, not a verdict.</li>
          <li className="flex gap-2"><span className="text-gold-500">·</span> MBFC ratings reflect the source's overall output, not individual articles.</li>
          <li className="flex gap-2"><span className="text-gold-500">·</span> Clustering accuracy depends on embedding quality. Unrelated stories may occasionally be grouped.</li>
          <li className="flex gap-2"><span className="text-gold-500">·</span> We are in beta. Expect rough edges. Your feedback shapes the product.</li>
        </ul>
      </section>
    </main>
  )
}
