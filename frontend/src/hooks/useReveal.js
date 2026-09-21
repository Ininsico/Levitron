import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Scroll-driven reveals for anything marked `.reveal`.
 *
 * Two deliberate decisions, both because content that silently stays invisible
 * is far worse than no animation at all:
 *
 * 1. Nothing is hidden in CSS. The start state is applied by GSAP inside a
 *    layout effect, so if GSAP or ScrollTrigger fails the content is simply
 *    visible.
 * 2. `once: true` — a reveal can never run in reverse and strand an element
 *    off-screen at zero opacity.
 *
 * Elements already in view animate immediately. The stagger is read from the
 * existing `--reveal-delay` custom property, so no component had to change.
 */
export function useReveal() {
  const scope = useRef(null)

  useLayoutEffect(() => {
    if (!scope.current) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const targets = Array.from(scope.current.querySelectorAll('.reveal'))
    if (!targets.length) return undefined

    const context = gsap.context(() => {
      targets.forEach((element) => {
        const declared = parseFloat(window.getComputedStyle(element).getPropertyValue('--reveal-delay'))
        const delay = Number.isFinite(declared) ? declared / 1000 : 0

        gsap.set(element, { opacity: 0, y: 26 })

        gsap.to(element, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: element, start: 'top 90%', once: true },
        })
      })
    }, scope)

    // Late content changes the document height; without this, triggers
    // computed before things settle can be wrong.
    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 300)

    return () => {
      window.clearTimeout(refresh)
      context.revert()
    }
  }, [])

  return scope
}
