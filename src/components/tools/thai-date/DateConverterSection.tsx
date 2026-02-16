import React from 'react';
import dayjs from 'dayjs';
import { RotateCcw } from 'lucide-react';
import ToolLayout from '../../ui/ToolLayout';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Card, CardContent } from '../../ui/Card';
import { CopyButton } from '../../ui/CopyButton';

interface DateConverterSectionProps {
  date: string;
  setDate: (date: string) => void;
  formats: { label: string; value: string }[];
}

const DateConverterSection: React.FC<DateConverterSectionProps> = ({ date, setDate, formats }) => (
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
);

export default DateConverterSection;
