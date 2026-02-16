
import React, { useState } from 'react';
import { Copy, Trash2, AlignLeft, Minimize2, Check } from 'lucide-react';

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
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex gap-2">
          <button 
            onClick={() => formatJSON(2)} 
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
          >
            <AlignLeft className="w-4 h-4" /> Format (2 spaces)
          </button>
          <button 
            onClick={minifyJSON} 
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
          >
            <Minimize2 className="w-4 h-4" /> Minify
          </button>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={copyToClipboard}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
              copied ? 'bg-green-600 text-white' : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button 
            onClick={() => setInput('')}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Clear
          </button>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Paste your JSON here..."
          className={`w-full h-96 bg-slate-950 text-indigo-300 font-mono p-4 rounded-xl border-2 transition-all focus:ring-4 focus:ring-indigo-500/20 focus:outline-none resize-none ${
            error ? 'border-red-500' : 'border-slate-700 focus:border-indigo-500'
          }`}
        />
        {error && (
          <div className="mt-2 text-sm text-red-400 bg-red-900/20 border border-red-900/50 p-3 rounded-lg flex items-start gap-2">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default JSONFormatter;
