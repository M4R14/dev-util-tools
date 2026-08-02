import React from 'react';
import { CornerUpRight } from 'lucide-react';
import { Button, type ButtonProps } from './Button';
import { useSendToTool } from '../../context/SendToToolContext';

interface SendToToolButtonProps extends Omit<ButtonProps, 'onClick' | 'children'> {
  /** The output to hand on. A blank value disables the button — there is nothing to send. */
  value: string;
  /** Names the output in the label, e.g. "Send formatted JSON to another tool". */
  valueName?: string;
}

/**
 * Hands a tool's output to another tool.
 *
 * Sits beside the copy buttons because the value worth piping is the same one worth copying —
 * "format this JSON, now base64 it" is a round trip through the clipboard otherwise.
 */
export const SendToToolButton: React.FC<SendToToolButtonProps> = ({
  value,
  valueName,
  className,
  ...props
}) => {
  const { sendToTool } = useSendToTool();
  const label = valueName ? `Send ${valueName} to another tool` : 'Send to another tool';

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={className}
      disabled={!value.trim()}
      onClick={() => sendToTool(value)}
      title={label}
      aria-label={label}
      {...props}
    >
      <CornerUpRight className="w-4 h-4" aria-hidden="true" />
      <span className="ml-1.5 hidden sm:inline">Send to</span>
    </Button>
  );
};
