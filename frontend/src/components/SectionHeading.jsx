export default function SectionHeading({ eyebrow, title, body, align = 'center', maxWidth = 'max-w-2xl' }) {
  const alignment = align === 'center' ? `mx-auto text-center ${maxWidth}` : maxWidth

  return (
    <div className={alignment}>
      {eyebrow ? (
        <span className="eyebrow reveal">
          <span className="h-1.5 w-1.5 rounded-full bg-lava-500" />
          {eyebrow}
        </span>
      ) : null}

      <h2 className="reveal mt-5 text-3xl leading-[1.1] text-ash-950 sm:text-4xl md:text-5xl" style={{ '--reveal-delay': '80ms' }}>
        {title}
      </h2>

      {body ? (
        <p className="reveal mt-5 text-base leading-relaxed text-ash-600 sm:text-lg" style={{ '--reveal-delay': '160ms' }}>
          {body}
        </p>
      ) : null}
    </div>
  )
}
