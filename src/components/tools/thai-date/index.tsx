import React, { useState } from 'react';
import { ListOrdered, Keyboard } from 'lucide-react';
import ToolLayout from '../../ui/ToolLayout';
import { Card, CardContent } from '../../ui/Card';
import { useThaiDateConverter, type ParserMonthFormat } from '../../../hooks/useThaiDateConverter';
import { cn } from '../../../lib/utils';
import CurrentTimeSection from './CurrentTimeSection';
import DateConverterSection from './DateConverterSection';
import DatePickerInput from './DatePickerInput';
import TextParserInput from './TextParserInput';
import ParserResultSection from './ParserResultSection';

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

  const clearPicker = () => {
    setPickerDay('');
    setPickerMonth('');
    setPickerYear('');
    setParseInput('');
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

        {/* Parser Section */}
        <ToolLayout.Section title="Thai Date Parser">
          <Card className="border-border shadow-sm h-full flex flex-col">
            <CardContent className="p-6 space-y-5 flex-1">
              {/* Mode Tabs */}
              <div className="flex items-center gap-1 bg-muted/50 rounded-lg border border-border p-1">
                {PARSER_MODES.map(({ mode, label, icon: Icon }) => (
                  <button
                    key={mode}
                    onClick={() => setParserMode(mode)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 text-sm font-medium px-3 py-2 rounded-md transition-all',
                      parserMode === mode
                        ? 'bg-background text-foreground shadow-sm border border-border/50'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Input mode */}
              {parserMode === 'picker' ? (
                <DatePickerInput
                  monthOptions={monthOptions}
                  onClear={clearPicker}
                  onChange={handleTextChange}
                />
              ) : (
                <TextParserInput
                  parseInput={parseInput}
                  onChange={handleTextChange}
                />
              )}

              {/* Result */}
              <ParserResultSection
                parseInput={parseInput}
                parseResult={parseResult}
                parsedFormats={parsedFormats}
              />
            </CardContent>
          </Card>
        </ToolLayout.Section>
      </div>
    </ToolLayout>
  );
};

export default ThaiDateConverter;
