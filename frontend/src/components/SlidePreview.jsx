import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'

import { icons } from './icons.jsx'

const AUTOPLAY_MS = 6000

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * GSAP-driven presentation preview. Each slide builds itself: the accent bar
 * wipes in, the heading rises, then the bullets stagger up.
 *
 * This is a browser preview — GSAP runs here only. PowerPoint's own format has
 * no animation support in the exporter, so an exported .pptx is static; what
 * carries across is the theme, not the motion.
 */
export default function SlidePreview({ slides, theme }) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const stageRef = useRef(null)

  const total = slides.length
  const slide = slides[index]
  const isTitleSlide = index === 0

  const go = useCallback(
    (next) => {
      setIndex((current) => {
        if (total === 0) return 0
        return (current + next + total) % total
      })
    },
    [total],
  )

  // Restart at the first slide when a different deck is loaded. Keyed on length
  // rather than the array itself, so an inline array prop cannot reset it on
  // every render.
  useEffect(() => {
    setIndex(0)
  }, [slides.length, slides[0]?.heading])

  // Animate whenever the visible slide changes.
  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const reduced = prefersReducedMotion()
    const context = gsap.context(() => {
      const targets = stage.querySelectorAll('[data-anim]')
      if (!targets.length) return

      if (reduced) {
        gsap.set(targets, { clearProps: 'all' })
        return
      }

      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

      timeline
        .from('[data-anim="bar"]', { scaleX: 0, duration: 0.45, transformOrigin: 'left center' })
        .from('[data-anim="heading"]', { y: 26, opacity: 0, duration: 0.55 }, '-=0.2')
        .from('[data-anim="bullet"]', { y: 18, opacity: 0, duration: 0.45, stagger: 0.08 }, '-=0.32')
        .from('[data-anim="meta"]', { opacity: 0, duration: 0.4 }, '-=0.2')
    }, stageRef)

    return () => context.revert()
  }, [index, theme?.id, slides])

  // Arrow-key navigation, ignored while typing in a field.
  useEffect(() => {
    function onKeyDown(event) {
      const tag = event.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (event.key === 'ArrowRight') go(1)
      if (event.key === 'ArrowLeft') go(-1)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [go])

  useEffect(() => {
    if (!playing || total < 2) return undefined

    const timer = window.setInterval(() => go(1), AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [playing, go, total])

  if (!slide || !theme) {
    return <p className="text-sm text-ink-500">This deck has no slides yet.</p>
  }

  return (
    <div>
      <div
        ref={stageRef}
        className="relative aspect-video w-full overflow-hidden rounded-2xl border border-ink-950/10 shadow-card"
        style={{ backgroundColor: `#${theme.background}` }}
        aria-live="polite"
      >
        <div className="absolute inset-0 flex flex-col justify-center px-8 py-7 sm:px-12 sm:py-10">
          <span
            data-anim="bar"
            className="block h-1 w-12 rounded-full"
            style={{ backgroundColor: `#${theme.accent}` }}
          />

          <h3
            data-anim="heading"
            className={`mt-5 leading-tight ${isTitleSlide ? 'text-2xl sm:text-4xl' : 'text-xl sm:text-3xl'}`}
            style={{ color: `#${theme.ink}`, fontFamily: theme.headFont }}
          >
            {slide.heading}
          </h3>

          {slide.bullets?.length ? (
            <ul className="mt-5 space-y-2">
              {slide.bullets.map((bullet) => (
                <li
                  key={bullet}
                  data-anim="bullet"
                  className="flex gap-3 text-sm sm:text-base"
                  style={{ color: `#${theme.body}`, fontFamily: theme.bodyFont }}
                >
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
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
          className="absolute bottom-4 right-5 font-mono text-xs tabular-nums"
          style={{ color: `#${theme.muted}` }}
        >
          {index + 1} / {total}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" className="btn btn-outline" onClick={() => go(-1)} disabled={total < 2}>
          <span className="h-4 w-4 rotate-180">{icons.arrow}</span>
          Previous
        </button>

        <button type="button" className="btn btn-outline" onClick={() => go(1)} disabled={total < 2}>
          Next
          <span className="h-4 w-4">{icons.arrow}</span>
        </button>

        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setPlaying((current) => !current)}
          disabled={total < 2}
          aria-pressed={playing}
        >
          {playing ? 'Pause' : 'Play'}
        </button>

        <span className="ml-auto text-xs text-ink-500">
          Arrow keys move between slides
        </span>
      </div>

      {slide.notes ? (
        <p className="mt-4 border-l-2 border-ink-950/15 pl-4 text-xs italic leading-relaxed text-ink-500">
          {slide.notes}
        </p>
      ) : null}
    </div>
  )
}
