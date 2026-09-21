import { useEffect, useState } from 'react'

import { getStats } from '../lib/api.js'
import { fallbackStats } from '../data/content.js'

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })

export default function Stats() {
  const [stats, setStats] = useState(fallbackStats)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    let active = true

    getStats()
      .then((data) => {
        if (!active) return
        setStats({ ...fallbackStats, ...data })
        setIsLive(true)
      })
      .catch(() => {
        if (active) setIsLive(false)
      })

    return () => {
      active = false
    }
  }, [])

  const items = [
    { label: 'Decks generated', value: compact.format(stats.decksGenerated) },
    { label: 'Slides rendered', value: compact.format(stats.slidesGenerated) },
    { label: 'Contributors', value: compact.format(stats.contributors) },
    { label: 'Avg render', value: `${(stats.averageRenderMs / 1000).toFixed(1)}s` },
  ]

  return (
    <section className="relative pb-24 sm:pb-32">
      <div className="shell">
        <div className="reveal relative overflow-hidden rounded-[1.75rem] border border-ash-950/8 bg-cream-100 px-6 py-10 sm:px-10">
          <div aria-hidden="true" className="animate-ember absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,59,33,0.28),transparent_65%)] blur-2xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-medium text-ash-600">
              Numbers straight from the API
              <span className="ml-2 font-mono text-xs text-ash-400">GET /api/stats</span>
            </p>
            <span className="chip">
              <span className={`h-1.5 w-1.5 rounded-full ${isLive ? 'bg-lava-500' : 'bg-ash-400'}`} />
              {isLive ? 'connected' : 'offline fallback'}
            </span>
          </div>

          <dl className="relative mt-9 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <div key={item.label}>
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-ash-400">{item.label}</dt>
                <dd className="mt-2 font-display text-4xl text-ash-950 sm:text-5xl">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
