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
interface CopyButtonProps extends Omit<ButtonProps, 'onCopy' | 'children'> {
  value: string;
  className?: string;
  iconClassName?: string;
  /** Toast text on success. Pass `null` to stay silent. */
  successMessage?: string | null;
  /**
   * Visible text beside the icon, for when one icon cannot say what gets copied — two bare copy
   * buttons on the same screen leave the reader guessing which is which.
   *
   * `children` is excluded on purpose: this component renders its own icon, so a label passed as
   * children was silently dropped.
   */
  label?: string;
}

export const CopyButton = ({
  value,
  className,
  iconClassName,
  successMessage,
  label,
  ...props
}: CopyButtonProps) => {
  const { copied, copy } = useCopyToClipboard();
  const description = label ? `Copy ${label}` : 'Copy to clipboard';

  return (
    <Button
      variant="ghost"
      size={label ? 'sm' : 'icon'}
      onClick={() => copy(value, { success: successMessage })}
      className={cn(
        'text-muted-foreground hover:text-foreground',
        label ? 'px-2' : 'h-8 w-8',
        className,
      )}
      title={description}
      aria-label={copied ? `Copied ${label ?? 'to clipboard'}` : description}
      {...props}
    >
      {copied ? (
        <Check className={cn('w-4 h-4 text-green-500', iconClassName)} aria-hidden="true" />
      ) : (
        <Copy className={cn('w-4 h-4', iconClassName)} aria-hidden="true" />
      )}
      {label && <span className="ml-1.5 text-xs font-medium">{label}</span>}
    </Button>
  );
};
