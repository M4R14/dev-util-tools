import React, { useState } from 'react';
import { Trash2, AlignLeft, Minimize2, Pencil, Eye } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { useJsonFormatter } from '../../hooks/useJsonFormatter';
import { CopyButton } from '../ui/CopyButton';
import { CodeHighlight } from '../ui/CodeHighlight';
import { toast } from 'sonner';

const JSONFormatter: React.FC = () => {
  const { input, setInput, indent, setIndent, error, setError, formatJSON, minifyJSON, clear } =
    useJsonFormatter();
  const [isEditing, setIsEditing] = useState(true);

  const handleFormat = () => {
    const result = formatJSON(indent);
    if (result && input.trim()) {
      toast.success('JSON Formatted');
      setIsEditing(false);
    } else if (input.trim()) {
      toast.error('Invalid JSON content');
    }
  };

  const handleMinify = () => {
    const result = minifyJSON();
    if (result && input.trim()) {
      toast.success('JSON Minified');
      setIsEditing(false);
    } else if (input.trim()) {
      toast.error('Invalid JSON content');
    }
  };

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

              <label className="inline-flex items-center gap-2 text-xs text-muted-foreground pl-2">
                Indent
                <select
                  value={indent}
                  onChange={(event) => setIndent(Number(event.target.value))}
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  aria-label="JSON indentation"
                >
                  {[2, 4, 8].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
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
              <CopyButton value={input} onCopy={() => toast.success('JSON content copied')} />
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
              placeholder="Paste your JSON here..."
              className="w-full h-full bg-transparent border-none focus-visible:ring-0 p-0 font-mono text-sm resize-none placeholder-muted-foreground"
            />
          ) : (
            <div
              className="w-full h-full overflow-auto cursor-text"
              onClick={() => setIsEditing(true)}
              title="Click to edit"
            >
              <CodeHighlight code={input} language="json" />
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

export default JSONFormatter;
