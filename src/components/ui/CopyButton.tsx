import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button, ButtonProps } from './Button';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

interface CopyButtonProps extends ButtonProps {
  value: string;
  className?: string;
  iconClassName?: string;
}

export const CopyButton = ({ value, className, iconClassName, ...props }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className={cn("h-8 w-8 text-muted-foreground hover:text-foreground", className)}
      title="Copy to clipboard"
      {...props}
    >
      {copied ? (
        <Check className={cn("w-4 h-4 text-green-500", iconClassName)} />
      ) : (
        <Copy className={cn("w-4 h-4", iconClassName)} />
      )}
    </Button>
  );
};
