
import React, { useState } from 'react';
import { ArrowLeftRight, Copy, Check } from 'lucide-react';

const Base64Tool: React.FC = () => {
  const [text, setText] = useState('');
  const [base64, setBase64] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<'text' | 'base64' | null>(null);

  const handleTextChange = (val: string) => {
    setText(val);
    try {
      setBase64(btoa(val));
      setError(null);
    } catch (e) {
      setBase64('');
      if (val) setError('Invalid characters for Base64 encoding');
    }
  };

  const handleBase64Change = (val: string) => {
    setBase64(val);
    try {
      if (!val) {
        setText('');
        setError(null);
        return;
      }
      setText(atob(val));
      setError(null);
    } catch (e) {
      setText('');
      setError('Invalid Base64 string');
    }
  };

  const copy = (content: string, type: 'text' | 'base64') => {
    navigator.clipboard.writeText(content);
    setCopyState(type);
    setTimeout(() => setCopyState(null), 2000);
  };

  return (
    <div className="p-6 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* String Area */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Normal String</label>
            <button 
              onClick={() => copy(text, 'text')}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              {copyState === 'text' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Enter plain text..."
            className="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-4 font-mono text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
          />
        </div>

        {/* Action Divider (Mobile) */}
        <div className="flex justify-center md:hidden">
          <ArrowLeftRight className="w-6 h-6 text-slate-600 rotate-90" />
        </div>

        {/* Base64 Area */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Base64 Output</label>
            <button 
              onClick={() => copy(base64, 'base64')}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              {copyState === 'base64' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <textarea
            value={base64}
            onChange={(e) => handleBase64Change(e.target.value)}
            placeholder="Enter Base64..."
            className={`w-full h-64 bg-slate-950 border rounded-xl p-4 font-mono text-sm focus:ring-1 outline-none resize-none ${
              error ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
          />
        </div>
      </div>

      {error && (
        <div className="text-center p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default Base64Tool;
