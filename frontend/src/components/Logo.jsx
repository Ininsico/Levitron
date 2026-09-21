export default function Logo({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="levitron-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff6c4a" />
          <stop offset="55%" stopColor="#ff3b21" />
          <stop offset="100%" stopColor="#c51a05" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#levitron-mark)" />
      <ellipse
        cx="20"
        cy="20"
        rx="13"
        ry="5.5"
        fill="none"
        stroke="#fffdf8"
        strokeOpacity="0.5"
        strokeWidth="1.5"
        transform="rotate(-22 20 20)"
      />
      <circle cx="20" cy="15.5" r="5" fill="#fffdf8" />
      <circle cx="32" cy="17.2" r="2.4" fill="#fffdf8" fillOpacity="0.9" />
    </svg>
  )
}
