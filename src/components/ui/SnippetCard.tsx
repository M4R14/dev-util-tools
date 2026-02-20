import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';
import { CopyButton } from './CopyButton';
import { CodeHighlight } from './CodeHighlight';

export type SnippetLanguage = 'json' | 'xml' | 'javascript' | 'bash' | 'plaintext';

interface SnippetCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  code: string;
  language: SnippetLanguage;
}

const SnippetCard: React.FC<SnippetCardProps> = ({ icon, title, description, code, language }) => {
  return (
    <Card className="bg-muted/20">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <CardDescription className="text-xs">{description}</CardDescription>
        </div>
        <CopyButton value={code} />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-md border border-border/80 bg-background/70 p-3">
          <CodeHighlight code={code} language={language} className="text-xs" />
        </div>
      </CardContent>
    </Card>
  );
};

export default SnippetCard;
