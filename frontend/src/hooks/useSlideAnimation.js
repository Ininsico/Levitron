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
/**
 * Distinct entrance styles, cycled per slide. One repeated fade-up is what made
 * every transition feel identical; a deck should not move the same way eight
 * times.
 */
const TRANSITION_STYLES = ['rise', 'push', 'zoom', 'dissolve']

export function transitionFor(index) {
  return TRANSITION_STYLES[index % TRANSITION_STYLES.length]
}

const BAR = '[data-anim="bar"]'
const TEXT = '[data-anim="heading"], [data-anim="statement"]'
const BULLETS = '[data-anim="bullet"]'
const META = '[data-anim="meta"]'

function buildTimeline(variant) {
  const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
  const barFrom = { scaleX: 0, transformOrigin: 'left center' }

  if (variant === 'push') {
    // Everything enters from the right, like a slide being pushed on.
    timeline
      .fromTo(TEXT, { x: 70, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6 })
      .fromTo(BAR, barFrom, { scaleX: 1, duration: 0.5 }, '-=0.45')
      .fromTo(BULLETS, { x: 48, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, stagger: 0.07 }, '-=0.4')
  } else if (variant === 'zoom') {
    // Settles in from slightly small — reads as a focus pull.
    timeline
      .fromTo(TEXT, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6 })
      .fromTo(BAR, barFrom, { scaleX: 1, duration: 0.5 }, '-=0.5')
      .fromTo(BULLETS, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.07 }, '-=0.4')
  } else if (variant === 'dissolve') {
    // No travel at all, just a staggered fade — quiet, for a pause in the deck.
    timeline.fromTo(
      [BAR, TEXT, BULLETS],
      { opacity: 0 },
      { opacity: 1, duration: 0.8, stagger: 0.07 },
    )
  } else {
    timeline
      .fromTo(BAR, barFrom, { scaleX: 1, duration: 0.45 })
      .fromTo(TEXT, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, '-=0.2')
      .fromTo(BULLETS, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.08 }, '-=0.32')
  }

  timeline.fromTo(META, { opacity: 0 }, { opacity: 1, duration: 0.4 }, '-=0.2')

  return timeline
}

export function useSlideAnimation(deps = [], variant = 'rise') {
  const scope = useRef(null)

  useLayoutEffect(() => {
    const element = scope.current
    if (!element) return undefined
    if (prefersReducedMotion()) return undefined

    const context = gsap.context(() => {
      buildTimeline(variant)
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
