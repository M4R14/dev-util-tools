import { useEffect } from 'react';
import type { RefObject } from 'react';

interface UseMainLayoutRouteEffectsOptions {
  pathname: string;
  mainContentRef: RefObject<HTMLElement | null>;
  closeSidebar: () => void;
}

export const useMainLayoutRouteEffects = ({
  pathname,
  mainContentRef,
  closeSidebar,
}: UseMainLayoutRouteEffectsOptions) => {
  useEffect(() => {
    closeSidebar();

    const mainElement = mainContentRef.current;
    if (!mainElement) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    mainElement.scrollTo({
      top: 0,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, [closeSidebar, mainContentRef, pathname]);
};
