import React from 'react';
import dayjs from 'dayjs';
import { CalendarDays } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { type ParserMonthFormat } from '../../../hooks/useThaiDateConverter';
import { BUDDHIST_YEAR_OFFSET } from '../../../lib/thaiDate';

interface DatePickerInputProps {
  monthOptions: { label: string; value: number }[];
  pickerDay: string;
  pickerMonth: string;
  pickerYear: string;
  pickerMonthFormat: ParserMonthFormat;
  onDayChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onMonthFormatChange: (value: ParserMonthFormat) => void;
  onSetToday: () => void;
  onClear: () => void;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  monthOptions,
  pickerDay,
  pickerMonth,
  pickerYear,
  pickerMonthFormat,
  onDayChange,
  onMonthChange,
  onYearChange,
  onMonthFormatChange,
  onSetToday,
  onClear,
}) => {
  const hasValue = Boolean(pickerDay || pickerMonth || pickerYear);

  return (
    <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border/50">
      <div className="flex items-start justify-between gap-2">
        <div>
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider block">
            เลือกวันที่ (พ.ศ.)
          </label>
          <p className="text-xs text-muted-foreground mt-1">
            รองรับทั้งเดือนแบบย่อและแบบเต็ม
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onSetToday}
          className="h-8 gap-1.5 shrink-0"
        >
          <CalendarDays className="w-3.5 h-3.5" />
          วันนี้
        </Button>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-0.5 bg-background rounded-lg border border-border p-0.5">
          {(['short', 'long'] as ParserMonthFormat[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => onMonthFormatChange(fmt)}
              className={cn(
                'text-xs px-2.5 py-1 rounded-md transition-colors',
                pickerMonthFormat === fmt
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {fmt === 'short' ? 'เดือนย่อ' : 'เดือนเต็ม'}
            </button>
          ))}
        </div>

        {hasValue && (
          <button
            onClick={onClear}
            className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors"
          >
            ล้างค่า
          </button>
        )}
      </div>

      <div className="grid grid-cols-[1fr_1.4fr_1fr] gap-2">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold block">
            วัน
          </label>
          <Input
            type="number"
            min={1}
            max={31}
            value={pickerDay}
            onChange={(e) => onDayChange(e.target.value)}
            placeholder={String(dayjs().date())}
            className="h-10 text-center bg-background tabular-nums"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold block">
            เดือน
          </label>
          <select
            value={pickerMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm transition-colors cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              !pickerMonth && 'text-muted-foreground',
            )}
          >
            <option value="" disabled>
              เลือกเดือน
            </option>
            {monthOptions.map((month) => (
              <option key={month.value} value={String(month.value)}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold block">
            ปี (พ.ศ.)
          </label>
          <Input
            type="number"
            value={pickerYear}
            onChange={(e) => onYearChange(e.target.value)}
            placeholder={String(dayjs().year() + BUDDHIST_YEAR_OFFSET)}
            className="h-10 text-center bg-background tabular-nums"
          />
        </div>
      </div>
    </div>
  );
};

export default DatePickerInput;
