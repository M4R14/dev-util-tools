import React from 'react';
import { RefreshCw } from 'lucide-react';
import ToolLayout from '../../ui/ToolLayout';
import { Button } from '../../ui/Button';
import { Slider } from '../../ui/Slider';
import { Switch } from '../../ui/Switch';
import { cn } from '../../../lib/utils';
import { LENGTH_PRESETS } from './constants';
import type { CharsetKey, CharsetOption } from './types';

interface PasswordOptionsPanelProps {
  length: number;
  activeSetCount: number;
  charsetOptions: CharsetOption[];
  onLengthChange: (value: number) => void;
  onToggleCharset: (key: CharsetKey, checked: boolean) => void;
  onRegenerate: () => void;
}

const PasswordOptionsPanel: React.FC<PasswordOptionsPanelProps> = ({
  length,
  activeSetCount,
  charsetOptions,
  onLengthChange,
  onToggleCharset,
  onRegenerate,
}) => (
  <ToolLayout.Panel title="Customize Options">
    <div className="space-y-7">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="password-length" className="text-sm font-semibold">
            Character Length
          </label>
          <div className="h-10 min-w-10 px-3 rounded-lg border border-primary/30 bg-primary/10 inline-flex items-center justify-center text-sm font-mono font-semibold text-primary">
            {length}
          </div>
        </div>
        <Slider
          id="password-length"
          min={4}
          max={64}
          step={1}
          value={[length]}
          onValueChange={([value]) => onLengthChange(value)}
        />
        <div className="grid grid-cols-4 gap-2">
          {LENGTH_PRESETS.map((preset) => (
            <Button
              key={preset}
              variant={length === preset ? 'default' : 'outline'}
              size="sm"
              onClick={() => onLengthChange(preset)}
              className="font-mono"
            >
              {preset}
            </Button>
          ))}
        </div>
      </div>

      <div className="border-t border-border/50" />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Character Sets</p>
          <span className="text-xs text-muted-foreground">{activeSetCount}/4 enabled</span>
        </div>

        {charsetOptions.map((option) => (
          <label
            key={option.key}
            htmlFor={`charset-${option.key}`}
            className={cn(
              'flex items-center justify-between gap-3 rounded-lg border px-3 py-3 transition-colors',
              option.checked
                ? 'border-primary/35 bg-primary/5'
                : 'border-border/70 bg-background hover:bg-muted/35',
            )}
          >
            <div>
              <p className="text-sm font-medium">{option.label}</p>
              <p className="text-xs text-muted-foreground">{option.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono rounded border border-border/60 bg-muted/35 px-2 py-1 text-muted-foreground">
                {option.sample}
              </span>
              <Switch
                id={`charset-${option.key}`}
                checked={option.checked}
                onCheckedChange={(checked) => onToggleCharset(option.key, checked)}
              />
            </div>
          </label>
        ))}
      </div>

      <div className="border-t border-border/50" />

      <div className="rounded-lg border border-border/70 bg-muted/25 px-3 py-2.5 text-xs text-muted-foreground">
        Password updates automatically when options change.
        <div className="mt-2">
          <Button variant="outline" size="sm" onClick={onRegenerate} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate Now
          </Button>
        </div>
      </div>
    </div>
  </ToolLayout.Panel>
);

export default PasswordOptionsPanel;
