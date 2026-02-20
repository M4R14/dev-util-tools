import React from 'react';
import dayjs from 'dayjs';
import { Input } from '../../ui/Input';
import { cn } from '../../../lib/utils';
import { type ParserMonthFormat } from '../../../hooks/useThaiDateConverter';
import { BUDDHIST_YEAR_OFFSET } from '../../../lib/thaiDate';

interface DatePickerInputProps {
  monthOptions: { label: string; value: number }[];
  onClear: () => void;
  onChange: (value: string  ) => void;
}



const DatePickerInput: React.FC<DatePickerInputProps> = ({
  monthOptions,
  onClear,
  onChange
}) => {
  const currentDate = dayjs()
  const [ hasValue, setHasValue ] = React.useState(currentDate.date() !== 0)
  const [ pickerDay, setPickerDay ] = React.useState(currentDate.date())
  const [ pickerMonth, setPickerMonth ] = React.useState<string>(monthOptions[0].value.toString())
  const [ pickerYear, setPickerYear ] = React.useState(currentDate.year() + BUDDHIST_YEAR_OFFSET)
  const [ pickerMonthFormat, setPickerMonthFormat ] = React.useState<ParserMonthFormat>('short');

  const handleChange = (action: 'day' | 'month' | 'year' | 'clear', value?: number | string) => {
    console.log(action, value)
    switch (action) {
      case 'day':
        setPickerDay(value as number)
        break;
      case 'month':
        setPickerMonth(value as string)
        break;
      case 'year':
        setPickerYear(value as number);
        setHasValue(false);
        break;
      case 'clear':
        onClear();
        setPickerDay(0);
        setPickerMonth('');
        setPickerYear(0);
        setHasValue(false);
        break;
    }

    // to date string
    const dateTxt = `${pickerDay} ${pickerMonth} ${pickerYear}`;
    onChange(dateTxt);
  };

  return (
    <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border/50">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider block">
          เลือกวันที่ (พ.ศ.)
        </label>
        <div className="flex items-center gap-1.5">
          {hasValue && (
            <button
              onClick={() => handleChange('clear')}
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors"
            > ล้าง
            </button>
          )}
          <div className="flex items-center gap-0.5 bg-background rounded-lg border border-border p-0.5">
            {(['short', 'long'] as ParserMonthFormat[]).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setPickerMonthFormat(fmt)}
                className={cn(
                  'text-xs px-2.5 py-1 rounded-md transition-colors',
                  pickerMonthFormat === fmt
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              > {fmt === 'short' ? 'ย่อ' : 'เต็ม'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_1.5fr_1fr] gap-2">
        {/* Day */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold block">
            วัน
          </label>
          <Input
            type="number"
            min={1}
            max={31}
            value={pickerDay}
            onChange={(e) => handleChange('day', e.target.value)}
            placeholder="1"
            className="h-10 text-center bg-background tabular-nums"
          />
        </div>

        {/* Month */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold block">
            เดือน
          </label>
          <select
            value={pickerMonth}
            onChange={(e) => handleChange('month', e.target.value)}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm transition-colors cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              !pickerMonth && 'text-muted-foreground',
            )}
          >
            <option value="" disabled>
              เลือกเดือน
            </option>
            {monthOptions.map((m) => (
              <option key={m.value} value={m.label}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold block">
            ปี (พ.ศ.)
          </label>
          <Input
            type="number"
            value={pickerYear}
            onChange={(e) => handleChange('year', e.target.value)}
            placeholder={String(dayjs().year() + 543)}
            className="h-10 text-center bg-background tabular-nums"
          />
        </div>
      </div>
    </div>
  );
};

export default DatePickerInput;
