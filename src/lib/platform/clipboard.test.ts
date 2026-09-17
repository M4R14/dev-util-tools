import { describe, it, expect, vi, afterEach } from 'vitest';
import { writeToClipboard } from './clipboard';

/**
 * The environment is Node, so both the secure-context API and the DOM are stubbed. That is the
 * point of the tests: what this module does depends entirely on which of the two a browser
 * actually offers, and the failing case in the field was the one where the first is missing.
 */

const fakeTextarea = () => ({
  value: '',
  style: {} as Record<string, string>,
  setAttribute: vi.fn(),
  select: vi.fn(),
  setSelectionRange: vi.fn(),
});

const stubDocument = (execCommand: () => boolean, activeElement: unknown = null) => {
  const textarea = fakeTextarea();
  const appended: unknown[] = [];
  const removed: unknown[] = [];

  vi.stubGlobal('document', {
    activeElement,
    createElement: vi.fn(() => textarea),
    body: {
      appendChild: (node: unknown) => appended.push(node),
      removeChild: (node: unknown) => removed.push(node),
    },
    execCommand: vi.fn(execCommand),
  });

  return { textarea, appended, removed };
};

const stubClipboard = (writeText: ((value: string) => Promise<void>) | null) => {
  vi.stubGlobal('navigator', writeText ? { clipboard: { writeText } } : {});
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('writeToClipboard on a secure origin', () => {
  it('uses the clipboard API and leaves the DOM alone', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    const { appended } = stubDocument(() => true);

    await expect(writeToClipboard('app_prod_abc')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('app_prod_abc');
    expect(appended).toHaveLength(0);
  });
});

describe('writeToClipboard without the clipboard API', () => {
  it('falls back to a selection copy — the plain-HTTP LAN case', async () => {
    stubClipboard(null);
    const { textarea, appended } = stubDocument(() => true);

    await expect(writeToClipboard('app_prod_abc')).resolves.toBe(true);
    expect(textarea.value).toBe('app_prod_abc');
    expect(textarea.select).toHaveBeenCalled();
    expect(appended).toHaveLength(1);
    // Off-screen, not hidden: a hidden field selects nothing and copies nothing.
    expect(textarea.style.position).toBe('fixed');
  });

  it('cleans the textarea up and restores focus', async () => {
    const previouslyFocused = { focus: vi.fn() };
    stubClipboard(null);
    const { appended, removed } = stubDocument(() => true, previouslyFocused);

    await writeToClipboard('value');

    expect(removed).toEqual(appended);
    expect(previouslyFocused.focus).toHaveBeenCalled();
  });

  it('reports failure when the copy command declines', async () => {
    stubClipboard(null);
    stubDocument(() => false);

    await expect(writeToClipboard('value')).resolves.toBe(false);
  });

  it('reports failure — and still removes the textarea — when the command throws', async () => {
    stubClipboard(null);
    const { appended, removed } = stubDocument(() => {
      throw new Error('not allowed');
    });

    await expect(writeToClipboard('value')).resolves.toBe(false);
    expect(removed).toEqual(appended);
  });
});

describe('writeToClipboard when the clipboard API rejects', () => {
  it('tries the selection path rather than giving up', async () => {
    stubClipboard(() => Promise.reject(new Error('document is not focused')));
    const { appended } = stubDocument(() => true);

    await expect(writeToClipboard('value')).resolves.toBe(true);
    expect(appended).toHaveLength(1);
  });
});

describe('writeToClipboard with no DOM at all', () => {
  it('reports failure instead of throwing', async () => {
    stubClipboard(null);
    vi.stubGlobal('document', undefined);

    await expect(writeToClipboard('value')).resolves.toBe(false);
  });
});
