import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

/**
 * Copy-to-clipboard behaviour, separated from any particular button.
 *
 * The app copies from icon buttons, labelled buttons, code blocks, anchor links and plain hooks,
 * so the shared piece has to be the behaviour rather than a component — otherwise every non-icon
 * caller reimplements the write, the toast and the copied flag, which is how this codebase ended
 * up with three different reset delays and two stray timers.
 *
 * Copying an empty string is a no-op: it reports false and shows nothing.
 */

export interface CopyMessages {
  /** Toast shown on success. Pass `null` when the UI gives inline feedback instead. */
  success?: string | null;
  /** Toast shown on failure. Pass `null` when the caller's primary action succeeded anyway. */
  error?: string | null;
}

export interface UseCopyToClipboardOptions extends CopyMessages {
  /** How long `copied` stays true. */
  resetAfterMs?: number;
}

const DEFAULT_RESET_MS = 2000;
const DEFAULT_SUCCESS = 'Copied to clipboard';
const DEFAULT_ERROR = 'Failed to copy';

/**
 * Resolve which toasts a copy should show. `undefined` falls back, `null` means stay silent —
 * the distinction matters because "" and null both look falsy at the call site.
 *
 * Exported for tests: it is the only part of this hook that decides anything, and the project's
 * test setup cannot render hooks (no working jsdom).
 */
export const resolveCopyMessages = (
  hookLevel: CopyMessages = {},
  perCall: CopyMessages = {},
): { success: string | null; error: string | null } => {
  const pick = (
    call: string | null | undefined,
    hook: string | null | undefined,
    fallback: string,
  ) => {
    if (call !== undefined) return call;
    if (hook !== undefined) return hook;
    return fallback;
  };

  return {
    success: pick(perCall.success, hookLevel.success, DEFAULT_SUCCESS),
    error: pick(perCall.error, hookLevel.error, DEFAULT_ERROR),
  };
};

export const useCopyToClipboard = (options: UseCopyToClipboardOptions = {}) => {
  const { resetAfterMs = DEFAULT_RESET_MS, success: hookSuccess, error: hookError } = options;

  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const clearPendingReset = useCallback(() => {
    if (timeoutRef.current !== null && typeof window !== 'undefined') {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Without this, copying and navigating away within resetAfterMs leaves a timer holding a
  // setState on an unmounted component.
  useEffect(() => clearPendingReset, [clearPendingReset]);

  const copy = useCallback(
    async (value: string, messages: CopyMessages = {}) => {
      if (!value) return false;

      const { success: successMessage, error: errorMessage } = resolveCopyMessages(
        { success: hookSuccess, error: hookError },
        messages,
      );

      try {
        await navigator.clipboard.writeText(value);
      } catch {
        if (errorMessage) toast.error(errorMessage);
        return false;
      }

      setCopied(true);
      if (successMessage) toast.success(successMessage);

      clearPendingReset();
      if (typeof window !== 'undefined') {
        timeoutRef.current = window.setTimeout(() => setCopied(false), resetAfterMs);
      }

      return true;
    },
    [clearPendingReset, hookError, hookSuccess, resetAfterMs],
  );

  return { copied, copy };
};
