import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Message } from '../../../hooks/useAIChat';
import MessageContent from './MessageContent';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => (
  <div className={cn('flex gap-4', message.role === 'user' ? 'flex-row-reverse' : '')}>
    <div
      className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm',
        message.role === 'user'
          ? 'bg-primary text-primary-foreground'
          : 'bg-green-600 text-white',
      )}
    >
      {message.role === 'user' ? (
        <div className="text-xs font-bold">ME</div>
      ) : (
        <Sparkles className="w-4 h-4 text-white" />
      )}
    </div>

    <div
      className={cn(
        'max-w-[85%] rounded-2xl p-4 shadow-sm',
        message.role === 'user'
          ? 'bg-primary/10 border border-primary/20 text-foreground rounded-tr-none'
          : 'bg-muted/50 border border-border text-foreground rounded-tl-none',
      )}
    >
      <div className="prose prose-invert prose-sm max-w-none text-foreground dark:prose-invert prose-slate">
        <MessageContent content={message.content} />
      </div>
    </div>
  </div>
);

export default ChatMessage;
