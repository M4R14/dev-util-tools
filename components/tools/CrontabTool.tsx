import React from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';

const CrontabTool: React.FC = () => {
  return (
    <ToolLayout>
      <ToolLayout.Panel title="Crontab Guru" className="flex items-center justify-center p-12">
        <Card className="text-center max-w-lg border-0 shadow-none bg-transparent">
          <CardHeader className="space-y-6 pb-2">
            <div className="mx-auto w-20 h-20 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-2 ring-1 ring-indigo-500/20">
              <Clock className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <CardTitle className="text-2xl font-bold">The Quick and Simple Cron Schedule Editor</CardTitle>
            <CardDescription className="text-base leading-relaxed">
               Crontab.guru is a simple editor for cron schedule expressions. It's a quick and easy way to generate and understand cron schedule syntax.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <Button asChild size="lg" className="h-12 px-8 text-base shadow-lg hover:-translate-y-0.5 transition-all">
                <a 
                    href="https://crontab.guru/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                >
                    Open Crontab Guru <ExternalLink className="w-4 h-4 ml-2" />
                </a>
            </Button>
            
            <p className="text-xs text-muted-foreground">
                Note: This link will open in a new tab.
            </p>
          </CardContent>
        </Card>
      </ToolLayout.Panel>
    </ToolLayout>
  );
};

export default CrontabTool;
