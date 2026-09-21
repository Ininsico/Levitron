import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * The slide build animation, shared by the inline preview and presenter mode so
 * both feel identical.
 *
 * Every tween is an explicit fromTo with a final value matching the natural CSS
 * state. If GSAP is interrupted or a context is reverted mid-flight — which is
 * exactly what React StrictMode does on mount — the element falls back to being
 * visible rather than stuck at opacity 0.
 */
export function useSlideAnimation(deps = []) {
  const scope = useRef(null)

  useLayoutEffect(() => {
    const element = scope.current
    if (!element) return undefined
    if (prefersReducedMotion()) return undefined

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

      timeline
        .fromTo(
          '[data-anim="bar"]',
          { scaleX: 0, transformOrigin: 'left center' },
          { scaleX: 1, duration: 0.45 },
        )
        .fromTo(
          '[data-anim="heading"]',
          { y: 26, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55 },
          '-=0.2',
        )
        .fromTo(
          '[data-anim="bullet"]',
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, stagger: 0.08 },
          '-=0.32',
        )
        .fromTo('[data-anim="meta"]', { opacity: 0 }, { opacity: 1, duration: 0.4 }, '-=0.2')
    }, scope)

    return () => context.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return scope
}

/** Fades a container whenever `key` changes — used between slides in presenter mode. */
export function useFadeOnChange(containerRef, key) {
  useLayoutEffect(() => {
    const element = containerRef.current
    if (!element) return
    if (prefersReducedMotion()) return

    gsap.fromTo(
      element,
      { opacity: 0, scale: 0.99 },
      { opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out' },
    )
  }, [containerRef, key])
}
