import React from 'react';
import dayjs from 'dayjs';
import { CalendarDays, Copy, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import ToolLayout from '../../ui/ToolLayout';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import DateFormatCard, { type DateFormatItem } from './DateFormatCard';

interface DateConverterSectionProps {
  date: string;
  setDate: (date: string) => void;
  formats: DateFormatItem[];
}

const QUICK_PRESETS = [
  { label: 'เมื่อวาน', offset: -1 },
  { label: 'วันนี้', offset: 0 },
  { label: 'พรุ่งนี้', offset: 1 },
];

const DateConverterSection: React.FC<DateConverterSectionProps> = ({ date, setDate, formats }) => {
  const parsedDate = dayjs(date);
  const isValidDate = Boolean(date) && parsedDate.isValid();
  const adYear = isValidDate ? parsedDate.year() : '-';
  const beYear = isValidDate ? parsedDate.year() + 543 : '-';

  const handleResetToToday = () => {
    setDate(dayjs().format('YYYY-MM-DD'));
    toast.success('Reset to today');
  };

  const handleCopyAllFormats = async () => {
    if (formats.length === 0) {
      toast.info('No date formats to copy');
      return;
    }

    const payload = formats.map((format) => `${format.label}: ${format.value}`).join('\n');

    try {
      await navigator.clipboard.writeText(payload);
      toast.success('Copied all date formats');
    } catch {
      toast.error('Unable to copy all date formats');
    }
  };

  return (
    <ToolLayout.Section
      title="Date Converter"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleResetToToday} className="gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            Today
          </Button>
          <Button variant="secondary" size="sm" onClick={handleCopyAllFormats} className="gap-1.5">
            <Copy className="w-3.5 h-3.5" />
            Copy all
          </Button>
        </div>
      }
    >
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <div className="space-y-5">
          <div className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CalendarDays className="w-4 h-4 text-primary" />
              Pick a Date (A.D.)
            </div>

            <div className="flex gap-3">
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 text-base bg-background"
                aria-label="Select Gregorian date"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {QUICK_PRESETS.map((preset) => {
                const presetDate = dayjs().add(preset.offset, 'day').format('YYYY-MM-DD');
                const isActive = presetDate === date;

                return (
                  <Button
                    key={preset.label}
                    type="button"
                    size="sm"
                    variant={isActive ? 'default' : 'outline'}
                    onClick={() => setDate(presetDate)}
                    className="h-8"
                  >
                    {preset.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border/60 bg-card p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">A.D. Year</p>
              <p className="mt-1 font-semibold text-foreground tabular-nums">{adYear}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">B.E. Year</p>
              <p className="mt-1 font-semibold text-foreground tabular-nums">{beYear}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/15 px-3 py-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Available Formats
            </p>
            <span className="inline-flex items-center rounded-full border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {formats.length} formats
            </span>
          </div>

          {formats.length > 0 ? (
            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-2.5 content-start">
              {formats.map((format, index) => (
                <DateFormatCard key={`${format.label}-${index}`} item={format} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/10 px-4 py-6 text-center">
              <p className="text-sm font-medium text-foreground">ยังไม่มีรูปแบบวันที่ให้แสดง</p>
              <p className="mt-1 text-xs text-muted-foreground">เลือกวันที่ก่อนเพื่อดูผลลัพธ์การแปลง</p>
            </div>
          )}
        </div>
      </div>
    </ToolLayout.Section>
  );
};

export default DateConverterSection;
