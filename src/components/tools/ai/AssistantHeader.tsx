import React from 'react';
import { Settings, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '../../ui/Button';

interface AssistantHeaderProps {
  onClearChat: () => void;
  onOpenSettings: () => void;
}

const AssistantHeader: React.FC<AssistantHeaderProps> = ({ onClearChat, onOpenSettings }) => (
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
        onClick={onClearChat}
        className="text-muted-foreground hover:text-destructive"
        title="Clear Chat"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenSettings}
        className="text-muted-foreground hover:text-primary"
        title="Settings"
      >
        <Settings className="w-4 h-4" />
      </Button>
    </div>
  </div>
);

export default AssistantHeader;
