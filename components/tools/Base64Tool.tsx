
import React, { useState } from 'react';
import { ArrowLeftRight, Copy, Check } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';

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
    <ToolLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-16rem)] min-h-[500px]">
        {/* String Area */}
        <ToolLayout.Panel 
            title="Plain Text"
            actions={
                <button 
                  onClick={() => copy(text, 'text')}
                  className="p-1.5 text-slate-400 hover:text-white transition-colors hover:bg-slate-800 rounded-md"
                  title="Copy Text"
                >
                  {copyState === 'text' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
            }
        >
          <textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Type here..."
            className="w-full h-full bg-transparent border-none focus:ring-0 p-0 font-mono text-sm resize-none placeholder-slate-600"
          />
        </ToolLayout.Panel>


        {/* Base64 Area */}
        <ToolLayout.Panel 
            title="Base64 Output"
            actions={
                <button 
                  onClick={() => copy(base64, 'base64')}
                  className="p-1.5 text-slate-400 hover:text-white transition-colors hover:bg-slate-800 rounded-md"
                  title="Copy Base64"
                >
                  {copyState === 'base64' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
            }
            className={error ? 'border-red-500/50 box-border' : ''}
        >
          <textarea
            value={base64}
            onChange={(e) => handleBase64Change(e.target.value)}
            placeholder="Base64 result..."
            className="w-full h-full bg-transparent border-none focus:ring-0 p-0 font-mono text-sm resize-none placeholder-slate-600"
          />
          {error && (
            <div className="absolute bottom-4 left-4 right-4 p-3 bg-red-900/90 backdrop-blur border border-red-500/30 rounded-lg text-red-200 text-xs shadow-lg animate-in fade-in slide-in-from-bottom-2">
              {error}
            </div>
          )}
        </ToolLayout.Panel>
      </div>
    </ToolLayout>
  );
};


export default Base64Tool;
