import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import SlidePreview from '../../components/SlidePreview.jsx'
import ThemePicker from '../../components/ThemePicker.jsx'
import { icons } from '../../components/icons.jsx'
import {
  deleteDocument,
  exportDocument,
  getCapabilities,
  getDocument,
  updateDocument,
} from '../../lib/api.js'

const dateFormat = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' })

export default function DocumentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [doc, setDoc] = useState(null)
  const [formats, setFormats] = useState([])
  const [themes, setThemes] = useState([])
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const [themeSaving, setThemeSaving] = useState(false)
  const [exporting, setExporting] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let active = true

    setStatus('loading')
    setError('')

    Promise.all([getDocument(id), getCapabilities()])
      .then(([loaded, capabilities]) => {
        if (!active) return
        setDoc(loaded)
        setTitle(loaded.title)
        setFormats(capabilities.formats[loaded.kind] ?? [])
        setThemes(capabilities.themes ?? [])
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
  }, [id])

  async function handleTitleSave(event) {
    event.preventDefault()

    if (!doc || title.trim() === doc.title || !title.trim()) return

    setSaving(true)
    setError('')
    setNotice('')

    try {
      const updated = await updateDocument(id, { title: title.trim() })
      setDoc(updated)
      setTitle(updated.title)
      setNotice('Title saved.')
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleThemeChange(themeId) {
    if (!doc || themeId === doc.theme) return

    setThemeSaving(true)
    setError('')

    try {
      const updated = await updateDocument(id, { theme: themeId })
      setDoc(updated)
    } catch (themeError) {
      setError(themeError.message)
    } finally {
      setThemeSaving(false)
    }
  }

  async function handleExport(format) {
    setExporting(format)
    setError('')
    setNotice('')

    try {
      const filename = await exportDocument({ id, format })
      setNotice(`Downloaded ${filename}`)

      const refreshed = await getDocument(id).catch(() => null)
      if (refreshed) setDoc(refreshed)
    } catch (exportError) {
      setError(exportError.message)
    } finally {
      setExporting('')
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this document permanently? This cannot be undone.')) return

    setDeleting(true)
    setError('')

    try {
      await deleteDocument(id)
      navigate('/app', { replace: true })
    } catch (deleteError) {
      setError(deleteError.message)
      setDeleting(false)
    }
  }

  if (status === 'loading') {
    return <p className="text-sm text-ink-500">Loading…</p>
  }

  if (status === 'error' || !doc) {
    return (
      <>
        <div className="flex items-start gap-2.5 rounded-xl border border-ink-950/12 bg-cream-50 px-4 py-3" role="alert">
          <span className="mt-0.5 h-4 w-4 shrink-0 text-ink-700">{icons.alert}</span>
          <p className="text-sm text-ink-900">{error || 'That document could not be loaded.'}</p>
        </div>
        <Link to="/app" className="btn btn-outline mt-6">
          Back to dashboard
        </Link>
      </>
    )
  }

  const activeTheme = themes.find((theme) => theme.id === doc.theme)

  return (
    <>
      <nav className="text-sm text-ink-500">
        <Link to="/app" className="transition-colors hover:text-ink-950">
          Dashboard
        </Link>
        <span className="px-2">/</span>
        <span className="text-ink-900">{doc.kind === 'deck' ? 'Presentation' : 'Document'}</span>
      </nav>

      <form onSubmit={handleTitleSave} className="mt-4 flex flex-wrap items-center gap-3">
        <input
          className="field max-w-xl flex-1 font-display text-xl"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-label="Document title"
        />
        <button type="submit" className="btn btn-outline" disabled={saving || title.trim() === doc.title}>
          {saving ? 'Saving…' : 'Save title'}
        </button>
      </form>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
        <span className="chip">
          {doc.kind === 'deck' ? `${doc.slides.length} slides` : `${doc.sections.length} sections`}
        </span>
        {activeTheme ? (
          <span className="chip">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: `#${activeTheme.accent}` }} />
            {activeTheme.name} theme
          </span>
        ) : null}
        <span className="chip">
          <span className="h-1.5 w-1.5 rounded-full bg-ink-950" />
          {doc.source === 'ai' ? `AI · ${doc.model}` : 'Built-in draft engine'}
        </span>
        {doc.hasInput ? <span className="chip">From your content</span> : null}
        <span className="chip">Updated {dateFormat.format(new Date(doc.updatedAt))}</span>
        {doc.lastExportFormat ? <span className="chip">Last export {doc.lastExportFormat.toUpperCase()}</span> : null}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {formats.map((format) => (
          <button
            key={format.name}
            type="button"
            className="btn btn-primary"
            onClick={() => handleExport(format.name)}
            disabled={Boolean(exporting)}
          >
            <span className="h-4 w-4">{icons.download}</span>
            {exporting === format.name ? `Building ${format.label}…` : `Export ${format.label}`}
          </button>
        ))}

        <button
          type="button"
          className="btn btn-ghost ml-auto text-ink-500 hover:text-ink-950"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>

      {notice ? (
        <p
          className="mt-5 flex items-center gap-2 rounded-xl border border-ink-950/12 bg-cream-50 px-4 py-3 text-sm text-ink-800"
          role="status"
        >
          <span className="h-4 w-4 shrink-0 text-ink-950">{icons.check}</span>
          {notice}
        </p>
      ) : null}

      {error ? (
        <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-ink-950/12 bg-cream-50 px-4 py-3" role="alert">
          <span className="mt-0.5 h-4 w-4 shrink-0 text-ink-700">{icons.alert}</span>
          <p className="text-sm leading-relaxed text-ink-900">{error}</p>
        </div>
      ) : null}

      {doc.kind === 'deck' ? (
        <section className="mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg text-ink-950">Preview</h2>
            <p className="text-xs text-ink-500">
              Animated in the browser with GSAP. The exported file keeps the theme, not the motion.
            </p>
          </div>

          <div className="mt-4">
            <SlidePreview slides={doc.slides} theme={activeTheme} />
          </div>
        </section>
      ) : null}

      <section className="mt-12">
        <ThemePicker
          themes={themes}
          value={doc.theme}
          onChange={handleThemeChange}
          disabled={themeSaving}
          label={themeSaving ? 'Theme (saving…)' : 'Theme'}
        />
      </section>

      {doc.kind === 'deck' ? (
        <section className="mt-12 space-y-4">
          <h2 className="text-lg text-ink-950">Outline</h2>

          {doc.slides.map((slide, index) => (
            <article key={`${slide.heading}-${index}`} className="card p-6">
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-xs tabular-nums text-ink-400">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-lg text-ink-950">{slide.heading}</h3>
              </div>

              {slide.bullets.length ? (
                <ul className="mt-4 space-y-2 pl-9">
                  {slide.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2.5 text-sm leading-relaxed text-ink-700">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-400" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}

              {slide.notes ? (
                <p className="mt-4 border-l-2 border-ink-950/15 pl-4 text-xs italic leading-relaxed text-ink-500">
                  {slide.notes}
                </p>
              ) : null}
            </article>
          ))}
        </section>
      ) : (
        <section className="mt-12 space-y-4">
          <h2 className="text-lg text-ink-950">Contents</h2>

          {doc.sections.map((section) => (
            <article key={section.heading} className="card p-6">
              <h3 className="font-display text-lg text-ink-950">{section.heading}</h3>

              <div className="mt-3 space-y-3">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-relaxed text-ink-700">
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}
    </>
  )
}
