import React from 'react';
import {
  BadgeCheck,
  BadgeX,
  SearchCheck,
  Sparkles,
  Trash2,
  CreditCard,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import ToolLayout from '../ui/ToolLayout';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { CopyButton } from '../ui/CopyButton';
import { THAI_ID_PERSON_TYPES, THAI_ID_STRUCTURE } from '../../lib/thaiId';
import { useThaiId } from '../../hooks/useThaiId';

const ThaiIdTool: React.FC = () => {
  const { input, setInput, analysis, error, runAnalysis, generate, clear } = useThaiId();

  const handleAnalyze = () => {
    if (runAnalysis()) {
      toast.success('Thai ID analyzed');
      return;
    }

    if (input.trim()) {
      toast.error('Unable to analyze Thai ID');
    } else {
      toast.info('Please enter a Thai ID first');
    }
  };

  const handleClear = () => {
    clear();
    toast.info('Cleared');
  };

  const handleGenerate = () => {
    generate();
    toast.success('Generated Thai ID');
  };

  return (
    <ToolLayout className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ToolLayout.Panel
          title="Thai ID Input"
          actions={
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={handleGenerate} className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Generate
              </Button>
              <Button variant="outline" size="sm" onClick={handleAnalyze} className="gap-1.5">
                <SearchCheck className="h-3.5 w-3.5" />
                Analyze
              </Button>
              <Button variant="ghost" size="icon" onClick={handleClear} title="Clear">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="rounded-lg border border-border/70 bg-muted/20 p-4 space-y-3">
              <label htmlFor="thai-id-input" className="text-sm font-medium text-foreground">
                เลขบัตรประชาชน 13 หลัก
              </label>
              <Input
                id="thai-id-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="1-2345-67890-12-3"
                className="font-mono text-base tracking-wider h-11"
                aria-label="Thai ID input"
              />
              <p className="text-xs text-muted-foreground">
                ใส่ตัวเลขหรือวางค่าได้เลย ระบบจะจัดรูปแบบเป็น x-xxxx-xxxxx-xx-x ให้อัตโนมัติ
              </p>
            </div>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="rounded-lg border border-border/70 bg-card/70 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                <Info className="h-4 w-4 text-primary" />
                โครงสร้างเลขรหัสบัตรประชาชน
              </div>
              <div className="space-y-2 text-sm">
                {THAI_ID_STRUCTURE.map((item) => (
                  <div
                    key={item.range}
                    className="flex items-start justify-between gap-3 rounded-md border border-border/50 bg-muted/20 px-3 py-2"
                  >
                    <span className="font-medium text-foreground whitespace-nowrap">{item.range}</span>
                    <span className="text-muted-foreground text-right">{item.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ToolLayout.Panel>

        <ToolLayout.Panel
          title="Analysis Result"
          actions={<CopyButton value={analysis?.formatted ?? ''} disabled={!analysis} className="h-8 w-8" />}
        >
          {analysis ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/20 p-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Formatted ID</p>
                  <p className="text-lg font-mono font-semibold tracking-wide text-foreground">{analysis.formatted}</p>
                </div>
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                    analysis.isValid
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {analysis.isValid ? <BadgeCheck className="h-4 w-4" /> : <BadgeX className="h-4 w-4" />}
                  {analysis.isValid ? 'Checksum ถูกต้อง' : 'Checksum ไม่ถูกต้อง'}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-border/70 p-3 bg-card/70">
                  <p className="text-xs text-muted-foreground">หลักที่ 1 (ประเภทบุคคล)</p>
                  <p className="mt-1 font-semibold text-foreground">{analysis.sanitized[0]}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{analysis.personTypeDescription}</p>
                </div>

                <div className="rounded-lg border border-border/70 p-3 bg-card/70">
                  <p className="text-xs text-muted-foreground">หลักที่ 2-3 (จังหวัด)</p>
                  <p className="mt-1 font-mono font-semibold text-foreground">{analysis.provinceCode}</p>
                </div>

                <div className="rounded-lg border border-border/70 p-3 bg-card/70">
                  <p className="text-xs text-muted-foreground">หลักที่ 4-5 (อำเภอ)</p>
                  <p className="mt-1 font-mono font-semibold text-foreground">{analysis.districtCode}</p>
                </div>

                <div className="rounded-lg border border-border/70 p-3 bg-card/70">
                  <p className="text-xs text-muted-foreground">หลักที่ 6-10 (เลขในทะเบียนบ้าน)</p>
                  <p className="mt-1 font-mono font-semibold text-foreground">{analysis.householdNumber}</p>
                </div>

                <div className="rounded-lg border border-border/70 p-3 bg-card/70">
                  <p className="text-xs text-muted-foreground">หลักที่ 11-12 (ลำดับบุคคล)</p>
                  <p className="mt-1 font-mono font-semibold text-foreground">{analysis.personNumber}</p>
                </div>

                <div className="rounded-lg border border-border/70 p-3 bg-card/70">
                  <p className="text-xs text-muted-foreground">หลักที่ 13 (Checksum)</p>
                  <p className="mt-1 font-mono font-semibold text-foreground">
                    {analysis.actualChecksum} <span className="text-muted-foreground">(ควรเป็น {analysis.expectedChecksum})</span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[520px] flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 text-center px-6">
              <div className="mb-3 rounded-full border border-border bg-background p-3">
                <CreditCard className="h-7 w-7 text-primary/70" />
              </div>
              <p className="font-medium text-foreground">ผลการวิเคราะห์จะแสดงที่นี่</p>
              <p className="mt-1 text-xs text-muted-foreground">
                กรอกเลขบัตรประชาชนทางซ้าย แล้วกด <span className="font-medium">Analyze</span>
              </p>
            </div>
          )}
        </ToolLayout.Panel>
      </div>

      <ToolLayout.Section title="ประเภทบุคคล (หลักที่ 1)">
        <div className="divide-y divide-border/50">
          {THAI_ID_PERSON_TYPES.map((item) => (
            <div key={item.digit} className="flex items-start gap-3 p-4 hover:bg-muted/20 transition-colors">
              <div className="mt-0.5 inline-flex h-7 min-w-7 items-center justify-center rounded-md border border-primary/30 bg-primary/10 px-2 text-xs font-bold text-primary">
                {item.digit}
              </div>
              <p className="text-sm text-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </ToolLayout.Section>
    </ToolLayout>
  );
};

export default ThaiIdTool;
