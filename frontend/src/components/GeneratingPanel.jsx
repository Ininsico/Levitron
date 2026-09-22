import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'

import { prefersReducedMotion } from '../hooks/useSlideAnimation.js'

// Only two stages, and both are true: one request goes out, then we wait on it.
// Nothing here claims progress the server has not reported.
const STAGES = ['Sending your brief to the engine', 'Drafting the outline']

export default function GeneratingPanel({ theme, kind }) {
  const [stage, setStage] = useState(0)
  const scope = useRef(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setStage(1), 900)
    return () => window.clearTimeout(timer)
  }, [])

  useLayoutEffect(() => {
    if (!scope.current || prefersReducedMotion()) return undefined

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

      timeline
        .from('[data-gen="bar"]', { scaleX: 0, transformOrigin: 'left center', duration: 0.5 })
        .from('[data-gen="line"]', { opacity: 0, y: 10, duration: 0.45, stagger: 0.08 }, '-=0.25')

      // Keep it visibly alive: a drafting engine that looks frozen reads as broken.
      gsap.to('[data-gen="pulse"]', {
        opacity: 0.3,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      gsap.fromTo(
        '[data-gen="sweep"]',
        { xPercent: -100 },
        { xPercent: 320, duration: 1.4, repeat: -1, ease: 'power1.inOut' },
      )
    }, scope)

    return () => context.revert()
  }, [])

  const background = theme ? `#${theme.background}` : '#FFFDF8'
  const ink = theme ? `#${theme.ink}` : '#000000'
  const accent = theme ? `#${theme.accent}` : '#000000'
  const muted = theme ? `#${theme.muted}` : '#909090'
  const headFont = theme?.headFont ?? 'Arial'

  return (
    <div ref={scope}>
      <div
        className="relative aspect-video w-full overflow-hidden rounded-2xl border border-ink-950/10 shadow-card"
        style={{ backgroundColor: background }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 flex flex-col justify-center px-7 py-6 sm:px-12 sm:py-10">
          <span data-gen="bar" className="block h-1 w-12 rounded-full" style={{ backgroundColor: accent }} />

          <span
            data-gen="line"
            className="mt-5 block h-4 w-3/5 rounded-full opacity-90 sm:h-6"
            style={{ backgroundColor: ink, fontFamily: headFont }}
          />

          <div className="mt-6 space-y-2.5">
            {[70, 85, 60, 75].map((width, index) => (
              <span key={width} data-gen="line" className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
                <span
                  className="block h-2.5 rounded-full opacity-45"
                  style={{ backgroundColor: ink, width: `${width - index * 4}%` }}
                />
              </span>
            ))}
          </div>
        </div>

        <span
          className="absolute bottom-3 right-4 font-mono text-[10px] sm:bottom-4 sm:right-5 sm:text-xs"
          style={{ color: muted }}
        >
          drafting
        </span>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span data-gen="pulse" className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
        <p className="text-sm font-medium text-ink-900">{STAGES[stage]}</p>
        {theme ? (
          <span className="chip">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent }} />
            {theme.name} theme
          </span>
        ) : null}
        <span className="chip">{kind === 'deck' ? 'Presentation' : 'Document'}</span>
      </div>

      <div className="mt-4 h-1 overflow-hidden rounded-full bg-ink-950/10">
        <span data-gen="sweep" className="block h-full w-1/4 rounded-full bg-blue-600" />
      </div>
    </div>
  )
}
