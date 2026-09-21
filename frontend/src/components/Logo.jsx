const LOGO_SRC = '/logo.png'
const LOGO_WIDTH = 253
const LOGO_HEIGHT = 213

export default function Logo({ className = 'h-9 w-auto', tone = 'ink' }) {
  const mark = (
    <img
      src={LOGO_SRC}
      alt=""
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      className={`${className} object-contain`}
    />
  )

  // The logo ships in one colourway, so on dark surfaces it sits on a light
  // chip instead of relying on the artwork having enough contrast by itself.
  if (tone === 'light') {
    return (
      <span className="inline-flex items-center justify-center rounded-2xl bg-cream-50 p-1.5 shadow-soft">
        {mark}
      </span>
    )
  }

  return mark
}
