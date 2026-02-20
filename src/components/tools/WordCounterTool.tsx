import React from 'react';
import { ExternalLink, FileText, Hash, Type } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { CopyButton } from '../ui/CopyButton';

const METRICS = [
  { label: 'Words', description: 'Total words separated by spaces/punctuation.' },
  { label: 'Characters', description: 'Character count with or without spaces.' },
  { label: 'Sentences', description: 'Sentence count from punctuation and structure.' },
  { label: 'Paragraphs', description: 'Paragraph count from line breaks.' },
  { label: 'Reading Time', description: 'Estimated reading time based on average speed.' },
  { label: 'Keyword Density', description: 'Frequency ratio of repeated words/keywords.' },
];

const SAMPLE_TEXTS = [
  {
    label: 'Blog Intro',
    text: 'Build developer tools that solve one specific problem really well.',
  },
  {
    label: 'PR Summary',
    text: 'Refactored AI bridge routing, improved error details, and updated docs.',
  },
  {
    label: 'SEO Snippet',
    text: 'Fast online word counter for content writers, marketers, and editors.',
  },
];

const WordCounterTool: React.FC = () => {
  return (
    <ToolLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <ToolLayout.Section title="External Tool">
            <Card className="border-emerald-500/20 shadow-lg bg-gradient-to-br from-emerald-50/50 to-background dark:from-emerald-950/10 dark:to-background overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <FileText className="w-32 h-32" />
              </div>
              <CardContent className="p-8 space-y-6 relative z-10">
                <div className="space-y-4">
                  <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center ring-1 ring-emerald-500/20">
                    <Hash className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight mb-2">WordCounter</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Online writing metrics for words, characters, reading time, and keyword
                      density. Useful for SEO, social content, and article drafting.
                    </p>
                  </div>
                </div>

                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 text-base shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                >
                  <a
                    href="https://wordcounter.net/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Open WordCounter <ExternalLink className="w-4 h-4 opacity-80" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </ToolLayout.Section>

          <ToolLayout.Section title="What It Measures">
            <Card className="border-border shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {METRICS.map((metric) => (
                    <div key={metric.label} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="font-medium text-sm text-foreground flex items-center gap-2">
                        <Type className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        {metric.label}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </ToolLayout.Section>
        </div>

        <ToolLayout.Section title="Copy-Ready Samples">
          <Card className="border-border shadow-sm h-full max-h-full overflow-hidden flex flex-col">
            <CardContent className="p-0 overflow-y-auto custom-scrollbar">
              <div className="divide-y divide-border/50">
                {SAMPLE_TEXTS.map((sample) => (
                  <div
                    key={sample.label}
                    className="group flex items-start justify-between gap-3 p-4 hover:bg-muted/40 transition-colors"
                  >
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="font-medium text-sm text-foreground">{sample.label}</div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{sample.text}</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton
                        value={sample.text}
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

export default WordCounterTool;
