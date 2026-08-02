import { useEffect, useState } from 'react';

/**
 * Reactive media query. Needed wherever a layout decision must survive a resize — reading
 * `window.innerWidth` once during render silently goes stale, so a sidebar opened on a narrow
 * window would keep behaving as a modal after the window was widened.
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);

    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener('change', onChange);

    return () => mediaQuery.removeEventListener('change', onChange);
  }, [query]);

  return matches;
};

/** Tailwind's `md` breakpoint — the point at which the sidebar stops being an overlay. */
export const MD_BREAKPOINT_QUERY = '(min-width: 768px)';

export const useIsDesktopViewport = () => useMediaQuery(MD_BREAKPOINT_QUERY);
