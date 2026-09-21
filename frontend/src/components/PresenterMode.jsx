import { useCallback, useEffect, useRef, useState } from 'react'

import SlideCanvas from './SlideCanvas.jsx'
import { icons } from './icons.jsx'
import { useFadeOnChange, useSlideAnimation } from '../hooks/useSlideAnimation.js'

export default function PresenterMode({ slides, theme, title, startIndex = 0, onClose }) {
  const [index, setIndex] = useState(startIndex)
  const [fullscreen, setFullscreen] = useState(false)

  const shellRef = useRef(null)
  const fadeRef = useRef(null)
  const stageRef = useSlideAnimation([index])

  const total = slides.length
  const slide = slides[index]

  useFadeOnChange(fadeRef, index)

  const go = useCallback(
    (step) => {
      if (total === 0) return
      setIndex((current) => (current + step + total) % total)
    },
    [total],
  )

  // Stop the page behind from scrolling while presenting.
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key === 'ArrowRight' || event.key === ' ' || event.key === 'PageDown') {
        event.preventDefault()
        go(1)
        return
      }

      if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault()
        go(-1)
        return
      }

      if (event.key === 'Home') setIndex(0)
      if (event.key === 'End') setIndex(total - 1)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [go, onClose, total])

  // Track fullscreen changes made with F11 or the browser's own controls.
  useEffect(() => {
    function onFullscreenChange() {
      setFullscreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else if (shellRef.current) {
        await shellRef.current.requestFullscreen()
      }
    } catch {
      // The browser refused (permissions, iframe policy). The overlay alone is
      // still perfectly usable, so this is not worth surfacing as an error.
    }
  }

  if (!slide) return null

  return (
    <div ref={shellRef} className="fixed inset-0 z-50 flex flex-col bg-ink-950">
      <header className="flex shrink-0 items-center justify-between gap-4 px-5 py-3 text-cream-100">
        <div className="min-w-0">
          <p className="truncate font-display text-sm sm:text-base">{title}</p>
          <p className="text-xs text-cream-200/50">
            {index + 1} of {total}
            {slide.notes ? ' · speaker notes below' : ''}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="rounded-lg px-3 py-2 text-xs font-medium text-cream-200/70 transition-colors hover:bg-cream-50/10 hover:text-cream-50"
            aria-pressed={fullscreen}
          >
            {fullscreen ? 'Exit full screen' : 'Full screen'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg bg-cream-50/10 px-3 py-2 text-xs font-medium text-cream-50 transition-colors hover:bg-cream-50/20"
          >
            <span className="h-4 w-4">{icons.close}</span>
            Exit
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 items-center justify-center px-4 pb-2 sm:px-10">
        <div ref={fadeRef} className="w-full max-w-5xl">
          <div ref={stageRef}>
            <SlideCanvas slide={slide} theme={theme} index={index} total={total} />
          </div>
        </div>
      </div>

      <footer className="shrink-0 px-5 pb-4 pt-2">
        {slide.notes ? (
          <p className="mx-auto mb-3 max-w-3xl text-center text-xs italic leading-relaxed text-cream-200/55">
            {slide.notes}
          </p>
        ) : null}

        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <button
            type="button"
            onClick={() => go(-1)}
            className="rounded-lg px-3 py-2 text-sm text-cream-200/70 transition-colors hover:bg-cream-50/10 hover:text-cream-50"
            disabled={total < 2}
          >
            Previous
          </button>

          <div className="h-1 flex-1 overflow-hidden rounded-full bg-cream-50/15">
            <div
              className="h-full rounded-full bg-cream-100 transition-[width] duration-300 ease-out"
              style={{ width: `${total ? ((index + 1) / total) * 100 : 0}%` }}
            />
          </div>

          <button
            type="button"
            onClick={() => go(1)}
            className="rounded-lg px-3 py-2 text-sm text-cream-200/70 transition-colors hover:bg-cream-50/10 hover:text-cream-50"
            disabled={total < 2}
          >
            Next
          </button>

          <span className="hidden text-xs text-cream-200/40 sm:block">← → to move · Esc to exit</span>
        </div>
      </footer>
    </div>
  )
}
