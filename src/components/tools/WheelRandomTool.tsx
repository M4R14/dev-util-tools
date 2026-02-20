import React from 'react';
import { ExternalLink, ListChecks, RotateCw, Wand2 } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { CopyButton } from '../ui/CopyButton';

const USE_CASES = [
  'Pick giveaway winners from a participant list',
  'Decide random lunch/team activity choices',
  'Select backlog items for sprint experiments',
  'Run classroom/team icebreaker selections',
  'Choose random prompts for writing sessions',
];

const SAMPLE_WHEEL_ITEMS = [
  {
    label: 'Team Lunch',
    value: 'Khao Man Gai, Pad Thai, Ramen, Salad, Sandwich, Burger',
  },
  {
    label: 'Retro Topic',
    value: 'Process, Communication, Testing, Release, Tooling, Docs',
  },
  {
    label: 'Giveaway',
    value: 'User-014, User-125, User-339, User-402, User-588',
  },
];

const WheelRandomTool: React.FC = () => {
  return (
    <ToolLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <ToolLayout.Section title="External Tool">
            <Card className="border-cyan-500/20 shadow-lg bg-gradient-to-br from-cyan-50/50 to-background dark:from-cyan-950/10 dark:to-background overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <RotateCw className="w-32 h-32" />
              </div>
              <CardContent className="p-8 space-y-6 relative z-10">
                <div className="space-y-4">
                  <div className="w-14 h-14 bg-cyan-100 dark:bg-cyan-900/30 rounded-2xl flex items-center justify-center ring-1 ring-cyan-500/20">
                    <Wand2 className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight mb-2">Wheel Random</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Spin a customizable random wheel to pick names, tasks, prizes, and options
                      quickly. Great for live sessions and lightweight decision-making.
                    </p>
                  </div>
                </div>

                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 text-base shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:-translate-y-0.5 transition-all bg-cyan-600 hover:bg-cyan-700 text-white border-none"
                >
                  <a
                    href="https://wheelrandom.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Open Wheel Random <ExternalLink className="w-4 h-4 opacity-80" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </ToolLayout.Section>

          <ToolLayout.Section title="Common Use Cases">
            <Card className="border-border shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {USE_CASES.map((item) => (
                    <div key={item} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="font-medium text-sm text-foreground flex items-start gap-2">
                        <ListChecks className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </ToolLayout.Section>
        </div>

        <ToolLayout.Section title="Copy-Ready Item Lists">
          <Card className="border-border shadow-sm h-full max-h-full overflow-hidden flex flex-col">
            <CardContent className="p-0 overflow-y-auto custom-scrollbar">
              <div className="divide-y divide-border/50">
                {SAMPLE_WHEEL_ITEMS.map((sample) => (
                  <div
                    key={sample.label}
                    className="group flex items-start justify-between gap-3 p-4 hover:bg-muted/40 transition-colors"
                  >
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="font-medium text-sm text-foreground">{sample.label}</div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{sample.value}</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton
                        value={sample.value}
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

export default WheelRandomTool;
