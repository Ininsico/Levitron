import { useState } from 'react'

import SlideIcon from './SlideIcon.jsx'
import { SLIDE_ICON_NAMES } from './slideIcons.js'
import { icons } from './icons.jsx'

function move(list, from, to) {
  if (to < 0 || to >= list.length) return list

  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)

  return next
}

/** Searchable picker over the same curated Lucide set the model draws from. */
function IconPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const matches = SLIDE_ICON_NAMES.filter((name) => name.includes(query.trim().toLowerCase()))

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Choose slide icon"
        aria-expanded={open}
        title={value ? `Icon: ${value}` : 'Choose slide icon'}
        className={`flex h-8 items-center gap-1.5 rounded-lg border px-2 transition-colors ${
          value ? 'border-ink-950/20 text-ink-900' : 'border-ink-950/12 text-ink-500 hover:border-ink-950/40'
        }`}
      >
        {value ? <SlideIcon name={value} className="h-4 w-4" /> : <span className="text-xs">Icon</span>}
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close icon picker"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-ink-950/12 bg-cream-50 p-3 shadow-card">
            <input
              className="field py-2 text-sm"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${SLIDE_ICON_NAMES.length} icons`}
              aria-label="Search icons"
            />

            <div className="mt-3 grid max-h-56 grid-cols-6 gap-1 overflow-y-auto">
              {matches.map((name) => (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => {
                    onChange(name)
                    setOpen(false)
                    setQuery('')
                  }}
                  className={`flex h-9 items-center justify-center rounded-lg border transition-colors ${
                    name === value
                      ? 'border-ink-950 bg-ink-950 text-cream-50'
                      : 'border-transparent text-ink-700 hover:border-ink-950/20 hover:bg-cream-200'
                  }`}
                >
                  <SlideIcon name={name} className="h-4 w-4" />
                </button>
              ))}

              {matches.length === 0 ? (
                <p className="col-span-6 py-4 text-center text-xs text-ink-500">No icon matches that.</p>
              ) : null}
            </div>

            {value ? (
              <button
                type="button"
                className="mt-3 text-xs font-medium text-ink-600 transition-colors hover:text-ink-950"
                onClick={() => {
                  onChange('')
                  setOpen(false)
                }}
              >
                Remove icon
              </button>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  )
}

function IconButton({ label, onClick, children, disabled = false, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors disabled:opacity-30 ${
        danger
          ? 'border-ink-950/12 text-ink-500 hover:border-ink-950 hover:text-ink-950'
          : 'border-ink-950/12 text-ink-600 hover:border-ink-950/40 hover:text-ink-950'
      }`}
    >
      <span className="h-4 w-4">{children}</span>
    </button>
  )
}

/** Editable slide list. Every change is lifted straight up to the parent. */
export function SlideListEditor({ slides, onChange }) {
  function updateSlide(index, patch) {
    onChange(slides.map((slide, position) => (position === index ? { ...slide, ...patch } : slide)))
  }

  function updateBullet(index, bulletIndex, text) {
    updateSlide(index, {
      bullets: slides[index].bullets.map((bullet, position) => (position === bulletIndex ? text : bullet)),
    })
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2 xl:items-start">
      {slides.map((slide, index) => (
        <article key={index} className="card p-5">
          <div className="flex items-start gap-3">
            <span className="mt-3 font-mono text-xs tabular-nums text-ink-400">
              {String(index + 1).padStart(2, '0')}
            </span>

            <input
              className="field flex-1 font-display"
              value={slide.heading}
              onChange={(event) => updateSlide(index, { heading: event.target.value })}
              placeholder="Slide heading"
              aria-label={`Slide ${index + 1} heading`}
            />

            <div className="mt-1 flex gap-1.5">
              <IconPicker value={slide.icon} onChange={(icon) => updateSlide(index, { icon })} />

              <IconButton label="Move up" onClick={() => onChange(move(slides, index, index - 1))} disabled={index === 0}>
                {icons.chevronUp}
              </IconButton>
              <IconButton
                label="Move down"
                onClick={() => onChange(move(slides, index, index + 1))}
                disabled={index === slides.length - 1}
              >
                {icons.chevronDown}
              </IconButton>
              <IconButton
                label="Delete slide"
                danger
                onClick={() => onChange(slides.filter((_, position) => position !== index))}
                disabled={slides.length === 1}
              >
                {icons.trash}
              </IconButton>
            </div>
          </div>

          <ul className="mt-4 space-y-2 pl-8">
            {slide.bullets.map((bullet, bulletIndex) => (
              <li key={bulletIndex} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ink-400" />
                <input
                  className="field flex-1 py-2 text-sm"
                  value={bullet}
                  onChange={(event) => updateBullet(index, bulletIndex, event.target.value)}
                  placeholder="Bullet"
                  aria-label={`Slide ${index + 1} bullet ${bulletIndex + 1}`}
                />
                <IconButton
                  label="Remove bullet"
                  danger
                  onClick={() =>
                    updateSlide(index, { bullets: slide.bullets.filter((_, position) => position !== bulletIndex) })
                  }
                >
                  {icons.trash}
                </IconButton>
              </li>
            ))}
          </ul>

          <div className="mt-3 flex flex-wrap gap-3 pl-8">
            <button
              type="button"
              className="text-xs font-medium text-ink-600 transition-colors hover:text-ink-950"
              onClick={() => updateSlide(index, { bullets: [...slide.bullets, ''] })}
            >
              + Add bullet
            </button>
          </div>

          <label className="mt-4 block pl-8">
            <span className="mb-1.5 block text-xs font-medium text-ink-500">Speaker notes</span>
            <textarea
              className="field min-h-16 resize-y py-2 text-sm"
              value={slide.notes ?? ''}
              onChange={(event) => updateSlide(index, { notes: event.target.value })}
              placeholder="Optional — appears in the presenter view and in exports"
            />
          </label>
        </article>
      ))}

      <button
        type="button"
        className="btn btn-outline w-full"
        onClick={() => onChange([...slides, { heading: 'New slide', bullets: [''], notes: '' }])}
      >
        + Add slide
      </button>
    </div>
  )
}

