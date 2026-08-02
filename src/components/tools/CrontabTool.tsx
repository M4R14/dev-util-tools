import React from 'react';
import { HelpCircle } from 'lucide-react';
import { ToolLayout } from '../ui/ToolLayout';
import { Card, CardContent } from '../ui/Card';
import ExternalToolPage from './ExternalToolPage';
import { CRONTAB_SPEC, CRON_OPERATORS, CRON_PARTS } from '../../data/externalTools';

/**
 * The five-asterisk diagram is a positional visual, not a list of rows — it stays bespoke
 * instead of being forced into `ExternalToolSection`.
 */
const CronSyntaxReference: React.FC = () => (
  <ToolLayout.Section title="Syntax Reference">
    <Card className="border-border shadow-sm overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-wrap justify-between gap-2 mb-6 px-4">
          {CRON_PARTS.map((part) => (
            <div key={part.label} className="flex flex-col items-center gap-2 group cursor-default">
              <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center text-xl font-mono font-bold text-foreground group-hover:border-indigo-500/50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shadow-sm">
                *
              </div>
              <div className="text-center space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {part.label}
                </div>
                <div className="text-[10px] text-muted-foreground/60 font-mono">{part.range}</div>
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
            {CRON_OPERATORS.map((operator) => (
              <li key={operator.symbol}>
                <code className="bg-background px-1 rounded border border-border">
                  {operator.symbol}
                </code>{' '}
                {operator.meaning}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  </ToolLayout.Section>
);

const CrontabTool: React.FC = () => (
  <ExternalToolPage spec={CRONTAB_SPEC}>
    <CronSyntaxReference />
  </ExternalToolPage>
);

export default CrontabTool;
