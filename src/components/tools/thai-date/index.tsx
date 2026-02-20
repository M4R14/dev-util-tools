import React, { useState } from 'react';
import dayjs from 'dayjs';
import {
  CircleAlert,
  CircleCheckBig,
  Info,
  Keyboard,
  ListOrdered,
  Sparkles,
} from 'lucide-react';
import ToolLayout from '../../ui/ToolLayout';
import { Card, CardContent } from '../../ui/Card';
import { useThaiDateConverter } from '../../../hooks/useThaiDateConverter';
import { BUDDHIST_YEAR_OFFSET } from '../../../lib/thaiDate';
import { cn } from '../../../lib/utils';
import CurrentTimeSection from './CurrentTimeSection';
import DateConverterSection from './DateConverterSection';
import DatePickerInput from './DatePickerInput';
import TextParserInput from './TextParserInput';
import ParserResultSection from './ParserResultSection';
import ReferenceTableSection from './ReferenceTableSection';
import { DAY_REFERENCE_ROWS, MONTH_REFERENCE_ROWS } from './referenceData';

type ParserInputMode = 'picker' | 'text';

const PARSER_MODES = [
  { mode: 'picker' as ParserInputMode, label: 'เลือกวันที่', icon: ListOrdered },
  { mode: 'text' as ParserInputMode, label: 'พิมพ์เอง', icon: Keyboard },
];

const ThaiDateConverter: React.FC = () => {
  const {
    date, setDate, parseInput, setParseInput, formats, parseResult,
    pickerDay, setPickerDay, pickerMonth, setPickerMonth,
    pickerYear, setPickerYear, pickerMonthFormat, setPickerMonthFormat,
    monthOptions, parsedFormats,
  } = useThaiDateConverter();

  const [parserMode, setParserMode] = useState<ParserInputMode>('picker');
  const hasParseInput = parseInput.trim().length > 0;
  const parserStatus: 'idle' | 'success' | 'invalid' = !hasParseInput
    ? 'idle'
    : parseResult
      ? 'success'
      : 'invalid';

  const clearPicker = () => {
    setPickerDay('');
    setPickerMonth('');
    setPickerYear('');
    setParseInput('');
  };

  const setPickerToday = () => {
    const now = dayjs();
    setPickerDay(String(now.date()));
    setPickerMonth(String(now.month()));
    setPickerYear(String(now.year() + BUDDHIST_YEAR_OFFSET));
  };

  const handleTextChange = (value: string) => {
    setParseInput(value);
    setPickerDay('');
    setPickerMonth('');
    setPickerYear('');
  };

  return (
    <ToolLayout>
      <CurrentTimeSection />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DateConverterSection date={date} setDate={setDate} formats={formats} />

        <ToolLayout.Section title="Thai Date Parser">
          <Card className="border-border shadow-sm h-full flex flex-col">
            <CardContent className="p-6 space-y-5 flex-1">
              <div className="rounded-xl border border-border/60 bg-gradient-to-r from-muted/40 to-muted/10 px-4 py-3 flex gap-2.5">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  รองรับการกรอกวันที่ไทยทั้งแบบ <span className="text-foreground font-medium">เลือกค่า</span>{' '}
                  และ <span className="text-foreground font-medium">พิมพ์เอง</span> พร้อมแปลงออกเป็น ISO
                  และรูปแบบไทยหลายแบบทันที
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-background/50 p-2">
                <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold px-2 py-1 rounded-md bg-muted/40">
                  <Sparkles className="w-3.5 h-3.5" />
                  Input Mode
                </div>
                {PARSER_MODES.map(({ mode, label, icon: Icon }) => (
                  <button
                    key={mode}
                    onClick={() => setParserMode(mode)}
                    className={cn(
                      'flex-1 min-w-[140px] flex items-center justify-center gap-2 text-sm font-medium px-3 py-2 rounded-md transition-all',
                      parserMode === mode
                        ? 'bg-primary/10 text-primary shadow-sm border border-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              <div
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                  parserStatus === 'success' && 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300',
                  parserStatus === 'invalid' && 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
                  parserStatus === 'idle' && 'border-border/60 bg-muted/20 text-muted-foreground',
                )}
              >
                {parserStatus === 'success' ? (
                  <CircleCheckBig className="w-4 h-4 shrink-0" />
                ) : parserStatus === 'invalid' ? (
                  <CircleAlert className="w-4 h-4 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 shrink-0" />
                )}
                <span>
                  {parserStatus === 'success'
                    ? 'ตรวจพบรูปแบบวันที่แล้ว สามารถคัดลอกผลลัพธ์ได้ทันที'
                    : parserStatus === 'invalid'
                      ? 'ยังไม่รู้จักรูปแบบนี้ ลองเปลี่ยนเดือน/ปี หรือใช้ตัวอย่างที่แนะนำ'
                      : 'เลือกโหมดและกรอกวันที่เพื่อเริ่มแปลงผล'}
                </span>
              </div>

              {parserMode === 'picker' ? (
                <DatePickerInput
                  monthOptions={monthOptions}
                  pickerDay={pickerDay}
                  pickerMonth={pickerMonth}
                  pickerYear={pickerYear}
                  pickerMonthFormat={pickerMonthFormat}
                  onDayChange={setPickerDay}
                  onMonthChange={setPickerMonth}
                  onYearChange={setPickerYear}
                  onMonthFormatChange={setPickerMonthFormat}
                  onSetToday={setPickerToday}
                  onClear={clearPicker}
                />
              ) : (
                <TextParserInput
                  parseInput={parseInput}
                  onChange={handleTextChange}
                />
              )}

              <ParserResultSection
                parseInput={parseInput}
                parseResult={parseResult}
                parsedFormats={parsedFormats}
              />
            </CardContent>
          </Card>
        </ToolLayout.Section>
      </div>

      <ReferenceTableSection
        title="Month Reference Table"
        description="ตารางอ้างอิงชื่อเดือนสำหรับการกรอก/แปลงวันที่"
        totalLabel="12 months"
        rows={MONTH_REFERENCE_ROWS}
        numberLabel="เดือน"
        minWidthClassName="min-w-[1280px]"
      />

      <ReferenceTableSection
        title="Day Reference Table"
        description="ตารางอ้างอิงชื่อวันสำหรับการกรอก/แปลงวันที่"
        totalLabel="7 days"
        rows={DAY_REFERENCE_ROWS}
        numberLabel="วัน"
        minWidthClassName="min-w-[920px]"
      />
    </ToolLayout>
  );
};

export default ThaiDateConverter;
