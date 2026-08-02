import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

/**
 * "Send this output to another tool."
 *
 * The value travels through the target's own query param — `/json-formatter?input=…` — rather than
 * through a store, because that is already how every tool seeds itself and how its state becomes
 * shareable. The piped result lands with a URL you can hand to someone else, for free.
 *
 * The tool picker is the command palette. It already searches tools, handles the keyboard, carries
 * combobox semantics and traps focus; a bespoke dropdown would be a second, worse version of all
 * of that, and would need a popover dependency the project does not have.
 */
interface SendToToolContextValue {
  /** Value waiting to be sent, or null when the palette is in its normal mode. */
  pendingValue: string | null;
  /** Opens the palette in send mode. Ignores blank values — there is nothing to send. */
  sendToTool: (value: string) => void;
  clearPendingValue: () => void;
}

const SendToToolContext = createContext<SendToToolContextValue | undefined>(undefined);

export const useSendToTool = () => {
  const context = useContext(SendToToolContext);
  if (!context) {
    throw new Error('useSendToTool must be used within a SendToToolProvider');
  }
  return context;
};

interface SendToToolProviderProps {
  children: React.ReactNode;
  onRequestPicker: () => void;
}

export const SendToToolProvider: React.FC<SendToToolProviderProps> = ({
  children,
  onRequestPicker,
}) => {
  const [pendingValue, setPendingValue] = useState<string | null>(null);

  const sendToTool = useCallback(
    (value: string) => {
      if (!value.trim()) return;

      setPendingValue(value);
      onRequestPicker();
    },
    [onRequestPicker],
  );

  const clearPendingValue = useCallback(() => setPendingValue(null), []);

  const value = useMemo(
    () => ({ pendingValue, sendToTool, clearPendingValue }),
    [pendingValue, sendToTool, clearPendingValue],
  );

  return <SendToToolContext.Provider value={value}>{children}</SendToToolContext.Provider>;
};
