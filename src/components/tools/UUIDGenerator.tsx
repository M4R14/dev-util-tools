import React, { useEffect, useRef } from 'react';
import { Fingerprint, Settings2, RefreshCw, Copy, Trash2, Download, ShieldCheck, TriangleAlert } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Switch } from '../ui/Switch';
import { Slider } from '../ui/Slider';
import { CopyButton } from '../ui/CopyButton';
import { useUUIDGenerator } from '../../hooks/useUUIDGenerator';

const UUIDGenerator: React.FC = () => {
  const {
    uuids,
    options,
    setOptions,
    setQuantity,
    hasSecureUUID,
    generateUUID,
    clear,
    copyAll,
    download,
    minQuantity,
    maxQuantity,
  } = useUUIDGenerator();

  const quickQuantityPresets = [1, 5, 10, 25, 50, 100];
  const formattedPreview = options.uppercase
    ? (options.hyphens ? 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx' : 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx').toUpperCase()
    : options.hyphens
      ? 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
      : 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      generateUUID();
    }
  }, [generateUUID]);

  const handleChange = (key: keyof typeof options, value: string | number | boolean) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <ToolLayout className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Options Panel */}
        <Card className="lg:col-span-1 shadow-md border-border/60">
          <CardContent className="p-6 space-y-8">
            <div className="flex items-center gap-2 pb-4 border-b border-border">
              <Settings2 className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Configuration</h3>
            </div>

            <div className="space-y-6">
              {/* Quantity Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-foreground/80">Quantity</label>
                  <div className="relative">
                    <Input
                      type="number"
                      min={minQuantity}
                      max={maxQuantity}
                      value={options.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || minQuantity;
                        setQuantity(val);
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
                  onValueChange={(vals) => setQuantity(vals[0])}
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
                      onClick={() => setQuantity(preset)}
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
                    onCheckedChange={(checked) => handleChange('hyphens', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
                  <div className="space-y-0.5">
                    <label
                      className="text-sm font-medium cursor-pointer"
                      htmlFor="uppercase-switch"
                    >
                      Uppercase
                    </label>
                    <p className="text-xs text-muted-foreground">Convert characters to uppercase</p>
                  </div>
                  <Switch
                    id="uppercase-switch"
                    checked={options.uppercase}
                    onCheckedChange={(checked) => handleChange('uppercase', checked)}
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
                onClick={generateUUID}
              >
                <RefreshCw className="w-5 h-5 mr-2 animate-in spin-in-180 duration-500" />
                Generate UUIDs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <div className="lg:col-span-2 flex flex-col h-full gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Fingerprint className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Generated UUIDs</h3>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <p className="text-xs text-muted-foreground">Standard RFC 4122 Version 4</p>
                  <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {uuids.length} items
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      hasSecureUUID
                        ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                        : 'border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {hasSecureUUID ? (
                      <>
                        <ShieldCheck className="h-3 w-3" />
                        Secure randomUUID
                      </>
                    ) : (
                      <>
                        <TriangleAlert className="h-3 w-3" />
                        Fallback random
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {uuids.length > 0 && (
                <>
                  <Button variant="outline" size="sm" onClick={download} title="Download .txt">
                    <Download className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                  <Button variant="secondary" size="sm" onClick={clear} title="Clear List">
                    <Trash2 className="w-4 h-4 sm:mr-2 text-muted-foreground" />
                    <span className="hidden sm:inline">Clear</span>
                  </Button>
                  <Button variant="default" size="sm" onClick={copyAll} title="Copy All">
                    <Copy className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Copy All</span>
                  </Button>
                </>
              )}
            </div>
          </div>

          <Card className="flex-1 min-h-[500px] border-border/60 shadow-md bg-muted/10 flex flex-col">
            <CardContent className="p-0 flex-1 relative flex flex-col">
              {uuids.length > 0 ? (
                <div className="absolute inset-0 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                  {uuids.map((uuid, index) => (
                    <div
                      key={index}
                      className="group flex items-center gap-3 p-3 rounded-lg bg-background border border-border hover:border-primary/50 transition-all hover:shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <span className="text-xs font-mono text-muted-foreground w-6 text-right select-none opacity-50">
                        {index + 1}.
                      </span>
                      <span className="font-mono text-sm sm:text-base text-foreground/90 flex-1 truncate select-all">
                        {uuid}
                      </span>
                      <CopyButton
                        value={uuid}
                        className="h-8 w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity focus:opacity-100"
                      />
                    </div>
                  ))}
                  <div className="h-4" /> {/* Spacer */}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-20 text-muted-foreground/50 select-none">
                  <Fingerprint className="w-20 h-20 mb-6 opacity-10" />
                  <p className="text-lg font-medium text-muted-foreground/70">Ready to generate</p>
                  <p className="text-sm">Adjust settings and click Generate</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolLayout>
  );
};

export default UUIDGenerator;
