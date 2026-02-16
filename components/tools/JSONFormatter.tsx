
import React, { useState } from 'react';
import { Copy, Trash2, AlignLeft, Minimize2, Check } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';

const JSONFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const formatJSON = (space: number = 2) => {
    try {
      if (!input.trim()) return;
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed, null, space));
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const minifyJSON = () => {
    try {
      if (!input.trim()) return;
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed));
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout>
      <ToolLayout.Panel
        title="JSON Editor"
        actions={
            <>
              {/* Toolbar */}
              <div className="flex gap-2 mr-4 border-r border-slate-700 pr-4">
                <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => formatJSON(2)} 
                    className="flex items-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 hover:text-indigo-300 border-indigo-500/20"
                >
                    <AlignLeft className="w-3.5 h-3.5" /> Format
                </Button>
                <Button 
                    variant="outline"
                    size="sm"
                    onClick={minifyJSON} 
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                >
                    <Minimize2 className="w-3.5 h-3.5" /> Minify
                </Button>
              </div>
            
              <div className="flex gap-2">
                <Button 
                    variant="ghost"
                    size="icon"
                    onClick={copyToClipboard}
                    className="text-slate-400 hover:text-white hover:bg-slate-800 h-8 w-8"
                    title="Copy Result"
                >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button 
                    variant="ghost"
                    size="icon"
                    onClick={() => setInput('')}
                    className="text-slate-400 hover:text-red-400 hover:bg-red-900/20 h-8 w-8"
                    title="Clear"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </>
        }
        className={error ? 'border-red-500/50' : ''}
      >
        <div className="h-[calc(100vh-16rem)] min-h-[500px]">
            <Textarea
            value={input}
            onChange={(e) => {
                setInput(e.target.value);
                if (error) setError(null);
            }}
            placeholder="Paste your JSON here..."
            className="w-full h-full bg-transparent border-none focus-visible:ring-0 p-0 font-mono text-sm resize-none placeholder-slate-600"
            />
            {error && (
            <div className="absolute bottom-4 left-4 right-4 p-3 bg-red-900/90 backdrop-blur border border-red-500/30 rounded-lg text-red-200 text-xs shadow-lg animate-in fade-in slide-in-from-bottom-2 flex items-center gap-2">
                <span className="font-bold bg-white/10 px-1.5 rounded">Error</span> {error}
            </div>
            )}
        </div>
      </ToolLayout.Panel>
    </ToolLayout>
  );
};


export default JSONFormatter;
