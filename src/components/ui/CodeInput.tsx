import React from 'react';
import { Textarea } from './Textarea';
import { cn } from '../../lib/utils';

interface CodeInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  /** Starting height. The user can drag it taller — that is the point of this component. */
  initialHeightClassName?: string;
}

const countLines = (value: string) => (value ? value.split('\n').length : 0);

/**
 * A monospace input for pasted documents, with a size readout and a drag handle.
 *
 * The tools that take a pasted payload had fixed, unresizable boxes: a twelve-user API response
 * showed 256px of a 3,360px document — about 155 lines hidden — with nothing on screen to say so.
 * Someone could not tell whether they had pasted the right thing, or all of it.
 *
 * The counter is the same shape the Diff Viewer already uses, so the two read alike.
 */
export const CodeInput: React.FC<CodeInputProps> = ({
  value,
  className,
  initialHeightClassName = 'h-40',
  ...props
}) => (
  <div className="flex flex-col gap-1">
    <Textarea
      value={value}
      spellCheck={false}
      className={cn(
        // resize-y rather than resize-none: the height is the reader's decision, not ours.
        'w-full resize-y border-none bg-transparent p-0 font-mono text-sm shadow-none focus-visible:ring-0',
        initialHeightClassName,
        className,
      )}
      {...props}
    />
    <p className="text-right text-[11px] tabular-nums text-muted-foreground" aria-live="off">
      {countLines(value)}L / {value.length}C
    </p>
  </div>
);
