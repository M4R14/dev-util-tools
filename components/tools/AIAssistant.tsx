
import React, { useState } from 'react';
import { Send, Loader2, Sparkles, MessageSquare, Code } from 'lucide-react';
import { askGemini } from '../../services/gemini';
import ToolLayout from '../ui/ToolLayout';

const AIAssistant: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse(""); // Clear previous response when loading
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
    <ToolLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-16rem)] min-h-[600px]">
        {/* Left Side: Input Area */}
        <div className="flex flex-col gap-6 h-full">
            <ToolLayout.Panel 
                title="Context Code (Optional)"
                className="flex-1 min-h-[200px]"
            >
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Paste relevant code snippets here..."
                    className="w-full h-full bg-transparent border-none focus:ring-0 p-0 font-mono text-sm resize-none placeholder-slate-600"
                />
            </ToolLayout.Panel>

            <ToolLayout.Panel 
                 title="Your Question"
                 className="flex-1 min-h-[150px]"
                 actions={
                    <span className="text-[10px] text-slate-500 hidden sm:inline">Ctrl + Enter to send</span>
                 }
            >
              <div className="relative h-full">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAsk();
                    }}
                    placeholder="Ask Gemini to explain code, find bugs, or optimize snippets..."
                    className="w-full h-full bg-transparent border-none focus:ring-0 p-0 resize-none placeholder-slate-600 pb-12"
                />
                <button
                    onClick={handleAsk}
                    disabled={loading || !prompt.trim()}
                    className="absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-all shadow-lg shadow-indigo-600/20"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </ToolLayout.Panel>
        </div>

        {/* Right Side: Response Area */}
        <ToolLayout.Panel 
            title="AI Response"
            actions={<Sparkles className="w-4 h-4 text-indigo-400" />}
            className="h-full"
        >
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                {!response && !loading && !error && (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-4 opacity-50">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center">
                        <Sparkles className="w-8 h-8 opacity-20" />
                        </div>
                        <p className="max-w-xs text-sm">Enter your question and click send to get an AI-powered response.</p>
                    </div>
                )}

                {loading && (
                    <div className="space-y-4 animate-pulse p-4">
                        <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-800 rounded w-full"></div>
                        <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                        <div className="h-32 bg-slate-800 rounded w-full"></div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-xl text-red-400 text-sm flex items-start gap-3">
                        <div className="p-1 bg-red-900/50 rounded-full shrink-0">
                            <span className="text-xs font-bold px-1">!</span>
                        </div>
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
        </ToolLayout.Panel>
      </div>
    </ToolLayout>
  );
};

export default AIAssistant;

