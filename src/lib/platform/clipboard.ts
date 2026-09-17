/**
 * Write text to the clipboard from any origin.
 *
 * `navigator.clipboard` exists only in a secure context. Over the plain-HTTP LAN origin Vite
 * prints — which is how this app gets opened on a phone or a colleague's machine — it is simply
 * `undefined`, so every copy button in the app used to fail with "Failed to copy" while the page
 * around it worked fine.
 *
 * `document.execCommand('copy')` is deprecated but carries no such restriction, so it is the
 * fallback rather than the thing that was removed. It is reached in two cases: the modern API is
 * missing, or it rejected — a rejection from an unfocused document can still succeed this way.
 */

const focus = (element: unknown) => {
  // Duck-typed rather than `instanceof HTMLElement`: this module is also loaded where that
  // constructor does not exist.
  if (element && typeof (element as { focus?: unknown }).focus === 'function') {
    (element as { focus: () => void }).focus();
  }
};

/**
 * Copy by selecting the text in a throwaway `<textarea>`.
 *
 * The element has to be rendered and selectable — `display: none`, `visibility: hidden` or a
 * detached node all leave the selection empty and the copy a silent no-op — so it is pushed
 * off-screen instead. `position: fixed` keeps the page from scrolling to it.
 */
const copyBySelection = (value: string): boolean => {
  if (typeof document === 'undefined') return false;

  const textarea = document.createElement('textarea');
  textarea.value = value;
  // Blocks the on-screen keyboard on mobile; iOS then needs setSelectionRange, because it ignores
  // select() on a read-only field.
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '-9999px';
  textarea.style.opacity = '0';

  const previouslyFocused = document.activeElement;

  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, value.length);

  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    // Runs even on a throw: a leaked textarea would sit in the DOM stealing selections.
    document.body.removeChild(textarea);
    focus(previouslyFocused);
  }
};

/** Returns whether the value reached the clipboard. Never throws. */
export const writeToClipboard = async (value: string): Promise<boolean> => {
  if (typeof navigator !== 'undefined' && typeof navigator.clipboard?.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(value);

      return true;
    } catch {
      // Fall through to the selection path rather than reporting failure straight away.
    }
  }

  return copyBySelection(value);
};