/** Editable section list for written documents. */
export function SectionListEditor({ sections, onChange }) {
  function updateSection(index, patch) {
    onChange(sections.map((section, position) => (position === index ? { ...section, ...patch } : section)))
  }

  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <article key={index} className="card p-5">
          <div className="flex items-start gap-3">
            <span className="mt-3 font-mono text-xs tabular-nums text-ink-400">
              {String(index + 1).padStart(2, '0')}
            </span>

            <input
              className="field flex-1 font-display"
              value={section.heading}
              onChange={(event) => updateSection(index, { heading: event.target.value })}
              placeholder="Section heading"
              aria-label={`Section ${index + 1} heading`}
            />

            <div className="mt-1 flex gap-1.5">
              <IconButton label="Move up" onClick={() => onChange(move(sections, index, index - 1))} disabled={index === 0}>
                {icons.chevronUp}
              </IconButton>
              <IconButton
                label="Move down"
                onClick={() => onChange(move(sections, index, index + 1))}
                disabled={index === sections.length - 1}
              >
                {icons.chevronDown}
              </IconButton>
              <IconButton
                label="Delete section"
                danger
                onClick={() => onChange(sections.filter((_, position) => position !== index))}
                disabled={sections.length === 1}
              >
                {icons.trash}
              </IconButton>
            </div>
          </div>

          <div className="mt-4 space-y-2 pl-8">
            {section.paragraphs.map((paragraph, paragraphIndex) => (
              <div key={paragraphIndex} className="flex items-start gap-2">
                <textarea
                  className="field min-h-20 flex-1 resize-y py-2 text-sm leading-relaxed"
                  value={paragraph}
                  onChange={(event) =>
                    updateSection(index, {
                      paragraphs: section.paragraphs.map((entry, position) =>
                        position === paragraphIndex ? event.target.value : entry,
                      ),
                    })
                  }
                  aria-label={`Section ${index + 1} paragraph ${paragraphIndex + 1}`}
                />
                <IconButton
                  label="Remove paragraph"
                  danger
                  onClick={() =>
                    updateSection(index, {
                      paragraphs: section.paragraphs.filter((_, position) => position !== paragraphIndex),
                    })
                  }
                >
                  {icons.trash}
                </IconButton>
              </div>
            ))}
          </div>

          <div className="mt-3 pl-8">
            <button
              type="button"
              className="text-xs font-medium text-ink-600 transition-colors hover:text-ink-950"
              onClick={() => updateSection(index, { paragraphs: [...section.paragraphs, ''] })}
            >
              + Add paragraph
            </button>
          </div>
        </article>
      ))}

      <button
        type="button"
        className="btn btn-outline w-full"
        onClick={() => onChange([...sections, { heading: 'New section', paragraphs: [''] }])}
      >
        + Add section
      </button>
    </div>
  )
}
