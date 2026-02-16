import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { toast } from 'sonner';

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code snippet copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="rounded-lg overflow-hidden border-border bg-muted/50 my-4 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/80 border-b border-border/50">
        <span className="text-xs font-mono text-muted-foreground">{language || 'code'}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-primary/90 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <code>{code}</code>
      </pre>
    </Card>
  );
};

export default CodeBlock;
