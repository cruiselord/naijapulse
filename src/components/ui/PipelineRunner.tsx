'use client'

import { useState } from 'react'

interface PipelineStep {
  name: string
  status: 'success' | 'error'
  result?: any
  error?: string
  duration_ms: number
}

export function PipelineRunner() {
  const [running, setRunning] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'success' | 'partial' | 'error'>('idle')
  const [steps, setSteps] = useState<PipelineStep[]>([])

  async function runPipeline() {
    setRunning(true)
    setMessage('Starting full pipeline: ingest, enrich, cluster...')
    setStatus('idle')
    setSteps([])

    try {
      const res = await fetch('/api/full-process', { method: 'POST' })
      const json = await res.json()

      if (!res.ok) {
        setStatus('error')
        setMessage(json?.error ?? 'Pipeline failed')
      } else {
        setStatus(json.status ?? 'success')
        setMessage(json.status === 'success' ? 'Pipeline completed successfully' : 'Pipeline completed with warnings')
        setSteps(json.steps ?? [])
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      setStatus('error')
      setMessage(`Pipeline failed: ${errorMessage}`)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="rounded-2xl bg-navy-900 border border-navy-800 p-5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Refresh News Pipeline</h2>
          <p className="text-sm text-gray-400 max-w-2xl">
            Fetch the latest RSS articles, enrich new content with AI, and cluster stories for the feed.
          </p>
        </div>
        <button
          type="button"
          disabled={running}
          onClick={runPipeline}
          className="inline-flex items-center justify-center rounded-full bg-gold-500 px-5 py-2 text-sm font-bold text-navy-950 transition hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {running ? 'Running pipeline…' : 'Run Full Pipeline'}
        </button>
      </div>

      {message && (
        <div className="mt-4 rounded-xl border border-navy-800 bg-navy-950 p-4 text-sm text-gray-300">
          <p>{message}</p>
          {status === 'success' && <p className="mt-2 text-xs text-emerald-300">All steps completed successfully.</p>}
          {status === 'partial' && <p className="mt-2 text-xs text-amber-300">Some steps completed with warnings. Review the details below.</p>}
          {status === 'error' && <p className="mt-2 text-xs text-red-400">The pipeline encountered an error.</p>}
        </div>
      )}

      {steps.length > 0 && (
        <div className="mt-4 space-y-3">
          {steps.map(step => (
            <div key={step.name} className="rounded-xl border border-navy-800 bg-navy-950 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white capitalize">{step.name.replace('-', ' ')}</p>
                  <p className="text-[11px] text-gray-500">{step.duration_ms} ms</p>
                </div>
                <span className={step.status === 'success' ? 'text-emerald-400' : 'text-red-400'}>
                  {step.status.toUpperCase()}
                </span>
              </div>
              {step.error && <p className="mt-2 text-[11px] text-red-400">{step.error}</p>}
              {step.result && typeof step.result === 'object' && (
                <pre className="mt-2 overflow-x-auto rounded-lg bg-navy-900 p-2 text-[11px] text-gray-400">{JSON.stringify(step.result, null, 2)}</pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
