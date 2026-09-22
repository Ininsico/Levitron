import SlideIcon from './SlideIcon.jsx'

/**
 * One slide, rendered from a theme and a layout. Used by the inline preview,
 * presenter mode and the generating skeleton, so all three always agree on what
 * a slide looks like.
 *
 * Elements carry `data-anim` markers; the animation belongs to whatever
 * container wraps this (see useSlideAnimation).
 */

function Heading({ slide, theme, large = false }) {
  return (
    <h3
      data-anim="heading"
      className={`leading-tight ${large ? 'text-2xl sm:text-5xl' : 'text-xl sm:text-3xl'}`}
      style={{ color: `#${theme.ink}`, fontFamily: theme.headFont }}
    >
      {slide.heading}
    </h3>
  )
}

function Bullets({ items, theme, className = '' }) {
  if (!items.length) return null

  return (
    <ul className={`space-y-1.5 sm:space-y-2 ${className}`}>
      {items.map((bullet) => (
        <li
          key={bullet}
          data-anim="bullet"
          className="flex gap-3 text-xs sm:text-base"
          style={{ color: `#${theme.body}`, fontFamily: theme.bodyFont }}
        >
          <span
            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full sm:mt-2"
            style={{ backgroundColor: `#${theme.accent}` }}
          />
          {bullet}
        </li>
      ))}
    </ul>
  )
}

export default function SlideCanvas({ slide, theme, index = 0, total = 1, className = '' }) {
  if (!slide || !theme) return null

  const layout = index === 0 ? 'title' : (slide.layout ?? 'bullets')
  const metrics = slide.metrics ?? []
  const comparison = slide.comparison ?? {}

  // A soft diagonal wash rather than a flat fill — the difference between a
  // designed slide and a coloured rectangle.
  const background = `radial-gradient(130% 130% at 0% 0%, #${theme.surface} 0%, #${theme.background} 58%)`

  const columns = [
    { title: comparison.leftTitle, items: comparison.left ?? [], highlight: false },
    { title: comparison.rightTitle, items: comparison.right ?? [], highlight: true },
  ]

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-2xl shadow-card ${className}`}
      style={{ background }}
    >
      <div className="absolute inset-0 flex flex-col justify-center px-7 py-6 sm:px-12 sm:py-10">
        <div className="flex items-center justify-between gap-4">
          <span
            data-anim="bar"
            className={`block h-1 rounded-full ${layout === 'title' ? 'w-16' : 'w-12'}`}
            style={{ backgroundColor: `#${theme.accent}` }}
          />
          {slide.icon ? (
            <span data-anim="bar" style={{ color: `#${theme.accent}` }}>
              <SlideIcon name={slide.icon} className="h-7 w-7 sm:h-9 sm:w-9" strokeWidth={1.5} />
            </span>
          ) : null}
        </div>

        {layout === 'metrics' ? (
          <>
            <div className="mt-5 sm:mt-7">
              <Heading slide={slide} theme={theme} />
            </div>

            <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map((metric) => (
                <div key={`${metric.value}-${metric.label}`} data-anim="bullet">
                  <p className="font-display text-2xl leading-none sm:text-4xl" style={{ color: `#${theme.accent}` }}>
                    {metric.value}
                  </p>
                  <p className="mt-1.5 text-[10px] leading-snug sm:text-xs" style={{ color: `#${theme.muted}` }}>
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : null}

        {layout === 'statement' ? (
          <>
            <p
              data-anim="statement"
              className="mt-6 max-w-4xl text-lg leading-snug sm:mt-8 sm:text-4xl"
              style={{ color: `#${theme.ink}`, fontFamily: theme.headFont }}
            >
              {slide.statement || slide.heading}
            </p>

            {slide.statement && slide.heading !== slide.statement ? (
              <p
                data-anim="meta"
                className="mt-5 text-[11px] uppercase tracking-[0.16em] sm:text-xs"
                style={{ color: `#${theme.muted}` }}
              >
                {slide.heading}
              </p>
            ) : null}
          </>
        ) : null}

        {layout === 'comparison' ? (
          <>
            <div className="mt-4 sm:mt-6">
              <Heading slide={slide} theme={theme} />
            </div>

            <div className="mt-5 grid gap-4 sm:mt-7 sm:grid-cols-2 sm:gap-6">
              {columns.map((column, columnIndex) => (
                <div
                  key={column.title || columnIndex}
                  data-anim="bullet"
                  className="rounded-xl border p-4"
                  style={{
                    borderColor: `#${theme.muted}33`,
                    backgroundColor: column.highlight ? `#${theme.accent}1a` : 'transparent',
                  }}
                >
                  {column.title ? (
                    <p
                      className="text-[10px] font-semibold uppercase tracking-[0.14em] sm:text-xs"
                      style={{ color: column.highlight ? `#${theme.accent}` : `#${theme.muted}` }}
                    >
                      {column.title}
                    </p>
                  ) : null}

                  <ul className="mt-2.5 space-y-1.5">
                    {column.items.map((item) => (
                      <li
                        key={item}
                        className="flex gap-2 text-xs sm:text-sm"
                        style={{ color: `#${theme.body}`, fontFamily: theme.bodyFont }}
                      >
                        <span style={{ color: `#${theme.accent}` }}>·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        ) : null}

        {layout === 'title' || layout === 'bullets' ? (
          <>
            <div className="mt-4 sm:mt-5">
              <Heading slide={slide} theme={theme} large={layout === 'title'} />
            </div>

            <Bullets items={slide.bullets ?? []} theme={theme} className="mt-4 sm:mt-5" />
          </>
        ) : null}
      </div>

      <span
        data-anim="meta"
        className="absolute bottom-3 right-4 font-mono text-[10px] tabular-nums sm:bottom-4 sm:right-5 sm:text-xs"
        style={{ color: `#${theme.muted}` }}
      >
        {index + 1} / {total}
      </span>
    </div>
  )
}
