/**
 * Motion preference, in one place.
 *
 * `prefers-reduced-motion` is not a styling nicety — for some users animated scrolling triggers
 * nausea or vertigo. Route transitions already honoured it; the command palette's
 * `scrollIntoView` did not, so arrowing through results animated regardless.
 */

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION_QUERY).matches;

/** The `behavior` to hand to `scrollTo`/`scrollIntoView`. */
export const scrollBehavior = (): ScrollBehavior => (prefersReducedMotion() ? 'auto' : 'smooth');
