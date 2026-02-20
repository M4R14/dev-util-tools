import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { CopyButton } from '../ui/CopyButton';
import { CodeHighlight } from '../ui/CodeHighlight';

interface LiveResponseCardProps {
  responseText: string;
  responseKey: string;
}

const LiveResponseCard: React.FC<LiveResponseCardProps> = ({ responseText, responseKey }) => {
  return (
    <Card className="bg-muted/20">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm">Live Response</CardTitle>
          <CardDescription className="text-xs">JSON output ตาม endpoint/query ปัจจุบัน</CardDescription>
        </div>
        <CopyButton
          value={responseText}
          data-action="copy-ai-bridge-response"
          data-testid="ai-bridge-copy-response-button"
        />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-md border border-border/80 bg-background/70 p-3 min-h-[380px]">
          <CodeHighlight code={responseText} language="json" className="text-xs" key={responseKey} />
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveResponseCard;
