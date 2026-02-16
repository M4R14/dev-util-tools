import React from 'react';
import ToolLayout from '../ui/ToolLayout';
import { Textarea } from '../ui/Textarea';
import { useBase64 } from '../../hooks/useBase64';
import { CopyButton } from '../ui/CopyButton';
import { toast } from 'sonner';

const Base64Tool: React.FC = () => {
  const { text, base64, error, handleTextChange, handleBase64Change } = useBase64();

  return (
    <ToolLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-16rem)] min-h-[500px]">
        {/* String Area */}
        <ToolLayout.Panel
          title="Plain Text"
          actions={<CopyButton value={text} onCopy={() => toast.success('Original text copied')} />}
        >
          <Textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Type here..."
            className="w-full h-full bg-transparent border-none focus-visible:ring-0 p-0 font-mono text-sm resize-none placeholder-muted-foreground shadow-none"
          />
        </ToolLayout.Panel>

        {/* Base64 Area */}
        <ToolLayout.Panel
          title="Base64 Output"
          actions={<CopyButton value={base64} onCopy={() => toast.success('Base64 copied')} />}
          className={error ? 'border-destructive/50 box-border' : ''}
        >
          <Textarea
            value={base64}
            onChange={(e) => handleBase64Change(e.target.value)}
            placeholder="Base64 result..."
            className="w-full h-full bg-transparent border-none focus-visible:ring-0 p-0 font-mono text-sm resize-none placeholder-muted-foreground shadow-none"
          />
          {error && (
            <div className="absolute bottom-4 left-4 right-4 p-3 bg-destructive/90 backdrop-blur border border-destructive/30 rounded-lg text-destructive-foreground text-xs shadow-lg animate-in fade-in slide-in-from-bottom-2">
              {error}
            </div>
          )}
        </ToolLayout.Panel>
      </div>
    </ToolLayout>
  );
};

export default Base64Tool;
