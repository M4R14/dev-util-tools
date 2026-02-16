import React from 'react';
import {
  Send,
  Loader2,
  Sparkles,
  Settings,
  Trash2,
  ChevronDown,
  ChevronUp,
  Code2,
} from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';
import { useAIChat } from '../../hooks/useAIChat';
import MessageContent from './ai/MessageContent';
import SettingsModal from './ai/SettingsModal';

const AIAssistant: React.FC = () => {
  const {
    messages,
    prompt,
    setPrompt,
    codeContext,
    setCodeContext,
    isContextOpen,
    setIsContextOpen,
    loading,
    error,
    messagesEndRef,
    apiKey,
    tempKey,
    setTempKey,
    showSettings,
    openSettings,
    closeSettings,
    handleSaveSettings,
    handleClearChat,
    handleAsk,
  } = useAIChat();

  return (
    <ToolLayout>
      {showSettings && (
        <SettingsModal
          tempKey={tempKey}
          onTempKeyChange={setTempKey}
          onSave={handleSaveSettings}
          onClose={closeSettings}
        />
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
                <h3 className="text-lg font-medium text-foreground mb-2">
                  How can I help you today?
                </h3>
                <p className="text-muted-foreground max-w-sm mb-8">
                  I can analyze your code, explain complex concepts, find bugs, or help you
                  refactor.
                </p>

                {!apiKey && (
                  <Button variant="outline" onClick={openSettings} className="gap-2">
                    <Settings className="w-4 h-4" /> Configure API Key to Start
                  </Button>
                )}
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex gap-4', msg.role === 'user' ? 'flex-row-reverse' : '')}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-green-600 text-white',
                  )}
                >
                  {msg.role === 'user' ? (
                    <div className="text-xs font-bold">ME</div>
                  ) : (
                    <Sparkles className="w-4 h-4 text-white" />
                  )}
                </div>

                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl p-4 shadow-sm',
                    msg.role === 'user'
                      ? 'bg-primary/10 border border-primary/20 text-foreground rounded-tr-none'
                      : 'bg-muted/50 border border-border text-foreground rounded-tl-none',
                  )}
                >
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
                className={cn(
                  'text-xs font-medium h-8 gap-2',
                  isContextOpen || codeContext
                    ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Code2 className="w-3.5 h-3.5" />
                {isContextOpen
                  ? 'Hide Context'
                  : codeContext
                    ? 'Context Active'
                    : 'Add Context Code'}
                {isContextOpen ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronUp className="w-3 h-3" />
                )}
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

            <div
              className={cn(
                'relative flex items-end gap-2 rounded-xl p-2 border border-input bg-background transition-all shadow-sm',
                'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
              )}
            >
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
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <div className="text-[10px] text-muted-foreground text-center mt-2">
              Start with{' '}
              <span className="font-mono bg-muted px-1 rounded text-foreground">Context</span> to
              give the AI code awareness. Press{' '}
              <span className="font-mono bg-muted px-1 rounded text-foreground">Enter</span> to
              send.
            </div>
          </div>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default AIAssistant;
