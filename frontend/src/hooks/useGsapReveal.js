import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * Staggers `selector` in when `trigger` changes. useLayoutEffect so GSAP sets
 * the start state before the browser paints — with useEffect the elements flash
 * at full opacity for a frame first.
 *
 * `trigger` is what makes this work with async data: pass the loaded count so
 * the animation runs once the rows actually exist.
 */
export function useGsapReveal(trigger, selector = '[data-reveal]') {
  const scope = useRef(null)

  useLayoutEffect(() => {
    if (!scope.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const targets = scope.current.querySelectorAll(selector)
    if (!targets.length) return

    const context = gsap.context(() => {
      gsap.from(targets, {
        y: 18,
        opacity: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
      })
    }, scope)

    return () => context.revert()
  }, [trigger, selector])

  return scope
}
