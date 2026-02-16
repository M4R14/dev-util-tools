import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Calendar, RotateCcw, ArrowRightLeft, Search, Info } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent } from '../ui/Card';
import { CopyButton } from '../ui/CopyButton';
import { useThaiDateConverter } from '../../hooks/useThaiDateConverter';
import { cn } from '../../lib/utils';

const ThaiDateConverter: React.FC = () => {
  const { date, setDate, parseInput, setParseInput, formats, parseResult } = useThaiDateConverter();

  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatThaiDateTime = (d: dayjs.Dayjs) => {
    return d.toDate().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <ToolLayout>
      {/* Current Time Section */}
      <ToolLayout.Section title="Current Time">
        <Card className="border-primary/20 shadow-md bg-gradient-to-br from-background to-primary/5">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-2 relative">
                <div className="absolute -left-3 -top-3 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Thai Date & Time
                </div>
                <div className="text-2xl md:text-3xl font-medium text-primary font-mono tracking-tight">
                  {formatThaiDateTime(currentTime)}
                </div>
                <p className="text-xs text-muted-foreground/80">
                  Updates automatically every second
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5" />
                  ISO 8601 Standard
                </div>
                <div className="flex items-center justify-between gap-3 bg-background/80 backdrop-blur-sm p-3 rounded-xl border border-border shadow-sm group hover:border-primary/50 transition-colors">
                  <div className="text-base md:text-lg font-mono text-muted-foreground truncate select-all">
                    {currentTime.toISOString()}
                  </div>
                  <CopyButton value={currentTime.toISOString()} className="h-9 w-9 shrink-0" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </ToolLayout.Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Converter Section */}
        <ToolLayout.Section title="Date Converter">
          <Card className="border-border shadow-sm h-full flex flex-col">
            <CardContent className="p-6 space-y-6 flex-1">
              <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider block">
                  Pick a Date (A.D.)
                </label>
                <div className="flex gap-3">
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-11 text-lg bg-background"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setDate(dayjs().format('YYYY-MM-DD'))}
                    className="h-11 w-11 shrink-0 bg-background hover:bg-primary/10 hover:text-primary transition-colors"
                    title="Reset to Today"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 content-start">
                {formats.map((format, index) => (
                  <div
                    key={index}
                    className="group relative bg-card hover:bg-accent/50 p-4 rounded-xl border border-border hover:border-primary/30 transition-all shadow-sm hover:shadow-md"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                        {format.label}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <CopyButton
                          value={format.value}
                          className="h-6 w-6"
                          iconClassName="w-3.5 h-3.5"
                        />
                      </div>
                    </div>
                    <div className="font-mono text-base text-card-foreground break-words font-medium">
                      {format.value}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ToolLayout.Section>

        {/* Parser Section */}
        <ToolLayout.Section title="Thai Date Parser">
          <Card className="border-border shadow-sm h-full flex flex-col">
            <CardContent className="p-6 space-y-6 flex-1">
              <div className="space-y-4">
                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider block">
                  Convert Thai Text to ISO
                </label>
                <div className="relative group">
                  <Input
                    value={parseInput}
                    onChange={(e) => setParseInput(e.target.value)}
                    placeholder="e.g. 1 ม.ค. 2567, 12 สิงหา 60"
                    className="h-12 text-lg pl-11 transition-all group-hover:border-primary/50 focus:border-primary"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-hover:text-primary transition-colors" />
                </div>

                <div className="flex flex-wrap gap-2">
                  {['1 ม.ค. 2567', '12 สิงหาคม 60', '14/02/2569'].map((example) => (
                    <button
                      key={example}
                      onClick={() => setParseInput(example)}
                      className="text-xs bg-muted hover:bg-muted/80 px-2.5 py-1 rounded-full text-muted-foreground transition-colors border border-transparent hover:border-border"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative py-4">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
                  <div className="bg-background p-2 rounded-full border border-border text-muted-foreground shadow-sm">
                    <ArrowRightLeft className="w-4 h-4 rotate-90" />
                  </div>
                </div>
                <div className="border-t border-border border-dashed" />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider block">
                  Conversion Result
                </label>

                <div
                  className={cn(
                    'min-h-[140px] p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden',
                    parseResult
                      ? 'bg-green-500/5 border-green-500/30 text-green-700 dark:text-green-300'
                      : 'bg-muted/20 border-border/50 border-dashed text-muted-foreground',
                  )}
                >
                  {parseResult ? (
                    <>
                      <div className="absolute top-0 right-0 p-4">
                        <CopyButton
                          value={parseResult.iso}
                          className="hover:bg-green-500/20 text-green-700 dark:text-green-300 h-9 w-9"
                        />
                      </div>
                      <div className="space-y-2 z-10">
                        <div className="text-3xl font-mono font-bold tracking-tight">
                          {parseResult.iso}
                        </div>
                        <div className="inline-block px-3 py-1 rounded-full bg-green-500/10 text-xs font-medium border border-green-500/20">
                          Formatted: {parseResult.formatted}
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-green-500/5 animate-in fade-in duration-500" />
                    </>
                  ) : (
                    <div className="space-y-2 max-w-[200px]">
                      <Info className="w-8 h-8 mx-auto opacity-20" />
                      <p className="text-sm">
                        {parseInput
                          ? 'Format not recognized'
                          : 'Enter a Thai date string above to see the ISO equivalent'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </ToolLayout.Section>
      </div>
    </ToolLayout>
  );
};

export default ThaiDateConverter;
