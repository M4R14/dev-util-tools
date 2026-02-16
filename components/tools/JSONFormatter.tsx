
import React from 'react';
import { Trash2, AlignLeft, Minimize2 } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { useJsonFormatter } from '../../hooks/useJsonFormatter';
import { CopyButton } from '../ui/CopyButton';

const JSONFormatter: React.FC = () => {
    const {
        input,
        setInput,
        error,
        setError,
        formatJSON,
        minifyJSON,
        clear
    } = useJsonFormatter();

  return (
    <ToolLayout>
      <ToolLayout.Panel
        title="JSON Editor"
        actions={
            <>
              {/* Toolbar */}
              <div className="flex gap-2 mr-4 border-r border-border pr-4">
                <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => formatJSON(2)} 
                    className="flex items-center gap-2 bg-primary/20 hover:bg-primary/40 text-primary hover:text-primary/80 border-primary/20"
                >
                    <AlignLeft className="w-3.5 h-3.5" /> Format
                </Button>
                <Button 
                    variant="outline"
                    size="sm"
                    onClick={minifyJSON} 
                    className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground border-border"
                >
                    <Minimize2 className="w-3.5 h-3.5" /> Minify
                </Button>
              </div>
            
              <div className="flex gap-2">
                <CopyButton value={input} />
                <Button 
                    variant="ghost"
                    size="icon"
                    onClick={clear}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                    title="Clear"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </>
        }
        className={error ? 'border-destructive/50' : ''}
      >
        <div className="h-[calc(100vh-16rem)] min-h-[500px]">
            <Textarea
            value={input}
            onChange={(e) => {
                setInput(e.target.value);
                if (error) setError(null);
            }}
            placeholder="Paste your JSON here..."
            className="w-full h-full bg-transparent border-none focus-visible:ring-0 p-0 font-mono text-sm resize-none placeholder-muted-foreground"
            />
            {error && (
            <div className="absolute bottom-4 left-4 right-4 p-3 bg-destructive/90 backdrop-blur border border-destructive/30 rounded-lg text-destructive-foreground text-xs shadow-lg animate-in fade-in slide-in-from-bottom-2 flex items-center gap-2">
                <span className="font-bold bg-background/20 px-1.5 rounded">Error</span> {error}
            </div>
            )}
        </div>
      </ToolLayout.Panel>
    </ToolLayout>
  );
};


export default JSONFormatter;
