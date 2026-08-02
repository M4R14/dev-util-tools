import React from 'react';
import { Copy, Check } from 'lucide-react';
import { Button, ButtonProps } from './Button';
import { useCopyToClipboard } from '../../hooks/ui/useCopyToClipboard';
import { cn } from '../../lib/utils';

/**
 * `onCopy` is deliberately excluded: it is a native clipboard DOM event, so callers who passed
 * it expecting a "copied" callback silently got a handler that only fires when the user copies a
 * text selection inside the button — never on click. Use `successMessage` instead.
 */
interface CopyButtonProps extends Omit<ButtonProps, 'onCopy'> {
  value: string;
  className?: string;
  iconClassName?: string;
  /** Toast text on success. Pass `null` to stay silent. */
  successMessage?: string | null;
}

export const CopyButton = ({
  value,
  className,
  iconClassName,
  successMessage,
  ...props
}: CopyButtonProps) => {
  const { copied, copy } = useCopyToClipboard();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => copy(value, { success: successMessage })}
      className={cn('h-8 w-8 text-muted-foreground hover:text-foreground', className)}
      title="Copy to clipboard"
      aria-label={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
      {...props}
    >
      {copied ? (
        <Check className={cn('w-4 h-4 text-green-500', iconClassName)} aria-hidden="true" />
      ) : (
        <Copy className={cn('w-4 h-4', iconClassName)} aria-hidden="true" />
      )}
    </Button>
  );
};
