import React from 'react';
import { Settings, Sparkles } from 'lucide-react';
import { Button } from '../../ui/Button';

interface EmptyStateProps {
  hasApiKey: boolean;
  onOpenSettings: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ hasApiKey, onOpenSettings }) => (
  <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
    <div className="w-20 h-20 bg-muted/50 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-black/10">
      <Sparkles className="w-10 h-10 text-primary" />
    </div>
    <h3 className="text-lg font-medium text-foreground mb-2">How can I help you today?</h3>
    <p className="text-muted-foreground max-w-sm mb-8">
      I can analyze your code, explain complex concepts, find bugs, or help you refactor.
    </p>

    {!hasApiKey && (
      <Button variant="outline" onClick={onOpenSettings} className="gap-2">
        <Settings className="w-4 h-4" /> Configure API Key to Start
      </Button>
    )}
  </div>
);

export default EmptyState;
