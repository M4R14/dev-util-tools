import React from 'react';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { CopyButton } from '../../ui/CopyButton';

interface UrlComponentInputProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  multiline?: boolean;
}

const UrlComponentInput: React.FC<UrlComponentInputProps> = ({
  label,
  value,
  icon,
  multiline = false,
}) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
      {icon}
      {label}
    </label>
    <div className="flex gap-2 group relative">
      {multiline ? (
        <Textarea
          readOnly
          value={value}
          className="font-mono text-xs bg-muted/30 focus:bg-background min-h-[38px] h-auto border-primary/20 resize-none py-2 pr-9"
          rows={1}
        />
      ) : (
        <Input
          readOnly
          value={value}
          className="font-mono text-xs bg-muted/30 focus:bg-background h-9 border-primary/20 pr-9"
        />
      )}
      <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton value={value} className="h-7 w-7" />
      </div>
    </div>
  </div>
);

export default UrlComponentInput;
