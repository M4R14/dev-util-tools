import { useEffect, useState, type RefObject } from 'react';

/**
 * Whether a scroll container has moved past a threshold.
 *
 * Used to decide when the sticky header should take over the page title. The title and its
 * favourite toggle used to be rendered in both places at once — the header and the page heading
 * about sixty pixels below it — so the same control appeared twice with no way to tell them apart.
 * Showing the header copy only once the real heading has scrolled away keeps the orientation the
 * sticky bar is for, without the duplication.
 */
export const useScrolledPast = (
  targetRef: RefObject<HTMLElement | null>,
  threshold: number,
): boolean => {
  const [scrolledPast, setScrolledPast] = useState(false);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const update = () => setScrolledPast(target.scrollTop > threshold);

    // Run once: a route change can restore a scroll position before any scroll event fires.
    update();
    target.addEventListener('scroll', update, { passive: true });

    return () => target.removeEventListener('scroll', update);
  }, [targetRef, threshold]);

  return scrolledPast;
};
