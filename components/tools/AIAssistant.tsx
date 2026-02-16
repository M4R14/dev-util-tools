import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Sparkles, Settings, Save, Trash2, Copy, Check, ChevronDown, ChevronUp, Code2 } from 'lucide-react';
import { askGemini } from '../../services/gemini';
import ToolLayout from '../ui/ToolLayout';

const STORAGE_KEY = 'devpulse_secure_config';

// ...existing code...

// Helper to render markdown-like content (basic code block support)
const MessageContent: React.FC<{ content: string }> = ({ content }) => {
  const parts = content.split(/(```[\s\S]*?```)/g);
  
  return (
    <div className="space-y-3">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          const match = part.match(/```(\w*)?\n?([\s\S]*?)```/);
          const lang = match ? match[1] : '';
          const code = match ? match[2] : part.slice(3, -3);
          
          return <CodeBlock key={index} language={lang} code={code.trim()} />;
        }
        // Basic paragraph handling
        return part.split('\n\n').map((p, i) => (
             p.trim() && <p key={`${index}-${i}`} className="whitespace-pre-wrap leading-relaxed text-slate-300">{p}</p>
        ));
      })}
    </div>
  );
};

const CodeBlock: React.FC<{ language: string, code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg overflow-hidden border border-slate-700 bg-slate-950/50 my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-700/50">
        <span className="text-xs font-mono text-slate-400">{language || 'code'}</span>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-slate-300 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <code>{code}</code>
      </pre>
    </div>
  );
};

interface Message {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: number;
}

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState('');
  const [codeContext, setCodeContext] = useState('');
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [apiKey, setApiKey] = useState(() => {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? decrypt(saved) : '';
  });
  const [tempKey, setTempKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const openSettings = () => {
    setTempKey(apiKey);
    setShowSettings(true);
  }

  const handleSaveSettings = () => {
    setApiKey(tempKey);
    localStorage.setItem(STORAGE_KEY, encrypt(tempKey));
    setShowSettings(false);
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

  const handleAsk = async () => {
    if (!prompt.trim()) return;
    
    const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: prompt,
        timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);
    setError(null);
    setIsContextOpen(false); // Auto close context on send to focus on chat

    try {
      const keyToUse = apiKey; 
      if (!keyToUse) throw new Error("Please configure your Gemini API Key in settings.");
      
      const result = await askGemini(userMsg.content, codeContext, keyToUse);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: typeof result === 'string' ? result : 'No response returned.',
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setError(err.message);
      // Remove user message on error? Or keep it so they can retry?
      // Keeping it is better UX, maybe mark as failed.
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout>
       {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
             {/* Glossy background effect */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2 relative z-10">
              <Settings className="w-5 h-5 text-indigo-400" /> Settings
            </h3>
            <p className="text-sm text-slate-400 mb-6 relative z-10">
              Configure your AI assistant. API keys are stored securely in your browser's local storage and are never sent to our servers.
            </p>

            <div className="space-y-4 relative z-10">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Gemini API Key</label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    placeholder="Provide your Gemini API Key..."
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-mono text-sm"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Your key is obfuscated before storage to prevent casual inspection.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">

                <button 
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveSettings}
                  className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Configuration
                </button>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-800/50 text-xs text-center text-slate-500 relative z-10">
               Need an API key? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 hover:underline transition-colors">Get one from Google AI Studio</a>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col h-[calc(100vh-10rem)] max-w-5xl mx-auto">
        <div className="flex-none mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" /> 
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                    AI Developer Assistant
                </span>
            </h2>
            <div className="flex gap-2">
                <button 
                    onClick={handleClearChat}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                    title="Clear Chat"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
                <button 
                    onClick={openSettings}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors"
                    title="Settings"
                >
                    <Settings className="w-4 h-4" />
                </button>
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden flex flex-col relative shadow-inner">
            
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                        <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-black/20">
                            <Sparkles className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-200 mb-2">How can I help you today?</h3>
                        <p className="text-slate-400 max-w-sm mb-8">
                            I can analyze your code, explain complex concepts, find bugs, or help you refactor.
                        </p>
                        
                        {!apiKey && (
                            <button 
                                onClick={openSettings}
                                className="px-4 py-2 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-sm hover:bg-indigo-600/30 transition-all flex items-center gap-2"
                            >
                                <Settings className="w-4 h-4" /> Configure API Key to Start
                            </button>
                        )}
                    </div>
                )}

                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center shrink-0
                            ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-emerald-600'}
                        `}>
                            {msg.role === 'user' ? (
                                <div className="text-xs font-bold">YO</div> 
                            ) : (
                                <Sparkles className="w-4 h-4 text-white" />
                            )}
                        </div>
                        
                        <div className={`
                            max-w-[85%] rounded-2xl p-4 shadow-sm
                            ${msg.role === 'user' 
                                ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-100 rounded-tr-none' 
                                : 'bg-slate-800/50 border border-slate-700/50 text-slate-200 rounded-tl-none'
                            }
                        `}>
                            <div className="prose prose-invert prose-sm max-w-none">
                                <MessageContent content={msg.content} />
                            </div>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 animate-pulse">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl rounded-tl-none p-4 flex items-center gap-2 text-slate-400 text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
                        </div>
                    </div>
                )}
                
                {error && (
                    <div className="flex justify-center my-4">
                        <div className="bg-red-900/20 border border-red-900/50 px-4 py-2 rounded-xl text-red-400 text-sm flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> {error}
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-950/30 border-t border-slate-800 backdrop-blur-sm">
                
                {/* Context Toggle */}
                <div className="mb-2">
                    <button 
                        onClick={() => setIsContextOpen(!isContextOpen)}
                        className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                            isContextOpen || codeContext 
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                        }`}
                    >
                       <Code2 className="w-3.5 h-3.5" />
                       {isContextOpen ? 'Hide Context' : codeContext ? 'Context Active' : 'Add Context Code'}
                       {isContextOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                    </button>
                    
                    {isContextOpen && (
                        <div className="mt-2 animate-in slide-in-from-top-2 duration-200">
                             <ToolLayout.Panel className="min-h-[150px] shadow-lg border-indigo-500/20">
                                <textarea
                                    value={codeContext}
                                    onChange={(e) => setCodeContext(e.target.value)}
                                    placeholder="Paste relevant code snippets here for context..."
                                    className="w-full h-32 bg-transparent border-none focus:ring-0 p-2 font-mono text-sm resize-none placeholder-slate-600 text-slate-300"
                                />
                             </ToolLayout.Panel>
                        </div>
                    )}
                </div>

                <div className="relative flex items-end gap-2 bg-slate-900 border border-slate-700 rounded-xl p-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/50 transition-all shadow-lg">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                           if (e.key === 'Enter' && !e.shiftKey) {
                               e.preventDefault();
                               handleAsk();
                           }
                        }}
                        placeholder="Ask a question..."
                        className="w-full max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 p-2 text-sm resize-none placeholder-slate-500 text-slate-200"
                        style={{ height: 'auto' }}
                        rows={1}
                    />
                    <button
                        onClick={handleAsk}
                        disabled={loading || !prompt.trim() || !apiKey}
                        className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-all shadow-lg shadow-indigo-600/20 shrink-0 mb-0.5"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </div>
                <div className="text-[10px] text-slate-600 text-center mt-2">
                    Start with <span className="font-mono bg-slate-800 px-1 rounded text-slate-400">Context</span> to give the AI code awareness. Press <span className="font-mono bg-slate-800 px-1 rounded text-slate-400">Enter</span> to send.
                </div>
            </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default AIAssistant;

