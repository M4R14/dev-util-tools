import React from 'react';
import { RefreshCw, Settings2 } from 'lucide-react';
import { Card, CardContent } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Slider } from '../../ui/Slider';
import { Switch } from '../../ui/Switch';
import { Button } from '../../ui/Button';
import type { UUIDOptions } from '../../../hooks/useUUIDGenerator';

interface UUIDOptionsPanelProps {
  options: UUIDOptions;
  minQuantity: number;
  maxQuantity: number;
  quickQuantityPresets: readonly number[];
  formattedPreview: string;
  onSetQuantity: (quantity: number) => void;
  onOptionChange: (key: keyof UUIDOptions, value: string | number | boolean) => void;
  onGenerate: () => void;
}

const UUIDOptionsPanel: React.FC<UUIDOptionsPanelProps> = ({
  options,
  minQuantity,
  maxQuantity,
  quickQuantityPresets,
  formattedPreview,
  onSetQuantity,
  onOptionChange,
  onGenerate,
}) => (
  <Card className="lg:col-span-1 shadow-md border-border/60">
    <CardContent className="p-6 space-y-8">
      <div className="flex items-center gap-2 pb-4 border-b border-border">
        <Settings2 className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg">Configuration</h3>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-foreground/80">Quantity</label>
            <div className="relative">
              <Input
                type="number"
                min={minQuantity}
                max={maxQuantity}
                value={options.quantity}
                onChange={(event) => {
                  const value = parseInt(event.target.value, 10) || minQuantity;
                  onSetQuantity(value);
                }}
                className="w-20 h-8 text-right pr-2 font-mono"
              />
            </div>
          </div>
          <Slider
            value={[options.quantity]}
            min={minQuantity}
            max={maxQuantity}
            step={1}
            onValueChange={(values) => onSetQuantity(values[0])}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>{minQuantity}</span>
            <span>{Math.floor(maxQuantity / 2)}</span>
            <span>{maxQuantity}</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Quick Presets
          </p>
          <div className="grid grid-cols-3 gap-2">
            {quickQuantityPresets.map((preset) => (
              <Button
                key={preset}
                variant={options.quantity === preset ? 'default' : 'outline'}
                size="sm"
                onClick={() => onSetQuantity(preset)}
                className="font-mono text-xs"
              >
                {preset}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
            <div className="space-y-0.5">
              <label className="text-sm font-medium cursor-pointer" htmlFor="hyphens-switch">
                Hyphens
              </label>
              <p className="text-xs text-muted-foreground">Insert dashes between groups</p>
            </div>
            <Switch
              id="hyphens-switch"
              checked={options.hyphens}
              onCheckedChange={(checked) => onOptionChange('hyphens', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
            <div className="space-y-0.5">
              <label className="text-sm font-medium cursor-pointer" htmlFor="uppercase-switch">
                Uppercase
              </label>
              <p className="text-xs text-muted-foreground">Convert characters to uppercase</p>
            </div>
            <Switch
              id="uppercase-switch"
              checked={options.uppercase}
              onCheckedChange={(checked) => onOptionChange('uppercase', checked)}
            />
          </div>
        </div>

        <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Format Preview</p>
          <p className="mt-1 font-mono text-xs break-all text-foreground/90">{formattedPreview}</p>
        </div>
      </div>

      <div className="pt-2">
        <Button
          className="w-full h-11 text-base font-medium shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
          size="lg"
          onClick={onGenerate}
        >
          <RefreshCw className="w-5 h-5 mr-2 animate-in spin-in-180 duration-500" />
          Generate UUIDs
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default UUIDOptionsPanel;
