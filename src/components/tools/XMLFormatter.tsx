import React, { useState } from 'react';
import { Trash2, AlignLeft, Minimize2, Pencil, Eye } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { useXmlFormatter } from '../../hooks/useXmlFormatter';
import { CopyButton } from '../ui/CopyButton';
import { CodeHighlight } from '../ui/CodeHighlight';
import { toast } from 'sonner';

const XMLFormatter: React.FC = () => {
  const { input, setInput, error, setError, format, minify, clear } = useXmlFormatter();
  const [isEditing, setIsEditing] = useState(true);

  const handleFormat = () => {
    const result = format();
    if (result && input.trim()) {
      toast.success('XML Formatted');
      setIsEditing(false);
    } else if (input.trim()) {
      toast.error('Invalid XML content');
    }
  };

  const handleMinify = () => {
    const result = minify();
    if (result && input.trim()) {
      toast.success('XML Minified');
      setIsEditing(false);
    } else if (input.trim()) {
      toast.error('Invalid XML content');
    }
  };

  return (
    <ToolLayout>
      <ToolLayout.Panel
        title="XML Editor"
        actions={
          <>
            {/* Toolbar */}
            <div className="flex gap-2 mr-4 border-r border-border pr-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFormat}
                className="flex items-center gap-2 bg-primary/20 hover:bg-primary/40 text-primary hover:text-primary/80 border-primary/20"
              >
                <AlignLeft className="w-3.5 h-3.5" /> Format
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMinify}
                className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground border-border"
              >
                <Minimize2 className="w-3.5 h-3.5" /> Minify
              </Button>
            </div>

            <div className="flex gap-2">
              {input.trim() && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(!isEditing)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title={isEditing ? 'Preview' : 'Edit'}
                >
                  {isEditing ? <Eye className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                </Button>
              )}
              <CopyButton value={input} onCopy={() => toast.success('XML content copied')} />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  clear();
                  setIsEditing(true);
                  toast.info('Editor cleared');
                }}
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
          {isEditing ? (
            <Textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Paste your XML here..."
              className="w-full h-full bg-transparent border-none focus-visible:ring-0 p-0 font-mono text-sm resize-none placeholder-muted-foreground"
            />
          ) : (
            <div
              className="w-full h-full overflow-auto cursor-text"
              onClick={() => setIsEditing(true)}
              title="Click to edit"
            >
              <CodeHighlight code={input} language="xml" />
            </div>
          )}
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

export default XMLFormatter;
