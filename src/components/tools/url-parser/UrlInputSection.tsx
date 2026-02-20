import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  CircleDotDashed,
  Code,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import ToolLayout from '../../ui/ToolLayout';
import { Button } from '../../ui/Button';
import { Textarea } from '../../ui/Textarea';
import { CopyButton } from '../../ui/CopyButton';

type UrlInputStatus = 'idle' | 'valid' | 'invalid';

interface UrlInputSectionProps {
  input: string;
  error: string | null;
  status: UrlInputStatus;
  parsedUrl: URL | null;
  paramCount: number;
  onInputChange: (value: string) => void;
  onEncode: () => void;
  onDecode: () => void;
  onClear: () => void;
}

const UrlInputSection: React.FC<UrlInputSectionProps> = ({
  input,
  error,
  status,
  parsedUrl,
  paramCount,
  onInputChange,
  onEncode,
  onDecode,
  onClear,
}) => {
  const hasInput = input.trim().length > 0;
  const normalizedHost = parsedUrl?.hostname ?? '--';

  const statusConfig: Record<
    UrlInputStatus,
    { label: string; icon: React.ReactNode; className: string }
  > = {
    idle: {
      label: 'Waiting for URL',
      icon: <CircleDotDashed className="h-3.5 w-3.5" />,
      className: 'border-border/70 bg-muted/25 text-muted-foreground',
    },
    valid: {
      label: 'Valid URL',
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    invalid: {
      label: 'Invalid URL',
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      className: 'border-destructive/40 bg-destructive/10 text-destructive',
    },
  };

  return (
    <ToolLayout.Section
      title="Input URL"
      actions={
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          data-action="clear-url-input"
          data-testid="url-clear-button"
          className="h-8 text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-1.5" />
          Clear
        </Button>
      }
    >
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <div
            className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium ${statusConfig[status].className}`}
          >
            {statusConfig[status].icon}
            {statusConfig[status].label}
          </div>
          <div className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/20 px-2 py-1 text-xs text-muted-foreground">
            Host: <span className="font-mono text-foreground/90">{normalizedHost}</span>
          </div>
          <div className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/20 px-2 py-1 text-xs text-muted-foreground">
            Params: <span className="font-mono text-foreground/90">{paramCount}</span>
          </div>
        </div>

        <div className="relative group">
          <Textarea
            placeholder="Paste your URL here..."
            className="font-mono text-sm min-h-[120px] resize-y bg-background focus:ring-2 ring-primary/20 transition-all border-muted-foreground/20 pr-10"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            data-action="edit-url-input"
            data-testid="url-input-textarea"
            aria-label="URL input"
          />
          {input && (
            <div className="absolute right-2 top-2 opacity-80 group-hover:opacity-100 transition-opacity">
              <CopyButton
                value={input}
                data-action="copy-url-input"
                data-testid="url-copy-input-button"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              onClick={onEncode}
              data-action="encode-url"
              data-testid="url-encode-button"
              disabled={!hasInput}
              className="hover:bg-primary hover:text-primary-foreground transition-all disabled:hover:bg-secondary disabled:hover:text-secondary-foreground"
            >
              <Code className="w-4 h-4 mr-2" />
              Encode
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onDecode}
              data-action="decode-url"
              data-testid="url-decode-button"
              disabled={!hasInput}
              className="hover:bg-primary hover:text-primary-foreground transition-all disabled:hover:bg-secondary disabled:hover:text-secondary-foreground"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Decode
            </Button>
          </div>

          {error && (
            <div className="text-sm font-medium text-destructive flex items-center animate-in fade-in slide-in-from-left-2">
              <span className="w-2 h-2 rounded-full bg-destructive mr-2" />
              {error}
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Tip: URLs without protocol are parsed as <span className="font-mono">https://</span> for
          preview.
        </p>
      </div>
    </ToolLayout.Section>
  );
};

export default UrlInputSection;
