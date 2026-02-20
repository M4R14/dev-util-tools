import React from 'react';
import type { DiffLine } from '../../../lib/diffUtils';
import { cn } from '../../../lib/utils';

interface DiffLineRowProps {
  line: DiffLine;
  wrapLines: boolean;
}

export const DiffLineRow: React.FC<DiffLineRowProps> = ({ line, wrapLines }) => {
  const rowColorClass =
    line.type === 'added'
      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
      : line.type === 'removed'
        ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
        : 'text-foreground/80';

  const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ';

  return (
    <div className={cn('flex font-mono text-xs leading-6 min-h-[1.5rem]', rowColorClass)}>
      <span className="w-12 shrink-0 text-right pr-2 select-none text-muted-foreground/60 border-r border-border/30">
        {line.oldLineNumber ?? ''}
      </span>
      <span className="w-12 shrink-0 text-right pr-2 select-none text-muted-foreground/60 border-r border-border/30">
        {line.newLineNumber ?? ''}
      </span>
      <span className="w-5 shrink-0 text-center select-none opacity-60">{prefix}</span>
      <span
        className={cn('flex-1 pr-4', wrapLines ? 'whitespace-pre-wrap break-words' : 'whitespace-pre')}
      >
        {line.value}
      </span>
    </div>
  );
};

interface SplitLineRowProps {
  oldLine?: DiffLine;
  newLine?: DiffLine;
  wrapLines: boolean;
}

export const SplitLineRow: React.FC<SplitLineRowProps> = ({ oldLine, newLine, wrapLines }) => {
  const leftColorClass =
    oldLine?.type === 'removed'
      ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
      : 'text-foreground/80';

  const rightColorClass =
    newLine?.type === 'added'
      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
      : 'text-foreground/80';

  return (
    <div className="flex font-mono text-xs leading-6 min-h-[1.5rem]">
      <div className={cn('flex flex-1 min-w-0', leftColorClass)}>
        <span className="w-10 shrink-0 text-right pr-2 select-none text-muted-foreground/60 border-r border-border/30">
          {oldLine?.oldLineNumber ?? ''}
        </span>
        <span
          className={cn(
            'flex-1 pl-2 pr-2',
            wrapLines ? 'whitespace-pre-wrap break-words' : 'whitespace-pre overflow-x-auto',
          )}
        >
          {oldLine?.value ?? ''}
        </span>
      </div>

      <div className="w-px bg-border/50 shrink-0" />

      <div className={cn('flex flex-1 min-w-0', rightColorClass)}>
        <span className="w-10 shrink-0 text-right pr-2 select-none text-muted-foreground/60 border-r border-border/30">
          {newLine?.newLineNumber ?? ''}
        </span>
        <span
          className={cn(
            'flex-1 pl-2 pr-2',
            wrapLines ? 'whitespace-pre-wrap break-words' : 'whitespace-pre overflow-x-auto',
          )}
        >
          {newLine?.value ?? ''}
        </span>
      </div>
    </div>
  );
};
