import { describe, expect, it } from 'vitest';
import { FOCUSABLE_SELECTOR, isTabReachable, shouldRestoreFocus } from './focusTrapTargets';

const element = (tabIndex: number, rectCount = 1) => ({
  tabIndex,
  getClientRects: () => ({ length: rectCount }),
});

describe('isTabReachable', () => {
  it('accepts a visible element in the tab order', () => {
    expect(isTabReachable(element(0))).toBe(true);
  });

  it('rejects an element removed from the tab order', () => {
    // The command palette's option buttons are tabIndex={-1} — driven by aria-activedescendant,
    // not Tab. Counting them made the trap compute the wrong last element, so Tab from the real
    // last control did not wrap.
    expect(isTabReachable(element(-1))).toBe(false);
  });

  it('rejects a hidden element even when it is in the tab order', () => {
    expect(isTabReachable(element(0, 0))).toBe(false);
  });

  it('accepts an explicit positive tabindex', () => {
    expect(isTabReachable(element(3))).toBe(true);
  });
});

describe('shouldRestoreFocus', () => {
  it('restores when focus is still inside the container', () => {
    expect(shouldRestoreFocus({ activeIsInsideContainer: true, activeIsBodyOrNull: false })).toBe(
      true,
    );
  });

  it('restores when the container unmounted and focus fell to the body', () => {
    // The command palette returns null when closed, so the containment check alone declined to
    // restore and focus was left on <body>.
    expect(shouldRestoreFocus({ activeIsInsideContainer: false, activeIsBodyOrNull: true })).toBe(
      true,
    );
  });

  it('leaves focus alone when it moved somewhere else deliberately', () => {
    expect(shouldRestoreFocus({ activeIsInsideContainer: false, activeIsBodyOrNull: false })).toBe(
      false,
    );
  });
});

describe('FOCUSABLE_SELECTOR', () => {
  it('excludes tabindex="-1" at the selector level too', () => {
    expect(FOCUSABLE_SELECTOR).toContain('[tabindex]:not([tabindex="-1"])');
  });

  it('skips disabled form controls', () => {
    expect(FOCUSABLE_SELECTOR).toContain('button:not([disabled])');
    expect(FOCUSABLE_SELECTOR).toContain('input:not([disabled])');
  });
});
