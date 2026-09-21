import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Scroll + mount reveals for anything marked `[data-reveal]` inside the
 * returned scope. Re-runs when `trigger` changes, which is how async lists get
 * animated once their rows exist rather than on an empty container.
 *
 * As with useReveal: the hidden state comes from GSAP here, never from CSS, so
 * a failure leaves content visible.
 */
export function useGsapReveal(trigger) {
  const scope = useRef(null)

  useLayoutEffect(() => {
    if (!scope.current) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const targets = Array.from(scope.current.querySelectorAll('[data-reveal]'))
    if (!targets.length) return undefined

    const context = gsap.context(() => {
      targets.forEach((element, index) => {
        gsap.set(element, { opacity: 0, y: 20 })

        gsap.to(element, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          delay: Math.min(index, 8) * 0.05,
          ease: 'power2.out',
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: element, start: 'top 92%', once: true },
        })
      })
    }, scope)

    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 200)

    return () => {
      window.clearTimeout(refresh)
      context.revert()
    }
  }, [trigger])

  return scope
}
