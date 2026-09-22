import { useState } from 'react'

import { icons } from './icons.jsx'

const CUSTOM_KEYS = [
  { key: 'background', label: 'Background' },
  { key: 'ink', label: 'Text' },
  { key: 'accent', label: 'Accent' },
]

function Swatch({ theme, size = 'h-5 w-5' }) {
  return (
    <span className={`flex shrink-0 overflow-hidden rounded-full border border-ink-950/15 ${size}`}>
      <span className="h-full w-2/3" style={{ backgroundColor: `#${theme.background}` }} />
      <span className="h-full w-1/3" style={{ backgroundColor: `#${theme.accent}` }} />
    </span>
  )
}

/**
 * Opens on hover, and also on click so it still works by keyboard and on touch.
 * The panel is offset with padding rather than a margin, so moving the pointer
 * from the button to the panel never crosses a gap and closes it.
 */
export default function ThemeDropdown({ themes, value, custom, onChange, onCustomChange }) {
  const [open, setOpen] = useState(false)

  const active = themes.find((theme) => theme.id === value)
  const usingCustom = Boolean(custom?.background || custom?.ink || custom?.accent)

  const preview = usingCustom
    ? { background: custom.background ?? active?.background ?? 'ffffff', accent: custom.accent ?? active?.accent ?? '000000' }
    : { background: active?.background ?? 'ffffff', accent: active?.accent ?? '000000' }

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="btn btn-outline w-full justify-between gap-4"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <Swatch theme={preview} />
          <span className="truncate text-sm font-semibold text-ink-900">
            {usingCustom ? 'Custom' : (active?.name ?? 'Theme')}
          </span>
        </span>
        <span className={`h-4 w-4 shrink-0 text-ink-500 transition-transform ${open ? 'rotate-180' : ''}`}>
          {icons.chevronDown}
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-30 w-72 pt-2">
          <div className="overflow-hidden rounded-xl border border-ink-950/12 bg-white shadow-card">
            <ul role="listbox" className="max-h-64 overflow-y-auto p-1.5">
              {themes.map((theme) => (
                <li key={theme.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={!usingCustom && theme.id === value}
                    onClick={() => {
                      onChange(theme.id)
                      setOpen(false)
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${
                      !usingCustom && theme.id === value ? 'bg-blue-50 text-blue-800' : 'text-ink-800 hover:bg-cream-100'
                    }`}
                  >
                    <Swatch theme={theme} />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{theme.name}</span>
                    {!usingCustom && theme.id === value ? <span className="h-3.5 w-3.5">{icons.check}</span> : null}
                  </button>
                </li>
              ))}
            </ul>

            <div className="border-t border-ink-950/10 p-2.5">
              <p className="px-1 pb-1.5 text-xs font-semibold uppercase tracking-wider text-ink-400">Custom</p>

              {CUSTOM_KEYS.map(({ key, label }) => (
                <label key={key} className="flex items-center justify-between gap-3 rounded-lg px-1 py-1.5">
                  <span className="text-sm text-ink-700">{label}</span>
                  <input
                    type="color"
                    value={`#${custom?.[key] ?? active?.[key] ?? 'ffffff'}`}
                    onChange={(event) => onCustomChange({ ...custom, [key]: event.target.value.slice(1).toUpperCase() })}
                    className="h-7 w-12 cursor-pointer rounded border border-ink-950/12 bg-transparent"
                    aria-label={`${label} colour`}
                  />
                </label>
              ))}

              {usingCustom ? (
                <button
                  type="button"
                  onClick={() => onCustomChange({ background: '', ink: '', accent: '' })}
                  className="mt-1 px-1 text-xs font-medium text-ink-600 hover:text-ink-950"
                >
                  Reset to {active?.name ?? 'default'}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
