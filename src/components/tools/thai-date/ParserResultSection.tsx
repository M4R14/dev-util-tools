import React from 'react';
import { ArrowRightLeft, Info } from 'lucide-react';
import { CopyButton } from '../../ui/CopyButton';
import { cn } from '../../../lib/utils';

interface ParserResultSectionProps {
  parseInput: string;
  parseResult: { iso: string; formatted: string } | null;
  parsedFormats: { label: string; value: string }[];
}

const ParserResultSection: React.FC<ParserResultSectionProps> = ({
  parseInput,
  parseResult,
  parsedFormats,
}) => (
  <>
    {/* Parsed input preview */}
    {parseInput && (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/50 text-sm">
        <span className="text-muted-foreground shrink-0">ค่าที่ใช้แปลง:</span>
        <span className="font-mono text-foreground truncate">{parseInput}</span>
      </div>
    )}

    {/* Arrow */}
    <div className="flex justify-center">
      <div
        className={cn(
          'p-2 rounded-full border shadow-sm transition-colors',
          parseResult
            ? 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400'
            : 'bg-background border-border text-muted-foreground',
        )}
      >
        <ArrowRightLeft className="w-4 h-4 rotate-90" />
      </div>
    </div>

    {/* Result */}
    <div className="space-y-3">
      <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider block">
        ผลลัพธ์
      </label>

      {parseResult ? (
        <div className="space-y-3">
          {/* Main ISO result */}
          <div className="flex items-center justify-between gap-3 bg-green-500/5 p-4 rounded-xl border border-green-500/20">
            <div className="space-y-1 min-w-0">
              <div className="text-[10px] uppercase tracking-widest text-green-600 dark:text-green-400 font-semibold">
                ISO Date
              </div>
              <div className="text-2xl font-mono font-bold text-green-700 dark:text-green-300 tracking-tight">
                {parseResult.iso}
              </div>
            </div>
            <CopyButton
              value={parseResult.iso}
              className="h-9 w-9 shrink-0 hover:bg-green-500/20 text-green-700 dark:text-green-300"
            />
          </div>

          {/* All Thai formats from parsed date */}
          <div className="grid grid-cols-1 gap-2">
            {parsedFormats.map((fmt, i) => (
              <div
                key={i}
                className="group flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border/50 hover:border-primary/20 bg-card hover:bg-accent/30 transition-all"
              >
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                    {fmt.label}
                  </div>
                  <div className="font-mono text-sm text-card-foreground truncate">
                    {fmt.value}
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <CopyButton
                    value={fmt.value}
                    className="h-6 w-6"
                    iconClassName="w-3 h-3"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="min-h-[100px] p-6 rounded-xl border-2 border-border/50 border-dashed bg-muted/10 flex flex-col items-center justify-center text-center gap-2">
          <Info className="w-7 h-7 text-muted-foreground/20" />
          <p className="text-sm text-muted-foreground">
            {parseInput
              ? 'ไม่รู้จักรูปแบบนี้ — ลองเปลี่ยนรูปแบบวันที่'
              : 'เลือกวันที่ด้านบน หรือพิมพ์วันที่ภาษาไทย'}
          </p>
        </div>
      )}
    </div>
  </>
);

export default ParserResultSection;
