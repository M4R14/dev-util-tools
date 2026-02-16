
import React, { useState } from 'react';
import { Send, Loader2, Sparkles, MessageSquare, Code } from 'lucide-react';
import { askGemini } from '../../services/gemini';

const AIAssistant: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await askGemini(prompt, code);
      setResponse(result || 'No response returned.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
              <Code className="w-4 h-4" /> Context Code (Optional)
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste relevant code snippets here for context..."
              className="w-full h-48 bg-slate-950 border border-slate-700 rounded-xl p-4 font-mono text-sm focus:border-indigo-500 outline-none resize-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
              <MessageSquare className="w-4 h-4" /> Your Question
            </div>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) handleAsk();
                }}
                placeholder="Ask Gemini to explain code, find bugs, or optimize snippets..."
                className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-4 focus:border-indigo-500 outline-none resize-none pr-12"
              />
              <button
                onClick={handleAsk}
                disabled={loading || !prompt.trim()}
                className="absolute bottom-3 right-3 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-lg transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 text-right">Ctrl + Enter to send</p>
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-xl border border-slate-700 flex flex-col h-[520px]">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <Sparkles className="w-4 h-4" />
              Response
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {!response && !loading && !error && (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-4">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 opacity-20" />
                </div>
                <p className="max-w-xs">Enter your question and click send to get an AI-powered response.</p>
              </div>
            )}

            {loading && (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                <div className="h-4 bg-slate-800 rounded w-full"></div>
                <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                <div className="h-32 bg-slate-800 rounded w-full"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            {response && !loading && (
              <div className="prose prose-invert prose-slate max-w-none prose-sm">
                <div className="whitespace-pre-wrap leading-relaxed text-slate-300">
                  {response}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
