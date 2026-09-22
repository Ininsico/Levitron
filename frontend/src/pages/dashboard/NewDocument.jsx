import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import GeneratingPanel from '../../components/GeneratingPanel.jsx'
import ThemePicker from '../../components/ThemePicker.jsx'
import { icons } from '../../components/icons.jsx'
import { useGsapReveal } from '../../hooks/useGsapReveal.js'
import { createDocument, getCapabilities } from '../../lib/api.js'

const KINDS = [
  {
    id: 'deck',
    title: 'Presentation',
    body: 'A slide outline with varied layouts, icons and speaker notes. Exports to PowerPoint and PDF.',
    formats: 'PowerPoint · PDF',
  },
  {
    id: 'document',
    title: 'Document',
    body: 'A written piece with sections and paragraphs. Exports to Word and PDF.',
    formats: 'Word · PDF',
  },
]

export default function NewDocument() {
  const navigate = useNavigate()

  const [kind, setKind] = useState('deck')
  const [mode, setMode] = useState('prompt')
  const [topic, setTopic] = useState('')
  const [content, setContent] = useState('')
  const [audience, setAudience] = useState('')
  const [tone, setTone] = useState('')
  const [slideCount, setSlideCount] = useState(10)
  const [theme, setTheme] = useState('mono')
  const [themes, setThemes] = useState([])
  const [maxContent, setMaxContent] = useState(20000)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  // ScrollTrigger reveals for the page's sections and heading. The trigger only
  // changes when the page has loaded, so editing a field never re-hides
  // anything mid-typing.
  const scope = useGsapReveal(themes.length ? 'ready' : 'loading', 'section, .form-section, h1')

  useEffect(() => {
    let active = true

    getCapabilities()
      .then((data) => {
        if (!active) return
        setThemes(data.themes ?? [])
        setTheme(data.defaultTheme ?? 'mono')
        if (data.limits?.maxContentLength) setMaxContent(data.limits.maxContentLength)
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('loading')
    setError('')

    try {
      const created = await createDocument({
        kind,
        topic,
        input: mode === 'content' ? content : '',
        audience,
        tone,
        theme,
        slideCount: Number(slideCount),
      })

      navigate(`/app/documents/${created.id}`, { replace: true })
    } catch (submitError) {
      setError(submitError.message)
      setStatus('idle')
    }
  }

  const selectedTheme = themes.find((entry) => entry.id === theme)
  const selectedKind = KINDS.find((entry) => entry.id === kind) ?? KINDS[0]

  if (status === 'loading') {
    return (
      <>
        <nav className="text-sm text-ink-500">
          <Link to="/app" className="transition-colors hover:text-ink-950">
            Dashboard
          </Link>
          <span className="px-2">/</span>
          <span className="text-ink-900">Generating</span>
        </nav>

        <h1 className="mt-4 text-3xl text-ink-950">Working on it</h1>
        <p className="mt-2 text-sm text-ink-600">
          {kind === 'deck' ? 'Building your slide outline.' : 'Building your document outline.'}
        </p>

        <div className="mt-10">
          <GeneratingPanel theme={selectedTheme} kind={kind} />
        </div>
      </>
    )
  }

  return (
    <>
      <nav className="text-sm text-ink-500">
        <Link to="/app" className="transition-colors hover:text-ink-950">
          Dashboard
        </Link>
        <span className="px-2">/</span>
        <span className="text-ink-900">New</span>
      </nav>

      <div ref={scope} className="mt-4">
        <h1 className="text-4xl font-bold tracking-tight text-ink-950 sm:text-5xl">What do you need?</h1>
        <p className="mt-3 max-w-2xl text-base text-ink-600">
          Describe the outcome, or paste material you already have and let Levitron structure it.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 xl:grid-cols-2 xl:items-start">
        <fieldset className="form-section">
          <legend className="section-label mb-5">1 — Type</legend>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink-900">What are you making?</span>
            <select
              className="field"
              value={kind}
              onChange={(event) => setKind(event.target.value)}
              aria-describedby="kind-help"
            >
              {KINDS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.title} — {option.formats}
                </option>
              ))}
            </select>
          </label>

          <p id="kind-help" className="mt-3 text-sm leading-relaxed text-ink-600">
            {selectedKind.body}
          </p>
        </fieldset>

        <fieldset className="form-section">
          <legend className="section-label mb-5">2 — Starting point</legend>

          <div className="inline-flex rounded-xl border border-ink-950/12 bg-cream-50 p-1">
            {[
              { id: 'prompt', label: 'Describe it' },
              { id: 'content', label: 'Paste your content' },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setMode(option.id)}
                aria-pressed={mode === option.id}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  mode === option.id ? 'bg-ink-950 text-cream-50' : 'text-ink-600 hover:text-ink-950'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {mode === 'prompt' ? (
            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-medium text-ink-700">
                {kind === 'deck' ? 'What is the presentation about?' : 'What is the document about?'}
              </span>
              <textarea
                className="field min-h-32 resize-y"
                required
                minLength={8}
                maxLength={2000}
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder={
                  kind === 'deck'
                    ? 'A Q3 platform review for the board, leading with reliability numbers'
                    : 'Why we should automate report generation, and what the pilot would look like'
                }
              />
              <span className="mt-1.5 block text-xs text-ink-400">{topic.length} / 2000</span>
            </label>
          ) : (
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink-700">Your content</span>
                <textarea
                  className="field min-h-64 resize-y font-mono text-[13px] leading-relaxed"
                  required
                  maxLength={maxContent}
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder={
                    'Q3 Platform Review\n\nOur uptime held at 99.98%\nNo customer-visible incidents\n\nWhat changed\n\n- Active-active failover\n- Deploy time down to 6 minutes'
                  }
                />
                <span className="mt-1.5 block text-xs text-ink-400">
                  {content.length} / {maxContent}
                </span>
              </label>

              <p className="rounded-xl border border-ink-950/12 bg-cream-50 px-4 py-3 text-xs leading-relaxed text-ink-600">
                Each block separated by a blank line becomes a {kind === 'deck' ? 'slide' : 'section'}. A short line on
                its own becomes the heading, and everything under it becomes the content. Lines starting with{' '}
                <code className="font-mono text-ink-900">-</code> become bullets.
              </p>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink-700">
                  Title or brief <span className="font-normal text-ink-400">optional</span>
                </span>
                <input
                  className="field"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  placeholder="Leave empty to take the title from your first line"
                />
              </label>
            </div>
          )}
        </fieldset>

        <div className="form-section">
          <ThemePicker themes={themes} value={theme} onChange={setTheme} label="3 — Theme" />
        </div>

        <div className="form-section">
          <p className="section-label mb-5">4 — Details</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink-900">
                Audience <span className="font-normal text-ink-400">optional</span>
              </span>
              <input
                className="field"
                value={audience}
                onChange={(event) => setAudience(event.target.value)}
                placeholder="the board"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink-900">
                Tone <span className="font-normal text-ink-400">optional</span>
              </span>
              <input
                className="field"
                value={tone}
                onChange={(event) => setTone(event.target.value)}
                placeholder="confident but calm"
              />
            </label>
          </div>

          {kind === 'deck' ? (
            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold text-ink-900">Slides: {slideCount}</span>
              <input
                type="range"
                min="4"
                max="30"
                value={slideCount}
                onChange={(event) => setSlideCount(event.target.value)}
                className="w-full accent-blue-600"
              />
            </label>
          ) : null}
        </div>

        {error ? (
          <div className="flex items-start gap-2.5 rounded-xl border border-ink-950/12 bg-cream-50 px-4 py-3 xl:col-span-2" role="alert">
            <span className="mt-0.5 h-4 w-4 shrink-0 text-ink-700">{icons.alert}</span>
            <p className="text-sm leading-relaxed text-ink-900">{error}</p>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 xl:col-span-2">
          <button type="submit" className="btn btn-primary btn-lg">
            Generate draft
            <span className="h-4 w-4">{icons.arrow}</span>
          </button>
          <Link to="/app" className="btn btn-ghost">
            Cancel
          </Link>
        </div>
        </form>
      </div>
    </>
  )
}
