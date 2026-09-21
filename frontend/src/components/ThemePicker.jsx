export default function ThemePicker({ themes, value, onChange, disabled = false, label = 'Theme' }) {
  if (!themes?.length) return null

  return (
    <fieldset disabled={disabled}>
      <legend className="mb-3 block text-sm font-medium text-ink-700">{label}</legend>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {themes.map((theme) => {
          const selected = theme.id === value

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onChange(theme.id)}
              aria-pressed={selected}
              title={theme.description}
              className={`group rounded-xl border p-2.5 text-left transition-all ${
                selected
                  ? 'border-ink-950 ring-2 ring-ink-950 ring-offset-2 ring-offset-cream-50'
                  : 'border-ink-950/12 hover:border-ink-950/40'
              } disabled:cursor-not-allowed`}
            >
              {/* A miniature of the real slide: background, accent bar, heading, bullets. */}
              <span
                className="block overflow-hidden rounded-lg p-2.5"
                style={{ backgroundColor: `#${theme.background}` }}
              >
                <span className="block h-1 w-6 rounded-full" style={{ backgroundColor: `#${theme.accent}` }} />
                <span className="mt-2 block h-1.5 w-4/5 rounded-full" style={{ backgroundColor: `#${theme.ink}` }} />
                <span
                  className="mt-1.5 block h-1 w-3/5 rounded-full opacity-70"
                  style={{ backgroundColor: `#${theme.ink}` }}
                />
                <span
                  className="mt-1 block h-1 w-2/5 rounded-full opacity-50"
                  style={{ backgroundColor: `#${theme.ink}` }}
                />
              </span>

              <span className="mt-2 flex items-center justify-between gap-1 px-0.5">
                <span className="truncate text-xs font-medium text-ink-900">{theme.name}</span>
                {selected ? (
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: `#${theme.accent}` }} />
                ) : null}
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
