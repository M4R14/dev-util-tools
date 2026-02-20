import React from 'react';
import { toast } from 'sonner';
import ToolLayout from '../../ui/ToolLayout';
import { Textarea } from '../../ui/Textarea';
import { CopyButton } from '../../ui/CopyButton';
import type { TextMetrics } from './types';

interface DiffInputPanelsProps {
  original: string;
  modified: string;
  originalMetrics: TextMetrics;
  modifiedMetrics: TextMetrics;
  onOriginalChange: (value: string) => void;
  onModifiedChange: (value: string) => void;
}

const DiffInputPanels: React.FC<DiffInputPanelsProps> = ({
  original,
  modified,
  originalMetrics,
  modifiedMetrics,
  onOriginalChange,
  onModifiedChange,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[18rem]">
    <ToolLayout.Panel
      title={`Original · ${originalMetrics.lines}L / ${originalMetrics.chars}C`}
      actions={<CopyButton value={original} onCopy={() => toast.success('Original text copied')} />}
    >
      <Textarea
        value={original}
        onChange={(event) => onOriginalChange(event.target.value)}
        placeholder="Paste original text here…"
        className="w-full min-h-[16rem] h-full bg-transparent border-none focus-visible:ring-0 p-0 font-mono text-sm resize-none placeholder-muted-foreground shadow-none"
      />
    </ToolLayout.Panel>

    <ToolLayout.Panel
      title={`Modified · ${modifiedMetrics.lines}L / ${modifiedMetrics.chars}C`}
      actions={<CopyButton value={modified} onCopy={() => toast.success('Modified text copied')} />}
    >
      <Textarea
        value={modified}
        onChange={(event) => onModifiedChange(event.target.value)}
        placeholder="Paste modified text here…"
        className="w-full min-h-[16rem] h-full bg-transparent border-none focus-visible:ring-0 p-0 font-mono text-sm resize-none placeholder-muted-foreground shadow-none"
      />
    </ToolLayout.Panel>
  </div>
);

export default DiffInputPanels;
