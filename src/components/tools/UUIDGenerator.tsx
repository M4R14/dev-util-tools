import React, { useEffect } from 'react';
import { Fingerprint, Settings2, RefreshCw, Copy, Trash2, Download } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Switch } from '../ui/Switch';
import { Slider } from '../ui/Slider';
import { CopyButton } from '../ui/CopyButton';
import { useUUIDGenerator } from '../../hooks/useUUIDGenerator';
import { toast } from 'sonner';

const UUIDGenerator: React.FC = () => {
  const { uuids, options, setOptions, generateUUID, clear, copyToClipboard } = useUUIDGenerator();

  useEffect(() => {
    generateUUID();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (key: keyof typeof options, value: string | number | boolean) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const handleCopyAll = () => {
    if (uuids.length > 0) {
      copyToClipboard(uuids.join('\n'));
      toast.success('Copied all UUIDs to clipboard');
    }
  };

  const handleDownload = () => {
    if (uuids.length === 0) return;
    const blob = new Blob([uuids.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uuids-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded UUIDs as text file');
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
                      min={1}
                      max={100}
                      value={options.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        handleChange('quantity', Math.min(100, Math.max(1, val)));
                      }}
                      className="w-20 h-8 text-right pr-2 font-mono"
                    />
                  </div>
                </div>
                <Slider
                  value={[options.quantity]}
                  min={1}
                  max={50}
                  step={1}
                  onValueChange={(vals) => handleChange('quantity', vals[0])}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>1</span>
                  <span>25</span>
                  <span>50</span>
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
                <p className="text-xs text-muted-foreground">Standard RFC 4122 Version 4</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {uuids.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    title="Download .txt"
                  >
                    <Download className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                  <Button variant="secondary" size="sm" onClick={clear} title="Clear List">
                    <Trash2 className="w-4 h-4 sm:mr-2 text-muted-foreground" />
                    <span className="hidden sm:inline">Clear</span>
                  </Button>
                  <Button variant="default" size="sm" onClick={handleCopyAll} title="Copy All">
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
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
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
