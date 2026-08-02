import { useEffect } from 'react';
import type { RefObject } from 'react';
import { scrollBehavior } from '../../lib/platform/motion';

interface UseMainLayoutRouteEffectsOptions {
  pathname: string;
  mainContentRef: RefObject<HTMLElement | null>;
  closeSidebar: () => void;
  clearSearch: () => void;
}

export const useMainLayoutRouteEffects = ({
  pathname,
  mainContentRef,
  closeSidebar,
  clearSearch,
}: UseMainLayoutRouteEffectsOptions) => {
  useEffect(() => {
    closeSidebar();
  }, [closeSidebar, pathname]);

  /**
   * The search term is scoped to finding a tool, so it ends when a tool is found. It used to
   * survive the navigation: after clicking a result the sidebar stayed collapsed to a single
   * "Results" section showing 2 of 21 tools, with nothing but the leftover text in the box to
   * explain where the rest of the navigation had gone.
   */
  useEffect(() => {
    clearSearch();
  }, [clearSearch, pathname]);

  useEffect(() => {
    const mainElement = mainContentRef.current;
    if (!mainElement) return;

    mainElement.scrollTo({ top: 0, behavior: scrollBehavior() });
  }, [mainContentRef, pathname]);
};
