import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { isEditableTarget } from './useCommandPaletteHotkey';

/**
 * jsdom cannot boot in this project (its css-color dependency is CJS requiring ESM), so
 * `HTMLElement` is stubbed with a minimal stand-in. These tests cover the predicate's branching —
 * which tags count as editable and how the contenteditable ancestor lookup is used — not the
 * browser's own DOM semantics.
 */
class StubHTMLElement {
  tagName: string;
  isContentEditable: boolean;
  private closestResult: StubHTMLElement | null;
  closestSelector: string | null = null;

  constructor(
    tagName: string,
    options: { isContentEditable?: boolean; editableAncestor?: boolean } = {},
  ) {
    this.tagName = tagName;
    this.isContentEditable = options.isContentEditable ?? false;
    this.closestResult = options.editableAncestor ? this : null;
  }

  closest(selector: string) {
    this.closestSelector = selector;
    return this.closestResult;
  }
}

beforeAll(() => {
  vi.stubGlobal('HTMLElement', StubHTMLElement);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe('isEditableTarget', () => {
  it('is false for a null target or a non-element', () => {
    expect(isEditableTarget(null)).toBe(false);
    expect(isEditableTarget({} as EventTarget)).toBe(false);
  });

  it.each(['INPUT', 'TEXTAREA'])('is true for a %s', (tagName) => {
    expect(isEditableTarget(new StubHTMLElement(tagName) as unknown as EventTarget)).toBe(true);
  });

  it('is true for an element that is itself contenteditable', () => {
    const target = new StubHTMLElement('DIV', { isContentEditable: true });
    expect(isEditableTarget(target as unknown as EventTarget)).toBe(true);
  });

  it('is true for an element inside a contenteditable ancestor', () => {
    const target = new StubHTMLElement('SPAN', { editableAncestor: true });
    expect(isEditableTarget(target as unknown as EventTarget)).toBe(true);
  });

  it('is false for an ordinary element with no editable ancestor', () => {
    const target = new StubHTMLElement('DIV');
    expect(isEditableTarget(target as unknown as EventTarget)).toBe(false);
  });

  it('excludes contenteditable="false" via the ancestor selector', () => {
    const target = new StubHTMLElement('SPAN');
    isEditableTarget(target as unknown as EventTarget);

    expect(target.closestSelector).toBe('[contenteditable]:not([contenteditable="false"])');
  });
});
