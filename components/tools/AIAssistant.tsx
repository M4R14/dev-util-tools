import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Sparkles, Settings, Save, Trash2, Copy, Check, ChevronDown, ChevronUp, Code2 } from 'lucide-react';
import { askGemini } from '../../services/gemini';
import ToolLayout from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/Card';
import { cn } from '../../lib/utils';


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
             p.trim() && <p key={`${index}-${i}`} className="whitespace-pre-wrap leading-relaxed text-foreground/90">{p}</p>
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
    <Card className="rounded-lg overflow-hidden border-border bg-muted/50 my-4 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/80 border-b border-border/50">
        <span className="text-xs font-mono text-muted-foreground">{language || 'code'}</span>
        <Button 
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-primary/90 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <code>{code}</code>
      </pre>
    </Card>
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
        <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200 border-border/50">
             {/* Glossy background effect */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

             <CardHeader className="relative z-10 pb-0">
                <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" /> Settings
                </CardTitle>
                <CardDescription>
                    Configure your AI assistant. API keys are stored securely in your browser's local storage and are never sent to our servers.
                </CardDescription>
             </CardHeader>

            <CardContent className="space-y-4 relative z-10 pt-6">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Gemini API Key</label>
                <div className="relative">
                  <Input 
                    type="password" 
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    placeholder="Provide your Gemini API Key..."
                    className="font-mono text-sm"
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Your key is obfuscated before storage to prevent casual inspection.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">

                <Button 
                  variant="ghost"
                  onClick={() => setShowSettings(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveSettings}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" /> Save Configuration
                </Button>
              </div>
            </CardContent>
            
            <CardFooter className="pt-0 relative z-10 justify-center border-t border-border/50 mt-4 py-4">
                 <div className="text-xs text-muted-foreground">
                    Need an API key? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline transition-colors">Get one from Google AI Studio</a>
                 </div>
            </CardFooter>
          </Card>
        </div>
      )}

      <div className="flex flex-col h-[calc(100vh-10rem)] max-w-5xl mx-auto">
        <div className="flex-none mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> 
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                    AI Developer Assistant
                </span>
            </h2>
            <div className="flex gap-2">
                <Button 
                    variant="ghost"
                    size="icon"
                    onClick={handleClearChat}
                    className="text-muted-foreground hover:text-destructive"
                    title="Clear Chat"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
                <Button 
                    variant="ghost"
                    size="icon"
                    onClick={openSettings}
                    className="text-muted-foreground hover:text-primary"
                    title="Settings"
                >
                    <Settings className="w-4 h-4" />
                </Button>
            </div>
        </div>

        {/* Chat Area */}
        <Card className="flex-1 overflow-hidden flex flex-col relative shadow-inner bg-muted/5 border-border">
            
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                        <div className="w-20 h-20 bg-muted/50 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-black/10">
                            <Sparkles className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">How can I help you today?</h3>
                        <p className="text-muted-foreground max-w-sm mb-8">
                            I can analyze your code, explain complex concepts, find bugs, or help you refactor.
                        </p>
                        
                        {!apiKey && (
                            <Button 
                                variant="outline"
                                onClick={openSettings}
                                className="gap-2"
                            >
                                <Settings className="w-4 h-4" /> Configure API Key to Start
                            </Button>
                        )}
                    </div>
                )}

                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={cn("flex gap-4", msg.role === 'user' ? 'flex-row-reverse' : '')}
                    >
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                            msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-green-600 text-white'
                        )}>
                            {msg.role === 'user' ? (
                                <div className="text-xs font-bold">ME</div> 
                            ) : (
                                <Sparkles className="w-4 h-4 text-white" />
                            )}
                        </div>
                        
                        <div className={cn(
                            "max-w-[85%] rounded-2xl p-4 shadow-sm",
                            msg.role === 'user' 
                                ? 'bg-primary/10 border border-primary/20 text-foreground rounded-tr-none' 
                                : 'bg-muted/50 border border-border text-foreground rounded-tl-none'
                        )}>
                            <div className="prose prose-invert prose-sm max-w-none text-foreground dark:prose-invert prose-slate">
                                <MessageContent content={msg.content} />
                            </div>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center shrink-0 animate-pulse">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-muted/50 border border-border rounded-2xl rounded-tl-none p-4 flex items-center gap-2 text-muted-foreground text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
                        </div>
                    </div>
                )}
                
                {error && (
                    <div className="flex justify-center my-4">
                        <div className="bg-destructive/10 border border-destructive/20 px-4 py-2 rounded-xl text-destructive text-sm flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> {error}
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-muted/30 border-t border-border backdrop-blur-sm">
                
                {/* Context Toggle */}
                <div className="mb-2">
                    <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsContextOpen(!isContextOpen)}
                        className={cn("text-xs font-medium h-8 gap-2", 
                            isContextOpen || codeContext 
                                ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:text-primary' 
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                       <Code2 className="w-3.5 h-3.5" />
                       {isContextOpen ? 'Hide Context' : codeContext ? 'Context Active' : 'Add Context Code'}
                       {isContextOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                    </Button>
                    
                    {isContextOpen && (
                        <div className="mt-2 animate-in slide-in-from-top-2 duration-200">
                             <Card className="shadow-lg border-primary/20 bg-muted/50">
                                <Textarea
                                    value={codeContext}
                                    onChange={(e) => setCodeContext(e.target.value)}
                                    placeholder="Paste relevant code snippets here for context..."
                                    className="min-h-[150px] border-0 bg-transparent focus-visible:ring-0 font-mono text-sm resize-none"
                                />
                             </Card>
                        </div>
                    )}
                </div>

                <div className={cn(
                    "relative flex items-end gap-2 rounded-xl p-2 border border-input bg-background transition-all shadow-sm",
                    "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                )}>
                    <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                           if (e.key === 'Enter' && !e.shiftKey) {
                               e.preventDefault();
                               handleAsk();
                           }
                        }}
                        placeholder="Ask a question..."
                        className="w-full min-h-[44px] max-h-32 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-2 text-sm resize-none shadow-none"
                        style={{ height: 'auto' }}
                        rows={1}
                    />
                    <Button
                        onClick={handleAsk}
                        disabled={loading || !prompt.trim() || !apiKey}
                        size="icon"
                        className="shrink-0 mb-0.5 shadow-sm"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </Button>
                </div>
                <div className="text-[10px] text-muted-foreground text-center mt-2">
                    Start with <span className="font-mono bg-muted px-1 rounded text-foreground">Context</span> to give the AI code awareness. Press <span className="font-mono bg-muted px-1 rounded text-foreground">Enter</span> to send.
                </div>
            </div>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default AIAssistant;

