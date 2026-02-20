import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Calendar, RotateCcw } from 'lucide-react';
import ToolLayout from '../../ui/ToolLayout';
import { Card, CardContent } from '../../ui/Card';
import { CopyButton } from '../../ui/CopyButton';

const formatThaiDateTime = (d: dayjs.Dayjs) =>
  d.toDate().toLocaleString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

const CurrentTimeSection: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <ToolLayout.Section title="Current Time">
      <Card className="border-border/60 shadow-sm bg-gradient-to-br from-background via-background to-primary/5">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-4 items-stretch">
            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-4 sm:p-5">
              <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:text-green-300">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                Live
              </div>

              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                Thai Date & Time
              </div>

              <div className="mt-2 text-xl sm:text-2xl font-medium text-primary font-mono tracking-tight leading-tight break-words">
                {formatThaiDateTime(currentTime)}
              </div>

              <p className="mt-2 text-xs text-muted-foreground/80">
                Updates every second
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/70 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5" />
                  ISO 8601 Standard
                </div>
                <span className="inline-flex items-center rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  UTC{currentTime.format('Z')}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 bg-background/80 backdrop-blur-sm p-3 rounded-xl border border-border shadow-sm group hover:border-primary/50 transition-colors">
                <div className="min-w-0 space-y-0.5">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                    Current ISO
                  </p>
                  <p className="text-sm sm:text-base font-mono text-muted-foreground truncate select-all">
                    {currentTime.toISOString()}
                  </p>
                </div>
                <CopyButton value={currentTime.toISOString()} className="h-9 w-9 shrink-0" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Unix (s)</p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="font-mono text-xs sm:text-sm text-foreground truncate">
                      {Math.floor(currentTime.valueOf() / 1000)}
                    </p>
                    <CopyButton
                      value={String(Math.floor(currentTime.valueOf() / 1000))}
                      className="h-7 w-7 shrink-0"
                      iconClassName="w-3 h-3"
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Unix (ms)</p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="font-mono text-xs sm:text-sm text-foreground truncate">
                      {currentTime.valueOf()}
                    </p>
                    <CopyButton
                      value={String(currentTime.valueOf())}
                      className="h-7 w-7 shrink-0"
                      iconClassName="w-3 h-3"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolLayout.Section>
  );
};

export default CurrentTimeSection;
