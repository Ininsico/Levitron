export default function Logo({ className = 'h-9 w-9', tone = 'ink' }) {
  const onDark = tone === 'light'
  const gradientId = onDark ? 'levitron-mark-light' : 'levitron-mark'
  const glyph = onDark ? '#000000' : '#fffdf8'

  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={onDark ? '#fffdf8' : '#262626'} />
          <stop offset="100%" stopColor={onDark ? '#e9dcc5' : '#000000'} />
        </linearGradient>
      </defs>

      <rect width="40" height="40" rx="12" fill={`url(#${gradientId})`} />
      <ellipse
        cx="20"
        cy="20"
        rx="13"
        ry="5.5"
        fill="none"
        stroke={glyph}
        strokeOpacity="0.5"
        strokeWidth="1.5"
        transform="rotate(-22 20 20)"
      />
      <circle cx="20" cy="15.5" r="5" fill={glyph} />
      <circle cx="32" cy="17.2" r="2.4" fill={glyph} fillOpacity="0.9" />
    </svg>
  )
}
