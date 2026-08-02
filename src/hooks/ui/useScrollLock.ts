import { useEffect, type RefObject } from 'react';

/**
 * Freezes a scroll container while an overlay is open.
 *
 * Takes the element rather than reaching for `document.body`, because in this app the body never
 * scrolls: the shell is `h-screen overflow-hidden` and `<main>` is the scroll container. Setting
 * `body { overflow: hidden }` — the usual modal recipe — would have done nothing here.
 *
 * The previous inline style is restored on unlock rather than being cleared, so this composes with
 * anything else that may have set it.
 */
export const useScrollLock = (targetRef: RefObject<HTMLElement | null>, active: boolean): void => {
  useEffect(() => {
    const target = targetRef.current;
    if (!active || !target) return;

    const previousOverflow = target.style.overflow;
    target.style.overflow = 'hidden';

    return () => {
      target.style.overflow = previousOverflow;
    };
  }, [active, targetRef]);
};
