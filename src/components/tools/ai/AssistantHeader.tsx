import React from 'react';
import { MessageSquareText, Settings, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { cn } from '../../../lib/utils';

interface AssistantHeaderProps {
  onClearChat: () => void;
  onOpenSettings: () => void;
  hasApiKey: boolean;
  messageCount: number;
  loading: boolean;
}

const AssistantHeader: React.FC<AssistantHeaderProps> = ({
  onClearChat,
  onOpenSettings,
  hasApiKey,
  messageCount,
  loading,
}) => (
  <div className="flex-none mb-4 flex flex-wrap items-center justify-between gap-3">
    <div>
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-400">
          AI Developer Assistant
        </span>
      </h2>
      <div className="mt-1 inline-flex items-center gap-2 text-xs text-muted-foreground">
        <MessageSquareText className="w-3.5 h-3.5" aria-hidden="true" />
        <span>{messageCount} messages in this session</span>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 font-medium',
            hasApiKey
              ? 'bg-emerald-500/10 text-emerald-600'
              : 'bg-amber-500/10 text-amber-600',
          )}
        >
          {hasApiKey ? 'Connected' : 'Needs API key'}
        </span>
      </div>
    </div>

    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onClearChat}
        disabled={loading || messageCount === 0}
        className="text-muted-foreground hover:text-destructive"
        title="Clear chat"
      >
        <Trash2 className="w-4 h-4" />
        <span className="hidden sm:inline">Clear</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onOpenSettings}
        className="text-muted-foreground hover:text-primary"
        title="Settings"
      >
        <Settings className="w-4 h-4" />
        <span className="hidden sm:inline">Settings</span>
      </Button>
    </div>
  </div>
);

export default AssistantHeader;
