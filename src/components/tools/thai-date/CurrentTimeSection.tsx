import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Calendar, RotateCcw } from 'lucide-react';
import ToolLayout from '../../ui/ToolLayout';
import { Card, CardContent } from '../../ui/Card';
import { CopyButton } from '../../ui/CopyButton';

const formatThaiDateTime = (d: dayjs.Dayjs) =>
  d.toDate().toLocaleDateString('th-TH', {
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
  );
};

export default CurrentTimeSection;
