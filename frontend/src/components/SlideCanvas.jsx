/**
 * One slide, rendered from a theme. Used by the inline preview, presenter mode
 * and the generating skeleton, so all three always agree on what a slide looks
 * like.
 *
 * Elements carry `data-anim` markers; the animation itself belongs to whatever
 * container wraps this (see useSlideAnimation).
 */
export default function SlideCanvas({ slide, theme, index = 0, total = 1, className = '' }) {
  if (!slide || !theme) return null

  const isTitle = index === 0
  const bullets = slide.bullets ?? []

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-2xl shadow-card ${className}`}
      style={{ backgroundColor: `#${theme.background}` }}
    >
      <div className="absolute inset-0 flex flex-col justify-center px-7 py-6 sm:px-12 sm:py-10">
        <span
          data-anim="bar"
          className="block h-1 w-12 rounded-full"
          style={{ backgroundColor: `#${theme.accent}` }}
        />

        <h3
          data-anim="heading"
          className={`mt-4 leading-tight sm:mt-5 ${isTitle ? 'text-2xl sm:text-4xl' : 'text-xl sm:text-3xl'}`}
          style={{ color: `#${theme.ink}`, fontFamily: theme.headFont }}
        >
          {slide.heading}
        </h3>

        {bullets.length ? (
          <ul className="mt-4 space-y-1.5 sm:mt-5 sm:space-y-2">
            {bullets.map((bullet) => (
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
