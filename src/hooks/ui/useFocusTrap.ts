import { useEffect, useRef, type RefObject } from 'react';
import { FOCUSABLE_SELECTOR, isTabReachable, shouldRestoreFocus } from './focusTrapTargets';

/**
 * Modal focus behaviour for a container: move focus in on open, keep Tab inside, put focus back
 * where it came from on close.
 *
 * Scoped by `active` rather than by mount, because the sidebar is only modal on narrow viewports.
 * On desktop it is a permanent landmark sitting beside the content — trapping focus there would
 * make the rest of the page unreachable.
 *
 * Only the trap belongs here. Closing on Escape stays with the caller, which is the thing that
 * knows what "closed" means.
 */

const getFocusable = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(isTabReachable);

export const useFocusTrap = (
  containerRef: RefObject<HTMLElement | null>,
  { active }: { active: boolean },
) => {
  // Captured outside the effect body so a re-render caused by opening cannot overwrite it.
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!active || !container) return;

    previouslyFocused.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const focusable = getFocusable(container);
    // Focusing the container itself would leave a screen reader with nothing to read.
    focusable[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      // Recomputed per keypress: filtering the tool list changes what is focusable.
      const current = getFocusable(container);
      if (current.length === 0) return;

      const first = current[0];
      const last = current[current.length - 1];
      const activeElement = document.activeElement;

      if (!container.contains(activeElement)) {
        event.preventDefault();
        first.focus();
        return;
      }

      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      const active = document.activeElement;

      if (
        shouldRestoreFocus({
          activeIsInsideContainer: container.contains(active),
          activeIsBodyOrNull: active === null || active === document.body,
        })
      ) {
        previouslyFocused.current?.focus();
      }
    };
  }, [active, containerRef]);
};
