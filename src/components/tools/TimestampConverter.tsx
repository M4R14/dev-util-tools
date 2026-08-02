import React from 'react';
import { Clock, Trash2 } from 'lucide-react';
import { ToolLayout } from '../ui/ToolLayout';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { CopyButton } from '../ui/CopyButton';
import { SendToToolButton } from '../ui/SendToToolButton';
import { useTimestampConverter } from '../../hooks/tools/useTimestampConverter';

const UNIT_LABEL: Record<string, string> = {
  seconds: 'Read as epoch seconds',
  milliseconds: 'Read as epoch milliseconds',
  microseconds: 'Read as epoch microseconds',
  iso: 'Read as a date string',
};

const TimestampConverter: React.FC = () => {
  const { input, setInput, views, detectedUnit, error, useNowSeconds, useNowMilliseconds, clear } =
    useTimestampConverter();

  return (
    <ToolLayout>
      <ToolLayout.Panel title="Timestamp">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          data-testid="timestamp-input"
          placeholder="1735689600 · 1735689600000 · 2025-01-01T00:00:00Z"
          className="font-mono"
          aria-label="Timestamp or date"
          aria-invalid={!!error}
        />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={useNowSeconds}>
            <Clock className="mr-2 h-4 w-4" aria-hidden="true" />
            Now (s)
          </Button>
          <Button variant="outline" size="sm" onClick={useNowMilliseconds}>
            <Clock className="mr-2 h-4 w-4" aria-hidden="true" />
            Now (ms)
          </Button>
          <Button variant="outline" size="sm" onClick={clear} disabled={!input}>
            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Clear
          </Button>

          {detectedUnit && (
            <span className="ml-auto inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
              {UNIT_LABEL[detectedUnit] ?? detectedUnit}
            </span>
          )}
        </div>
      </ToolLayout.Panel>

      <ToolLayout.Section title="Interpretations" className="mt-6">
        {error ? (
          <p className="text-sm font-medium text-destructive" role="alert">
            {error}
          </p>
        ) : views.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Paste the number from a log line. The unit is detected from its length — 10 digits is
            seconds, 13 is milliseconds, 16 is microseconds.
          </p>
        ) : (
          <dl className="divide-y divide-border/50">
            {views.map((view) => (
              <div key={view.label} className="flex flex-wrap items-center gap-x-3 py-2">
                <dt className="w-44 shrink-0 text-sm text-muted-foreground">{view.label}</dt>
                <dd className="min-w-0 flex-1 break-all font-mono text-sm text-foreground">
                  {view.value}
                </dd>
                <div className="flex shrink-0 items-center">
                  <SendToToolButton value={view.value} valueName={view.label} />
                  <CopyButton value={view.value} successMessage={`${view.label} copied`} />
                </div>
              </div>
            ))}
          </dl>
        )}
      </ToolLayout.Section>
    </ToolLayout>
  );
};

export default TimestampConverter;
