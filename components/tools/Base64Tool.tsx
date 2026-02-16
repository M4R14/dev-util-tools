
import React from 'react';
import { Copy, Check } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { useBase64 } from '../../hooks/useBase64';

const Base64Tool: React.FC = () => {
    const {
        text,
        base64,
        error,
        copyState,
        handleTextChange,
        handleBase64Change,
        copy
    } = useBase64();

  return (
    <ToolLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-16rem)] min-h-[500px]">
        {/* String Area */}
        <ToolLayout.Panel 
            title="Plain Text"
            actions={
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={() => copy(text, 'text')}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title="Copy Text"
                >
                  {copyState === 'text' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
            }
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
            actions={
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={() => copy(base64, 'base64')}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title="Copy Base64"
                >
                  {copyState === 'base64' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
            }
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
