import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { icons } from '../../components/icons.jsx'
import { useGsapReveal } from '../../hooks/useGsapReveal.js'
import { listDocuments } from '../../lib/api.js'

const dateFormat = new Intl.DateTimeFormat('en', { dateStyle: 'medium' })

export default function DashboardHome() {
  const [documents, setDocuments] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  // Re-runs once the rows actually exist, so GSAP animates real elements.
  const scope = useGsapReveal(`${status}:${documents.length}`)

  useEffect(() => {
    let active = true

    listDocuments()
      .then((data) => {
        if (!active) return
        setDocuments(data)
        setStatus('ready')
      })
      .catch((loadError) => {
        if (!active) return
        setError(loadError.message)
        setStatus('error')
      })

    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(
    () => [
      { label: 'Documents', value: documents.length },
      { label: 'Presentations', value: documents.filter((item) => item.kind === 'deck').length },
      { label: 'Written docs', value: documents.filter((item) => item.kind === 'document').length },
      { label: 'Exported', value: documents.filter((item) => item.lastExportFormat).length },
    ],
    [documents],
  )

  return (
    <div ref={scope}>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl text-ink-950">Your workspace</h1>
          <p className="mt-2 text-sm text-ink-600">
            Generate a deck or a document, then export it to PowerPoint, Word or PDF.
          </p>
        </div>

        <Link to="/app/new" className="btn btn-primary">
          New document
          <span className="h-4 w-4">{icons.arrow}</span>
        </Link>
      </header>

      <div className="card mt-10 overflow-hidden bg-ink-950/12">
        <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} data-reveal className="bg-cream-50 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">{stat.label}</p>
              <p className="mt-2 font-display text-3xl text-ink-950">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-lg text-ink-950">Recent</h2>

        {status === 'loading' ? <p className="mt-4 text-sm text-ink-500">Loading…</p> : null}

        {status === 'error' ? (
          <div
            className="mt-4 flex items-start gap-2.5 rounded-xl border border-ink-950/12 bg-cream-50 px-4 py-3"
            role="alert"
          >
            <span className="mt-0.5 h-4 w-4 shrink-0 text-ink-700">{icons.alert}</span>
            <p className="text-sm text-ink-900">{error}</p>
          </div>
        ) : null}

        {status === 'ready' && documents.length === 0 ? (
          <div className="card mt-4 px-6 py-12 text-center">
            <p className="font-display text-lg text-ink-950">Nothing here yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-600">
              Describe what you need — a board update, a project brief, a training session — or paste material you
              already have and let Levitron structure it.
            </p>
            <Link to="/app/new" className="btn btn-primary mt-6">
              Create your first one
              <span className="h-4 w-4">{icons.arrow}</span>
            </Link>
          </div>
        ) : null}

        {status === 'ready' && documents.length > 0 ? (
          <div className="card mt-4 divide-y divide-ink-950/8 overflow-hidden">
            {documents.map((item) => (
              <Link
                key={item.id}
                to={`/app/documents/${item.id}`}
                data-reveal
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-cream-100"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream-200 text-ink-800">
                  <span className="h-5 w-5">{item.kind === 'deck' ? icons.chart : icons.terminal}</span>
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-ink-950">{item.title}</span>
                  <span className="mt-0.5 block text-xs text-ink-500">
                    {item.kind === 'deck' ? `${item.slideCount} slides` : `${item.sectionCount} sections`}
                    {item.lastExportFormat ? ` · last export ${item.lastExportFormat.toUpperCase()}` : ''}
                  </span>
                </span>

                <span className="hidden shrink-0 text-xs text-ink-400 sm:block">
                  {dateFormat.format(new Date(item.updatedAt))}
                </span>

                <span className="h-4 w-4 shrink-0 text-ink-400">{icons.arrow}</span>
              </Link>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  )
}
