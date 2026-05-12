import Link from 'next/link'
import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import { getBiasColor, getBiasLabel, getFactualityColor } from '@/lib/utils'
import { BiasChip } from '@/components/ui/BiasChip'
import { FactualityBadge } from '@/components/ui/FactualityBadge'
import type { Source } from '@/types'

export const metadata: Metadata = { title: 'Sources — Media Bias Directory' }

export default async function SourcesPage() {
  const supabase = await createServiceClient()
  const { data } = await supabase
    .from('sources')
    .select('*')
    .eq('is_active', true)
    .order('factuality_score', { ascending: false })

  const sources = (data ?? []) as Source[]

  const byRegion = {
    nigeria: sources.filter(s => s.region === 'nigeria'),
    africa:  sources.filter(s => s.region === 'africa'),
    global:  sources.filter(s => s.region === 'global'),
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
      <section className="py-10 animate-fade-up">
        <h1 className="font-serif font-black text-4xl text-white mb-2">
          Source <span className="text-gradient-gold">Directory</span>
        </h1>
        <p className="text-gray-400 text-sm max-w-xl">
          All {sources.length} sources indexed by NaijaPulse with their bias and factuality ratings from 
          Media Bias/Fact Check (MBFC) or our AI analysis.
        </p>
      </section>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-8 p-4 rounded-xl bg-navy-900 border border-navy-800 animate-fade-up" style={{ animationDelay: '0.05s' }}>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest self-center">Bias Scale:</div>
        {(['far-left','left','center-left','center','center-right','right','far-right'] as const).map(l => (
          <span key={l} className="flex items-center gap-1 text-xs" style={{ color: getBiasColor(l) }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getBiasColor(l) }} />
            {getBiasLabel(l)}
          </span>
        ))}
      </div>

      {/* Sections by region */}
      {Object.entries(byRegion).map(([region, list]) => list.length === 0 ? null : (
        <section key={region} className="mb-10 animate-fade-up">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 pb-2 border-b border-navy-800 flex items-center gap-2">
            {region === 'nigeria' ? '🇳🇬' : region === 'africa' ? '🌍' : '🌐'} {region} Sources
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {list.map(source => (
              <Link
                key={source.id}
                href={`/source/${source.domain}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-navy-900 border border-navy-800 hover:border-gold-500/30 hover:bg-navy-800/60 transition-all group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 border"
                  style={{ backgroundColor: getBiasColor(source.bias_label) + '20', borderColor: getBiasColor(source.bias_label) + '30', color: getBiasColor(source.bias_label) }}
                >
                  {source.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-semibold text-white group-hover:text-gold-300 transition-colors truncate">{source.name}</p>
                    {source.mbfc_rated && (
                      <span className="text-[9px] font-bold text-emerald-500 uppercase">MBFC</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <BiasChip label={source.bias_label} compact />
                    <FactualityBadge factuality={source.factuality} compact />
                  </div>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-navy-600 group-hover:text-gold-500 flex-shrink-0 transition-colors">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
