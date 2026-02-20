import React from 'react';
import { AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import type { Message } from '../../../hooks/useAIChat';
import EmptyState from './EmptyState';
import ChatMessage from './ChatMessage';

interface ChatPanelProps {
  messages: Message[];
  loading: boolean;
  error: string | null;
  hasApiKey: boolean;
  onOpenSettings: () => void;
  onUsePrompt: (value: string) => void;
  messagesEndRef: React.MutableRefObject<HTMLDivElement | null>;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  loading,
  error,
  hasApiKey,
  onOpenSettings,
  onUsePrompt,
  messagesEndRef,
}) => (
  <div
    className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
    aria-live="polite"
  >
    {messages.length === 0 && (
      <EmptyState hasApiKey={hasApiKey} onOpenSettings={onOpenSettings} onUsePrompt={onUsePrompt} />
    )}

    {messages.map((message) => (
      <ChatMessage key={message.id} message={message} />
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
      <div className="flex justify-center my-4" role="alert">
        <div className="bg-destructive/10 border border-destructive/20 px-4 py-2 rounded-xl text-destructive text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      </div>
    )}

    <div ref={messagesEndRef} />
  </div>
);

export default ChatPanel;
