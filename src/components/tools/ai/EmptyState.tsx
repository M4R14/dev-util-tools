import React from 'react';
import { Settings, Sparkles } from 'lucide-react';
import { Button } from '../../ui/Button';
import { cn } from '../../../lib/utils';

interface EmptyStateProps {
  hasApiKey: boolean;
  onOpenSettings: () => void;
  onUsePrompt: (value: string) => void;
}

const QUICK_PROMPTS = [
  'Review this React component and suggest clean refactors.',
  'Find possible bugs and edge cases in this TypeScript code.',
  'Explain this function in simple steps and add examples.',
];

const EmptyState: React.FC<EmptyStateProps> = ({ hasApiKey, onOpenSettings, onUsePrompt }) => (
  <div className="h-full flex flex-col items-center justify-center text-center p-8">
    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 shadow-xl shadow-black/10">
      <Sparkles className="w-8 h-8 text-primary" />
    </div>
    <h3 className="text-lg font-medium text-foreground mb-2">How can I help you today?</h3>
    <p className="text-muted-foreground max-w-md mb-6 text-sm">
      I can analyze your code, explain complex concepts, find bugs, or help you refactor.
    </p>

    <div className="w-full max-w-xl">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2.5">
        Try one of these
      </p>
      <div className="flex flex-wrap justify-center gap-2.5">
        {QUICK_PROMPTS.map((prompt) => (
          <Button
            key={prompt}
            variant="outline"
            size="sm"
            onClick={() => onUsePrompt(prompt)}
            disabled={!hasApiKey}
            className={cn(
              'max-w-full h-auto py-1.5 text-xs text-left whitespace-normal',
              !hasApiKey && 'opacity-50',
            )}
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>

    {!hasApiKey && (
      <div className="mt-6">
        <Button variant="outline" onClick={onOpenSettings} className="gap-2">
          <Settings className="w-4 h-4" /> Configure API Key to Start
        </Button>
      </div>
    )}
  </div>
);

export default EmptyState;
