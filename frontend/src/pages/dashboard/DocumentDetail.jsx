import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import PresenterMode from '../../components/PresenterMode.jsx'
import SlidePreview from '../../components/SlidePreview.jsx'
import ThemePicker from '../../components/ThemePicker.jsx'
import { SectionListEditor, SlideListEditor } from '../../components/OutlineEditor.jsx'
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
  const [slides, setSlides] = useState([])
  const [sections, setSections] = useState([])
  const [formats, setFormats] = useState([])
  const [themes, setThemes] = useState([])
  const [title, setTitle] = useState('')
  const [presenting, setPresenting] = useState(false)
  const [startAt, setStartAt] = useState(0)

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
        setSlides(loaded.slides ?? [])
        setSections(loaded.sections ?? [])
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

  const dirty = useMemo(() => {
    if (!doc) return false

    return doc.kind === 'deck'
      ? JSON.stringify(slides) !== JSON.stringify(doc.slides)
      : JSON.stringify(sections) !== JSON.stringify(doc.sections)
  }, [doc, slides, sections])

  // Losing edits to a stray refresh would be worse than the browser prompt.
  useEffect(() => {
    if (!dirty) return undefined

    function onBeforeUnload(event) {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  async function handleSave() {
    if (!doc || !dirty) return

    setSaving(true)
    setError('')
    setNotice('')

    try {
      const updated = await updateDocument(id, doc.kind === 'deck' ? { slides } : { sections })
      setDoc(updated)
      setSlides(updated.slides ?? [])
      setSections(updated.sections ?? [])
      setNotice('Changes saved.')
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  function handleRevert() {
    if (!doc) return

    setSlides(doc.slides ?? [])
    setSections(doc.sections ?? [])
    setTitle(doc.title)
    setNotice('Reverted to the saved version.')
    setError('')
  }

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
      if (dirty) await handleSave()

      const filename = await exportDocument({ id, format })
      setNotice(`Downloaded ${filename}`)

      const refreshed = await getDocument(id).catch(() => null)
      if (refreshed) {
        setDoc(refreshed)
        setSlides(refreshed.slides ?? [])
        setSections(refreshed.sections ?? [])
      }
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
      {presenting ? (
        <PresenterMode
          slides={slides}
          theme={activeTheme}
          title={doc.title}
          startIndex={startAt}
          onClose={() => setPresenting(false)}
        />
      ) : null}

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
          Save title
        </button>
      </form>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
        <span className="chip">
          {doc.kind === 'deck' ? `${slides.length} slides` : `${sections.length} sections`}
        </span>
        {activeTheme ? (
          <span className="chip">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: `#${activeTheme.accent}` }} />
            {activeTheme.name}
          </span>
        ) : null}
        <span className="chip">
          <span className="h-1.5 w-1.5 rounded-full bg-ink-950" />
          {doc.source === 'ai' ? `AI · ${doc.model}` : 'Built-in engine'}
        </span>
        {doc.hasInput ? <span className="chip">From your content</span> : null}
        <span className="chip">Updated {dateFormat.format(new Date(doc.updatedAt))}</span>
      </div>

      {/* Sticky so Save is always reachable, however long the outline is. */}
      <div className="sticky top-16 z-30 -mx-5 mt-6 flex flex-wrap items-center gap-3 border-y border-ink-950/10 bg-cream-100/95 px-5 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:top-0">
        <button type="button" className="btn btn-primary" onClick={handleSave} disabled={!dirty || saving}>
          {saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
        </button>

        <button type="button" className="btn btn-ghost" onClick={handleRevert} disabled={!dirty || saving}>
          Revert
        </button>

        {dirty ? (
          <span className="flex items-center gap-1.5 text-xs font-medium text-ink-700">
            <span className="h-2 w-2 rounded-full bg-ink-950" />
            Unsaved changes
          </span>
        ) : null}

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {doc.kind === 'deck' ? (
            <button type="button" className="btn btn-outline" onClick={() => setPresenting(true)} disabled={!slides.length}>
              Present
            </button>
          ) : null}

          {formats.map((format) => (
            <button
              key={format.name}
              type="button"
              className="btn btn-outline"
              onClick={() => handleExport(format.name)}
              disabled={Boolean(exporting)}
            >
              <span className="h-4 w-4">{icons.download}</span>
              {exporting === format.name ? 'Building…' : format.label}
            </button>
          ))}

          <button
            type="button"
            className="btn btn-ghost text-ink-500 hover:text-ink-950"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
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
              GSAP-animated in the browser. Exported files keep the theme, not the motion.
            </p>
          </div>

          <div className="mt-4">
            <SlidePreview
              slides={slides}
              theme={activeTheme}
              onPresent={(index) => {
                setStartAt(index ?? 0)
                setPresenting(true)
              }}
            />
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

      <section className="mt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg text-ink-950">{doc.kind === 'deck' ? 'Edit slides' : 'Edit sections'}</h2>
          <p className="text-xs text-ink-500">Changes stay local until you press Save changes.</p>
        </div>

        <div className="mt-4">
          {doc.kind === 'deck' ? (
            <SlideListEditor slides={slides} onChange={setSlides} />
          ) : (
            <SectionListEditor sections={sections} onChange={setSections} />
          )}
        </div>
      </section>
    </>
  )
}
