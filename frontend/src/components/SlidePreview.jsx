import { useCallback, useEffect, useRef, useState } from 'react'

import SlideCanvas from './SlideCanvas.jsx'
import { icons } from './icons.jsx'
import { transitionFor, useSlideAnimation } from '../hooks/useSlideAnimation.js'

const AUTOPLAY_MS = 6000

export default function SlidePreview({ slides, theme, onPresent }) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const stageRef = useSlideAnimation([index, theme?.id], transitionFor(index))
  const railRef = useRef(null)

  const total = slides.length
  const slide = slides[index]

  const go = useCallback(
    (step) => {
      if (total === 0) return
      setIndex((current) => (current + step + total) % total)
    },
    [total],
  )

  // No reset effect: the parent keys this component by document id, so a
  // different deck remounts it with index already at 0.

  useEffect(() => {
    if (!playing || total < 2) return undefined

    const timer = window.setInterval(() => go(1), AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [playing, go, total])

  // Keep the active thumbnail in view as the deck advances.
  useEffect(() => {
    const active = railRef.current?.querySelector('[data-active="true"]')
    active?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [index])

  if (!slide || !theme) {
    return <p className="text-sm text-ink-500">This deck has no slides yet.</p>
  }

  return (
    <div>
      <div ref={stageRef}>
        <SlideCanvas slide={slide} theme={theme} index={index} total={total} />
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

        {onPresent ? (
          <button type="button" className="btn btn-primary ml-auto" onClick={() => onPresent(index)} disabled={total === 0}>
            Present
            <span className="h-4 w-4">{icons.arrow}</span>
          </button>
        ) : null}
      </div>

      {/* Thumbnail rail — the fastest way to get to slide 9. */}
      <div ref={railRef} className="mt-4 flex gap-3 overflow-x-auto pb-2">
        {slides.map((entry, entryIndex) => {
          const active = entryIndex === index

          return (
            <button
              key={`${entry.heading}-${entryIndex}`}
              type="button"
              data-active={active}
              onClick={() => setIndex(entryIndex)}
              aria-label={`Go to slide ${entryIndex + 1}: ${entry.heading}`}
              aria-current={active}
              className={`w-40 shrink-0 rounded-xl border p-2 text-left transition-all ${
                active ? 'border-ink-950 shadow-soft' : 'border-ink-950/12 hover:border-ink-950/30'
              }`}
              style={{ backgroundColor: `#${theme.background}` }}
            >
              <span className="flex items-center justify-between">
                <span className="font-mono text-[10px]" style={{ color: `#${theme.muted}` }}>
                  {String(entryIndex + 1).padStart(2, '0')}
                </span>
                <span className="h-1 w-4 rounded-full" style={{ backgroundColor: `#${theme.accent}` }} />
              </span>

              <span
                className="mt-1.5 line-clamp-2 block text-[11px] font-medium leading-snug"
                style={{ color: `#${theme.ink}` }}
              >
                {entry.heading}
              </span>
            </button>
          )
        })}
      </div>

      {slide.notes ? (
        <p className="mt-2 border-l-2 border-ink-950/15 pl-4 text-xs italic leading-relaxed text-ink-500">
          {slide.notes}
        </p>
      ) : null}
    </div>
  )
}
