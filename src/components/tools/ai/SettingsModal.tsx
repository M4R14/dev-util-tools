import React from 'react';
import { Settings, Save } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '../../ui/Card';

interface SettingsModalProps {
  tempKey: string;
  onTempKeyChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  tempKey,
  onTempKeyChange,
  onSave,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200 border-border/50">
        {/* Glossy background effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        <CardHeader className="relative z-10 pb-0">
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" /> Settings
          </CardTitle>
          <CardDescription>
            Configure your AI assistant. API keys are stored securely in your browser&apos;s local
            storage and are never sent to our servers.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 relative z-10 pt-6">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Gemini API Key
            </label>
            <div className="relative">
              <Input
                type="password"
                value={tempKey}
                onChange={(e) => onTempKeyChange(e.target.value)}
                placeholder="Provide your Gemini API Key..."
                className="font-mono text-sm"
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Your key is obfuscated before storage to prevent casual inspection.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onSave} className="gap-2">
              <Save className="w-4 h-4" /> Save Configuration
            </Button>
          </div>
        </CardContent>

        <CardFooter className="pt-0 relative z-10 justify-center border-t border-border/50 mt-4 py-4">
          <div className="text-xs text-muted-foreground">
            Need an API key?{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline transition-colors"
            >
              Get one from Google AI Studio
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SettingsModal;
