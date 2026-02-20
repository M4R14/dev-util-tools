import React from 'react';
import { ExternalLink, Image, Palette, Ruler } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { CopyButton } from '../ui/CopyButton';

const DUMMYIMAGE_BASE_URL = 'https://dummyimage.com/';

const QUICK_SIZES = [
  { label: 'Avatar', value: '128x128' },
  { label: 'Card Thumbnail', value: '400x240' },
  { label: 'Hero Placeholder', value: '1200x400' },
  { label: 'Story Banner', value: '1080x1920' },
];

const SAMPLE_URLS = [
  {
    label: 'Basic Placeholder',
    value: `${DUMMYIMAGE_BASE_URL}600x400`,
  },
  {
    label: 'Custom Colors',
    value: `${DUMMYIMAGE_BASE_URL}600x400/0f172a/f8fafc`,
  },
  {
    label: 'With Text',
    value: `${DUMMYIMAGE_BASE_URL}600x400/1d4ed8/ffffff&text=DevPulse+Placeholder`,
  },
  {
    label: 'PNG Extension',
    value: `${DUMMYIMAGE_BASE_URL}1024x512/111827/e5e7eb.png&text=Landing+Banner`,
  },
];

const DummyImageTool: React.FC = () => {
  return (
    <ToolLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <ToolLayout.Section title="External Tool">
            <Card className="border-violet-500/20 shadow-lg bg-gradient-to-br from-violet-50/50 to-background dark:from-violet-950/10 dark:to-background overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Image className="w-32 h-32" />
              </div>
              <CardContent className="p-8 space-y-6 relative z-10">
                <div className="space-y-4">
                  <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center ring-1 ring-violet-500/20">
                    <Palette className="w-7 h-7 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight mb-2">DummyImage</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Generate quick placeholder images by URL with custom size, background,
                      foreground, and text. Useful for UI mocks and content skeletons.
                    </p>
                  </div>
                </div>

                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 text-base shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:-translate-y-0.5 transition-all bg-violet-600 hover:bg-violet-700 text-white border-none"
                >
                  <a
                    href="https://www.dummyimage.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Open DummyImage <ExternalLink className="w-4 h-4 opacity-80" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </ToolLayout.Section>

          <ToolLayout.Section title="Quick Sizes">
            <Card className="border-border shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {QUICK_SIZES.map((size) => (
                    <div key={size.label} className="group flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg border border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                          <Ruler className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{size.label}</p>
                          <p className="text-xs text-muted-foreground font-mono">{size.value}</p>
                        </div>
                      </div>
                      <CopyButton
                        value={`${DUMMYIMAGE_BASE_URL}${size.value}`}
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </ToolLayout.Section>
        </div>

        <ToolLayout.Section title="Copy-Ready URL Templates">
          <Card className="border-border shadow-sm h-full max-h-full overflow-hidden flex flex-col">
            <CardContent className="p-0 overflow-y-auto custom-scrollbar">
              <div className="divide-y divide-border/50">
                {SAMPLE_URLS.map((sample) => (
                  <div
                    key={sample.label}
                    className="group flex items-start justify-between gap-3 p-4 hover:bg-muted/40 transition-colors"
                  >
                    <div className="space-y-2 min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{sample.label}</p>
                      <code className="block text-xs text-muted-foreground bg-muted/50 border border-border/50 rounded px-2 py-1.5 break-all">
                        {sample.value}
                      </code>
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

export default DummyImageTool;
