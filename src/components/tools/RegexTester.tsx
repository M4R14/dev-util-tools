import React from 'react';
import { ExternalLink, Code2, HelpCircle, Variable } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { CopyButton } from '../ui/CopyButton';

const COMMON_EXAMPLES = [
  { label: 'Email Address', expression: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$' },
  { label: 'Date (YYYY-MM-DD)', expression: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$' },
  { label: '24-Hour Time (HH:MM)', expression: '^([01]\\d|2[0-3]):([0-5]\\d)$' },
  { label: 'URL / Website', expression: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)' },
  { label: 'Slug (URL friendly)', expression: '^[a-z0-9]+(?:-[a-z0-9]+)*$' },
  { label: 'Hex Color', expression: '^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$' },
  { label: 'Username (Alphanumeric)', expression: '^[a-zA-Z0-9_]{3,16}$' },
  { label: 'Password (Strong)', expression: '^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$' },
];

const REGEX_TOKENS = [
  { label: 'Any Character', value: '.' },
  { label: 'Zero or More', value: '*' },
  { label: 'One or More', value: '+' },
  { label: 'Zero or One', value: '?' },
  { label: 'Character Set', value: '[abc]' },
  { label: 'Range', value: '[a-z]' },
  { label: 'Not in Set', value: '[^abc]' },
  { label: 'Group', value: '(abc)' },
  { label: 'Alternatively', value: 'a|b' },
  { label: 'Start of String', value: '^' },
  { label: 'End of String', value: '$' },
  { label: 'Digit', value: '\\d' },
];

const RegexTester: React.FC = () => {
  return (
    <ToolLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: CTA & Syntax */}
        <div className="space-y-8">
          <ToolLayout.Section title="External Tool">
            <Card className="border-pink-500/20 shadow-lg bg-gradient-to-br from-pink-50/50 to-background dark:from-pink-950/10 dark:to-background overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Code2 className="w-32 h-32" />
              </div>
              <CardContent className="p-8 space-y-6 relative z-10">
                <div className="space-y-4">
                  <div className="w-14 h-14 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center ring-1 ring-pink-500/20">
                    <Variable className="w-7 h-7 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight mb-2">regex101</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      The industry standard for testing regular expressions. 
                      Features real-time explanation, match information, and code generation for multiple languages.
                    </p>
                  </div>
                </div>

                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 text-base shadow-lg shadow-pink-500/20 hover:shadow-pink-500/30 hover:-translate-y-0.5 transition-all bg-pink-600 hover:bg-pink-700 text-white border-none"
                >
                  <a
                    href="https://regex101.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Open regex101 <ExternalLink className="w-4 h-4 opacity-80" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </ToolLayout.Section>

        
        </div>

        {/* Right Column: Cheatsheet */}
        <ToolLayout.Section title="Common Patterns">
          <Card className="border-border shadow-sm h-full max-h-full overflow-hidden flex flex-col">
            <CardContent className="p-0 overflow-y-auto custom-scrollbar">
              <div className="divide-y divide-border/50">
                {COMMON_EXAMPLES.map((item, idx) => (
                  <div
                    key={idx}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/40 transition-colors gap-3"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="font-medium text-sm text-foreground flex items-center gap-2">
                        {item.label}
                      </div>
                      <code className="block text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1.5 rounded border border-border/50 break-all">
                        {item.expression}
                      </code>
                    </div>
                    <div className="flex-shrink-0 self-end sm:self-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
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

export default RegexTester;
