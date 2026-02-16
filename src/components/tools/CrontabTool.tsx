import React from 'react';
import { ExternalLink, Clock, HelpCircle, CalendarDays } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { CopyButton } from '../ui/CopyButton';

const COMMON_EXAMPLES = [
  { label: 'Every minute', expression: '* * * * *' },
  { label: 'Every 5 minutes', expression: '*/5 * * * *' },
  { label: 'Every hour at minute 0', expression: '0 * * * *' },
  { label: 'Every day at midnight', expression: '0 0 * * *' },
  { label: 'Every Monday at 1 AM', expression: '0 1 * * 1' },
  { label: 'At 10:00 AM on 1st of month', expression: '0 10 1 * *' },
  { label: 'Every 15 mins during 9AM-5PM', expression: '*/15 9-17 * * *' },
  { label: 'Every Sunday at 4:30 AM', expression: '30 4 * * 0' },
];

const CRON_PARTS = [
  { label: 'minute', range: '0 - 59' },
  { label: 'hour', range: '0 - 23' },
  { label: 'day of month', range: '1 - 31' },
  { label: 'month', range: '1 - 12' },
  { label: 'day of week', range: '0 - 6 (Sun-Sat)' },
];

const CrontabTool: React.FC = () => {
  return (
    <ToolLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: CTA & Syntax */}
        <div className="space-y-8">
          <ToolLayout.Section title="External Tool">
            <Card className="border-indigo-500/20 shadow-lg bg-gradient-to-br from-indigo-50/50 to-background dark:from-indigo-950/10 dark:to-background overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Clock className="w-32 h-32" />
              </div>
              <CardContent className="p-8 space-y-6 relative z-10">
                <div className="space-y-4">
                  <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center ring-1 ring-indigo-500/20">
                    <CalendarDays className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight mb-2">Crontab Guru</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      The &ldquo;quick and simple&rdquo; editor for cron schedule expressions.
                      Perfect for double-checking your logic before deployment.
                    </p>
                  </div>
                </div>

                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 text-base shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all bg-indigo-600 hover:bg-indigo-700 text-white border-none"
                >
                  <a
                    href="https://crontab.guru/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Open Editor <ExternalLink className="w-4 h-4 opacity-80" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </ToolLayout.Section>

          <ToolLayout.Section title="Syntax Reference">
            <Card className="border-border shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-wrap justify-between gap-2 mb-6 px-4">
                  {CRON_PARTS.map((part, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 group cursor-default">
                      <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center text-xl font-mono font-bold text-foreground group-hover:border-indigo-500/50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shadow-sm">
                        *
                      </div>
                      <div className="text-center space-y-0.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {part.label}
                        </div>
                        <div className="text-[10px] text-muted-foreground/60 font-mono">
                          {part.range}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-muted/30 rounded-lg p-4 text-xs text-muted-foreground border border-border/50">
                  <div className="flex gap-2 mb-2">
                    <HelpCircle className="w-4 h-4 text-indigo-500" />
                    <span className="font-semibold text-foreground">Common Operators:</span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pl-6 list-disc marker:text-indigo-500/50">
                    <li>
                      <code className="bg-background px-1 rounded border border-border">*</code> any
                      value
                    </li>
                    <li>
                      <code className="bg-background px-1 rounded border border-border">,</code>{' '}
                      value list separator
                    </li>
                    <li>
                      <code className="bg-background px-1 rounded border border-border">-</code>{' '}
                      range of values
                    </li>
                    <li>
                      <code className="bg-background px-1 rounded border border-border">/</code>{' '}
                      step values
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </ToolLayout.Section>
        </div>

        {/* Right Column: Cheatsheet */}
        <ToolLayout.Section title="Quick Cheatsheet">
          <Card className="border-border shadow-sm h-full max-h-full overflow-hidden flex flex-col">
            <CardContent className="p-0 overflow-y-auto custom-scrollbar">
              <div className="divide-y divide-border/50">
                {COMMON_EXAMPLES.map((item, idx) => (
                  <div
                    key={idx}
                    className="group flex items-center justify-between p-4 hover:bg-muted/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="font-medium text-sm text-foreground">{item.label}</div>
                      <code className="text-xs font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded border border-border/50 inline-block">
                        {item.expression}
                      </code>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton
                        value={item.expression}
                        className="h-8 w-8 hover:bg-background shadow-sm border border-border/50"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ToolLayout.Section>
      </div>
    </ToolLayout>
  );
};

export default CrontabTool;
